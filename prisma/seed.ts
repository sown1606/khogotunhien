import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type CategorySeed = {
  name: string;
  slug: string;
  imageUrl: string;
  shortDescription: string;
  featured?: boolean;
  sortOrder: number;
};

type ProductSeed = {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  woodType: string;
  material: string;
  dimensions: string;
  finish: string;
  featured?: boolean;
  sortOrder: number;
  categorySlug: string;
  thumbnailUrl: string;
  gallery: string[];
};

const categories: CategorySeed[] = [
  {
    name: "Solid Wood",
    slug: "solid-wood",
    imageUrl:
      "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1200&q=80",
    shortDescription: "Premium solid hardwood selections for timeless builds.",
    featured: true,
    sortOrder: 1,
  },
  {
    name: "Walnut",
    slug: "walnut",
    imageUrl:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    shortDescription: "Rich walnut textures ideal for luxury interiors.",
    featured: true,
    sortOrder: 2,
  },
  {
    name: "Oak",
    slug: "oak",
    imageUrl:
      "https://images.unsplash.com/photo-1618221381711-42ca8ab6e908?auto=format&fit=crop&w=1200&q=80",
    shortDescription: "Durable oak materials with beautiful natural grain.",
    featured: true,
    sortOrder: 3,
  },
  {
    name: "Beech",
    slug: "beech",
    imageUrl:
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80",
    shortDescription: "Light-toned beech boards for modern craftsmanship.",
    sortOrder: 4,
  },
  {
    name: "Plywood",
    slug: "plywood",
    imageUrl:
      "https://images.unsplash.com/photo-1486946255434-2466348c2166?auto=format&fit=crop&w=1200&q=80",
    shortDescription: "Stable layered panels suited for structural projects.",
    sortOrder: 5,
  },
  {
    name: "Decorative Panels",
    slug: "decorative-panels",
    imageUrl:
      "https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=1200&q=80",
    shortDescription: "Architectural paneling with handcrafted finishes.",
    featured: true,
    sortOrder: 6,
  },
  {
    name: "Custom Wood Signs",
    slug: "custom-wood-signs",
    imageUrl:
      "https://images.unsplash.com/photo-1549187774-b4e9b0445b41?auto=format&fit=crop&w=1200&q=80",
    shortDescription: "Personalized signage for homes, cafés, and studios.",
    sortOrder: 7,
  },
  {
    name: "Live Edge Slabs",
    slug: "live-edge-slabs",
    imageUrl:
      "https://images.unsplash.com/photo-1628744448840-55bdb2497bd4?auto=format&fit=crop&w=1200&q=80",
    shortDescription: "One-of-a-kind slabs preserving natural contours.",
    featured: true,
    sortOrder: 8,
  },
  {
    name: "Wood Boards",
    slug: "wood-boards",
    imageUrl:
      "https://images.unsplash.com/photo-1617098474202-0d0d7f60f2ad?auto=format&fit=crop&w=1200&q=80",
    shortDescription: "Precision-cut boards in multiple dimensions.",
    sortOrder: 9,
  },
  {
    name: "Interior Wood Materials",
    slug: "interior-wood-materials",
    imageUrl:
      "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1200&q=80",
    shortDescription: "Complete wood material solutions for interiors.",
    sortOrder: 10,
  },
];

const products: ProductSeed[] = [
  {
    name: "Aurora Walnut Dining Top",
    slug: "aurora-walnut-dining-top",
    shortDescription: "Bookmatched walnut top crafted for statement dining spaces.",
    description:
      "A hand-selected walnut dining top with balanced grain and smooth beveled edges. Built for custom table bases and premium hospitality projects.",
    woodType: "American Walnut",
    material: "Solid Hardwood",
    dimensions: "2200 x 950 x 40 mm",
    finish: "Matte hardwax oil",
    featured: true,
    sortOrder: 1,
    categorySlug: "walnut",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=1400&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1616594039964-3c367f53d24f?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=1400&q=80",
    ],
  },
  {
    name: "Nordic Oak Wall Panel Set",
    slug: "nordic-oak-wall-panel-set",
    shortDescription: "Acoustic oak panels for warm and minimal interiors.",
    description:
      "A modular slat panel system in natural oak veneer, designed for residential and commercial walls with quick installation.",
    woodType: "European Oak",
    material: "Engineered Oak Panel",
    dimensions: "600 x 2400 x 21 mm",
    finish: "Clear UV coating",
    featured: true,
    sortOrder: 2,
    categorySlug: "decorative-panels",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1400&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1616593969747-4797dc75033e?auto=format&fit=crop&w=1400&q=80",
    ],
  },
  {
    name: "Live Edge River Slab",
    slug: "live-edge-river-slab",
    shortDescription: "Natural live-edge slab prepared for custom table projects.",
    description:
      "Carefully kiln-dried slab preserving the original tree contour. Ideal for bespoke dining tables, counters, and feature installations.",
    woodType: "Acacia",
    material: "Live Edge Slab",
    dimensions: "2600 x 850 x 55 mm",
    finish: "Sanded and sealed",
    featured: true,
    sortOrder: 3,
    categorySlug: "live-edge-slabs",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1615874694520-474822394e73?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1617098900591-3f90928e8c54?auto=format&fit=crop&w=1400&q=80",
    ],
  },
  {
    name: "Heritage Solid Oak Board",
    slug: "heritage-solid-oak-board",
    shortDescription: "Premium oak board with straight grain consistency.",
    description:
      "Multi-purpose board stock with strict moisture control and clean milling for carpentry, shelving, and interior builds.",
    woodType: "White Oak",
    material: "Solid Wood",
    dimensions: "2400 x 250 x 30 mm",
    finish: "Raw, ready for finishing",
    sortOrder: 4,
    categorySlug: "oak",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1618221639244-c1a8502c0eb9?auto=format&fit=crop&w=1400&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1551298370-9d3d53740c72?auto=format&fit=crop&w=1400&q=80",
    ],
  },
  {
    name: "Beech Stair Tread Blank",
    slug: "beech-stair-tread-blank",
    shortDescription: "Engineered beech blank for durable stair projects.",
    description:
      "Finger-jointed beech tread blank with stable structure and clean edge profile, optimized for interior staircase fabrication.",
    woodType: "European Beech",
    material: "Solid Laminated Wood",
    dimensions: "1200 x 300 x 38 mm",
    finish: "Fine sanded",
    sortOrder: 5,
    categorySlug: "beech",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1617104551722-3b2d513664a9?auto=format&fit=crop&w=1400&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1617103996702-96ff29b1c467?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1400&q=80",
    ],
  },
  {
    name: "Architect Plywood Core Panel",
    slug: "architect-plywood-core-panel",
    shortDescription: "Furniture-grade plywood with low-void birch core.",
    description:
      "Reliable structural plywood panel for cabinetry and joinery, featuring smooth surface layers and stable dimensional performance.",
    woodType: "Birch",
    material: "Plywood",
    dimensions: "1220 x 2440 x 18 mm",
    finish: "Natural veneer face",
    sortOrder: 6,
    categorySlug: "plywood",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1533090368676-1fd25485db88?auto=format&fit=crop&w=1400&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1472224371017-08207f84aaae?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1486946255434-2466348c2166?auto=format&fit=crop&w=1400&q=80",
    ],
  },
  {
    name: "Monogram Cedar Sign Board",
    slug: "monogram-cedar-sign-board",
    shortDescription: "Custom-ready cedar sign board with smooth face grain.",
    description:
      "Prepared cedar board suitable for engraving, routed lettering, and paint applications. Great for brand signage and home names.",
    woodType: "Western Red Cedar",
    material: "Solid Wood Sign Blank",
    dimensions: "800 x 300 x 28 mm",
    finish: "Pre-sanded satin seal",
    featured: true,
    sortOrder: 7,
    categorySlug: "custom-wood-signs",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1400&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1549187774-b4e9b0445b41?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1400&q=80",
    ],
  },
  {
    name: "Prime Teak Deck Board",
    slug: "prime-teak-deck-board",
    shortDescription: "Dense teak board with natural weather resistance.",
    description:
      "Selected teak board stock designed for exterior architectural use where stability and long service life are required.",
    woodType: "Plantation Teak",
    material: "Solid Exterior Wood",
    dimensions: "2100 x 140 x 25 mm",
    finish: "Unfinished",
    sortOrder: 8,
    categorySlug: "wood-boards",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1465808883814-940ef7c1252f?auto=format&fit=crop&w=1400&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1400&q=80",
    ],
  },
  {
    name: "Studio Ash Cabinet Front",
    slug: "studio-ash-cabinet-front",
    shortDescription: "Custom cabinet front with elegant open ash grain.",
    description:
      "Cabinet-ready ash panel fronts with precision machining for modern kitchens, wardrobes, and millwork packages.",
    woodType: "American Ash",
    material: "Interior Wood Material",
    dimensions: "720 x 450 x 22 mm",
    finish: "Natural matte lacquer",
    featured: true,
    sortOrder: 9,
    categorySlug: "interior-wood-materials",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1616594039964-3c367f53d24f?auto=format&fit=crop&w=1400&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1615529328331-f8917597711f?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=80",
    ],
  },
  {
    name: "Rift Sawn Oak Counter Blank",
    slug: "rift-sawn-oak-counter-blank",
    shortDescription: "Consistent rift grain countertop blank for premium kitchens.",
    description:
      "Calibrated countertop blank with low movement profile and elegant straight grain appearance, designed for high-end interior projects.",
    woodType: "Rift Sawn Oak",
    material: "Solid Wood",
    dimensions: "3000 x 650 x 40 mm",
    finish: "Food-safe oil",
    sortOrder: 10,
    categorySlug: "solid-wood",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1615529162924-f860538846c6?auto=format&fit=crop&w=1400&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1618221381711-42ca8ab6e908?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1616593969747-4797dc75033e?auto=format&fit=crop&w=1400&q=80",
    ],
  },
];

async function main() {
  const passwordHash = await bcrypt.hash("Admin@123456", 10);

  await prisma.adminUser.upsert({
    where: { email: "admin@woodoria.com" },
    update: {
      name: "Woodoria Admin",
      passwordHash,
      active: true,
    },
    create: {
      name: "Woodoria Admin",
      email: "admin@woodoria.com",
      passwordHash,
      active: true,
      role: "ADMIN",
    },
  });

  await prisma.homepageSectionItem.deleteMany();
  await prisma.homepageSection.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  const createdCategories = await Promise.all(
    categories.map((category) =>
      prisma.category.create({
        data: {
          name: category.name,
          slug: category.slug,
          imageUrl: category.imageUrl,
          shortDescription: category.shortDescription,
          featured: Boolean(category.featured),
          active: true,
          sortOrder: category.sortOrder,
        },
      }),
    ),
  );

  const categoryBySlug = new Map(createdCategories.map((item) => [item.slug, item]));

  const createdProducts = await Promise.all(
    products.map((product) => {
      const category = categoryBySlug.get(product.categorySlug);
      if (!category) {
        throw new Error(`Category not found for slug ${product.categorySlug}`);
      }

      return prisma.product.create({
        data: {
          name: product.name,
          slug: product.slug,
          shortDescription: product.shortDescription,
          description: product.description,
          thumbnailUrl: product.thumbnailUrl,
          woodType: product.woodType,
          material: product.material,
          dimensions: product.dimensions,
          finish: product.finish,
          featured: Boolean(product.featured),
          active: true,
          sortOrder: product.sortOrder,
          categoryId: category.id,
          images: {
            create: product.gallery.map((url, index) => ({
              url,
              sortOrder: index,
            })),
          },
        },
      });
    }),
  );

  const productBySlug = new Map(createdProducts.map((item) => [item.slug, item]));

  await prisma.product.update({
    where: { slug: "aurora-walnut-dining-top" },
    data: {
      relatedProducts: {
        connect: [
          { id: productBySlug.get("live-edge-river-slab")?.id },
          { id: productBySlug.get("rift-sawn-oak-counter-blank")?.id },
          { id: productBySlug.get("studio-ash-cabinet-front")?.id },
        ].filter((item): item is { id: string } => Boolean(item?.id)),
      },
    },
  });

  const featuredCategoriesSection = await prisma.homepageSection.create({
    data: {
      title: "Browse by Material",
      slug: "browse-by-material",
      description: "Discover our most requested wood categories for residential and commercial builds.",
      type: "FEATURED_CATEGORIES",
      visible: true,
      sortOrder: 1,
    },
  });

  await Promise.all(
    createdCategories
      .filter((category) => category.featured)
      .slice(0, 6)
      .map((category, index) =>
        prisma.homepageSectionItem.create({
          data: {
            sectionId: featuredCategoriesSection.id,
            categoryId: category.id,
            sortOrder: index,
          },
        }),
      ),
  );

  const featuredProductsSection = await prisma.homepageSection.create({
    data: {
      title: "Featured Craft Pieces",
      slug: "featured-craft-pieces",
      description: "A rotating selection of signature products from our workshop.",
      type: "FEATURED_PRODUCTS",
      visible: true,
      sortOrder: 2,
    },
  });

  await Promise.all(
    createdProducts
      .filter((product) => product.featured)
      .slice(0, 8)
      .map((product, index) =>
        prisma.homepageSectionItem.create({
          data: {
            sectionId: featuredProductsSection.id,
            productId: product.id,
            sortOrder: index,
          },
        }),
      ),
  );

  const collectionSection = await prisma.homepageSection.create({
    data: {
      title: "Curated Collections",
      slug: "curated-collections",
      description: "Handpicked collections for interior designers and custom furniture makers.",
      type: "CURATED_COLLECTION",
      visible: true,
      sortOrder: 3,
    },
  });

  await prisma.homepageSectionItem.createMany({
    data: [
      {
        sectionId: collectionSection.id,
        customTitle: "Modern Oak Living",
        customDescription: "Minimal slat panels, oak boards, and neutral textures.",
        imageUrl:
          "https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=1400&q=80",
        linkUrl: "/categories/oak",
        sortOrder: 1,
      },
      {
        sectionId: collectionSection.id,
        customTitle: "Signature Walnut",
        customDescription: "Deep tone walnut materials for upscale interior projects.",
        imageUrl:
          "https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=1400&q=80",
        linkUrl: "/categories/walnut",
        sortOrder: 2,
      },
      {
        sectionId: collectionSection.id,
        customTitle: "Natural Live Edge",
        customDescription: "Organic slabs and boards preserving raw character.",
        imageUrl:
          "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1400&q=80",
        linkUrl: "/categories/live-edge-slabs",
        sortOrder: 3,
      },
    ],
  });

  await prisma.siteSetting.upsert({
    where: { id: "default" },
    update: {
      companyName: "Woodoria Studio",
      companyDescription:
        "Woodoria Studio provides premium wood materials, custom wood products, and design-ready solutions for modern interiors.",
      address: "128 Riverside Craft District, Ho Chi Minh City, Vietnam",
      phoneNumber: "+84901234567",
      email: "hello@woodoria.vn",
      zaloLink: "https://zalo.me/0901234567",
      facebookLink: "https://facebook.com/woodoriastudio",
      tiktokLink: "https://tiktok.com/@woodoriastudio",
      logoUrl: "/logo.svg",
      faviconUrl: "/favicon.ico",
      seoTitle: "Woodoria Studio | Premium Wood Products & Materials",
      seoDescription:
        "Explore premium wood products, custom wood craftsmanship, and interior wood materials from Woodoria Studio.",
      seoKeywords: "wood products, walnut wood, oak wood, custom wood, interior wood materials",
      footerContent:
        "Crafted with natural materials. Built for architects, makers, and homeowners who value detail.",
      openingHours: "Mon - Sat: 8:00 AM - 6:00 PM",
      contactPrimaryLabel: "Contact via Zalo",
      contactSecondaryLabel: "Call now",
    },
    create: {
      id: "default",
      companyName: "Woodoria Studio",
      companyDescription:
        "Woodoria Studio provides premium wood materials, custom wood products, and design-ready solutions for modern interiors.",
      address: "128 Riverside Craft District, Ho Chi Minh City, Vietnam",
      phoneNumber: "+84901234567",
      email: "hello@woodoria.vn",
      zaloLink: "https://zalo.me/0901234567",
      facebookLink: "https://facebook.com/woodoriastudio",
      tiktokLink: "https://tiktok.com/@woodoriastudio",
      logoUrl: "/logo.svg",
      faviconUrl: "/favicon.ico",
      seoTitle: "Woodoria Studio | Premium Wood Products & Materials",
      seoDescription:
        "Explore premium wood products, custom wood craftsmanship, and interior wood materials from Woodoria Studio.",
      seoKeywords: "wood products, walnut wood, oak wood, custom wood, interior wood materials",
      footerContent:
        "Crafted with natural materials. Built for architects, makers, and homeowners who value detail.",
      openingHours: "Mon - Sat: 8:00 AM - 6:00 PM",
      contactPrimaryLabel: "Contact via Zalo",
      contactSecondaryLabel: "Call now",
    },
  });

  console.log("Seed completed successfully.");
  console.log("Admin login: admin@woodoria.com / Admin@123456");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
