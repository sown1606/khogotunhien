import { NextResponse } from "next/server";

import { getDatabaseConnectionDebugInfo, resolveDatabaseUrlFromEnvironment } from "@/lib/database-url";
import { checkDatabaseConnection } from "@/lib/db";
import { getOptionalEnv } from "@/lib/env";
import { logError, logInfo } from "@/lib/logger";

function shouldCheckDatabase(request: Request) {
  const dbParam = new URL(request.url).searchParams.get("db");
  return dbParam === "1" || dbParam === "true";
}

function getEnvironmentReadiness() {
  const dbDebug = getDatabaseConnectionDebugInfo();
  let databaseConfig = "missing";
  try {
    resolveDatabaseUrlFromEnvironment();
    databaseConfig = "ok";
  } catch {
    databaseConfig = "missing";
  }

  const authConfig =
    getOptionalEnv("NEXTAUTH_URL") && getOptionalEnv("NEXTAUTH_SECRET") ? "ok" : "missing";
  const demoCatalogFallback = process.env.DEMO_CATALOG_FALLBACK === "false" ? "off" : "on";

  return {
    databaseConfig,
    databaseSource: dbDebug.source,
    databaseHost: dbDebug.host,
    databasePort: dbDebug.port,
    databaseName: dbDebug.database,
    authConfig,
    demoCatalogFallback,
  };
}

export async function GET(request: Request) {
  const startedAt = Date.now();
  const checkDatabase = shouldCheckDatabase(request);
  const readiness = getEnvironmentReadiness();
  const checks: Record<string, string> = {
    app: "ok",
    database: checkDatabase ? "unknown" : "skipped",
  };

  try {
    if (checkDatabase) {
      await checkDatabaseConnection();
      checks.database = "ok";
    }

    const response = {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || "development",
      readiness,
      checks,
      durationMs: Date.now() - startedAt,
    };

    logInfo("Health check succeeded.", {
      durationMs: response.durationMs,
      dbCheckRequested: checkDatabase,
      databaseHost: readiness.databaseHost,
      databaseSource: readiness.databaseSource,
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    checks.database = "error";

    logError("Health check failed.", {
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : "Unknown error",
      dbCheckRequested: checkDatabase,
      databaseHost: readiness.databaseHost,
      databaseSource: readiness.databaseSource,
    });

    return NextResponse.json(
      {
        status: "degraded",
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        environment: process.env.NODE_ENV || "development",
        readiness,
        checks,
        durationMs: Date.now() - startedAt,
      },
      { status: 200 },
    );
  }
}
