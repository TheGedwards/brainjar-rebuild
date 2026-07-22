"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  const headerRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // The nav bar is persistent (always centered, never moves). Once the big
  // standing logo above it scrolls out of view, the compact logo fades in on
  // the left. `headerRef` wraps that standing area so we know when it's gone.
  useEffect(() => {
    const onScroll = () => {
      const el = headerRef.current;
      if (el) setScrolled(el.getBoundingClientRect().bottom <= 0);
    };
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
    <>
      {/* Standing area — utility strip + the big centered logo. This is the
          <header> and it scrolls away; the persistent nav bar is a SIBLING
          below (not nested) so its sticky containing block is the full-height
          page — otherwise it would only stick within this short header. */}
      <header ref={headerRef}>
        {/* 3-column grid so EST. 2003 is truly centered. Hidden on phones. */}
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

        <div className="pt-6 pb-4 text-center">
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
        </div>
      </header>

      {/* Persistent nav bar — sticky at page level (sibling of <header>) so it
          stays through the whole scroll. The nav stays centered and never
          moves; a compact logo slides in from off-screen left and lands 16px
          from the browser edge. */}
      <div
        className="double-rule sticky z-50 bg-paper"
        style={{ top: "var(--bjm-adminbar, 0px)" }}
      >
        {/* Logo layer — full width, so "16px from the left" is the browser edge;
            overflow-hidden so the off-screen start doesn't add a scrollbar. It's
            separate from the nav (and pointer-events-none) so the Services
            dropdown is never clipped and clicks pass through. Desktop only. */}
        <div className="pointer-events-none absolute inset-0 hidden items-center overflow-hidden md:flex">
          <Link
            href="/"
            aria-label="Brainjar Media — home"
            aria-hidden={!scrolled}
            className={`bj-logo pointer-events-auto ml-4 flex items-center gap-2 ${
              scrolled ? "is-in" : ""
            }`}
          >
            <span className="display -mr-[0.2em] text-sm tracking-[0.2em] text-ink">BRAINJAR</span>
            <BrandMark width={30} />
            <span className="display -mr-[0.28em] text-sm tracking-[0.28em] text-ink">MEDIA</span>
          </Link>
        </div>

        {/* Nav — centered, in its own container so its dropdown isn't clipped. */}
        <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-4">
          <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
            {NAV.map((item) =>
              navItem(item, isActive(item.href) ? "border-b-2 border-tincture pb-[3px]" : "")
            )}
          </nav>

          {/* Mobile — phone only; navigation lives in the bottom pill. */}
          <a
            href="tel:+15039297436"
            className="font-display text-[11px] tracking-[0.15em] text-tincture md:hidden"
          >
            (503) 929-7436
          </a>
        </div>
      </div>
    </>
  );
}
