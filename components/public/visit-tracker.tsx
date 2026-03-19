"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { type Locale } from "@/lib/i18n";

type VisitTrackerProps = {
  locale: Locale;
};

export function VisitTracker({ locale }: VisitTrackerProps) {
  const pathname = usePathname() || "/";

  useEffect(() => {
    const query = typeof window === "undefined" ? "" : window.location.search.replace(/^\?/, "");
    const fullPath = query ? `${pathname}?${query}` : pathname;
    const dedupeKey = `visit:${fullPath}`;

    if (sessionStorage.getItem(dedupeKey)) {
      return;
    }
    sessionStorage.setItem(dedupeKey, "1");

    const payload = JSON.stringify({
      path: fullPath,
      locale,
      referrer: document.referrer || "",
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/public/visit",
        new Blob([payload], { type: "application/json" }),
      );
      return;
    }

    void fetch("/api/public/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    });
  }, [locale, pathname]);

  return null;
}
