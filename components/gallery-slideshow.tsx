"use client";

import { useState } from "react";
import Image from "next/image";

type Slide = { url: string; alt?: string; caption?: string };

/**
 * On-brand case-study slideshow: label-stock frame, tincture prev/next controls,
 * dot indicators, optional caption. Keyboard arrows work when focused.
 */
export function GallerySlideshow({ images }: { images: Slide[] }) {
  const [i, setI] = useState(0);
  if (!images?.length) return null;

  const go = (d: number) => setI((p) => (p + d + images.length) % images.length);
  const cur = images[i];
  const many = images.length > 1;

  return (
    <div
      className="mt-10"
      role="group"
      aria-roledescription="carousel"
      aria-label="Project gallery"
      tabIndex={0}
      onKeyDown={(e) => {
        if (!many) return;
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
    >
      <div className="relative border border-rule-strong bg-card p-2">
        <div className="relative aspect-16/10 overflow-hidden bg-panel">
          <Image
            src={cur.url}
            alt={cur.alt ?? ""}
            fill
            sizes="(max-width: 768px) 100vw, 640px"
            className="object-cover"
          />
        </div>

        {many && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center border border-rule-strong bg-paper/90 font-display text-xl text-ink transition-colors hover:bg-tincture hover:text-paper"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center border border-rule-strong bg-paper/90 font-display text-xl text-ink transition-colors hover:bg-tincture hover:text-paper"
            >
              ›
            </button>
          </>
        )}
      </div>

      {cur.caption && (
        <p className="mt-2 text-center text-sm italic text-ink-faint">{cur.caption}</p>
      )}

      {many && (
        <div className="mt-4 flex justify-center gap-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setI(idx)}
              aria-label={`Go to image ${idx + 1}`}
              aria-current={idx === i ? "true" : undefined}
              className={`size-2 rounded-full border border-rule-strong transition-colors ${
                idx === i ? "bg-tincture" : "bg-transparent hover:bg-rule-strong"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
