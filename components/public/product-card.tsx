"use client";

import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    category?: {
      name: string;
      slug: string;
    } | null;
  };
  phoneNumber?: string | null;
  zaloLink?: string | null;
  compact?: boolean;
};

export function ProductCard({ product, phoneNumber, zaloLink, compact }: ProductCardProps) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      className="group h-full overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_12px_24px_-20px_rgba(77,50,31,0.45)]"
    >
      <Link href={`/products/${product.slug}`} className="block">
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
        </div>
      </Link>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-lg font-semibold leading-tight text-stone-900">{product.name}</h3>
          {product.category ? <Badge variant="outline">{product.category.name}</Badge> : null}
        </div>
        {product.shortDescription ? (
          <p className="line-clamp-2 text-sm text-stone-600">{product.shortDescription}</p>
        ) : null}
        <div className="flex flex-wrap gap-1.5">
          {product.woodType ? <Badge variant="secondary">{product.woodType}</Badge> : null}
          {product.material ? <Badge variant="secondary">{product.material}</Badge> : null}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button asChild size="sm" variant="outline" className="justify-start">
            <Link href={`/products/${product.slug}`}>
              Details
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          {zaloLink ? (
            <Button asChild size="sm" className="justify-start">
              <Link href={zaloLink} target="_blank" rel="noreferrer">
                <MessageCircle className="size-4" />
                Zalo
              </Link>
            </Button>
          ) : phoneNumber ? (
            <Button asChild size="sm" className="justify-start">
              <a href={normalizePhoneLink(phoneNumber)}>
                <Phone className="size-4" />
                Call
              </a>
            </Button>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}
