import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { SERVICE_CHIPS } from "@/lib/services";
import type { ServiceKey } from "@/lib/supabase";
import { updateProject, addStat, updateStat, deleteStat, setFeatured } from "@/app/admin/actions";
import { field, label } from "@/components/admin/ui";
import { GalleryEditor } from "@/components/admin/gallery-editor";
import { ImageUpload } from "@/components/admin/image-upload";
import { DangerZone } from "./danger-zone";

export const dynamic = "force-dynamic";

const SERVICE_KEYS = Object.keys(SERVICE_CHIPS) as ServiceKey[];

type Params = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
};

export default async function ProjectEditor({ params, searchParams }: Params) {
  const { id } = await params;
  const { saved } = await searchParams;
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

      <h1 className="mt-2 display text-2xl">{project.clients?.name ?? project.title}</h1>

      {/* Sticky action bar — save + view live, reachable from the top. The Save
          button lives outside the form and targets it via form="project-form". */}
      <div className="sticky top-0 z-10 mt-4 flex items-center justify-between gap-3 border-y border-rule bg-paper/95 py-3 backdrop-blur">
        <span className="font-display text-[10px] tracking-[0.2em] text-ink-faint">
          EDITING /work/{project.slug}
        </span>
        <div className="flex items-center gap-3">
          <a href={`/work/${project.slug}`} target="_blank" className="btn btn-outline !py-2.5">
            VIEW PAGE ↗
          </a>
          <button form="project-form" className="btn btn-fill !py-2.5">
            SAVE
          </button>
        </div>
      </div>

      {saved && (
        <div className="mt-4 flex items-center justify-between gap-3 border border-cobalt/40 bg-cobalt-lt/20 px-4 py-3">
          <span className="text-base text-ink">Saved.</span>
          <a
            href={`/work/${project.slug}`}
            target="_blank"
            className="font-display text-[11px] font-bold tracking-[0.2em] text-cobalt hover:text-tincture"
          >
            VIEW THE LIVE PAGE ↗
          </a>
        </div>
      )}

      {/* Project fields ------------------------------------------------------ */}
      <form
        id="project-form"
        action={updateProject}
        className="mt-6 space-y-4 border border-rule bg-card p-6"
      >
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
          <label className={label}>
            Specimen epithet (optional mock-Latin line under the name, e.g. “Officina reparandi”)
          </label>
          <input name="binomial" defaultValue={project.binomial ?? ""} className={field} />
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
          <label className={label}>Hero image (the Fig. 1 plate)</label>
          <ImageUpload name="hero_image_url" initialUrl={project.hero_image_url ?? ""} folder="portfolio" />
          <p className="mt-2 text-base italic text-ink-soft">
            Best at <strong>1600×1000</strong> (a 16:10 landscape), min 1280×800, under 8MB. No
            image? The plate shows the client&rsquo;s initials instead.
          </p>
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
        <h3 className="font-display text-sm font-bold uppercase tracking-[0.2em]">Measurements</h3>
        <p className="mt-1 text-base italic text-ink-soft">
          The first two appear as the side-by-side metrics inside the specimen plate on the case
          study. Leave empty and the block simply doesn&rsquo;t render. Mark one headline to show it
          on the portfolio card too.
        </p>

        {stats.length > 0 && (
          <ul className="mt-4 space-y-2">
            {stats.map((s) => (
              <li key={s.id} className="border border-rule bg-panel px-3 py-3">
                {/* Edit in place */}
                <form action={updateStat} className="flex flex-wrap items-end gap-3">
                  <input type="hidden" name="id" value={s.id} />
                  <div className="w-28">
                    <label className={label}>Value</label>
                    <input name="value" defaultValue={s.value} className={field} />
                  </div>
                  <div className="min-w-48 flex-1">
                    <label className={label}>Label</label>
                    <input name="label" defaultValue={s.label} className={field} />
                  </div>
                  <label className="flex items-center gap-2 pb-2.5 text-base">
                    <input
                      type="checkbox"
                      name="is_headline"
                      defaultChecked={s.is_headline}
                      className="accent-[var(--color-tincture)]"
                    />
                    Headline
                  </label>
                  <button className="btn btn-outline mb-0.5 !py-2.5">UPDATE</button>
                </form>
                {/* Remove (separate form so it doesn't submit the edits) */}
                <form action={deleteStat} className="mt-2">
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
