import Link from "next/link";

import { CategoryCard } from "@/components/public/category-card";
import { ProductCard } from "@/components/public/product-card";
import { SearchInput } from "@/components/public/search-input";
import { SectionHeading } from "@/components/public/section-heading";
import { getSearchResults, getSiteSettings } from "@/lib/queries";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const keyword = params.q?.trim() ?? "";

  const [settings, results] = await Promise.all([getSiteSettings(), getSearchResults(keyword)]);
  const hasResults = results.products.length > 0 || results.categories.length > 0;

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Search"
        title="Find products and categories"
        description="Search by product name, category, or material type."
      />

      <SearchInput initialValue={keyword} className="max-w-3xl" />

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
                  <CategoryCard key={category.id} category={category} />
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
            href="/products"
            className="mt-4 inline-flex rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:border-amber-500 hover:text-amber-900"
          >
            Browse products
          </Link>
        </div>
      ) : null}
    </div>
  );
}
