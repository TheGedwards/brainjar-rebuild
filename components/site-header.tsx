"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Swirl } from "./ornaments";
import { BrandMark } from "./brand-mark";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/work", label: "Portfolio" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact Us", accent: true },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Reveal the condensed bar once the main header (logo + wordmark + nav) has
  // scrolled out of view. Measuring the block's own position adapts to the
  // header's real height across breakpoints.
  useEffect(() => {
    const onScroll = () => {
      const el = headerRef.current;
      if (el) setScrolled(el.getBoundingClientRect().bottom <= 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLink = (item: (typeof NAV)[number], extra = "") => (
    <Link
      key={item.href}
      href={item.href}
      aria-current={isActive(item.href) ? "page" : undefined}
      className={`font-display text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${extra} ${
        isActive(item.href)
          ? "text-tincture"
          : item.accent
            ? "text-cobalt hover:text-tincture"
            : "text-ink hover:text-tincture"
      }`}
    >
      {item.label}
    </Link>
  );

  return (
    <header>
      {/* Standing head — 3-column grid so EST. 2003 is truly centered
          regardless of the side items' widths. Hidden on phones. */}
      <div className="hidden grid-cols-3 items-center border-b border-rule px-12 py-2 sm:grid">
        <span className="justify-self-start font-display text-[11px] tracking-[0.2em] text-ink-faint">
          GRESHAM · PORTLAND, OREGON
        </span>
        <span className="justify-self-center font-display text-[11px] tracking-[0.2em] text-ink-faint">
          EST. 2003
        </span>
        <a
          href="tel:+15039297436"
          className="justify-self-end font-display text-[11px] font-semibold tracking-[0.2em] text-tincture hover:underline"
        >
          (503) 929-7436
        </a>
      </div>

      <div ref={headerRef} className="pt-6 text-center">
        <Link
          href="/"
          aria-label="Brainjar Media — home"
          className="inline-flex items-center justify-center gap-4"
        >
          <Swirl className="hidden text-tincture sm:block" />
          <BrandMark width={75} />
          <Swirl flip className="hidden text-tincture sm:block" />
        </Link>

        <div className="display mt-2 text-lg tracking-[0.3em] text-ink sm:text-2xl sm:tracking-[0.28em]">
          BRAINJAR MEDIA
        </div>
        <div className="mt-1 text-sm italic text-ink-faint">
          purveyors of fine digital remedies
        </div>

        {/* Desktop nav (in-flow, under the logo) */}
        <nav
          aria-label="Primary"
          className="double-rule mt-4 hidden justify-center gap-8 py-4 md:flex"
        >
          {NAV.map((item) =>
            navLink(item, isActive(item.href) ? "border-b-2 border-tincture pb-[3px]" : "")
          )}
        </nav>

        {/* Mobile bar (in-flow) — phone only. Navigation lives in the bottom
            pill (components/mobile-nav.tsx), so there's no hamburger. */}
        <div className="double-rule mt-4 flex items-center justify-center px-4 py-4 md:hidden">
          <a
            href="tel:+15039297436"
            className="font-display text-[11px] tracking-[0.15em] text-tincture"
          >
            (503) 929-7436
          </a>
        </div>
      </div>

      {/* Condensed, branded sticky bar — appears once the header scrolls off. */}
      {scrolled && (
        <div className="fixed inset-x-0 top-0 z-50 border-b-[3px] border-double border-rule-strong bg-paper">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-2">
            <Link
              href="/"
              aria-label="Brainjar Media — home"
              className="flex items-center gap-2.5"
            >
              <BrandMark width={40} />
              <span className="display text-sm tracking-[0.24em] text-ink">BRAINJAR MEDIA</span>
            </Link>

            <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
              {NAV.map((item) => navLink(item))}
            </nav>
          </div>
        </div>
      )}

    </header>
  );
}
