import { z } from "zod";

export const settingsSchema = z.object({
  companyName: z.string().min(2).max(160),
  companyDescription: z.string().max(2000).optional().or(z.literal("")),
  companyDescriptionEn: z.string().max(2000).optional().or(z.literal("")),
  address: z.string().max(240).optional().or(z.literal("")),
  addressEn: z.string().max(240).optional().or(z.literal("")),
  phoneNumber: z.string().max(60).optional().or(z.literal("")),
  email: z.email().optional().or(z.literal("")),
  zaloLink: z.url().optional().or(z.literal("")),
  facebookLink: z.url().optional().or(z.literal("")),
  tiktokLink: z.url().optional().or(z.literal("")),
  logoUrl: z.string().max(500).optional().or(z.literal("")),
  faviconUrl: z.string().max(500).optional().or(z.literal("")),
  seoTitle: z.string().max(160).optional().or(z.literal("")),
  seoTitleEn: z.string().max(160).optional().or(z.literal("")),
  seoDescription: z.string().max(320).optional().or(z.literal("")),
  seoDescriptionEn: z.string().max(320).optional().or(z.literal("")),
  seoKeywords: z.string().max(320).optional().or(z.literal("")),
  footerContent: z.string().max(2000).optional().or(z.literal("")),
  footerContentEn: z.string().max(2000).optional().or(z.literal("")),
  openingHours: z.string().max(120).optional().or(z.literal("")),
  openingHoursEn: z.string().max(120).optional().or(z.literal("")),
  contactPrimaryLabel: z.string().max(80).optional().or(z.literal("")),
  contactPrimaryLabelEn: z.string().max(80).optional().or(z.literal("")),
  contactSecondaryLabel: z.string().max(80).optional().or(z.literal("")),
  contactSecondaryLabelEn: z.string().max(80).optional().or(z.literal("")),
  leadPopupEnabled: z.boolean().default(true),
  leadPopupDelaySeconds: z.number().int().min(5).max(300).default(25),
  leadPopupTitle: z.string().max(120).optional().or(z.literal("")),
  leadPopupTitleEn: z.string().max(120).optional().or(z.literal("")),
  leadPopupDescription: z.string().max(2000).optional().or(z.literal("")),
  leadPopupDescriptionEn: z.string().max(2000).optional().or(z.literal("")),
});

export function normalizeSettingsPayload(payload: Partial<Record<string, unknown>>) {
  const popupDelayRaw = Number(payload.leadPopupDelaySeconds ?? 25);
  const popupDelay = Number.isFinite(popupDelayRaw) ? popupDelayRaw : 25;

  return {
    companyName: String(payload.companyName ?? "").trim(),
    companyDescription: String(payload.companyDescription ?? "").trim(),
    companyDescriptionEn: String(payload.companyDescriptionEn ?? "").trim(),
    address: String(payload.address ?? "").trim(),
    addressEn: String(payload.addressEn ?? "").trim(),
    phoneNumber: String(payload.phoneNumber ?? "").trim(),
    email: String(payload.email ?? "").trim(),
    zaloLink: String(payload.zaloLink ?? "").trim(),
    facebookLink: String(payload.facebookLink ?? "").trim(),
    tiktokLink: String(payload.tiktokLink ?? "").trim(),
    logoUrl: String(payload.logoUrl ?? "").trim(),
    faviconUrl: String(payload.faviconUrl ?? "").trim(),
    seoTitle: String(payload.seoTitle ?? "").trim(),
    seoTitleEn: String(payload.seoTitleEn ?? "").trim(),
    seoDescription: String(payload.seoDescription ?? "").trim(),
    seoDescriptionEn: String(payload.seoDescriptionEn ?? "").trim(),
    seoKeywords: String(payload.seoKeywords ?? "").trim(),
    footerContent: String(payload.footerContent ?? "").trim(),
    footerContentEn: String(payload.footerContentEn ?? "").trim(),
    openingHours: String(payload.openingHours ?? "").trim(),
    openingHoursEn: String(payload.openingHoursEn ?? "").trim(),
    contactPrimaryLabel: String(payload.contactPrimaryLabel ?? "").trim(),
    contactPrimaryLabelEn: String(payload.contactPrimaryLabelEn ?? "").trim(),
    contactSecondaryLabel: String(payload.contactSecondaryLabel ?? "").trim(),
    contactSecondaryLabelEn: String(payload.contactSecondaryLabelEn ?? "").trim(),
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
