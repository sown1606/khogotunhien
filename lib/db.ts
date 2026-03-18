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

const databaseUrl = getDatabaseUrlForRuntime();

export const db =
  global.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = db;
}

export async function checkDatabaseConnection() {
  await db.$queryRaw`SELECT 1`;
}
