export type Locale = "vi" | "en";

export const DEFAULT_LOCALE: Locale = "vi";

export function normalizeLocale(value?: string | null): Locale {
  return value === "en" ? "en" : "vi";
}

export function t(locale: Locale, vi: string, en: string) {
  return locale === "en" ? en : vi;
}

export function withLocalePath(locale: Locale, path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (locale === "en") {
    return normalizedPath === "/" ? "/en" : `/en${normalizedPath}`;
  }

  return normalizedPath;
}

export function stripLocalePrefix(pathname: string) {
  if (pathname === "/en") return "/";
  if (pathname.startsWith("/en/")) return pathname.slice(3);
  return pathname;
}

export function getLocaleFromPathname(pathname: string): Locale {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "vi";
}

export function localizeValue(locale: Locale, viValue?: string | null, enValue?: string | null) {
  const vi = viValue?.trim();
  const en = enValue?.trim();

  if (locale === "en") {
    return en || vi || "";
  }

  return vi || en || "";
}
