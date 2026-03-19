"use client";

import { useEffect, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";

import { type Locale, getLocaleFromPathname, stripLocalePrefix, withLocalePath } from "@/lib/i18n";

function getLocalizedHref(pathname: string, queryString: string, targetLocale: Locale) {
  const basePath = stripLocalePrefix(pathname || "/");
  const localizedPath = withLocalePath(targetLocale, basePath);
  return queryString ? `${localizedPath}?${queryString}` : localizedPath;
}

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const currentLocale = getLocaleFromPathname(pathname);
  const [isPending, startLocaleTransition] = useTransition();
  const currentQuery =
    typeof window === "undefined" ? "" : window.location.search.replace(/^\?/, "");

  const viHref = getLocalizedHref(pathname, currentQuery, "vi");
  const enHref = getLocalizedHref(pathname, currentQuery, "en");

  useEffect(() => {
    router.prefetch(viHref);
    router.prefetch(enHref);
  }, [enHref, router, viHref]);

  const onSwitchLocale = (targetLocale: Locale) => {
    if (targetLocale === currentLocale) return;
    const liveQuery = typeof window === "undefined" ? currentQuery : window.location.search.replace(/^\?/, "");
    const targetHref = getLocalizedHref(pathname, liveQuery, targetLocale);

    startLocaleTransition(() => {
      router.replace(targetHref, { scroll: false });
    });
  };

  return (
    <div
      className="inline-flex items-center rounded-full border border-stone-300 bg-white p-1 text-xs font-semibold"
      aria-busy={isPending}
    >
      <button
        type="button"
        onClick={() => onSwitchLocale("vi")}
        disabled={isPending}
        className={`rounded-full px-2.5 py-1 transition ${
          currentLocale === "vi" ? "bg-stone-900 text-white" : "text-stone-700 hover:text-stone-900"
        }`}
      >
        VI
      </button>
      <button
        type="button"
        onClick={() => onSwitchLocale("en")}
        disabled={isPending}
        className={`rounded-full px-2.5 py-1 transition ${
          currentLocale === "en" ? "bg-stone-900 text-white" : "text-stone-700 hover:text-stone-900"
        }`}
      >
        EN
      </button>
    </div>
  );
}
