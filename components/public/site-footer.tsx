import Link from "next/link";
import Image from "next/image";
import { Facebook, MessageCircle, Phone, Timer, Music2 } from "lucide-react";

import { normalizePhoneLink } from "@/lib/utils";
import { type Locale, t, withLocalePath } from "@/lib/i18n";

type SiteFooterProps = {
  companyName: string;
  companyDescription?: string | null;
  logoUrl?: string | null;
  address?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  zaloLink?: string | null;
  facebookLink?: string | null;
  tiktokLink?: string | null;
  footerContent?: string | null;
  openingHours?: string | null;
  locale?: Locale;
};

export function SiteFooter({
  companyName,
  companyDescription,
  logoUrl,
  address,
  email,
  phoneNumber,
  zaloLink,
  facebookLink,
  tiktokLink,
  footerContent,
  openingHours,
  locale = "vi",
}: SiteFooterProps) {
  return (
    <footer className="mt-24 border-t border-stone-300 bg-[#f1ebe3]">
      <div className="mx-auto grid max-w-[1520px] gap-8 px-4 py-12 lg:grid-cols-12 lg:px-8">
        <div className="space-y-3 lg:col-span-5">
          <Image
            src={logoUrl || "/brand/logo-horizontal.svg"}
            alt={companyName}
            width={920}
            height={260}
            className="h-10 w-auto max-w-[260px] object-contain"
          />
          <p className="text-3xl font-semibold leading-none text-[var(--wood-900)]">{companyName}</p>
          <p className="max-w-lg text-sm text-stone-700">
            {companyDescription ||
              t(
                locale,
                "Giải pháp gỗ cao cấp và thi công theo yêu cầu cho không gian hiện đại.",
                "Premium wood products and bespoke material solutions for modern spaces.",
              )}
          </p>
          {footerContent ? <p className="text-sm text-stone-600">{footerContent}</p> : null}
        </div>

        <div className="space-y-3 lg:col-span-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-stone-600">
            {t(locale, "Thông tin liên hệ", "Contact information")}
          </h3>
          <div className="space-y-2 text-sm text-stone-700">
            {address ? <p>{address}</p> : null}
            {email ? (
              <p>
                <a className="hover:text-amber-900" href={`mailto:${email}`}>
                  {email}
                </a>
              </p>
            ) : null}
            {phoneNumber ? (
              <p>
                <a className="hover:text-amber-900" href={normalizePhoneLink(phoneNumber)}>
                  {phoneNumber}
                </a>
              </p>
            ) : null}
            {openingHours ? (
              <p className="inline-flex items-center gap-1.5">
                <Timer className="size-4 text-stone-500" />
                {openingHours}
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-3 lg:col-span-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-stone-600">
            {t(locale, "Liên kết nhanh", "Quick links")}
          </h3>
          <div className="grid gap-2 text-sm text-stone-700">
            <Link href={withLocalePath(locale, "/products")} className="hover:text-amber-900">
              {t(locale, "Tất cả sản phẩm", "All products")}
            </Link>
            <Link href={withLocalePath(locale, "/categories")} className="hover:text-amber-900">
              {t(locale, "Danh mục", "Categories")}
            </Link>
            <Link href={withLocalePath(locale, "/about")} className="hover:text-amber-900">
              {t(locale, "Giới thiệu", "About us")}
            </Link>
            <Link href={withLocalePath(locale, "/contact")} className="hover:text-amber-900">
              {t(locale, "Liên hệ", "Contact")}
            </Link>
          </div>

          <div className="flex items-center gap-2 pt-2">
            {zaloLink ? (
              <Link
                href={zaloLink}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-stone-300 p-2 text-stone-700 transition hover:border-amber-500 hover:text-amber-900"
              >
                <MessageCircle className="size-4" />
              </Link>
            ) : null}
            {phoneNumber ? (
              <a
                href={normalizePhoneLink(phoneNumber)}
                className="rounded-full border border-stone-300 p-2 text-stone-700 transition hover:border-amber-500 hover:text-amber-900"
              >
                <Phone className="size-4" />
              </a>
            ) : null}
            {facebookLink ? (
              <Link
                href={facebookLink}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-stone-300 p-2 text-stone-700 transition hover:border-amber-500 hover:text-amber-900"
              >
                <Facebook className="size-4" />
              </Link>
            ) : null}
            {tiktokLink ? (
              <Link
                href={tiktokLink}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-stone-300 p-2 text-stone-700 transition hover:border-amber-500 hover:text-amber-900"
              >
                <Music2 className="size-4" />
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
}
