import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPost, getPosts } from "@/lib/supabase";
import { Lozenge, PointedRule } from "@/components/ornaments";
import { PostBody } from "@/components/post-body";
import { PostLinks } from "@/components/post-links";
import { ServiceCTA } from "@/components/service-cta";
import { EditTarget } from "@/components/admin-bar";
import { SITE_URL } from "@/lib/site";
import { JsonLd, breadcrumbSchema } from "@/lib/schema";
import { getServiceByKey } from "@/lib/services";

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
    // Articles use the headline alone, no " | Brainjar Media" suffix — that
    // frees the full ~60 chars for a descriptive, keyword-rich title.
    title: { absolute: post.seo_title ?? post.title },
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

  // Topic-cluster links: the post's pillar service + related posts (same pillar
  // first, then most recent) to keep readers moving through the cluster.
  const pillar = getServiceByKey(post.category);
  const all = await getPosts().catch(() => []);
  const others = all.filter((p) => p.slug !== post.slug);
  const samePillar = post.category ? others.filter((p) => p.category === post.category) : [];
  const related = [...samePillar, ...others.filter((p) => !samePillar.includes(p))].slice(0, 3);

  return (
    <>
    <article className="px-6 py-6">
      <EditTarget href={`/admin/blog/${post.id}`} label="Edit this post" />
      {/* Article structured data — datePublished/dateModified use the publish
          date, so Google treats the post's date as when it was published. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt ?? undefined,
            datePublished: post.published_at ?? undefined,
            dateModified: post.updated_at ?? post.published_at ?? undefined,
            author: { "@type": "Organization", name: post.author ?? "Brainjar Media" },
            publisher: { "@type": "Organization", name: "Brainjar Media" },
            image: post.cover_image_url ? [post.cover_image_url] : undefined,
            url: `${SITE_URL}/blog/${post.slug}`,
            mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
          }),
        }}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />
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
          <div className="relative aspect-16/10">
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              priority
              className="object-cover"
            />
          </div>
        </div>
      )}

      <PostBody body={post.body} className="mt-12" />

      {/* Pillar link — sends this cluster post up to its service page. */}
      {pillar && (
        <div className="mx-auto mt-12 max-w-2xl border-y border-rule bg-panel px-6 py-6 text-center">
          <div className="eyebrow mb-2">Filed under</div>
          <Link href={`/services/${pillar.slug}`} className="display text-xl text-ink hover:text-tincture">
            {pillar.name}
          </Link>
          <div className="mt-3">
            <Link
              href={`/services/${pillar.slug}`}
              className="font-display text-[10px] font-bold tracking-[0.2em] text-tincture hover:text-tincture-dk"
            >
              SEE HOW WE DO {pillar.name.toUpperCase()} →
            </Link>
          </div>
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

      {/* Keep Reading — related cluster posts. */}
      {related.length > 0 && (
        <section className="mx-auto mt-16 max-w-5xl border-t border-rule pt-8">
          <div className="eyebrow mb-8 text-center">Keep Reading</div>
          <PostLinks posts={related} />
        </section>
      )}

    </article>

    <ServiceCTA />
    </>
  );
}
