#!/usr/bin/env node

import { spawn } from "node:child_process";
import { createRequire } from "node:module";

function resolvePort() {
  const rawPort = process.env.PORT;
  if (!rawPort) return "3000";

  const parsed = Number(rawPort);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    return "3000";
  }

  return String(parsed);
}

const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next");
const port = resolvePort();

const child = spawn(
  process.execPath,
  [nextBin, "start", "-H", "0.0.0.0", "-p", port],
  {
    env: process.env,
    stdio: "inherit",
  },
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
