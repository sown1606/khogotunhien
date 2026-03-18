import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { normalizePhoneLink } from "@/lib/utils";

type ContactActionsProps = {
  phoneNumber?: string | null;
  zaloLink?: string | null;
  primaryLabel?: string | null;
  secondaryLabel?: string | null;
  vertical?: boolean;
};

export function ContactActions({
  phoneNumber,
  zaloLink,
  primaryLabel,
  secondaryLabel,
  vertical,
}: ContactActionsProps) {
  if (!phoneNumber && !zaloLink) return null;

  return (
    <div className={vertical ? "grid gap-2" : "flex flex-wrap gap-2"}>
      {zaloLink ? (
        <Button asChild>
          <Link href={zaloLink} target="_blank" rel="noreferrer">
            <MessageCircle className="size-4" />
            {primaryLabel || "Contact via Zalo"}
          </Link>
        </Button>
      ) : null}
      {phoneNumber ? (
        <Button asChild variant="secondary">
          <a href={normalizePhoneLink(phoneNumber)}>
            <Phone className="size-4" />
            {secondaryLabel || "Call now"}
          </a>
        </Button>
      ) : null}
    </div>
  );
}
