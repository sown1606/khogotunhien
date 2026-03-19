import Link from "next/link";

import { CategoryCard } from "@/components/public/category-card";
import { ProductCard } from "@/components/public/product-card";
import { SearchInput } from "@/components/public/search-input";
import { SectionHeading } from "@/components/public/section-heading";
import { withLocalePath } from "@/lib/i18n";
import { getSearchResults, getSiteSettings } from "@/lib/queries";

type EnglishSearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function EnglishSearchPage({ searchParams }: EnglishSearchPageProps) {
  const locale = "en";
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
        eyebrow="Wood marketplace"
        title="Wood search results"
        description="Search by product name, category, or wood material to browse real-image listings."
        locale={locale}
      />

      <SearchInput initialValue={keyword} className="max-w-3xl" locale={locale} />

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-600">
        <p>
          About{" "}
          <span className="font-semibold text-stone-900">
            {(results.products.length + results.categories.length).toLocaleString("en-US")}
          </span>{" "}
          results
        </p>
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-500">
          Sort: Most relevant
        </p>
      </div>

      {keyword ? (
        <p className="text-sm text-stone-600">
          Search results for <span className="font-semibold text-stone-900">&ldquo;{keyword}&rdquo;</span>
        </p>
      ) : (
        <p className="text-sm text-stone-600">Type a keyword to start browsing.</p>
      )}

      {hasResults ? (
        <div className="space-y-10">
          {results.categories.length ? (
            <section className="space-y-4">
              <h2 className="text-3xl text-stone-900">Matching categories</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {results.categories.map((category) => (
                  <CategoryCard key={category.id} category={category} locale={locale} />
                ))}
              </div>
            </section>
          ) : null}

          {results.products.length ? (
            <section className="space-y-4">
              <h2 className="text-3xl text-stone-900">Matching products</h2>
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
          <p className="text-lg font-semibold text-stone-900">No search results yet.</p>
          <p className="mt-2 text-sm text-stone-600">Try another keyword or browse all products.</p>
          <Link
            href={withLocalePath(locale, "/products")}
            className="mt-4 inline-flex rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:border-amber-500 hover:text-amber-900"
          >
            Browse products
          </Link>
        </div>
      ) : null}
    </div>
  );
}
