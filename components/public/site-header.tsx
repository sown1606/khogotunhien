"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, MessageCircle, Phone, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/public/search-input";
import { cn, normalizePhoneLink } from "@/lib/utils";

type HeaderCategory = {
  id: string;
  name: string;
  slug: string;
};

type SiteHeaderProps = {
  companyName: string;
  logoUrl?: string | null;
  phoneNumber?: string | null;
  zaloLink?: string | null;
  categories: HeaderCategory[];
};

const navigationItems = [
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({
  companyName,
  logoUrl,
  phoneNumber,
  zaloLink,
  categories,
}: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 border-b border-transparent bg-[#f6f3ef]/80 backdrop-blur-xl transition-all",
          scrolled && "border-stone-200 bg-[#f6f3ef]/95 shadow-[0_10px_32px_-24px_rgba(53,34,20,0.6)]",
        )}
      >
        <div className="mx-auto max-w-7xl px-4 py-3 lg:px-8">
          <div className="flex items-center gap-3 lg:gap-6">
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <Image
                src={logoUrl || "/logo.svg"}
                alt={companyName}
                width={180}
                height={42}
                className="h-9 w-auto object-contain"
                priority
              />
            </Link>

            <div className="hidden flex-1 lg:block">
              <SearchInput />
            </div>

            <nav className="hidden items-center gap-1 lg:flex">
              {navigationItems.map((item) => (
                <Button key={item.href} asChild variant="ghost" size="sm" className="text-stone-700">
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              ))}
            </nav>

            <div className="ml-auto hidden items-center gap-2 lg:flex">
              {zaloLink ? (
                <Button asChild size="sm" variant="secondary">
                  <Link href={zaloLink} target="_blank" rel="noreferrer">
                    <MessageCircle className="size-4" />
                    Zalo
                  </Link>
                </Button>
              ) : null}
              {phoneNumber ? (
                <Button asChild size="sm">
                  <a href={normalizePhoneLink(phoneNumber)}>
                    <Phone className="size-4" />
                    Call now
                  </a>
                </Button>
              ) : null}
            </div>

            <Button
              size="icon"
              variant="outline"
              className="h-10 w-10 rounded-full lg:hidden"
              onClick={() => setMenuOpen((previous) => !previous)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X /> : <Menu />}
            </Button>
          </div>

          <div className="mt-3 lg:hidden">
            <SearchInput />
          </div>

          <div className="no-scrollbar -mx-1 mt-3 hidden overflow-x-auto lg:block">
            <div className="flex min-w-max items-center gap-2 px-1">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="rounded-full border border-stone-300/80 bg-white px-3 py-1.5 text-sm text-stone-700 transition-colors hover:border-amber-400 hover:text-amber-900"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm lg:hidden"
            onClick={() => setMenuOpen(false)}
          >
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="absolute right-0 top-0 h-full w-[86vw] max-w-sm bg-[#f8f5f1] p-6"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <Image
                  src={logoUrl || "/logo.svg"}
                  alt={companyName}
                  width={160}
                  height={38}
                  className="h-8 w-auto"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-full"
                  onClick={() => setMenuOpen(false)}
                >
                  <X />
                </Button>
              </div>

              <div className="space-y-1">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block rounded-xl px-3 py-2.5 font-medium text-stone-800 hover:bg-stone-200/70"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="mt-6 grid gap-2">
                {zaloLink ? (
                  <Button asChild variant="secondary" onClick={() => setMenuOpen(false)}>
                    <Link href={zaloLink} target="_blank" rel="noreferrer">
                      <MessageCircle className="size-4" />
                      Contact via Zalo
                    </Link>
                  </Button>
                ) : null}
                {phoneNumber ? (
                  <Button asChild onClick={() => setMenuOpen(false)}>
                    <a href={normalizePhoneLink(phoneNumber)}>
                      <Phone className="size-4" />
                      Call now
                    </a>
                  </Button>
                ) : null}
              </div>

              <div className="mt-8">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
                  Browse materials
                </p>
                <div className="grid gap-2">
                  {categories.slice(0, 8).map((category) => (
                    <Link
                      key={category.id}
                      href={`/categories/${category.slug}`}
                      className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700"
                      onClick={() => setMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
