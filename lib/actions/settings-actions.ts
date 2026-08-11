"use server";

import { HomepageSectionType } from "@prisma/client";
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

const HOMEPAGE_HERO_IMAGES_SECTION_SLUG = "homepage-hero-images";

async function saveHomepageHeroImages(heroMainImageUrl: string, heroDetailImageUrl: string) {
  const section = await db.homepageSection.upsert({
    where: { slug: HOMEPAGE_HERO_IMAGES_SECTION_SLUG },
    update: {
      title: "Homepage hero images",
      titleEn: "Homepage hero images",
      description: "Hidden section used by website settings for homepage hero images.",
      descriptionEn: "Hidden section used by website settings for homepage hero images.",
      type: HomepageSectionType.CUSTOM,
      visible: false,
      sortOrder: 9999,
    },
    create: {
      title: "Homepage hero images",
      titleEn: "Homepage hero images",
      slug: HOMEPAGE_HERO_IMAGES_SECTION_SLUG,
      description: "Hidden section used by website settings for homepage hero images.",
      descriptionEn: "Hidden section used by website settings for homepage hero images.",
      type: HomepageSectionType.CUSTOM,
      visible: false,
      sortOrder: 9999,
    },
    select: { id: true },
  });

  await db.homepageSectionItem.deleteMany({
    where: { sectionId: section.id },
  });

  const heroItems = [
    {
      customTitle: "Main hero image",
      customTitleEn: "Main hero image",
      imageUrl: heroMainImageUrl || null,
      sortOrder: 1,
    },
    {
      customTitle: "Detail hero image",
      customTitleEn: "Detail hero image",
      imageUrl: heroDetailImageUrl || null,
      sortOrder: 2,
    },
  ].filter((item) => Boolean(item.imageUrl));

  if (!heroItems.length) return;

  await db.homepageSectionItem.createMany({
    data: heroItems.map((item) => ({
      sectionId: section.id,
      customTitle: item.customTitle,
      customTitleEn: item.customTitleEn,
      imageUrl: item.imageUrl,
      active: true,
      sortOrder: item.sortOrder,
    })),
  });
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
      heroMainImageUrl: formData.get("heroMainImageUrl"),
      heroDetailImageUrl: formData.get("heroDetailImageUrl"),
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
      leadPopupEnabled: formData.get("leadPopupEnabled"),
      leadPopupDelaySeconds: formData.get("leadPopupDelaySeconds"),
      leadPopupTitle: formData.get("leadPopupTitle"),
      leadPopupTitleEn: formData.get("leadPopupTitleEn"),
      leadPopupDescription: formData.get("leadPopupDescription"),
      leadPopupDescriptionEn: formData.get("leadPopupDescriptionEn"),
    });

    const parsed = settingsSchema.safeParse(payload);

    if (!parsed.success) {
      return {
        error: "Please review settings fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const { heroMainImageUrl, heroDetailImageUrl } = parsed.data;
    const settingsData = {
      companyName: parsed.data.companyName,
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
      leadPopupEnabled: parsed.data.leadPopupEnabled,
      leadPopupDelaySeconds: parsed.data.leadPopupDelaySeconds,
      leadPopupTitle: parsed.data.leadPopupTitle || null,
      leadPopupTitleEn: parsed.data.leadPopupTitleEn || null,
      leadPopupDescription: parsed.data.leadPopupDescription || null,
      leadPopupDescriptionEn: parsed.data.leadPopupDescriptionEn || null,
    };

    await db.siteSetting.upsert({
      where: { id: "default" },
      update: settingsData,
      create: {
        id: "default",
        ...settingsData,
      },
    });
    await saveHomepageHeroImages(heroMainImageUrl || "", heroDetailImageUrl || "");

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
