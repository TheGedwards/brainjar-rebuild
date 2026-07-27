import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireUser, ADMIN_ROLES } from "@/lib/auth";
import { getLinkAudit, type RedirectCheck } from "@/lib/link-audit";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Redirects & Links", robots: { index: false, follow: false } };

const C = { fail: "#dc2626", warn: "#d97706", ok: "#16a34a" };

function Tile({ n, label, color }: { n: number; label: string; color?: string }) {
  return (
    <div className="border border-rule bg-card p-4 text-center">
      <div className="display text-3xl tabular-nums" style={color ? { color } : undefined}>{n}</div>
      <div className="mt-1 font-display text-[9px] font-bold uppercase tracking-[0.2em] text-ink-faint">{label}</div>
    </div>
  );
}

function RedirectRow({ r }: { r: RedirectCheck }) {
  return (
    <tr className="border-t border-rule align-top">
      <td className="px-3 py-2">
        <span className="inline-block size-2 rounded-full" style={{ background: r.ok ? C.ok : C.fail }} />
      </td>
      <td className="px-3 py-2 font-mono text-[11px] text-ink">
        {r.source}
        {r.pattern && <span className="ml-1 text-ink-faint">(pattern)</span>}
      </td>
      <td className="px-3 py-2 font-mono text-[11px] text-ink-soft">{r.destination}</td>
      <td className="px-3 py-2 text-sm" style={{ color: r.ok ? "var(--color-ink-soft)" : C.fail }}>{r.note}</td>
    </tr>
  );
}

export default async function RedirectsPage() {
  const { profile } = await requireUser();
  if (!ADMIN_ROLES.includes(profile.role)) redirect("/admin");

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  const base = host ? `${proto}://${host}` : SITE_URL;

  const audit = await getLinkAudit(base);
  const brokenRedirects = audit.redirects.filter((r) => !r.ok);

  return (
    <div className="max-w-4xl">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-rule bg-paper/95 py-4 backdrop-blur">
        <h1 className="display text-2xl">Redirects &amp; Links</h1>
        <span className="font-display text-[10px] tracking-[0.2em] text-ink-faint">CACHED HOURLY</span>
      </div>
      <p className="mt-4 text-base italic text-ink-soft">
        Protects the load-bearing 301 map and catches broken internal links. Every redirect rule is
        tested against the live site; every on-site link is followed. Fix the reds.
      </p>

      {/* Redirects ---------------------------------------------------------- */}
      <h2 className="mt-8 font-display text-sm font-bold uppercase tracking-[0.2em]">301 Redirect Map</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Tile n={audit.redirectSummary.total} label="Rules tested" />
        <Tile n={audit.redirectSummary.ok} label="Working" color={audit.redirectSummary.ok ? C.ok : undefined} />
        <Tile n={audit.redirectSummary.broken} label="Broken" color={audit.redirectSummary.broken ? C.fail : undefined} />
      </div>

      {brokenRedirects.length > 0 && (
        <div className="mt-4 overflow-x-auto border border-rule">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-panel font-display text-[10px] uppercase tracking-[0.15em] text-ink-faint">
                <th className="px-3 py-2"></th><th className="px-3 py-2">Broken source</th>
                <th className="px-3 py-2">Should go to</th><th className="px-3 py-2">What happened</th>
              </tr>
            </thead>
            <tbody>{brokenRedirects.map((r) => <RedirectRow key={r.source} r={r} />)}</tbody>
          </table>
        </div>
      )}

      <details className="mt-4 border border-rule bg-card">
        <summary className="cursor-pointer list-none px-4 py-3 font-display text-[11px] font-bold tracking-[0.15em] text-ink-soft [&::-webkit-details-marker]:hidden">
          {audit.redirectSummary.broken === 0 ? "✓ All redirects working — " : ""}SHOW ALL {audit.redirectSummary.total} RULES
        </summary>
        <div className="overflow-x-auto border-t border-rule">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-panel font-display text-[10px] uppercase tracking-[0.15em] text-ink-faint">
                <th className="px-3 py-2"></th><th className="px-3 py-2">Source</th>
                <th className="px-3 py-2">Destination</th><th className="px-3 py-2">Result</th>
              </tr>
            </thead>
            <tbody>{audit.redirects.map((r) => <RedirectRow key={r.source} r={r} />)}</tbody>
          </table>
        </div>
      </details>

      {/* Internal links ----------------------------------------------------- */}
      <h2 className="mt-10 font-display text-sm font-bold uppercase tracking-[0.2em]">Internal Links</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Tile n={audit.linkSummary.checked} label="Links checked" />
        <Tile n={audit.linkSummary.ok} label="OK" color={audit.linkSummary.ok ? C.ok : undefined} />
        <Tile n={audit.linkSummary.redirected} label="Hit a redirect" color={audit.linkSummary.redirected ? C.warn : undefined} />
        <Tile n={audit.linkSummary.broken} label="Broken" color={audit.linkSummary.broken ? C.fail : undefined} />
      </div>

      <div className="mt-4 space-y-2">
        {audit.links.length === 0 ? (
          <p className="text-base italic text-ink-faint">Every internal link resolves cleanly. Nothing to fix.</p>
        ) : (
          audit.links.map((l, i) => (
            <div key={i} className="flex items-start gap-3 border border-rule bg-card p-3">
              <span className="mt-1 inline-block size-2.5 shrink-0 rounded-full" style={{ background: l.severity === "fail" ? C.fail : C.warn }} />
              <div className="min-w-0 text-base">
                <span className="font-mono text-[12px] text-ink">{l.url}</span>
                <span className="text-ink-soft"> — {l.note}</span>
                <div className="font-display text-[10px] tracking-[0.15em] text-ink-faint">FOUND ON {l.foundOn}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
