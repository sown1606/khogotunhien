import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { db } from "@/lib/db";
import { logError } from "@/lib/logger";

const resetPasswordSchema = z.object({
  email: z.email().trim(),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  const parsed = resetPasswordSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid payload.",
      },
      { status: 400 },
    );
  }

  try {
    const user = await db.adminUser.findUnique({
      where: { email: parsed.data.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          error: "Admin email not found.",
        },
        { status: 404 },
      );
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);

    await db.adminUser.update({
      where: { id: user.id },
      data: {
        passwordHash,
        active: true,
      },
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    logError("Admin password reset failed.", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        ok: false,
        error: "Database unavailable. Please check DB settings on Hostinger.",
      },
      { status: 503 },
    );
  }
}

