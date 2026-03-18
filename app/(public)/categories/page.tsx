import { CategoryCard } from "@/components/public/category-card";
import { SectionHeading } from "@/components/public/section-heading";
import { getCategories } from "@/lib/queries";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Material groups"
        title="Shop by category"
        description="Browse each wood category and discover tailored products for your next project."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
