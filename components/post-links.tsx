import Link from "next/link";
import type { Post } from "@/lib/supabase";

function fmtDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

/**
 * A small grid of blog-post link cards. Reused for "Keep Reading" on a post and
 * "From the Dispensary" on a service page — the internal links that tie a topic
 * cluster to its pillar and to sibling posts.
 */
export function PostLinks({ posts }: { posts: Post[] }) {
  if (!posts.length) return null;
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((p) => (
        <Link
          key={p.id}
          href={`/blog/${p.slug}`}
          className="group flex flex-col border border-rule bg-card p-6 transition-all hover:-translate-y-1 hover:border-tincture"
        >
          <div className="font-display text-[10px] font-bold tracking-[0.2em] text-cobalt">
            {fmtDate(p.published_at)}
          </div>
          <h3 className="display mt-2 text-lg group-hover:text-tincture">{p.title}</h3>
          {p.excerpt && (
            <p className="mt-2 line-clamp-3 flex-1 text-base italic leading-7 text-ink-soft">{p.excerpt}</p>
          )}
          <span className="mt-4 font-display text-[10px] font-bold tracking-[0.2em] text-tincture">
            READ ON →
          </span>
        </Link>
      ))}
    </div>
  );
}
