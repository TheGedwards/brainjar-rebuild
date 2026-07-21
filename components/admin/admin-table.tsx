"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * Shared list table for the admin (portfolio / blog / pages) so all three feel
 * identical: sortable columns, hover highlight, whole-row click to edit, and
 * optional eye (preview) + trash (delete) icons at the end of each row.
 *
 * Rows carry a `node` (what's shown) and a `sort` (primitive) per column, plus
 * an editHref. `node` may be JSX (a status badge) — it's fine to pass from a
 * server component. `deleteAction` is a server action passed straight through.
 */

export type Column = { key: string; label: string; align?: "right" };
export type Row = {
  id: string;
  editHref: string;
  previewHref?: string;
  deleteValue?: string;
  deleteConfirm?: string; // presence enables the trash icon
  cells: Record<string, { sort: string | number; node: ReactNode }>;
};

export function AdminTable({
  columns,
  rows,
  initialSort,
  initialDir = "asc",
  deleteAction,
  deleteField = "id",
  emptyText = "Nothing here yet.",
}: {
  columns: Column[];
  rows: Row[];
  initialSort?: string;
  initialDir?: "asc" | "desc";
  deleteAction?: (fd: FormData) => void | Promise<void>;
  deleteField?: string;
  emptyText?: string;
}) {
  const router = useRouter();
  const [sortKey, setSortKey] = useState(initialSort ?? columns[0].key);
  const [dir, setDir] = useState<"asc" | "desc">(initialDir);

  const sorted = useMemo(() => {
    const r = [...rows];
    r.sort((a, b) => {
      const av = a.cells[sortKey]?.sort ?? "";
      const bv = b.cells[sortKey]?.sort ?? "";
      const c = av < bv ? -1 : av > bv ? 1 : 0;
      return dir === "asc" ? c : -c;
    });
    return r;
  }, [rows, sortKey, dir]);

  const toggle = (k: string) => {
    if (k === sortKey) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setDir("asc");
    }
  };

  const hasActions = rows.some((r) => r.previewHref || r.deleteConfirm);

  if (rows.length === 0) {
    return (
      <div className="border border-rule bg-card px-4 py-6 text-base italic text-ink-faint">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-rule bg-card">
      <table className="w-full text-base">
        <thead className="border-b border-rule bg-panel">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={`px-4 py-3 ${col.align === "right" ? "text-right" : "text-left"}`}>
                <button
                  type="button"
                  onClick={() => toggle(col.key)}
                  className="eyebrow inline-flex items-center gap-1 hover:text-tincture"
                >
                  {col.label}
                  <span aria-hidden className="text-[8px] text-ink-faint">
                    {sortKey === col.key ? (dir === "asc" ? "▲" : "▼") : "↕"}
                  </span>
                </button>
              </th>
            ))}
            {hasActions && <th className="w-px px-4 py-3" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-rule">
          {sorted.map((row) => (
            <tr
              key={row.id}
              onClick={() => router.push(row.editHref)}
              className="cursor-pointer transition-colors hover:bg-panel/60"
            >
              {columns.map((col, i) => (
                <td
                  key={col.key}
                  className={`px-4 py-3 ${col.align === "right" ? "text-right" : ""}`}
                >
                  {i === 0 ? (
                    <Link
                      href={row.editHref}
                      onClick={(e) => e.stopPropagation()}
                      className="font-semibold hover:text-tincture"
                    >
                      {row.cells[col.key]?.node}
                    </Link>
                  ) : (
                    row.cells[col.key]?.node
                  )}
                </td>
              ))}
              {hasActions && (
                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-3">
                    {row.previewHref && (
                      <a
                        href={row.previewHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Preview"
                        title="Preview"
                        className="text-ink-faint hover:text-cobalt"
                      >
                        <EyeIcon />
                      </a>
                    )}
                    {deleteAction && row.deleteConfirm && (
                      <form
                        action={deleteAction}
                        onSubmit={(e) => {
                          if (!window.confirm(row.deleteConfirm!)) e.preventDefault();
                        }}
                      >
                        <input type="hidden" name={deleteField} value={row.deleteValue ?? row.id} />
                        <button
                          aria-label="Delete"
                          title="Delete"
                          className="block text-ink-faint hover:text-tincture"
                        >
                          <TrashIcon />
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
