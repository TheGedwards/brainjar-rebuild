"use client";

import { useState } from "react";

/** Small "ⓘ" that reveals a definition on hover/focus. Palette-only styling. */
export function InfoTip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex align-middle">
      <button
        type="button"
        aria-label="More information"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="ml-1.5 inline-flex size-[15px] items-center justify-center rounded-full border border-ink-faint/50 font-display text-[9px] font-bold lowercase text-ink-faint transition-colors hover:border-tincture hover:text-tincture"
      >
        i
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute left-1/2 top-[22px] z-30 w-56 -translate-x-1/2 border border-rule-strong bg-card px-3 py-2 text-left font-body text-sm normal-case leading-6 tracking-normal text-ink-soft shadow-lg"
        >
          {text}
        </span>
      )}
    </span>
  );
}
