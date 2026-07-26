"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { MODES, CUSTOM_MODES, DEFAULT_MODE } from "@/lib/analytics-range";

const PILL =
  "border border-rule bg-card px-3 py-2 font-display text-xs text-ink focus:border-tincture focus:outline-none";

export function AnalyticsControls() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [mode, setMode] = useState(sp.get("mode") ?? DEFAULT_MODE);
  const [start, setStart] = useState(sp.get("start") ?? "");
  const [end, setEnd] = useState(sp.get("end") ?? "");
  const isCustom = CUSTOM_MODES.includes(mode);

  /** Navigate (refetch) — only for a preset, or a custom range with both dates. */
  const go = (m: string, s: string, e: string) => {
    const p = new URLSearchParams();
    p.set("mode", m);
    if (CUSTOM_MODES.includes(m)) {
      p.set("start", s);
      p.set("end", e);
    }
    router.push(`${pathname}?${p.toString()}`);
  };

  const onMode = (m: string) => {
    setMode(m);
    if (!CUSTOM_MODES.includes(m)) go(m, start, end); // preset → fetch now
    else if (start && end) go(m, start, end); // custom, dates already set
    // else: reveal the date inputs and wait until both are filled
  };
  const onStart = (v: string) => {
    setStart(v);
    if (isCustom && v && end) go(mode, v, end);
  };
  const onEnd = (v: string) => {
    setEnd(v);
    if (isCustom && start && v) go(mode, start, v);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Rendered BEFORE the select, so flex places them to its left; they simply
          vanish for non-custom modes. */}
      {isCustom && (
        <>
          <input type="date" aria-label="Start date" value={start} onChange={(e) => onStart(e.target.value)} className={PILL} />
          <span className="font-display text-[10px] tracking-[0.15em] text-ink-faint">TO</span>
          <input type="date" aria-label="End date" value={end} onChange={(e) => onEnd(e.target.value)} className={PILL} />
        </>
      )}
      <select aria-label="Comparison period" value={mode} onChange={(e) => onMode(e.target.value)} className={PILL}>
        {MODES.map((o) => (
          <option key={o.key} value={o.key}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
