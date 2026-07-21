import { redirect } from "next/navigation";
import { requireUser, ADMIN_ROLES } from "@/lib/auth";
import { PAGES } from "@/lib/pages";
import { supabaseAdmin } from "@/lib/supabase";
import { AdminTable, type Column, type Row } from "@/components/admin/admin-table";
import { StatusBadge, fmtDate } from "@/components/admin/list-bits";

export const dynamic = "force-dynamic";

const COLUMNS: Column[] = [
  { key: "name", label: "Page" },
  { key: "status", label: "Status" },
  { key: "category", label: "Category" },
  { key: "updated", label: "Last Updated" },
];

export default async function PagesList() {
  const { profile } = await requireUser();
  if (!ADMIN_ROLES.includes(profile.role)) redirect("/admin");

  const { data: overrides } = await supabaseAdmin().from("page_content").select("path, updated_at");
  const updatedByPath = new Map((overrides ?? []).map((o) => [o.path as string, o.updated_at as string]));

  const rows: Row[] = PAGES.map((p) => {
    const customized = updatedByPath.has(p.path);
    return {
      id: p.key,
      editHref: `/admin/pages/${p.key}`,
      previewHref: p.path,
      cells: {
        name: { sort: p.name.toLowerCase(), node: p.name },
        status: {
          sort: customized ? 1 : 0,
          node: <StatusBadge published={customized} labels={["CUSTOMIZED", "DEFAULT"]} />,
        },
        // Category = page type. Phase B adds Service / Sub-service rows here.
        category: { sort: "1-Marketing", node: <span className="text-ink-soft">Marketing</span> },
        updated: {
          sort: updatedByPath.get(p.path) ?? "",
          node: <span className="text-ink-soft">{fmtDate(updatedByPath.get(p.path))}</span>,
        },
      },
    };
  });

  return (
    <div>
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-rule bg-paper/95 py-4 backdrop-blur">
        <h1 className="display text-2xl">Pages</h1>
        <span
          title="Creating brand-new static pages is coming soon"
          className="btn btn-outline cursor-not-allowed !py-2.5 opacity-50"
        >
          + NEW PAGE
        </span>
      </div>
      <p className="mt-4 text-base italic text-ink-soft">
        Edit each page’s copy and SEO — the layout stays fixed, you’re editing the words.
      </p>

      <div className="mt-4">
        <AdminTable columns={COLUMNS} rows={rows} initialSort="name" emptyText="No pages." />
      </div>
    </div>
  );
}
