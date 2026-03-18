import { CategoryCard } from "@/components/public/category-card";
import { SectionHeading } from "@/components/public/section-heading";
import { type Locale, t } from "@/lib/i18n";
import { getCategories } from "@/lib/queries";

export default async function CategoriesPage() {
  return <CategoriesPageContent locale="vi" />;
}

async function CategoriesPageContent({ locale }: { locale: Locale }) {
  const categories = await getCategories(locale);

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow={t(locale, "Nhóm vật liệu", "Material groups")}
        title={t(locale, "Mua theo danh mục", "Shop by category")}
        description={t(
          locale,
          "Khám phá từng danh mục gỗ và lựa chọn sản phẩm phù hợp cho công trình của bạn.",
          "Browse each wood category and discover tailored products for your next project.",
        )}
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
          <p className="text-lg font-semibold text-stone-900">
            {t(locale, "Chưa có danh mục nào.", "No categories available yet.")}
          </p>
          <p className="mt-1 text-sm text-stone-600">
            {t(
              locale,
              "Hãy thêm danh mục từ trang quản trị để hiển thị cấu trúc sản phẩm.",
              "Add categories from admin to publish your catalog structure.",
            )}
          </p>
        </div>
      )}
    </div>
  );
}
