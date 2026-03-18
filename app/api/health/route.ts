import { NextResponse } from "next/server";

import { checkDatabaseConnection } from "@/lib/db";
import { logError, logInfo } from "@/lib/logger";

function shouldCheckDatabase(request: Request) {
  const dbParam = new URL(request.url).searchParams.get("db");
  return dbParam === "1" || dbParam === "true";
}

export async function GET(request: Request) {
  const startedAt = Date.now();
  const checkDatabase = shouldCheckDatabase(request);
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
      checks,
      durationMs: Date.now() - startedAt,
    };

    logInfo("Health check succeeded.", {
      durationMs: response.durationMs,
      dbCheckRequested: checkDatabase,
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    checks.database = "error";

    logError("Health check failed.", {
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : "Unknown error",
      dbCheckRequested: checkDatabase,
    });

    return NextResponse.json(
      {
        status: "degraded",
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        environment: process.env.NODE_ENV || "development",
        checks,
        durationMs: Date.now() - startedAt,
      },
      { status: 503 },
    );
  }
}
