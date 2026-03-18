import { defineConfig } from "prisma/config";

import { ensureDatabaseUrlInProcessEnv } from "./lib/database-url";

for (const envFile of [".env", ".env.local", ".env.production", ".env.production.local", "prisma/.env"]) {
  try {
    process.loadEnvFile(envFile);
  } catch {
    // Ignore missing env files and continue with already exported environment variables.
  }
}

ensureDatabaseUrlInProcessEnv();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
});
