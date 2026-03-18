import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductsTable } from "@/components/admin/products-table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/db";

type AdminProductsPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
  }>;
};

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const params = await searchParams;
  const keyword = params.q?.trim();
  const categorySlug = params.category?.trim();

  const categories = await db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true },
  });

  const products = await db.product.findMany({
    where: {
      OR: keyword
        ? [
            { name: { contains: keyword } },
            { slug: { contains: keyword } },
            { woodType: { contains: keyword } },
          ]
        : undefined,
      category: categorySlug ? { slug: categorySlug } : undefined,
    },
    include: {
      category: {
        select: {
          name: true,
        },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
  });

  return (
    <div>
      <AdminPageHeader
        title="Products"
        description="Create, edit, activate, and manage featured showcase products."
        actionHref="/admin/products/new"
        actionLabel="Add product"
      />

      <Card className="mb-4">
        <CardContent className="p-4">
          <form className="grid gap-3 md:grid-cols-12">
            <div className="md:col-span-6">
              <Input name="q" defaultValue={keyword || ""} placeholder="Search products..." />
            </div>
            <div className="md:col-span-4">
              <select
                name="category"
                defaultValue={categorySlug || ""}
                className="h-10 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm ring-focus"
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
              <button
                type="submit"
                className="h-10 w-full rounded-xl bg-stone-900 px-4 text-sm font-semibold text-white hover:bg-stone-800"
              >
                Search
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      <ProductsTable products={products} />
    </div>
  );
}
