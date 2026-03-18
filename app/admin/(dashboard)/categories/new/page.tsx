import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CategoryForm } from "@/components/admin/category-form";
import { createCategoryAction } from "@/lib/actions/category-actions";

export default function NewCategoryPage() {
  return (
    <div>
      <AdminPageHeader title="Create category" description="Add a new browsing category." />
      <CategoryForm action={createCategoryAction} />
    </div>
  );
}
