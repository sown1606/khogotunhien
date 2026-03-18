import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductForm } from "@/components/admin/product-form";
import { createProductAction } from "@/lib/actions/product-actions";
import { db } from "@/lib/db";

export default async function NewProductPage() {
  const [categories, products] = await Promise.all([
    db.category.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
    db.product.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Create product"
        description="Add a new wood product to the showcase catalog."
      />
      <ProductForm action={createProductAction} categories={categories} relatedProducts={products} />
    </div>
  );
}
