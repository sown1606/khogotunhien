import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";

export default async function AdminDashboardPage() {
  const [products, categories, sections, featuredProducts, hiddenProducts] = await Promise.all([
    db.product.count(),
    db.category.count(),
    db.homepageSection.count(),
    db.product.count({ where: { featured: true } }),
    db.product.count({ where: { active: false } }),
  ]);

  const latestProducts = await db.product.findMany({
    orderBy: { updatedAt: "desc" },
    take: 6,
    select: {
      id: true,
      name: true,
      active: true,
      featured: true,
      updatedAt: true,
    },
  });

  return (
    <div>
      <AdminPageHeader
        title="Overview"
        description="Manage your storefront content and keep products fresh."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Products", value: products },
          { label: "Categories", value: categories },
          { label: "Homepage Sections", value: sections },
          { label: "Featured Products", value: featuredProducts },
          { label: "Hidden Products", value: hiddenProducts },
        ].map((item) => (
          <Card key={item.label}>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm text-stone-600">{item.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-stone-900">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            <Button asChild variant="secondary">
              <Link href="/admin/products/new">Create product</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/admin/categories/new">Create category</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/admin/homepage">Manage homepage</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/admin/settings">Update settings</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recently updated products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {latestProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between rounded-lg border border-stone-200 bg-white px-3 py-2"
              >
                <div>
                  <p className="font-medium text-stone-900">{product.name}</p>
                  <p className="text-xs text-stone-500">
                    {new Date(product.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Badge variant={product.active ? "success" : "outline"}>
                    {product.active ? "Active" : "Hidden"}
                  </Badge>
                  {product.featured ? <Badge variant="warning">Featured</Badge> : null}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
