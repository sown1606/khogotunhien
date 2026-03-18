import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { getSafeErrorMessage, toUserFacingError } from "@/lib/server-errors";

const bulkSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(100),
  action: z.enum(["activate", "deactivate", "delete", "feature", "unfeature"]),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = bulkSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  try {
    switch (parsed.data.action) {
      case "activate":
        await db.product.updateMany({
          where: { id: { in: parsed.data.ids } },
          data: { active: true },
        });
        break;
      case "deactivate":
        await db.product.updateMany({
          where: { id: { in: parsed.data.ids } },
          data: { active: false },
        });
        break;
      case "feature":
        await db.product.updateMany({
          where: { id: { in: parsed.data.ids } },
          data: { featured: true },
        });
        break;
      case "unfeature":
        await db.product.updateMany({
          where: { id: { in: parsed.data.ids } },
          data: { featured: false },
        });
        break;
      case "delete":
        await db.product.deleteMany({
          where: { id: { in: parsed.data.ids } },
        });
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Bulk product action failed.", {
      error: getSafeErrorMessage(error),
      action: parsed.data.action,
      idsCount: parsed.data.ids.length,
    });
    return NextResponse.json(
      { error: toUserFacingError(error, "Bulk action failed.") },
      { status: 500 },
    );
  }
}
