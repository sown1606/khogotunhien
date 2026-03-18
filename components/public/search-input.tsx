"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type SearchInputProps = {
  initialValue?: string;
  placeholder?: string;
  className?: string;
};

export function SearchInput({
  initialValue = "",
  placeholder = "Search wood products, categories, or materials...",
  className,
}: SearchInputProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const keyword = value.trim();

    if (!keyword) {
      router.push("/products");
      return;
    }

    router.push(`/search?q=${encodeURIComponent(keyword)}`);
  };

  return (
    <form onSubmit={onSubmit} className={className}>
      <div className="relative flex items-center">
        <Search className="pointer-events-none absolute left-3 size-4 text-stone-400" />
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          className="h-11 rounded-full border-stone-300 pl-9 pr-28 text-sm"
          aria-label="Search"
        />
        <Button type="submit" className="absolute right-1.5 h-8 px-4 text-xs">
          Search
        </Button>
      </div>
    </form>
  );
}
