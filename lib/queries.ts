import { Prisma, type HomepageSectionType, type SiteSetting } from "@prisma/client";
import { cache } from "react";

import { db } from "@/lib/db";
import { logError } from "@/lib/logger";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

function getFallbackSiteSetting(): SiteSetting {
  const fallbackCompanyPhone = process.env.COMPANY_PHONE || "0786531966";
  const fallbackZaloUrl = process.env.ZALO_URL || "https://zalo.me/0786531966";
  const now = new Date();

  return {
    id: "default",
    companyName: "Hồng Sang",
    companyDescription: "Premium wood products and custom wood solutions.",
    address: null,
    phoneNumber: fallbackCompanyPhone,
    email: "maithihongsang79@gmail.com",
    zaloLink: fallbackZaloUrl,
    facebookLink: null,
    tiktokLink: null,
    logoUrl: null,
    faviconUrl: null,
    seoTitle: null,
    seoDescription: null,
    seoKeywords: null,
    footerContent: null,
    openingHours: null,
    contactPrimaryLabel: "Contact via Zalo",
    contactSecondaryLabel: "Call now",
    createdAt: now,
    updatedAt: now,
  };
}

async function withDatabaseFallback<T>(
  queryName: string,
  fallbackValue: T,
  execute: () => Promise<T>,
) {
  try {
    return await execute();
  } catch (error) {
    logError(`Database query failed: ${queryName}`, {
      error: getErrorMessage(error),
    });
    return fallbackValue;
  }
}

export const getSiteSettings = cache(async () => {
  const fallbackSettings = getFallbackSiteSetting();

  return withDatabaseFallback("getSiteSettings", fallbackSettings, async () => {
    const settings = await db.siteSetting.findUnique({
      where: { id: "default" },
    });

    if (settings) return settings;

    return db.siteSetting.create({
      data: {
        id: "default",
        companyName: fallbackSettings.companyName,
        companyDescription: fallbackSettings.companyDescription,
        phoneNumber: fallbackSettings.phoneNumber,
        email: fallbackSettings.email,
        zaloLink: fallbackSettings.zaloLink,
        contactPrimaryLabel: fallbackSettings.contactPrimaryLabel,
        contactSecondaryLabel: fallbackSettings.contactSecondaryLabel,
      },
    });
  });
});

export const getNavigationCategories = cache(async () => {
  return withDatabaseFallback("getNavigationCategories", [], () =>
    db.category.findMany({
      where: { active: true },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
      take: 10,
    }),
  );
});

export const getHomepageSections = cache(async () => {
  return withDatabaseFallback("getHomepageSections", [], () =>
    db.homepageSection.findMany({
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
    }),
  );
});

export const getFeaturedProducts = cache(async (limit = 12) => {
  return withDatabaseFallback("getFeaturedProducts", [], () =>
    db.product.findMany({
      where: { active: true, featured: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: limit,
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
    }),
  );
});

export const getFeaturedCategories = cache(async (limit = 10) => {
  return withDatabaseFallback("getFeaturedCategories", [], () =>
    db.category.findMany({
      where: { active: true, featured: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: limit,
    }),
  );
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

  return withDatabaseFallback("getProducts", [], () =>
    db.product.findMany({
      where,
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
  );
}

export async function getProductBySlug(slug: string) {
  return withDatabaseFallback("getProductBySlug", null, () =>
    db.product.findUnique({
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
    }),
  );
}

export const getCategories = cache(async () => {
  return withDatabaseFallback("getCategories", [], () =>
    db.category.findMany({
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
    }),
  );
});

export async function getCategoryBySlug(slug: string) {
  return withDatabaseFallback("getCategoryBySlug", null, () =>
    db.category.findUnique({
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
    }),
  );
}

export async function getSearchResults(term: string) {
  const normalizedTerm = term.trim();

  if (!normalizedTerm) {
    return { products: [], categories: [] };
  }

  return withDatabaseFallback("getSearchResults", { products: [], categories: [] }, async () => {
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
  });
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
