import { z } from "zod";

import { toSlug } from "@/lib/utils";

export const categorySchema = z.object({
  name: z.string().min(2).max(120),
  nameEn: z.string().max(120).optional().or(z.literal("")),
  slug: z.string().min(2).max(140),
  shortDescription: z.string().max(240).optional().or(z.literal("")),
  shortDescriptionEn: z.string().max(240).optional().or(z.literal("")),
  imageUrl: z.string().max(500).optional().or(z.literal("")),
  featured: z.boolean(),
  active: z.boolean(),
  sortOrder: z.number().int().min(0).max(9999),
});

export function normalizeCategoryPayload(payload: Partial<Record<string, unknown>>) {
  const name = String(payload.name ?? "");
  const givenSlug = String(payload.slug ?? "");

  return {
    name: name.trim(),
    nameEn: String(payload.nameEn ?? "").trim(),
    slug: toSlug(givenSlug || name),
    shortDescription: String(payload.shortDescription ?? "").trim(),
    shortDescriptionEn: String(payload.shortDescriptionEn ?? "").trim(),
    imageUrl: String(payload.imageUrl ?? "").trim(),
    featured: Boolean(payload.featured),
    active: Boolean(payload.active),
    sortOrder: Number(payload.sortOrder ?? 0),
  };
}
