import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import { BlogList, type BlogRow, type Status } from "@/components/admin/blog-list";

export const dynamic = "force-dynamic";

export default async function BlogListPage() {
  const { data: posts } = await supabaseAdmin()
    .from("posts")
    .select("*")
    .order("published_at", { ascending: false, nullsFirst: false });

  const now = Date.now();
  const rows: BlogRow[] = (posts ?? []).map((p: any) => {
    const pubTs = p.published_at ? new Date(p.published_at).getTime() : null;
    const status: Status = !p.is_published
      ? "draft"
      : pubTs !== null && pubTs > now
        ? "scheduled"
        : "published";
    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      category: p.category ?? null,
      is_published: !!p.is_published,
      published_at: p.published_at ?? null,
      status,
    };
  });

  return (
    <div>
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-rule bg-paper/95 py-4 backdrop-blur">
        <h1 className="display text-2xl">Blog</h1>
        <Link href="/admin/blog/new" className="btn btn-fill !py-2.5">
          + NEW POST
        </Link>
      </div>

      <div className="mt-6">
        <BlogList posts={rows} />
      </div>
    </div>
  );
}
