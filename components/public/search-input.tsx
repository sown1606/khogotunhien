"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type Locale, t, withLocalePath } from "@/lib/i18n";

type SearchInputProps = {
  locale?: Locale;
  initialValue?: string;
  placeholder?: string;
  className?: string;
};

export function SearchInput({
  locale = "vi",
  initialValue = "",
  placeholder,
  className,
}: SearchInputProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const effectivePlaceholder =
    placeholder ||
    t(
      locale,
      "Tìm kiếm sản phẩm gỗ, danh mục hoặc vật liệu...",
      "Search wood products, categories, or materials...",
    );

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const keyword = value.trim();

    if (!keyword) {
      router.push(withLocalePath(locale, "/products"));
      return;
    }

    router.push(`${withLocalePath(locale, "/search")}?q=${encodeURIComponent(keyword)}`);
  };

  return (
    <form onSubmit={onSubmit} className={className}>
      <div className="relative flex items-center">
        <Search className="pointer-events-none absolute left-4 size-4 text-stone-500" />
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={effectivePlaceholder}
          className="h-12 rounded-full border-stone-400 bg-white pl-10 pr-28 text-sm shadow-[0_8px_16px_-12px_rgba(43,30,20,0.35)]"
          aria-label={t(locale, "Tìm kiếm", "Search")}
        />
        <Button
          type="submit"
          className="absolute right-1.5 h-9 rounded-full bg-stone-900 px-4 text-xs text-white hover:bg-stone-800"
        >
          {t(locale, "Tìm", "Search")}
        </Button>
      </div>
    </form>
  );
}
