# Agent Run Report: Product Price Admin Edit

Date: 2026-07-02

## Scope

Verify and complete admin editing for product pricing and merchandising fields used by public product cards and detail pages on khogotunhien.com / ĐẠI THIÊN PHÚ WOOD.

## Files Inspected

- `prisma/schema.prisma`
- `prisma/migrations/*/migration.sql`
- `components/admin/product-form.tsx`
- `components/admin/products-table.tsx`
- `app/admin/(dashboard)/products/page.tsx`
- `app/admin/(dashboard)/products/new/page.tsx`
- `app/admin/(dashboard)/products/[id]/edit/page.tsx`
- `lib/validators/product.ts`
- `lib/actions/product-actions.ts`
- `app/api/admin/products/[id]/route.ts`
- `app/api/admin/products/bulk/route.ts`
- `components/public/product-card.tsx`
- `components/public/product-gallery.tsx`
- `components/public/product-strip.tsx`
- `app/(public)/categories/[slug]/page.tsx`
- `app/en/categories/[slug]/page.tsx`
- `app/(public)/products/[slug]/page.tsx`
- `app/en/products/[slug]/page.tsx`
- `app/(public)/products/page.tsx`
- `app/en/products/page.tsx`
- `app/(public)/search/page.tsx`
- `app/en/search/page.tsx`
- `lib/queries.ts`
- `lib/demo-catalog.ts`
- `lib/utils.ts`

## Files Changed

- `prisma/schema.prisma`
- `prisma/migrations/20260702090000_add_product_pricing_fields/migration.sql`
- `lib/validators/product.ts`
- `lib/actions/product-actions.ts`
- `components/admin/product-form.tsx`
- `components/admin/products-table.tsx`
- `app/admin/(dashboard)/products/[id]/edit/page.tsx`
- `components/public/product-card.tsx`
- `components/public/product-gallery.tsx`
- `app/(public)/products/[slug]/page.tsx`
- `app/en/products/[slug]/page.tsx`
- `app/api/admin/products/[id]/route.ts`
- `app/api/admin/products/bulk/route.ts`
- `docs/AGENT_RUN_REPORT_2026-07-02_product-price-admin-edit.md`

## Whether Price Editing Already Existed

No. The `Product` model only had product identity/content/spec fields such as `name`, `slug`, `thumbnailUrl`, `woodType`, `material`, `dimensions`, `finish`, `featured`, and `active`.

The admin product form did not include current price, compare price, discount, shipping label, badge label, tags, rating, or review count.

## What Was Missing

- DB fields for price and public merchandising data.
- Admin create/edit inputs for those fields.
- Validation for non-negative prices and bounded rating/review/discount values.
- Save handling in create/update server actions.
- Public card mapping from real DB fields.
- Product detail price/tag display.
- Safe fallback for missing or broken product images.
- Revalidation of category/product/listing pages after product changes.

## Root Cause

Public product cards were generating fake listing metadata from a slug hash:

- current price
- compare price
- discount percent
- shipping text
- rating
- review count

Those values were not stored in the database and therefore could not be edited in admin. Existing tags/chips came from category, wood type, and material fields only.

## DB / Schema Changes

Additive nullable migration only:

- `Product.price` `INTEGER NULL`
- `Product.comparePrice` `INTEGER NULL`
- `Product.discountPercent` `INTEGER NULL`
- `Product.shippingLabel` `VARCHAR(191) NULL`
- `Product.badgeLabel` `VARCHAR(80) NULL`
- `Product.tags` `JSON NULL`
- `Product.rating` `DOUBLE NULL`
- `Product.reviewCount` `INTEGER NULL`

No existing column was modified or deleted. No table was dropped, truncated, recreated, or reseeded.

## Implementation Notes

- Admin accepts plain VND numbers, for example `2630000`.
- Public display uses Vietnamese currency format, for example `2.630.000đ`.
- Negative prices are rejected by validation.
- Empty optional fields save as database null.
- Tags are entered as comma-separated text and stored as JSON array.
- Compare price only renders when `comparePrice > price`.
- Discount is auto-calculated from compare/current price unless an explicit discount percent is provided.
- Missing current price renders `Liên hệ báo giá` / `Contact for price`.
- Missing compare price hides old price and discount.
- Product cards no longer use slug-hash demo price, discount, rating, review, or shipping text.
- Broken or missing product card/gallery images fall back to `/brand/icon.svg`.
- Product create/update/delete/toggle/bulk actions revalidate public product/category/listing pages.

## Data Safety Notes

- No production data was read directly from this machine.
- No production data was written, overwritten, dropped, truncated, recreated, reset, or reseeded.
- No `prisma migrate reset` was run.
- No `prisma db push --force-reset` was run.
- No seed command was run.
- No destructive SQL command was run.
- `npx prisma generate` was run; it only regenerates Prisma client code.
- The migration is additive and nullable, preserving all existing products, categories, images, homepage sections, and admin users.

## Commands Run And Results

- `npx prisma generate` - passed.
- `npm run lint` - passed.
- `npm run build` - passed.
- `npm run typecheck` - not run because `package.json` has no `typecheck` script. TypeScript validation ran during `npm run build`.

## QA Checklist

- Admin can open product list.
- Admin product list shows price column.
- Admin can open product create/edit form.
- Admin can edit current price.
- Admin can edit compare/original price.
- Admin can edit optional manual discount percent.
- Admin can edit shipping label.
- Admin can edit tags/chips.
- Admin can edit badge label.
- Admin can edit rating and review count.
- Admin can edit existing image URL/upload fields.
- Existing active/featured status editing remains supported.
- Product card reads real DB values.
- Product detail page reads real DB values.
- Empty compare price hides old price and discount.
- Invalid negative price is rejected.
- Missing or broken product image shows placeholder.
- Existing products still render.
- No Prisma destructive command was run.

## Deploy Notes

- Commit and push to the GitHub auto-deploy branch will deploy code.
- Because this includes a Prisma migration, Hostinger must apply `prisma migrate deploy` in the deployment workflow or owner must run it safely in the Hostinger environment with correct DB variables.
- Do not run reset, force-reset, seed, truncate, drop, or recreate commands.
- SSH denial is separate from this app code change. If SSH remains denied, use Hostinger/GitHub deployment settings or panel-supported build hooks to run the safe migration deploy.
- Required runtime DB environment remains either `DATABASE_URL`, or `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD`.
