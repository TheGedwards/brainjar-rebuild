import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { savePost, deletePost } from "@/app/admin/actions";
import { field, label } from "@/components/admin/ui";
import { ImageUpload } from "@/components/admin/image-upload";
import { RichEditor } from "@/components/admin/rich-editor";

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

      <form action={savePost} className="mt-6 space-y-5 border border-rule bg-card p-6">
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
          <label className={label}>Excerpt (the one-line summary on the blog list)</label>
          <input name="excerpt" defaultValue={post?.excerpt ?? ""} className={field} />
        </div>

        <div>
          <label className={label}>Cover image</label>
          <ImageUpload name="cover_image_url" initialUrl={post?.cover_image_url ?? ""} folder="blog" />
        </div>

        <div>
          <label className={label}>Body — paste from Word, or format with the toolbar</label>
          <RichEditor name="body" initialHtml={post?.body ?? ""} />
        </div>

        {/* SEO ----------------------------------------------------------------- */}
        <div className="border-t border-rule pt-5">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em]">Search Engine</h2>
          <p className="mt-1 text-base italic text-ink-soft">
            Leave blank to fall back to the title and excerpt.
          </p>
          <div className="mt-4 space-y-4">
            <div>
              <label className={label}>SEO title (~60 characters)</label>
              <input name="seo_title" defaultValue={post?.seo_title ?? ""} className={field} />
            </div>
            <div>
              <label className={label}>SEO description (~155 characters)</label>
              <textarea
                name="seo_description"
                rows={2}
                defaultValue={post?.seo_description ?? ""}
                className={field}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 border-t border-rule pt-5">
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
