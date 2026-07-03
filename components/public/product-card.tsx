"use client";

import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Phone, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { type Locale, t, withLocalePath } from "@/lib/i18n";
import { normalizeProductTags } from "@/lib/product-tags";
import { normalizePhoneLink, resolveWoodDemoImage } from "@/lib/utils";

const PRODUCT_IMAGE_PLACEHOLDER = "/brand/icon.svg";

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    shortDescription: string | null;
    thumbnailUrl: string | null;
    price?: unknown;
    comparePrice?: unknown;
    discountPercent?: unknown;
    shippingLabel?: unknown;
    badgeLabel?: unknown;
    tags?: unknown;
    rating?: unknown;
    reviewCount?: unknown;
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

function formatVndPrice(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

function calculateDiscountPercent(price?: number | null, comparePrice?: number | null) {
  if (!price || !comparePrice || comparePrice <= price) {
    return null;
  }

  return Math.round(((comparePrice - price) / comparePrice) * 100);
}

function readOptionalNumber(value: unknown) {
  return typeof value === "number" ? value : null;
}

function readOptionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function resolveProductImage(source: string | null | undefined, seed: string) {
  if (!source) return PRODUCT_IMAGE_PLACEHOLDER;

  return resolveWoodDemoImage(source, seed);
}

export function ProductCard({ product, phoneNumber, zaloLink, compact, locale = "vi" }: ProductCardProps) {
  const [imageSrc, setImageSrc] = useState(() =>
    resolveProductImage(product.thumbnailUrl, product.slug || product.id),
  );
  const price = readOptionalNumber(product.price);
  const comparePrice = readOptionalNumber(product.comparePrice);
  const explicitDiscountPercent = readOptionalNumber(product.discountPercent);
  const rating = readOptionalNumber(product.rating);
  const reviewCount = readOptionalNumber(product.reviewCount);
  const shippingLabel = readOptionalString(product.shippingLabel);
  const hasPrice = typeof price === "number";
  const hasComparePrice = hasPrice && typeof comparePrice === "number" && comparePrice > price;
  const discountPercent =
    hasComparePrice && typeof explicitDiscountPercent === "number" && explicitDiscountPercent > 0
      ? explicitDiscountPercent
      : calculateDiscountPercent(price, comparePrice);
  const productTags = normalizeProductTags(product.tags);
  const badgeLabel =
    readOptionalString(product.badgeLabel) ||
    (product.featured ? t(locale, "Phổ biến", "Popular now") : null);

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="group h-full overflow-hidden rounded-[18px] border border-stone-200 bg-white shadow-[0_14px_32px_-26px_rgba(77,50,31,0.45)]"
    >
      <Link href={withLocalePath(locale, `/products/${product.slug}`)} className="block">
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes={compact ? "(max-width: 768px) 78vw, 24vw" : "(max-width: 768px) 94vw, 24vw"}
            onError={() => setImageSrc(PRODUCT_IMAGE_PLACEHOLDER)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/0 to-black/5" />
          {badgeLabel ? (
            <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-stone-700">
              {badgeLabel}
            </span>
          ) : null}
        </div>
      </Link>

      <div className="space-y-2 p-3.5">
        <h3 className="line-clamp-2 text-[15px] leading-snug text-stone-900">{product.name}</h3>
        <p className="text-xs text-stone-500">{t(locale, "By DaithienphuWood", "By DaithienphuWood")}</p>
        {typeof rating === "number" || typeof reviewCount === "number" ? (
          <div className="flex items-center gap-1 text-xs text-stone-600">
            <Star className="size-3.5 fill-amber-400 text-amber-500" />
            {typeof rating === "number" ? (
              <span className="font-semibold text-stone-800">{rating.toFixed(1)}</span>
            ) : null}
            {typeof reviewCount === "number" ? (
              <span>({reviewCount.toLocaleString(locale === "en" ? "en-US" : "vi-VN")})</span>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-0.5">
          {hasPrice ? (
            <p className="text-[22px] font-bold leading-none text-emerald-700">
              {formatVndPrice(price as number)}
            </p>
          ) : (
            <p className="text-[18px] font-semibold leading-none text-emerald-700">
              {t(locale, "Liên hệ báo giá", "Contact for price")}
            </p>
          )}
          {hasComparePrice ? (
            <p className="text-xs text-stone-500">
              <span className="line-through">{formatVndPrice(comparePrice as number)}</span>
              {discountPercent ? (
                <>
                  {" · "}
                  <span className="font-semibold text-emerald-700">
                    {t(locale, `${discountPercent}% giảm`, `${discountPercent}% off`)}
                  </span>
                </>
              ) : null}
            </p>
          ) : null}
          {shippingLabel ? (
            <p className="text-xs text-stone-500">{shippingLabel}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-1.5 pb-1">
          {productTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-stone-300 bg-[#faf7f3] px-2.5 py-1 text-[11px] font-semibold text-stone-700"
            >
              {tag}
            </span>
          ))}
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
