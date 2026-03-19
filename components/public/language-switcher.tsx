"use client";

import { useEffect, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { type Locale, getLocaleFromPathname, stripLocalePrefix, withLocalePath } from "@/lib/i18n";

function getLocalizedHref(pathname: string, searchParams: Pick<URLSearchParams, "toString">, targetLocale: Locale) {
  const basePath = stripLocalePrefix(pathname || "/");
  const localizedPath = withLocalePath(targetLocale, basePath);
  const query = searchParams.toString();
  return query ? `${localizedPath}?${query}` : localizedPath;
}

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const currentLocale = getLocaleFromPathname(pathname);
  const [isPending, startLocaleTransition] = useTransition();

  const viHref = getLocalizedHref(pathname, searchParams, "vi");
  const enHref = getLocalizedHref(pathname, searchParams, "en");

  useEffect(() => {
    router.prefetch(viHref);
    router.prefetch(enHref);
  }, [enHref, router, viHref]);

  const onSwitchLocale = (targetLocale: Locale) => {
    if (targetLocale === currentLocale) return;
    const targetHref = targetLocale === "vi" ? viHref : enHref;

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
