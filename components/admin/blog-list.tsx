"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { quickUpdatePost, deletePost } from "@/app/admin/actions";

export type Status = "draft" | "scheduled" | "published";
export type BlogRow = {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  is_published: boolean;
  published_at: string | null;
  status: Status;
};

type SortKey = "title" | "status" | "category" | "published";

const FIELD =
  "w-full border border-rule bg-paper px-2 py-1.5 text-sm text-ink focus:border-tincture focus:outline-none";
const LBL = "mb-1 block font-display text-[9px] font-bold uppercase tracking-[0.15em] text-ink-faint";
const STATUS: Record<Status, { t: string; c: string }> = {
  published: { t: "Published", c: "text-tincture" },
  scheduled: { t: "Scheduled", c: "text-cobalt" },
  draft: { t: "Draft", c: "text-ink-faint" },
};

function toLocalInput(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:00`;
}
function fmtDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const COLS: { key: SortKey; label: string }[] = [
  { key: "title", label: "Title" },
  { key: "status", label: "Status" },
  { key: "category", label: "Category" },
  { key: "published", label: "Publish Date" },
];

export function BlogList({ posts }: { posts: BlogRow[] }) {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey>("published");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [f, setF] = useState({ title: "", slug: "", category: "", published: false, dt: "" });

  const weight = (p: BlogRow): string | number => {
    switch (sortKey) {
      case "title": return p.title.toLowerCase();
      case "status": return p.status === "scheduled" ? 2 : p.status === "published" ? 1 : 0;
      case "category": return (p.category ?? "").toLowerCase();
      case "published": return p.published_at ?? "";
    }
  };
  const sorted = useMemo(() => {
    const r = [...posts];
    r.sort((a, b) => {
      const av = weight(a);
      const bv = weight(b);
      const c = av < bv ? -1 : av > bv ? 1 : 0;
      return dir === "asc" ? c : -c;
    });
    return r;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts, sortKey, dir]);

  const toggle = (k: SortKey) => {
    if (k === sortKey) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setDir("asc"); }
  };

  const startEdit = (p: BlogRow) => {
    setEditingId(p.id);
    setF({ title: p.title, slug: p.slug, category: p.category ?? "", published: p.is_published, dt: toLocalInput(p.published_at) });
  };

  const save = async (id: string) => {
    setSaving(true);
    const fd = new FormData();
    fd.set("id", id);
    fd.set("title", f.title);
    fd.set("slug", f.slug);
    fd.set("category", f.category);
    fd.set("is_published", f.published ? "true" : "");
    fd.set("published_at", f.dt ? new Date(f.dt).toISOString() : "");
    await quickUpdatePost(fd);
    setSaving(false);
    setEditingId(null);
    router.refresh();
  };

  if (posts.length === 0) {
    return (
      <div className="border border-rule bg-card px-4 py-6 text-base italic text-ink-faint">
        No posts yet. Write your first one.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-rule bg-card">
      <table className="w-full text-base">
        <thead className="border-b border-rule bg-panel">
          <tr>
            {COLS.map((c) => (
              <th key={c.key} className="px-4 py-3 text-left">
                <button type="button" onClick={() => toggle(c.key)} className="eyebrow inline-flex items-center gap-1 hover:text-tincture">
                  {c.label}
                  <span aria-hidden className="text-[8px] text-ink-faint">
                    {sortKey === c.key ? (dir === "asc" ? "▲" : "▼") : "↕"}
                  </span>
                </button>
              </th>
            ))}
            <th className="w-px px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-rule">
          {sorted.map((p) =>
            editingId === p.id ? (
              <tr key={p.id} className="bg-panel/40">
                <td colSpan={5} className="px-4 py-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className={LBL}>Title</label>
                      <input className={FIELD} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
                    </div>
                    <div>
                      <label className={LBL}>Slug</label>
                      <input className={FIELD} value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} />
                    </div>
                    <div>
                      <label className={LBL}>Category</label>
                      <input className={FIELD} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} />
                    </div>
                    <div>
                      <label className={LBL}>Status</label>
                      <select
                        className={FIELD}
                        value={f.published ? "published" : "draft"}
                        onChange={(e) => setF({ ...f, published: e.target.value === "published" })}
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published (future date = scheduled)</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className={LBL}>Publish date &amp; time (Pacific · future = scheduled)</label>
                      <input type="datetime-local" step={3600} className={FIELD} value={f.dt} onChange={(e) => setF({ ...f, dt: e.target.value })} />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-4">
                    <button type="button" disabled={saving || !f.title} onClick={() => save(p.id)} className="btn btn-fill !py-2 disabled:opacity-50">
                      {saving ? "SAVING…" : "SAVE"}
                    </button>
                    <button type="button" onClick={() => setEditingId(null)} className="font-display text-[11px] tracking-[0.15em] text-ink-faint hover:text-tincture">
                      CANCEL
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              <tr key={p.id} className="transition-colors hover:bg-panel/60">
                <td className="px-4 py-3">
                  <Link href={`/admin/blog/${p.id}`} className="font-semibold hover:text-tincture">
                    {p.title}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className={`font-display text-[10px] font-bold uppercase tracking-[0.15em] ${STATUS[p.status].c}`}>
                    {STATUS[p.status].t}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-soft">{p.category || "—"}</td>
                <td className="px-4 py-3 text-ink-soft">
                  {fmtDateTime(p.published_at)}
                  {p.status === "scheduled" && <span className="ml-2 text-cobalt">(scheduled)</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button type="button" aria-label="Quick edit" title="Quick edit" onClick={() => startEdit(p)} className="text-ink-faint hover:text-tincture">
                      <PencilIcon />
                    </button>
                    <a href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer" aria-label="Preview" title="Preview" className="text-ink-faint hover:text-cobalt">
                      <EyeIcon />
                    </a>
                    <form
                      action={deletePost}
                      onSubmit={(e) => {
                        if (!window.confirm(`Delete "${p.title}" permanently? This can't be undone.`)) e.preventDefault();
                      }}
                    >
                      <input type="hidden" name="id" value={p.id} />
                      <button aria-label="Delete" title="Delete" className="block text-ink-faint hover:text-tincture">
                        <TrashIcon />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  );
}
