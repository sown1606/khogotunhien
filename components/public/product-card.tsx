"use client";

import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Phone, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { type Locale, t, withLocalePath } from "@/lib/i18n";
import { normalizePhoneLink } from "@/lib/utils";

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    shortDescription: string | null;
    thumbnailUrl: string | null;
    woodType: string | null;
    material: string | null;
    featured?: boolean;
    category?: {
      name: string;
      slug: string;
    } | null;
  };
  phoneNumber?: string | null;
  zaloLink?: string | null;
  compact?: boolean;
  locale?: Locale;
};

function getListingMeta(seed: string) {
  const hash = Array.from(seed).reduce((accumulator, char, index) => {
    return (accumulator + char.charCodeAt(0) * (index + 11)) % 100_000;
  }, 0);
  const rating = Number((4.3 + (hash % 7) * 0.1).toFixed(1));
  const reviews = 28 + (hash % 960);
  const discount = hash % 3 === 0 ? 8 + (hash % 14) : 0;
  const basePrice = 1_190_000 + (hash % 12) * 180_000;
  const comparePrice = discount ? Math.round((basePrice * 100) / (100 - discount)) : 0;

  return {
    rating,
    reviews,
    discount,
    basePrice,
    comparePrice,
    fastShip: hash % 2 === 0,
  };
}

export function ProductCard({ product, phoneNumber, zaloLink, compact, locale = "vi" }: ProductCardProps) {
  const meta = getListingMeta(product.slug || product.id);
  const localizedPrice =
    locale === "en"
      ? `$${Math.round(meta.basePrice / 25_000).toLocaleString("en-US")}`
      : `${meta.basePrice.toLocaleString("vi-VN")}đ`;
  const localizedComparePrice =
    meta.comparePrice > 0
      ? locale === "en"
        ? `$${Math.round(meta.comparePrice / 25_000).toLocaleString("en-US")}`
        : `${meta.comparePrice.toLocaleString("vi-VN")}đ`
      : null;

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="group h-full overflow-hidden rounded-[18px] border border-stone-200 bg-white shadow-[0_14px_32px_-26px_rgba(77,50,31,0.45)]"
    >
      <Link href={withLocalePath(locale, `/products/${product.slug}`)} className="block">
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src={product.thumbnailUrl || "/demo/brand/texture.webp"}
            alt={product.name}
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes={compact ? "(max-width: 768px) 78vw, 24vw" : "(max-width: 768px) 94vw, 24vw"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/0 to-black/5" />
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-stone-700">
            {product.featured ? t(locale, "Phổ biến", "Popular now") : t(locale, "Gợi ý", "Top pick")}
          </span>
        </div>
      </Link>

      <div className="space-y-2 p-3.5">
        <h3 className="line-clamp-2 text-[15px] leading-snug text-stone-900">{product.name}</h3>
        <p className="text-xs text-stone-500">{t(locale, "By DaithienphuWood", "By DaithienphuWood")}</p>
        <div className="flex items-center gap-1 text-xs text-stone-600">
          <Star className="size-3.5 fill-amber-400 text-amber-500" />
          <span className="font-semibold text-stone-800">{meta.rating}</span>
          <span>({meta.reviews.toLocaleString(locale === "en" ? "en-US" : "vi-VN")})</span>
        </div>

        <div className="space-y-0.5">
          <p className="text-[22px] font-bold leading-none text-emerald-700">{localizedPrice}</p>
          {meta.discount > 0 ? (
            <p className="text-xs text-stone-500">
              <span className="line-through">{localizedComparePrice}</span>
              {" · "}
              <span className="font-semibold text-emerald-700">
                {t(locale, `${meta.discount}% giảm`, `${meta.discount}% off`)}
              </span>
            </p>
          ) : null}
          <p className="text-xs text-stone-500">
            {meta.fastShip
              ? t(locale, "Miễn phí vận chuyển", "Free shipping")
              : t(locale, "Giao hàng 2-4 ngày", "Delivery in 2-4 days")}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 pb-1">
          {product.category ? (
            <span className="rounded-full border border-stone-300 bg-[#faf7f3] px-2.5 py-1 text-[11px] font-semibold text-stone-700">
              {product.category.name}
            </span>
          ) : null}
          {product.woodType ? (
            <span className="rounded-full border border-stone-300 bg-[#faf7f3] px-2.5 py-1 text-[11px] font-semibold text-stone-700">
              {product.woodType}
            </span>
          ) : null}
          {product.material ? (
            <span className="rounded-full border border-stone-300 bg-[#faf7f3] px-2.5 py-1 text-[11px] font-semibold text-stone-700">
              {product.material}
            </span>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button asChild size="sm" variant="outline" className="justify-start rounded-full">
            <Link href={withLocalePath(locale, `/products/${product.slug}`)}>
              {t(locale, "Xem thêm", "Details")}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          {zaloLink ? (
            <Button asChild size="sm" className="justify-start rounded-full">
              <Link href={zaloLink} target="_blank" rel="noreferrer">
                <MessageCircle className="size-4" />
                {t(locale, "Nhắn giá", "Message")}
              </Link>
            </Button>
          ) : phoneNumber ? (
            <Button asChild size="sm" className="justify-start rounded-full">
              <a href={normalizePhoneLink(phoneNumber)}>
                <Phone className="size-4" />
                {t(locale, "Gọi ngay", "Call")}
              </a>
            </Button>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}
