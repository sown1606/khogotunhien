"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ActionResult } from "@/lib/actions/types";
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
      slug: formData.get("slug"),
      shortDescription: formData.get("shortDescription"),
      description: formData.get("description"),
      thumbnailUrl: formData.get("thumbnailUrl"),
      woodType: formData.get("woodType"),
      material: formData.get("material"),
      dimensions: formData.get("dimensions"),
      finish: formData.get("finish"),
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
        slug: parsed.data.slug,
        shortDescription: parsed.data.shortDescription || null,
        description: parsed.data.description || null,
        thumbnailUrl: parsed.data.thumbnailUrl || parsed.data.galleryUrls[0] || null,
        woodType: parsed.data.woodType || null,
        material: parsed.data.material || null,
        dimensions: parsed.data.dimensions || null,
        finish: parsed.data.finish || null,
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
    revalidatePath("/products");
    revalidatePath(`/products/${created.slug}`);
    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product created successfully.",
    };
  } catch (error) {
    console.error(error);
    return {
      error: "Failed to create product.",
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
      slug: formData.get("slug"),
      shortDescription: formData.get("shortDescription"),
      description: formData.get("description"),
      thumbnailUrl: formData.get("thumbnailUrl"),
      woodType: formData.get("woodType"),
      material: formData.get("material"),
      dimensions: formData.get("dimensions"),
      finish: formData.get("finish"),
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
        slug: parsed.data.slug,
        shortDescription: parsed.data.shortDescription || null,
        description: parsed.data.description || null,
        thumbnailUrl: parsed.data.thumbnailUrl || parsed.data.galleryUrls[0] || null,
        woodType: parsed.data.woodType || null,
        material: parsed.data.material || null,
        dimensions: parsed.data.dimensions || null,
        finish: parsed.data.finish || null,
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
    revalidatePath("/products");
    revalidatePath(`/products/${existing.slug}`);
    revalidatePath(`/products/${updated.slug}`);
    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product updated successfully.",
    };
  } catch (error) {
    console.error(error);
    return {
      error: "Failed to update product.",
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
    revalidatePath("/products");
    revalidatePath(`/products/${existing.slug}`);
    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product deleted.",
    };
  } catch (error) {
    console.error(error);
    return {
      error: "Failed to delete product.",
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
    revalidatePath("/products");
    revalidatePath("/admin/products");

    return {
      success: true,
      message: active ? "Product activated." : "Product deactivated.",
    };
  } catch (error) {
    console.error(error);
    return {
      error: "Failed to update status.",
    };
  }
}
