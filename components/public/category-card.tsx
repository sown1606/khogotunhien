"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type Locale, t, withLocalePath } from "@/lib/i18n";

type CategoryCardProps = {
  category: {
    id: string;
    name: string;
    slug: string;
    shortDescription: string | null;
    imageUrl: string | null;
    _count?: {
      products: number;
    };
  };
  locale?: Locale;
};

export function CategoryCard({ category, locale = "vi" }: CategoryCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_10px_24px_-20px_rgba(77,50,31,0.5)]"
    >
      <Link href={withLocalePath(locale, `/categories/${category.slug}`)} className="block">
        <div className="relative aspect-[5/3] overflow-hidden">
          <Image
            src={category.imageUrl || "/demo/brand/texture.webp"}
            alt={category.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <p className="text-xs uppercase tracking-[0.12em] text-white/80">
              {category._count
                ? t(locale, `${category._count.products} sản phẩm`, `${category._count.products} products`)
                : t(locale, "Khám phá bộ sưu tập", "Explore collection")}
            </p>
            <h3 className="text-2xl font-semibold leading-tight">{category.name}</h3>
          </div>
        </div>
      </Link>
      <div className="flex items-center justify-between gap-3 p-4">
        <p className="line-clamp-2 text-sm text-stone-600">
          {category.shortDescription ||
            t(
              locale,
              "Vật liệu gỗ cao cấp được tuyển chọn bởi đội ngũ chuyên môn.",
              "Premium wood materials curated by specialists.",
            )}
        </p>
        <Link
          href={withLocalePath(locale, `/categories/${category.slug}`)}
          className="inline-flex size-9 items-center justify-center rounded-full border border-stone-300 text-stone-700 transition hover:border-amber-500 hover:text-amber-900"
        >
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </motion.div>
  );
}
