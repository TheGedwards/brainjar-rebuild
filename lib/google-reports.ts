import "server-only";
import { JWT } from "google-auth-library";
import { unstable_cache } from "next/cache";

/**
 * Read-only Google reporting for the /admin/analytics dashboard. Pulls Search
 * Console (search side) + GA4 (everything else) using a service account, and
 * caches the combined result for an hour so admin loads are fast and we don't
 * hammer the APIs. All three env vars are set in Vercel:
 *   GOOGLE_SERVICE_ACCOUNT_JSON  the full service-account key JSON (secret)
 *   GA4_PROPERTY_ID              the numeric GA4 property id
 *   GSC_SITE_URL                 the Search Console property (URL-prefix or sc-domain:)
 */

const SCOPES = [
  "https://www.googleapis.com/auth/webmasters.readonly",
  "https://www.googleapis.com/auth/analytics.readonly",
];

export type Metric = { clicks: number; impressions: number; ctr: number; position: number };
export type DailyPoint = { date: string; clicks: number; impressions: number };
export type QueryRow = Metric & { query: string };
export type PageRow = Metric & { page: string };
export type GaTotals = {
  users: number;
  sessions: number;
  pageViews: number;
  engagementRate: number; // 0..1
  organicSessions: number;
};
export type ChannelRow = { channel: string; sessions: number };
export type LandingRow = { page: string; sessions: number; users: number };

export type AnalyticsData = {
  range: { startDate: string; endDate: string };
  sc: { totals: Metric; daily: DailyPoint[]; queries: QueryRow[]; pages: PageRow[] };
  ga: { totals: GaTotals; channels: ChannelRow[]; landing: LandingRow[] };
};

function serviceAccount() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not set in the environment.");
  try {
    return JSON.parse(raw) as { client_email: string; private_key: string };
  } catch {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON (paste the whole key file).");
  }
}

async function accessToken(): Promise<string> {
  const sa = serviceAccount();
  const jwt = new JWT({ email: sa.client_email, key: sa.private_key, scopes: SCOPES });
  const { token } = await jwt.getAccessToken();
  if (!token) throw new Error("Google auth failed — could not mint an access token.");
  return token;
}

/** Last 28 full days, ending yesterday (today's data is always partial). */
function range28() {
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 1);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 27);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { startDate: iso(start), endDate: iso(end) };
}

async function gscQuery(token: string, body: Record<string, unknown>) {
  const site = process.env.GSC_SITE_URL;
  if (!site) throw new Error("GSC_SITE_URL is not set in the environment.");
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
    site
  )}/searchAnalytics/query`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Search Console API ${res.status}: ${(await res.text()).slice(0, 240)}`);
  }
  return (await res.json()) as { rows?: { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }[] };
}

async function ga4Report(token: string, body: Record<string, unknown>) {
  const prop = process.env.GA4_PROPERTY_ID;
  if (!prop) throw new Error("GA4_PROPERTY_ID is not set in the environment.");
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${prop}:runReport`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`GA4 Data API ${res.status}: ${(await res.text()).slice(0, 240)}`);
  }
  return (await res.json()) as {
    rows?: { dimensionValues?: { value: string }[]; metricValues?: { value: string }[] }[];
  };
}

const num = (v: string | undefined) => (v ? Number(v) : 0);

async function fetchAll(): Promise<AnalyticsData> {
  const { startDate, endDate } = range28();
  const token = await accessToken();

  // ---- Search Console ----
  const [scTotalsRaw, scDailyRaw, scQueriesRaw, scPagesRaw] = await Promise.all([
    gscQuery(token, { startDate, endDate }),
    gscQuery(token, { startDate, endDate, dimensions: ["date"] }),
    gscQuery(token, { startDate, endDate, dimensions: ["query"], rowLimit: 10 }),
    gscQuery(token, { startDate, endDate, dimensions: ["page"], rowLimit: 10 }),
  ]);

  const t = scTotalsRaw.rows?.[0];
  const scTotals: Metric = {
    clicks: t?.clicks ?? 0,
    impressions: t?.impressions ?? 0,
    ctr: t?.ctr ?? 0,
    position: t?.position ?? 0,
  };
  const daily: DailyPoint[] = (scDailyRaw.rows ?? []).map((r) => ({
    date: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
  }));
  const queries: QueryRow[] = (scQueriesRaw.rows ?? []).map((r) => ({
    query: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: r.ctr,
    position: r.position,
  }));
  const pages: PageRow[] = (scPagesRaw.rows ?? []).map((r) => ({
    page: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: r.ctr,
    position: r.position,
  }));

  // ---- GA4 ----
  const [gaTotalsRaw, gaChannelsRaw, gaLandingRaw] = await Promise.all([
    ga4Report(token, {
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: "totalUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
        { name: "engagementRate" },
      ],
    }),
    ga4Report(token, {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 10,
    }),
    ga4Report(token, {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "landingPage" }],
      metrics: [{ name: "sessions" }, { name: "totalUsers" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 10,
    }),
  ]);

  const m = gaTotalsRaw.rows?.[0]?.metricValues ?? [];
  const channels: ChannelRow[] = (gaChannelsRaw.rows ?? []).map((r) => ({
    channel: r.dimensionValues?.[0]?.value ?? "(unknown)",
    sessions: num(r.metricValues?.[0]?.value),
  }));
  const gaTotals: GaTotals = {
    users: num(m[0]?.value),
    sessions: num(m[1]?.value),
    pageViews: num(m[2]?.value),
    engagementRate: num(m[3]?.value),
    organicSessions:
      channels.find((c) => c.channel === "Organic Search")?.sessions ?? 0,
  };
  const landing: LandingRow[] = (gaLandingRaw.rows ?? []).map((r) => ({
    page: r.dimensionValues?.[0]?.value ?? "(not set)",
    sessions: num(r.metricValues?.[0]?.value),
    users: num(r.metricValues?.[1]?.value),
  }));

  return {
    range: { startDate, endDate },
    sc: { totals: scTotals, daily, queries, pages },
    ga: { totals: gaTotals, channels, landing },
  };
}

/** Cached hourly. Throws on misconfig/API error — the page catches and explains. */
export const getAnalytics = unstable_cache(fetchAll, ["admin-analytics-v1"], {
  revalidate: 3600,
});
