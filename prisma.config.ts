import { defineConfig } from "prisma/config";

import { ensureDatabaseUrlInProcessEnv } from "./lib/database-url";

function shouldRequireDatabaseUrlForCommand() {
  const args = process.argv.slice(2);
  const command = args[0];
  const subcommand = args[1];

  if (command === "migrate" || command === "studio") {
    return true;
  }

  if (command === "db" && subcommand !== "generate") {
    return true;
  }

  return args.includes("seed");
}

if (typeof process.loadEnvFile === "function") {
  for (const envFile of [
    ".env",
    ".env.local",
    ".env.production",
    ".env.production.local",
    "prisma/.env",
  ]) {
    try {
      process.loadEnvFile(envFile);
    } catch {
      // Ignore missing env files and continue with already exported environment variables.
    }
  }
}

try {
  ensureDatabaseUrlInProcessEnv();
} catch (error) {
  if (shouldRequireDatabaseUrlForCommand()) {
    throw error;
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
});
