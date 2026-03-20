# ĐẠI THIÊN PHÚ WOOD - Hostinger Production Guide

This project is a Next.js full-stack website with:

- Prisma + MySQL
- NextAuth admin login
- Live content editing for products, categories, homepage sections, and company settings
- Local demo media in `public/demo/*` for stable production rendering (no runtime hotlinking)

## 1. Hostinger deploy settings (exact)

- Framework: `Next.js`
- Node.js version: `20.x`
- Root directory: `./`
- Build and output settings: `Default` (locked Hostinger Next.js preset)
- Start command:

```bash
npm run start
```

Hostinger preset runs `npm run build`, so the repository `build` script already includes:

```bash
prisma generate && prisma migrate deploy && npm run admin:bootstrap:optional && next build --webpack
```

## 2. Required environment variables

Set these in Hostinger Environment Variables (do not commit real secrets):

```bash
# Preferred single Prisma connection string.
# If DB_USER or DB_PASSWORD contains special chars (@ # ! : / ? &), URL-encode credentials.
# DATABASE_URL is prioritized when provided.
DATABASE_URL="mysql://DB_USER:DB_PASSWORD@DB_HOST:3306/DB_NAME"

# Optional split variables (used when DATABASE_URL is missing/invalid).
# Mode A (Hostinger Node.js Web App runtime): localhost
# Mode B (external/local machine): srv1983.hstgr.io (or your Hostinger Remote MySQL IP)
DB_HOST="srv1983.hstgr.io"
DB_PORT="3306"
DB_NAME="your_database_name"
DB_USER="your_database_user"
DB_PASSWORD="your_database_password"

NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-long-random-secret"
SITE_URL="https://your-domain.com"

ADMIN_EMAIL="admin@your-domain.com"
ADMIN_PASSWORD="your-strong-admin-password"
# Used by deploy bootstrap and login fallback to auto-create/sync admin account if missing.

COMPANY_PHONE="your-company-phone"
ZALO_URL="https://zalo.me/your-zalo-number"

# Optional storefront fallback. Keep true to show local demo catalog when DB is empty/unreachable.
DEMO_CATALOG_FALLBACK="true"

# Optional AI copy assistant in admin visual editor
OPENAI_API_KEY="your-openai-api-key"
OPENAI_MODEL="gpt-4.1-mini"
```

## 3. GitHub auto deploy workflow (exact)

1. Edit code
2. Commit
3. Push to `main`
4. Hostinger auto deploys
5. Verify website and admin

Rollback quickly if needed:

```bash
git revert --no-edit HEAD
git push origin main
```

## 4. Prisma production migration flow

- Production deploy executes:
  - `prisma generate`
  - `prisma migrate deploy`
- Use only committed migrations in `prisma/migrations`.
- Do not run destructive reset/drop/truncate flows in production.
- Do not use `prisma migrate dev` in production.

## 5. Seeding premium demo data

Seed script creates:

- 12 premium wood categories
- 36 products with local thumbnails + 4 gallery images each
- related products mapping
- homepage sections:
  - Featured Categories
  - Featured Products
  - Premium Wood Slabs
  - Kitchen & Dining
  - Decorative Wood Signs
  - Custom Wood Work
  - New Arrivals
- default site branding for ĐẠI THIÊN PHÚ WOOD

Run seed:

```bash
npm run db:seed
```

For production seeding, explicitly allow it:

```bash
ALLOW_PRODUCTION_SEED=true npm run db:seed
```

## 6. Admin live editing

After login at `/admin/login`, admin can update:

- products
- categories
- homepage sections
- company information
- address
- phone number
- Zalo link
- social links
- logo and favicon URLs
- visual editor with live preview (`/admin/visual-editor`)
- AI-assisted copy suggestion for key content fields (requires `OPENAI_API_KEY`)

Changes are saved to MySQL and revalidated on public pages.

## 7. Health endpoint

- `GET /api/health` -> app readiness
- `GET /api/health?db=true` -> includes DB connectivity check

No secrets are exposed in response payloads.

## 8. Local media paths used in production

- Brand assets: `public/brand/*`
- Hero assets: `public/demo/hero/*`
- Category assets: `public/demo/categories/*`
- Product assets: `public/demo/products/*`

The storefront references only local paths so runtime does not depend on third-party image hosts.

## 9. Localization behavior (Vietnamese default)

- Default locale: Vietnamese (`vi`)
- Route behavior:
  - Vietnamese storefront: `/`, `/products`, `/categories`, `/about`, `/contact`, `/search`
  - English storefront: `/en`, `/en/products`, `/en/categories`, `/en/about`, `/en/contact`, `/en/search`
- Language switcher is available in the header (desktop + mobile) and preserves current path/query where possible.
- Vietnamese is the primary content source. If an English field is empty, the storefront falls back to Vietnamese automatically.

### Bilingual database fields (additive)

- `Category`: `nameEn`, `shortDescriptionEn`
- `Product`: `nameEn`, `shortDescriptionEn`, `descriptionEn`, `woodTypeEn`, `materialEn`, `dimensionsEn`, `finishEn`
- `HomepageSection`: `titleEn`, `descriptionEn`
- `HomepageSectionItem`: `customTitleEn`, `customDescriptionEn`
- `SiteSetting`: `companyDescriptionEn`, `addressEn`, `seoTitleEn`, `seoDescriptionEn`, `footerContentEn`, `openingHoursEn`, `contactPrimaryLabelEn`, `contactSecondaryLabelEn`

### Admin bilingual editing

Admin forms now support Vietnamese + English editing for:

- categories
- products
- homepage sections
- company/site settings

Vietnamese fields are primary. English fields are optional and can be left empty.

## 10. Hostinger runtime safety notes

- Prisma client runs with `library` engine mode in production for better runtime stability on Hostinger Node.js environments.
- `SITE_URL` and `NEXTAUTH_URL` are normalized safely. If you set `khogotunhien.com`, the app normalizes to `https://khogotunhien.com`.
- Database config supports:
  - `DATABASE_URL`
  - or fallback `DB_HOST` + `DB_PORT` + `DB_NAME` + `DB_USER` + `DB_PASSWORD`
- When building `DATABASE_URL` from `DB_*`, credentials are URL-encoded automatically to support special characters.
- If the database is temporarily unavailable (or connected to an empty schema), public storefront queries can fall back to a local 12-category / 36-product demo catalog when `DEMO_CATALOG_FALLBACK=true`.
