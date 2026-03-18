import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone, Timer } from "lucide-react";

import { ContactActions } from "@/components/public/contact-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSiteSettings } from "@/lib/queries";
import { normalizePhoneLink } from "@/lib/utils";

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Let&apos;s talk</p>
        <h1 className="text-5xl leading-tight text-stone-900">Contact {settings.companyName}</h1>
        <p className="max-w-2xl text-stone-700">
          Send your project details through Zalo or phone. We will suggest suitable products and materials quickly.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle>Contact details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm text-stone-700">
            {settings.address ? (
              <div className="flex gap-3">
                <MapPin className="mt-0.5 size-4 text-stone-500" />
                <p>{settings.address}</p>
              </div>
            ) : null}
            {settings.phoneNumber ? (
              <div className="flex gap-3">
                <Phone className="mt-0.5 size-4 text-stone-500" />
                <a href={normalizePhoneLink(settings.phoneNumber)} className="hover:text-amber-900">
                  {settings.phoneNumber}
                </a>
              </div>
            ) : null}
            {settings.email ? (
              <div className="flex gap-3">
                <Mail className="mt-0.5 size-4 text-stone-500" />
                <a href={`mailto:${settings.email}`} className="hover:text-amber-900">
                  {settings.email}
                </a>
              </div>
            ) : null}
            {settings.openingHours ? (
              <div className="flex gap-3">
                <Timer className="mt-0.5 size-4 text-stone-500" />
                <p>{settings.openingHours}</p>
              </div>
            ) : null}

            <div className="mt-3 border-t border-stone-200 pt-4">
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

        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle>Social channels</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {settings.zaloLink ? (
              <Link
                href={settings.zaloLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-xl border border-stone-200 p-3 text-sm font-medium text-stone-700 hover:border-amber-400 hover:text-amber-900"
              >
                <MessageCircle className="size-4" />
                Zalo chat
              </Link>
            ) : null}
            {settings.facebookLink ? (
              <Link
                href={settings.facebookLink}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-stone-200 p-3 text-sm font-medium text-stone-700 hover:border-amber-400 hover:text-amber-900"
              >
                Facebook
              </Link>
            ) : null}
            {settings.tiktokLink ? (
              <Link
                href={settings.tiktokLink}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-stone-200 p-3 text-sm font-medium text-stone-700 hover:border-amber-400 hover:text-amber-900"
              >
                TikTok
              </Link>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
