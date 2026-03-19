import { HomepageDynamicSections } from "@/components/public/homepage-dynamic-sections";
import { HeroSection } from "@/components/public/hero-section";
import { CategoryStrip } from "@/components/public/category-strip";
import { ProductStrip } from "@/components/public/product-strip";
import { DiscoveryToolbar } from "@/components/public/discovery-toolbar";
import { type Locale, t, withLocalePath } from "@/lib/i18n";
import {
  getFeaturedCategories,
  getFeaturedProducts,
  getHomepageSections,
  getSiteSettings,
} from "@/lib/queries";

async function HomePageContent({ locale }: { locale: Locale }) {
  const [settings, featuredCategories, featuredProducts, sections] = await Promise.all([
    getSiteSettings(locale),
    getFeaturedCategories(8, locale),
    getFeaturedProducts(10, locale),
    getHomepageSections(locale),
  ]);
  const hasDynamicSections = sections.length > 0;
  const hasFallbackContent = featuredCategories.length > 0 || featuredProducts.length > 0;
  const orderedSections = [...sections].sort((sectionA, sectionB) => {
    const sectionPriority = (value: string) => {
      if (value === "FEATURED_PRODUCTS") return 0;
      if (value === "FEATURED_CATEGORIES") return 1;
      return 2;
    };

    return sectionPriority(sectionA.type) - sectionPriority(sectionB.type);
  });

  return (
    <div className="space-y-14 pb-6">
      <HeroSection
        companyName={settings.companyName}
        companyDescription={settings.companyDescription}
        phoneNumber={settings.phoneNumber}
        zaloLink={settings.zaloLink}
        locale={locale}
      />
      <DiscoveryToolbar categories={featuredCategories} locale={locale} />

      {hasDynamicSections ? (
        <HomepageDynamicSections
          sections={orderedSections}
          phoneNumber={settings.phoneNumber}
          zaloLink={settings.zaloLink}
        />
      ) : hasFallbackContent ? (
        <>
          <ProductStrip
            title={t(locale, "Sản phẩm nổi bật", "Featured Products")}
            description={t(
              locale,
              "Sản phẩm thủ công và vật liệu cao cấp sẵn sàng tư vấn theo yêu cầu.",
              "Crafted products and ready-to-order materials from our workshop.",
            )}
            products={featuredProducts}
            phoneNumber={settings.phoneNumber}
            zaloLink={settings.zaloLink}
            href={withLocalePath(locale, "/products")}
            locale={locale}
          />

          <CategoryStrip
            title={t(locale, "Danh mục nổi bật", "Featured Categories")}
            description={t(
              locale,
              "Khám phá các nhóm vật liệu được chọn lọc cho nội thất và dự án thi công.",
              "Explore curated material families for custom furniture and interior projects.",
            )}
            categories={featuredCategories}
            href={withLocalePath(locale, "/categories")}
            locale={locale}
          />
        </>
      ) : (
        <section className="rounded-3xl border border-dashed border-stone-300 bg-white p-8 text-center">
          <h2 className="text-2xl text-stone-900">
            {t(locale, "Danh mục đang được cập nhật", "Fresh catalog in progress")}
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            {t(
              locale,
              "Hãy thêm danh mục và sản phẩm từ trang quản trị để hiển thị nội dung trang chủ.",
              "Add categories and products from admin to publish your live showroom sections.",
            )}
          </p>
        </section>
      )}
    </div>
  );
}

export default async function HomePage() {
  return <HomePageContent locale="vi" />;
}
