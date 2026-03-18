import { HomepageSectionType } from "@prisma/client";
import { z } from "zod";

import { toSlug } from "@/lib/utils";

const sectionItemSchema = z
  .object({
    id: z.string().optional(),
    productId: z.string().optional().or(z.literal("")),
    categoryId: z.string().optional().or(z.literal("")),
    customTitle: z.string().max(140).optional().or(z.literal("")),
    customTitleEn: z.string().max(140).optional().or(z.literal("")),
    customDescription: z.string().max(240).optional().or(z.literal("")),
    customDescriptionEn: z.string().max(240).optional().or(z.literal("")),
    imageUrl: z.string().max(500).optional().or(z.literal("")),
    linkUrl: z.string().max(240).optional().or(z.literal("")),
    active: z.boolean().default(true),
    sortOrder: z.number().int().min(0).max(9999),
  })
  .refine(
    (value) =>
      Boolean(value.productId || value.categoryId || value.customTitle || value.customTitleEn || value.imageUrl),
    {
      message: "Section item requires product, category, or custom content.",
    },
  );

export const homepageSectionSchema = z.object({
  title: z.string().min(2).max(140),
  titleEn: z.string().max(140).optional().or(z.literal("")),
  slug: z.string().min(2).max(160),
  description: z.string().max(300).optional().or(z.literal("")),
  descriptionEn: z.string().max(300).optional().or(z.literal("")),
  type: z.enum(HomepageSectionType),
  visible: z.boolean(),
  sortOrder: z.number().int().min(0).max(9999),
  items: z.array(sectionItemSchema).max(24),
});

export function normalizeHomepageSectionPayload(payload: Partial<Record<string, unknown>>) {
  const title = String(payload.title ?? "");
  const givenSlug = String(payload.slug ?? "");

  return {
    title: title.trim(),
    titleEn: String(payload.titleEn ?? "").trim(),
    slug: toSlug(givenSlug || title),
    description: String(payload.description ?? "").trim(),
    descriptionEn: String(payload.descriptionEn ?? "").trim(),
    type: payload.type as HomepageSectionType,
    visible: Boolean(payload.visible),
    sortOrder: Number(payload.sortOrder ?? 0),
    items: Array.isArray(payload.items)
      ? payload.items.map((item) => ({
          id: String((item as Record<string, unknown>)?.id ?? "").trim() || undefined,
          productId: String((item as Record<string, unknown>)?.productId ?? "").trim(),
          categoryId: String((item as Record<string, unknown>)?.categoryId ?? "").trim(),
          customTitle: String((item as Record<string, unknown>)?.customTitle ?? "").trim(),
          customTitleEn: String((item as Record<string, unknown>)?.customTitleEn ?? "").trim(),
          customDescription: String((item as Record<string, unknown>)?.customDescription ?? "").trim(),
          customDescriptionEn: String((item as Record<string, unknown>)?.customDescriptionEn ?? "").trim(),
          imageUrl: String((item as Record<string, unknown>)?.imageUrl ?? "").trim(),
          linkUrl: String((item as Record<string, unknown>)?.linkUrl ?? "").trim(),
          active: Boolean((item as Record<string, unknown>)?.active ?? true),
          sortOrder: Number((item as Record<string, unknown>)?.sortOrder ?? 0),
        }))
      : [],
  };
}
