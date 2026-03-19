import type { Metadata } from "next";
import { Be_Vietnam_Pro, Noto_Serif } from "next/font/google";
import "./globals.css";

import { AppProviders } from "@/components/layout/providers";
import { getSiteMetadataBase } from "@/lib/env";
import { getSiteSettings } from "@/lib/queries";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext", "vietnamese"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const notoSerif = Noto_Serif({
  variable: "--font-cormorant",
  subsets: ["latin", "latin-ext", "vietnamese"],
  display: "swap",
  weight: ["500", "600", "700"],
});

export const revalidate = 180;

export async function generateMetadata(): Promise<Metadata> {
  try {
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
  } catch {
    return {
      metadataBase: getSiteMetadataBase(),
      title: "ĐẠI THIÊN PHÚ WOOD | Tinh hoa của gia đình Việt",
      description:
        "Sản phẩm gỗ cao cấp và giải pháp gia công theo yêu cầu cho gia đình Việt.",
      icons: {
        icon: "/favicon.svg",
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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${beVietnamPro.variable} ${notoSerif.variable} antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
