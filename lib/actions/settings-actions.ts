"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ActionResult } from "@/lib/actions/types";
import { logError } from "@/lib/logger";
import { getSafeErrorMessage, toUserFacingError } from "@/lib/server-errors";
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
      companyDescriptionEn: formData.get("companyDescriptionEn"),
      address: formData.get("address"),
      addressEn: formData.get("addressEn"),
      phoneNumber: formData.get("phoneNumber"),
      email: formData.get("email"),
      zaloLink: formData.get("zaloLink"),
      facebookLink: formData.get("facebookLink"),
      tiktokLink: formData.get("tiktokLink"),
      logoUrl: formData.get("logoUrl"),
      faviconUrl: formData.get("faviconUrl"),
      seoTitle: formData.get("seoTitle"),
      seoTitleEn: formData.get("seoTitleEn"),
      seoDescription: formData.get("seoDescription"),
      seoDescriptionEn: formData.get("seoDescriptionEn"),
      seoKeywords: formData.get("seoKeywords"),
      footerContent: formData.get("footerContent"),
      footerContentEn: formData.get("footerContentEn"),
      openingHours: formData.get("openingHours"),
      openingHoursEn: formData.get("openingHoursEn"),
      contactPrimaryLabel: formData.get("contactPrimaryLabel"),
      contactPrimaryLabelEn: formData.get("contactPrimaryLabelEn"),
      contactSecondaryLabel: formData.get("contactSecondaryLabel"),
      contactSecondaryLabelEn: formData.get("contactSecondaryLabelEn"),
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
        companyDescriptionEn: parsed.data.companyDescriptionEn || null,
        address: parsed.data.address || null,
        addressEn: parsed.data.addressEn || null,
        phoneNumber: parsed.data.phoneNumber || null,
        email: parsed.data.email || null,
        zaloLink: parsed.data.zaloLink || null,
        facebookLink: parsed.data.facebookLink || null,
        tiktokLink: parsed.data.tiktokLink || null,
        logoUrl: parsed.data.logoUrl || null,
        faviconUrl: parsed.data.faviconUrl || null,
        seoTitle: parsed.data.seoTitle || null,
        seoTitleEn: parsed.data.seoTitleEn || null,
        seoDescription: parsed.data.seoDescription || null,
        seoDescriptionEn: parsed.data.seoDescriptionEn || null,
        seoKeywords: parsed.data.seoKeywords || null,
        footerContent: parsed.data.footerContent || null,
        footerContentEn: parsed.data.footerContentEn || null,
        openingHours: parsed.data.openingHours || null,
        openingHoursEn: parsed.data.openingHoursEn || null,
        contactPrimaryLabel: parsed.data.contactPrimaryLabel || "Contact via Zalo",
        contactPrimaryLabelEn: parsed.data.contactPrimaryLabelEn || null,
        contactSecondaryLabel: parsed.data.contactSecondaryLabel || "Call now",
        contactSecondaryLabelEn: parsed.data.contactSecondaryLabelEn || null,
      },
      create: {
        id: "default",
        ...parsed.data,
      },
    });

    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/en");
    revalidatePath("/contact");
    revalidatePath("/en/contact");
    revalidatePath("/about");
    revalidatePath("/en/about");
    revalidatePath("/products");
    revalidatePath("/en/products");
    revalidatePath("/categories");
    revalidatePath("/en/categories");
    revalidatePath("/admin/settings");

    return {
      success: true,
      message: "Settings saved.",
    };
  } catch (error) {
    logError("Failed to update website settings.", {
      error: getSafeErrorMessage(error),
    });
    return { error: toUserFacingError(error, "Failed to update settings.") };
  }
}
