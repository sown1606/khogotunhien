import { Prisma, PrismaClient } from "@prisma/client";

import { ensureDatabaseUrlInProcessEnv } from "@/lib/database-url";
import { logError, logInfo, logWarn } from "@/lib/logger";

declare global {
  var prisma: PrismaClient | undefined;
  var prismaRuntime: PrismaRuntimeState | undefined;
}

type PrismaRuntimeState = {
  client: PrismaClient;
  connected: boolean;
  connectPromise: Promise<void> | null;
  replacePromise: Promise<boolean> | null;
  generation: number;
};

type PrismaQueryOptions = {
  logFailures?: boolean;
  retryOnPanic?: boolean;
};

const READ_DELEGATE_METHODS = new Set([
  "aggregate",
  "count",
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "findUnique",
  "findUniqueOrThrow",
  "groupBy",
]);

function resolveDatabaseUrlForPrisma() {
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

  return new PrismaClient({
    datasources: {
      db: {
        url: resolveDatabaseUrlForPrisma(),
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function getCompactErrorMessage(error: unknown) {
  const raw = error instanceof Error ? error.message : "Unknown error";
  const withoutDatabaseUrls = raw.replace(/mysql:\/\/[^\s'")]+/gi, "mysql://[REDACTED]");
  const limit = 800;

  return withoutDatabaseUrls.length > limit
    ? `${withoutDatabaseUrls.slice(0, limit)}...`
    : withoutDatabaseUrls;
}

export function getPrismaErrorLogMetadata(error: unknown) {
  if (error instanceof Error) {
    const extended = error as Error & {
      code?: string;
      clientVersion?: string;
    };

    return {
      errorName: error.name,
      ...(extended.code ? { errorCode: extended.code } : {}),
      ...(extended.clientVersion ? { clientVersion: extended.clientVersion } : {}),
      errorMessage: getCompactErrorMessage(error),
    };
  }

  return {
    errorName: typeof error,
    errorMessage: "Unknown error",
  };
}

export function isPrismaPanicError(error: unknown) {
  const message = getCompactErrorMessage(error).toLowerCase();
  const errorName = error instanceof Error ? error.name : "";

  if (
    error instanceof Prisma.PrismaClientRustPanicError ||
    errorName === "PrismaClientRustPanicError"
  ) {
    return true;
  }

  return (
    message.includes("panic: timer has gone away") ||
    message.includes("timer has gone away") ||
    message.includes("query engine exited with code 101") ||
    message.includes("main task panicked") ||
    message.includes("joinerror::panic")
  );
}

function getPrismaRuntime() {
  if (!globalThis.prismaRuntime) {
    const client = globalThis.prisma ?? createPrismaClient();

    globalThis.prismaRuntime = {
      client,
      connected: false,
      connectPromise: null,
      replacePromise: null,
      generation: 0,
    };
    globalThis.prisma = client;
  }

  return globalThis.prismaRuntime;
}

function getPrismaClient() {
  return getPrismaRuntime().client;
}

async function ensurePrismaConnected(queryName: string, client: PrismaClient, logFailures: boolean) {
  const runtime = getPrismaRuntime();

  if (runtime.client !== client) {
    return;
  }

  if (runtime.connected) {
    return;
  }

  if (!runtime.connectPromise) {
    runtime.connectPromise = client
      .$connect()
      .then(() => {
        if (runtime.client === client) {
          runtime.connected = true;
        }
      })
      .finally(() => {
        if (runtime.client === client) {
          runtime.connectPromise = null;
        }
      });
  }

  try {
    await runtime.connectPromise;
  } catch (error) {
    if (runtime.client === client) {
      runtime.connected = false;
    }

    if (logFailures) {
      logWarn("Prisma client connection failed.", {
        query: queryName,
        retryAttempted: false,
        clientRecreated: false,
        ...getPrismaErrorLogMetadata(error),
      });
    }

    throw error;
  }
}

async function recreatePrismaClientAfterPanic(
  queryName: string,
  failedClient: PrismaClient,
  error: unknown,
) {
  const runtime = getPrismaRuntime();

  if (runtime.client !== failedClient) {
    logInfo("Prisma client was already recreated by another request.", {
      query: queryName,
      clientRecreated: false,
      ...getPrismaErrorLogMetadata(error),
    });
    return false;
  }

  if (!runtime.replacePromise) {
    runtime.replacePromise = (async () => {
      runtime.client = createPrismaClient();
      runtime.connected = false;
      runtime.connectPromise = null;
      runtime.generation += 1;
      globalThis.prisma = runtime.client;

      try {
        await failedClient.$disconnect();
      } catch (disconnectError) {
        logWarn("Failed to disconnect panic-broken Prisma client.", {
          query: queryName,
          ...getPrismaErrorLogMetadata(disconnectError),
        });
      }

      logWarn("Prisma client recreated after runtime panic.", {
        query: queryName,
        clientRecreated: true,
        generation: runtime.generation,
        ...getPrismaErrorLogMetadata(error),
      });

      return true;
    })().finally(() => {
      runtime.replacePromise = null;
    });
  }

  return runtime.replacePromise;
}

export async function runPrismaQuery<T>(
  queryName: string,
  execute: (client: PrismaClient) => Promise<T>,
  options: PrismaQueryOptions = {},
) {
  const retryOnPanic = options.retryOnPanic ?? true;
  const logFailures = options.logFailures ?? true;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const client = getPrismaClient();

    try {
      await ensurePrismaConnected(queryName, client, logFailures);
      return await execute(client);
    } catch (error) {
      const panicDetected = isPrismaPanicError(error);
      const shouldRetry = panicDetected && retryOnPanic && attempt === 0;
      let clientRecreated = false;

      if (panicDetected) {
        clientRecreated = await recreatePrismaClientAfterPanic(queryName, client, error);
      }

      const logPayload = {
        query: queryName,
        retryAttempted: shouldRetry,
        clientRecreated,
        panicDetected,
        ...getPrismaErrorLogMetadata(error),
      };

      if (shouldRetry) {
        if (logFailures) {
          logWarn("Prisma query failed; retrying once with a fresh client.", logPayload);
        }
        continue;
      }

      if (logFailures) {
        logError("Prisma query failed.", logPayload);
      }
      throw error;
    }
  }

  throw new Error(`Prisma query failed after retry: ${queryName}`);
}

function isReadDelegateMethod(methodName: PropertyKey) {
  return typeof methodName === "string" && READ_DELEGATE_METHODS.has(methodName);
}

function createDelegateProxy(delegateName: string) {
  return new Proxy({} as Record<PropertyKey, unknown>, {
    get(_target, methodName) {
      const delegate = Reflect.get(getPrismaClient(), delegateName) as Record<PropertyKey, unknown>;
      const value = Reflect.get(delegate, methodName);

      if (typeof value !== "function") {
        return value;
      }

      return (...args: unknown[]) =>
        runPrismaQuery(
          `${delegateName}.${String(methodName)}`,
          async (client) => {
            const activeDelegate = Reflect.get(client, delegateName) as Record<PropertyKey, unknown>;
            const activeMethod = Reflect.get(activeDelegate, methodName);

            if (typeof activeMethod !== "function") {
              throw new Error(`Prisma delegate method unavailable: ${delegateName}.${String(methodName)}`);
            }

            return activeMethod.apply(activeDelegate, args) as Promise<unknown>;
          },
          { retryOnPanic: isReadDelegateMethod(methodName) },
        );
    },
  });
}

const delegateProxyCache = new Map<string, Record<PropertyKey, unknown>>();

function getDelegateProxy(delegateName: string) {
  const existing = delegateProxyCache.get(delegateName);
  if (existing) return existing;

  const created = createDelegateProxy(delegateName);
  delegateProxyCache.set(delegateName, created);
  return created;
}

function createPrismaProxy() {
  return new Proxy({} as PrismaClient, {
    get(_target, propertyName) {
      const client = getPrismaClient();
      const value = Reflect.get(client, propertyName);

      if (typeof value !== "function" && value && typeof value === "object") {
        return getDelegateProxy(String(propertyName));
      }

      if (typeof value !== "function") {
        return value;
      }

      if (propertyName === "$disconnect" || propertyName === "$connect") {
        return value.bind(client);
      }

      return (...args: unknown[]) =>
        runPrismaQuery(
          `prisma.${String(propertyName)}`,
          async (activeClient) => {
            const activeMethod = Reflect.get(activeClient, propertyName);

            if (typeof activeMethod !== "function") {
              throw new Error(`Prisma method unavailable: ${String(propertyName)}`);
            }

            return activeMethod.apply(activeClient, args) as Promise<unknown>;
          },
          { retryOnPanic: false },
        );
    },
  });
}

export const db = createPrismaProxy();

export async function checkDatabaseConnection() {
  await runPrismaQuery("health.checkDatabaseConnection", (client) => client.$queryRaw`SELECT 1`, {
    retryOnPanic: true,
  });
}
