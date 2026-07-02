import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { getSafeErrorMessage, toUserFacingError } from "@/lib/server-errors";

const updateSchema = z
  .object({
    active: z.boolean().optional(),
    featured: z.boolean().optional(),
  })
  .refine((value) => typeof value.active === "boolean" || typeof value.featured === "boolean", {
    message: "Nothing to update.",
  });

function revalidateProductCatalogPaths(productSlug?: string | null, categorySlug?: string | null) {
  revalidatePath("/");
  revalidatePath("/en");
  revalidatePath("/products");
  revalidatePath("/en/products");
  revalidatePath("/categories");
  revalidatePath("/en/categories");
  revalidatePath("/admin/products");

  if (productSlug) {
    revalidatePath(`/products/${productSlug}`);
    revalidatePath(`/en/products/${productSlug}`);
  }

  if (categorySlug) {
    revalidatePath(`/categories/${categorySlug}`);
    revalidatePath(`/en/categories/${categorySlug}`);
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const json = await request.json();
    const parsed = updateSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    const updated = await db.product.update({
      where: { id },
      data: {
        active: parsed.data.active,
        featured: parsed.data.featured,
      },
      select: {
        slug: true,
        category: {
          select: { slug: true },
        },
      },
    });

    revalidateProductCatalogPaths(updated.slug, updated.category?.slug);

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Failed to update product via API.", {
      error: getSafeErrorMessage(error),
    });
    return NextResponse.json(
      { error: toUserFacingError(error, "Failed to update product.") },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const existing = await db.product.findUnique({
      where: { id },
      select: {
        slug: true,
        category: {
          select: { slug: true },
        },
      },
    });

    await db.product.delete({
      where: { id },
    });

    revalidateProductCatalogPaths(existing?.slug, existing?.category?.slug);

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Failed to delete product via API.", {
      error: getSafeErrorMessage(error),
    });
    return NextResponse.json(
      { error: toUserFacingError(error, "Failed to delete product.") },
      { status: 500 },
    );
  }
}
