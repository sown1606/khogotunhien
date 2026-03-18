import { CheckCircle2 } from "lucide-react";

import { ContactActions } from "@/components/public/contact-actions";
import { Card, CardContent } from "@/components/ui/card";
import { getSiteSettings } from "@/lib/queries";

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden">
        <CardContent className="grid gap-8 p-6 md:grid-cols-12 md:p-10">
          <div className="space-y-4 md:col-span-8">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">About us</p>
            <h1 className="text-5xl leading-tight text-stone-900">{settings.companyName}</h1>
            <p className="max-w-3xl text-stone-700">
              {settings.companyDescription ||
                "We supply premium wood products and custom wood solutions for homes, studios, and commercial projects."}
            </p>
          </div>
          <div className="md:col-span-4">
            <ContactActions
              phoneNumber={settings.phoneNumber}
              zaloLink={settings.zaloLink}
              primaryLabel={settings.contactPrimaryLabel}
              secondaryLabel={settings.contactSecondaryLabel}
              vertical
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          "Carefully selected wood species and moisture-controlled stock",
          "Custom dimensions and finishes for interior and architectural projects",
          "Direct consultation via phone and Zalo for fast project support",
        ].map((feature) => (
          <Card key={feature}>
            <CardContent className="flex items-start gap-3 p-5">
              <CheckCircle2 className="mt-0.5 size-5 text-emerald-600" />
              <p className="text-sm text-stone-700">{feature}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
