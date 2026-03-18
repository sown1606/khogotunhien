import { z } from "zod";

import { toSlug } from "@/lib/utils";

export const productSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(140),
  shortDescription: z.string().max(240).optional().or(z.literal("")),
  description: z.string().max(5000).optional().or(z.literal("")),
  thumbnailUrl: z.string().max(500).optional().or(z.literal("")),
  woodType: z.string().max(120).optional().or(z.literal("")),
  material: z.string().max(120).optional().or(z.literal("")),
  dimensions: z.string().max(120).optional().or(z.literal("")),
  finish: z.string().max(120).optional().or(z.literal("")),
  featured: z.boolean(),
  active: z.boolean(),
  sortOrder: z.number().int().min(0).max(9999),
  categoryId: z.string().optional().or(z.literal("")),
  galleryUrls: z.array(z.string().max(500)).default([]),
  relatedProductIds: z.array(z.string()).default([]),
});

export function normalizeProductPayload(payload: Partial<Record<string, unknown>>) {
  const name = String(payload.name ?? "");
  const givenSlug = String(payload.slug ?? "");

  return {
    name: name.trim(),
    slug: toSlug(givenSlug || name),
    shortDescription: String(payload.shortDescription ?? "").trim(),
    description: String(payload.description ?? "").trim(),
    thumbnailUrl: String(payload.thumbnailUrl ?? "").trim(),
    woodType: String(payload.woodType ?? "").trim(),
    material: String(payload.material ?? "").trim(),
    dimensions: String(payload.dimensions ?? "").trim(),
    finish: String(payload.finish ?? "").trim(),
    featured: Boolean(payload.featured),
    active: Boolean(payload.active),
    sortOrder: Number(payload.sortOrder ?? 0),
    categoryId: String(payload.categoryId ?? "").trim(),
    galleryUrls: Array.isArray(payload.galleryUrls)
      ? payload.galleryUrls.map((item) => String(item).trim()).filter(Boolean)
      : [],
    relatedProductIds: Array.isArray(payload.relatedProductIds)
      ? payload.relatedProductIds.map((item) => String(item).trim()).filter(Boolean)
      : [],
  };
}
