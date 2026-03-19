import { PrismaClient } from "@prisma/client";

import { ensureDatabaseUrlInProcessEnv } from "@/lib/database-url";
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
  if (!process.env.PRISMA_CLIENT_ENGINE_TYPE) {
    process.env.PRISMA_CLIENT_ENGINE_TYPE = "binary";
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
