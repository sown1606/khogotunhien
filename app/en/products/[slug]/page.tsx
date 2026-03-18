import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { ContactActions } from "@/components/public/contact-actions";
import { ProductGallery } from "@/components/public/product-gallery";
import { ProductCard } from "@/components/public/product-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { withLocalePath } from "@/lib/i18n";
import { getProductBySlug, getSiteSettings } from "@/lib/queries";

type EnglishProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: EnglishProductDetailPageProps): Promise<Metadata> {
  const locale = "en";
  const { slug } = await params;
  const product = await getProductBySlug(slug, locale);

  if (!product) {
    return {
      title: "Product not found",
    };
  }

  return {
    title: `${product.name} | Wood Product`,
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

export default async function EnglishProductDetailPage({ params }: EnglishProductDetailPageProps) {
  const locale = "en";
  const { slug } = await params;
  const [settings, product] = await Promise.all([
    getSiteSettings(locale),
    getProductBySlug(slug, locale),
  ]);

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
          Home
        </Link>
        <ChevronRight className="size-4" />
        <Link href={withLocalePath(locale, "/products")} className="hover:text-stone-700">
          Products
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
              <h2 className="mb-3 text-xl font-semibold text-stone-900">Specifications</h2>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-stone-500">Wood type</dt>
                  <dd className="font-medium text-stone-900">{product.woodType || "Custom"}</dd>
                </div>
                <div>
                  <dt className="text-stone-500">Material</dt>
                  <dd className="font-medium text-stone-900">{product.material || "Custom"}</dd>
                </div>
                <div>
                  <dt className="text-stone-500">Dimensions</dt>
                  <dd className="font-medium text-stone-900">{product.dimensions || "On request"}</dd>
                </div>
                <div>
                  <dt className="text-stone-500">Finish</dt>
                  <dd className="font-medium text-stone-900">{product.finish || "On request"}</dd>
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
          <h2 className="text-3xl text-stone-900">Related products</h2>
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
