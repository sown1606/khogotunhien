import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { type Locale, t } from "@/lib/i18n";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string | null;
  href?: string;
  hrefLabel?: string;
  locale?: Locale;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  hrefLabel,
  locale = "vi",
}: SectionHeadingProps) {
  const effectiveHrefLabel = hrefLabel || t(locale, "Xem tất cả", "View all");

  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div className="space-y-1.5">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">{eyebrow}</p>
        ) : null}
        <h2 className="text-3xl leading-tight text-stone-900 md:text-4xl">{title}</h2>
        {description ? <p className="max-w-2xl text-sm text-stone-600">{description}</p> : null}
      </div>
      {href ? (
        <Link
          href={href}
          className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 transition hover:border-amber-500 hover:text-amber-900"
        >
          {effectiveHrefLabel}
          <ArrowRight className="size-4" />
        </Link>
      ) : null}
    </div>
  );
}
