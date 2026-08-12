import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { getSafeErrorMessage, toUserFacingError } from "@/lib/server-errors";
import { musicTrackSchema, normalizeMusicTrackPayload } from "@/lib/validators/music";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = (await request.json()) as Record<string, unknown>;
    const parsed = musicTrackSchema.safeParse(normalizeMusicTrackPayload(json));

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid music track." },
        { status: 400 },
      );
    }

    const track = await db.musicTrack.create({
      data: parsed.data,
    });

    revalidatePath("/", "layout");
    revalidatePath("/en", "layout");
    revalidatePath("/admin/music");

    return NextResponse.json({ track });
  } catch (error) {
    logError("Failed to create music track.", {
      error: getSafeErrorMessage(error),
    });
    return NextResponse.json(
      { error: toUserFacingError(error, "Failed to create music track.") },
      { status: 500 },
    );
  }
}
