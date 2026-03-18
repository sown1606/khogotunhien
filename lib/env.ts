function readEnvValue(name: string) {
  const value = process.env[name];
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function getOptionalEnv(name: string) {
  return readEnvValue(name);
}

const DEFAULT_SITE_URL = "http://localhost:3000";

function normalizeSiteUrl(rawValue?: string) {
  if (!rawValue) return undefined;

  const withProtocol = /^https?:\/\//i.test(rawValue)
    ? rawValue
    : `https://${rawValue}`;

  try {
    return new URL(withProtocol).origin;
  } catch {
    return undefined;
  }
}

export function getSiteUrl() {
  return (
    normalizeSiteUrl(readEnvValue("SITE_URL")) ||
    normalizeSiteUrl(readEnvValue("NEXTAUTH_URL")) ||
    DEFAULT_SITE_URL
  );
}

export function getSiteMetadataBase() {
  return new URL(getSiteUrl());
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
