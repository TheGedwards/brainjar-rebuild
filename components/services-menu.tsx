"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SERVICES } from "@/lib/services";

/**
 * "Services" nav item with a dropdown of the individual services.
 *
 * The trigger stays a real <Link> to /services — clicking it still navigates
 * (and it stays crawlable); the panel is progressive enhancement on hover/focus.
 * Reads SERVICES directly, so retiring or adding a service updates the menu with
 * no changes here.
 *
 * Safe to import lib/services from a client component: its only import is a
 * `import type`, so no Supabase runtime reaches the browser bundle.
 */
export function ServicesMenu({ linkClass }: { linkClass: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onAway = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onAway);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onAway);
    };
  }, []);

  // Close after navigating to a service.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href="/services"
        aria-haspopup="menu"
        aria-expanded={open}
        onFocus={() => setOpen(true)}
        className={`${linkClass} inline-flex items-center gap-1`}
      >
        Services
        <svg
          width="9"
          height="6"
          viewBox="0 0 9 6"
          aria-hidden="true"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M1 1L4.5 4.5L8 1" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </Link>

      {open && (
        /* pt-2 is a hover bridge — without it the gap under the trigger closes
           the menu as the pointer travels down to it. */
        <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2">
          <ul className="min-w-56 border border-rule-strong bg-card py-2 shadow-[0_10px_24px_rgba(59,52,42,0.18)]">
            {SERVICES.map((s) => {
              const href = `/services/${s.slug}`;
              const active = pathname === href;
              return (
                <li key={s.slug}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`block whitespace-nowrap px-4 py-2 text-left font-display text-xs font-semibold uppercase tracking-[0.12em] transition-colors ${
                      active ? "text-tincture" : "text-ink hover:bg-panel hover:text-tincture"
                    }`}
                  >
                    {s.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
