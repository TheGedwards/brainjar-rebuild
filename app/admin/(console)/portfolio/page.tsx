import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import { CATEGORY_LABELS } from "@/lib/services";
import { deleteClient } from "@/app/admin/actions";
import { AdminTable, type Column, type Row } from "@/components/admin/admin-table";
import { StatusBadge, fmtDate } from "@/components/admin/list-bits";

export const dynamic = "force-dynamic";

const COLUMNS: Column[] = [
  { key: "name", label: "Client" },
  { key: "status", label: "Status" },
  { key: "category", label: "Category" },
  { key: "updated", label: "Last Updated" },
];

export default async function PortfolioPage() {
  const { data: projects } = await supabaseAdmin()
    .from("projects")
    .select("id, slug, title, client_id, is_published, updated_at, clients(name, category, is_featured)")
    .order("updated_at", { ascending: false });

  const rows: Row[] = (projects ?? []).map((p: any) => {
    const name = p.clients?.name ?? p.title;
    const cat = CATEGORY_LABELS[p.clients?.category as keyof typeof CATEGORY_LABELS] ?? "—";
    return {
      id: p.id,
      editHref: `/admin/portfolio/${p.id}`,
      previewHref: `/work/${p.slug}`,
      deleteValue: p.client_id ?? undefined,
      deleteConfirm: `Permanently delete "${name}" and its /work/${p.slug} page? The old /portfolio-${p.slug} link will then 404. This can't be undone.`,
      cells: {
        name: {
          sort: name.toLowerCase(),
          node: (
            <>
              {p.clients?.is_featured && <span className="mr-1 text-tincture" title="Featured">★</span>}
              {name}
            </>
          ),
        },
        status: { sort: p.is_published ? 1 : 0, node: <StatusBadge published={p.is_published} /> },
        category: { sort: cat, node: <span className="text-ink-soft">{cat}</span> },
        updated: { sort: p.updated_at ?? "", node: <span className="text-ink-soft">{fmtDate(p.updated_at)}</span> },
      },
    };
  });

  return (
    <div>
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-rule bg-paper/95 py-4 backdrop-blur">
        <h1 className="display text-2xl">Portfolio</h1>
        <Link href="/admin/portfolio/new" className="btn btn-fill !py-2.5">
          + NEW CLIENT
        </Link>
      </div>

      <div className="mt-6">
        <AdminTable
          columns={COLUMNS}
          rows={rows}
          initialSort="updated"
          initialDir="desc"
          deleteAction={deleteClient}
          deleteField="client_id"
          emptyText="No clients yet. Add your first one."
        />
      </div>
    </div>
  );
}
