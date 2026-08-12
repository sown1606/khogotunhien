import Link from "next/link";

import { CategoryStrip } from "@/components/public/category-strip";
import { CustomerProjectGallery } from "@/components/public/customer-project-gallery";
import { ProductStrip } from "@/components/public/product-strip";
import { SafeImage } from "@/components/public/safe-image";
import { SectionHeading } from "@/components/public/section-heading";
import { Badge } from "@/components/ui/badge";
import { type Locale, t, withLocalePath } from "@/lib/i18n";
import { resolveWoodDemoImage } from "@/lib/utils";

type HomepageSectionWithItems = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  type: "FEATURED_PRODUCTS" | "FEATURED_CATEGORIES" | "CURATED_COLLECTION" | "PROMOTIONAL" | "CUSTOM";
  items: Array<{
    id: string;
    customTitle: string | null;
    customDescription: string | null;
    imageUrl: string | null;
    linkUrl: string | null;
    product: {
      id: string;
      name: string;
      slug: string;
      shortDescription: string | null;
      thumbnailUrl: string | null;
      woodType: string | null;
      material: string | null;
      category?: { name: string; slug: string } | null;
    } | null;
    category: {
      id: string;
      name: string;
      slug: string;
      shortDescription: string | null;
      imageUrl: string | null;
    } | null;
  }>;
};

type HomepageDynamicSectionsProps = {
  sections: HomepageSectionWithItems[];
  phoneNumber?: string | null;
  zaloLink?: string | null;
  locale?: Locale;
};

type SectionProduct = NonNullable<HomepageSectionWithItems["items"][number]["product"]>;
type SectionCategory = NonNullable<HomepageSectionWithItems["items"][number]["category"]>;

function isCustomerProjectGallery(section: HomepageSectionWithItems) {
  const slug = section.slug.toLowerCase();
  const title = section.title.toLowerCase();

  return (
    slug.includes("customer-project") ||
    slug.includes("wood-project") ||
    slug.includes("cong-trinh") ||
    title.includes("công trình") ||
    title.includes("cong trinh") ||
    title.includes("customer project")
  );
}

export function HomepageDynamicSections({
  sections,
  phoneNumber,
  zaloLink,
  locale = "vi",
}: HomepageDynamicSectionsProps) {
  return (
    <>
      {sections.map((section) => {
        if (section.type === "FEATURED_CATEGORIES") {
          const categories = section.items
            .map((item) => item.category)
            .filter((category): category is SectionCategory => Boolean(category));

          if (!categories.length) {
            return null;
          }

          return (
            <CategoryStrip
              key={section.id}
              title={section.title}
              description={section.description}
              categories={categories.map((category) => ({ ...category }))}
              href={withLocalePath(locale, "/categories")}
              locale={locale}
            />
          );
        }

        if (section.type === "FEATURED_PRODUCTS") {
          const products = section.items
            .map((item) => item.product)
            .filter((product): product is SectionProduct => Boolean(product));

          if (!products.length) {
            return null;
          }

          return (
            <ProductStrip
              key={section.id}
              title={section.title}
              description={section.description}
              products={products.map((product) => ({ ...product }))}
              phoneNumber={phoneNumber}
              zaloLink={zaloLink}
              href={withLocalePath(locale, "/products")}
              locale={locale}
            />
          );
        }

        if (!section.items.length) {
          return null;
        }

        if (isCustomerProjectGallery(section)) {
          const items = section.items.map((item) => {
            const href =
              (item.linkUrl
                ? item.linkUrl.startsWith("/")
                  ? withLocalePath(locale, item.linkUrl)
                  : item.linkUrl
                : null) ||
              (item.product ? withLocalePath(locale, `/products/${item.product.slug}`) : null) ||
              (item.category ? withLocalePath(locale, `/categories/${item.category.slug}`) : null);
            const image = resolveWoodDemoImage(
              item.imageUrl || item.product?.thumbnailUrl || item.category?.imageUrl,
              item.id,
            );
            const title =
              item.customTitle ||
              item.product?.name ||
              item.category?.name ||
              t(locale, "Công trình khách hàng", "Customer project");
            const description =
              item.customDescription ||
              item.product?.shortDescription ||
              item.category?.shortDescription ||
              t(
                locale,
                "Không gian thực tế có sử dụng gỗ tự nhiên.",
                "A real space featuring natural wood.",
              );

            return { id: item.id, title, description, href, image };
          });

          return (
            <CustomerProjectGallery
              key={section.id}
              eyebrow={t(locale, "Không gian thực tế", "Real spaces")}
              title={section.title}
              description={section.description}
              items={items}
            />
          );
        }

        return (
          <section key={section.id}>
            <SectionHeading
              eyebrow={section.type === "PROMOTIONAL" ? t(locale, "Nổi bật", "Highlights") : t(locale, "Tuyển chọn", "Curated")}
              title={section.title}
              description={section.description}
              locale={locale}
            />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {section.items.map((item) => {
                const href =
                  (item.linkUrl
                    ? item.linkUrl.startsWith("/")
                      ? withLocalePath(locale, item.linkUrl)
                      : item.linkUrl
                    : null) ||
                  (item.product ? withLocalePath(locale, `/products/${item.product.slug}`) : null) ||
                  (item.category ? withLocalePath(locale, `/categories/${item.category.slug}`) : null) ||
                  "#";
                const image =
                  resolveWoodDemoImage(
                    item.imageUrl ||
                  item.product?.thumbnailUrl ||
                  item.category?.imageUrl ||
                    "/demo/brand/texture.webp",
                    item.id,
                  );
                const title =
                  item.customTitle ||
                  item.product?.name ||
                  item.category?.name ||
                  t(locale, "Mục nội dung", "Section item");
                const description =
                  item.customDescription ||
                  item.product?.shortDescription ||
                  item.category?.shortDescription ||
                  t(locale, "Khám phá bộ sưu tập gỗ này.", "Explore this wood collection.");

                return (
                  <Link
                    key={item.id}
                    href={href}
                    className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_12px_24px_-20px_rgba(77,50,31,0.45)]"
                  >
                    <div className="relative aspect-[5/3] overflow-hidden">
                      <SafeImage
                        src={image}
                        alt={title}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    <div className="space-y-2 p-4">
                      {section.type === "PROMOTIONAL" ? (
                        <Badge variant="warning">{t(locale, "Khuyến nghị", "Promotional")}</Badge>
                      ) : (
                        <Badge variant="outline">{t(locale, "Bộ sưu tập", "Collection")}</Badge>
                      )}
                      <h3 className="text-xl font-semibold text-stone-900">{title}</h3>
                      <p className="line-clamp-2 text-sm text-stone-600">{description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </>
  );
}
