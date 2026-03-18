import { Prisma, type HomepageSectionType } from "@prisma/client";
import { cache } from "react";

import { db } from "@/lib/db";

export const getSiteSettings = cache(async () => {
  const fallbackCompanyPhone = process.env.COMPANY_PHONE || "0786531966";
  const fallbackZaloUrl = process.env.ZALO_URL || "https://zalo.me/0786531966";

  const settings = await db.siteSetting.findUnique({
    where: { id: "default" },
  });

  if (settings) return settings;

  return db.siteSetting.create({
    data: {
      id: "default",
      companyName: "Woodoria Studio",
      companyDescription:
        "Premium wood products, custom craftsmanship, and design-ready wood materials.",
      phoneNumber: fallbackCompanyPhone,
      email: "maithihongsang79@gmail.com",
      zaloLink: fallbackZaloUrl,
      contactPrimaryLabel: "Contact via Zalo",
      contactSecondaryLabel: "Call now",
    },
  });
});

export const getNavigationCategories = cache(async () => {
  return db.category.findMany({
    where: { active: true },
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
    take: 10,
  });
});

export const getHomepageSections = cache(async () => {
  return db.homepageSection.findMany({
    where: { visible: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: {
      items: {
        where: { active: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        include: {
          product: {
            include: {
              category: true,
              images: {
                orderBy: { sortOrder: "asc" },
              },
            },
          },
          category: true,
        },
      },
    },
  });
});

export const getFeaturedProducts = cache(async (limit = 12) => {
  return db.product.findMany({
    where: { active: true, featured: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: limit,
    include: {
      category: true,
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });
});

export const getFeaturedCategories = cache(async (limit = 10) => {
  return db.category.findMany({
    where: { active: true, featured: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: limit,
  });
});

type ProductQuery = {
  q?: string;
  category?: string;
  material?: string;
  featured?: string;
};

export async function getProducts(query: ProductQuery = {}) {
  const where: Prisma.ProductWhereInput = {
    active: true,
  };

  if (query.q) {
    const normalized = query.q.trim();
    where.OR = [
      { name: { contains: normalized } },
      { shortDescription: { contains: normalized } },
      { woodType: { contains: normalized } },
      { material: { contains: normalized } },
      { category: { name: { contains: normalized } } },
    ];
  }

  if (query.category) {
    where.category = { slug: query.category };
  }

  if (query.material) {
    where.OR = [...(where.OR ?? []), { material: { contains: query.material } }];
  }

  if (query.featured === "true") {
    where.featured = true;
  }

  return db.product.findMany({
    where,
    include: {
      category: true,
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function getProductBySlug(slug: string) {
  return db.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: {
        orderBy: { sortOrder: "asc" },
      },
      relatedProducts: {
        where: { active: true },
        include: {
          category: true,
          images: {
            orderBy: { sortOrder: "asc" },
          },
        },
        take: 8,
      },
    },
  });
}

export const getCategories = cache(async () => {
  return db.category.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          products: {
            where: { active: true },
          },
        },
      },
    },
  });
});

export async function getCategoryBySlug(slug: string) {
  return db.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { active: true },
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
          },
          category: true,
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      },
    },
  });
}

export async function getSearchResults(term: string) {
  const normalizedTerm = term.trim();

  if (!normalizedTerm) {
    return { products: [], categories: [] };
  }

  const [products, categories] = await Promise.all([
    db.product.findMany({
      where: {
        active: true,
        OR: [
          { name: { contains: normalizedTerm } },
          { shortDescription: { contains: normalizedTerm } },
          { woodType: { contains: normalizedTerm } },
          { material: { contains: normalizedTerm } },
        ],
      },
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
      take: 24,
    }),
    db.category.findMany({
      where: {
        active: true,
        OR: [
          { name: { contains: normalizedTerm } },
          { shortDescription: { contains: normalizedTerm } },
        ],
      },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
      take: 12,
      include: {
        _count: {
          select: {
            products: {
              where: { active: true },
            },
          },
        },
      },
    }),
  ]);

  return { products, categories };
}

export async function getHomepageSectionsForAdmin(type?: HomepageSectionType) {
  return db.homepageSection.findMany({
    where: type ? { type } : undefined,
    include: {
      items: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        include: {
          product: true,
          category: true,
        },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}
