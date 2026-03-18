"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ActionResult } from "@/lib/actions/types";
import { normalizeSettingsPayload, settingsSchema } from "@/lib/validators/settings";

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
}

export async function updateSettingsAction(
  _previousState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await ensureAdmin();

    const payload = normalizeSettingsPayload({
      companyName: formData.get("companyName"),
      companyDescription: formData.get("companyDescription"),
      address: formData.get("address"),
      phoneNumber: formData.get("phoneNumber"),
      email: formData.get("email"),
      zaloLink: formData.get("zaloLink"),
      facebookLink: formData.get("facebookLink"),
      tiktokLink: formData.get("tiktokLink"),
      logoUrl: formData.get("logoUrl"),
      faviconUrl: formData.get("faviconUrl"),
      seoTitle: formData.get("seoTitle"),
      seoDescription: formData.get("seoDescription"),
      seoKeywords: formData.get("seoKeywords"),
      footerContent: formData.get("footerContent"),
      openingHours: formData.get("openingHours"),
      contactPrimaryLabel: formData.get("contactPrimaryLabel"),
      contactSecondaryLabel: formData.get("contactSecondaryLabel"),
    });

    const parsed = settingsSchema.safeParse(payload);

    if (!parsed.success) {
      return {
        error: "Please review settings fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    await db.siteSetting.upsert({
      where: { id: "default" },
      update: {
        ...parsed.data,
        companyDescription: parsed.data.companyDescription || null,
        address: parsed.data.address || null,
        phoneNumber: parsed.data.phoneNumber || null,
        email: parsed.data.email || null,
        zaloLink: parsed.data.zaloLink || null,
        facebookLink: parsed.data.facebookLink || null,
        tiktokLink: parsed.data.tiktokLink || null,
        logoUrl: parsed.data.logoUrl || null,
        faviconUrl: parsed.data.faviconUrl || null,
        seoTitle: parsed.data.seoTitle || null,
        seoDescription: parsed.data.seoDescription || null,
        seoKeywords: parsed.data.seoKeywords || null,
        footerContent: parsed.data.footerContent || null,
        openingHours: parsed.data.openingHours || null,
        contactPrimaryLabel: parsed.data.contactPrimaryLabel || "Contact via Zalo",
        contactSecondaryLabel: parsed.data.contactSecondaryLabel || "Call now",
      },
      create: {
        id: "default",
        ...parsed.data,
      },
    });

    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/contact");
    revalidatePath("/about");
    revalidatePath("/admin/settings");

    return {
      success: true,
      message: "Settings saved.",
    };
  } catch (error) {
    console.error(error);
    return { error: "Failed to update settings." };
  }
}
