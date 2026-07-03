"use server";

import { HomepageSectionType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ActionResult } from "@/lib/actions/types";
import { logError } from "@/lib/logger";
import { getSafeErrorMessage, toUserFacingError } from "@/lib/server-errors";
import {
  homepageSectionSchema,
  normalizeHomepageSectionPayload,
} from "@/lib/validators/homepage";
import { parseBoolean, parseNumber } from "@/lib/utils";

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
}

function parseItems(value: FormDataEntryValue | null): { items: unknown[]; error?: string } {
  if (typeof value !== "string" || !value) return { items: [] };

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? { items: parsed }
      : { items: [], error: "Section items must be a valid list." };
  } catch {
    return { items: [], error: "Section items could not be read. Please refresh and try again." };
  }
}

function parseType(value: FormDataEntryValue | null): HomepageSectionType {
  if (typeof value !== "string") {
    return HomepageSectionType.CUSTOM;
  }

  return Object.values(HomepageSectionType).includes(value as HomepageSectionType)
    ? (value as HomepageSectionType)
    : HomepageSectionType.CUSTOM;
}

function getLastFormValue(formData: FormData, key: string) {
  const values = formData.getAll(key);
  return values.length ? values[values.length - 1] : null;
}

function revalidateHomepageSectionPaths(
  productSlugs: Array<string | null | undefined> = [],
  categorySlugs: Array<string | null | undefined> = [],
) {
  revalidatePath("/");
  revalidatePath("/en");
  revalidatePath("/admin/homepage");

  for (const slug of productSlugs) {
    if (!slug) continue;
    revalidatePath(`/products/${slug}`);
    revalidatePath(`/en/products/${slug}`);
  }

  for (const slug of categorySlugs) {
    if (!slug) continue;
    revalidatePath(`/categories/${slug}`);
    revalidatePath(`/en/categories/${slug}`);
  }
}

export async function createHomepageSectionAction(
  _previousState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await ensureAdmin();
    const parsedItems = parseItems(formData.get("items"));

    if (parsedItems.error) {
      return {
        error: "Please review section fields.",
        fieldErrors: { items: [parsedItems.error] },
      };
    }

    const payload = normalizeHomepageSectionPayload({
      title: formData.get("title"),
      titleEn: formData.get("titleEn"),
      slug: formData.get("slug"),
      description: formData.get("description"),
      descriptionEn: formData.get("descriptionEn"),
      type: parseType(formData.get("type")),
      visible: parseBoolean(getLastFormValue(formData, "visible")),
      sortOrder: parseNumber(formData.get("sortOrder"), 0),
      items: parsedItems.items,
    });

    const parsed = homepageSectionSchema.safeParse(payload);

    if (!parsed.success) {
      return {
        error: "Please review section fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const duplicate = await db.homepageSection.findUnique({
      where: { slug: parsed.data.slug },
      select: { id: true },
    });

    if (duplicate) {
      return {
        error: "Please review section fields.",
        fieldErrors: { slug: ["A homepage section with this slug already exists."] },
      };
    }

    await db.homepageSection.create({
      data: {
        title: parsed.data.title,
        titleEn: parsed.data.titleEn || null,
        slug: parsed.data.slug,
        description: parsed.data.description || null,
        descriptionEn: parsed.data.descriptionEn || null,
        type: parsed.data.type,
        visible: parsed.data.visible,
        sortOrder: parsed.data.sortOrder,
        items: {
          create: parsed.data.items.map((item) => ({
            productId: item.productId || null,
            categoryId: item.categoryId || null,
            customTitle: item.customTitle || null,
            customTitleEn: item.customTitleEn || null,
            customDescription: item.customDescription || null,
            customDescriptionEn: item.customDescriptionEn || null,
            imageUrl: item.imageUrl || null,
            linkUrl: item.linkUrl || null,
            active: item.active,
            sortOrder: item.sortOrder,
          })),
        },
      },
    });

    revalidateHomepageSectionPaths();

    return {
      success: true,
      message: "Homepage section created.",
    };
  } catch (error) {
    logError("Failed to create homepage section.", {
      error: getSafeErrorMessage(error),
    });
    return { error: toUserFacingError(error, "Failed to create section.") };
  }
}

export async function updateHomepageSectionAction(
  sectionId: string,
  _previousState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await ensureAdmin();
    const parsedItems = parseItems(formData.get("items"));

    if (parsedItems.error) {
      return {
        error: "Please review section fields.",
        fieldErrors: { items: [parsedItems.error] },
      };
    }

    const payload = normalizeHomepageSectionPayload({
      title: formData.get("title"),
      titleEn: formData.get("titleEn"),
      slug: formData.get("slug"),
      description: formData.get("description"),
      descriptionEn: formData.get("descriptionEn"),
      type: parseType(formData.get("type")),
      visible: parseBoolean(getLastFormValue(formData, "visible")),
      sortOrder: parseNumber(formData.get("sortOrder"), 0),
      items: parsedItems.items,
    });

    const parsed = homepageSectionSchema.safeParse(payload);

    if (!parsed.success) {
      return {
        error: "Please review section fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const existing = await db.homepageSection.findUnique({
      where: { id: sectionId },
      select: {
        id: true,
        slug: true,
        items: {
          select: {
            product: { select: { slug: true } },
            category: { select: { slug: true } },
          },
        },
      },
    });

    if (!existing) {
      return { error: "Section not found." };
    }

    if (parsed.data.slug !== existing.slug) {
      const duplicate = await db.homepageSection.findUnique({
        where: { slug: parsed.data.slug },
        select: { id: true },
      });

      if (duplicate && duplicate.id !== sectionId) {
        return {
          error: "Please review section fields.",
          fieldErrors: { slug: ["A homepage section with this slug already exists."] },
        };
      }
    }

    const updated = await db.homepageSection.update({
      where: { id: sectionId },
      data: {
        title: parsed.data.title,
        titleEn: parsed.data.titleEn || null,
        slug: parsed.data.slug,
        description: parsed.data.description || null,
        descriptionEn: parsed.data.descriptionEn || null,
        type: parsed.data.type,
        visible: parsed.data.visible,
        sortOrder: parsed.data.sortOrder,
        items: {
          deleteMany: {},
          create: parsed.data.items.map((item) => ({
            productId: item.productId || null,
            categoryId: item.categoryId || null,
            customTitle: item.customTitle || null,
            customTitleEn: item.customTitleEn || null,
            customDescription: item.customDescription || null,
            customDescriptionEn: item.customDescriptionEn || null,
            imageUrl: item.imageUrl || null,
            linkUrl: item.linkUrl || null,
            active: item.active,
            sortOrder: item.sortOrder,
          })),
        },
      },
      select: {
        items: {
          select: {
            product: { select: { slug: true } },
            category: { select: { slug: true } },
          },
        },
      },
    });

    revalidateHomepageSectionPaths(
      [
        ...existing.items.map((item) => item.product?.slug),
        ...updated.items.map((item) => item.product?.slug),
      ],
      [
        ...existing.items.map((item) => item.category?.slug),
        ...updated.items.map((item) => item.category?.slug),
      ],
    );

    return {
      success: true,
      message: "Homepage section updated.",
    };
  } catch (error) {
    logError("Failed to update homepage section.", {
      error: getSafeErrorMessage(error),
      sectionId,
    });
    return { error: toUserFacingError(error, "Failed to update section.") };
  }
}

export async function deleteHomepageSectionAction(sectionId: string): Promise<ActionResult> {
  try {
    await ensureAdmin();

    await db.homepageSection.delete({
      where: { id: sectionId },
    });

    revalidateHomepageSectionPaths();

    return {
      success: true,
      message: "Section removed.",
    };
  } catch (error) {
    logError("Failed to delete homepage section.", {
      error: getSafeErrorMessage(error),
      sectionId,
    });
    return { error: toUserFacingError(error, "Failed to delete section.") };
  }
}

export async function toggleHomepageSectionVisibilityAction(
  sectionId: string,
  visible: boolean,
): Promise<ActionResult> {
  try {
    await ensureAdmin();

    await db.homepageSection.update({
      where: { id: sectionId },
      data: { visible },
    });

    revalidateHomepageSectionPaths();

    return {
      success: true,
      message: visible ? "Section is visible." : "Section hidden.",
    };
  } catch (error) {
    logError("Failed to update homepage section visibility.", {
      error: getSafeErrorMessage(error),
      sectionId,
    });
    return { error: toUserFacingError(error, "Failed to update section visibility.") };
  }
}
