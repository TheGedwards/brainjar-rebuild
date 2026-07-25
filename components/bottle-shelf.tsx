"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Lozenge } from "./ornaments";

/**
 * OUR EXPERT SERVICES — the shelf (the home page's signature).
 *
 * Deliberately DECOUPLED from lib/services.ts: this is a marketing showcase of
 * five headline offerings (incl. Social Media + AI, which aren't top-level
 * /services routes), so it keeps its own list here. Touching lib/services.ts
 * would change the load-bearing /services routes + 301 redirects, which we don't
 * want. Bottle art is /assets/bottle-*.png (280x600, shown ~50%).
 *
 * Two interaction states:
 *   - Before a pick: hovering a bottle GROWS it (preview) — transform-origin
 *     bottom, so it looms up off the shelf rather than hopping.
 *   - After a pick (click / Enter / arrow-keys): the chosen bottle stays grown;
 *     hovering the OTHERS only lifts their fade (opacity), so they still read as
 *     interactive without growing. Its label card fills in below.
 */
type Bottle = { no: string; name: string; bottle: string; blurb: string; href: string };

const SHELF: Bottle[] = [
  {
    no: "01",
    name: "Paid Ads",
    bottle: "/assets/bottle-paidads.png",
    blurb: "A measured boost when you need it — every dollar tracked from click to customer.",
    href: "/services/paid-advertising",
  },
  {
    no: "02",
    name: "Social Media",
    bottle: "/assets/bottle-socialmedia.png",
    blurb: "Show up where your audience already scrolls — with a reason to follow and a reason to stay.",
    href: "/services/content-marketing/social-media",
  },
  {
    no: "03",
    name: "AI Optimization",
    bottle: "/assets/bottle-ai.png",
    blurb:
      "Your customers are skipping Google and asking AI instead. We make sure AI recommends your business.",
    href: "/contact",
  },
  {
    no: "04",
    name: "SEO",
    bottle: "/assets/bottle-seo.png",
    blurb: "Be found first. We reverse-engineer what your industry's leaders rank for — then out-formulate them.",
    href: "/services/seo",
  },
  {
    no: "05",
    name: "Content Marketing",
    bottle: "/assets/bottle-contentmarketing.png",
    blurb: "Honest stories, told well, everywhere your customers already are. No snake oil.",
    href: "/services/content-marketing",
  },
];

export function BottleShelf() {
  const [active, setActive] = useState(0);
  const [committed, setCommitted] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  // The card previews whatever you're pointing at; otherwise it shows the
  // selection (or the last-hovered before a pick).
  const s = SHELF[hovered ?? active];

  const move = (dir: 1 | -1) => {
    setActive((i) => (i + dir + SHELF.length) % SHELF.length);
    setCommitted(true);
  };

  return (
    <section className="bg-paper px-6 py-8" aria-labelledby="shelf-heading">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 id="shelf-heading" className="display mt-2 text-2xl text-ink sm:text-3xl">
            Our Expert Services
          </h2>
          <Lozenge className="mt-4" />
          <p className="mt-4 text-lg italic text-ink-faint">
            click on any bottle on the shelf to learn more
          </p>
        </div>

        {/* --- The cabinet card: the shelf (bottles) sits INSIDE the box --- */}
        <div className="mx-auto mt-8 max-w-2xl border border-rule-strong p-2">
          <div className="border-2 border-ink bg-card px-8 py-8 text-center">
            {/* Shelf band — bottles + No. plates, framed like the nav bar:
                a single rule above, a double rule below, full-bleed to the box
                edges. The generous top padding lets the active bottle loom up
                without crossing the top rule. */}
            {/* Bottles — pt gives the active bottle room to loom up. */}
            <div
              role="radiogroup"
              aria-label="Our services"
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); move(1); }
                if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); move(-1); }
              }}
              onMouseLeave={() => setHovered(null)}
              className="flex items-end justify-center gap-1 pt-6 sm:gap-10"
              style={{ perspective: "1200px", perspectiveOrigin: "50% 120%" }}
            >
              {SHELF.map((item, i) => {
                const isActive = i === active;
                return (
                  <button
                    key={item.name}
                    role="radio"
                    aria-checked={isActive}
                    tabIndex={isActive ? 0 : -1}
                    aria-label={item.name}
                    onMouseEnter={() => { setHovered(i); if (!committed) setActive(i); }}
                    onFocus={() => setActive(i)}
                    onClick={() => { setActive(i); setCommitted(true); }}
                    className="group relative flex flex-col items-center"
                    style={{ zIndex: isActive ? 10 : 1 }}
                  >
                    <Image
                      src={item.bottle}
                      alt=""
                      width={280}
                      height={600}
                      className={`h-auto w-14 origin-bottom transition-all duration-300 ease-out sm:w-[72px] ${
                        isActive
                          ? "opacity-100"
                          : "opacity-60 grayscale-[0.35] group-hover:opacity-80 group-hover:grayscale-[0.15]"
                      }`}
                      style={{
                        transform: isActive ? "scale(1.28)" : "scale(1)",
                        filter: isActive ? "drop-shadow(0 20px 26px rgba(59,52,42,0.32))" : undefined,
                      }}
                    />
                  </button>
                );
              })}
            </div>

            {/* No. label strip — framed like the nav (a single rule above, a
                double rule below), inset ~16px from the box edges (-mx-4 against
                the px-8 padding), and column-aligned under the bottles. */}
            <div className="double-rule -mx-4 mb-8 mt-3 flex justify-center gap-1 py-2 sm:gap-10" aria-hidden>
              {SHELF.map((item, i) => (
                <span
                  key={item.no}
                  className="w-14 text-center font-display text-[12px] font-bold tracking-[0.2em] transition-colors sm:w-[72px]"
                  style={{ color: i === active ? "var(--color-tincture)" : "var(--color-ink-faint)" }}
                >
                  No. {item.no}
                </span>
              ))}
            </div>

            <div className="display text-xl text-tincture sm:text-2xl">{s.name}</div>
            <div className="mt-2 font-display text-[12px] font-bold tracking-[0.3em] text-cobalt">
              FORMULA No. {s.no}
            </div>

            <Lozenge className="my-6" />

            <p className="mx-auto max-w-md text-lg italic leading-8 text-ink-soft">{s.blurb}</p>

            <Link href={s.href} className="btn btn-fill mt-8">
              EXPLORE {s.name.toUpperCase()}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
