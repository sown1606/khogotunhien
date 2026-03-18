function readEnvValue(name: string) {
  const value = process.env[name];
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function getOptionalEnv(name: string) {
  return readEnvValue(name);
}

export function getSiteUrl() {
  return readEnvValue("SITE_URL") || readEnvValue("NEXTAUTH_URL") || "http://localhost:3000";
}

export function validateAuthEnvironment() {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const missing: string[] = [];

  if (!readEnvValue("NEXTAUTH_SECRET")) missing.push("NEXTAUTH_SECRET");
  if (!readEnvValue("NEXTAUTH_URL")) missing.push("NEXTAUTH_URL");

  if (missing.length > 0) {
    throw new Error(
      `Missing required authentication variables in production: ${missing.join(", ")}.`,
    );
  }
}
