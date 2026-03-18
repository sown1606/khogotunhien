"use client";

import { useEffect } from "react";

import type { Locale } from "@/lib/i18n";

type HtmlLangProps = {
  locale: Locale;
};

export function HtmlLang({ locale }: HtmlLangProps) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
