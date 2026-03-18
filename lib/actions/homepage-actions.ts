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

function parseItems(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
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

export async function createHomepageSectionAction(
  _previousState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await ensureAdmin();

    const payload = normalizeHomepageSectionPayload({
      title: formData.get("title"),
      slug: formData.get("slug"),
      description: formData.get("description"),
      type: parseType(formData.get("type")),
      visible: parseBoolean(formData.get("visible")),
      sortOrder: parseNumber(formData.get("sortOrder"), 0),
      items: parseItems(formData.get("items")),
    });

    const parsed = homepageSectionSchema.safeParse(payload);

    if (!parsed.success) {
      return {
        error: "Please review section fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    await db.homepageSection.create({
      data: {
        title: parsed.data.title,
        slug: parsed.data.slug,
        description: parsed.data.description || null,
        type: parsed.data.type,
        visible: parsed.data.visible,
        sortOrder: parsed.data.sortOrder,
        items: {
          create: parsed.data.items.map((item) => ({
            productId: item.productId || null,
            categoryId: item.categoryId || null,
            customTitle: item.customTitle || null,
            customDescription: item.customDescription || null,
            imageUrl: item.imageUrl || null,
            linkUrl: item.linkUrl || null,
            active: item.active,
            sortOrder: item.sortOrder,
          })),
        },
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/homepage");

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

    const payload = normalizeHomepageSectionPayload({
      title: formData.get("title"),
      slug: formData.get("slug"),
      description: formData.get("description"),
      type: parseType(formData.get("type")),
      visible: parseBoolean(formData.get("visible")),
      sortOrder: parseNumber(formData.get("sortOrder"), 0),
      items: parseItems(formData.get("items")),
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
      select: { id: true },
    });

    if (!existing) {
      return { error: "Section not found." };
    }

    await db.homepageSection.update({
      where: { id: sectionId },
      data: {
        title: parsed.data.title,
        slug: parsed.data.slug,
        description: parsed.data.description || null,
        type: parsed.data.type,
        visible: parsed.data.visible,
        sortOrder: parsed.data.sortOrder,
        items: {
          deleteMany: {},
          create: parsed.data.items.map((item) => ({
            productId: item.productId || null,
            categoryId: item.categoryId || null,
            customTitle: item.customTitle || null,
            customDescription: item.customDescription || null,
            imageUrl: item.imageUrl || null,
            linkUrl: item.linkUrl || null,
            active: item.active,
            sortOrder: item.sortOrder,
          })),
        },
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/homepage");

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

    revalidatePath("/");
    revalidatePath("/admin/homepage");

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

    revalidatePath("/");
    revalidatePath("/admin/homepage");

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
