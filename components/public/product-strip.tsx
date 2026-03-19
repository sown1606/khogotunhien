import { ProductCard } from "@/components/public/product-card";
import { SectionHeading } from "@/components/public/section-heading";
import { type Locale, t } from "@/lib/i18n";

type Product = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  thumbnailUrl: string | null;
  woodType: string | null;
  material: string | null;
  category?: { name: string; slug: string } | null;
};

type ProductStripProps = {
  title: string;
  description?: string | null;
  products: Product[];
  phoneNumber?: string | null;
  zaloLink?: string | null;
  href?: string;
  locale?: Locale;
};

export function ProductStrip({
  title,
  description,
  products,
  phoneNumber,
  zaloLink,
  href,
  locale = "vi",
}: ProductStripProps) {
  if (!products.length) return null;

  return (
    <section>
      <SectionHeading
        eyebrow={t(locale, "Bộ sưu tập gỗ", "Wood showcase")}
        title={title}
        description={description}
        href={href}
        hrefLabel={t(locale, "Xem tất cả sản phẩm", "Browse all products")}
        locale={locale}
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            phoneNumber={phoneNumber}
            zaloLink={zaloLink}
            compact
            locale={locale}
          />
        ))}
      </div>
    </section>
  );
}
