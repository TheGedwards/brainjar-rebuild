import type { Metadata } from "next";
import { getAnalytics, type AnalyticsResult } from "@/lib/google-reports";
import { resolveRange, resolveCompare } from "@/lib/analytics-range";
import { ClicksImpressionsChart } from "@/components/admin/clicks-impressions-chart";
import { AnalyticsControls } from "@/components/admin/analytics-controls";
import { InfoTip } from "@/components/admin/info-tip";

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

type Kind = "int" | "pp" | "position";

function Delta({ cur, prev, kind }: { cur: number; prev: number | undefined; kind: Kind }) {
  if (prev === undefined) return null;

  let dirUp: boolean;
  let good: boolean;
  let main: string;
  let prevText: string;

  if (kind === "position") {
    const diff = cur - prev;
    if (cur === 0 && prev === 0) return <div className="mt-1 font-display text-[10px] text-ink-faint">—</div>;
    dirUp = diff > 0;
    good = diff < 0; // lower position is better
    main = `${diff > 0 ? "+" : ""}${diff.toFixed(1)}`;
    prevText = pos(prev);
  } else if (kind === "pp") {
    const diff = (cur - prev) * 100;
    dirUp = diff > 0;
    good = diff >= 0;
    main = `${diff > 0 ? "+" : ""}${diff.toFixed(1)} pp`;
    prevText = pct(prev);
  } else {
    const diff = cur - prev;
    dirUp = diff > 0;
    good = diff >= 0;
    main = prev === 0 ? (cur > 0 ? "new" : "—") : `${diff > 0 ? "+" : ""}${Math.round((diff / prev) * 100)}%`;
    prevText = int(prev);
  }

  const flat = main === "—";
  const arrow = flat ? "" : main === "new" ? "▲" : dirUp ? "▲" : "▼";
  const color = flat || !good ? "text-ink-faint" : "text-tincture";

  return (
    <div className={`mt-1 font-display text-[10px] tracking-[0.1em] ${color}`}>
      {arrow} {main} <span className="text-ink-faint/80">vs {prevText}</span>
    </div>
  );
}

function StatCard({
  label,
  tip,
  value,
  cur,
  prev,
  kind,
}: {
  label: string;
  tip?: string;
  value: string;
  cur: number;
  prev: number | undefined;
  kind: Kind;
}) {
  return (
    <div className="border border-rule bg-card px-5 py-4">
      <div className="flex items-center font-display text-[10px] font-bold uppercase tracking-[0.2em] text-ink-faint">
        {label}
        {tip && <InfoTip text={tip} />}
      </div>
      <div className="display mt-2 text-3xl text-ink tabular-nums">{value}</div>
      <Delta cur={cur} prev={prev} kind={kind} />
    </div>
  );
}

function SectionLabel({ children, tip }: { children: React.ReactNode; tip?: string }) {
  return (
    <h2 className="mb-3 flex items-center font-display text-[11px] font-bold uppercase tracking-[0.25em] text-cobalt">
      {children}
      {tip && <InfoTip text={tip} />}
    </h2>
  );
}

function Panel({ title, tip, children }: { title: string; tip?: string; children: React.ReactNode }) {
  return (
    <div className="border border-rule bg-card p-5">
      <div className="mb-4 flex items-center font-display text-[11px] font-bold uppercase tracking-[0.2em] text-ink">
        {title}
        {tip && <InfoTip text={tip} />}
      </div>
      {children}
    </div>
  );
}

const th = "pb-2 font-display text-[10px] uppercase tracking-[0.15em] text-ink-faint";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const get = (k: string) => (Array.isArray(sp[k]) ? sp[k]?.[0] : sp[k]) as string | undefined;

  const range = resolveRange({ period: get("period"), start: get("start"), end: get("end") });
  const compare = resolveCompare(range, get("compare"));

  let data: AnalyticsResult | null = null;
  let error: string | null = null;
  try {
    data = await getAnalytics(range, compare);
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
            <li>Confirm <code>GOOGLE_SERVICE_ACCOUNT_JSON</code>, <code>GA4_PROPERTY_ID</code>, and <code>GSC_SITE_URL</code> are set in Vercel and redeployed.</li>
            <li>The service-account email needs <b>Full</b> in Search Console and <b>Viewer</b> in GA4.</li>
            <li>URL-prefix <code>GSC_SITE_URL</code> must include the trailing slash.</li>
          </ul>
        </div>
      </div>
    );
  }

  const { current, previous, range: r, compareRange } = data;
  const sc = current.sc;
  const ga = current.ga;
  const pSc = previous?.sc.totals;
  const pGa = previous?.ga.totals;
  const maxChannel = Math.max(1, ...ga.channels.map((c) => c.sessions));

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="display text-2xl">Analytics</h1>
          <p className="mt-1 font-body text-base text-ink-faint">
            {r.startDate} – {r.endDate}
            {compareRange && ` · vs ${compareRange.startDate} – ${compareRange.endDate}`}
          </p>
        </div>
        <AnalyticsControls />
      </div>

      {/* Row 1 — Search Console */}
      <section>
        <SectionLabel tip="How your site performs in Google Search results (from Search Console).">
          Search Console
        </SectionLabel>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Clicks" tip="Times someone clicked through to your site from Google search results." value={int(sc.totals.clicks)} cur={sc.totals.clicks} prev={pSc?.clicks} kind="int" />
          <StatCard label="Impressions" tip="Times your site appeared in search results." value={int(sc.totals.impressions)} cur={sc.totals.impressions} prev={pSc?.impressions} kind="int" />
          <StatCard label="CTR" tip="Click-through rate — clicks ÷ impressions." value={pct(sc.totals.ctr)} cur={sc.totals.ctr} prev={pSc?.ctr} kind="pp" />
          <StatCard label="Avg. Position" tip="Average ranking position in search results. Lower is better." value={pos(sc.totals.position)} cur={sc.totals.position} prev={pSc?.position} kind="position" />
        </div>
      </section>

      {/* Row 2 — GA4 */}
      <section>
        <SectionLabel tip="On-site behavior from Google Analytics (all traffic, not just search).">
          Google Analytics (GA4)
        </SectionLabel>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Users" tip="Distinct people who visited." value={int(ga.totals.users)} cur={ga.totals.users} prev={pGa?.users} kind="int" />
          <StatCard label="Sessions" tip="Visits (a session ends after 30 min of inactivity)." value={int(ga.totals.sessions)} cur={ga.totals.sessions} prev={pGa?.sessions} kind="int" />
          <StatCard label="Page Views" tip="Total pages viewed across all sessions." value={int(ga.totals.pageViews)} cur={ga.totals.pageViews} prev={pGa?.pageViews} kind="int" />
          <StatCard label="Engagement Rate" tip="Share of sessions that were engaged (meaningful visits)." value={pct(ga.totals.engagementRate)} cur={ga.totals.engagementRate} prev={pGa?.engagementRate} kind="pp" />
          <StatCard label="Organic Sessions" tip="Sessions that arrived via organic (unpaid) search." value={int(ga.totals.organicSessions)} cur={ga.totals.organicSessions} prev={pGa?.organicSessions} kind="int" />
        </div>
      </section>

      {/* Row 3 — Chart */}
      <section>
        <Panel title="Clicks & Impressions — daily" tip="Daily search clicks (tincture) vs impressions (cobalt) over the period; each line is scaled to its own range.">
          <ClicksImpressionsChart daily={sc.daily} />
        </Panel>
      </section>

      {/* Row 4 — Queries + Traffic sources + Cities */}
      <section className="grid gap-6 lg:grid-cols-3">
        <Panel title="Top Search Queries" tip="The Google searches bringing people to your site.">
          {sc.queries.length === 0 ? (
            <p className="font-body text-base italic text-ink-faint">No query data yet.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th className={th}>Query</th>
                  <th className={`${th} text-right`}>Clk</th>
                  <th className={`${th} text-right`}>Impr</th>
                  <th className={`${th} text-right`}>Pos</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {sc.queries.map((q) => (
                  <tr key={q.query} className="border-t border-rule/60">
                    <td className="py-1.5 pr-2 text-ink">{q.query}</td>
                    <td className="py-1.5 text-right">{int(q.clicks)}</td>
                    <td className="py-1.5 text-right text-ink-faint">{int(q.impressions)}</td>
                    <td className="py-1.5 text-right text-ink-faint">{pos(q.position)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>

        <Panel title="Traffic Sources" tip="How visitors arrive — organic search, direct, referral, social, etc. (GA4 default channel groups).">
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
                    <div className="h-2 bg-tincture" style={{ width: `${(c.sessions / maxChannel) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Top Cities" tip="Where your visitors are located (by sessions) — your local reach.">
          {ga.cities.length === 0 ? (
            <p className="font-body text-base italic text-ink-faint">No location data yet.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th className={th}>City</th>
                  <th className={`${th} text-right`}>Sess</th>
                  <th className={`${th} text-right`}>Users</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {ga.cities.map((c) => (
                  <tr key={c.city} className="border-t border-rule/60">
                    <td className="py-1.5 pr-2 text-ink">{c.city}</td>
                    <td className="py-1.5 text-right">{int(c.sessions)}</td>
                    <td className="py-1.5 text-right text-ink-faint">{int(c.users)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      </section>

      {/* Row 5 — Landing pages */}
      <section>
        <SectionLabel tip="The first page a visitor lands on when they arrive.">Landing Pages</SectionLabel>
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Top Organic Landing Pages (Search)" tip="Pages earning the most clicks from Google search.">
            {sc.pages.length === 0 ? (
              <p className="font-body text-base italic text-ink-faint">No landing-page data yet.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr>
                    <th className={th}>Page</th>
                    <th className={`${th} text-right`}>Clicks</th>
                    <th className={`${th} text-right`}>Impr.</th>
                    <th className={`${th} text-right`}>Pos.</th>
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

          <Panel title="Top Landing Pages (GA4)" tip="Pages where sessions start, across all traffic sources.">
            {ga.landing.length === 0 ? (
              <p className="font-body text-base italic text-ink-faint">No landing-page data yet.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr>
                    <th className={th}>Page</th>
                    <th className={`${th} text-right`}>Sessions</th>
                    <th className={`${th} text-right`}>Users</th>
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
        </div>
      </section>

      <p className="font-body text-sm text-ink-faint">
        Cached hourly from Google Search Console + GA4. Search data lags ~2–3 days.
        Deltas compare to the selected comparison period; tincture = favorable movement.
      </p>
    </div>
  );
}
