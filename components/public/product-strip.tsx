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
      <div className="no-scrollbar -mx-4 overflow-x-auto px-4 pb-2">
        <div className="grid min-w-max snap-x snap-mandatory grid-flow-col auto-cols-[64%] gap-3 sm:auto-cols-[39%] lg:auto-cols-[22%]">
          {products.map((product) => (
            <div key={product.id} className="snap-start">
              <ProductCard
                product={product}
                phoneNumber={phoneNumber}
                zaloLink={zaloLink}
                compact
                locale={locale}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
