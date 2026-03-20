import { createHash } from "node:crypto";

import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { getOptionalEnv } from "@/lib/env";
import { logWarn } from "@/lib/logger";

type AdminRecord = {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
};

type ConfiguredAdminCredentials = {
  email: string;
  password: string;
  fingerprint: string;
};

const DEFAULT_ADMIN_NAME = "ĐẠI THIÊN PHÚ WOOD Admin";
const ADMIN_SYNC_LOG_THROTTLE_MS = 60 * 1000;

let syncedAdminFingerprint: string | null = null;
let nextAdminSyncFailureLogTimestamp = 0;

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function getAdminSelection() {
  return {
    id: true,
    email: true,
    name: true,
    role: true,
    active: true,
  } as const;
}

function mapAdminRecord(record: AdminRecord) {
  return {
    id: record.id,
    email: record.email,
    name: record.name,
    role: record.role,
    active: record.active,
  };
}

function getConfiguredAdminCredentials(): ConfiguredAdminCredentials | null {
  const rawEmail = getOptionalEnv("ADMIN_EMAIL");
  const rawPassword = getOptionalEnv("ADMIN_PASSWORD");

  if (!rawEmail || !rawPassword) {
    return null;
  }

  const email = normalizeEmail(rawEmail);
  const password = rawPassword.trim();

  if (!email || !password) {
    return null;
  }

  const fingerprint = createHash("sha256")
    .update(`${email}\u0000${password}`)
    .digest("hex");

  return {
    email,
    password,
    fingerprint,
  };
}

function shouldLogAdminSyncFailure() {
  const now = Date.now();
  if (now < nextAdminSyncFailureLogTimestamp) {
    return false;
  }

  nextAdminSyncFailureLogTimestamp = now + ADMIN_SYNC_LOG_THROTTLE_MS;
  return true;
}

async function upsertConfiguredAdmin(credentials: ConfiguredAdminCredentials) {
  const passwordHash = await bcrypt.hash(credentials.password, 10);

  return db.adminUser.upsert({
    where: {
      email: credentials.email,
    },
    update: {
      name: DEFAULT_ADMIN_NAME,
      passwordHash,
      active: true,
      role: "ADMIN",
    },
    create: {
      name: DEFAULT_ADMIN_NAME,
      email: credentials.email,
      passwordHash,
      active: true,
      role: "ADMIN",
    },
    select: getAdminSelection(),
  });
}

export function isConfiguredAdminCredentials(email: string, password: string) {
  const configured = getConfiguredAdminCredentials();
  if (!configured) return false;

  return normalizeEmail(email) === configured.email && password === configured.password;
}

export async function ensureConfiguredAdminAccount(forceSync = false) {
  const configured = getConfiguredAdminCredentials();

  if (!configured) {
    return null;
  }

  try {
    if (!forceSync && syncedAdminFingerprint === configured.fingerprint) {
      const existing = await db.adminUser.findUnique({
        where: { email: configured.email },
        select: getAdminSelection(),
      });

      if (existing) {
        return mapAdminRecord(existing);
      }
    }

    const synced = await upsertConfiguredAdmin(configured);
    syncedAdminFingerprint = configured.fingerprint;
    return mapAdminRecord(synced);
  } catch (error) {
    if (shouldLogAdminSyncFailure()) {
      logWarn("Could not sync configured ADMIN_EMAIL/ADMIN_PASSWORD to database.", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    return null;
  }
}
