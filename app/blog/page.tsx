import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPosts, getPageContent } from "@/lib/supabase";
import { Frame, Lozenge } from "@/components/ornaments";
import { renderHeading } from "@/lib/render-copy";
import { PAGE_SEO } from "@/lib/pages";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const c = await getPageContent("/blog");
  return {
    title: c.seo_title ?? PAGE_SEO.blog.title,
    description: c.seo_description ?? PAGE_SEO.blog.description,
    alternates: { canonical: "/blog" },
  };
}

export default async function BlogPage() {
  const [posts, c] = await Promise.all([
    getPosts().catch(() => []),
    getPageContent("/blog"),
  ]);

  return (
    <>
      <section className="px-6 py-12 text-center sm:py-16">
        <Frame>
          <div className="eyebrow">{c.content.hero_eyebrow}</div>
          <h1 className="display mt-4 text-[32px] leading-tight sm:text-[48px]">
            {renderHeading(c.content.hero_heading)}
          </h1>
          <Lozenge className="my-6" />
          <p className="mx-auto max-w-xl text-lg italic leading-8 text-ink-soft">
            {c.content.hero_subhead}
          </p>
        </Frame>
      </section>

      <section className="px-6 pb-16">
        <div className="mx-auto max-w-3xl divide-y divide-rule border-y border-rule">
          {posts.map((post) => (
            <article key={post.id} className="group py-8">
              <Link href={`/blog/${post.slug}`} className="grid gap-6 sm:grid-cols-[1fr_180px]">
                <div>
                  <time
                    dateTime={post.published_at ?? undefined}
                    className="font-display text-[10px] font-bold tracking-[0.2em] text-cobalt"
                  >
                    {formatDate(post.published_at)}
                  </time>
                  <h2 className="display mt-2 text-lg text-ink group-hover:text-tincture sm:text-xl">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="mt-2 text-lg italic leading-8 text-ink-soft">
                      {post.excerpt}
                    </p>
                  )}
                  <span className="mt-4 inline-block font-display text-[10px] font-bold tracking-[0.2em] text-tincture">
                    READ ON →
                  </span>
                </div>

                {post.cover_image_url && (
                  <div className="relative aspect-4/3 border border-rule">
                    <Image
                      src={post.cover_image_url}
                      alt=""
                      fill
                      sizes="180px"
                      className="object-cover"
                    />
                  </div>
                )}
              </Link>
            </article>
          ))}
        </div>

        {posts.length === 0 && (
          <p className="mx-auto max-w-md text-center text-lg italic text-ink-faint">
            Nothing written down yet. Check back, or{" "}
            <Link href="/contact" className="text-tincture underline underline-offset-4">
              ask us a question directly
            </Link>
            .
          </p>
        )}
      </section>
    </>
  );
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
