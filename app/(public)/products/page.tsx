import Link from "next/link";

import { ProductCard } from "@/components/public/product-card";
import { SectionHeading } from "@/components/public/section-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type Locale, t, withLocalePath } from "@/lib/i18n";
import { getCategories, getProducts, getSiteSettings } from "@/lib/queries";

type ProductsPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    material?: string;
    featured?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  return <ProductsPageContent searchParams={searchParams} locale="vi" />;
}

async function ProductsPageContent({
  searchParams,
  locale,
}: ProductsPageProps & { locale: Locale }) {
  const params = await searchParams;
  const [settings, products, categories] = await Promise.all([
    getSiteSettings(locale),
    getProducts({
      q: params.q,
      category: params.category,
      material: params.material,
      featured: params.featured,
    }, locale),
    getCategories(locale),
  ]);

  const selectedCategory = categories.find((category) => category.slug === params.category);
  const basePath = withLocalePath(locale, "/products");
  const baseParams = new URLSearchParams();

  if (params.q) baseParams.set("q", params.q);
  if (params.material) baseParams.set("material", params.material);
  if (params.featured === "true") baseParams.set("featured", "true");
  if (params.category) baseParams.set("category", params.category);

  const buildFilterHref = (overrides: Partial<Record<"category" | "featured", string | undefined>>) => {
    const next = new URLSearchParams(baseParams);

    for (const [key, value] of Object.entries(overrides)) {
      if (!value) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    }

    const query = next.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow={t(locale, "Wood marketplace", "Wood marketplace")}
        title={t(locale, "Khám phá sản phẩm gỗ", "Browse wood listings")}
        description={t(
          locale,
          "Tìm nhanh theo danh mục, xem ảnh gỗ thật và liên hệ trực tiếp để nhận báo giá.",
          "Use quick filters, browse real wood imagery, and request quotes directly.",
        )}
        locale={locale}
      />

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-600">
        <p>
          {t(locale, "Khoảng", "About")}{" "}
          <span className="font-semibold text-stone-900">{products.length.toLocaleString("vi-VN")}</span>{" "}
          {t(locale, "sản phẩm", "items")}
        </p>
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-500">
          {t(locale, "Sắp xếp: Phù hợp nhất", "Sort: Most relevant")}
        </p>
      </div>

      <div className="no-scrollbar -mx-1 overflow-x-auto px-1">
        <div className="flex min-w-max items-center gap-2">
          <span className="rounded-full border border-stone-400 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800">
            {t(locale, "Hiện bộ lọc", "Show filters")}
          </span>
          <span className="rounded-full border border-stone-300 bg-[#faf7f3] px-3 py-1.5 text-xs font-semibold text-stone-700">
            {t(locale, "Giao từ VN", "Ships from VN")}
          </span>
          <span className="rounded-full border border-stone-300 bg-[#faf7f3] px-3 py-1.5 text-xs font-semibold text-stone-700">
            {t(locale, "Nhà bán uy tín", "Star Seller")}
          </span>
          <Link
            href={buildFilterHref({ category: undefined, featured: undefined })}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              !params.category && params.featured !== "true"
                ? "border-stone-900 bg-stone-900 text-white"
                : "border-stone-300 bg-white text-stone-700 hover:border-stone-500 hover:text-stone-900"
            }`}
          >
            {t(locale, "Tất cả", "All")}
          </Link>
          <Link
            href={buildFilterHref({ featured: "true" })}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              params.featured === "true"
                ? "border-stone-900 bg-stone-900 text-white"
                : "border-stone-300 bg-white text-stone-700 hover:border-stone-500 hover:text-stone-900"
            }`}
          >
            {t(locale, "Nổi bật", "Popular now")}
          </Link>
          {categories.slice(0, 12).map((category) => (
            <Link
              key={category.id}
              href={buildFilterHref({ category: category.slug })}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                params.category === category.slug
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-300 bg-white text-stone-700 hover:border-stone-500 hover:text-stone-900"
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>

      <form className="grid gap-3 rounded-2xl border border-stone-200 bg-[#fffdf9] p-4 shadow-[0_14px_34px_-28px_rgba(77,50,31,0.5)] md:grid-cols-12">
        <div className="md:col-span-5">
          <Input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder={t(
              locale,
              "Tìm theo tên sản phẩm, danh mục, loại gỗ...",
              "Search by product, category, wood type...",
            )}
          />
        </div>
        <div className="md:col-span-3">
          <select
            name="category"
            defaultValue={params.category ?? ""}
            className="h-10 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm text-stone-900 ring-focus"
          >
            <option value="">{t(locale, "Tất cả danh mục", "All categories")}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <Input
            name="material"
            defaultValue={params.material ?? ""}
            placeholder={t(locale, "Vật liệu", "Material")}
          />
        </div>
        <div className="flex items-center gap-2 md:col-span-2">
          <Button type="submit" className="w-full">
            {t(locale, "Lọc", "Filter")}
          </Button>
        </div>
      </form>

      <div className="flex flex-wrap items-center gap-2 text-sm text-stone-600">
        <span>
          {t(locale, `${products.length} sản phẩm`, `${products.length} products found`)}
        </span>
        {params.featured === "true" ? (
          <span className="rounded-full bg-stone-200 px-2.5 py-0.5 text-xs text-stone-700">
            {t(locale, "Nổi bật", "Popular now")}
          </span>
        ) : null}
        {selectedCategory ? (
          <span className="rounded-full bg-stone-200 px-2.5 py-0.5 text-xs text-stone-700">
            {selectedCategory.name}
          </span>
        ) : null}
      </div>

      {products.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              phoneNumber={settings.phoneNumber}
              zaloLink={settings.zaloLink}
              locale={locale}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
          <p className="text-lg font-semibold text-stone-900">
            {t(locale, "Không có sản phẩm phù hợp bộ lọc.", "No products matched your filters.")}
          </p>
          <p className="mt-1 text-sm text-stone-600">
            {t(locale, "Hãy thử từ khóa khác hoặc xem tất cả danh mục.", "Try another keyword or browse all categories.")}
          </p>
          <Button asChild variant="secondary" className="mt-4">
            <Link href={withLocalePath(locale, "/categories")}>
              {t(locale, "Xem danh mục", "View categories")}
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
