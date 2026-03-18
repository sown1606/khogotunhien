import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

import { AppProviders } from "@/components/layout/providers";
import { getSiteMetadataBase } from "@/lib/env";
import { getSiteSettings } from "@/lib/queries";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
});

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings("vi");
  const title = settings.seoTitle || `${settings.companyName} | Sản phẩm gỗ cao cấp`;
  const description =
    settings.seoDescription ||
    settings.companyDescription ||
    "Sản phẩm gỗ cao cấp, gia công theo yêu cầu và vật liệu nội thất cho gia đình Việt.";
  const keywords = settings.seoKeywords?.split(",").map((keyword) => keyword.trim());
  const metadataBase = getSiteMetadataBase();

  return {
    metadataBase,
    title,
    description,
    keywords,
    icons: {
      icon: settings.faviconUrl || "/favicon.svg",
    },
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: "/",
      languages: {
        vi: "/",
        en: "/en",
      },
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${manrope.variable} ${cormorant.variable} antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
