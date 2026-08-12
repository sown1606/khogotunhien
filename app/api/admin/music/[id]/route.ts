import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { getSafeErrorMessage, toUserFacingError } from "@/lib/server-errors";
import { musicTrackPatchSchema, normalizeMusicTrackPayload } from "@/lib/validators/music";

function revalidateMusicPaths() {
  revalidatePath("/", "layout");
  revalidatePath("/en", "layout");
  revalidatePath("/admin/music");
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
    const json = (await request.json()) as Record<string, unknown>;
    const normalized = normalizeMusicTrackPayload(json);
    const payload = {
      ...(json.title !== undefined ? { title: normalized.title } : {}),
      ...(json.youtubeUrl !== undefined ? { youtubeUrl: normalized.youtubeUrl } : {}),
      ...(json.active !== undefined ? { active: normalized.active } : {}),
      ...(json.sortOrder !== undefined ? { sortOrder: normalized.sortOrder } : {}),
    };
    const parsed = musicTrackPatchSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid music track." },
        { status: 400 },
      );
    }

    const track = await db.musicTrack.update({
      where: { id },
      data: parsed.data,
    });

    revalidateMusicPaths();

    return NextResponse.json({ track });
  } catch (error) {
    logError("Failed to update music track.", {
      error: getSafeErrorMessage(error),
    });
    return NextResponse.json(
      { error: toUserFacingError(error, "Failed to update music track.") },
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

    await db.musicTrack.delete({
      where: { id },
    });

    revalidateMusicPaths();

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Failed to delete music track.", {
      error: getSafeErrorMessage(error),
    });
    return NextResponse.json(
      { error: toUserFacingError(error, "Failed to delete music track.") },
      { status: 500 },
    );
  }
}
