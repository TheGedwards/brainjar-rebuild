import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { PostBody } from "@/components/post-body";
import { Lozenge } from "@/components/ornaments";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export default async function PostPreview({ params }: Params) {
  const { id } = await params;
  const { data: post } = await supabaseAdmin()
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!post) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={`/admin/blog/${id}`}
          className="font-display text-[10px] tracking-[0.2em] text-ink-faint hover:text-tincture"
        >
          ← BACK TO EDITOR
        </Link>
        <span
          className={`font-display text-[10px] font-bold tracking-[0.2em] ${
            post.is_published ? "text-cobalt" : "text-tincture"
          }`}
        >
          {post.is_published ? "PUBLISHED — LIVE PREVIEW" : "DRAFT — NOT PUBLIC YET"}
        </span>
      </div>

      <article className="border border-rule bg-card px-6 py-12">
        <header className="mx-auto max-w-2xl text-center">
          <div className="eyebrow">Notes from the Dispensary</div>
          <h1 className="display mt-4 text-[32px] leading-tight sm:text-[40px]">{post.title}</h1>
          <Lozenge className="my-6" />
        </header>

        {post.cover_image_url && (
          <div className="mx-auto mt-6 max-w-3xl border border-rule-strong p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.cover_image_url} alt="" className="w-full" />
          </div>
        )}

        <PostBody body={post.body} className="mt-10" />
      </article>
    </div>
  );
}
