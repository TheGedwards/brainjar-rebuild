import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser, ADMIN_ROLES } from "@/lib/auth";
import { getPageDef, PAGE_SEO } from "@/lib/pages";
import { getPageContent } from "@/lib/supabase";
import { savePage } from "@/app/admin/actions";
import { field, label } from "@/components/admin/ui";
import { SeoFields } from "@/components/admin/seo-fields";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ key: string }> };

export default async function PageEditor({ params }: Params) {
  const { profile } = await requireUser();
  if (!ADMIN_ROLES.includes(profile.role)) redirect("/admin");

  const { key } = await params;
  const def = getPageDef(key);
  if (!def) notFound();

  const current = await getPageContent(def.path);
  const seoDefaults = PAGE_SEO[def.key] ?? { title: "", description: "" };
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.brainjarmedia.com")
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  const displayUrl = def.path === "/" ? base : `${base}${def.path}`;

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/pages"
        className="font-display text-[10px] tracking-[0.2em] text-ink-faint hover:text-tincture"
      >
        ← PAGES
      </Link>
      <div className="mt-2 flex items-baseline justify-between">
        <h1 className="display text-2xl">{def.name}</h1>
        <a
          href={def.path}
          target="_blank"
          className="font-display text-[10px] tracking-[0.2em] text-cobalt hover:text-tincture"
        >
          VIEW {def.path} ↗
        </a>
      </div>

      <form action={savePage} className="mt-6 space-y-6">
        <input type="hidden" name="path" value={def.path} />

        {/* Copy slots -------------------------------------------------------- */}
        <div className="space-y-4 border border-rule bg-card p-6">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em]">Copy</h2>
          {def.slots.map((s) => (
            <div key={s.key}>
              <label className={label}>{s.label}</label>
              {s.type === "text" ? (
                <input
                  name={`slot_${s.key}`}
                  defaultValue={current.content[s.key] ?? ""}
                  className={field}
                />
              ) : (
                <textarea
                  name={`slot_${s.key}`}
                  rows={s.type === "heading" ? 2 : 3}
                  defaultValue={current.content[s.key] ?? ""}
                  className={field}
                />
              )}
              {s.hint && <p className="mt-1 text-base italic text-ink-faint">{s.hint}</p>}
            </div>
          ))}
        </div>

        {/* SEO --------------------------------------------------------------- */}
        <div className="border border-rule bg-card p-6">
          <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-[0.2em]">
            Search Engine
          </h2>
          <SeoFields
            initialTitle={current.seo_title ?? ""}
            initialDescription={current.seo_description ?? ""}
            fallbackTitle={seoDefaults.title}
            fallbackDescription={seoDefaults.description}
            displayUrl={displayUrl}
          />
        </div>

        <button className="btn btn-fill">SAVE PAGE</button>
      </form>
    </div>
  );
}
