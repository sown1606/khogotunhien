import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

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

    await db.category.update({
      where: { id },
      data: {
        active: parsed.data.active,
        featured: parsed.data.featured,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Failed to update category via API.", {
      error: getSafeErrorMessage(error),
    });
    return NextResponse.json(
      { error: toUserFacingError(error, "Failed to update category.") },
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

    await db.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Failed to delete category via API.", {
      error: getSafeErrorMessage(error),
    });
    return NextResponse.json(
      { error: toUserFacingError(error, "Failed to delete category.") },
      { status: 500 },
    );
  }
}
