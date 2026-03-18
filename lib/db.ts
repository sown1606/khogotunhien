import { PrismaClient } from "@prisma/client";

import { ensureDatabaseUrlInProcessEnv } from "@/lib/database-url";

declare global {
  var prisma: PrismaClient | undefined;
}

const { databaseUrl } = ensureDatabaseUrlInProcessEnv();

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
