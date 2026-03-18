"use client";

import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { type Locale, t } from "@/lib/i18n";
import { normalizePhoneLink } from "@/lib/utils";

type FloatingContactProps = {
  phoneNumber?: string | null;
  zaloLink?: string | null;
  primaryLabel?: string | null;
  secondaryLabel?: string | null;
  locale?: Locale;
};

export function FloatingContact({
  phoneNumber,
  zaloLink,
  primaryLabel,
  secondaryLabel,
  locale = "vi",
}: FloatingContactProps) {
  if (!zaloLink && !phoneNumber) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut", delay: 0.2 }}
      className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-1rem)] max-w-md -translate-x-1/2 rounded-2xl border border-stone-200 bg-white/95 p-2 shadow-xl backdrop-blur-sm sm:bottom-5"
    >
      <div className="grid grid-cols-2 gap-2">
        {zaloLink ? (
          <Button asChild className="h-10 text-xs sm:text-sm">
            <Link href={zaloLink} target="_blank" rel="noreferrer">
              <MessageCircle className="size-4" />
              {primaryLabel || t(locale, "Nhắn Zalo", "Contact via Zalo")}
            </Link>
          </Button>
        ) : (
          <div />
        )}
        {phoneNumber ? (
          <Button asChild variant="secondary" className="h-10 text-xs sm:text-sm">
            <a href={normalizePhoneLink(phoneNumber)}>
              <Phone className="size-4" />
              {secondaryLabel || t(locale, "Gọi ngay", "Call now")}
            </a>
          </Button>
        ) : (
          <div />
        )}
      </div>
    </motion.div>
  );
}
