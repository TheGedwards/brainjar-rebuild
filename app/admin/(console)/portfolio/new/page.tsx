import Link from "next/link";
import { createClient } from "@/app/admin/actions";
import { CATEGORY_LABELS } from "@/lib/services";
import { field, label } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default function NewClientPage() {
  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/portfolio"
        className="font-display text-[10px] tracking-[0.2em] text-ink-faint hover:text-tincture"
      >
        ← PORTFOLIO
      </Link>
      <h1 className="mt-2 display text-2xl">New Client</h1>
      <p className="mt-1 text-base italic text-ink-soft">
        Creates the client and a matching <code>/work/[slug]</code> page, then drops you into the
        editor to fill in the rest.
      </p>

      <form action={createClient} className="mt-6 grid gap-4 border border-rule bg-card p-6 sm:grid-cols-2">
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
        <div className="sm:col-span-2">
          <button className="btn btn-fill">CREATE CLIENT</button>
        </div>
      </form>
    </div>
  );
}
