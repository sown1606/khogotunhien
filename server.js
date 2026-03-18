/* eslint-disable @typescript-eslint/no-require-imports */
const http = require("node:http");

const next = require("next");

const isProduction = process.env.NODE_ENV === "production";
const host = "0.0.0.0";
const rawPort = process.env.PORT;
const port = Number(rawPort || "3000");

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  // Fail fast with a clear message when platform PORT is invalid.
  console.error(`[startup] Invalid PORT value: "${rawPort}"`);
  process.exit(1);
}

const app = next({ dev: !isProduction, hostname: host, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = http.createServer((req, res) => handle(req, res));
    server.listen(port, host, () => {
      console.log(`[startup] Next.js server is listening on ${host}:${port}`);
    });
  })
  .catch((error) => {
    console.error("[startup] Failed to start Next.js server.", error);
    process.exit(1);
  });
