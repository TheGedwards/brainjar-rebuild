"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Swirl } from "./ornaments";
import { BrandMark } from "./brand-mark";
import { ServicesMenu } from "./services-menu";

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

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // One sticky header that condenses after a small scroll — no second bar.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinkClass = (item: (typeof NAV)[number], extra = "") =>
    `font-display text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${extra} ${
      isActive(item.href)
        ? "text-tincture"
        : item.accent
          ? "text-cobalt hover:text-tincture"
          : "text-ink hover:text-tincture"
    }`;

  const navLink = (item: (typeof NAV)[number], extra = "") => (
    <Link
      key={item.href}
      href={item.href}
      aria-current={isActive(item.href) ? "page" : undefined}
      className={navLinkClass(item, extra)}
    >
      {item.label}
    </Link>
  );

  /** One nav item — Services gets the dropdown, everything else a plain link. */
  const navItem = (item: (typeof NAV)[number], extra = "") =>
    item.href === "/services" ? (
      <ServicesMenu key={item.href} linkClass={navLinkClass(item, extra)} />
    ) : (
      navLink(item, extra)
    );

  return (
    <header
      className={`sticky z-50 bg-paper transition-shadow duration-300 ${
        scrolled ? "shadow-[0_6px_16px_rgba(59,52,42,0.07)]" : ""
      }`}
      style={{ top: "var(--bjm-adminbar, 0px)" }}
    >
      {/* Utility strip — 3-col grid so EST. 2003 is centered. Collapses on
          scroll. Desktop only. */}
      <div
        className={`hidden overflow-hidden transition-all duration-300 sm:block ${
          scrolled ? "max-h-0 opacity-0" : "max-h-12 opacity-100"
        }`}
      >
        <div className="grid grid-cols-3 items-center border-b border-rule px-12 py-2">
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
      </div>

      {/* Brand + nav — one block that shrinks as you scroll. */}
      <div
        className={`flex flex-col items-center text-center transition-all duration-300 ${
          scrolled ? "pt-4" : "pt-6"
        }`}
      >
        <Link
          href="/"
          aria-label="Brainjar Media — home"
          className="inline-flex items-center justify-center gap-4"
        >
          <Swirl
            className={`hidden text-tincture transition-all duration-300 sm:block ${
              scrolled ? "w-0 opacity-0" : "w-[150px] opacity-100"
            }`}
          />
          <BrandMark width={scrolled ? 44 : 75} className="transition-[width] duration-300" />
          <Swirl
            flip
            className={`hidden text-tincture transition-all duration-300 sm:block ${
              scrolled ? "w-0 opacity-0" : "w-[150px] opacity-100"
            }`}
          />
        </Link>

        <div
          className={`display tracking-[0.3em] text-ink transition-all duration-300 ${
            scrolled ? "mt-2 text-base sm:tracking-[0.2em]" : "mt-2 text-lg sm:text-2xl sm:tracking-[0.28em]"
          }`}
        >
          BRAINJAR MEDIA
        </div>

        {/* Tagline collapses on scroll. */}
        <div
          className={`overflow-hidden text-sm italic text-ink-faint transition-all duration-300 ${
            scrolled ? "max-h-0 opacity-0" : "mt-1 max-h-8 opacity-100"
          }`}
        >
          purveyors of fine digital remedies
        </div>

        {/* Desktop nav */}
        <nav
          aria-label="Primary"
          className={`double-rule hidden justify-center gap-8 transition-all duration-300 md:flex ${
            scrolled ? "mt-4 py-2" : "mt-4 py-4"
          }`}
        >
          {NAV.map((item) =>
            navItem(item, isActive(item.href) ? "border-b-2 border-tincture pb-[3px]" : "")
          )}
        </nav>

        {/* Mobile phone bar — navigation lives in the bottom pill. */}
        <div
          className={`double-rule flex w-full items-center justify-center px-4 transition-all duration-300 md:hidden ${
            scrolled ? "mt-4 py-2" : "mt-4 py-4"
          }`}
        >
          <a
            href="tel:+15039297436"
            className="font-display text-[11px] tracking-[0.15em] text-tincture"
          >
            (503) 929-7436
          </a>
        </div>
      </div>
    </header>
  );
}
