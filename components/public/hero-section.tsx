"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/public/search-input";
import { normalizePhoneLink } from "@/lib/utils";

type HeroSectionProps = {
  companyName: string;
  companyDescription?: string | null;
  phoneNumber?: string | null;
  zaloLink?: string | null;
};

export function HeroSection({
  companyName,
  companyDescription,
  phoneNumber,
  zaloLink,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-stone-200 bg-white">
      <div className="absolute inset-0 wood-gradient opacity-90" />
      <div className="absolute -right-10 -top-16 h-64 w-64 rounded-full bg-amber-200/40 blur-3xl" />
      <div className="relative grid items-center gap-8 px-5 py-10 md:px-8 md:py-12 lg:grid-cols-12 lg:gap-10 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="space-y-6 lg:col-span-7"
        >
          <p className="inline-flex rounded-full border border-amber-300/60 bg-amber-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--wood-800)]">
            Crafted for premium projects
          </p>
          <h1 className="max-w-2xl text-4xl leading-[1.05] text-[var(--wood-900)] sm:text-5xl lg:text-6xl">
            Discover premium wood products at {companyName}
          </h1>
          <p className="max-w-xl text-base text-stone-700 sm:text-lg">
            {companyDescription ||
              "Explore elegant wood materials, custom builds, and interior collections designed for architects, makers, and homeowners."}
          </p>

          <SearchInput className="max-w-xl" />

          <div className="flex flex-wrap gap-3">
            {zaloLink ? (
              <Button asChild size="lg">
                <Link href={zaloLink} target="_blank" rel="noreferrer">
                  <MessageCircle className="size-4" />
                  Contact via Zalo
                </Link>
              </Button>
            ) : null}
            {phoneNumber ? (
              <Button asChild variant="secondary" size="lg">
                <a href={normalizePhoneLink(phoneNumber)}>
                  <Phone className="size-4" />
                  Request consultation
                </a>
              </Button>
            ) : null}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative lg:col-span-5"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-amber-200/60 shadow-[0_30px_60px_-35px_rgba(77,50,31,0.55)]">
            <Image
              src="https://images.unsplash.com/photo-1616594039964-3c367f53d24f?auto=format&fit=crop&w=1200&q=80"
              alt="Wood showcase"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 34vw"
            />
          </div>
          <div className="absolute -bottom-4 -left-4 rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-lg">
            <p className="text-xs uppercase tracking-[0.12em] text-stone-500">Smooth finish</p>
            <p className="text-lg font-semibold text-stone-900">Ready for custom orders</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
