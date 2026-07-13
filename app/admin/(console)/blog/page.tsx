import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function BlogListPage() {
  const db = supabaseAdmin();
  const { data: posts } = await db
    .from("posts")
    .select("id, title, is_published, updated_at")
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
              <li key={p.id}>
                <Link
                  href={`/admin/blog/${p.id}`}
                  className="flex items-center justify-between px-4 py-3 text-base transition-colors hover:bg-panel"
                >
                  <span>
                    {p.title}
                    {!p.is_published && (
                      <span className="ml-2 font-display text-[9px] tracking-widest text-ink-faint">
                        DRAFT
                      </span>
                    )}
                  </span>
                  <span className="font-display text-[10px] tracking-widest text-ink-faint">
                    {new Date(p.updated_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </Link>
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
