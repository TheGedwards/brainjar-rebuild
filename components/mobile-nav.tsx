"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Mobile primary nav: a floating pill pinned to the bottom of the viewport.
 * Replaces the old hamburger — every destination is one thumb-tap away, no
 * menu to open. Hidden from md: up, where the header nav takes over.
 */
const ITEMS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/work", label: "Portfolio" },
  { href: "/contact", label: "Free Quote", cta: true },
];

export function MobileNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-2 pb-3 md:hidden"
    >
      <div className="flex w-full max-w-md items-center justify-around rounded-full border border-rule-strong bg-paper px-1 py-2 shadow-[0_6px_20px_rgba(59,52,42,0.20)]">
        {ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`whitespace-nowrap rounded-full px-1.5 py-2 font-display text-[10px] font-bold uppercase tracking-[0.04em] transition-colors max-[359px]:px-1 max-[359px]:text-[9px] ${
                active
                  ? "bg-tincture text-paper"
                  : item.cta
                    ? "text-tincture"
                    : "text-ink-soft"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
