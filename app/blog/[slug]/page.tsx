import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPost, getPosts } from "@/lib/supabase";
import { Lozenge, PointedRule } from "@/components/ornaments";
import { sanitizeRichText, isHtml } from "@/lib/sanitize";

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

      {/* New posts are sanitized HTML from the TipTap editor; the original
          seed post is markdown-lite (paragraphs + ## headings). Render whichever
          this row is. */}
      {isHtml(post.body) ? (
        <div
          className="prose-apothecary dropcap mx-auto mt-12 max-w-2xl [&_blockquote]:my-6 [&_blockquote]:border-l-2 [&_blockquote]:border-tincture [&_blockquote]:pl-4 [&_blockquote]:italic [&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-lg [&_h3]:font-bold [&_h3]:uppercase [&_h3]:tracking-[0.1em] [&_img]:my-6 [&_img]:w-full [&_img]:border [&_img]:border-rule [&_li]:mb-2 [&_ol]:mb-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:mb-6 [&_ul]:list-disc [&_ul]:pl-6"
          dangerouslySetInnerHTML={{ __html: sanitizeRichText(post.body) }}
        />
      ) : (
        <div className="prose-apothecary dropcap mx-auto mt-12 max-w-2xl">
          {post.body.split("\n\n").map((block, i) =>
            block.startsWith("## ") ? (
              <h2 key={i}>{block.slice(3)}</h2>
            ) : (
              <p key={i}>{block}</p>
            )
          )}
        </div>
      )}

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
