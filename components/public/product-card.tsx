"use client";

import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Phone, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type Locale, t, withLocalePath } from "@/lib/i18n";
import { cn, normalizePhoneLink } from "@/lib/utils";

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

export function ProductCard({ product, phoneNumber, zaloLink, compact, locale = "vi" }: ProductCardProps) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      className="group h-full overflow-hidden rounded-[18px] border border-stone-200 bg-white shadow-[0_14px_28px_-22px_rgba(77,50,31,0.45)]"
    >
      <Link href={withLocalePath(locale, `/products/${product.slug}`)} className="block">
        <div
          className={cn(
            "relative overflow-hidden",
            compact ? "aspect-[4/3]" : "aspect-[5/4]",
          )}
        >
          <Image
            src={product.thumbnailUrl || "/file.svg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes={compact ? "(max-width: 768px) 60vw, 25vw" : "(max-width: 768px) 100vw, 25vw"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
          {product.featured ? (
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-stone-700">
              {t(locale, "Nổi bật", "Popular now")}
            </span>
          ) : null}
        </div>
      </Link>

      <div className="space-y-2.5 p-4">
        <h3 className="line-clamp-2 text-[17px] font-semibold leading-tight text-stone-900">
          {product.name}
        </h3>
        {product.shortDescription ? (
          <p className="line-clamp-2 text-sm text-stone-600">{product.shortDescription}</p>
        ) : null}
        <p className="text-xs text-stone-500">
          {t(locale, "Bởi Đại Thiên Phú Wood", "By Đại Thiên Phú Wood")}
        </p>
        <div className="flex items-center gap-1 text-xs text-stone-600">
          <Star className="size-3.5 fill-amber-400 text-amber-500" />
          <span className="font-semibold text-stone-800">4.9</span>
          <span>{t(locale, "xưởng tuyển chọn", "workshop curated")}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {product.category ? <Badge variant="outline">{product.category.name}</Badge> : null}
          {product.woodType ? <Badge variant="secondary">{product.woodType}</Badge> : null}
          {product.material ? <Badge variant="secondary">{product.material}</Badge> : null}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1.5">
          <Button asChild size="sm" variant="outline" className="justify-start rounded-full">
            <Link href={withLocalePath(locale, `/products/${product.slug}`)}>
              {t(locale, "Chi tiết", "Details")}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          {zaloLink ? (
            <Button asChild size="sm" className="justify-start rounded-full">
              <Link href={zaloLink} target="_blank" rel="noreferrer">
                <MessageCircle className="size-4" />
                Zalo
              </Link>
            </Button>
          ) : phoneNumber ? (
            <Button asChild size="sm" className="justify-start rounded-full">
              <a href={normalizePhoneLink(phoneNumber)}>
                <Phone className="size-4" />
                {t(locale, "Gọi", "Call")}
              </a>
            </Button>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}
