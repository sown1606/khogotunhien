import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { type Locale, t } from "@/lib/i18n";
import { normalizePhoneLink } from "@/lib/utils";

type ContactActionsProps = {
  phoneNumber?: string | null;
  zaloLink?: string | null;
  primaryLabel?: string | null;
  secondaryLabel?: string | null;
  vertical?: boolean;
  locale?: Locale;
};

export function ContactActions({
  phoneNumber,
  zaloLink,
  primaryLabel,
  secondaryLabel,
  vertical,
  locale = "vi",
}: ContactActionsProps) {
  if (!phoneNumber && !zaloLink) return null;

  return (
    <div className={vertical ? "grid gap-2" : "flex flex-wrap gap-2"}>
      {zaloLink ? (
        <Button asChild>
          <Link href={zaloLink} target="_blank" rel="noreferrer">
            <MessageCircle className="size-4" />
            {primaryLabel || t(locale, "Nhắn Zalo", "Contact via Zalo")}
          </Link>
        </Button>
      ) : null}
      {phoneNumber ? (
        <Button asChild variant="secondary">
          <a href={normalizePhoneLink(phoneNumber)}>
            <Phone className="size-4" />
            {secondaryLabel || t(locale, "Gọi ngay", "Call now")}
          </a>
        </Button>
      ) : null}
    </div>
  );
}
