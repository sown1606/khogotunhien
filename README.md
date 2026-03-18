# Production Guide (Hostinger Business Node.js)

This repository is configured as a Next.js full-stack app with:

- Next.js App Router
- NextAuth credentials-based admin login
- Prisma ORM with MySQL
- Live admin editing for products, categories, homepage sections, and site settings

## 1. Hostinger deploy settings (exact)

- Framework: `Next.js`
- Node.js version: `24.x`
- Root directory: `./`
- Build command:

```bash
npm install && npx prisma generate && npx prisma migrate deploy && npm run build
```

- Start command:

```bash
npm run start
```

## 2. Required environment variables

Set these in Hostinger (do not commit real values):

```bash
DATABASE_URL="mysql://DB_USER:DB_PASSWORD@DB_HOST:DB_PORT/DB_NAME"
DB_HOST="localhost"
DB_PORT="3306"
DB_NAME="u895251657_khogotunhien"
DB_USER="u895251657_khogotunhien"
DB_PASSWORD="your-real-password"

NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-long-random-secret"
SITE_URL="https://your-domain.com"

ADMIN_EMAIL="maithihongsang79@gmail.com"
ADMIN_PASSWORD="your-strong-admin-password"

COMPANY_PHONE="0786531966"
ZALO_URL="https://zalo.me/0786531966"
```

Notes:

- Preferred production value is `DATABASE_URL`.
- If `DATABASE_URL` is not set, runtime and Prisma config can construct it from `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD`.
- Production format: `mysql://DB_USER:DB_PASSWORD@DB_HOST:DB_PORT/DB_NAME`

## 3. GitHub auto deploy flow

1. Connect Hostinger app to this repository.
2. Track the `main` branch.
3. Push commits to `main`.
4. Hostinger auto-runs build and start commands.
5. Verify website and admin after each deployment.

## 4. Prisma production migration flow

- Build/deploy uses:
  - `npx prisma generate`
  - `npx prisma migrate deploy`
- Safe production rules:
  - use committed migrations in `prisma/migrations`
  - do not use `prisma migrate dev` in production
  - do not run destructive reset/drop/truncate operations in production
  - avoid `prisma db push` on production

## 5. Admin live editing in production

Admin routes are protected and require authenticated session.

Admin can update live data for:

- products
- categories
- homepage sections
- company information
- address
- phone number
- Zalo link
- social links

Changes are saved to MySQL and reflected on live pages after save and revalidation.

## 6. Hostinger live editing workflow

1. Edit code
2. Commit
3. Push to `main`
4. Hostinger auto deploys
5. Verify website and admin

## 7. Health endpoint

- `GET /api/health` returns app readiness.
- `GET /api/health?db=true` includes database connectivity check.
- Endpoint never returns secret values.

## 8. One-time production setup

After first successful deploy, ensure admin credentials exist:

```bash
npm run admin:bootstrap
```

Use the same `ADMIN_EMAIL` and `ADMIN_PASSWORD` values configured in Hostinger.
