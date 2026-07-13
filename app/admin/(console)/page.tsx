import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import { requireUser, OWNER_ROLES } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { profile } = await requireUser();
  const db = supabaseAdmin();
  const isOwner = OWNER_ROLES.includes(profile.role);
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

  const [published, drafts, posts, leadsWeek, recentLeads, users, featured] = await Promise.all([
    db.from("projects").select("id", { count: "exact", head: true }).eq("is_published", true),
    db.from("projects").select("id", { count: "exact", head: true }).eq("is_published", false),
    db.from("posts").select("id", { count: "exact", head: true }),
    db.from("leads").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
    db.from("leads").select("*").order("created_at", { ascending: false }).limit(6),
    isOwner
      ? db.from("profiles").select("id", { count: "exact", head: true })
      : Promise.resolve({ count: null }),
    db.from("clients").select("name").eq("is_featured", true).maybeSingle(),
  ]);

  const tiles = [
    { n: published.count ?? 0, label: "Published projects", accent: true },
    { n: drafts.count ?? 0, label: "Draft projects", accent: false },
    { n: leadsWeek.count ?? 0, label: "New leads · 7 days", accent: true },
    { n: posts.count ?? 0, label: "Blog posts", accent: false },
  ];

  return (
    <div>
      <h1 className="display text-2xl">Dashboard</h1>
      <p className="mt-1 text-base italic text-ink-soft">
        Welcome back, {profile.full_name ?? profile.email}.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="border border-rule bg-card px-4 py-4">
            <div
              className={`display text-3xl ${t.accent ? "text-tincture" : "text-ink"}`}
            >
              {t.n}
            </div>
            <div className="mt-1 font-display text-[10px] font-bold uppercase tracking-[0.15em] text-ink-faint">
              {t.label}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="border border-rule bg-card">
          <div className="flex items-center justify-between border-b border-rule px-4 py-3">
            <h2 className="font-display text-xs font-bold uppercase tracking-[0.15em]">
              Recent Leads
            </h2>
            <span className="font-display text-[10px] tracking-[0.15em] text-ink-faint">
              LATEST 6
            </span>
          </div>
          {recentLeads.data?.length ? (
            <table className="w-full text-base">
              <tbody className="divide-y divide-rule">
                {recentLeads.data.map((l) => (
                  <tr key={l.id}>
                    <td className="px-4 py-2.5">{l.name}</td>
                    <td className="px-4 py-2.5 italic text-ink-soft">{l.symptom ?? "—"}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right text-ink-faint">
                      {new Date(l.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="px-4 py-6 text-base italic text-ink-faint">No leads yet.</p>
          )}
        </section>

        <section className="space-y-4">
          <div className="border border-rule bg-card px-4 py-4">
            <h2 className="mb-3 font-display text-xs font-bold uppercase tracking-[0.15em]">
              Quick Actions
            </h2>
            <Link href="/admin/blog/new" className="btn btn-fill mb-2 block text-center">
              + NEW BLOG POST
            </Link>
            <Link href="/admin/portfolio#add" className="btn btn-outline block text-center">
              + ADD CLIENT
            </Link>
          </div>
          <div className="border border-rule bg-card px-4 py-4">
            <h2 className="mb-2 font-display text-xs font-bold uppercase tracking-[0.15em]">
              At a Glance
            </h2>
            <Glance label="Draft projects" value={String(drafts.count ?? 0)} />
            {isOwner && <Glance label="Team members" value={String(users.count ?? 0)} />}
            <Glance
              label="Featured case study"
              value={featured.data?.name ?? "None set"}
              accent
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function Glance({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between py-1 text-base">
      <span className="text-ink-soft">{label}</span>
      <span className={accent ? "text-tincture" : "text-ink"}>{value}</span>
    </div>
  );
}
