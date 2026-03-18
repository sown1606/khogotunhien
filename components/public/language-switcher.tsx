"use client";

import Link from "next/link";
import { usePathname, useSearchParams, type ReadonlyURLSearchParams } from "next/navigation";

import { type Locale, getLocaleFromPathname, stripLocalePrefix, withLocalePath } from "@/lib/i18n";

function getLocalizedHref(pathname: string, searchParams: ReadonlyURLSearchParams, targetLocale: Locale) {
  const basePath = stripLocalePrefix(pathname || "/");
  const localizedPath = withLocalePath(targetLocale, basePath);
  const query = searchParams.toString();
  return query ? `${localizedPath}?${query}` : localizedPath;
}

export function LanguageSwitcher() {
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const currentLocale = getLocaleFromPathname(pathname);

  const viHref = getLocalizedHref(pathname, searchParams, "vi");
  const enHref = getLocalizedHref(pathname, searchParams, "en");

  return (
    <div className="inline-flex items-center rounded-full border border-stone-300 bg-white p-1 text-xs font-semibold">
      <Link
        href={viHref}
        className={`rounded-full px-2.5 py-1 transition ${
          currentLocale === "vi" ? "bg-stone-900 text-white" : "text-stone-700 hover:text-stone-900"
        }`}
      >
        VI
      </Link>
      <Link
        href={enHref}
        className={`rounded-full px-2.5 py-1 transition ${
          currentLocale === "en" ? "bg-stone-900 text-white" : "text-stone-700 hover:text-stone-900"
        }`}
      >
        EN
      </Link>
    </div>
  );
}
