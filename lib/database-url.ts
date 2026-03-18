const DATABASE_ENV_KEYS = ["DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD"] as const;

type DatabaseUrlSource = "DATABASE_URL" | "DB_PARTS";

export type DatabaseUrlResolution = {
  databaseUrl: string;
  source: DatabaseUrlSource;
};

function readEnvValue(name: string) {
  const value = process.env[name];
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function hasAnyDatabaseParts() {
  return DATABASE_ENV_KEYS.some((key) => readEnvValue(key));
}

function parseDatabasePort(rawPort: string | undefined) {
  if (!rawPort) return 3306;

  const parsed = Number(rawPort);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new Error("DB_PORT must be a valid TCP port number between 1 and 65535.");
  }

  return parsed;
}

function resolveDatabaseUrlFromParts() {
  const host = readEnvValue("DB_HOST");
  const database = readEnvValue("DB_NAME");
  const user = readEnvValue("DB_USER");
  const password = readEnvValue("DB_PASSWORD");
  const rawPort = readEnvValue("DB_PORT");

  const missing: string[] = [];

  if (!host) missing.push("DB_HOST");
  if (!database) missing.push("DB_NAME");
  if (!user) missing.push("DB_USER");
  if (!password) missing.push("DB_PASSWORD");

  if (missing.length > 0) {
    throw new Error(
      `Missing required database variables: ${missing.join(", ")}. Provide DATABASE_URL or all DB_* variables.`,
    );
  }

  const port = parseDatabasePort(rawPort);
  const safeHost = host as string;
  const safeDatabase = database as string;
  const safeUser = user as string;
  const safePassword = password as string;

  return `mysql://${encodeURIComponent(safeUser)}:${encodeURIComponent(safePassword)}@${safeHost}:${port}/${encodeURIComponent(safeDatabase)}`;
}

export function resolveDatabaseUrlFromEnvironment(): DatabaseUrlResolution {
  const existingDatabaseUrl = readEnvValue("DATABASE_URL");
  if (existingDatabaseUrl) {
    return {
      databaseUrl: existingDatabaseUrl,
      source: "DATABASE_URL",
    };
  }

  if (hasAnyDatabaseParts()) {
    return {
      databaseUrl: resolveDatabaseUrlFromParts(),
      source: "DB_PARTS",
    };
  }

  throw new Error(
    "Database configuration is missing. Set DATABASE_URL or DB_HOST, DB_PORT, DB_NAME, DB_USER, and DB_PASSWORD.",
  );
}

export function ensureDatabaseUrlInProcessEnv(): DatabaseUrlResolution {
  const resolved = resolveDatabaseUrlFromEnvironment();

  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = resolved.databaseUrl;
  }

  return resolved;
}
