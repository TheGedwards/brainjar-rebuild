"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import type { ServiceKey } from "@/lib/supabase";

const SERVICE_KEYS: ServiceKey[] = ["seo", "web", "content", "paid", "design"];

function str(fd: FormData, k: string) {
  const v = fd.get(k);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}

// --- Clients ----------------------------------------------------------------

export async function createClient(fd: FormData) {
  const db = supabaseAdmin();
  const name = str(fd, "name");
  const slug = str(fd, "slug") ?? slugify(name ?? "");
  if (!name || !slug) return;

  const { data: client } = await db
    .from("clients")
    .insert({
      name,
      slug,
      category: str(fd, "category") ?? "local-business",
      industry: str(fd, "industry"),
      city: str(fd, "city"),
      website_url: str(fd, "website_url"),
    })
    .select("id, slug, name")
    .single();

  // Every client gets a project immediately — otherwise /work/{slug} 404s and
  // you've created a broken link on your own portfolio page.
  if (client) {
    await db.from("projects").insert({
      client_id: client.id,
      slug: client.slug,
      title: client.name,
      is_published: true,
    });
  }

  revalidatePath("/work");
  revalidatePath("/admin");
}

// --- Projects ---------------------------------------------------------------

export async function updateProject(fd: FormData) {
  const db = supabaseAdmin();
  const id = str(fd, "id");
  if (!id) return;

  const services = SERVICE_KEYS.filter((k) => fd.get(`service_${k}`) === "on");

  await db
    .from("projects")
    .update({
      title: str(fd, "title") ?? "Untitled",
      tagline: str(fd, "tagline"),
      summary: str(fd, "summary"),
      challenge: str(fd, "challenge"),
      approach: str(fd, "approach"),
      outcome: str(fd, "outcome"),
      hero_image_url: str(fd, "hero_image_url"),
      year: str(fd, "year") ? Number(str(fd, "year")) : null,
      services,
      is_published: fd.get("is_published") === "on",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  const slug = str(fd, "slug");
  revalidatePath("/work");
  if (slug) revalidatePath(`/work/${slug}`);
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function addStat(fd: FormData) {
  const db = supabaseAdmin();
  const project_id = str(fd, "project_id");
  const value = str(fd, "value");
  const label = str(fd, "label");
  if (!project_id || !value || !label) return;

  await db.from("project_stats").insert({
    project_id,
    value,
    label: label.toUpperCase(),
    is_headline: fd.get("is_headline") === "on",
  });

  revalidatePath("/work");
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteStat(fd: FormData) {
  const id = str(fd, "id");
  if (!id) return;
  await supabaseAdmin().from("project_stats").delete().eq("id", id);
  revalidatePath("/work");
  revalidatePath("/admin");
}

export async function setFeatured(fd: FormData) {
  const db = supabaseAdmin();
  const client_id = str(fd, "client_id");
  if (!client_id) return;
  // Exactly one featured client — the home page has room for exactly one.
  await db.from("clients").update({ is_featured: false }).neq("id", client_id);
  await db.from("clients").update({ is_featured: true }).eq("id", client_id);
  revalidatePath("/");
  revalidatePath("/admin");
}

// --- Posts ------------------------------------------------------------------

export async function savePost(fd: FormData) {
  const db = supabaseAdmin();
  const id = str(fd, "id");
  const title = str(fd, "title");
  if (!title) return;

  const published = fd.get("is_published") === "on";
  const row = {
    slug: str(fd, "slug") ?? slugify(title),
    title,
    excerpt: str(fd, "excerpt"),
    body: str(fd, "body") ?? "",
    cover_image_url: str(fd, "cover_image_url"),
    author: str(fd, "author") ?? "Brainjar Media",
    is_published: published,
    published_at: published ? (str(fd, "published_at") ?? new Date().toISOString()) : null,
    updated_at: new Date().toISOString(),
  };

  if (id) await db.from("posts").update(row).eq("id", id);
  else await db.from("posts").insert(row);

  revalidatePath("/blog");
  revalidatePath(`/blog/${row.slug}`);
  revalidatePath("/admin");
}

export async function deletePost(fd: FormData) {
  const id = str(fd, "id");
  if (!id) return;
  await supabaseAdmin().from("posts").delete().eq("id", id);
  revalidatePath("/blog");
  revalidatePath("/admin");
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
