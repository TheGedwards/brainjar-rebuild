import type { MetadataRoute } from "next";
import { SERVICES } from "@/lib/services";
import { getProjects, getPosts } from "@/lib/supabase";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.brainjarmedia.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts] = await Promise.all([
    getProjects().catch(() => []),
    getPosts().catch(() => []),
  ]);

  const staticPages = ["", "/about", "/services", "/work", "/blog", "/contact"].map((p) => ({
    url: `${SITE}${p}`,
    lastModified: new Date(),
    priority: p === "" ? 1 : 0.8,
  }));

  const servicePages = SERVICES.flatMap((s) => [
    { url: `${SITE}/services/${s.slug}`, priority: 0.9 },
    ...s.subs.map((sub) => ({ url: `${SITE}/services/${s.slug}/${sub.slug}`, priority: 0.7 })),
  ]).map((p) => ({ ...p, lastModified: new Date() }));

  const workPages = projects.map((p) => ({
    url: `${SITE}/work/${p.slug}`,
    lastModified: new Date(),
    priority: 0.7,
  }));

  const blogPages = posts.map((p) => ({
    url: `${SITE}/blog/${p.slug}`,
    lastModified: p.published_at ? new Date(p.published_at) : new Date(),
    priority: 0.6,
  }));

  return [...staticPages, ...servicePages, ...workPages, ...blogPages];
}
