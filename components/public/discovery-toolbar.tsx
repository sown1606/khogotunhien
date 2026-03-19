import Link from "next/link";
import { ChevronRight, SlidersHorizontal, Sparkles } from "lucide-react";

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

  const quickFilters = [
    t(locale, "Hiện bộ lọc", "Show filters"),
    t(locale, "Giao từ VN", "Ships from VN"),
    t(locale, "Nhà bán uy tín", "Star Seller"),
    t(locale, "Đang giảm giá", "On sale"),
  ];

  return (
    <section className="rounded-2xl border border-stone-200 bg-white/95 p-4 shadow-[0_14px_34px_-26px_rgba(77,50,31,0.45)]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
        <p className="inline-flex items-center gap-1.5 font-semibold">
          <Sparkles className="size-3.5" />
          {t(locale, "Khám phá nhanh sản phẩm gỗ", "Quick wood browsing")}
        </p>
        <p>{t(locale, "Hơn 1.000 sản phẩm ảnh gỗ", "1,000+ wood listings")}</p>
      </div>

      <div className="no-scrollbar -mx-1 overflow-x-auto px-1">
        <div className="flex min-w-max items-center gap-2">
          {quickFilters.map((filter, index) => (
            <span
              key={filter}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition ${
                index === 0
                  ? "border-stone-400 bg-white text-stone-800"
                  : "border-stone-300 bg-[#faf7f3] text-stone-700 hover:border-stone-500"
              }`}
            >
              {index === 0 ? <SlidersHorizontal className="size-3.5" /> : null}
              {filter}
            </span>
          ))}
          <Link
            href={withLocalePath(locale, "/products")}
            className="inline-flex items-center gap-1.5 rounded-full border border-stone-900 bg-stone-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-stone-800"
          >
            {t(locale, "Tất cả sản phẩm", "All products")}
          </Link>
          {categories.slice(0, 12).map((category) => (
            <Link
              key={category.id}
              href={withLocalePath(locale, `/categories/${category.slug}`)}
              className="inline-flex rounded-full border border-stone-300 bg-[#faf7f3] px-3.5 py-2 text-xs font-semibold text-stone-700 transition hover:border-stone-500 hover:text-stone-900"
            >
              {category.name}
            </Link>
          ))}
          <Link
            href={withLocalePath(locale, "/categories")}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-stone-400 px-3.5 py-2 text-xs font-semibold text-stone-700 transition hover:border-stone-600 hover:text-stone-900"
          >
            {t(locale, "Xem toàn bộ danh mục", "View all categories")}
            <ChevronRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
