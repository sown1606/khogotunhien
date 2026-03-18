type LogLevel = "INFO" | "WARN" | "ERROR";

const SENSITIVE_KEY_PATTERN = /(password|secret|token|key|database|authorization)/i;

function sanitize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sanitize(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [
        key,
        SENSITIVE_KEY_PATTERN.test(key) ? "[REDACTED]" : sanitize(nestedValue),
      ]),
    );
  }

  return value;
}

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(meta ? { meta: sanitize(meta) } : {}),
  };

  if (level === "ERROR") {
    console.error(JSON.stringify(payload));
    return;
  }

  console.log(JSON.stringify(payload));
}

export function logInfo(message: string, meta?: Record<string, unknown>) {
  log("INFO", message, meta);
}

export function logWarn(message: string, meta?: Record<string, unknown>) {
  log("WARN", message, meta);
}

export function logError(message: string, meta?: Record<string, unknown>) {
  log("ERROR", message, meta);
}
