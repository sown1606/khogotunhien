# Agent Run Report: Prisma DB Runtime Fix

Date: 2026-07-02

## Scope

Harden the Next.js admin/live site against Prisma Query Engine runtime panics without changing schema or production data. The work focused on shared Prisma client lifecycle, panic recovery, admin login/dashboard behavior, public fallback behavior, health checks, and Hostinger GitHub auto-deploy safety.

## Files Inspected

- `package.json`
- `next.config.ts`
- `prisma.config.ts`
- `prisma/schema.prisma`
- `.env.example`
- `instrumentation.ts`
- `scripts/start.mjs`
- `scripts/bootstrap-admin.ts`
- `prisma/seed.ts`
- `lib/db.ts`
- `lib/database-url.ts`
- `lib/queries.ts`
- `lib/auth.ts`
- `lib/admin-auth.ts`
- `lib/server-errors.ts`
- `lib/logger.ts`
- `app/api/health/route.ts`
- `app/admin/login/page.tsx`
- `components/admin/login-form.tsx`
- `app/admin/(dashboard)/layout.tsx`
- `app/admin/(dashboard)/page.tsx`
- `app/admin/(dashboard)/products/page.tsx`
- `app/admin/(dashboard)/categories/page.tsx`
- `app/admin/(dashboard)/insights/page.tsx`
- `app/api/admin/auth/reset-password/route.ts`
- `app/api/public/lead/route.ts`
- `app/api/public/visit/route.ts`
- `app/api/admin/products/[id]/route.ts`
- `app/api/admin/categories/[id]/route.ts`
- `app/api/admin/products/bulk/route.ts`

## Files Changed

- `lib/db.ts`
- `lib/queries.ts`
- `lib/auth.ts`
- `lib/admin-auth.ts`
- `lib/server-errors.ts`
- `app/api/health/route.ts`
- `app/admin/(dashboard)/page.tsx`
- `app/api/admin/auth/reset-password/route.ts`
- `app/api/public/lead/route.ts`
- `app/api/public/visit/route.ts`
- `package.json`
- `prisma.config.ts`
- `docs/AGENT_RUN_REPORT_2026-07-02_prisma-db-runtime-fix.md`

## Root Cause

The app had one runtime Prisma creation point in `lib/db.ts`, plus script-only clients in `prisma/seed.ts` and `scripts/bootstrap-admin.ts`. Runtime code imported the shared `db`, but once Prisma's library engine panicked, the module-level client could remain broken for later requests.

The admin dashboard also launched five `.count()` calls in `Promise.all()` during first render. Health checks, auth, dashboard, and public fallback queries could all hit Prisma while the engine was still starting or after it had panicked.

No schema mismatch was found in the code changes. `prisma/schema.prisma` already included `engineType = "library"` and binary targets for `native`, `debian-openssl-1.1.x`, and `debian-openssl-3.0.x`, which matches the logged Hostinger Debian/OpenSSL environment.

## Fix Summary

- Reworked `lib/db.ts` into a global Prisma runtime state with one active client per Node process.
- Added a shared `$connect()` gate so parallel requests wait for the same engine startup instead of racing separate startup paths.
- Added panic detection for `PrismaClientRustPanicError`, `PANIC: timer has gone away`, engine exit 101, main task panic, and related panic text.
- Added panic recovery that disconnects the broken client, creates a fresh Prisma client, and exposes it through the existing `db` export.
- Wrapped Prisma delegate methods so existing `db.product.count()`, `db.adminUser.findUnique()`, etc. use the active client and recovery path.
- Retried read queries once after a panic. Write queries recreate the client but are not automatically retried to avoid duplicate writes.
- Changed public fallback queries to skip Prisma immediately when DB config is missing.
- Changed public fallback wrapper to avoid retrying entire multi-step operations.
- Changed admin dashboard stats from parallel counts to sequential guarded reads with graceful degraded UI.
- Changed health checks to use the same reconnecting DB helper and redact MySQL URLs from returned/debug error text.
- Changed admin auth/reset/lead/visit logging to structured safe metadata: query name, error name/code/version, retry/recreate state where applicable.
- Changed `npm run build` so normal Hostinger auto-deploy build no longer runs `prisma migrate deploy` or admin bootstrap. Added `build:with-db` for explicit DB maintenance builds.
- Changed `prisma.config.ts` so `prisma generate` can run without local DB env, while DB commands still require DB config.

## Commands Run And Results

- `pwd && rg --files ...` - inspected repository layout.
- `git status --short --branch` - current branch was `main...origin/main`; `source_code.zip` was already untracked and left untouched.
- `rg -n "new PrismaClient|..."` - found runtime client in `lib/db.ts`; script-only clients in `prisma/seed.ts` and `scripts/bootstrap-admin.ts`.
- `find . -maxdepth 2 -name '.env*' -type f -print` - only `.env.example` exists locally; no real secrets printed.
- `npx prisma generate` - passed.
- `npm run lint` - initially failed on async local reassignment in dashboard; fixed; rerun passed.
- `npm run build` - passed after build script was changed to `prisma generate && next build --webpack`.
- `npm run build` rerun after public fallback config skip - passed cleanly with no DB initialization fallback noise during static prerender.

No `npm install` was run because dependencies did not change.

No `npm run typecheck` was run because no `typecheck` script exists. TypeScript validation ran as part of `npm run build`.

## DB Safety Notes

- No production data was read directly from this machine.
- No production data was written, overwritten, dropped, truncated, recreated, reset, or reseeded.
- No `prisma migrate reset` was run.
- No `prisma db push --force-reset` was run.
- No seed command was run.
- No destructive SQL command was run.
- No production migration command was run.
- Runtime write calls are not retried automatically after panic to avoid duplicate writes.
- Admin authentication still requires DB access. Public pages can use fallback data when DB is missing or unavailable.

## Deploy Notes

- Production deploy is expected to happen through GitHub auto deploy after push.
- SSH denied is likely a hosting access/key/user/IP/plan issue and separate from the Prisma DB runtime panic.
- The app fix does not depend on SSH access.
- Hostinger runtime must still provide valid DB settings: either `DATABASE_URL`, or `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD`.
- `DATABASE_URL` remains prioritized when present.
- Normal `npm run build` no longer applies migrations or bootstraps the admin user. Use `npm run db:migrate:deploy` or `npm run build:with-db` only when intentionally performing DB maintenance with verified environment variables.

## QA Checklist

- Confirm GitHub auto deploy completes on Hostinger.
- Confirm `/api/health` returns app status.
- Confirm `/api/health?db=true` returns database `ok` when Hostinger DB env is correct.
- Confirm admin login works with an existing active `AdminUser`.
- Confirm admin login shows the DB unavailable message when DB env is missing or DB is unreachable.
- Confirm `/admin` dashboard renders counts and recent products when DB is reachable.
- Confirm `/admin` dashboard shows degraded `N/A` counts instead of crashing when DB is unavailable.
- Confirm public home/category/product/search pages render fallback content instead of crashing during DB outage.
- Confirm runtime logs do not print `DATABASE_URL`, DB password, or full environment values.
- Confirm products, categories, homepage sections, site settings, and admin users remain unchanged.
