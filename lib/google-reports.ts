import "server-only";
import { JWT } from "google-auth-library";
import { unstable_cache } from "next/cache";

/**
 * Read-only Google reporting for /admin/analytics. Pulls Search Console (search)
 * + GA4 (on-site) via a service account, for an explicit date range plus an
 * optional comparison range (for period-over-period deltas). Cached hourly per
 * unique range. Env (Vercel Production):
 *   GOOGLE_SERVICE_ACCOUNT_JSON, GA4_PROPERTY_ID, GSC_SITE_URL
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
export type CityRow = { city: string; sessions: number; users: number };
export type LandingRow = { page: string; sessions: number; users: number };

export type RangeData = {
  sc: { totals: Metric; daily: DailyPoint[]; queries: QueryRow[]; pages: PageRow[] };
  ga: { totals: GaTotals; channels: ChannelRow[]; cities: CityRow[]; landing: LandingRow[] };
};
export type AnalyticsResult = {
  range: { startDate: string; endDate: string };
  compareRange: { startDate: string; endDate: string } | null;
  current: RangeData;
  previous: RangeData | null; // only .totals are meaningful (arrays skipped)
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

async function gscQuery(token: string, body: Record<string, unknown>) {
  const site = process.env.GSC_SITE_URL;
  if (!site) throw new Error("GSC_SITE_URL is not set in the environment.");
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Search Console API ${res.status}: ${(await res.text()).slice(0, 240)}`);
  return (await res.json()) as {
    rows?: { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }[];
  };
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
  if (!res.ok) throw new Error(`GA4 Data API ${res.status}: ${(await res.text()).slice(0, 240)}`);
  return (await res.json()) as {
    rows?: { dimensionValues?: { value: string }[]; metricValues?: { value: string }[] }[];
  };
}

const num = (v: string | undefined) => (v ? Number(v) : 0);
const empty: RangeData = {
  sc: { totals: { clicks: 0, impressions: 0, ctr: 0, position: 0 }, daily: [], queries: [], pages: [] },
  ga: { totals: { users: 0, sessions: 0, pageViews: 0, engagementRate: 0, organicSessions: 0 }, channels: [], cities: [], landing: [] },
};

/** Fetch one date range. `full` adds the breakdown tables (skip for the comparison period). */
async function fetchRange(token: string, startDate: string, endDate: string, full: boolean): Promise<RangeData> {
  // Search Console
  const scTotalsP = gscQuery(token, { startDate, endDate });
  const scDailyP = full ? gscQuery(token, { startDate, endDate, dimensions: ["date"] }) : null;
  const scQueriesP = full ? gscQuery(token, { startDate, endDate, dimensions: ["query"], rowLimit: 10 }) : null;
  const scPagesP = full ? gscQuery(token, { startDate, endDate, dimensions: ["page"], rowLimit: 10 }) : null;

  // GA4 — totals + channels always (channels gives organic sessions); cities/landing only when full.
  const gaTotalsP = ga4Report(token, {
    dateRanges: [{ startDate, endDate }],
    metrics: [{ name: "totalUsers" }, { name: "sessions" }, { name: "screenPageViews" }, { name: "engagementRate" }],
  });
  const gaChannelsP = ga4Report(token, {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "sessionDefaultChannelGroup" }],
    metrics: [{ name: "sessions" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: 10,
  });
  const gaCitiesP = full
    ? ga4Report(token, {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "city" }],
        metrics: [{ name: "sessions" }, { name: "totalUsers" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 10,
      })
    : null;
  const gaLandingP = full
    ? ga4Report(token, {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "landingPage" }],
        metrics: [{ name: "sessions" }, { name: "totalUsers" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 10,
      })
    : null;

  const [scTotalsR, scDailyR, scQueriesR, scPagesR, gaTotalsR, gaChannelsR, gaCitiesR, gaLandingR] =
    await Promise.all([scTotalsP, scDailyP, scQueriesP, scPagesP, gaTotalsP, gaChannelsP, gaCitiesP, gaLandingP]);

  const st = scTotalsR.rows?.[0];
  const channels: ChannelRow[] = (gaChannelsR.rows ?? []).map((r) => ({
    channel: r.dimensionValues?.[0]?.value ?? "(unknown)",
    sessions: num(r.metricValues?.[0]?.value),
  }));
  const m = gaTotalsR.rows?.[0]?.metricValues ?? [];

  return {
    sc: {
      totals: {
        clicks: st?.clicks ?? 0,
        impressions: st?.impressions ?? 0,
        ctr: st?.ctr ?? 0,
        position: st?.position ?? 0,
      },
      daily: (scDailyR?.rows ?? []).map((r) => ({ date: r.keys[0], clicks: r.clicks, impressions: r.impressions })),
      queries: (scQueriesR?.rows ?? []).map((r) => ({ query: r.keys[0], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position })),
      pages: (scPagesR?.rows ?? []).map((r) => ({ page: r.keys[0], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position })),
    },
    ga: {
      totals: {
        users: num(m[0]?.value),
        sessions: num(m[1]?.value),
        pageViews: num(m[2]?.value),
        engagementRate: num(m[3]?.value),
        organicSessions: channels.find((c) => c.channel === "Organic Search")?.sessions ?? 0,
      },
      channels,
      cities: (gaCitiesR?.rows ?? []).map((r) => ({
        city: r.dimensionValues?.[0]?.value ?? "(not set)",
        sessions: num(r.metricValues?.[0]?.value),
        users: num(r.metricValues?.[1]?.value),
      })),
      landing: (gaLandingR?.rows ?? []).map((r) => ({
        page: r.dimensionValues?.[0]?.value ?? "(not set)",
        sessions: num(r.metricValues?.[0]?.value),
        users: num(r.metricValues?.[1]?.value),
      })),
    },
  };
}

const cachedFetch = unstable_cache(
  async (startDate: string, endDate: string, cmpStart: string | null, cmpEnd: string | null): Promise<AnalyticsResult> => {
    const token = await accessToken();
    const current = await fetchRange(token, startDate, endDate, true);
    const previous = cmpStart && cmpEnd ? await fetchRange(token, cmpStart, cmpEnd, false) : null;
    return {
      range: { startDate, endDate },
      compareRange: cmpStart && cmpEnd ? { startDate: cmpStart, endDate: cmpEnd } : null,
      current,
      previous,
    };
  },
  ["admin-analytics-v2"],
  { revalidate: 3600 }
);

export function getAnalytics(
  range: { startDate: string; endDate: string },
  compare: { startDate: string; endDate: string } | null
): Promise<AnalyticsResult> {
  return cachedFetch(range.startDate, range.endDate, compare?.startDate ?? null, compare?.endDate ?? null);
}

export const EMPTY_RANGE = empty;
