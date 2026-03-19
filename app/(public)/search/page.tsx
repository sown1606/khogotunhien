import Link from "next/link";

import { CategoryCard } from "@/components/public/category-card";
import { ProductCard } from "@/components/public/product-card";
import { SearchInput } from "@/components/public/search-input";
import { SectionHeading } from "@/components/public/section-heading";
import { type Locale, t, withLocalePath } from "@/lib/i18n";
import { getSearchResults, getSiteSettings } from "@/lib/queries";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  return <SearchPageContent searchParams={searchParams} locale="vi" />;
}

async function SearchPageContent({
  searchParams,
  locale,
}: SearchPageProps & { locale: Locale }) {
  const params = await searchParams;
  const keyword = params.q?.trim() ?? "";

  const [settings, results] = await Promise.all([
    getSiteSettings(locale),
    getSearchResults(keyword, locale),
  ]);
  const hasResults = results.products.length > 0 || results.categories.length > 0;

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow={t(locale, "Wood marketplace", "Wood marketplace")}
        title={t(locale, "Kết quả tìm kiếm sản phẩm gỗ", "Wood search results")}
        description={t(
          locale,
          "Tìm theo tên sản phẩm, danh mục hoặc chất liệu gỗ để xem danh sách ảnh thật.",
          "Search by product name, category, or wood material to browse real-image listings.",
        )}
        locale={locale}
      />

      <SearchInput initialValue={keyword} className="max-w-3xl" locale={locale} />

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-600">
        <p>
          {t(locale, "Khoảng", "About")}{" "}
          <span className="font-semibold text-stone-900">
            {(results.products.length + results.categories.length).toLocaleString(
              locale === "en" ? "en-US" : "vi-VN",
            )}
          </span>{" "}
          {t(locale, "kết quả", "results")}
        </p>
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-500">
          {t(locale, "Sắp xếp: Phù hợp nhất", "Sort: Most relevant")}
        </p>
      </div>

      {keyword ? (
        <p className="text-sm text-stone-600">
          {t(locale, "Kết quả tìm kiếm cho", "Search results for")}{" "}
          <span className="font-semibold text-stone-900">&ldquo;{keyword}&rdquo;</span>
        </p>
      ) : (
        <p className="text-sm text-stone-600">
          {t(locale, "Nhập từ khóa để bắt đầu tìm kiếm.", "Type a keyword to start browsing.")}
        </p>
      )}

      {hasResults ? (
        <div className="space-y-10">
          {results.categories.length ? (
            <section className="space-y-4">
              <h2 className="text-3xl text-stone-900">
                {t(locale, "Danh mục phù hợp", "Matching categories")}
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {results.categories.map((category) => (
                  <CategoryCard key={category.id} category={category} locale={locale} />
                ))}
              </div>
            </section>
          ) : null}

          {results.products.length ? (
            <section className="space-y-4">
              <h2 className="text-3xl text-stone-900">
                {t(locale, "Sản phẩm phù hợp", "Matching products")}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {results.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    phoneNumber={settings.phoneNumber}
                    zaloLink={settings.zaloLink}
                    locale={locale}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : keyword ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
          <p className="text-lg font-semibold text-stone-900">
            {t(locale, "Chưa có kết quả phù hợp.", "No search results yet.")}
          </p>
          <p className="mt-2 text-sm text-stone-600">
            {t(locale, "Hãy thử từ khóa khác hoặc xem toàn bộ sản phẩm.", "Try another keyword or browse all products.")}
          </p>
          <Link
            href={withLocalePath(locale, "/products")}
            className="mt-4 inline-flex rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:border-amber-500 hover:text-amber-900"
          >
            {t(locale, "Xem sản phẩm", "Browse products")}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
