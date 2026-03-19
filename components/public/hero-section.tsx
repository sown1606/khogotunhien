"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Phone, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/public/search-input";
import { type Locale, t } from "@/lib/i18n";
import { normalizePhoneLink } from "@/lib/utils";

type HeroSectionProps = {
  companyName: string;
  companyDescription?: string | null;
  phoneNumber?: string | null;
  zaloLink?: string | null;
  locale?: Locale;
};

export function HeroSection({
  companyName,
  companyDescription,
  phoneNumber,
  zaloLink,
  locale = "vi",
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-stone-200 bg-[#fffaf4]">
      <div className="absolute inset-0 bg-[url('/demo/hero/hero-texture.webp')] bg-cover bg-center opacity-[0.1]" />
      <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_0%_0%,rgba(255,239,214,0.9),transparent_46%),radial-gradient(780px_circle_at_100%_30%,rgba(228,200,165,0.5),transparent_44%)]" />
      <div className="absolute right-4 top-4 z-10 hidden items-center gap-2 md:flex">
        {zaloLink ? (
          <Button asChild size="sm">
            <Link href={zaloLink} target="_blank" rel="noreferrer">
              <MessageCircle className="size-4" />
              {t(locale, "Nhắn tin", "Message")}
            </Link>
          </Button>
        ) : null}
        {phoneNumber ? (
          <Button asChild size="sm" variant="secondary">
            <a href={normalizePhoneLink(phoneNumber)}>
              <Phone className="size-4" />
              {t(locale, "Gọi ngay", "Call now")}
            </a>
          </Button>
        ) : null}
      </div>
      <div className="relative grid items-center gap-8 px-5 py-8 md:px-8 md:py-10 lg:grid-cols-12 lg:gap-10 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="space-y-6 lg:col-span-7"
        >
          <p className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/70 bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--wood-800)]">
            <Sparkles className="size-3.5" />
            {t(locale, "Bộ sưu tập gỗ tự nhiên", "Natural wood collection")}
          </p>
          <h1 className="max-w-2xl text-4xl leading-[1.06] text-[var(--wood-900)] sm:text-5xl lg:text-[3.4rem]">
            {t(
              locale,
              `Không gian gỗ thủ công từ ${companyName}`,
              `Handcrafted wood showcase by ${companyName}`,
            )}
          </h1>
          <p className="max-w-xl text-base text-stone-700 sm:text-lg">
            {companyDescription ||
              t(
                locale,
                "Khám phá các mẫu slab, bàn gỗ thủ công và vật liệu nội thất bằng ảnh thật, hiển thị mượt trên cả mobile và desktop.",
                "Browse slabs, handcrafted wood furniture, and interior materials with rich visuals optimized for mobile and desktop.",
              )}
          </p>

          <SearchInput
            locale={locale}
            className="max-w-2xl"
            placeholder={t(
              locale,
              "Tìm mẫu gỗ, slab, bàn console, panel trang trí...",
              "Search wood slabs, console tables, wall panels...",
            )}
          />

          <p className="max-w-xl text-sm text-stone-600">
            {t(
              locale,
              "Ảnh và dữ liệu sản phẩm được tối ưu để duyệt nhanh, liên hệ báo giá bằng nút góc phải.",
              "Use the top-right quick actions for instant quote support.",
            )}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative lg:col-span-5"
        >
          <div className="relative aspect-[5/4] overflow-hidden rounded-3xl border border-amber-200/60 shadow-[0_24px_60px_-36px_rgba(77,50,31,0.6)]">
            <Image
              src="/demo/hero/wood-hero-main.jpg"
              alt={t(locale, "Không gian gỗ thủ công", "Handcrafted wood space")}
              fill
              priority
              unoptimized
              loading="eager"
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 36vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
            <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-stone-700">
              {t(locale, "Nổi bật", "Featured")}
            </span>
          </div>
          <div className="absolute -bottom-5 right-4 hidden w-40 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl md:block">
            <div className="relative aspect-square">
              <Image
                src="/demo/hero/wood-hero-side-1.jpg"
                alt={t(locale, "Bàn gỗ nguyên tấm", "Natural slab table")}
                fill
                unoptimized
                className="object-cover"
                sizes="180px"
              />
            </div>
          </div>
          <div className="absolute -bottom-4 -left-4 rounded-2xl border border-stone-200 bg-white/95 px-4 py-3 shadow-lg">
            <p className="text-xs uppercase tracking-[0.12em] text-stone-500">
              {t(locale, "Hoàn thiện mượt", "Smooth finish")}
            </p>
            <p className="text-lg font-semibold text-stone-900">
              {t(locale, "Ảnh gỗ thật, phối cảnh thật", "Real wood, real details")}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
