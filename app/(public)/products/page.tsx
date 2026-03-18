import Link from "next/link";

import { ProductCard } from "@/components/public/product-card";
import { SectionHeading } from "@/components/public/section-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const params = await searchParams;
  const [settings, products, categories] = await Promise.all([
    getSiteSettings(),
    getProducts({
      q: params.q,
      category: params.category,
      material: params.material,
      featured: params.featured,
    }),
    getCategories(),
  ]);

  const selectedCategory = categories.find((category) => category.slug === params.category);

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Product catalog"
        title="Browse wood products"
        description="Search and filter premium wood products without checkout distractions. Reach out directly for consultation."
      />

      <form className="grid gap-3 rounded-2xl border border-stone-200 bg-white p-4 md:grid-cols-12">
        <div className="md:col-span-5">
          <Input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search by product, category, wood type..."
          />
        </div>
        <div className="md:col-span-3">
          <select
            name="category"
            defaultValue={params.category ?? ""}
            className="h-10 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm text-stone-900 ring-focus"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <Input name="material" defaultValue={params.material ?? ""} placeholder="Material" />
        </div>
        <div className="flex items-center gap-2 md:col-span-2">
          <Button type="submit" className="w-full">
            Filter
          </Button>
        </div>
      </form>

      <div className="flex flex-wrap items-center gap-2 text-sm text-stone-600">
        <span>{products.length} products found</span>
        {selectedCategory ? (
          <span className="rounded-full bg-stone-200 px-2.5 py-0.5 text-xs text-stone-700">
            {selectedCategory.name}
          </span>
        ) : null}
      </div>

      {products.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              phoneNumber={settings.phoneNumber}
              zaloLink={settings.zaloLink}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
          <p className="text-lg font-semibold text-stone-900">No products matched your filters.</p>
          <p className="mt-1 text-sm text-stone-600">
            Try another keyword or browse all categories.
          </p>
          <Button asChild variant="secondary" className="mt-4">
            <Link href="/categories">View categories</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
