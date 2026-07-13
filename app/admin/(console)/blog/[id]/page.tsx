import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { savePost, deletePost } from "@/app/admin/actions";
import { field, label } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export default async function PostEditor({ params }: Params) {
  const { id } = await params;
  const isNew = id === "new";

  const post = isNew
    ? null
    : (await supabaseAdmin().from("posts").select("*").eq("id", id).maybeSingle()).data;

  if (!isNew && !post) notFound();

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/blog"
        className="font-display text-[10px] tracking-[0.2em] text-ink-faint hover:text-tincture"
      >
        ← BLOG
      </Link>
      <h1 className="mt-2 display text-2xl">{isNew ? "New Post" : "Edit Post"}</h1>

      <form action={savePost} className="mt-6 space-y-4 border border-rule bg-card p-6">
        {post && <input type="hidden" name="id" value={post.id} />}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Title</label>
            <input name="title" required defaultValue={post?.title ?? ""} className={field} />
          </div>
          <div>
            <label className={label}>Slug (blank = auto)</label>
            <input name="slug" defaultValue={post?.slug ?? ""} className={field} />
          </div>
        </div>
        <div>
          <label className={label}>Excerpt</label>
          <input name="excerpt" defaultValue={post?.excerpt ?? ""} className={field} />
        </div>
        <div>
          <label className={label}>Cover image URL</label>
          <input name="cover_image_url" defaultValue={post?.cover_image_url ?? ""} className={field} />
        </div>
        <div>
          <label className={label}>Body — blank line between paragraphs, ## for a heading</label>
          <textarea name="body" rows={16} defaultValue={post?.body ?? ""} className={field} />
        </div>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-base">
            <input
              type="checkbox"
              name="is_published"
              defaultChecked={post?.is_published ?? false}
              className="accent-[var(--color-tincture)]"
            />
            Published
          </label>
          <button className="btn btn-fill">SAVE POST</button>
        </div>
      </form>

      {post && (
        <form action={deletePost} className="mt-4">
          <input type="hidden" name="id" value={post.id} />
          <button className="font-display text-[10px] tracking-[0.2em] text-ink-faint hover:text-tincture">
            DELETE THIS POST
          </button>
        </form>
      )}
    </div>
  );
}
