# Woodoria Studio Showcase

Production-ready full-stack showcase website for a wood products business, inspired by Etsy-style browsing flow, with:

- Public storefront (no prices, contact-first UX)
- Admin dashboard for content management
- Prisma + MySQL data layer
- Secure credential-based admin auth (NextAuth)
- Mobile-first responsive design with tasteful animations

## Tech Stack

- Next.js 16 (App Router, TypeScript)
- Tailwind CSS
- shadcn-style reusable UI primitives
- Framer Motion
- Prisma ORM
- MySQL
- NextAuth (credentials login)

## Features

### Public storefront

- Etsy-inspired browsing rhythm and section density
- Sticky header with search + quick contact actions
- Product showcase cards and category discovery
- Product detail pages with gallery, specs, related products
- Category pages and global search
- Floating mobile contact bar (Zalo + phone)
- No pricing anywhere

### Admin dashboard

- Login/logout for admin users
- CRUD: products, categories, homepage sections
- Company/site settings management
- Bulk product actions (activate/deactivate/feature/delete)
- Image upload with server-side validation and preview
- Search/filter in management pages

### Data/SEO/Security

- Prisma schema with relations, slugs, indexes, timestamps
- Demo seed data for immediate UI completeness
- Dynamic metadata from settings
- Dynamic sitemap
- Protected admin routes and protected admin APIs

## Project Structure

```text
app/
  (public)/
    about/
    categories/
    contact/
    products/
    search/
  admin/
    (dashboard)/
      categories/
      homepage/
      products/
      settings/
    login/
  api/
    admin/
      categories/[id]/
      products/[id]/
      products/bulk/
      upload/
    auth/[...nextauth]/
  layout.tsx
  sitemap.ts
components/
  admin/
  layout/
  public/
  ui/
lib/
  actions/
  validators/
  auth.ts
  db.ts
  queries.ts
  upload.ts
  utils.ts
prisma/
  schema.prisma
  seed.ts
public/
  logo.svg
  uploads/.gitkeep
proxy.ts
.env.example
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
DATABASE_URL="mysql://root:password@127.0.0.1:3306/woodoria_showcase"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Generate Prisma client:

```bash
npm run db:generate
```

3. Run migration:

```bash
npm run db:migrate -- --name init
```

4. Seed demo data:

```bash
npm run db:seed
```

5. Start dev server:

```bash
npm run dev
```

Default seeded admin account:

- Email: `admin@woodoria.com`
- Password: `Admin@123456`

## Useful Commands

- Run lint: `npm run lint`
- Build production: `npm run build`
- Start production: `npm run start`
- Open Prisma Studio: `npm run db:studio`
- Push schema without migration (optional): `npm run db:push`

## Deployment Notes (Hostinger Node.js App)

### Build/start commands

- Build command: `npm run build`
- Start command: `npm run start`

### Recommended Node version

- Node.js 20+ (22+ preferred)

### Hostinger checklist

1. Create MySQL database and user in Hostinger panel.
2. Upload/push this project to Hostinger Node.js app.
3. Set environment variables:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (your production domain, e.g. `https://your-domain.com`)
4. Install deps: `npm install` (or `npm ci`)
5. Run Prisma:
   - `npm run db:generate`
   - `npm run db:migrate` (preferred) or `npm run db:push`
6. (Optional) Seed initial content: `npm run db:seed`
7. Build and start:
   - `npm run build`
   - `npm run start`
8. Ensure domain/SSL is active and the app is reachable over HTTPS.

## Notes

- This project is a showcase + lead-contact website, not an e-commerce checkout system.
- Uploaded images are stored under `public/uploads` via local disk storage abstraction (`lib/upload.ts`), so swapping to S3/Cloudinary later is straightforward.
# khogotunhien
