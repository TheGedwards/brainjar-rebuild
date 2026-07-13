import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPost, getPosts } from "@/lib/supabase";
import { Lozenge, PointedRule } from "@/components/ornaments";
import { PostBody } from "@/components/post-body";

export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getPosts().catch(() => []);
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const post = await getPost((await params).slug).catch(() => null);
  if (!post) return {};
  return {
    title: post.seo_title ?? post.title,
    description: post.seo_description ?? post.excerpt ?? undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      publishedTime: post.published_at ?? undefined,
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
    },
  };
}

export default async function PostPage({ params }: Params) {
  const post = await getPost((await params).slug).catch(() => null);
  if (!post) notFound();

  return (
    <article className="px-6 py-12">
      <header className="mx-auto max-w-2xl text-center">
        <Link href="/blog" className="eyebrow hover:text-tincture">
          Notes from the Dispensary
        </Link>
        <h1 className="display mt-4 text-[32px] leading-tight sm:text-[40px]">{post.title}</h1>
        <Lozenge className="my-6" />
        <p className="font-display text-[10px] font-bold tracking-[0.2em] text-ink-faint">
          {post.author.toUpperCase()}
          {post.published_at && (
            <>
              <span className="mx-2 text-rule-strong">·</span>
              <time dateTime={post.published_at}>
                {new Date(post.published_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </>
          )}
        </p>
      </header>

      {post.cover_image_url && (
        <div className="mx-auto mt-10 max-w-3xl border border-rule-strong p-2">
          <div className="relative aspect-16/9">
            <Image
              src={post.cover_image_url}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              priority
              className="object-cover"
            />
          </div>
        </div>
      )}

      <PostBody body={post.body} className="mt-12" />

      <div className="mx-auto mt-12 max-w-2xl">
        <PointedRule />
        <div className="mt-8 text-center">
          <Link
            href="/blog"
            className="font-display text-[11px] tracking-[0.2em] text-ink-faint hover:text-tincture"
          >
            ← ALL NOTES
          </Link>
        </div>
      </div>
    </article>
  );
}
