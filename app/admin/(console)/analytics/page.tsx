import type { Metadata } from "next";
import { getAnalytics, type AnalyticsData } from "@/lib/google-reports";
import { ClicksImpressionsChart } from "@/components/admin/clicks-impressions-chart";

export const metadata: Metadata = { title: "Analytics", robots: { index: false, follow: false } };

const int = (n: number) => Math.round(n).toLocaleString("en-US");
const pct = (r: number) => `${(r * 100).toFixed(1)}%`;
const pos = (p: number) => p.toFixed(1);
const shortPath = (u: string) => {
  try {
    return new URL(u).pathname || "/";
  } catch {
    return u || "/";
  }
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-rule bg-card px-5 py-4">
      <div className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-ink-faint">
        {label}
      </div>
      <div className="display mt-2 text-3xl text-ink tabular-nums">{value}</div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 font-display text-[11px] font-bold uppercase tracking-[0.25em] text-cobalt">
      {children}
    </h2>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-rule bg-card p-5">
      <div className="mb-4 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-ink">
        {title}
      </div>
      {children}
    </div>
  );
}

export default async function AnalyticsPage() {
  let data: AnalyticsData | null = null;
  let error: string | null = null;
  try {
    data = await getAnalytics();
  } catch (e) {
    error = e instanceof Error ? e.message : "Unknown error fetching analytics.";
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="display text-2xl">Analytics</h1>
        <div className="mt-6 border border-tincture/50 bg-tincture-lt/20 p-6">
          <div className="font-display text-sm font-bold uppercase tracking-[0.2em] text-tincture-dk">
            Couldn&rsquo;t load Google data
          </div>
          <p className="mt-3 font-mono text-sm text-ink-soft">{error}</p>
          <ul className="mt-4 list-disc pl-5 font-body text-base text-ink-soft">
            <li>Confirm <code>GOOGLE_SERVICE_ACCOUNT_JSON</code>, <code>GA4_PROPERTY_ID</code>, and <code>GSC_SITE_URL</code> are set in Vercel (Production) and redeployed.</li>
            <li>Confirm the service-account email has <b>Full</b> access in Search Console and <b>Viewer</b> in GA4.</li>
            <li><code>GSC_SITE_URL</code> must match your property exactly — for a URL-prefix property include the trailing slash: <code>https://www.brainjarmedia.com/</code></li>
          </ul>
        </div>
      </div>
    );
  }

  const { sc, ga, range } = data;
  const maxChannel = Math.max(1, ...ga.channels.map((c) => c.sessions));

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <div>
        <h1 className="display text-2xl">Analytics</h1>
        <p className="mt-1 font-body text-base text-ink-faint">
          {range.startDate} – {range.endDate} · last 28 days
        </p>
      </div>

      {/* Row 1 — Search Console */}
      <section>
        <SectionLabel>Search Console</SectionLabel>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Clicks" value={int(sc.totals.clicks)} />
          <Stat label="Impressions" value={int(sc.totals.impressions)} />
          <Stat label="CTR" value={pct(sc.totals.ctr)} />
          <Stat label="Avg. Position" value={pos(sc.totals.position)} />
        </div>
      </section>

      {/* Row 2 — GA4 */}
      <section>
        <SectionLabel>Google Analytics (GA4)</SectionLabel>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Stat label="Users" value={int(ga.totals.users)} />
          <Stat label="Sessions" value={int(ga.totals.sessions)} />
          <Stat label="Page Views" value={int(ga.totals.pageViews)} />
          <Stat label="Engagement Rate" value={pct(ga.totals.engagementRate)} />
          <Stat label="Organic Sessions" value={int(ga.totals.organicSessions)} />
        </div>
      </section>

      {/* Row 3 — Chart */}
      <section>
        <Panel title="Clicks & Impressions — daily">
          <ClicksImpressionsChart daily={sc.daily} />
        </Panel>
      </section>

      {/* Row 4 — Queries + Traffic sources */}
      <section className="grid gap-6 lg:grid-cols-2">
        <Panel title="Top Search Queries">
          {sc.queries.length === 0 ? (
            <p className="font-body text-base italic text-ink-faint">No query data yet.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="font-display text-[10px] uppercase tracking-[0.15em] text-ink-faint">
                  <th className="pb-2">Query</th>
                  <th className="pb-2 text-right">Clicks</th>
                  <th className="pb-2 text-right">Impr.</th>
                  <th className="pb-2 text-right">CTR</th>
                  <th className="pb-2 text-right">Pos.</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {sc.queries.map((q) => (
                  <tr key={q.query} className="border-t border-rule/60">
                    <td className="py-1.5 pr-2 text-ink">{q.query}</td>
                    <td className="py-1.5 text-right">{int(q.clicks)}</td>
                    <td className="py-1.5 text-right text-ink-faint">{int(q.impressions)}</td>
                    <td className="py-1.5 text-right text-ink-faint">{pct(q.ctr)}</td>
                    <td className="py-1.5 text-right text-ink-faint">{pos(q.position)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>

        <Panel title="Traffic Sources (sessions)">
          {ga.channels.length === 0 ? (
            <p className="font-body text-base italic text-ink-faint">No session data yet.</p>
          ) : (
            <div className="space-y-3">
              {ga.channels.map((c) => (
                <div key={c.channel}>
                  <div className="flex items-baseline justify-between font-display text-[11px] tracking-[0.1em]">
                    <span className="text-ink">{c.channel}</span>
                    <span className="tabular-nums text-ink-faint">{int(c.sessions)}</span>
                  </div>
                  <div className="mt-1 h-2 bg-panel">
                    <div
                      className="h-2 bg-tincture"
                      style={{ width: `${(c.sessions / maxChannel) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </section>

      {/* Row 5 — Landing pages */}
      <section className="grid gap-6 lg:grid-cols-2">
        <Panel title="Top Organic Landing Pages (Search)">
          {sc.pages.length === 0 ? (
            <p className="font-body text-base italic text-ink-faint">No landing-page data yet.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="font-display text-[10px] uppercase tracking-[0.15em] text-ink-faint">
                  <th className="pb-2">Page</th>
                  <th className="pb-2 text-right">Clicks</th>
                  <th className="pb-2 text-right">Impr.</th>
                  <th className="pb-2 text-right">Pos.</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {sc.pages.map((p) => (
                  <tr key={p.page} className="border-t border-rule/60">
                    <td className="py-1.5 pr-2 text-ink">{shortPath(p.page)}</td>
                    <td className="py-1.5 text-right">{int(p.clicks)}</td>
                    <td className="py-1.5 text-right text-ink-faint">{int(p.impressions)}</td>
                    <td className="py-1.5 text-right text-ink-faint">{pos(p.position)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>

        <Panel title="Top Landing Pages (GA4)">
          {ga.landing.length === 0 ? (
            <p className="font-body text-base italic text-ink-faint">No landing-page data yet.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="font-display text-[10px] uppercase tracking-[0.15em] text-ink-faint">
                  <th className="pb-2">Page</th>
                  <th className="pb-2 text-right">Sessions</th>
                  <th className="pb-2 text-right">Users</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {ga.landing.map((p) => (
                  <tr key={p.page} className="border-t border-rule/60">
                    <td className="py-1.5 pr-2 text-ink">{p.page}</td>
                    <td className="py-1.5 text-right">{int(p.sessions)}</td>
                    <td className="py-1.5 text-right text-ink-faint">{int(p.users)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      </section>

      <p className="font-body text-sm text-ink-faint">
        Cached hourly from Google Search Console + GA4. Search data lags ~2–3 days;
        CTR and average position are period totals (impression-weighted).
      </p>
    </div>
  );
}
