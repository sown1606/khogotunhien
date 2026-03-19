import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { logError } from "@/lib/logger";

const visitPayloadSchema = z.object({
  path: z.string().trim().min(1).max(191),
  locale: z.enum(["vi", "en"]).optional(),
  referrer: z.string().trim().max(191).optional(),
});

function getRequestIpAddress(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || null;
  }

  return request.headers.get("x-real-ip");
}

export async function POST(request: Request) {
  const rawBody = await request.json().catch(() => null);
  const parsed = visitPayloadSchema.safeParse(rawBody);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload." }, { status: 400 });
  }

  try {
    await db.visitLog.create({
      data: {
        path: parsed.data.path,
        locale: parsed.data.locale || "vi",
        referrer: parsed.data.referrer || request.headers.get("referer") || null,
        userAgent: request.headers.get("user-agent"),
        ipAddress: getRequestIpAddress(request),
      },
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    logError("Failed to persist visit tracking event.", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ ok: false }, { status: 202 });
  }
}
