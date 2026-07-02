"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

import { cn, resolveWoodDemoImage } from "@/lib/utils";

const PRODUCT_IMAGE_PLACEHOLDER = "/brand/icon.svg";

type ProductGalleryProps = {
  images: string[];
  alt: string;
};

export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const gallerySource = images.length ? images : [PRODUCT_IMAGE_PLACEHOLDER];
  const gallery = gallerySource.map((image, index) =>
    image ? resolveWoodDemoImage(image, `${alt}-${index}`) : PRODUCT_IMAGE_PLACEHOLDER,
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<string[]>([]);

  function resolveRenderedImage(image: string) {
    return failedImages.includes(image) ? PRODUCT_IMAGE_PLACEHOLDER : image;
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-stone-200 bg-white">
        <AnimatePresence mode="wait">
          <motion.div
            key={gallery[activeIndex]}
            initial={{ opacity: 0.2, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.2, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0"
          >
            <Image
              src={resolveRenderedImage(gallery[activeIndex])}
              alt={alt}
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 55vw"
              onError={() =>
                setFailedImages((previous) => [...new Set([...previous, gallery[activeIndex]])])
              }
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {gallery.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={cn(
              "relative h-20 w-24 shrink-0 overflow-hidden rounded-lg border transition",
              index === activeIndex ? "border-amber-600" : "border-stone-200 hover:border-stone-400",
            )}
          >
            <Image
              src={resolveRenderedImage(image)}
              alt={`${alt} ${index + 1}`}
              fill
              unoptimized
              className="object-cover"
              sizes="120px"
              onError={() => setFailedImages((previous) => [...new Set([...previous, image])])}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
