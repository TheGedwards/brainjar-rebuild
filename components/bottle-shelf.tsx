"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SERVICES } from "@/lib/services";
import { Lozenge } from "./ornaments";

/**
 * THINGS WE DO WELL — the shelf.
 *
 * This is the page's signature. The bottles are the real label art, on a real
 * wooden-rule shelf; the active one steps forward and its label card fills in
 * below. It works three ways, in this order of preference:
 *
 *   1. Hover  — instant, no click needed, feels like reaching for a bottle.
 *   2. Click / Enter — commits the selection (needed on touch).
 *   3. Arrow keys — the whole shelf is one roving-tabindex radiogroup, so a
 *      keyboard user moves along it exactly like a mouse user does.
 *
 * Nothing here is decoration: the bottle IS the nav item.
 */
export function BottleShelf() {
  const [active, setActive] = useState(0);
  const [committed, setCommitted] = useState(false);
  const s = SERVICES[active];

  const move = (dir: 1 | -1) => {
    setActive((i) => (i + dir + SERVICES.length) % SERVICES.length);
    setCommitted(true);
  };

  return (
    <section className="bg-paper px-6 py-20" aria-labelledby="shelf-heading">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <div className="eyebrow">From the Shelf</div>
          <h2 id="shelf-heading" className="display mt-3 text-2xl text-ink sm:text-3xl">
            Things We Do Well
          </h2>
          <Lozenge className="mt-5" />
          <p className="mt-5 text-base italic text-ink-faint">
            choose a bottle from the shelf
          </p>
        </div>

        {/* --- The shelf ---------------------------------------------------- */}
        <div
          role="radiogroup"
          aria-label="Our services"
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); move(1); }
            if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); move(-1); }
          }}
          className="mt-12 flex items-end justify-center gap-2 sm:gap-6"
        >
          {SERVICES.map((service, i) => {
            const isActive = i === active;
            return (
              <button
                key={service.slug}
                role="radio"
                aria-checked={isActive}
                tabIndex={isActive ? 0 : -1}
                aria-label={service.name}
                onMouseEnter={() => !committed && setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => { setActive(i); setCommitted(true); }}
                className="group relative flex flex-col items-center transition-transform duration-300 ease-out"
                style={{
                  transform: isActive ? "translateY(-14px)" : "translateY(0)",
                }}
              >
                <Image
                  src={service.bottle}
                  alt=""
                  width={110}
                  height={190}
                  className="h-24 w-auto transition-all duration-300 sm:h-40"
                  style={{
                    filter: isActive
                      ? "drop-shadow(0 14px 22px rgba(59,52,42,0.28))"
                      : "grayscale(0.35) opacity(0.62)",
                  }}
                />
                {/* No. plate under each bottle */}
                <span
                  className="mt-3 font-display text-[9px] font-bold tracking-[0.2em] transition-colors"
                  style={{ color: isActive ? "var(--color-tincture)" : "var(--color-ink-faint)" }}
                >
                  No. {service.no}
                </span>
              </button>
            );
          })}
        </div>

        {/* The shelf board itself. A rule, then its shadow. */}
        <div className="mx-auto mt-1 h-[3px] max-w-3xl bg-rule-strong" />
        <div className="mx-auto h-3 max-w-3xl bg-gradient-to-b from-[rgba(59,52,42,0.10)] to-transparent" />

        {/* --- The label card ---------------------------------------------- */}
        <div className="mx-auto mt-14 max-w-2xl border border-rule-strong p-2">
          <div className="border-2 border-ink bg-card px-8 py-10 text-center">
            <div className="font-display text-[10px] font-bold tracking-[0.3em] text-cobalt">
              FORMULA No. {s.no}
            </div>
            <div className="display mt-3 text-xl text-tincture sm:text-2xl">{s.label}</div>
            <div className="mt-2 font-display text-xs font-semibold tracking-[0.2em] text-ink-faint">
              {s.name.toUpperCase()}
            </div>

            <Lozenge className="my-6" />

            <p className="mx-auto max-w-md text-lg italic leading-relaxed text-ink-soft">
              {s.desc}
            </p>

            {s.subs.length > 0 && (
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {s.subs.map((sub) => (
                  <span
                    key={sub.slug}
                    className="border border-rule-strong bg-panel px-3 py-1.5 font-display text-[10px] font-bold tracking-[0.15em] text-ink-soft"
                  >
                    {sub.name.toUpperCase()}
                  </span>
                ))}
              </div>
            )}

            <Link href={`/services/${s.slug}`} className="btn btn-fill mt-8">
              EXPLORE {s.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
