import { PrismaClient } from "@prisma/client";

import { ensureDatabaseUrlInProcessEnv } from "@/lib/database-url";
import { logError } from "@/lib/logger";

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

export const db = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    const prisma = getPrismaClient();
    const value = Reflect.get(prisma, property, receiver);

    return typeof value === "function" ? value.bind(prisma) : value;
  },
});

export async function checkDatabaseConnection() {
  await getPrismaClient().$queryRaw`SELECT 1`;
}
