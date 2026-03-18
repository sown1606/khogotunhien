import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CategoryForm } from "@/components/admin/category-form";
import { updateCategoryAction } from "@/lib/actions/category-actions";
import { db } from "@/lib/db";

type EditCategoryPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params;

  const category = await db.category.findUnique({
    where: { id },
  });

  if (!category) {
    notFound();
  }

  const action = updateCategoryAction.bind(null, id);

  return (
    <div>
      <AdminPageHeader title="Edit category" description="Update category details and visibility." />
      <CategoryForm
        action={action}
        initialValues={{
          name: category.name,
          slug: category.slug,
          shortDescription: category.shortDescription,
          imageUrl: category.imageUrl,
          featured: category.featured,
          active: category.active,
          sortOrder: category.sortOrder,
        }}
      />
    </div>
  );
}
