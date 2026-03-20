import { NextResponse } from "next/server";

import { getDatabaseConnectionDebugInfo, resolveDatabaseUrlFromEnvironment } from "@/lib/database-url";
import { checkDatabaseConnection } from "@/lib/db";
import { getOptionalEnv } from "@/lib/env";
import { logError, logInfo } from "@/lib/logger";

function getSafeErrorMessage(error: unknown) {
  const raw = error instanceof Error ? error.message : "Unknown error";
  return raw.length > 280 ? `${raw.slice(0, 280)}…` : raw;
}

function shouldCheckDatabase(request: Request) {
  const dbParam = new URL(request.url).searchParams.get("db");
  return dbParam === "1" || dbParam === "true";
}

function shouldIncludeDebugDetails(request: Request) {
  if (process.env.HEALTH_DEBUG_ALWAYS === "true") {
    return true;
  }

  const debugParam = new URL(request.url).searchParams.get("debug");
  return debugParam === "1" || debugParam === "true";
}

function truncate(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength)}…` : value;
}

function getErrorDebugPayload(error: unknown) {
  if (error instanceof Error) {
    const extended = error as Error & {
      code?: string;
      clientVersion?: string;
      meta?: unknown;
      cause?: unknown;
    };

    const debugPayload: Record<string, unknown> = {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack ? truncate(error.stack, 8000) : null,
    };

    if (extended.code) debugPayload.errorCode = extended.code;
    if (extended.clientVersion) debugPayload.clientVersion = extended.clientVersion;
    if (extended.meta) debugPayload.errorMeta = extended.meta;
    if (extended.cause instanceof Error) {
      debugPayload.errorCause = {
        name: extended.cause.name,
        message: extended.cause.message,
        stack: extended.cause.stack ? truncate(extended.cause.stack, 4000) : null,
      };
    }

    return debugPayload;
  }

  if (typeof error === "object" && error !== null) {
    try {
      return {
        errorRaw: truncate(JSON.stringify(error), 8000),
      };
    } catch {
      return {
        errorRaw: "Unserializable object error",
      };
    }
  }

  return {
    errorRaw: String(error),
  };
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
  const includeDebugDetails = shouldIncludeDebugDetails(request);
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
    const safeErrorMessage = getSafeErrorMessage(error);

    logError("Health check failed.", {
      durationMs: Date.now() - startedAt,
      error: safeErrorMessage,
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
        ...(checkDatabase ? { databaseError: safeErrorMessage } : {}),
        ...(includeDebugDetails ? getErrorDebugPayload(error) : {}),
        durationMs: Date.now() - startedAt,
      },
      { status: 200 },
    );
  }
}
