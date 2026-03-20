import { PrismaClient } from "@prisma/client";

import { ensureDatabaseUrlInProcessEnv } from "@/lib/database-url";
import { logError } from "@/lib/logger";

declare global {
  var prisma: PrismaClient | undefined;
}

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

const prismaClient = global.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prismaClient;
}

export const db = prismaClient;

export async function checkDatabaseConnection() {
  await db.$queryRaw`SELECT 1`;
}
