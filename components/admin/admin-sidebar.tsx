"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Logs,
  FolderTree,
  Home,
  Settings,
  ArrowUpRight,
  ChartNoAxesColumn,
} from "lucide-react";

import { cn } from "@/lib/utils";

type SidebarProps = {
  companyName: string;
};

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Logs },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/homepage", label: "Homepage", icon: Home },
  { href: "/admin/insights", label: "Insights", icon: ChartNoAxesColumn },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ companyName }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-72 shrink-0 border-r border-stone-200 bg-white lg:block">
      <div className="border-b border-stone-200 px-6 py-5">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-stone-500">Admin panel</p>
        <h2 className="mt-1 text-2xl text-[var(--wood-900)]">{companyName}</h2>
      </div>

      <nav className="space-y-1 p-4">
        {items.map((item) => {
          const active =
            item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-amber-100/70 text-[var(--wood-900)]"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-3">
        <Link
          href="/"
          target="_blank"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-700 transition hover:border-amber-400 hover:text-amber-900"
        >
          View website
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </aside>
  );
}
