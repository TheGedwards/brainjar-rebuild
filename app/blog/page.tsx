import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPosts, getPageContent } from "@/lib/supabase";
import { Frame, Lozenge } from "@/components/ornaments";
import { ServiceCTA } from "@/components/service-cta";
import { renderHeading } from "@/lib/render-copy";
import { PAGE_SEO } from "@/lib/pages";
import { AdminOnly } from "@/components/admin-bar";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const c = await getPageContent("/blog");
  return {
    title: c.seo_title ?? PAGE_SEO.blog.title,
    description: c.seo_description ?? PAGE_SEO.blog.description,
    alternates: { canonical: "/blog" },
  };
}

function fmtDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

/** Four corner ticks — the specimen-plate detail, reused on the blog thumbnail. */
function CornerTicks() {
  return (
    <>
      <span aria-hidden className="pointer-events-none absolute left-1 top-1 h-3 w-3 border-l-2 border-t-2 border-ink/50" />
      <span aria-hidden className="pointer-events-none absolute right-1 top-1 h-3 w-3 border-r-2 border-t-2 border-ink/50" />
      <span aria-hidden className="pointer-events-none absolute bottom-1 left-1 h-3 w-3 border-b-2 border-l-2 border-ink/50" />
      <span aria-hidden className="pointer-events-none absolute bottom-1 right-1 h-3 w-3 border-b-2 border-r-2 border-ink/50" />
    </>
  );
}

export default async function BlogPage() {
  const [posts, c] = await Promise.all([
    getPosts().catch(() => []),
    getPageContent("/blog"),
  ]);

  return (
    <>
      <section className="px-6 py-6 text-center sm:py-8">
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

      <section className="px-6 pb-8">
        <div className="mx-auto max-w-6xl">
          {posts.length === 0 ? (
            <p className="mx-auto max-w-md text-center text-lg italic text-ink-faint">
              Nothing written down yet. Check back, or{" "}
              <Link href="/contact" className="text-tincture underline underline-offset-4">
                ask us a question directly
              </Link>
              .
            </p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <div key={post.id} className="group/card relative">
                  <AdminOnly>
                    <Link
                      href={`/admin/blog/${post.id}`}
                      className="absolute right-3 top-3 z-10 flex items-center rounded-full bg-ink/85 px-3 py-1 font-display text-[10px] font-bold tracking-[0.15em] text-paper opacity-0 transition-opacity hover:bg-ink group-hover/card:opacity-100"
                    >
                      EDIT
                    </Link>
                  </AdminOnly>

                  <Link href={`/blog/${post.slug}`} className="group flex flex-col">
                    {/* Framed thumbnail — matches the case-study specimen plate. */}
                    <figure className="relative border border-rule-strong bg-card p-2.5 transition-all duration-200 group-hover:-translate-y-1 group-hover:border-tincture">
                      <CornerTicks />
                      {post.cover_image_url ? (
                        <div className="relative aspect-16/10 overflow-hidden border border-rule">
                          <Image
                            src={post.cover_image_url}
                            alt={post.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex aspect-16/10 items-center justify-center border border-rule bg-panel">
                          <Lozenge />
                        </div>
                      )}
                    </figure>

                    <time
                      dateTime={post.published_at ?? undefined}
                      className="mt-3 block font-display text-[10px] font-bold tracking-[0.2em] text-cobalt"
                    >
                      {fmtDate(post.published_at)}
                    </time>
                    <h2 className="display mt-1 text-lg text-ink group-hover:text-tincture">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="mt-2 text-base italic leading-7 text-ink-soft">{post.excerpt}</p>
                    )}
                    <span className="mt-3 inline-block font-display text-[10px] font-bold tracking-[0.2em] text-tincture">
                      READ ON →
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <ServiceCTA />
    </>
  );
}
