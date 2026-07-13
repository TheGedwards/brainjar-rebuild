import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import { CATEGORY_LABELS } from "@/lib/services";
import { createClient } from "@/app/admin/actions";
import { field, label } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const db = supabaseAdmin();
  const { data: projects } = await db
    .from("projects")
    .select("*, clients(*)")
    .order("slug");

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h1 className="display text-2xl">Portfolio</h1>
        <span className="font-display text-[10px] tracking-[0.2em] text-ink-faint">
          {projects?.length ?? 0} PROJECTS
        </span>
      </div>

      <div className="mt-6 overflow-x-auto border border-rule bg-card">
        <table className="w-full text-base">
          <thead className="border-b border-rule bg-panel">
            <tr className="text-left">
              {["Client", "Category", "Services", "Status", "Featured", ""].map((h) => (
                <th key={h} className="eyebrow px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {projects?.map((p) => (
              <tr key={p.id} className="hover:bg-panel/50">
                <td className="px-4 py-3">{p.clients?.name ?? p.title}</td>
                <td className="px-4 py-3 text-ink-soft">
                  {CATEGORY_LABELS[p.clients?.category as keyof typeof CATEGORY_LABELS] ?? "—"}
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  {p.services?.length ? p.services.length : "—"}
                </td>
                <td className="px-4 py-3">
                  {p.is_published ? (
                    <span className="text-cobalt">Published</span>
                  ) : (
                    <span className="text-ink-faint">Draft</span>
                  )}
                </td>
                <td className="px-4 py-3">{p.clients?.is_featured ? "★" : ""}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/portfolio/${p.id}`}
                    className="font-display text-[10px] tracking-[0.2em] text-cobalt hover:text-tincture"
                  >
                    EDIT →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add a client -------------------------------------------------------- */}
      <div id="add" className="mt-10">
        <h2 className="font-display text-lg font-bold uppercase tracking-[0.08em]">
          Add a Client
        </h2>
        <form
          action={createClient}
          className="mt-4 grid gap-4 border border-rule bg-card p-6 sm:grid-cols-3"
        >
          <div>
            <label className={label}>Name</label>
            <input name="name" required className={field} />
          </div>
          <div>
            <label className={label}>Slug (blank = auto)</label>
            <input name="slug" placeholder="acme-hardware" className={field} />
          </div>
          <div>
            <label className={label}>Category</label>
            <select name="category" className={field} defaultValue="local-business">
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Industry</label>
            <input name="industry" className={field} />
          </div>
          <div>
            <label className={label}>City</label>
            <input name="city" className={field} />
          </div>
          <div>
            <label className={label}>Website</label>
            <input name="website_url" placeholder="https://" className={field} />
          </div>
          <div className="sm:col-span-3">
            <button className="btn btn-fill">ADD CLIENT</button>
            <span className="ml-4 text-base italic text-ink-faint">
              A matching /work page is created at the same time.
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
