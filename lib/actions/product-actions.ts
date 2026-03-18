"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ActionResult } from "@/lib/actions/types";
import { logError } from "@/lib/logger";
import { getSafeErrorMessage, toUserFacingError } from "@/lib/server-errors";
import { normalizeProductPayload, productSchema } from "@/lib/validators/product";
import { parseBoolean, parseNumber } from "@/lib/utils";

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
}

function parseJsonArray(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function createProductAction(
  _previousState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await ensureAdmin();

    const payload = normalizeProductPayload({
      name: formData.get("name"),
      nameEn: formData.get("nameEn"),
      slug: formData.get("slug"),
      shortDescription: formData.get("shortDescription"),
      shortDescriptionEn: formData.get("shortDescriptionEn"),
      description: formData.get("description"),
      descriptionEn: formData.get("descriptionEn"),
      thumbnailUrl: formData.get("thumbnailUrl"),
      woodType: formData.get("woodType"),
      woodTypeEn: formData.get("woodTypeEn"),
      material: formData.get("material"),
      materialEn: formData.get("materialEn"),
      dimensions: formData.get("dimensions"),
      dimensionsEn: formData.get("dimensionsEn"),
      finish: formData.get("finish"),
      finishEn: formData.get("finishEn"),
      featured: parseBoolean(formData.get("featured")),
      active: parseBoolean(formData.get("active")),
      sortOrder: parseNumber(formData.get("sortOrder"), 0),
      categoryId: formData.get("categoryId"),
      galleryUrls: parseJsonArray(formData.get("galleryUrls")),
      relatedProductIds: parseJsonArray(formData.get("relatedProductIds")),
    });

    const parsed = productSchema.safeParse(payload);

    if (!parsed.success) {
      return {
        error: "Please review the form fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const created = await db.product.create({
      data: {
        name: parsed.data.name,
        nameEn: parsed.data.nameEn || null,
        slug: parsed.data.slug,
        shortDescription: parsed.data.shortDescription || null,
        shortDescriptionEn: parsed.data.shortDescriptionEn || null,
        description: parsed.data.description || null,
        descriptionEn: parsed.data.descriptionEn || null,
        thumbnailUrl: parsed.data.thumbnailUrl || parsed.data.galleryUrls[0] || null,
        woodType: parsed.data.woodType || null,
        woodTypeEn: parsed.data.woodTypeEn || null,
        material: parsed.data.material || null,
        materialEn: parsed.data.materialEn || null,
        dimensions: parsed.data.dimensions || null,
        dimensionsEn: parsed.data.dimensionsEn || null,
        finish: parsed.data.finish || null,
        finishEn: parsed.data.finishEn || null,
        featured: parsed.data.featured,
        active: parsed.data.active,
        sortOrder: parsed.data.sortOrder,
        categoryId: parsed.data.categoryId || null,
        images: {
          create: parsed.data.galleryUrls.map((url, index) => ({
            url,
            sortOrder: index,
          })),
        },
        relatedProducts: {
          connect: parsed.data.relatedProductIds.map((id) => ({ id })),
        },
      },
      select: { id: true, slug: true },
    });

    revalidatePath("/");
    revalidatePath("/en");
    revalidatePath("/products");
    revalidatePath("/en/products");
    revalidatePath(`/products/${created.slug}`);
    revalidatePath(`/en/products/${created.slug}`);
    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product created successfully.",
    };
  } catch (error) {
    logError("Failed to create product.", {
      error: getSafeErrorMessage(error),
    });
    return {
      error: toUserFacingError(error, "Failed to create product."),
    };
  }
}

export async function updateProductAction(
  productId: string,
  _previousState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await ensureAdmin();

    const payload = normalizeProductPayload({
      name: formData.get("name"),
      nameEn: formData.get("nameEn"),
      slug: formData.get("slug"),
      shortDescription: formData.get("shortDescription"),
      shortDescriptionEn: formData.get("shortDescriptionEn"),
      description: formData.get("description"),
      descriptionEn: formData.get("descriptionEn"),
      thumbnailUrl: formData.get("thumbnailUrl"),
      woodType: formData.get("woodType"),
      woodTypeEn: formData.get("woodTypeEn"),
      material: formData.get("material"),
      materialEn: formData.get("materialEn"),
      dimensions: formData.get("dimensions"),
      dimensionsEn: formData.get("dimensionsEn"),
      finish: formData.get("finish"),
      finishEn: formData.get("finishEn"),
      featured: parseBoolean(formData.get("featured")),
      active: parseBoolean(formData.get("active")),
      sortOrder: parseNumber(formData.get("sortOrder"), 0),
      categoryId: formData.get("categoryId"),
      galleryUrls: parseJsonArray(formData.get("galleryUrls")),
      relatedProductIds: parseJsonArray(formData.get("relatedProductIds")),
    });

    const parsed = productSchema.safeParse(payload);

    if (!parsed.success) {
      return {
        error: "Please review the form fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const existing = await db.product.findUnique({
      where: { id: productId },
      select: { slug: true },
    });

    if (!existing) {
      return {
        error: "Product not found.",
      };
    }

    const relatedIds = parsed.data.relatedProductIds.filter((id) => id !== productId);

    const updated = await db.product.update({
      where: { id: productId },
      data: {
        name: parsed.data.name,
        nameEn: parsed.data.nameEn || null,
        slug: parsed.data.slug,
        shortDescription: parsed.data.shortDescription || null,
        shortDescriptionEn: parsed.data.shortDescriptionEn || null,
        description: parsed.data.description || null,
        descriptionEn: parsed.data.descriptionEn || null,
        thumbnailUrl: parsed.data.thumbnailUrl || parsed.data.galleryUrls[0] || null,
        woodType: parsed.data.woodType || null,
        woodTypeEn: parsed.data.woodTypeEn || null,
        material: parsed.data.material || null,
        materialEn: parsed.data.materialEn || null,
        dimensions: parsed.data.dimensions || null,
        dimensionsEn: parsed.data.dimensionsEn || null,
        finish: parsed.data.finish || null,
        finishEn: parsed.data.finishEn || null,
        featured: parsed.data.featured,
        active: parsed.data.active,
        sortOrder: parsed.data.sortOrder,
        categoryId: parsed.data.categoryId || null,
        images: {
          deleteMany: {},
          create: parsed.data.galleryUrls.map((url, index) => ({
            url,
            sortOrder: index,
          })),
        },
        relatedProducts: {
          set: relatedIds.map((id) => ({ id })),
        },
      },
      select: { slug: true },
    });

    revalidatePath("/");
    revalidatePath("/en");
    revalidatePath("/products");
    revalidatePath("/en/products");
    revalidatePath(`/products/${existing.slug}`);
    revalidatePath(`/en/products/${existing.slug}`);
    revalidatePath(`/products/${updated.slug}`);
    revalidatePath(`/en/products/${updated.slug}`);
    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product updated successfully.",
    };
  } catch (error) {
    logError("Failed to update product.", {
      error: getSafeErrorMessage(error),
      productId,
    });
    return {
      error: toUserFacingError(error, "Failed to update product."),
    };
  }
}

export async function deleteProductAction(productId: string): Promise<ActionResult> {
  try {
    await ensureAdmin();

    const existing = await db.product.findUnique({
      where: { id: productId },
      select: { slug: true },
    });

    if (!existing) {
      return { error: "Product not found." };
    }

    await db.product.delete({
      where: { id: productId },
    });

    revalidatePath("/");
    revalidatePath("/en");
    revalidatePath("/products");
    revalidatePath("/en/products");
    revalidatePath(`/products/${existing.slug}`);
    revalidatePath(`/en/products/${existing.slug}`);
    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product deleted.",
    };
  } catch (error) {
    logError("Failed to delete product.", {
      error: getSafeErrorMessage(error),
      productId,
    });
    return {
      error: toUserFacingError(error, "Failed to delete product."),
    };
  }
}

export async function toggleProductActiveAction(
  productId: string,
  active: boolean,
): Promise<ActionResult> {
  try {
    await ensureAdmin();

    await db.product.update({
      where: { id: productId },
      data: { active },
    });

    revalidatePath("/");
    revalidatePath("/en");
    revalidatePath("/products");
    revalidatePath("/en/products");
    revalidatePath("/admin/products");

    return {
      success: true,
      message: active ? "Product activated." : "Product deactivated.",
    };
  } catch (error) {
    logError("Failed to toggle product status.", {
      error: getSafeErrorMessage(error),
      productId,
    });
    return {
      error: toUserFacingError(error, "Failed to update status."),
    };
  }
}
