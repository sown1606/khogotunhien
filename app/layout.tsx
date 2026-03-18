import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

import { AppProviders } from "@/components/layout/providers";
import { getSiteSettings } from "@/lib/queries";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const title = settings.seoTitle || `${settings.companyName} | Premium Wood Products`;
  const description =
    settings.seoDescription ||
    settings.companyDescription ||
    "Premium wood products, custom wood craftsmanship, and interior wood materials.";
  const keywords = settings.seoKeywords?.split(",").map((keyword) => keyword.trim());

  return {
    title,
    description,
    keywords,
    icons: {
      icon: settings.faviconUrl || "/favicon.ico",
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
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${cormorant.variable} antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
