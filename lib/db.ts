import { PrismaClient } from "@prisma/client";

import { ensureDatabaseUrlInProcessEnv } from "@/lib/database-url";
import { getOptionalEnv } from "@/lib/env";
import { logError, logWarn } from "@/lib/logger";

declare global {
  var prisma: PrismaClient | undefined;
}

function getDatabaseUrlForRuntime() {
  try {
    return ensureDatabaseUrlInProcessEnv().databaseUrl;
  } catch (error) {
    logError("Database environment is missing at startup.", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return "mysql://invalid:invalid@127.0.0.1:3306/invalid";
  }
}

function createPrismaClient() {
  if (
    !process.env.PRISMA_CLIENT_ENGINE_TYPE ||
    process.env.PRISMA_CLIENT_ENGINE_TYPE === "binary"
  ) {
    process.env.PRISMA_CLIENT_ENGINE_TYPE = "library";
  }

  const databaseUrl = getDatabaseUrlForRuntime();

  try {
    return new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  } catch (error) {
    logError("Prisma client initialization failed. Falling back to safe placeholder DSN.", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return new PrismaClient({
      datasources: {
        db: {
          url: "mysql://invalid:invalid@127.0.0.1:3306/invalid",
        },
      },
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }
}

let productionPrisma: PrismaClient | undefined;
let prismaResetPromise: Promise<void> | null = null;
let hasAppliedHostingerLocalDbFallback = false;

function getPrismaClient() {
  if (process.env.NODE_ENV !== "production") {
    if (!global.prisma) {
      global.prisma = createPrismaClient();
    }
    return global.prisma;
  }

  if (!productionPrisma) {
    productionPrisma = createPrismaClient();
  }

  return productionPrisma;
}

function getPrismaErrorMessage(error: unknown) {
  return error instanceof Error ? error.message.toLowerCase() : "";
}

function isRecoverablePrismaEngineError(error: unknown) {
  const message = getPrismaErrorMessage(error);
  const name = error instanceof Error ? error.name : "";

  return (
    name === "PrismaClientRustPanicError" ||
    message.includes("timer has gone away") ||
    message.includes("query engine exited with code") ||
    message.includes("main task panicked") ||
    message.includes("joinerror::panic") ||
    message.includes("engine is not yet connected")
  );
}

function isDatabaseConnectivityError(error: unknown) {
  const message = getPrismaErrorMessage(error);

  return (
    message.includes("p1001") ||
    message.includes("p1002") ||
    message.includes("can't reach database server") ||
    message.includes("connection refused") ||
    message.includes("connect econnrefused") ||
    message.includes("connect ehostunreach") ||
    message.includes("connect etimedout") ||
    message.includes("timed out")
  );
}

function isDatabaseAuthenticationError(error: unknown) {
  const message = getPrismaErrorMessage(error);

  return (
    message.includes("p1000") ||
    message.includes("authentication failed against database server") ||
    message.includes("provided database credentials") ||
    message.includes("are not valid")
  );
}

function shouldRetryWithHostingerLocalhost(error: unknown) {
  return isDatabaseConnectivityError(error) || isDatabaseAuthenticationError(error);
}

function isHostingerRemoteHostname(hostname: string) {
  return /(^|\.)hstgr\.io$/i.test(hostname);
}

function maybeApplyHostingerLocalDbFallback(error: unknown) {
  if (hasAppliedHostingerLocalDbFallback) {
    return false;
  }

  if (!shouldRetryWithHostingerLocalhost(error)) {
    return false;
  }

  const configuredHost = getOptionalEnv("DB_HOST");
  if (!configuredHost) {
    return false;
  }

  const normalizedHost = configuredHost.trim().toLowerCase();
  if (normalizedHost === "localhost" || normalizedHost === "127.0.0.1") {
    return false;
  }

  if (!isHostingerRemoteHostname(normalizedHost)) {
    return false;
  }

  hasAppliedHostingerLocalDbFallback = true;
  process.env.DB_HOST = "localhost";
  delete process.env.DATABASE_URL;

  logWarn("Switching DB host fallback from Hostinger remote host to localhost.", {
    previousHost: configuredHost,
  });

  return true;
}

async function disconnectSilently(client: PrismaClient | undefined) {
  if (!client) return;

  try {
    await client.$disconnect();
  } catch {
    // Ignore disconnect errors during recovery.
  }
}

async function resetPrismaClient() {
  if (!prismaResetPromise) {
    prismaResetPromise = (async () => {
      if (process.env.NODE_ENV !== "production") {
        const existing = global.prisma;
        global.prisma = undefined;
        await disconnectSilently(existing);
        return;
      }

      const existing = productionPrisma;
      productionPrisma = undefined;
      await disconnectSilently(existing);
    })().finally(() => {
      prismaResetPromise = null;
    });
  }

  await prismaResetPromise;
}

function resolvePath(path: PropertyKey[]) {
  let value: unknown = getPrismaClient();

  for (const segment of path) {
    value = Reflect.get(value as object, segment);
  }

  return value;
}

function resolveParent(path: PropertyKey[]) {
  if (path.length === 0) return getPrismaClient();
  return resolvePath(path.slice(0, -1));
}

function createPrismaProxy(path: PropertyKey[] = []): unknown {
  return new Proxy(
    {},
    {
      get(_target, property) {
        if (property === Symbol.toStringTag) return "PrismaProxy";
        const nextPath = [...path, property];
        const value = resolvePath(nextPath);

        if (typeof value === "function") {
          return async (...args: unknown[]) => {
            try {
              const fn = resolvePath(nextPath) as (...innerArgs: unknown[]) => unknown;
              const parent = resolveParent(nextPath);
              return await fn.apply(parent, args);
            } catch (error) {
              if (maybeApplyHostingerLocalDbFallback(error)) {
                await resetPrismaClient();

                const fn = resolvePath(nextPath) as (...innerArgs: unknown[]) => unknown;
                const parent = resolveParent(nextPath);
                return await fn.apply(parent, args);
              }

              if (!isRecoverablePrismaEngineError(error)) {
                throw error;
              }

              logWarn("Recovering Prisma client after engine failure.", {
                operation: nextPath.map(String).join("."),
                error: error instanceof Error ? error.message : "Unknown error",
              });

              await resetPrismaClient();

              const fn = resolvePath(nextPath) as (...innerArgs: unknown[]) => unknown;
              const parent = resolveParent(nextPath);
              return await fn.apply(parent, args);
            }
          };
        }

        if (value && typeof value === "object") {
          return createPrismaProxy(nextPath);
        }

        return value;
      },
    },
  );
}

export const db = createPrismaProxy() as PrismaClient;

export async function checkDatabaseConnection() {
  await db.$queryRaw`SELECT 1`;
}
