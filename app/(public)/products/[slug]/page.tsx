import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { ContactActions } from "@/components/public/contact-actions";
import { ProductGallery } from "@/components/public/product-gallery";
import { ProductCard } from "@/components/public/product-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { type Locale, t, withLocalePath } from "@/lib/i18n";
import { getProductBySlug, getSiteSettings } from "@/lib/queries";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

async function generateProductDetailMetadata(
  { params }: ProductDetailPageProps,
  locale: Locale,
): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug, locale);

  if (!product) {
    return {
      title: t(locale, "Không tìm thấy sản phẩm", "Product not found"),
    };
  }

  return {
    title: `${product.name} | ${t(locale, "Sản phẩm gỗ", "Wood Product")}`,
    description: product.shortDescription || product.description || undefined,
    alternates: {
      canonical: `/products/${slug}`,
      languages: {
        vi: `/products/${slug}`,
        en: `/en/products/${slug}`,
      },
    },
  };
}

export async function generateMetadata(props: ProductDetailPageProps): Promise<Metadata> {
  return generateProductDetailMetadata(props, "vi");
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  return <ProductDetailPageContent params={params} locale="vi" />;
}

async function ProductDetailPageContent({
  params,
  locale,
}: ProductDetailPageProps & { locale: Locale }) {
  const { slug } = await params;
  const [settings, product] = await Promise.all([getSiteSettings(locale), getProductBySlug(slug, locale)]);

  if (!product || !product.active) {
    notFound();
  }

  const gallery = [
    ...(product.thumbnailUrl ? [product.thumbnailUrl] : []),
    ...product.images.map((image) => image.url),
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-1 text-sm text-stone-500">
        <Link href={withLocalePath(locale, "/")} className="hover:text-stone-700">
          {t(locale, "Trang chủ", "Home")}
        </Link>
        <ChevronRight className="size-4" />
        <Link href={withLocalePath(locale, "/products")} className="hover:text-stone-700">
          {t(locale, "Sản phẩm", "Products")}
        </Link>
        {product.category ? (
          <>
            <ChevronRight className="size-4" />
            <Link href={withLocalePath(locale, `/categories/${product.category.slug}`)} className="hover:text-stone-700">
              {product.category.name}
            </Link>
          </>
        ) : null}
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ProductGallery images={gallery} alt={product.name} />
        </div>
        <div className="space-y-5 lg:col-span-5">
          <div className="space-y-3">
            {product.category ? <Badge variant="outline">{product.category.name}</Badge> : null}
            <h1 className="text-4xl leading-tight text-stone-900">{product.name}</h1>
            {product.shortDescription ? <p className="text-stone-700">{product.shortDescription}</p> : null}
            {product.description ? <p className="text-sm leading-relaxed text-stone-600">{product.description}</p> : null}
          </div>

          <Card>
            <CardContent className="p-5">
              <h2 className="mb-3 text-xl font-semibold text-stone-900">
                {t(locale, "Thông số kỹ thuật", "Specifications")}
              </h2>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-stone-500">{t(locale, "Loại gỗ", "Wood type")}</dt>
                  <dd className="font-medium text-stone-900">
                    {product.woodType || t(locale, "Theo yêu cầu", "Custom")}
                  </dd>
                </div>
                <div>
                  <dt className="text-stone-500">{t(locale, "Vật liệu", "Material")}</dt>
                  <dd className="font-medium text-stone-900">
                    {product.material || t(locale, "Theo yêu cầu", "Custom")}
                  </dd>
                </div>
                <div>
                  <dt className="text-stone-500">{t(locale, "Kích thước", "Dimensions")}</dt>
                  <dd className="font-medium text-stone-900">
                    {product.dimensions || t(locale, "Theo yêu cầu", "On request")}
                  </dd>
                </div>
                <div>
                  <dt className="text-stone-500">{t(locale, "Hoàn thiện", "Finish")}</dt>
                  <dd className="font-medium text-stone-900">
                    {product.finish || t(locale, "Theo yêu cầu", "On request")}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <ContactActions
            phoneNumber={settings.phoneNumber}
            zaloLink={settings.zaloLink}
            primaryLabel={settings.contactPrimaryLabel}
            secondaryLabel={settings.contactSecondaryLabel}
            vertical
            locale={locale}
          />
        </div>
      </div>

      {product.relatedProducts.length ? (
        <section className="space-y-4">
          <h2 className="text-3xl text-stone-900">
            {t(locale, "Sản phẩm liên quan", "Related products")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {product.relatedProducts.map((relatedProduct) => (
              <ProductCard
                key={relatedProduct.id}
                product={relatedProduct}
                phoneNumber={settings.phoneNumber}
                zaloLink={settings.zaloLink}
                locale={locale}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
