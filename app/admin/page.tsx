import { supabaseAdmin } from "@/lib/supabase";
import { SERVICE_CHIPS, CATEGORY_LABELS } from "@/lib/services";
import type { ServiceKey } from "@/lib/supabase";
import {
  createClient,
  updateProject,
  addStat,
  deleteStat,
  setFeatured,
  savePost,
  deletePost,
} from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

const SERVICE_KEYS = Object.keys(SERVICE_CHIPS) as ServiceKey[];

const input =
  "w-full border border-rule-strong bg-card px-3 py-2 font-body text-base focus:border-tincture focus:outline-none";
const lbl = "eyebrow mb-1.5 block";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string; post?: string }>;
}) {
  const sp = await searchParams;
  const db = supabaseAdmin();

  const [{ data: projects }, { data: posts }, { data: leads }] = await Promise.all([
    db
      .from("projects")
      .select("*, clients(*), project_stats(*)")
      .order("slug"),
    db.from("posts").select("*").order("updated_at", { ascending: false }),
    db.from("leads").select("*").order("created_at", { ascending: false }).limit(25),
  ]);

  const editing = projects?.find((p) => p.id === sp.project);
  const editingPost = posts?.find((p) => p.id === sp.post);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="display text-2xl">The Back Room</h1>
      <p className="mt-2 text-lg italic text-ink-soft">
        Everything on the public site comes from here. Changes go live in about five minutes.
      </p>

      {/* ------------------------------------------------------------------ */}
      <Section title="Portfolio" note={`${projects?.length ?? 0} projects`}>
        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          <ul className="max-h-[560px] space-y-1 overflow-y-auto border border-rule bg-card p-3">
            {projects?.map((p) => (
              <li key={p.id}>
                <a
                  href={`/admin?project=${p.id}`}
                  className={`flex items-center justify-between px-3 py-2 text-base transition-colors ${
                    editing?.id === p.id ? "bg-tincture text-paper" : "hover:bg-panel"
                  }`}
                >
                  <span>{p.clients?.name ?? p.title}</span>
                  <span className="font-display text-[9px] tracking-widest opacity-60">
                    {p.services?.length ? p.services.length : "—"}
                  </span>
                </a>
              </li>
            ))}
          </ul>

          {editing ? (
            <div className="space-y-8">
              <form action={updateProject} className="space-y-4 border border-rule bg-card p-6">
                <input type="hidden" name="id" value={editing.id} />
                <input type="hidden" name="slug" value={editing.slug} />

                <div className="flex items-baseline justify-between">
                  <h3 className="display text-base">{editing.clients?.name}</h3>
                  <a
                    href={`/work/${editing.slug}`}
                    target="_blank"
                    className="font-display text-[10px] tracking-widest text-cobalt hover:text-tincture"
                  >
                    VIEW /work/{editing.slug} ↗
                  </a>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={lbl}>Title</label>
                    <input name="title" defaultValue={editing.title} className={input} />
                  </div>
                  <div>
                    <label className={lbl}>Year</label>
                    <input name="year" type="number" defaultValue={editing.year ?? ""} className={input} />
                  </div>
                </div>

                <div>
                  <label className={lbl}>Tagline (one italic line on the card)</label>
                  <input name="tagline" defaultValue={editing.tagline ?? ""} className={input} />
                </div>

                <div>
                  <label className={lbl}>Services</label>
                  <div className="flex flex-wrap gap-4">
                    {SERVICE_KEYS.map((k) => (
                      <label key={k} className="flex items-center gap-2 text-base">
                        <input
                          type="checkbox"
                          name={`service_${k}`}
                          defaultChecked={editing.services?.includes(k)}
                          className="accent-[var(--color-tincture)]"
                        />
                        {SERVICE_CHIPS[k]}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={lbl}>Hero image URL (Supabase Storage → media bucket)</label>
                  <input name="hero_image_url" defaultValue={editing.hero_image_url ?? ""} className={input} />
                </div>

                {(["summary", "challenge", "approach", "outcome"] as const).map((f) => (
                  <div key={f}>
                    <label className={lbl}>
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
                      defaultValue={editing[f] ?? ""}
                      className={input}
                    />
                  </div>
                ))}

                <label className="flex items-center gap-2 text-base">
                  <input
                    type="checkbox"
                    name="is_published"
                    defaultChecked={editing.is_published}
                    className="accent-[var(--color-tincture)]"
                  />
                  Published
                </label>

                <button className="btn btn-fill">SAVE PROJECT</button>
              </form>

              {/* Stats */}
              <div className="border border-rule bg-card p-6">
                <h4 className="display text-sm tracking-[0.2em]">Stat Chips</h4>
                <p className="mt-1 text-base italic text-ink-soft">
                  Leave empty and the chip row simply doesn&rsquo;t render. Add one and mark it
                  headline to show it on the portfolio card.
                </p>

                {(editing.project_stats?.length ?? 0) > 0 && (
                  <ul className="mt-4 space-y-2">
                    {editing.project_stats.map((s: { id: string; value: string; label: string; is_headline: boolean }) => (
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
                  <input type="hidden" name="project_id" value={editing.id} />
                  <div className="w-28">
                    <label className={lbl}>Value</label>
                    <input name="value" placeholder="+212%" className={input} />
                  </div>
                  <div className="min-w-48 flex-1">
                    <label className={lbl}>Label</label>
                    <input name="label" placeholder="Organic traffic" className={input} />
                  </div>
                  <label className="flex items-center gap-2 pb-2.5 text-base">
                    <input type="checkbox" name="is_headline" className="accent-[var(--color-tincture)]" />
                    Headline
                  </label>
                  <button className="btn btn-outline mb-0.5 !py-2.5">ADD</button>
                </form>
              </div>

              {!editing.clients?.is_featured && (
                <form action={setFeatured}>
                  <input type="hidden" name="client_id" value={editing.client_id} />
                  <button className="font-display text-[11px] tracking-[0.2em] text-cobalt hover:text-tincture">
                    ★ MAKE THIS THE HOME PAGE CASE STUDY
                  </button>
                </form>
              )}
            </div>
          ) : (
            <p className="text-lg italic text-ink-faint">Pick a project to edit.</p>
          )}
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section title="Add a Client">
        <form action={createClient} className="grid gap-4 border border-rule bg-card p-6 sm:grid-cols-3">
          <div>
            <label className={lbl}>Name</label>
            <input name="name" required className={input} />
          </div>
          <div>
            <label className={lbl}>Slug (blank = auto)</label>
            <input name="slug" placeholder="acme-hardware" className={input} />
          </div>
          <div>
            <label className={lbl}>Category</label>
            <select name="category" className={input} defaultValue="local-business">
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={lbl}>Industry</label>
            <input name="industry" className={input} />
          </div>
          <div>
            <label className={lbl}>City</label>
            <input name="city" className={input} />
          </div>
          <div>
            <label className={lbl}>Website</label>
            <input name="website_url" placeholder="https://" className={input} />
          </div>
          <div className="sm:col-span-3">
            <button className="btn btn-fill">ADD CLIENT</button>
            <span className="ml-4 text-base italic text-ink-faint">
              A matching /work page is created at the same time.
            </span>
          </div>
        </form>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section title="Blog" note={`${posts?.length ?? 0} posts`}>
        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          <div>
            <a href="/admin" className="btn btn-outline mb-3 block text-center !py-2.5">
              + NEW POST
            </a>
            <ul className="space-y-1 border border-rule bg-card p-3">
              {posts?.map((p) => (
                <li key={p.id}>
                  <a
                    href={`/admin?post=${p.id}`}
                    className={`block px-3 py-2 text-base ${
                      editingPost?.id === p.id ? "bg-tincture text-paper" : "hover:bg-panel"
                    }`}
                  >
                    {p.title}
                    {!p.is_published && (
                      <span className="ml-2 font-display text-[9px] tracking-widest opacity-60">
                        DRAFT
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <form action={savePost} className="space-y-4 border border-rule bg-card p-6">
            {editingPost && <input type="hidden" name="id" value={editingPost.id} />}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={lbl}>Title</label>
                <input name="title" required defaultValue={editingPost?.title ?? ""} className={input} />
              </div>
              <div>
                <label className={lbl}>Slug (blank = auto)</label>
                <input name="slug" defaultValue={editingPost?.slug ?? ""} className={input} />
              </div>
            </div>
            <div>
              <label className={lbl}>Excerpt</label>
              <input name="excerpt" defaultValue={editingPost?.excerpt ?? ""} className={input} />
            </div>
            <div>
              <label className={lbl}>Cover image URL</label>
              <input name="cover_image_url" defaultValue={editingPost?.cover_image_url ?? ""} className={input} />
            </div>
            <div>
              <label className={lbl}>Body — blank line between paragraphs, ## for a heading</label>
              <textarea name="body" rows={14} defaultValue={editingPost?.body ?? ""} className={input} />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-base">
                <input
                  type="checkbox"
                  name="is_published"
                  defaultChecked={editingPost?.is_published ?? false}
                  className="accent-[var(--color-tincture)]"
                />
                Published
              </label>
              <button className="btn btn-fill">SAVE POST</button>
            </div>
          </form>
        </div>

        {editingPost && (
          <form action={deletePost} className="mt-4">
            <input type="hidden" name="id" value={editingPost.id} />
            <button className="font-display text-[10px] tracking-[0.2em] text-ink-faint hover:text-tincture">
              DELETE THIS POST
            </button>
          </form>
        )}
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section title="Leads" note="Most recent 25">
        {leads?.length ? (
          <div className="overflow-x-auto border border-rule bg-card">
            <table className="w-full text-base">
              <thead className="border-b border-rule bg-panel">
                <tr className="text-left">
                  {["When", "Name", "Email", "Symptom", "Emailed"].map((h) => (
                    <th key={h} className="eyebrow px-4 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {leads.map((l) => (
                  <tr key={l.id}>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-faint">
                      {new Date(l.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">{l.name}</td>
                    <td className="px-4 py-3">
                      <a href={`mailto:${l.email}`} className="text-tincture hover:underline">
                        {l.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 italic text-ink-soft">{l.symptom ?? "—"}</td>
                    <td className="px-4 py-3">{l.emailed_at ? "✓" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-lg italic text-ink-faint">No leads yet.</p>
        )}
      </Section>
    </div>
  );
}

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-14">
      <div className="mb-5 flex items-baseline gap-4 border-b-[3px] border-double border-rule-strong pb-2">
        <h2 className="display text-lg">{title}</h2>
        {note && <span className="font-display text-[10px] tracking-widest text-ink-faint">{note}</span>}
      </div>
      {children}
    </section>
  );
}
