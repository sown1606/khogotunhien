import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { logError } from "@/lib/logger";

const leadPayloadSchema = z
  .object({
    name: z.string().trim().max(120).optional(),
    email: z.email().max(191).optional(),
    phone: z.string().trim().min(6).max(40).optional(),
    message: z.string().trim().max(1000).optional(),
    sourcePath: z.string().trim().max(191).optional(),
    locale: z.enum(["vi", "en"]).optional(),
  })
  .superRefine((value, context) => {
    if (!value.email && !value.phone) {
      context.addIssue({
        code: "custom",
        path: ["phone"],
        message: "Provide at least email or phone.",
      });
    }
  });

export async function POST(request: Request) {
  const rawBody = await request.json().catch(() => null);
  const parsed = leadPayloadSchema.safeParse(rawBody);

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
    await db.leadCapture.create({
      data: {
        name: parsed.data.name || null,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
        message: parsed.data.message || null,
        sourcePath: parsed.data.sourcePath || null,
        locale: parsed.data.locale || "vi",
      },
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    logError("Failed to persist lead capture.", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json({ ok: false }, { status: 202 });
  }
}
