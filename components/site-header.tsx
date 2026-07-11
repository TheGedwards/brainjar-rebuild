"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Swirl } from "./ornaments";

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
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header>
      {/* Standing head — the line of type that would be set once and never
          changed. Hidden on phones, where it's just noise. */}
      <div className="hidden items-center justify-between border-b border-rule px-12 py-2 sm:flex">
        <span className="font-display text-[11px] tracking-[0.2em] text-ink-faint">
          GRESHAM · PORTLAND, OREGON
        </span>
        <span className="font-display text-[11px] tracking-[0.2em] text-ink-faint">
          EST. 2003
        </span>
        <a
          href="tel:+15039297436"
          className="font-display text-[11px] font-semibold tracking-[0.2em] text-tincture hover:underline"
        >
          (503) 929-7436
        </a>
      </div>

      <div className="pt-6 text-center">
        <Link href="/" className="inline-flex items-center justify-center gap-4">
          <Swirl className="hidden text-tincture sm:block" />
          <Image
            src="/assets/logo.jpg"
            alt="Brainjar Media"
            width={54}
            height={54}
            priority
            className="rounded-lg border border-rule"
          />
          <Swirl flip className="hidden text-tincture sm:block" />
        </Link>

        <div className="display mt-3 text-lg tracking-[0.3em] text-ink sm:text-[26px] sm:tracking-[0.28em]">
          BRAINJAR MEDIA
        </div>
        <div className="mt-0.5 text-sm italic text-ink-faint">
          purveyors of fine digital remedies
        </div>

        {/* Desktop nav */}
        <nav
          aria-label="Primary"
          className="double-rule mt-4 hidden justify-center gap-8 py-3.5 md:flex"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`font-display text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                isActive(item.href)
                  ? "border-b-2 border-tincture pb-[3px] text-tincture"
                  : item.accent
                    ? "text-cobalt hover:text-tincture"
                    : "text-ink hover:text-tincture"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile */}
        <div className="double-rule mt-4 flex items-center justify-between px-5 py-3 md:hidden">
          <a href="tel:+15039297436" className="font-display text-[11px] tracking-[0.15em] text-tincture">
            (503) 929-7436
          </a>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-ink"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
        {open && (
          <nav
            id="mobile-nav"
            aria-label="Primary"
            className="flex flex-col border-b border-rule bg-card md:hidden"
          >
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`border-b border-rule px-6 py-4 text-left font-display text-xs font-semibold uppercase tracking-[0.2em] last:border-0 ${
                  isActive(item.href) ? "text-tincture" : "text-ink"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
