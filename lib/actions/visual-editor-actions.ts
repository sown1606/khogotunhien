"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { z } from "zod";

import type { ActionResult } from "@/lib/actions/types";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { getSafeErrorMessage, toUserFacingError } from "@/lib/server-errors";

const visualEditorSchema = z.object({
  companyName: z.string().min(2).max(160),
  companyDescription: z.string().max(2000).optional().or(z.literal("")),
  companyDescriptionEn: z.string().max(2000).optional().or(z.literal("")),
  phoneNumber: z.string().max(60).optional().or(z.literal("")),
  email: z.email().optional().or(z.literal("")),
  zaloLink: z.url().optional().or(z.literal("")),
  logoUrl: z.string().max(500).optional().or(z.literal("")),
  contactPrimaryLabel: z.string().max(80).optional().or(z.literal("")),
  contactSecondaryLabel: z.string().max(80).optional().or(z.literal("")),
  leadPopupEnabled: z.boolean().default(true),
  leadPopupDelaySeconds: z.number().int().min(5).max(300).default(25),
  leadPopupTitle: z.string().max(120).optional().or(z.literal("")),
  leadPopupTitleEn: z.string().max(120).optional().or(z.literal("")),
  leadPopupDescription: z.string().max(2000).optional().or(z.literal("")),
  leadPopupDescriptionEn: z.string().max(2000).optional().or(z.literal("")),
});

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
}

function normalizeVisualEditorPayload(payload: Partial<Record<string, unknown>>) {
  const popupDelayRaw = Number(payload.leadPopupDelaySeconds ?? 25);
  const popupDelay = Number.isFinite(popupDelayRaw) ? popupDelayRaw : 25;

  return {
    companyName: String(payload.companyName ?? "").trim(),
    companyDescription: String(payload.companyDescription ?? "").trim(),
    companyDescriptionEn: String(payload.companyDescriptionEn ?? "").trim(),
    phoneNumber: String(payload.phoneNumber ?? "").trim(),
    email: String(payload.email ?? "").trim(),
    zaloLink: String(payload.zaloLink ?? "").trim(),
    logoUrl: String(payload.logoUrl ?? "").trim(),
    contactPrimaryLabel: String(payload.contactPrimaryLabel ?? "").trim(),
    contactSecondaryLabel: String(payload.contactSecondaryLabel ?? "").trim(),
    leadPopupEnabled:
      payload.leadPopupEnabled === true ||
      payload.leadPopupEnabled === "true" ||
      payload.leadPopupEnabled === "on",
    leadPopupDelaySeconds: popupDelay,
    leadPopupTitle: String(payload.leadPopupTitle ?? "").trim(),
    leadPopupTitleEn: String(payload.leadPopupTitleEn ?? "").trim(),
    leadPopupDescription: String(payload.leadPopupDescription ?? "").trim(),
    leadPopupDescriptionEn: String(payload.leadPopupDescriptionEn ?? "").trim(),
  };
}

export async function saveVisualEditorSettingsAction(
  _previousState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await ensureAdmin();

    const payload = normalizeVisualEditorPayload({
      companyName: formData.get("companyName"),
      companyDescription: formData.get("companyDescription"),
      companyDescriptionEn: formData.get("companyDescriptionEn"),
      phoneNumber: formData.get("phoneNumber"),
      email: formData.get("email"),
      zaloLink: formData.get("zaloLink"),
      logoUrl: formData.get("logoUrl"),
      contactPrimaryLabel: formData.get("contactPrimaryLabel"),
      contactSecondaryLabel: formData.get("contactSecondaryLabel"),
      leadPopupEnabled: formData.get("leadPopupEnabled"),
      leadPopupDelaySeconds: formData.get("leadPopupDelaySeconds"),
      leadPopupTitle: formData.get("leadPopupTitle"),
      leadPopupTitleEn: formData.get("leadPopupTitleEn"),
      leadPopupDescription: formData.get("leadPopupDescription"),
      leadPopupDescriptionEn: formData.get("leadPopupDescriptionEn"),
    });

    const parsed = visualEditorSchema.safeParse(payload);

    if (!parsed.success) {
      return {
        error: "Please review the visual editor fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    await db.siteSetting.upsert({
      where: { id: "default" },
      update: {
        companyName: parsed.data.companyName,
        companyDescription: parsed.data.companyDescription || null,
        companyDescriptionEn: parsed.data.companyDescriptionEn || null,
        phoneNumber: parsed.data.phoneNumber || null,
        email: parsed.data.email || null,
        zaloLink: parsed.data.zaloLink || null,
        logoUrl: parsed.data.logoUrl || null,
        contactPrimaryLabel: parsed.data.contactPrimaryLabel || "Nhắn Zalo",
        contactSecondaryLabel: parsed.data.contactSecondaryLabel || "Gọi ngay",
        leadPopupEnabled: parsed.data.leadPopupEnabled,
        leadPopupDelaySeconds: parsed.data.leadPopupDelaySeconds,
        leadPopupTitle: parsed.data.leadPopupTitle || null,
        leadPopupTitleEn: parsed.data.leadPopupTitleEn || null,
        leadPopupDescription: parsed.data.leadPopupDescription || null,
        leadPopupDescriptionEn: parsed.data.leadPopupDescriptionEn || null,
      },
      create: {
        id: "default",
        companyName: parsed.data.companyName,
        companyDescription: parsed.data.companyDescription || null,
        companyDescriptionEn: parsed.data.companyDescriptionEn || null,
        phoneNumber: parsed.data.phoneNumber || null,
        email: parsed.data.email || null,
        zaloLink: parsed.data.zaloLink || null,
        logoUrl: parsed.data.logoUrl || null,
        contactPrimaryLabel: parsed.data.contactPrimaryLabel || "Nhắn Zalo",
        contactSecondaryLabel: parsed.data.contactSecondaryLabel || "Gọi ngay",
        leadPopupEnabled: parsed.data.leadPopupEnabled,
        leadPopupDelaySeconds: parsed.data.leadPopupDelaySeconds,
        leadPopupTitle: parsed.data.leadPopupTitle || null,
        leadPopupTitleEn: parsed.data.leadPopupTitleEn || null,
        leadPopupDescription: parsed.data.leadPopupDescription || null,
        leadPopupDescriptionEn: parsed.data.leadPopupDescriptionEn || null,
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
    revalidatePath("/admin/visual-editor");
    revalidatePath("/admin/settings");

    return {
      success: true,
      message: "Visual editor changes saved.",
    };
  } catch (error) {
    logError("Failed to save visual editor settings.", {
      error: getSafeErrorMessage(error),
    });
    return { error: toUserFacingError(error, "Failed to save visual editor changes.") };
  }
}

