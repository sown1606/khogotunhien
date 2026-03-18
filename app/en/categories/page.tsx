import { CategoryCard } from "@/components/public/category-card";
import { SectionHeading } from "@/components/public/section-heading";
import { getCategories } from "@/lib/queries";

export default async function EnglishCategoriesPage() {
  const locale = "en";
  const categories = await getCategories(locale);

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Material groups"
        title="Shop by category"
        description="Browse each wood category and discover tailored products for your next project."
        locale={locale}
      />

      {categories.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} locale={locale} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
          <p className="text-lg font-semibold text-stone-900">No categories available yet.</p>
          <p className="mt-1 text-sm text-stone-600">
            Add categories from admin to publish your catalog structure.
          </p>
        </div>
      )}
    </div>
  );
}
