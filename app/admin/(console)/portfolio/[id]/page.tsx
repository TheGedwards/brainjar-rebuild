import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { SERVICE_CHIPS } from "@/lib/services";
import type { ServiceKey } from "@/lib/supabase";
import { updateProject, addStat, deleteStat, setFeatured } from "@/app/admin/actions";
import { field, label } from "@/components/admin/ui";
import { GalleryEditor } from "@/components/admin/gallery-editor";
import { DangerZone } from "./danger-zone";

export const dynamic = "force-dynamic";

const SERVICE_KEYS = Object.keys(SERVICE_CHIPS) as ServiceKey[];

type Params = { params: Promise<{ id: string }> };

export default async function ProjectEditor({ params }: Params) {
  const { id } = await params;
  const db = supabaseAdmin();
  const { data: project } = await db
    .from("projects")
    .select("*, clients(*), project_stats(*)")
    .eq("id", id)
    .maybeSingle();

  if (!project) notFound();
  const stats = (project.project_stats ?? []) as {
    id: string;
    value: string;
    label: string;
    is_headline: boolean;
  }[];

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/portfolio"
        className="font-display text-[10px] tracking-[0.2em] text-ink-faint hover:text-tincture"
      >
        ← PORTFOLIO
      </Link>

      <div className="mt-2 flex items-baseline justify-between">
        <h1 className="display text-2xl">{project.clients?.name ?? project.title}</h1>
        <a
          href={`/work/${project.slug}`}
          target="_blank"
          className="font-display text-[10px] tracking-[0.2em] text-cobalt hover:text-tincture"
        >
          VIEW /work/{project.slug} ↗
        </a>
      </div>

      {/* Project fields ------------------------------------------------------ */}
      <form action={updateProject} className="mt-6 space-y-4 border border-rule bg-card p-6">
        <input type="hidden" name="id" value={project.id} />
        <input type="hidden" name="slug" value={project.slug} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Title</label>
            <input name="title" defaultValue={project.title} className={field} />
          </div>
          <div>
            <label className={label}>Year</label>
            <input name="year" type="number" defaultValue={project.year ?? ""} className={field} />
          </div>
        </div>

        <div>
          <label className={label}>Tagline (one italic line on the card)</label>
          <input name="tagline" defaultValue={project.tagline ?? ""} className={field} />
        </div>

        <div>
          <label className={label}>Services</label>
          <div className="flex flex-wrap gap-4">
            {SERVICE_KEYS.map((k) => (
              <label key={k} className="flex items-center gap-2 text-base">
                <input
                  type="checkbox"
                  name={`service_${k}`}
                  defaultChecked={project.services?.includes(k)}
                  className="accent-[var(--color-tincture)]"
                />
                {SERVICE_CHIPS[k]}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className={label}>Hero image URL (Supabase Storage → media bucket)</label>
          <input name="hero_image_url" defaultValue={project.hero_image_url ?? ""} className={field} />
        </div>

        {(["summary", "challenge", "approach", "outcome"] as const).map((f) => (
          <div key={f}>
            <label className={label}>
              {f === "challenge"
                ? "The Symptom"
                : f === "approach"
                  ? "The Formula"
                  : f === "outcome"
                    ? "The Result"
                    : "Summary"}
            </label>
            <textarea
              name={f}
              rows={f === "summary" ? 3 : 4}
              defaultValue={project[f] ?? ""}
              className={field}
            />
          </div>
        ))}

        <label className="flex items-center gap-2 text-base">
          <input
            type="checkbox"
            name="is_published"
            defaultChecked={project.is_published}
            className="accent-[var(--color-tincture)]"
          />
          Published
        </label>

        <button className="btn btn-fill">SAVE PROJECT</button>
      </form>

      {/* Stats --------------------------------------------------------------- */}
      <div className="mt-6 border border-rule bg-card p-6">
        <h3 className="font-display text-sm font-bold uppercase tracking-[0.2em]">Stat Chips</h3>
        <p className="mt-1 text-base italic text-ink-soft">
          Leave empty and the chip row simply doesn&rsquo;t render. Mark one headline to show it on
          the portfolio card.
        </p>

        {stats.length > 0 && (
          <ul className="mt-4 space-y-2">
            {stats.map((s) => (
              <li key={s.id} className="flex items-center gap-3 border border-rule bg-panel px-3 py-2">
                <span className="display text-base text-tincture">{s.value}</span>
                <span className="font-display text-[10px] tracking-widest text-ink-faint">
                  {s.label}
                </span>
                {s.is_headline && (
                  <span className="font-display text-[9px] tracking-widest text-cobalt">
                    ★ HEADLINE
                  </span>
                )}
                <form action={deleteStat} className="ml-auto">
                  <input type="hidden" name="id" value={s.id} />
                  <button className="font-display text-[10px] tracking-widest text-ink-faint hover:text-tincture">
                    REMOVE
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <form action={addStat} className="mt-5 flex flex-wrap items-end gap-3">
          <input type="hidden" name="project_id" value={project.id} />
          <div className="w-28">
            <label className={label}>Value</label>
            <input name="value" placeholder="+212%" className={field} />
          </div>
          <div className="min-w-48 flex-1">
            <label className={label}>Label</label>
            <input name="label" placeholder="Organic traffic" className={field} />
          </div>
          <label className="flex items-center gap-2 pb-2.5 text-base">
            <input type="checkbox" name="is_headline" className="accent-[var(--color-tincture)]" />
            Headline
          </label>
          <button className="btn btn-outline mb-0.5 !py-2.5">ADD</button>
        </form>
      </div>

      {/* Gallery / slideshow ------------------------------------------------- */}
      <div className="mt-6">
        <GalleryEditor projectId={project.id} initial={project.gallery ?? []} />
      </div>

      {/* Featured + Danger --------------------------------------------------- */}
      {!project.clients?.is_featured && (
        <form action={setFeatured} className="mt-6">
          <input type="hidden" name="client_id" value={project.client_id} />
          <button className="font-display text-[11px] tracking-[0.2em] text-cobalt hover:text-tincture">
            ★ MAKE THIS THE HOME PAGE CASE STUDY
          </button>
        </form>
      )}

      <div className="mt-6">
        <DangerZone
          clientId={project.client_id}
          name={project.clients?.name ?? project.title}
          slug={project.slug}
          isPublished={project.is_published}
        />
      </div>
    </div>
  );
}
