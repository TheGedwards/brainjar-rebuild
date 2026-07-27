import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireUser, ADMIN_ROLES } from "@/lib/auth";
import { getSeoAudit, type PageAudit, type Severity } from "@/lib/seo-audit";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "SEO Health", robots: { index: false, follow: false } };

const COLOR: Record<Severity, string> = { fail: "#dc2626", warn: "#d97706", ok: "#16a34a" };

function Dot({ severity }: { severity: Severity }) {
  return (
    <span
      aria-hidden
      className="inline-block size-2.5 shrink-0 rounded-full"
      style={{ background: COLOR[severity] }}
    />
  );
}

function Tile({ n, label, color }: { n: number; label: string; color?: string }) {
  return (
    <div className="border border-rule bg-card p-4 text-center">
      <div className="display text-3xl tabular-nums" style={color ? { color } : undefined}>
        {n}
      </div>
      <div className="mt-1 font-display text-[9px] font-bold uppercase tracking-[0.2em] text-ink-faint">
        {label}
      </div>
    </div>
  );
}

function PageRow({ p }: { p: PageAudit }) {
  const issues = p.checks.filter((c) => c.severity !== "ok");
  const passed = p.checks.length - issues.length;
  const worst: Severity = p.fails > 0 ? "fail" : p.warns > 0 ? "warn" : "ok";

  return (
    <details className="group border border-rule bg-card" open={p.fails > 0}>
      <summary className="flex cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
        <Dot severity={worst} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-base text-ink">{p.name}</div>
          <div className="truncate font-display text-[10px] tracking-[0.15em] text-ink-faint">{p.path}</div>
        </div>
        <div className="flex items-center gap-3 font-display text-[10px] font-bold tracking-[0.15em]">
          {p.fails > 0 && <span style={{ color: COLOR.fail }}>{p.fails} FAIL</span>}
          {p.warns > 0 && <span style={{ color: COLOR.warn }}>{p.warns} WARN</span>}
          {p.fails === 0 && p.warns === 0 && <span style={{ color: COLOR.ok }}>CLEAN</span>}
          <span className="text-ink-faint transition-transform group-open:rotate-180">▾</span>
        </div>
      </summary>

      <div className="border-t border-rule px-4 py-3">
        <a
          href={p.path}
          target="_blank"
          className="mb-3 inline-block font-display text-[10px] font-bold tracking-[0.2em] text-tincture hover:text-tincture-dk"
        >
          VIEW PAGE ↗
        </a>
        <ul className="space-y-2">
          {issues.map((c, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-1.5">
                <Dot severity={c.severity} />
              </span>
              <span className="text-base text-ink-soft">
                <span className="font-semibold text-ink">{c.label}:</span> {c.detail}
              </span>
            </li>
          ))}
          {issues.length === 0 && (
            <li className="text-base italic text-ink-faint">No issues — every check passed.</li>
          )}
        </ul>
        {passed > 0 && (
          <p className="mt-3 font-display text-[10px] tracking-[0.15em] text-ink-faint">
            {passed} CHECK{passed > 1 ? "S" : ""} PASSED
          </p>
        )}
      </div>
    </details>
  );
}

export default async function SeoHealthPage() {
  const { profile } = await requireUser();
  if (!ADMIN_ROLES.includes(profile.role)) redirect("/admin");

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  const base = host ? `${proto}://${host}` : SITE_URL;

  const audit = await getSeoAudit(base);
  const { totals } = audit;

  return (
    <div className="max-w-4xl">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-rule bg-paper/95 py-4 backdrop-blur">
        <h1 className="display text-2xl">SEO Health</h1>
        <span className="font-display text-[10px] tracking-[0.2em] text-ink-faint">
          {totals.pages} PAGES · CACHED HOURLY
        </span>
      </div>

      <p className="mt-4 text-base italic text-ink-soft">
        An automated on-page audit of the live site — the same checks an external crawler runs, on
        our own pages. Fix the reds first. Results refresh every hour.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Tile n={totals.pages} label="Pages audited" />
        <Tile n={totals.failPages} label="Need fixes" color={totals.failPages ? COLOR.fail : undefined} />
        <Tile n={totals.warnPages} label="Warnings" color={totals.warnPages ? COLOR.warn : undefined} />
        <Tile n={totals.cleanPages} label="Clean" color={totals.cleanPages ? COLOR.ok : undefined} />
      </div>

      <div className="mt-6 space-y-3">
        {audit.pages.map((p) => (
          <PageRow key={p.path} p={p} />
        ))}
      </div>
    </div>
  );
}
