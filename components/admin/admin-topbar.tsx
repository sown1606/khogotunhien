"use client";

import { LogOut, Search } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AdminTopbarProps = {
  userName?: string | null;
};

export function AdminTopbar({ userName }: AdminTopbarProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(`/admin/products?q=${encodeURIComponent(keyword.trim())}`);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-[#f6f3ef]/90 px-4 py-3 backdrop-blur-xl lg:px-6">
      <div className="flex items-center gap-3">
        <form onSubmit={onSearch} className="relative hidden flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Search products..."
            className="h-10 rounded-full border-stone-300 bg-white pl-9"
          />
        </form>
        <div className="ml-auto flex items-center gap-3">
          <p className="hidden text-sm text-stone-600 sm:block">Hello, {userName || "Admin"}</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
          >
            <LogOut className="size-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
