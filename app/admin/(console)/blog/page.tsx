import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import { PostRowActions } from "@/components/admin/post-row-actions";

export const dynamic = "force-dynamic";

export default async function BlogListPage() {
  const db = supabaseAdmin();
  const { data: posts } = await db
    .from("posts")
    .select("id, title, slug, is_published, updated_at")
    .order("updated_at", { ascending: false });

  return (
    <div className="max-w-3xl">
      <div className="flex items-baseline justify-between">
        <h1 className="display text-2xl">Blog</h1>
        <Link href="/admin/blog/new" className="btn btn-fill">
          + NEW POST
        </Link>
      </div>

      <div className="mt-6 border border-rule bg-card">
        {posts?.length ? (
          <ul className="divide-y divide-rule">
            {posts.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/blog/${p.id}`}
                      className="truncate text-base hover:text-tincture"
                    >
                      {p.title}
                    </Link>
                    <span
                      className={`flex-shrink-0 border px-1.5 py-0.5 font-display text-[9px] font-bold tracking-[0.15em] ${
                        p.is_published
                          ? "border-cobalt-lt text-cobalt"
                          : "border-rule-strong text-ink-faint"
                      }`}
                    >
                      {p.is_published ? "PUBLISHED" : "DRAFT"}
                    </span>
                  </div>
                  <div className="mt-0.5 font-display text-[10px] tracking-widest text-ink-faint">
                    UPDATED{" "}
                    {new Date(p.updated_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>
                <PostRowActions id={p.id} slug={p.slug} isPublished={p.is_published} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 py-6 text-base italic text-ink-faint">
            No posts yet. Write your first one.
          </p>
        )}
      </div>
    </div>
  );
}
