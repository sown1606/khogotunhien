import Link from "next/link";
import { Compass, Layers, Sparkles } from "lucide-react";

import { type Locale, t, withLocalePath } from "@/lib/i18n";

type DiscoveryCategory = {
  id: string;
  name: string;
  slug: string;
};

type DiscoveryToolbarProps = {
  categories: DiscoveryCategory[];
  locale?: Locale;
};

export function DiscoveryToolbar({ categories, locale = "vi" }: DiscoveryToolbarProps) {
  if (!categories.length) return null;

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-[0_14px_30px_-24px_rgba(77,50,31,0.45)]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
          <Compass className="size-3.5" />
          {t(locale, "Khám phá nhanh", "Quick discovery")}
        </p>
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <Sparkles className="size-3.5" />
          <span>{t(locale, "Nhịp duyệt bộ sưu tập", "Browse collections faster")}</span>
        </div>
      </div>

      <div className="no-scrollbar -mx-1 overflow-x-auto px-1">
        <div className="flex min-w-max items-center gap-2">
          <Link
            href={withLocalePath(locale, "/products")}
            className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-stone-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-stone-800"
          >
            <Layers className="size-3.5" />
            {t(locale, "Tất cả sản phẩm", "All products")}
          </Link>
          {categories.slice(0, 12).map((category) => (
            <Link
              key={category.id}
              href={withLocalePath(locale, `/categories/${category.slug}`)}
              className="inline-flex rounded-full border border-stone-300 bg-[#f7f4ef] px-3.5 py-2 text-xs font-semibold text-stone-700 transition hover:border-amber-500 hover:text-amber-900"
            >
              {category.name}
            </Link>
          ))}
          <Link
            href={withLocalePath(locale, "/categories")}
            className="inline-flex rounded-full border border-dashed border-stone-400 px-3.5 py-2 text-xs font-semibold text-stone-700 transition hover:border-amber-500 hover:text-amber-900"
          >
            {t(locale, "Xem toàn bộ danh mục", "View all categories")}
          </Link>
        </div>
      </div>
    </section>
  );
}
