import { CategoryCard } from "@/components/public/category-card";
import { SectionHeading } from "@/components/public/section-heading";

type Category = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  imageUrl: string | null;
  _count?: { products: number };
};

type CategoryStripProps = {
  title: string;
  description?: string | null;
  categories: Category[];
  href?: string;
};

export function CategoryStrip({ title, description, categories, href }: CategoryStripProps) {
  if (!categories.length) return null;

  return (
    <section>
      <SectionHeading
        eyebrow="Discover materials"
        title={title}
        description={description}
        href={href}
        hrefLabel="Explore all categories"
      />
      <div className="no-scrollbar -mx-4 overflow-x-auto px-4 pb-2">
        <div className="grid min-w-max grid-flow-col auto-cols-[80%] gap-4 sm:auto-cols-[48%] lg:auto-cols-[31%]">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}
