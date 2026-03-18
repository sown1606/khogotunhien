import { FloatingContact } from "@/components/public/floating-contact";
import { HtmlLang } from "@/components/public/html-lang";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { getNavigationCategories, getSiteSettings } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = "vi";
  const [settings, categories] = await Promise.all([
    getSiteSettings(locale),
    getNavigationCategories(locale),
  ]);

  return (
    <div className="min-h-screen bg-background" lang={locale}>
      <HtmlLang locale={locale} />
      <SiteHeader
        companyName={settings.companyName}
        logoUrl={settings.logoUrl}
        phoneNumber={settings.phoneNumber}
        zaloLink={settings.zaloLink}
        categories={categories}
        locale={locale}
      />
      <main className="mx-auto min-h-[60vh] max-w-7xl px-4 pb-32 pt-6 lg:px-8">{children}</main>
      <SiteFooter
        companyName={settings.companyName}
        companyDescription={settings.companyDescription}
        logoUrl={settings.logoUrl}
        address={settings.address}
        email={settings.email}
        phoneNumber={settings.phoneNumber}
        zaloLink={settings.zaloLink}
        facebookLink={settings.facebookLink}
        tiktokLink={settings.tiktokLink}
        footerContent={settings.footerContent}
        openingHours={settings.openingHours}
        locale={locale}
      />
      <FloatingContact
        phoneNumber={settings.phoneNumber}
        zaloLink={settings.zaloLink}
        primaryLabel={settings.contactPrimaryLabel}
        secondaryLabel={settings.contactSecondaryLabel}
        locale={locale}
      />
    </div>
  );
}
