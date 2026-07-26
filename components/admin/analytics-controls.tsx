"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { PERIODS, COMPARES } from "@/lib/analytics-range";

const SELECT =
  "border border-rule bg-card px-3 py-2 font-display text-xs text-ink focus:border-tincture focus:outline-none";

export function AnalyticsControls() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const period = sp.get("period") ?? "28";
  const compare = sp.get("compare") ?? "prev";
  const [start, setStart] = useState(sp.get("start") ?? "");
  const [end, setEnd] = useState(sp.get("end") ?? "");

  const push = (updates: Record<string, string | null>) => {
    const p = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v) p.set(k, v);
      else p.delete(k);
    }
    router.push(`${pathname}?${p.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        aria-label="Time period"
        className={SELECT}
        value={period}
        onChange={(e) => {
          const v = e.target.value;
          push(v === "custom" ? { period: v } : { period: v, start: null, end: null });
        }}
      >
        {PERIODS.map((p) => (
          <option key={p.key} value={p.key}>
            {p.label}
          </option>
        ))}
      </select>

      {period === "custom" && (
        <span className="flex items-center gap-2">
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className={SELECT} />
          <span className="font-display text-[10px] tracking-[0.15em] text-ink-faint">TO</span>
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className={SELECT} />
          <button
            type="button"
            disabled={!start || !end}
            onClick={() => push({ period: "custom", start, end })}
            className="btn btn-outline !py-2 disabled:opacity-50"
          >
            APPLY
          </button>
        </span>
      )}

      <span className="font-display text-[10px] uppercase tracking-[0.2em] text-ink-faint">vs</span>
      <select
        aria-label="Comparison period"
        className={SELECT}
        value={compare}
        onChange={(e) => push({ compare: e.target.value })}
      >
        {COMPARES.map((c) => (
          <option key={c.key} value={c.key}>
            {c.label}
          </option>
        ))}
      </select>
    </div>
  );
}
