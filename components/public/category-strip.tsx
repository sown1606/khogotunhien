import { CategoryCard } from "@/components/public/category-card";
import { SectionHeading } from "@/components/public/section-heading";
import { type Locale, t } from "@/lib/i18n";

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
  locale?: Locale;
};

export function CategoryStrip({ title, description, categories, href, locale = "vi" }: CategoryStripProps) {
  if (!categories.length) return null;

  return (
    <section>
      <SectionHeading
        eyebrow={t(locale, "Khám phá vật liệu", "Discover materials")}
        title={title}
        description={description}
        href={href}
        hrefLabel={t(locale, "Xem tất cả danh mục", "Explore all categories")}
        locale={locale}
      />
      <div className="no-scrollbar -mx-4 overflow-x-auto px-4 pb-2">
        <div className="grid min-w-max snap-x snap-mandatory grid-flow-col auto-cols-[72%] gap-3.5 sm:auto-cols-[44%] lg:auto-cols-[27%]">
          {categories.map((category) => (
            <div key={category.id} className="snap-start">
              <CategoryCard category={category} locale={locale} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
