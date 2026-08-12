"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { SectionHeading } from "@/components/public/section-heading";

type CustomerProjectGalleryItem = {
  id: string;
  title: string;
  description: string;
  href: string | null;
  image: string;
};

type CustomerProjectGalleryProps = {
  description: string | null;
  eyebrow: string;
  items: CustomerProjectGalleryItem[];
  title: string;
};

export function CustomerProjectGallery({
  description,
  eyebrow,
  items,
  title,
}: CustomerProjectGalleryProps) {
  const [failedImageIds, setFailedImageIds] = useState<string[]>([]);
  const visibleItems = items.filter((item) => !failedImageIds.includes(item.id));

  if (!visibleItems.length) {
    return null;
  }

  return (
    <section>
      <SectionHeading eyebrow={eyebrow} title={title} description={description} />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {visibleItems.map((item) => {
          const content = (
            <>
              <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  onError={() =>
                    setFailedImageIds((current) =>
                      current.includes(item.id) ? current : [...current, item.id],
                    )
                  }
                />
              </div>
              <div className="space-y-1.5 p-5">
                <h3 className="text-xl font-semibold text-stone-900">{item.title}</h3>
                <p className="line-clamp-2 text-sm leading-6 text-stone-600">{item.description}</p>
              </div>
            </>
          );
          const className =
            "group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_16px_32px_-24px_rgba(77,50,31,0.55)]";

          return item.href ? (
            <Link key={item.id} href={item.href} className={className}>
              {content}
            </Link>
          ) : (
            <article key={item.id} className={className}>
              {content}
            </article>
          );
        })}
      </div>
    </section>
  );
}
