import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import { deletePost } from "@/app/admin/actions";
import { AdminTable, type Column, type Row } from "@/components/admin/admin-table";
import { StatusBadge, fmtDate } from "@/components/admin/list-bits";

export const dynamic = "force-dynamic";

const COLUMNS: Column[] = [
  { key: "title", label: "Title" },
  { key: "status", label: "Status" },
  { key: "category", label: "Category" },
  { key: "updated", label: "Last Updated" },
];

export default async function BlogListPage() {
  // select("*") so a DB without blog-category.sql still works (category undefined).
  const { data: posts } = await supabaseAdmin()
    .from("posts")
    .select("*")
    .order("updated_at", { ascending: false });

  const rows: Row[] = (posts ?? []).map((p: any) => ({
    id: p.id,
    editHref: `/admin/blog/${p.id}`,
    previewHref: `/blog/${p.slug}`,
    deleteValue: p.id,
    deleteConfirm: `Delete "${p.title}" permanently? This can't be undone.`,
    cells: {
      title: { sort: (p.title ?? "").toLowerCase(), node: p.title },
      status: { sort: p.is_published ? 1 : 0, node: <StatusBadge published={p.is_published} /> },
      category: {
        sort: (p.category ?? "").toLowerCase(),
        node: <span className="text-ink-soft">{p.category || "—"}</span>,
      },
      updated: { sort: p.updated_at ?? "", node: <span className="text-ink-soft">{fmtDate(p.updated_at)}</span> },
    },
  }));

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
          initialSort="updated"
          initialDir="desc"
          deleteAction={deletePost}
          deleteField="id"
          emptyText="No posts yet. Write your first one."
        />
      </div>
    </div>
  );
}
