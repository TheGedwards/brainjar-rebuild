import type { DailyPoint } from "@/lib/google-reports";

/**
 * Lightweight SVG line chart: clicks (tincture) vs impressions (cobalt) over the
 * period. Each series is scaled to its own max so both trends are legible on one
 * canvas (independent axes), like the reference dashboard. No chart library.
 */
export function ClicksImpressionsChart({ daily }: { daily: DailyPoint[] }) {
  if (daily.length < 2) {
    return (
      <p className="py-16 text-center font-body text-lg italic text-ink-faint">
        Not enough data yet — this fills in as Search Console accrues days.
      </p>
    );
  }

  const W = 900;
  const H = 260;
  const padX = 8;
  const padY = 20;
  const n = daily.length;

  const maxClicks = Math.max(1, ...daily.map((d) => d.clicks));
  const maxImpr = Math.max(1, ...daily.map((d) => d.impressions));

  const x = (i: number) => padX + (i * (W - padX * 2)) / (n - 1);
  const y = (v: number, max: number) => H - padY - (v / max) * (H - padY * 2);

  const path = (key: "clicks" | "impressions", max: number) =>
    daily.map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(d[key], max).toFixed(1)}`).join(" ");

  const fmt = (iso: string) => iso.slice(5); // MM-DD

  return (
    <div>
      <div className="mb-4 flex items-center gap-6 font-display text-[11px] font-bold uppercase tracking-[0.15em]">
        <span className="flex items-center gap-2 text-tincture">
          <span className="inline-block h-[2px] w-5 bg-tincture" /> Clicks
        </span>
        <span className="flex items-center gap-2 text-cobalt">
          <span className="inline-block h-[2px] w-5 bg-cobalt" /> Impressions
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" preserveAspectRatio="none" role="img" aria-label="Clicks and impressions over time">
        <path d={path("impressions", maxImpr)} fill="none" stroke="var(--color-cobalt)" strokeWidth="2" />
        <path d={path("clicks", maxClicks)} fill="none" stroke="var(--color-tincture)" strokeWidth="2" />
      </svg>
      <div className="mt-2 flex justify-between font-display text-[10px] tracking-[0.15em] text-ink-faint">
        <span>{fmt(daily[0].date)}</span>
        <span>{fmt(daily[Math.floor(n / 2)].date)}</span>
        <span>{fmt(daily[n - 1].date)}</span>
      </div>
    </div>
  );
}
