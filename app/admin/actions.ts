"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import type { ServiceKey } from "@/lib/supabase";
import { sanitizeRichText } from "@/lib/sanitize";
import { getPageDef } from "@/lib/pages";
import {
  createServerSupabase,
  requireRole,
  CONTENT_ROLES,
  ADMIN_ROLES,
  OWNER_ROLES,
  type Role,
} from "@/lib/auth";

const SERVICE_KEYS: ServiceKey[] = ["seo", "web", "content", "paid", "design"];

function str(fd: FormData, k: string) {
  const v = fd.get(k);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}

// --- Auth -------------------------------------------------------------------

/** Login form action (useActionState): returns an error, or redirects to /admin. */
export async function signIn(
  _prev: { error: string },
  fd: FormData
): Promise<{ error: string }> {
  const email = str(fd, "email");
  const password = str(fd, "password");
  if (!email || !password) return { error: "Enter your email and password." };

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: "Wrong email or password." };

  // A deactivated account can authenticate but must not get in.
  const { data: profile } = await supabaseAdmin()
    .from("profiles")
    .select("is_active")
    .eq("id", data.user.id)
    .maybeSingle();
  if (!profile || !profile.is_active) {
    await supabase.auth.signOut();
    return { error: "This account is inactive. Ask a super admin to re-enable it." };
  }

  redirect("/admin");
}

export async function signOut() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// --- Users (super_admin only) ----------------------------------------------

export async function createUser(fd: FormData) {
  await requireRole(OWNER_ROLES);
  const email = str(fd, "email");
  const password = str(fd, "password");
  const full_name = str(fd, "full_name");
  const role = (str(fd, "role") ?? "manager") as Role;
  if (!email || !password) return;

  const db = supabaseAdmin();
  const { data, error } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // no email server wired up yet — activate immediately
    user_metadata: { full_name },
  });
  if (error || !data.user) return;

  // The signup trigger seeds a profile; upsert the chosen role + name over it.
  await db
    .from("profiles")
    .upsert({ id: data.user.id, email, full_name, role, is_active: true });

  revalidatePath("/admin");
}

export async function updateUserRole(fd: FormData) {
  const me = await requireRole(OWNER_ROLES);
  const id = str(fd, "id");
  const role = str(fd, "role") as Role | null;
  if (!id || !role) return;
  if (id === me.user.id) return; // never let a super admin demote themselves out
  await supabaseAdmin().from("profiles").update({ role }).eq("id", id);
  revalidatePath("/admin");
}

export async function setUserActive(fd: FormData) {
  const me = await requireRole(OWNER_ROLES);
  const id = str(fd, "id");
  const active = fd.get("active") === "true";
  if (!id) return;
  if (id === me.user.id) return; // can't lock yourself out
  await supabaseAdmin().from("profiles").update({ is_active: active }).eq("id", id);
  revalidatePath("/admin");
}

// --- Gallery ----------------------------------------------------------------

type GalleryItem = { url: string; alt?: string; caption?: string };

/** Replace a project's gallery (the case-study slideshow). */
export async function saveGallery(projectId: string, gallery: GalleryItem[]) {
  await requireRole(CONTENT_ROLES);
  if (!projectId) return;

  const clean = (gallery ?? [])
    .filter((g) => typeof g?.url === "string" && g.url)
    .map((g) => ({
      url: g.url,
      alt: (g.alt ?? "").slice(0, 300),
      caption: (g.caption ?? "").slice(0, 300),
    }));

  const db = supabaseAdmin();
  await db
    .from("projects")
    .update({ gallery: clean, updated_at: new Date().toISOString() })
    .eq("id", projectId);

  const { data } = await db.from("projects").select("slug").eq("id", projectId).maybeSingle();
  revalidatePath("/work");
  if (data?.slug) revalidatePath(`/work/${data.slug}`);
  revalidatePath(`/admin/portfolio/${projectId}`);
}

// --- Page copy + SEO --------------------------------------------------------

export async function savePage(fd: FormData) {
  await requireRole(ADMIN_ROLES);
  const path = str(fd, "path");
  if (!path) return;
  const def = getPageDef(path);
  if (!def) return;

  // Only store non-empty overrides; a blank field falls back to the code default.
  const content: Record<string, string> = {};
  for (const s of def.slots) {
    const v = str(fd, `slot_${s.key}`);
    if (v) content[s.key] = v;
  }

  await supabaseAdmin().from("page_content").upsert({
    path,
    seo_title: str(fd, "seo_title"),
    seo_description: str(fd, "seo_description"),
    content,
    updated_at: new Date().toISOString(),
  });

  revalidatePath(path);
  revalidatePath(`/admin/pages/${def.key}`);
}

// --- Media uploads ----------------------------------------------------------

/** Upload an image to the public "media" bucket. Returns its public URL. */
export async function uploadImage(fd: FormData): Promise<{ url?: string; error?: string }> {
  await requireRole(CONTENT_ROLES);
  const file = fd.get("file");
  const folder = (str(fd, "folder") ?? "uploads").replace(/[^a-z0-9/_-]/gi, "");
  if (!(file instanceof File)) return { error: "No file selected." };
  if (!file.type.startsWith("image/")) return { error: "That isn't an image." };
  if (file.size > 8 * 1024 * 1024) return { error: "Images must be under 8MB." };

  const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${folder}/${randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const db = supabaseAdmin();
  const { error } = await db.storage
    .from("media")
    .upload(path, bytes, { contentType: file.type, upsert: false });
  if (error) return { error: error.message };

  return { url: db.storage.from("media").getPublicUrl(path).data.publicUrl };
}

// --- Media library ----------------------------------------------------------

export type MediaItem = {
  name: string;
  path: string;
  url: string;
  folder: string;
  size: number;
  updatedAt: string | null;
};

const isImageName = (n: string) => /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(n);

/** Everything in the `media` bucket (root + one level of folders). Managers+. */
export async function listMedia(): Promise<MediaItem[]> {
  await requireRole(CONTENT_ROLES);
  const db = supabaseAdmin();
  const pub = (p: string) => db.storage.from("media").getPublicUrl(p).data.publicUrl;
  const opts = { limit: 1000, sortBy: { column: "updated_at", order: "desc" as const } };
  const out: MediaItem[] = [];

  const { data: root } = await db.storage.from("media").list("", opts);
  const folders: string[] = [];
  for (const it of root ?? []) {
    // Supabase returns folder "prefixes" as entries with a null id.
    if (it.id === null) folders.push(it.name);
    else if (isImageName(it.name))
      out.push({ name: it.name, path: it.name, url: pub(it.name), folder: "", size: it.metadata?.size ?? 0, updatedAt: it.updated_at ?? null });
  }
  for (const f of folders) {
    const { data: files } = await db.storage.from("media").list(f, opts);
    for (const it of files ?? []) {
      if (it.id !== null && isImageName(it.name))
        out.push({ name: it.name, path: `${f}/${it.name}`, url: pub(`${f}/${it.name}`), folder: f, size: it.metadata?.size ?? 0, updatedAt: it.updated_at ?? null });
    }
  }
  return out;
}

/** Permanently remove an image from the bucket. Managers+. */
export async function deleteMedia(fd: FormData) {
  await requireRole(CONTENT_ROLES);
  const path = str(fd, "path");
  if (!path) return;
  await supabaseAdmin().storage.from("media").remove([path]);
  revalidatePath("/admin/media");
}

// --- Clients ----------------------------------------------------------------

export async function createClient(fd: FormData) {
  await requireRole(CONTENT_ROLES);
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
  await requireRole(CONTENT_ROLES);
  const db = supabaseAdmin();
  const id = str(fd, "id");
  if (!id) return;

  const services = SERVICE_KEYS.filter((k) => fd.get(`service_${k}`) === "on");

  await db
    .from("projects")
    .update({
      title: str(fd, "title") ?? "Untitled",
      tagline: str(fd, "tagline"),
      binomial: str(fd, "binomial"),
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
  redirect(`/admin/portfolio/${id}?saved=1`);
}

export async function addStat(fd: FormData) {
  await requireRole(CONTENT_ROLES);
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

export async function updateStat(fd: FormData) {
  await requireRole(CONTENT_ROLES);
  const id = str(fd, "id");
  const value = str(fd, "value");
  const label = str(fd, "label");
  if (!id || !value || !label) return;
  await supabaseAdmin()
    .from("project_stats")
    .update({ value, label: label.toUpperCase(), is_headline: fd.get("is_headline") === "on" })
    .eq("id", id);
  revalidatePath("/work");
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteStat(fd: FormData) {
  await requireRole(CONTENT_ROLES);
  const id = str(fd, "id");
  if (!id) return;
  await supabaseAdmin().from("project_stats").delete().eq("id", id);
  revalidatePath("/work");
  revalidatePath("/admin");
}

export async function setFeatured(fd: FormData) {
  await requireRole(CONTENT_ROLES);
  const db = supabaseAdmin();
  const client_id = str(fd, "client_id");
  if (!client_id) return;
  // Exactly one featured client — the home page has room for exactly one.
  await db.from("clients").update({ is_featured: false }).neq("id", client_id);
  await db.from("clients").update({ is_featured: true }).eq("id", client_id);
  revalidatePath("/");
  revalidatePath("/admin");
}

/** Unpublish a client's project. Keeps the row + /work/[slug] URL alive. */
export async function archiveClient(fd: FormData) {
  await requireRole(CONTENT_ROLES);
  const client_id = str(fd, "client_id");
  if (!client_id) return;
  await supabaseAdmin()
    .from("projects")
    .update({ is_published: false })
    .eq("client_id", client_id);
  revalidatePath("/work");
  revalidatePath("/admin");
  redirect("/admin/portfolio");
}

/** Permanent delete. Cascades to the project + stats (schema: on delete cascade). */
export async function deleteClient(fd: FormData) {
  await requireRole(ADMIN_ROLES);
  const client_id = str(fd, "client_id");
  if (!client_id) return;
  await supabaseAdmin().from("clients").delete().eq("id", client_id);
  revalidatePath("/work");
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin/portfolio");
}

// --- Posts ------------------------------------------------------------------

export async function savePost(fd: FormData) {
  await requireRole(CONTENT_ROLES);
  const db = supabaseAdmin();
  const id = str(fd, "id");
  const title = str(fd, "title");
  if (!title) return;

  const published = fd.get("is_published") === "on";
  const row = {
    slug: str(fd, "slug") ?? slugify(title),
    title,
    excerpt: str(fd, "excerpt"),
    body: sanitizeRichText(str(fd, "body") ?? ""),
    cover_image_url: str(fd, "cover_image_url"),
    seo_title: str(fd, "seo_title"),
    seo_description: str(fd, "seo_description"),
    author: str(fd, "author") ?? "Brainjar Media",
    is_published: published,
    published_at: published ? (str(fd, "published_at") ?? new Date().toISOString()) : null,
    updated_at: new Date().toISOString(),
  };

  if (id) await db.from("posts").update(row).eq("id", id);
  else await db.from("posts").insert(row);

  revalidatePath("/blog");
  revalidatePath(`/blog/${row.slug}`);
  revalidatePath("/admin/blog");
  // Publishing lands you on the live post; a draft has no public URL, so go
  // back to the list.
  redirect(published ? `/blog/${row.slug}` : "/admin/blog");
}

export async function deletePost(fd: FormData) {
  await requireRole(CONTENT_ROLES);
  const id = str(fd, "id");
  if (!id) return;
  await supabaseAdmin().from("posts").delete().eq("id", id);
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
