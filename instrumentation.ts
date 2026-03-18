import { logInfo } from "@/lib/logger";

export async function register() {
  logInfo("Application runtime started.", {
    runtime: process.env.NEXT_RUNTIME || "nodejs",
    environment: process.env.NODE_ENV || "development",
  });
}
