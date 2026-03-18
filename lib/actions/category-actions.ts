"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ActionResult } from "@/lib/actions/types";
import { logError } from "@/lib/logger";
import { getSafeErrorMessage, toUserFacingError } from "@/lib/server-errors";
import { categorySchema, normalizeCategoryPayload } from "@/lib/validators/category";
import { parseBoolean, parseNumber } from "@/lib/utils";

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
}

export async function createCategoryAction(
  _previousState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await ensureAdmin();

    const payload = normalizeCategoryPayload({
      name: formData.get("name"),
      nameEn: formData.get("nameEn"),
      slug: formData.get("slug"),
      shortDescription: formData.get("shortDescription"),
      shortDescriptionEn: formData.get("shortDescriptionEn"),
      imageUrl: formData.get("imageUrl"),
      featured: parseBoolean(formData.get("featured")),
      active: parseBoolean(formData.get("active")),
      sortOrder: parseNumber(formData.get("sortOrder"), 0),
    });

    const parsed = categorySchema.safeParse(payload);

    if (!parsed.success) {
      return {
        error: "Please review the form fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    await db.category.create({
      data: {
        name: parsed.data.name,
        nameEn: parsed.data.nameEn || null,
        slug: parsed.data.slug,
        shortDescription: parsed.data.shortDescription || null,
        shortDescriptionEn: parsed.data.shortDescriptionEn || null,
        imageUrl: parsed.data.imageUrl || null,
        featured: parsed.data.featured,
        active: parsed.data.active,
        sortOrder: parsed.data.sortOrder,
      },
    });

    revalidatePath("/");
    revalidatePath("/en");
    revalidatePath("/categories");
    revalidatePath("/en/categories");
    revalidatePath("/admin/categories");

    return {
      success: true,
      message: "Category created successfully.",
    };
  } catch (error) {
    logError("Failed to create category.", {
      error: getSafeErrorMessage(error),
    });
    return {
      error: toUserFacingError(error, "Failed to create category."),
    };
  }
}

export async function updateCategoryAction(
  categoryId: string,
  _previousState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await ensureAdmin();

    const payload = normalizeCategoryPayload({
      name: formData.get("name"),
      nameEn: formData.get("nameEn"),
      slug: formData.get("slug"),
      shortDescription: formData.get("shortDescription"),
      shortDescriptionEn: formData.get("shortDescriptionEn"),
      imageUrl: formData.get("imageUrl"),
      featured: parseBoolean(formData.get("featured")),
      active: parseBoolean(formData.get("active")),
      sortOrder: parseNumber(formData.get("sortOrder"), 0),
    });

    const parsed = categorySchema.safeParse(payload);

    if (!parsed.success) {
      return {
        error: "Please review the form fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const existing = await db.category.findUnique({
      where: { id: categoryId },
      select: { slug: true },
    });

    if (!existing) {
      return { error: "Category not found." };
    }

    const updated = await db.category.update({
      where: { id: categoryId },
      data: {
        name: parsed.data.name,
        nameEn: parsed.data.nameEn || null,
        slug: parsed.data.slug,
        shortDescription: parsed.data.shortDescription || null,
        shortDescriptionEn: parsed.data.shortDescriptionEn || null,
        imageUrl: parsed.data.imageUrl || null,
        featured: parsed.data.featured,
        active: parsed.data.active,
        sortOrder: parsed.data.sortOrder,
      },
      select: { slug: true },
    });

    revalidatePath("/");
    revalidatePath("/en");
    revalidatePath("/categories");
    revalidatePath("/en/categories");
    revalidatePath(`/categories/${existing.slug}`);
    revalidatePath(`/en/categories/${existing.slug}`);
    revalidatePath(`/categories/${updated.slug}`);
    revalidatePath(`/en/categories/${updated.slug}`);
    revalidatePath("/admin/categories");

    return {
      success: true,
      message: "Category updated successfully.",
    };
  } catch (error) {
    logError("Failed to update category.", {
      error: getSafeErrorMessage(error),
      categoryId,
    });
    return {
      error: toUserFacingError(error, "Failed to update category."),
    };
  }
}

export async function deleteCategoryAction(categoryId: string): Promise<ActionResult> {
  try {
    await ensureAdmin();

    const existing = await db.category.findUnique({
      where: { id: categoryId },
      select: { slug: true },
    });

    if (!existing) {
      return { error: "Category not found." };
    }

    await db.category.delete({
      where: { id: categoryId },
    });

    revalidatePath("/");
    revalidatePath("/en");
    revalidatePath("/categories");
    revalidatePath("/en/categories");
    revalidatePath(`/categories/${existing.slug}`);
    revalidatePath(`/en/categories/${existing.slug}`);
    revalidatePath("/admin/categories");

    return {
      success: true,
      message: "Category deleted.",
    };
  } catch (error) {
    logError("Failed to delete category.", {
      error: getSafeErrorMessage(error),
      categoryId,
    });
    return {
      error: toUserFacingError(error, "Failed to delete category."),
    };
  }
}

export async function toggleCategoryActiveAction(
  categoryId: string,
  active: boolean,
): Promise<ActionResult> {
  try {
    await ensureAdmin();

    await db.category.update({
      where: { id: categoryId },
      data: { active },
    });

    revalidatePath("/");
    revalidatePath("/en");
    revalidatePath("/categories");
    revalidatePath("/en/categories");
    revalidatePath("/admin/categories");

    return {
      success: true,
      message: active ? "Category activated." : "Category deactivated.",
    };
  } catch (error) {
    logError("Failed to toggle category status.", {
      error: getSafeErrorMessage(error),
      categoryId,
    });
    return {
      error: toUserFacingError(error, "Failed to update status."),
    };
  }
}
