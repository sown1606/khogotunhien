import { Prisma, type HomepageSectionType, type SiteSetting } from "@prisma/client";
import { cache } from "react";

import { db } from "@/lib/db";
import {
  getDemoCategories,
  getDemoCategoryBySlug,
  getDemoFeaturedCategories,
  getDemoFeaturedProducts,
  getDemoHomepageSections,
  getDemoNavigationCategories,
  getDemoProductBySlug,
  getDemoProducts,
  getDemoSearchResults,
  isDemoCatalogFallbackEnabled,
} from "@/lib/demo-catalog";
import { type Locale, localizeValue, normalizeLocale } from "@/lib/i18n";
import { logError, logWarn } from "@/lib/logger";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

function getCompactErrorMessage(error: unknown) {
  const message = getErrorMessage(error);
  const limit = 1200;

  if (message.length <= limit) {
    return message;
  }

  return `${message.slice(0, limit)}… [truncated ${message.length - limit} chars]`;
}

let prismaPanicUntilTimestamp = 0;
let databaseAuthFailureUntilTimestamp = 0;
let databaseOutageUntilTimestamp = 0;
let nextAuthFailureLogTimestamp = 0;
let nextOutageLogTimestamp = 0;

const DB_AUTH_COOLDOWN_MS = 5 * 60 * 1000;
const DB_AUTH_LOG_THROTTLE_MS = 60 * 1000;
const DB_OUTAGE_COOLDOWN_MS = 90 * 1000;
const DB_OUTAGE_LOG_THROTTLE_MS = 45 * 1000;

function isPrismaPanicActive() {
  return Date.now() < prismaPanicUntilTimestamp;
}

function markPrismaPanicCooldown() {
  prismaPanicUntilTimestamp = Date.now() + 2 * 60 * 1000;
}

function isDatabaseAuthFailureActive() {
  return Date.now() < databaseAuthFailureUntilTimestamp;
}

function markDatabaseAuthFailureCooldown() {
  databaseAuthFailureUntilTimestamp = Date.now() + DB_AUTH_COOLDOWN_MS;
}

function isDatabaseOutageActive() {
  return Date.now() < databaseOutageUntilTimestamp;
}

function markDatabaseOutageCooldown() {
  databaseOutageUntilTimestamp = Date.now() + DB_OUTAGE_COOLDOWN_MS;
}

function isPrismaPanicError(error: unknown) {
  const message = getErrorMessage(error).toLowerCase();
  const errorName = error instanceof Error ? error.name : "";

  if (error instanceof Prisma.PrismaClientRustPanicError || errorName === "PrismaClientRustPanicError") {
    return true;
  }

  return (
    message.includes("panic: timer has gone away") ||
    message.includes("timer has gone away") ||
    message.includes("query engine exited with code 101") ||
    message.includes("main task panicked") ||
    message.includes("joinerror::panic")
  );
}

function isDatabaseAuthenticationError(error: unknown) {
  const message = getErrorMessage(error).toLowerCase();

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return message.includes("p1000") || message.includes("authentication failed");
  }

  return (
    message.includes("p1000") ||
    message.includes("authentication failed against database server") ||
    message.includes("provided database credentials") ||
    message.includes("unknown authentication plugin")
  );
}

function isDatabaseOutageError(error: unknown) {
  const message = getErrorMessage(error).toLowerCase();

  if (isPrismaPanicError(error)) {
    return true;
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return (
      message.includes("p1001") ||
      message.includes("p1002") ||
      message.includes("can't reach database server")
    );
  }

  return (
    message.includes("p1001") ||
    message.includes("p1002") ||
    message.includes("p1017") ||
    message.includes("can't reach database server") ||
    message.includes("query engine exited with code") ||
    message.includes("connection refused") ||
    message.includes("connection reset") ||
    message.includes("timed out") ||
    message.includes("server has gone away")
  );
}

function logDatabaseAuthFailureThrottled(queryName: string, error: unknown) {
  const now = Date.now();
  if (now < nextAuthFailureLogTimestamp) return;

  nextAuthFailureLogTimestamp = now + DB_AUTH_LOG_THROTTLE_MS;
  logWarn("Database authentication failed. Falling back to demo/default data for public queries.", {
    query: queryName,
    cooldownSeconds: Math.floor(DB_AUTH_COOLDOWN_MS / 1000),
    error: getCompactErrorMessage(error),
  });
}

function logDatabaseOutageThrottled(queryName: string, error: unknown, reason: "panic" | "outage") {
  const now = Date.now();
  if (now < nextOutageLogTimestamp) return;

  nextOutageLogTimestamp = now + DB_OUTAGE_LOG_THROTTLE_MS;
  logWarn("Database unavailable. Serving fallback data for public queries.", {
    query: queryName,
    reason,
    cooldownSeconds:
      reason === "panic" ? Math.floor((2 * 60 * 1000) / 1000) : Math.floor(DB_OUTAGE_COOLDOWN_MS / 1000),
    error: getCompactErrorMessage(error),
  });
}

function readStringField(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === "string" ? value : undefined;
}

function localizeRecordField<T extends Record<string, unknown>>(
  locale: Locale,
  record: T,
  viKey: keyof T & string,
  enKey: string,
) {
  const viValue = record[viKey];
  const vi = typeof viValue === "string" ? viValue : null;
  const en = readStringField(record, enKey) ?? null;
  return localizeValue(locale, vi, en);
}

function localizeSiteSetting(locale: Locale, setting: SiteSetting): SiteSetting {
  const source = setting as SiteSetting & Record<string, unknown>;

  return {
    ...setting,
    companyDescription:
      localizeRecordField(locale, source, "companyDescription", "companyDescriptionEn") || null,
    address: localizeRecordField(locale, source, "address", "addressEn") || null,
    footerContent: localizeRecordField(locale, source, "footerContent", "footerContentEn") || null,
    openingHours: localizeRecordField(locale, source, "openingHours", "openingHoursEn") || null,
    contactPrimaryLabel:
      localizeRecordField(locale, source, "contactPrimaryLabel", "contactPrimaryLabelEn") ||
      setting.contactPrimaryLabel,
    contactSecondaryLabel:
      localizeRecordField(locale, source, "contactSecondaryLabel", "contactSecondaryLabelEn") ||
      setting.contactSecondaryLabel,
    leadPopupTitle:
      localizeRecordField(locale, source, "leadPopupTitle", "leadPopupTitleEn") ||
      setting.leadPopupTitle,
    leadPopupDescription:
      localizeRecordField(locale, source, "leadPopupDescription", "leadPopupDescriptionEn") || null,
    seoTitle: localizeRecordField(locale, source, "seoTitle", "seoTitleEn") || null,
    seoDescription: localizeRecordField(locale, source, "seoDescription", "seoDescriptionEn") || null,
  };
}

function localizeCategory<T extends { name: string; shortDescription: string | null }>(
  locale: Locale,
  category: T & Record<string, unknown>,
) {
  return {
    ...category,
    name: localizeRecordField(locale, category, "name", "nameEn") || category.name,
    shortDescription:
      localizeRecordField(locale, category, "shortDescription", "shortDescriptionEn") || null,
  };
}

function localizeProduct<T extends {
  name: string;
  shortDescription: string | null;
  description: string | null;
  woodType: string | null;
  material: string | null;
  dimensions: string | null;
  finish: string | null;
  category?: { name: string; shortDescription: string | null } | null;
  relatedProducts?: Array<{
    name: string;
    shortDescription: string | null;
    description: string | null;
    woodType: string | null;
    material: string | null;
    dimensions: string | null;
    finish: string | null;
    category?: { name: string; shortDescription: string | null } | null;
  }>;
}>(
  locale: Locale,
  product: T & Record<string, unknown>,
): T {
  const localizedCategory = product.category
    ? localizeCategory(locale, product.category as typeof product.category & Record<string, unknown>)
    : product.category;

  const localizedRelated =
    product.relatedProducts?.map((related) =>
      localizeProduct(
        locale,
        related as typeof related & Record<string, unknown>,
      ),
    ) || product.relatedProducts;

  return {
    ...product,
    name: localizeRecordField(locale, product, "name", "nameEn") || product.name,
    shortDescription:
      localizeRecordField(locale, product, "shortDescription", "shortDescriptionEn") || null,
    description: localizeRecordField(locale, product, "description", "descriptionEn") || null,
    woodType: localizeRecordField(locale, product, "woodType", "woodTypeEn") || null,
    material: localizeRecordField(locale, product, "material", "materialEn") || null,
    dimensions: localizeRecordField(locale, product, "dimensions", "dimensionsEn") || null,
    finish: localizeRecordField(locale, product, "finish", "finishEn") || null,
    category: localizedCategory,
    relatedProducts: localizedRelated as T["relatedProducts"],
  };
}

function localizeHomepageSection<T extends {
  title: string;
  description: string | null;
  items: Array<{
    customTitle: string | null;
    customDescription: string | null;
    product: {
      name: string;
      shortDescription: string | null;
      description: string | null;
      woodType: string | null;
      material: string | null;
      dimensions: string | null;
      finish: string | null;
      category?: { name: string; shortDescription: string | null } | null;
    } | null;
    category: { name: string; shortDescription: string | null } | null;
  }>;
}>(
  locale: Locale,
  section: T & Record<string, unknown>,
) {
  return {
    ...section,
    title: localizeRecordField(locale, section, "title", "titleEn") || section.title,
    description: localizeRecordField(locale, section, "description", "descriptionEn") || null,
    items: section.items.map((item) => {
      const source = item as typeof item & Record<string, unknown>;
      return {
        ...item,
        customTitle: localizeRecordField(locale, source, "customTitle", "customTitleEn") || null,
        customDescription:
          localizeRecordField(locale, source, "customDescription", "customDescriptionEn") || null,
        product: item.product
          ? localizeProduct(locale, item.product as typeof item.product & Record<string, unknown>)
          : null,
        category: item.category
          ? localizeCategory(locale, item.category as typeof item.category & Record<string, unknown>)
          : null,
      };
    }),
  };
}

function getFallbackSiteSetting(): SiteSetting {
  const fallbackCompanyPhone = process.env.COMPANY_PHONE || "0786531966";
  const fallbackZaloUrl = process.env.ZALO_URL || "https://zalo.me/0786531966";
  const now = new Date();

  return {
    id: "default",
    companyName: "ĐẠI THIÊN PHÚ WOOD",
    companyDescription:
      "Tinh hoa của gia đình Việt. Vật liệu gỗ cao cấp, sản phẩm thủ công tinh xảo và dịch vụ gia công theo yêu cầu cho gia đình, cửa hàng và dự án nội thất.",
    companyDescriptionEn:
      "The essence of Vietnamese family craftsmanship. Premium wood materials and custom builds for homes and businesses.",
    address: "Showroom và xưởng sản xuất, TP. Hồ Chí Minh, Việt Nam",
    addressEn: "Showroom and Workshop, Ho Chi Minh City, Vietnam",
    phoneNumber: fallbackCompanyPhone,
    email: "maithihongsang79@gmail.com",
    zaloLink: fallbackZaloUrl,
    facebookLink: null,
    tiktokLink: null,
    logoUrl: "/brand/logo-horizontal.svg",
    faviconUrl: "/favicon.svg",
    seoTitle: "ĐẠI THIÊN PHÚ WOOD | Tinh hoa của gia đình Việt",
    seoTitleEn: "ĐẠI THIÊN PHÚ WOOD | The essence of Vietnamese family craftsmanship",
    seoDescription:
      "Khám phá gỗ óc chó, gỗ sồi, gỗ dẻ gai, slab gỗ tự nhiên, thớt cao cấp và vật liệu nội thất từ ĐẠI THIÊN PHÚ WOOD.",
    seoDescriptionEn:
      "Premium wood products, decorative panels, custom signs, cutting boards, and interior wood materials from Đại Thiên Phú Wood.",
    seoKeywords:
      "wood products, walnut boards, oak panels, cutting boards, wood signs, interior wood materials",
    footerContent:
      "Chúng tôi cung cấp vật liệu gỗ tuyển chọn và giải pháp gia công theo yêu cầu cho bếp, nội thất và quà tặng cá nhân hóa.",
    footerContentEn:
      "Premium timber selection and custom wood craftsmanship for kitchens, interiors, and personalized gifts.",
    openingHours: "Thứ 2 - Thứ 7: 08:00 - 18:00",
    openingHoursEn: "Mon - Sat: 8:00 AM - 6:00 PM",
    contactPrimaryLabel: "Nhắn Zalo",
    contactPrimaryLabelEn: "Chat on Zalo",
    contactSecondaryLabel: "Gọi ngay",
    contactSecondaryLabelEn: "Call now",
    leadPopupEnabled: true,
    leadPopupDelaySeconds: 25,
    leadPopupTitle: "Cần hỗ trợ nhanh?",
    leadPopupTitleEn: "Need quick support?",
    leadPopupDescription:
      "Để lại số điện thoại hoặc email, đội ngũ sẽ liên hệ tư vấn trong thời gian sớm nhất.",
    leadPopupDescriptionEn:
      "Leave your phone or email and our team will contact you shortly.",
    createdAt: now,
    updatedAt: now,
  };
}

async function withDatabaseFallback<T>(
  queryName: string,
  fallbackValue: T,
  execute: () => Promise<T>,
) {
  if (isPrismaPanicActive() || isDatabaseAuthFailureActive() || isDatabaseOutageActive()) {
    return fallbackValue;
  }

  try {
    return await execute();
  } catch (error) {
    if (isPrismaPanicError(error)) {
      markPrismaPanicCooldown();
      logDatabaseOutageThrottled(queryName, error, "panic");
      return fallbackValue;
    }

    if (isDatabaseAuthenticationError(error)) {
      markDatabaseAuthFailureCooldown();
      logDatabaseAuthFailureThrottled(queryName, error);
      return fallbackValue;
    }

    if (isDatabaseOutageError(error)) {
      markDatabaseOutageCooldown();
      logDatabaseOutageThrottled(queryName, error, "outage");
      return fallbackValue;
    }

    logError(`Database query failed: ${queryName}`, {
      error: getCompactErrorMessage(error),
    });
    return fallbackValue;
  }
}

function shouldUseDemoFallback() {
  return isDemoCatalogFallbackEnabled();
}

const getSiteSettingsCached = cache(async (locale: Locale) => {
  const fallbackSettings = getFallbackSiteSetting();

  const settings = await withDatabaseFallback("getSiteSettings", fallbackSettings, async () => {
    const existing = await db.siteSetting.findUnique({
      where: { id: "default" },
    });

    if (existing) return existing;

    return db.siteSetting.create({
      data: {
        id: "default",
        companyName: fallbackSettings.companyName,
        companyDescription: fallbackSettings.companyDescription,
        companyDescriptionEn: fallbackSettings.companyDescriptionEn,
        address: fallbackSettings.address,
        addressEn: fallbackSettings.addressEn,
        phoneNumber: fallbackSettings.phoneNumber,
        email: fallbackSettings.email,
        zaloLink: fallbackSettings.zaloLink,
        contactPrimaryLabel: fallbackSettings.contactPrimaryLabel,
        contactPrimaryLabelEn: fallbackSettings.contactPrimaryLabelEn,
        contactSecondaryLabel: fallbackSettings.contactSecondaryLabel,
        contactSecondaryLabelEn: fallbackSettings.contactSecondaryLabelEn,
        leadPopupEnabled: fallbackSettings.leadPopupEnabled,
        leadPopupDelaySeconds: fallbackSettings.leadPopupDelaySeconds,
        leadPopupTitle: fallbackSettings.leadPopupTitle,
        leadPopupTitleEn: fallbackSettings.leadPopupTitleEn,
        leadPopupDescription: fallbackSettings.leadPopupDescription,
        leadPopupDescriptionEn: fallbackSettings.leadPopupDescriptionEn,
        logoUrl: fallbackSettings.logoUrl,
        faviconUrl: fallbackSettings.faviconUrl,
        seoTitle: fallbackSettings.seoTitle,
        seoTitleEn: fallbackSettings.seoTitleEn,
        seoDescription: fallbackSettings.seoDescription,
        seoDescriptionEn: fallbackSettings.seoDescriptionEn,
        footerContent: fallbackSettings.footerContent,
        footerContentEn: fallbackSettings.footerContentEn,
        openingHours: fallbackSettings.openingHours,
        openingHoursEn: fallbackSettings.openingHoursEn,
      },
    });
  });

  return localizeSiteSetting(locale, settings);
});

export async function getSiteSettings(inputLocale: Locale = "vi") {
  const locale = normalizeLocale(inputLocale);
  return getSiteSettingsCached(locale);
}

export async function getSiteSettingsForAdmin() {
  const fallbackSettings = getFallbackSiteSetting();

  return withDatabaseFallback("getSiteSettingsForAdmin", fallbackSettings, async () => {
    const settings = await db.siteSetting.findUnique({
      where: { id: "default" },
    });

    if (settings) return settings;

    return db.siteSetting.create({
      data: {
        id: "default",
        companyName: fallbackSettings.companyName,
        companyDescription: fallbackSettings.companyDescription,
        companyDescriptionEn: fallbackSettings.companyDescriptionEn,
        address: fallbackSettings.address,
        addressEn: fallbackSettings.addressEn,
        phoneNumber: fallbackSettings.phoneNumber,
        email: fallbackSettings.email,
        zaloLink: fallbackSettings.zaloLink,
        contactPrimaryLabel: fallbackSettings.contactPrimaryLabel,
        contactPrimaryLabelEn: fallbackSettings.contactPrimaryLabelEn,
        contactSecondaryLabel: fallbackSettings.contactSecondaryLabel,
        contactSecondaryLabelEn: fallbackSettings.contactSecondaryLabelEn,
        leadPopupEnabled: fallbackSettings.leadPopupEnabled,
        leadPopupDelaySeconds: fallbackSettings.leadPopupDelaySeconds,
        leadPopupTitle: fallbackSettings.leadPopupTitle,
        leadPopupTitleEn: fallbackSettings.leadPopupTitleEn,
        leadPopupDescription: fallbackSettings.leadPopupDescription,
        leadPopupDescriptionEn: fallbackSettings.leadPopupDescriptionEn,
      },
    });
  });
}

export async function getNavigationCategories(inputLocale: Locale = "vi") {
  const locale = normalizeLocale(inputLocale);

  const categories = await withDatabaseFallback("getNavigationCategories", [], () =>
    db.category.findMany({
      where: { active: true },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
      take: 10,
    }),
  );
  const sourceCategories =
    categories.length > 0 || !shouldUseDemoFallback()
      ? categories
      : getDemoNavigationCategories(10);

  return sourceCategories.map((category) =>
    localizeCategory(locale, category as typeof category & Record<string, unknown>),
  );
}

export async function getHomepageSections(inputLocale: Locale = "vi") {
  const locale = normalizeLocale(inputLocale);

  const sections = await withDatabaseFallback("getHomepageSections", [], () =>
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
  const sourceSections =
    sections.length > 0 || !shouldUseDemoFallback()
      ? sections
      : getDemoHomepageSections();

  return sourceSections.map((section) =>
    localizeHomepageSection(locale, section as typeof section & Record<string, unknown>),
  );
}

export async function getFeaturedProducts(limit = 12, inputLocale: Locale = "vi") {
  const locale = normalizeLocale(inputLocale);

  const products = await withDatabaseFallback("getFeaturedProducts", [], () =>
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
  const sourceProducts =
    products.length > 0 || !shouldUseDemoFallback()
      ? products
      : getDemoFeaturedProducts(limit);

  return sourceProducts.map((product) =>
    localizeProduct(locale, product as typeof product & Record<string, unknown>),
  );
}

export async function getFeaturedCategories(limit = 10, inputLocale: Locale = "vi") {
  const locale = normalizeLocale(inputLocale);

  const categories = await withDatabaseFallback("getFeaturedCategories", [], () =>
    db.category.findMany({
      where: { active: true, featured: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: limit,
    }),
  );
  const sourceCategories =
    categories.length > 0 || !shouldUseDemoFallback()
      ? categories
      : getDemoFeaturedCategories(limit);

  return sourceCategories.map((category) =>
    localizeCategory(locale, category as typeof category & Record<string, unknown>),
  );
}

type ProductQuery = {
  q?: string;
  category?: string;
  material?: string;
  featured?: string;
};

export async function getProducts(query: ProductQuery = {}, inputLocale: Locale = "vi") {
  const locale = normalizeLocale(inputLocale);
  const where: Prisma.ProductWhereInput = {
    active: true,
  };

  if (query.q) {
    const normalized = query.q.trim();
    where.OR = [
      { name: { contains: normalized } },
      { nameEn: { contains: normalized } },
      { shortDescription: { contains: normalized } },
      { shortDescriptionEn: { contains: normalized } },
      { woodType: { contains: normalized } },
      { woodTypeEn: { contains: normalized } },
      { material: { contains: normalized } },
      { materialEn: { contains: normalized } },
      { category: { name: { contains: normalized } } },
      { category: { nameEn: { contains: normalized } } },
    ];
  }

  if (query.category) {
    where.category = { slug: query.category };
  }

  if (query.material) {
    where.OR = [...(where.OR ?? []), { material: { contains: query.material } }, { materialEn: { contains: query.material } }];
  }

  if (query.featured === "true") {
    where.featured = true;
  }

  const products = await withDatabaseFallback("getProducts", [], () =>
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
  const sourceProducts =
    products.length > 0 || !shouldUseDemoFallback()
      ? products
      : getDemoProducts(query);

  return sourceProducts.map((product) =>
    localizeProduct(locale, product as typeof product & Record<string, unknown>),
  );
}

export async function getProductBySlug(slug: string, inputLocale: Locale = "vi") {
  const locale = normalizeLocale(inputLocale);

  const product = await withDatabaseFallback("getProductBySlug", null, () =>
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
  const resolvedProduct = product ?? (shouldUseDemoFallback() ? getDemoProductBySlug(slug) : null);
  if (!resolvedProduct) return null;

  return localizeProduct(
    locale,
    resolvedProduct as typeof resolvedProduct & Record<string, unknown>,
  );
}

export async function getCategories(inputLocale: Locale = "vi") {
  const locale = normalizeLocale(inputLocale);

  const categories = await withDatabaseFallback("getCategories", [], () =>
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
  const sourceCategories =
    categories.length > 0 || !shouldUseDemoFallback() ? categories : getDemoCategories();

  return sourceCategories.map((category) =>
    localizeCategory(locale, category as typeof category & Record<string, unknown>),
  );
}

export async function getCategoryBySlug(slug: string, inputLocale: Locale = "vi") {
  const locale = normalizeLocale(inputLocale);

  const category = await withDatabaseFallback("getCategoryBySlug", null, () =>
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
  const resolvedCategory = category ?? (shouldUseDemoFallback() ? getDemoCategoryBySlug(slug) : null);
  if (!resolvedCategory) return null;

  return {
    ...localizeCategory(
      locale,
      resolvedCategory as typeof resolvedCategory & Record<string, unknown>,
    ),
    products: resolvedCategory.products.map((product) =>
      localizeProduct(locale, product as typeof product & Record<string, unknown>),
    ),
  };
}

export async function getSearchResults(term: string, inputLocale: Locale = "vi") {
  const locale = normalizeLocale(inputLocale);
  const normalizedTerm = term.trim();

  if (!normalizedTerm) {
    return { products: [], categories: [] };
  }

  const result = await withDatabaseFallback("getSearchResults", { products: [], categories: [] }, async () => {
    const [products, categories] = await Promise.all([
      db.product.findMany({
        where: {
          active: true,
          OR: [
            { name: { contains: normalizedTerm } },
            { nameEn: { contains: normalizedTerm } },
            { shortDescription: { contains: normalizedTerm } },
            { shortDescriptionEn: { contains: normalizedTerm } },
            { woodType: { contains: normalizedTerm } },
            { woodTypeEn: { contains: normalizedTerm } },
            { material: { contains: normalizedTerm } },
            { materialEn: { contains: normalizedTerm } },
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
            { nameEn: { contains: normalizedTerm } },
            { shortDescription: { contains: normalizedTerm } },
            { shortDescriptionEn: { contains: normalizedTerm } },
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
  const sourceResult =
    result.products.length > 0 || result.categories.length > 0 || !shouldUseDemoFallback()
      ? result
      : getDemoSearchResults(normalizedTerm);

  return {
    products: sourceResult.products.map((product) =>
      localizeProduct(locale, product as typeof product & Record<string, unknown>),
    ),
    categories: sourceResult.categories.map((category) =>
      localizeCategory(locale, category as typeof category & Record<string, unknown>),
    ),
  };
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
