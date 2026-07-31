"use server";

import { randomUUID } from "crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import type { ServiceKey } from "@/lib/supabase";
import { sanitizeRichText } from "@/lib/sanitize";
import { getPageDef } from "@/lib/pages";
import { ALL_STATUSES, REASON_REQUIRED } from "@/lib/lead-pipeline";
import {
  createServerSupabase,
  getCurrentUser,
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

/** Lightweight role lookup for the public admin bar. Null if signed out. */
export async function getMyRole(): Promise<Role | null> {
  const current = await getCurrentUser();
  return current?.profile.role ?? null;
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
  redirect(`/admin/pages/${def.key}?saved=1`);
}

// --- Media uploads ----------------------------------------------------------

/** SEO-friendly filename slug from a display name or original filename. */
function slugifyName(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/\.[a-z0-9]+$/i, "") // drop extension
      .normalize("NFKD")
      .replace(/[^\x00-\x7F]/g, "") // strip accents/emoji
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "image"
  );
}

/**
 * Upload an image to the public "media" bucket. Names the file from an optional
 * `name` (or the original filename) as an SEO slug rather than a random UUID,
 * and records a media_assets row (alt editable later). Returns its public URL.
 */
export async function uploadImage(fd: FormData): Promise<{ url?: string; error?: string }> {
  await requireRole(CONTENT_ROLES);
  const file = fd.get("file");
  const folder = (str(fd, "folder") ?? "uploads").replace(/[^a-z0-9/_-]/gi, "");
  if (!(file instanceof File)) return { error: "No file selected." };
  if (!file.type.startsWith("image/")) return { error: "That isn't an image." };
  // 4MB stays safely under Vercel's ~4.5MB function request-body limit (uploads
  // run through a Server Action). Larger needs a direct-to-storage upload path.
  if (file.size > 4 * 1024 * 1024) return { error: "Images must be under 4MB." };

  const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "");
  const base = slugifyName(str(fd, "name") || file.name);
  const bytes = Buffer.from(await file.arrayBuffer());
  const db = supabaseAdmin();

  // Prefer the clean name; on collision fall back to a short unique suffix.
  let path = `${folder}/${base}.${ext}`;
  let up = await db.storage.from("media").upload(path, bytes, { contentType: file.type, upsert: false });
  if (up.error) {
    path = `${folder}/${base}-${randomUUID().slice(0, 6)}.${ext}`;
    up = await db.storage.from("media").upload(path, bytes, { contentType: file.type, upsert: false });
    if (up.error) return { error: up.error.message };
  }

  // Metadata row (fail-soft if the media_assets table isn't migrated yet).
  await db
    .from("media_assets")
    .upsert({ path, folder, alt: str(fd, "alt") ?? "", updated_at: new Date().toISOString() })
    .then((r) => r, () => null);

  revalidateTag("media-alt");
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
  alt: string;
  title: string | null;
};

const isImageName = (n: string) => /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(n);

/** Everything in the `media` bucket (root + one level of folders). Managers+. */
export async function listMedia(): Promise<MediaItem[]> {
  await requireRole(CONTENT_ROLES);
  const db = supabaseAdmin();
  const pub = (p: string) => db.storage.from("media").getPublicUrl(p).data.publicUrl;
  const opts = { limit: 1000, sortBy: { column: "updated_at", order: "desc" as const } };
  const out: MediaItem[] = [];
  const blank = { alt: "", title: null as string | null };

  const { data: root } = await db.storage.from("media").list("", opts);
  const folders: string[] = [];
  for (const it of root ?? []) {
    // Supabase returns folder "prefixes" as entries with a null id.
    if (it.id === null) folders.push(it.name);
    else if (isImageName(it.name))
      out.push({ name: it.name, path: it.name, url: pub(it.name), folder: "", size: it.metadata?.size ?? 0, updatedAt: it.updated_at ?? null, ...blank });
  }
  for (const f of folders) {
    const { data: files } = await db.storage.from("media").list(f, opts);
    for (const it of files ?? []) {
      if (it.id !== null && isImageName(it.name))
        out.push({ name: it.name, path: `${f}/${it.name}`, url: pub(`${f}/${it.name}`), folder: f, size: it.metadata?.size ?? 0, updatedAt: it.updated_at ?? null, ...blank });
    }
  }

  // Overlay stored alt/title (fail-soft if the table isn't migrated yet).
  const { data: metas } = await db
    .from("media_assets")
    .select("path, alt, title")
    .then((r) => r, () => ({ data: null }));
  const meta = new Map((metas ?? []).map((m: { path: string; alt: string | null; title: string | null }) => [m.path, m]));
  for (const item of out) {
    const m = meta.get(item.path);
    if (m) {
      item.alt = m.alt ?? "";
      item.title = m.title ?? null;
    }
  }
  return out;
}

/** Save SEO alt text + title for an image. Managers+. */
export async function updateMediaMeta(fd: FormData) {
  await requireRole(CONTENT_ROLES);
  const path = str(fd, "path");
  if (!path) return;
  const folder = path.includes("/") ? path.split("/")[0] : "";
  await supabaseAdmin()
    .from("media_assets")
    .upsert({ path, folder, alt: str(fd, "alt") ?? "", title: str(fd, "title") || null, updated_at: new Date().toISOString() });
  revalidateTag("media-alt"); // push new alt to public pages immediately
  revalidatePath("/admin/media");
}

/** Permanently remove an image from the bucket + its metadata. Managers+. */
export async function deleteMedia(fd: FormData) {
  await requireRole(CONTENT_ROLES);
  const path = str(fd, "path");
  if (!path) return;
  const db = supabaseAdmin();
  await db.storage.from("media").remove([path]);
  await db.from("media_assets").delete().eq("path", path).then((r) => r, () => null);
  revalidateTag("media-alt");
  revalidatePath("/admin/media");
}

type Db = ReturnType<typeof supabaseAdmin>;

/**
 * Repoint every reference to an image from oldUrl to newUrl across all content
 * that can hold a media URL: post bodies + covers, project heroes + galleries,
 * and page_content copy. Volumes are tiny, so a read-modify-write per row is fine.
 */
async function rewriteMediaUrl(db: Db, oldUrl: string, newUrl: string) {
  const swap = (s: string) => s.split(oldUrl).join(newUrl);

  const { data: posts } = await db.from("posts").select("id, body, cover_image_url").then((r) => r, () => ({ data: null }));
  for (const p of (posts ?? []) as { id: string; body: string | null; cover_image_url: string | null }[]) {
    const patch: Record<string, unknown> = {};
    if (p.cover_image_url === oldUrl) patch.cover_image_url = newUrl;
    if (typeof p.body === "string" && p.body.includes(oldUrl)) patch.body = swap(p.body);
    if (Object.keys(patch).length) await db.from("posts").update(patch).eq("id", p.id);
  }

  const { data: projects } = await db.from("projects").select("id, hero_image_url, gallery").then((r) => r, () => ({ data: null }));
  for (const pr of (projects ?? []) as { id: string; hero_image_url: string | null; gallery: unknown }[]) {
    const patch: Record<string, unknown> = {};
    if (pr.hero_image_url === oldUrl) patch.hero_image_url = newUrl;
    const g = pr.gallery == null ? "" : JSON.stringify(pr.gallery);
    if (g.includes(oldUrl)) patch.gallery = JSON.parse(swap(g));
    if (Object.keys(patch).length) await db.from("projects").update(patch).eq("id", pr.id);
  }

  const { data: pages } = await db.from("page_content").select("path, content").then((r) => r, () => ({ data: null }));
  for (const pg of (pages ?? []) as { path: string; content: unknown }[]) {
    const c = pg.content == null ? "" : JSON.stringify(pg.content);
    if (c.includes(oldUrl)) await db.from("page_content").update({ content: JSON.parse(swap(c)) }).eq("path", pg.path);
  }
}

/**
 * Rename an image to an SEO-friendly filename AND repoint every reference to it.
 * Copy → rewrite → remove old, so there's never a window where a live page
 * points at a missing file. Managers+.
 */
export async function renameMedia(fd: FormData): Promise<{ error?: string } | void> {
  await requireRole(CONTENT_ROLES);
  const oldPath = str(fd, "path");
  const newName = str(fd, "name");
  if (!oldPath || !newName) return { error: "Missing image or new name." };

  const slash = oldPath.lastIndexOf("/");
  const folder = slash >= 0 ? oldPath.slice(0, slash) : "";
  const ext = (oldPath.split(".").pop() || "png").toLowerCase();
  const base = slugifyName(newName);
  const newPath = folder ? `${folder}/${base}.${ext}` : `${base}.${ext}`;
  if (newPath === oldPath) return; // no change

  const db = supabaseAdmin();
  const pub = (p: string) => db.storage.from("media").getPublicUrl(p).data.publicUrl;

  // 1. Copy to the new name (both files exist during the rewrite = no broken window).
  const copy = await db.storage.from("media").copy(oldPath, newPath);
  if (copy.error) return { error: `Couldn't rename — ${copy.error.message} (a file named "${base}.${ext}" may already exist).` };

  // 2. Repoint every reference from old URL to new URL.
  await rewriteMediaUrl(db, pub(oldPath), pub(newPath));

  // 3. Move the metadata row, then drop the old object.
  await db.from("media_assets").update({ path: newPath, folder }).eq("path", oldPath).then((r) => r, () => null);
  await db.storage.from("media").remove([oldPath]);

  revalidateTag("media-alt");
  revalidatePath("/admin/media");
}

// --- Leads ------------------------------------------------------------------

/**
 * Manually add a lead to follow up with (bypasses the public contact form).
 * Requires a name plus at least one way to reach them. Doesn't set `status` so
 * it works even before leads-status.sql is run (the column default handles it).
 * Admins+.
 */
export async function createLead(fd: FormData): Promise<{ error?: string } | void> {
  await requireRole(ADMIN_ROLES);
  const name = (str(fd, "name") ?? "").trim();
  const email = (str(fd, "email") ?? "").trim();
  const phone = (str(fd, "phone") ?? "").trim();
  if (!name) return { error: "Name is required." };
  if (!email && !phone) return { error: "Add at least an email or a phone number." };

  const { error } = await supabaseAdmin().from("leads").insert({
    name,
    email, // "" is allowed (column is NOT NULL); UI shows a dash when empty
    phone: phone || null,
    company: str(fd, "company")?.trim() || null,
    symptom: str(fd, "symptom")?.trim() || null,
    message: str(fd, "message")?.trim() || null,
    source_path: "(manual entry)",
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}

/**
 * Save a lead's pipeline state: stage/outcome + reason + the next-action engine
 * + notes. Enforces the two rules that keep the pipeline honest — junk/
 * disqualified/lost need a reason, and Nurture needs a revisit date. Stamps
 * stage_changed_at when the stage actually moves (drives "time in stage").
 * Admins+.
 */
export async function saveLeadPipeline(fd: FormData): Promise<{ error?: string } | void> {
  await requireRole(ADMIN_ROLES);
  const id = str(fd, "id");
  if (!id) return { error: "Missing lead." };
  const status = str(fd, "status") ?? "new";
  if (!(ALL_STATUSES as string[]).includes(status)) return { error: "Unknown status." };

  const reason = str(fd, "reason")?.trim() || null;
  const next_action = str(fd, "next_action")?.trim() || null;
  // Only accept a well-formed date; anything else (incl. "") becomes null so an
  // empty string can never hit the date column and 500 the save.
  const rawDate = str(fd, "next_action_at");
  const next_action_at = rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : null;
  const notes = str(fd, "notes")?.trim() || null;

  if ((REASON_REQUIRED as string[]).includes(status) && !reason)
    return { error: "Choose a reason for a junk, disqualified, or lost lead." };
  if (status === "nurture" && !next_action_at)
    return { error: "Nurture needs a revisit date (that's the whole point)." };

  const db = supabaseAdmin();
  const { data: cur } = await db
    .from("leads")
    .select("status")
    .eq("id", id)
    .maybeSingle()
    .then((r) => r, () => ({ data: null }));

  const now = new Date().toISOString();
  const patch: Record<string, unknown> = { status, reason, next_action, next_action_at, notes, updated_at: now };
  if (!cur || (cur as { status: string | null }).status !== status) patch.stage_changed_at = now;

  const { error } = await db.from("leads").update(patch).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}

/**
 * Permanently delete a lead. The rare exception — for test rows, duplicates, or
 * a data-removal request. (For a real lead you're not pursuing, use Disqualified
 * or Lost, which keep the record.) Owner (super_admin) only, and irreversible.
 */
export async function deleteLead(fd: FormData) {
  await requireRole(OWNER_ROLES);
  const id = str(fd, "id");
  if (!id) return;
  await supabaseAdmin().from("leads").delete().eq("id", id);
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
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
  let projectId: string | null = null;
  if (client) {
    const { data: project } = await db
      .from("projects")
      .insert({
        client_id: client.id,
        slug: client.slug,
        title: client.name,
        is_published: true,
      })
      .select("id")
      .single();
    projectId = project?.id ?? null;
  }

  revalidatePath("/work");
  revalidatePath("/admin");
  // Land straight in the new client's editor, like "+ New Post" does for blog.
  redirect(projectId ? `/admin/portfolio/${projectId}` : "/admin/portfolio");
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
  // An empty date on a published post means "now"; a future date = scheduled.
  const publishedAt = published ? (str(fd, "published_at") || new Date().toISOString()) : null;
  const scheduled = !!publishedAt && new Date(publishedAt).getTime() > Date.now();
  const row = {
    slug: str(fd, "slug") ?? slugify(title),
    title,
    excerpt: str(fd, "excerpt"),
    body: sanitizeRichText(str(fd, "body") ?? ""),
    cover_image_url: str(fd, "cover_image_url"),
    seo_title: str(fd, "seo_title"),
    seo_description: str(fd, "seo_description"),
    category: str(fd, "category"),
    author: str(fd, "author") ?? "Brainjar Media",
    is_published: published,
    published_at: publishedAt,
    updated_at: new Date().toISOString(),
  };

  const write = (r: typeof row | Omit<typeof row, "category">) =>
    id ? db.from("posts").update(r).eq("id", id) : db.from("posts").insert(r);
  let res = await write(row);
  // Tolerate a DB that hasn't run blog-category.sql yet: retry without it.
  if (res.error && /category/i.test(res.error.message)) {
    const { category: _omit, ...rest } = row;
    res = await write(rest);
  }

  revalidatePath("/blog");
  revalidatePath(`/blog/${row.slug}`);
  revalidatePath("/admin/blog");
  // A live (published, past-dated) post lands you on the public page; a draft or
  // a scheduled (future) post has no live URL yet, so go back to the list.
  redirect(published && !scheduled ? `/blog/${row.slug}` : "/admin/blog");
}

/** Inline quick-edit from the blog list — updates only the row-editable fields. */
export async function quickUpdatePost(fd: FormData) {
  await requireRole(CONTENT_ROLES);
  const id = str(fd, "id");
  const title = str(fd, "title");
  if (!id || !title) return;

  const published = fd.get("is_published") === "true";
  const publishedAt = published ? (str(fd, "published_at") || new Date().toISOString()) : null;
  const row = {
    title,
    slug: str(fd, "slug") ?? slugify(title),
    category: str(fd, "category"),
    is_published: published,
    published_at: publishedAt,
    updated_at: new Date().toISOString(),
  };
  const db = supabaseAdmin();
  let res = await db.from("posts").update(row).eq("id", id);
  if (res.error && /category/i.test(res.error.message)) {
    const { category: _omit, ...rest } = row;
    res = await db.from("posts").update(rest).eq("id", id);
  }
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${row.slug}`);
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
