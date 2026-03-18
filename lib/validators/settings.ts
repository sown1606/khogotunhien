import { z } from "zod";

export const settingsSchema = z.object({
  companyName: z.string().min(2).max(160),
  companyDescription: z.string().max(2000).optional().or(z.literal("")),
  address: z.string().max(240).optional().or(z.literal("")),
  phoneNumber: z.string().max(60).optional().or(z.literal("")),
  email: z.email().optional().or(z.literal("")),
  zaloLink: z.url().optional().or(z.literal("")),
  facebookLink: z.url().optional().or(z.literal("")),
  tiktokLink: z.url().optional().or(z.literal("")),
  logoUrl: z.string().max(500).optional().or(z.literal("")),
  faviconUrl: z.string().max(500).optional().or(z.literal("")),
  seoTitle: z.string().max(160).optional().or(z.literal("")),
  seoDescription: z.string().max(320).optional().or(z.literal("")),
  seoKeywords: z.string().max(320).optional().or(z.literal("")),
  footerContent: z.string().max(2000).optional().or(z.literal("")),
  openingHours: z.string().max(120).optional().or(z.literal("")),
  contactPrimaryLabel: z.string().max(80).optional().or(z.literal("")),
  contactSecondaryLabel: z.string().max(80).optional().or(z.literal("")),
});

export function normalizeSettingsPayload(payload: Partial<Record<string, unknown>>) {
  return {
    companyName: String(payload.companyName ?? "").trim(),
    companyDescription: String(payload.companyDescription ?? "").trim(),
    address: String(payload.address ?? "").trim(),
    phoneNumber: String(payload.phoneNumber ?? "").trim(),
    email: String(payload.email ?? "").trim(),
    zaloLink: String(payload.zaloLink ?? "").trim(),
    facebookLink: String(payload.facebookLink ?? "").trim(),
    tiktokLink: String(payload.tiktokLink ?? "").trim(),
    logoUrl: String(payload.logoUrl ?? "").trim(),
    faviconUrl: String(payload.faviconUrl ?? "").trim(),
    seoTitle: String(payload.seoTitle ?? "").trim(),
    seoDescription: String(payload.seoDescription ?? "").trim(),
    seoKeywords: String(payload.seoKeywords ?? "").trim(),
    footerContent: String(payload.footerContent ?? "").trim(),
    openingHours: String(payload.openingHours ?? "").trim(),
    contactPrimaryLabel: String(payload.contactPrimaryLabel ?? "").trim(),
    contactSecondaryLabel: String(payload.contactSecondaryLabel ?? "").trim(),
  };
}
