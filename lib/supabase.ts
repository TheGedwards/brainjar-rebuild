import { createClient } from "@supabase/supabase-js";

/**
 * Fallbacks so that `npm run dev` and `next build` work BEFORE Supabase is
 * wired up — createClient() throws on an empty URL, which would otherwise take
 * down the whole build with an error that has nothing to do with your code.
 * With the placeholder, every query simply fails and each page falls through to
 * its `.catch(() => [])` empty state. You'll see the design; you just won't see
 * data until the real keys are in .env.local.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

/** Public reads. Obeys RLS: only published rows come back. Safe in the browser. */
export const supabase = createClient(url, anonKey);

/**
 * Writes. Bypasses RLS. Server-only — importing this into a client component
 * would ship your service_role key to the browser, so it throws if that happens.
 */
export function supabaseAdmin() {
  if (typeof window !== "undefined") {
    throw new Error("supabaseAdmin() is server-only");
  }
  return createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-key", {
    auth: { persistSession: false },
  });
}

// --- Types ------------------------------------------------------------------

export type ServiceKey = "seo" | "web" | "content" | "paid" | "design";

export type Client = {
  id: string;
  slug: string;
  name: string;
  category: "corporation" | "organization" | "local-business" | "public-event";
  industry: string | null;
  city: string | null;
  website_url: string | null;
  logo_url: string | null;
  is_featured: boolean;
  sort_order: number;
};

export type ProjectStat = {
  id: string;
  value: string;
  label: string;
  is_headline: boolean;
  sort_order: number;
};

export type Project = {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  services: ServiceKey[];
  summary: string | null;
  challenge: string | null;
  approach: string | null;
  outcome: string | null;
  hero_image_url: string | null;
  gallery: { url: string; alt?: string; caption?: string }[];
  year: number | null;
  clients: Client | null;
  project_stats: ProjectStat[];
};

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  cover_image_url: string | null;
  author: string;
  tags: string[];
  published_at: string | null;
};

const PROJECT_SELECT = `
  id, slug, title, tagline, services, summary, challenge, approach, outcome,
  hero_image_url, gallery, year,
  clients ( id, slug, name, category, industry, city, website_url, logo_url, is_featured, sort_order ),
  project_stats ( id, value, label, is_headline, sort_order )
`;

// --- Queries ----------------------------------------------------------------

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .eq("is_published", true);
  if (error) throw error;

  // Sort by the client's sort_order so the shelf reads the way you arranged it.
  return ((data ?? []) as unknown as Project[]).sort(
    (a, b) => (a.clients?.sort_order ?? 999) - (b.clients?.sort_order ?? 999)
  );
}

export async function getProject(slug: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as Project) ?? null;
}

export async function getFeaturedProject(): Promise<Project | null> {
  const all = await getProjects();
  return all.find((p) => p.clients?.is_featured) ?? all[0] ?? null;
}

export async function getPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Post[];
}

export async function getPost(slug: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw error;
  return (data as Post) ?? null;
}
