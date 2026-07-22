"use client";

import { useEffect, useMemo, useState } from "react";
import { BrandMark } from "@/components/brand-mark";

/**
 * A self-contained playground for tuning the compact header logo's slide-in.
 * It drives its OWN keyframes (bjlab) from the controls so nothing here touches
 * the live site; the "Copy CSS" box emits the exact .bj-logo / bj-logo-in rules
 * to drop into app/globals.css once the numbers feel right. Noindexed via the
 * route's metadata. Not bound to the 8pt system — internal tooling.
 */

const EASINGS: Record<string, string> = {
  linear: "linear",
  ease: "ease",
  "ease-in": "cubic-bezier(0.42, 0, 1, 1)",
  "ease-out": "cubic-bezier(0, 0, 0.58, 1)",
  "ease-in-out": "cubic-bezier(0.42, 0, 0.58, 1)",
  "ease-in (cubic)": "cubic-bezier(0.55, 0.06, 0.68, 0.19)",
  easeOutExpo: "cubic-bezier(0.16, 1, 0.3, 1)",
  easeOutBack: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  material: "cubic-bezier(0.4, 0, 0.2, 1)",
};
const EASE_NAMES = Object.keys(EASINGS);

type Params = {
  duration: number;
  startX: number;
  origin: "left" | "center" | "right";
  slideEnd: number;
  squishDur: number;
  hold: number;
  squishScale: number;
  slideEase: string;
  squishEase: string;
  unsquishEase: string;
};

// Requested variant: no hold, ease-in slide, squash anchored at the right (A in MEDIA).
const DEFAULTS: Params = {
  duration: 800,
  startX: -150,
  origin: "right",
  slideEnd: 45,
  squishDur: 11,
  hold: 0,
  squishScale: 0.82,
  slideEase: "ease-in",
  squishEase: "ease-out",
  unsquishEase: "easeOutExpo",
};

function buildStops(p: Params): string {
  const e = (name: string) => EASINGS[name] ?? name;
  const squishAt = Math.min(96, Math.max(p.slideEnd + 1, p.slideEnd + p.squishDur));
  const s: string[] = [];
  s.push(`  0%   { transform: translateX(${p.startX}%) scaleX(1); opacity: 0; animation-timing-function: ${e(p.slideEase)}; }`);
  s.push(`  ${p.slideEnd}%  { transform: translateX(0) scaleX(1); opacity: 1; animation-timing-function: ${e(p.squishEase)}; }`);
  if (p.hold > 0) {
    const holdEnd = Math.min(98, squishAt + p.hold);
    s.push(`  ${squishAt}%  { transform: translateX(0) scaleX(${p.squishScale}); opacity: 1; animation-timing-function: linear; }`);
    s.push(`  ${holdEnd}%  { transform: translateX(0) scaleX(${p.squishScale}); opacity: 1; animation-timing-function: ${e(p.unsquishEase)}; }`);
  } else {
    s.push(`  ${squishAt}%  { transform: translateX(0) scaleX(${p.squishScale}); opacity: 1; animation-timing-function: ${e(p.unsquishEase)}; }`);
  }
  s.push(`  100% { transform: translateX(0) scaleX(1); opacity: 1; }`);
  return s.join("\n");
}

function previewCss(p: Params): string {
  return `@keyframes bjlab {
${buildStops(p)}
}
.bjlab-target { transform: translateX(${p.startX}%); opacity: 0; transform-origin: ${p.origin} center; }
.bjlab-target.run { animation: bjlab ${p.duration}ms both; }`;
}

function outputCss(p: Params): string {
  return `.bj-logo {
  transform: translateX(${p.startX}%);
  transform-origin: ${p.origin} center;
  opacity: 0;
  transition: transform 0.35s ease, opacity 0.35s ease;
}
.bj-logo.is-in { animation: bj-logo-in ${p.duration}ms both; }
@keyframes bj-logo-in {
${buildStops(p)}
}`;
}

function Slider({
  label, value, min, max, step, suffix, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number; suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="font-display text-[11px] font-bold uppercase tracking-[0.15em] text-ink-soft">{label}</span>
        <span className="font-display text-xs tabular-nums text-tincture">{value}{suffix}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-tincture"
      />
    </label>
  );
}

function Select({
  label, value, options, onChange,
}: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <div className="mb-1 font-display text-[11px] font-bold uppercase tracking-[0.15em] text-ink-soft">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-rule bg-card px-2 py-1 font-display text-xs text-ink"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

export function LogoLab() {
  const [p, setP] = useState<Params>(DEFAULTS);
  const [playKey, setPlayKey] = useState(0);
  const [loop, setLoop] = useState(true);
  const [copied, setCopied] = useState(false);

  const set = <K extends keyof Params>(k: K, v: Params[K]) => setP((prev) => ({ ...prev, [k]: v }));

  const css = useMemo(() => previewCss(p), [p]);
  const out = useMemo(() => outputCss(p), [p]);
  const paramsKey = useMemo(() => JSON.stringify(p), [p]);

  // Loop: re-mount the lockup on an interval so it replays with a gap.
  useEffect(() => {
    if (!loop) return;
    const id = setInterval(() => setPlayKey((k) => k + 1), p.duration + 700);
    return () => clearInterval(id);
  }, [loop, p.duration]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(out);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — the <pre> is selectable as a fallback */
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <h1 className="display text-2xl tracking-[0.1em]">Logo Animation Lab</h1>
      <p className="mt-2 max-w-2xl text-base italic text-ink-soft">
        Tune the compact header logo&rsquo;s slide-in. Nothing here touches the live site — when it feels
        right, copy the CSS (or just tell me the numbers) and I&rsquo;ll drop it into <code>globals.css</code>.
      </p>

      {/* Stage — a mock nav bar so the off-screen start clips exactly like the real header. */}
      <div className="mt-8 border border-rule-strong bg-panel p-2">
        <div className="relative flex h-14 items-center overflow-hidden border-y-2 border-double border-rule-strong bg-paper">
          <a
            key={`${paramsKey}-${playKey}`}
            className="bjlab-target run pointer-events-none ml-4 flex items-center gap-2"
          >
            <span className="display -mr-[0.2em] text-sm tracking-[0.2em] text-ink">BRAINJAR</span>
            <BrandMark width={30} />
            <span className="display -mr-[0.28em] text-sm tracking-[0.28em] text-ink">MEDIA</span>
          </a>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <button onClick={() => setPlayKey((k) => k + 1)} className="btn btn-fill">▶ Replay</button>
        <label className="flex items-center gap-2 font-display text-xs uppercase tracking-[0.15em] text-ink-soft">
          <input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} className="accent-tincture" />
          Loop
        </label>
        <button onClick={() => setP(DEFAULTS)} className="font-display text-xs uppercase tracking-[0.15em] text-ink-faint hover:text-tincture">
          Reset
        </button>
      </div>

      {/* Controls */}
      <div className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
        <Slider label="Duration" value={p.duration} min={200} max={2000} step={20} suffix="ms" onChange={(v) => set("duration", v)} />
        <Slider label="Off-screen start" value={p.startX} min={-260} max={-100} step={5} suffix="%" onChange={(v) => set("startX", v)} />
        <div>
          <div className="mb-1 font-display text-[11px] font-bold uppercase tracking-[0.15em] text-ink-soft">Squish origin</div>
          <div className="flex gap-1">
            {(["left", "center", "right"] as const).map((o) => (
              <button
                key={o}
                onClick={() => set("origin", o)}
                className={`flex-1 border px-2 py-1 font-display text-[11px] uppercase tracking-[0.1em] ${
                  p.origin === o ? "border-tincture bg-tincture text-paper" : "border-rule bg-card text-ink-soft"
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>

        <Slider label="Slide ends @ (plant)" value={p.slideEnd} min={10} max={80} step={1} suffix="%" onChange={(v) => set("slideEnd", v)} />
        <Slider label="Squish ramp" value={p.squishDur} min={1} max={40} step={1} suffix="%" onChange={(v) => set("squishDur", v)} />
        <Slider label="Hold (0 = none)" value={p.hold} min={0} max={40} step={1} suffix="%" onChange={(v) => set("hold", v)} />

        <Slider label="Squish scaleX" value={p.squishScale} min={0.6} max={1} step={0.01} onChange={(v) => set("squishScale", v)} />
        <Select label="Slide easing" value={p.slideEase} options={EASE_NAMES} onChange={(v) => set("slideEase", v)} />
        <Select label="Squish easing" value={p.squishEase} options={EASE_NAMES} onChange={(v) => set("squishEase", v)} />
        <Select label="Un-squish easing" value={p.unsquishEase} options={EASE_NAMES} onChange={(v) => set("unsquishEase", v)} />
      </div>

      {/* Output */}
      <div className="mt-10">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.15em] text-ink">globals.css</h2>
          <button onClick={copy} className="btn btn-outline">{copied ? "Copied ✓" : "Copy CSS"}</button>
        </div>
        <pre className="overflow-x-auto border border-rule bg-card p-4 font-mono text-xs leading-5 text-ink-soft">{out}</pre>
      </div>
    </div>
  );
}
