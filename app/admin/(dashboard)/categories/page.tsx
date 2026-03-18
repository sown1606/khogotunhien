import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CategoriesTable } from "@/components/admin/categories-table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/db";

type AdminCategoriesPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function AdminCategoriesPage({ searchParams }: AdminCategoriesPageProps) {
  const params = await searchParams;
  const keyword = params.q?.trim();

  const categories = await db.category.findMany({
    where: keyword
      ? {
          OR: [{ name: { contains: keyword } }, { slug: { contains: keyword } }],
        }
      : undefined,
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
  });

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        description="Manage product grouping, ordering, and featured categories."
        actionHref="/admin/categories/new"
        actionLabel="Add category"
      />

      <Card className="mb-4">
        <CardContent className="p-4">
          <form className="grid gap-3 md:grid-cols-12">
            <div className="md:col-span-10">
              <Input name="q" defaultValue={keyword || ""} placeholder="Search categories..." />
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

      <CategoriesTable categories={categories} />
    </div>
  );
}
