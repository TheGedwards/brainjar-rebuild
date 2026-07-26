import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import { deletePost } from "@/app/admin/actions";
import { AdminTable, type Column, type Row } from "@/components/admin/admin-table";

export const dynamic = "force-dynamic";

const COLUMNS: Column[] = [
  { key: "title", label: "Title" },
  { key: "status", label: "Status" },
  { key: "category", label: "Category" },
  { key: "published", label: "Publish Date" },
];

type Status = "draft" | "scheduled" | "published";

function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, { text: string; cls: string }> = {
    published: { text: "Published", cls: "text-tincture" },
    scheduled: { text: "Scheduled", cls: "text-cobalt" },
    draft: { text: "Draft", cls: "text-ink-faint" },
  };
  const s = map[status];
  return <span className={`font-display text-[10px] font-bold uppercase tracking-[0.15em] ${s.cls}`}>{s.text}</span>;
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

export default async function BlogListPage() {
  const { data: posts } = await supabaseAdmin()
    .from("posts")
    .select("*")
    .order("published_at", { ascending: false, nullsFirst: false });

  const now = Date.now();

  const rows: Row[] = (posts ?? []).map((p: any) => {
    const pubTs = p.published_at ? new Date(p.published_at).getTime() : null;
    const status: Status = !p.is_published ? "draft" : pubTs !== null && pubTs > now ? "scheduled" : "published";
    return {
      id: p.id,
      editHref: `/admin/blog/${p.id}`,
      previewHref: `/blog/${p.slug}`,
      deleteValue: p.id,
      deleteConfirm: `Delete "${p.title}" permanently? This can't be undone.`,
      cells: {
        title: { sort: (p.title ?? "").toLowerCase(), node: p.title },
        // sort weight keeps scheduled above published above drafts
        status: { sort: status === "scheduled" ? 2 : status === "published" ? 1 : 0, node: <StatusBadge status={status} /> },
        category: {
          sort: (p.category ?? "").toLowerCase(),
          node: <span className="text-ink-soft">{p.category || "—"}</span>,
        },
        published: {
          sort: p.published_at ?? "",
          node: (
            <span className="text-ink-soft">
              {fmtDateTime(p.published_at)}
              {status === "scheduled" && <span className="ml-2 text-cobalt">(scheduled)</span>}
            </span>
          ),
        },
      },
    };
  });

  return (
    <div>
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-rule bg-paper/95 py-4 backdrop-blur">
        <h1 className="display text-2xl">Blog</h1>
        <Link href="/admin/blog/new" className="btn btn-fill !py-2.5">
          + NEW POST
        </Link>
      </div>

      <div className="mt-6">
        <AdminTable
          columns={COLUMNS}
          rows={rows}
          initialSort="published"
          initialDir="desc"
          deleteAction={deletePost}
          deleteField="id"
          emptyText="No posts yet. Write your first one."
        />
      </div>
    </div>
  );
}
