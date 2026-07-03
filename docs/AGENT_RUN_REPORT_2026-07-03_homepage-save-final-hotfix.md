# Agent Run Report: Homepage Save Final Hotfix

Date: 2026-07-03
Project: khogotunhien.com / DAI THIEN PHU WOOD

## Root Cause

The homepage admin edit form was a client component using uncontrolled `defaultValue` fields and local React state for section items. Navigating between `/admin/homepage` and `/admin/homepage?edit=...` could reuse the same client component instance, so the form and item payload could stay stale for the selected section.

The update action also depended on implicit checkbox form behavior and did not preflight duplicate section slugs excluding the current section. A same-section save was safe, but a changed slug collision surfaced only as a generic Prisma error. Item JSON parse failures also fell back to an empty item list, which could cause destructive item replacement if malformed payloads reached the action.

## Files Inspected

- `app/admin/(dashboard)/homepage/page.tsx`
- `components/admin/homepage-section-form.tsx`
- `lib/actions/homepage-actions.ts`
- `lib/validators/homepage.ts`
- `components/ui/checkbox.tsx`
- `lib/utils.ts`
- `lib/db.ts`
- `scripts/start.mjs`
- `prisma/schema.prisma`
- `prisma/migrations/20260702090000_add_product_pricing_fields/migration.sql`
- `components/public/homepage-dynamic-sections.tsx`
- `lib/queries.ts`
- `lib/actions/product-actions.ts`
- `lib/validators/product.ts`
- `components/admin/product-form.tsx`
- `app/admin/(dashboard)/products/[id]/edit/page.tsx`
- `components/public/product-card.tsx`
- `components/public/category-card.tsx`
- `components/public/product-gallery.tsx`
- `app/(public)/products/[slug]/page.tsx`
- `app/en/products/[slug]/page.tsx`
- `next.config.ts`
- `package.json`

## Files Changed

- `app/admin/(dashboard)/homepage/page.tsx`
- `components/admin/homepage-section-form.tsx`
- `lib/actions/homepage-actions.ts`
- `components/public/safe-image.tsx`
- `components/public/category-card.tsx`
- `components/public/homepage-dynamic-sections.tsx`
- `lib/product-tags.ts`
- `components/public/product-card.tsx`
- `app/admin/(dashboard)/products/[id]/edit/page.tsx`
- `app/(public)/products/[slug]/page.tsx`
- `app/en/products/[slug]/page.tsx`

## Changes Made

- Forced `HomepageSectionForm` to remount per edited section with a stable `key`.
- Replaced implicit Radix checkbox form submission for section `visible` with a controlled boolean state and one hidden input value.
- Kept item active states in the serialized `items` payload and preserved existing items unless validation succeeds.
- Added explicit item JSON parse validation so malformed item payloads return field errors instead of becoming `[]`.
- Added section slug duplicate validation:
  - create rejects any existing slug.
  - update allows the same section slug.
  - update rejects another section with the same slug.
- Added visible inline form errors when save fails.
- Updated Hide/Show/Delete server form handlers to redirect with success/error messages after calling actions.
- Centralized homepage revalidation for `/`, `/en`, `/admin/homepage`, and affected product/category detail pages when section items change.
- Added `SafeImage` client fallback to switch broken category/custom homepage images to `/brand/icon.svg`.
- Added `normalizeProductTags` to safely read tags from Prisma JSON arrays, JSON strings, or comma-separated LONGTEXT/manual DB values.

## DB / Schema Status

- No schema file was changed.
- No migration was created.
- Confirmed product pricing fields exist in `prisma/schema.prisma`:
  - `price`
  - `comparePrice`
  - `discountPercent`
  - `shippingLabel`
  - `badgeLabel`
  - `tags`
  - `rating`
  - `reviewCount`
- Confirmed there is exactly one product pricing migration:
  - `prisma/migrations/20260702090000_add_product_pricing_fields/migration.sql`

## Destructive DB Commands

No destructive DB command was run.

Commands explicitly not run:

- `prisma migrate reset`
- `prisma db push --force-reset`
- drop/truncate/delete/reseed production tables

## Startup Migration Decision

`scripts/start.mjs` was inspected and not changed.

I did not add automatic startup `npx prisma migrate deploy` because production columns were manually added in phpMyAdmin. If the migration is not recorded in `_prisma_migrations`, automatic `migrate deploy` would try to add the same columns and can fail with duplicate-column errors. This is safer to handle manually on Hostinger.

Manual production step if columns exist but migration history does not:

```bash
npx prisma migrate resolve --applied 20260702090000_add_product_pricing_fields
npx prisma migrate deploy
```

Do this only after confirming the columns already exist and the migration is not marked applied.

## Commands Run / Results

- `npx prisma generate` - passed.
- `npm run lint` - failed once on the new image helper, then fixed.
- `npm run lint` - passed.
- `npm run build` - passed.

## Production QA Checklist

- Homepage admin Edit -> Save uses current section data after route changes.
- Checked section `visible=true` saves true.
- Unchecked section `visible=false` saves false.
- Duplicate slug validation allows saving the same section unchanged.
- Duplicate slug validation rejects collisions with another section.
- Validation errors return visible UI errors and do not proceed to item replacement.
- Existing section items are preserved unless the submitted payload validates.
- Item `active=false` remains serialized and saved.
- Hide/Show/Delete revalidate homepage/admin routes and return visible status messages.
- Public homepage query renders only `visible=true` sections.
- Public homepage query renders only `active=true` items.
- Public homepage section and item sort order remains query-driven.
- Featured product/category/custom/promotional labels remain unchanged.
- Custom/product/category section item links still resolve through existing logic.
- Broken uploaded category/custom homepage images fall back to `/brand/icon.svg`.
- Product admin edit fields for price, compare price, discount percent, shipping label, badge label, tags, rating, and review count remain wired in existing actions/forms.
- Product tags read safely from JSON arrays, JSON strings, or comma-separated string values.

## Remaining Manual Hostinger / phpMyAdmin Steps

- Do not add a duplicate pricing migration.
- If phpMyAdmin columns exist but Prisma migration history does not include `20260702090000_add_product_pricing_fields`, mark that migration as applied before running `migrate deploy`.
- No data reset, reseed, drop, truncate, or force push should be used.
