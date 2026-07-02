import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db, getPrismaErrorLogMetadata } from "@/lib/db";
import { logWarn } from "@/lib/logger";

type DashboardStatValue = number | null;

type LatestDashboardProduct = {
  id: string;
  name: string;
  active: boolean;
  featured: boolean;
  updatedAt: Date;
};

type DashboardQueryResult<T> = {
  value: T;
  unavailable: boolean;
};

function skippedDashboardQuery<T>(fallbackValue: T): DashboardQueryResult<T> {
  return {
    value: fallbackValue,
    unavailable: true,
  };
}

async function readDashboardQuery<T>(
  queryName: string,
  fallbackValue: T,
  execute: () => Promise<T>,
): Promise<DashboardQueryResult<T>> {
  try {
    return {
      value: await execute(),
      unavailable: false,
    };
  } catch (error) {
    logWarn("Admin dashboard query failed; rendering degraded dashboard.", {
      query: queryName,
      ...getPrismaErrorLogMetadata(error),
    });
    return skippedDashboardQuery(fallbackValue);
  }
}

export default async function AdminDashboardPage() {
  const productsResult = await readDashboardQuery<DashboardStatValue>(
    "admin.dashboard.products.count",
    null,
    () => db.product.count(),
  );

  const categoriesResult = productsResult.unavailable
    ? skippedDashboardQuery<DashboardStatValue>(null)
    : await readDashboardQuery<DashboardStatValue>(
        "admin.dashboard.categories.count",
        null,
        () => db.category.count(),
      );

  const sectionsResult = categoriesResult.unavailable
    ? skippedDashboardQuery<DashboardStatValue>(null)
    : await readDashboardQuery<DashboardStatValue>(
        "admin.dashboard.homepageSections.count",
        null,
        () => db.homepageSection.count(),
      );

  const featuredProductsResult = sectionsResult.unavailable
    ? skippedDashboardQuery<DashboardStatValue>(null)
    : await readDashboardQuery<DashboardStatValue>(
        "admin.dashboard.featuredProducts.count",
        null,
        () => db.product.count({ where: { featured: true } }),
      );

  const hiddenProductsResult = featuredProductsResult.unavailable
    ? skippedDashboardQuery<DashboardStatValue>(null)
    : await readDashboardQuery<DashboardStatValue>(
        "admin.dashboard.hiddenProducts.count",
        null,
        () => db.product.count({ where: { active: false } }),
      );

  const latestProductsResult = hiddenProductsResult.unavailable
    ? skippedDashboardQuery<LatestDashboardProduct[]>([])
    : await readDashboardQuery<LatestDashboardProduct[]>(
        "admin.dashboard.latestProducts",
        [],
        () =>
          db.product.findMany({
            orderBy: { updatedAt: "desc" },
            take: 6,
            select: {
              id: true,
              name: true,
              active: true,
              featured: true,
              updatedAt: true,
            },
          }),
      );

  const products = productsResult.value;
  const categories = categoriesResult.value;
  const sections = sectionsResult.value;
  const featuredProducts = featuredProductsResult.value;
  const hiddenProducts = hiddenProductsResult.value;
  const latestProducts = latestProductsResult.value;
  const databaseUnavailable = latestProductsResult.unavailable;

  return (
    <div>
      <AdminPageHeader
        title="Overview"
        description="Manage your storefront content and keep products fresh."
      />

      {databaseUnavailable ? (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Database is temporarily unavailable. Admin data will refresh when the connection recovers.
        </div>
      ) : null}

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
              <p className="text-3xl font-semibold text-stone-900">{item.value ?? "N/A"}</p>
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
            {latestProducts.length > 0 ? (
              latestProducts.map((product) => (
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
              ))
            ) : (
              <p className="text-sm text-stone-600">No recent products available.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
