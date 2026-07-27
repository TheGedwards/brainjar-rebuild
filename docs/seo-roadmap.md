# Brainjar Media — SEO Roadmap

_Audit + build plan. Started 2026-07-26. This tracks the SEO work after launch._

## Where we started (audit baseline — already strong)

- Per-page `generateMetadata` + self-referencing canonical on every route type.
- Dynamic `app/sitemap.ts` (services, work, blog pulled from DB).
- `IS_PRODUCTION_SITE` gates `robots.txt` + `noindex` — staging can't cannibalize.
- `ProfessionalService` LocalBusiness schema (geo, address, areaServed, phone).
- `BlogPosting` schema on posts. OG image, Twitter cards, `metadataBase`, title
  template, skip-link, `next/image`, GA4 + Search Console wired.
- ~42 load-bearing 301s in `next.config.ts`.

## Build order (agreed with client 2026-07-26)

### Phase 1 — Structured-data quick wins ✅ (shipped, commit 4aadaa3)
- `lib/schema.tsx`: shared builders + `<JsonLd>` component.
- Enrich the org schema: `logo`, `image`, `priceRange` ($500–$10,000),
  `openingHoursSpecification` (Mon–Fri 08:00–17:00), fix `sameAs`
  (facebook + **x.com/brainjarmedia**; LinkedIn/Instagram/GBP pending client URLs),
  expand `areaServed` to the target-city list.
- `Service` schema on the 4 service pages (provider → org `@id`, areaServed).
- `BreadcrumbList` JSON-LD on service, sub-service, `/work/[slug]`, `/blog/[slug]`
  (visual breadcrumbs already exist; this marks them up).
- Descriptive `alt` on blog cover images.

### Phase 2 — FAQ blocks + `FAQPage` schema ✅ (shipped, commit 7398390)
- New `faq` slot type in the pages registry (`lib/pages.ts`) so any service /
  location page can carry admin-editable Q&A.
- Public FAQ accordion component + `FAQPage` JSON-LD emitted from the same data.
- Seed FAQs on the 4 service pages.

### Phase 3 — Location landing pages (the growth engine) ✅ (shipped)
Honest local positioning, **no doorway pages** — each page gets its own audience,
argument, service emphasis, proof, city-specific FAQ, local context, internal
links, and CTA. No fake offices/addresses/GBPs; no schema implying we operate
physically from each city.

Launch order (client's shortlist):
1. **Gresham** — deepest page; we're genuinely here. Real address, East County
   experience, local clients/testimonials.
2. **Troutdale** — hospitality/tourism/Gorge, restaurants, contractors, pros.
3. **Portland** — honest "Gresham-based, serving the metro / East + SE Portland";
   most competitive, slowest to rank.
4. **Happy Valley** — growth/premium: medical-dental, home services, real estate;
   needs strong proof (incumbents exist).
5. **Sandy** — "big-agency strategy without hiring a Portland agency"; trades,
   tourism, retail, restaurants, pros.
6. **Fairview + Wood Village** — one combined page to start (split later once we
   have a client / impressions in each).

Second wave (after impressions): Clackamas, Oregon City, Milwaukie, Vancouver,
Damascus. **Not** starting: Beaverton, Hillsboro, Lake Oswego, Tigard, Wilsonville
(dilutes the East-County geographic story).

Reality check: city pages help *organic* rankings ("Troutdale SEO company"), not
the map pack — Google local ranking = relevance + distance + prominence, and a
page can't erase distance. Set expectations accordingly.

## Later phases

### In-admin SEO health linter ✅ (shipped)
`/admin/seo` — fetches every public page and parses the live HTML (title/desc
length + duplicates, canonical, single H1, og:image, JSON-LD, image alt, thin
content), cached hourly. **First run caught a real bug: the home page shipped no
`<title>` (generateMetadata returned `title: undefined`, which suppresses the
layout default instead of falling back) — fixed in `app/page.tsx`.**
Also enriched `sameAs` (added YouTube, Yelp, Google Business Profile).

### Deferred, not yet scheduled
- **Reviews/testimonials model → `Review` + `AggregateRating`** (⭐ in SERP; we
  have 33 clients to draw on).
- **Redirect & broken-link integrity checker** (the 301 map is load-bearing).
- **Content velocity**: blog topic clusters, each feeding a service page;
  contextual internal links from posts → service/work pages; related posts.
- **Sitemap `lastModified`** from real `updated_at` instead of `new Date()`.

## Open client inputs
- LinkedIn / Instagram / Google Business Profile URLs (for `sameAs`).
- Gresham/East-County client names + testimonials usable on location pages.
