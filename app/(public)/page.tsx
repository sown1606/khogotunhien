import { HomepageDynamicSections } from "@/components/public/homepage-dynamic-sections";
import { HeroSection } from "@/components/public/hero-section";
import { CategoryStrip } from "@/components/public/category-strip";
import { ProductStrip } from "@/components/public/product-strip";
import {
  getFeaturedCategories,
  getFeaturedProducts,
  getHomepageSections,
  getSiteSettings,
} from "@/lib/queries";

export default async function HomePage() {
  const [settings, featuredCategories, featuredProducts, sections] = await Promise.all([
    getSiteSettings(),
    getFeaturedCategories(8),
    getFeaturedProducts(10),
    getHomepageSections(),
  ]);

  return (
    <div className="space-y-14 pb-6">
      <HeroSection
        companyName={settings.companyName}
        companyDescription={settings.companyDescription}
        phoneNumber={settings.phoneNumber}
        zaloLink={settings.zaloLink}
      />

      <CategoryStrip
        title="Browse Popular Wood Categories"
        description="Find solid wood, specialty panels, and handcrafted material groups in one place."
        categories={featuredCategories}
        href="/categories"
      />

      <ProductStrip
        title="Featured Products"
        description="Carefully selected pieces and materials from our current workshop lineup."
        products={featuredProducts}
        phoneNumber={settings.phoneNumber}
        zaloLink={settings.zaloLink}
        href="/products"
      />

      <HomepageDynamicSections
        sections={sections}
        phoneNumber={settings.phoneNumber}
        zaloLink={settings.zaloLink}
      />
    </div>
  );
}
