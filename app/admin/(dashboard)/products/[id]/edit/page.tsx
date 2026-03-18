import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductForm } from "@/components/admin/product-form";
import { updateProductAction } from "@/lib/actions/product-actions";
import { db } from "@/lib/db";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  const [product, categories, products] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
        relatedProducts: {
          select: {
            id: true,
          },
        },
      },
    }),
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

  if (!product) {
    notFound();
  }

  const action = updateProductAction.bind(null, id);
  const galleryUrls = [
    ...(product.thumbnailUrl ? [product.thumbnailUrl] : []),
    ...product.images.map((image) => image.url),
  ].filter((url, index, array) => array.indexOf(url) === index);

  return (
    <div>
      <AdminPageHeader title="Edit product" description="Update product details and visibility." />
      <ProductForm
        action={action}
        categories={categories}
        relatedProducts={products}
        initialValues={{
          id: product.id,
          name: product.name,
          nameEn: product.nameEn,
          slug: product.slug,
          shortDescription: product.shortDescription,
          shortDescriptionEn: product.shortDescriptionEn,
          description: product.description,
          descriptionEn: product.descriptionEn,
          thumbnailUrl: product.thumbnailUrl,
          woodType: product.woodType,
          woodTypeEn: product.woodTypeEn,
          material: product.material,
          materialEn: product.materialEn,
          dimensions: product.dimensions,
          dimensionsEn: product.dimensionsEn,
          finish: product.finish,
          finishEn: product.finishEn,
          featured: product.featured,
          active: product.active,
          sortOrder: product.sortOrder,
          categoryId: product.categoryId,
          galleryUrls,
          relatedProductIds: product.relatedProducts.map((relatedProduct) => relatedProduct.id),
        }}
      />
    </div>
  );
}
