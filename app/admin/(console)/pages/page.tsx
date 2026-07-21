import { redirect } from "next/navigation";
import { requireUser, ADMIN_ROLES } from "@/lib/auth";
import { PAGES } from "@/lib/pages";
import { SERVICES, SERVICE_CHIPS } from "@/lib/services";
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

  const svcOrder = new Map(SERVICES.map((s, i) => [s.key, i]));

  const rows: Row[] = PAGES.map((p) => {
    const customized = updatedByPath.has(p.path);
    const svcIdx = p.serviceKey ? svcOrder.get(p.serviceKey) ?? 9 : 9;

    // Category column: identifies the page type, and (for services/subs) the
    // parent — the sort key groups each service page with its own sub-pages.
    let catSort = "0";
    let catNode = <span className="text-ink-soft">Marketing</span>;
    if (p.type === "service") {
      catSort = `1-${svcIdx}-0`;
      catNode = <span className="text-cobalt">Service</span>;
    } else if (p.type === "subservice") {
      catSort = `1-${svcIdx}-1-${p.name}`;
      catNode = (
        <span className="text-ink-soft">↳ {p.serviceKey ? SERVICE_CHIPS[p.serviceKey] : "SUB"}</span>
      );
    }

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
        category: { sort: catSort, node: catNode },
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
        <AdminTable columns={COLUMNS} rows={rows} initialSort="category" emptyText="No pages." />
      </div>
    </div>
  );
}
