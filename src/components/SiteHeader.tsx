"use client";

import { Leaf } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/"; const isRecipes = pathname.startsWith("/recipes");

  const linkStyle = (active: boolean) =>
    cn(
      "rounded-full px-3 py-2 text-xs font-bold transition sm:px-4 sm:text-sm",
      active
        ? "bg-emerald-950 text-white"
        : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-900"
    );

  return (
    <header className="sticky top-0 z-50 bg-[#fbfcf8]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label="SafePlate home">
          <span className="grid size-9 place-items-center rounded-xl bg-emerald-950 text-lime-300">
            <Leaf className="size-4.5" strokeWidth={2.4} />
          </span>
          <span className="font-heading text-lg font-bold tracking-tight text-emerald-950">
            SafePlate
          </span>
        </Link>

        <nav aria-label="Primary navigation" className="flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
          <Link
            href="/"
            aria-current={isHome ? "page" : undefined}
            className={linkStyle(isHome)}
          >
            Home
          </Link>
          <Link
            href="/recipes"
            aria-current={isRecipes ? "page" : undefined}
            className={linkStyle(isRecipes)}
          >
            Recipe Network
          </Link>
        </nav>
      </div>
    </header>
  );
}
