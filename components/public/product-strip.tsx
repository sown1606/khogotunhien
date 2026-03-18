import { ProductCard } from "@/components/public/product-card";
import { SectionHeading } from "@/components/public/section-heading";

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
};

export function ProductStrip({
  title,
  description,
  products,
  phoneNumber,
  zaloLink,
  href,
}: ProductStripProps) {
  if (!products.length) return null;

  return (
    <section>
      <SectionHeading
        eyebrow="Wood showcase"
        title={title}
        description={description}
        href={href}
        hrefLabel="Browse all products"
      />
      <div className="no-scrollbar -mx-4 overflow-x-auto px-4 pb-2">
        <div className="grid min-w-max grid-flow-col auto-cols-[78%] gap-4 sm:auto-cols-[45%] lg:auto-cols-[29%]">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              phoneNumber={phoneNumber}
              zaloLink={zaloLink}
              compact
            />
          ))}
        </div>
      </div>
    </section>
  );
}
