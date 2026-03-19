import { type ClassValue, clsx } from "clsx";
import slugify from "slugify";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhoneDisplay(phone?: string | null) {
  if (!phone) return "";
  return phone.replace(/(\+\d{2})(\d{3})(\d{3})(\d{3,4})/, "$1 $2 $3 $4");
}

export function normalizePhoneLink(phone?: string | null) {
  if (!phone) return "";
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function toSlug(value: string) {
  return slugify(value, {
    lower: true,
    strict: true,
    trim: true,
  });
}

export function parseBoolean(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return false;
  return value === "on" || value === "true" || value === "1";
}

export function parseNumber(value: FormDataEntryValue | null, fallback = 0) {
  if (typeof value !== "string") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function fileUrlFromPath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

const demoWoodProductImagePool = Array.from({ length: 28 }, (_, index) => {
  return `/demo/products/product-${String(index + 1).padStart(3, "0")}.webp`;
});

const demoWoodCategoryImagePool = Array.from({ length: 12 }, (_, index) => {
  return `/demo/categories/category-${String(index + 1).padStart(2, "0")}.webp`;
});

function hashSeed(seed: string) {
  return Array.from(seed).reduce((hash, char, index) => {
    return (hash + char.charCodeAt(0) * (index + 17)) % 100_000;
  }, 0);
}

export function resolveWoodDemoImage(source: string | null | undefined, seed: string) {
  if (!source) {
    return demoWoodProductImagePool[hashSeed(seed) % demoWoodProductImagePool.length];
  }

  if (
    source.startsWith("/demo/products/") ||
    source.startsWith("/demo/categories/") ||
    source.startsWith("/demo/hero/wood-")
  ) {
    return source;
  }

  if (source.startsWith("/demo/")) {
    const pool = source.includes("/categories/")
      ? demoWoodCategoryImagePool
      : demoWoodProductImagePool;
    return pool[hashSeed(seed) % pool.length];
  }

  return source;
}
