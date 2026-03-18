import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/public/product-card";
import { ContactActions } from "@/components/public/contact-actions";
import { SectionHeading } from "@/components/public/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { type Locale, t } from "@/lib/i18n";
import { getCategoryBySlug, getSiteSettings } from "@/lib/queries";

type CategoryDetailPageProps = {
  params: Promise<{ slug: string }>;
};

async function generateCategoryDetailMetadata(
  { params }: CategoryDetailPageProps,
  locale: Locale,
): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug, locale);

  if (!category) {
    return {
      title: t(locale, "Không tìm thấy danh mục", "Category not found"),
    };
  }

  return {
    title: `${category.name} | ${t(locale, "Danh mục gỗ", "Wood Category")}`,
    description: category.shortDescription || undefined,
    alternates: {
      canonical: `/categories/${slug}`,
      languages: {
        vi: `/categories/${slug}`,
        en: `/en/categories/${slug}`,
      },
    },
  };
}

export async function generateMetadata(props: CategoryDetailPageProps): Promise<Metadata> {
  return generateCategoryDetailMetadata(props, "vi");
}

export default async function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  return <CategoryDetailPageContent params={params} locale="vi" />;
}

async function CategoryDetailPageContent({
  params,
  locale,
}: CategoryDetailPageProps & { locale: Locale }) {
  const { slug } = await params;
  const [settings, category] = await Promise.all([getSiteSettings(locale), getCategoryBySlug(slug, locale)]);

  if (!category || !category.active) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden">
        <CardContent className="grid gap-6 p-6 md:grid-cols-12 md:p-8">
          <div className="space-y-3 md:col-span-8">
            <Badge variant="outline">{t(locale, "Danh mục", "Category")}</Badge>
            <h1 className="text-4xl leading-tight text-stone-900">{category.name}</h1>
            <p className="max-w-3xl text-stone-700">
              {category.shortDescription ||
                t(
                  locale,
                  "Khám phá vật liệu cao cấp và sản phẩm gỗ thủ công trong danh mục này.",
                  "Explore premium materials and handcrafted wood products in this category.",
                )}
            </p>
          </div>
          <div className="md:col-span-4">
            <ContactActions
              phoneNumber={settings.phoneNumber}
              zaloLink={settings.zaloLink}
              primaryLabel={settings.contactPrimaryLabel}
              secondaryLabel={settings.contactSecondaryLabel}
              vertical
              locale={locale}
            />
          </div>
        </CardContent>
      </Card>

      <SectionHeading
        title={t(
          locale,
          `${category.products.length} sản phẩm trong ${category.name}`,
          `${category.products.length} products in ${category.name}`,
        )}
        locale={locale}
      />

      {category.products.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {category.products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              phoneNumber={settings.phoneNumber}
              zaloLink={settings.zaloLink}
              locale={locale}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-stone-600">
          {t(locale, "Danh mục này chưa có sản phẩm đang hiển thị.", "No active products in this category yet.")}
        </div>
      )}
    </div>
  );
}
