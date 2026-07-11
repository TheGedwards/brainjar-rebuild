# Brainjar Media — project context

Rebuild of brainjarmedia.com, a digital marketing agency in Gresham, Oregon
(est. 2003). Replacing a 15-year-old WordPress site. Next.js 15 App Router +
TypeScript + Tailwind v4, Supabase (Postgres + Storage), deployed on Vercel.

## Non-negotiables

1. **The 301 map in `next.config.ts` is load-bearing.** Twenty years of backlinks
   and rankings depend on it. Never delete a redirect. If you rename a route,
   add a redirect for the old one — don't just change the destination and move
   on. `permanent: true` = a real 301.
2. **The portfolio is the point of the database.** `/work` and `/work/[slug]` are
   the most important pages on the site after the home page. 33 real clients are
   seeded with the exact slugs the redirects point at. Don't change a slug
   without adding a redirect.
3. **The design brief is fixed.** Theme "1a — Victorian Apothecary", approved
   from a mockup. Palette and type are defined as tokens in `app/globals.css`.
   Do not introduce new colors, new fonts, or new border radii. If something
   needs a tone that isn't there, it's almost always `--color-ink` at reduced
   opacity.
4. **The blog is deliberately basic.** Markdown-lite (paragraphs + `##` headings,
   parsed inline in `app/blog/[slug]/page.tsx`). Do not add a markdown library,
   an MDX pipeline, comments, categories, or an RSS feed unless asked.

## Architecture

```
lib/services.ts     ONE array (SERVICES) drives: the bottle shelf, /services,
                    17 service + sub-service routes, the portfolio filter chips,
                    and the footer. Adding a service = adding one object here.
lib/supabase.ts     `supabase` = anon client, public reads, obeys RLS.
                    `supabaseAdmin()` = service_role, SERVER ONLY, bypasses RLS.
                    Never import supabaseAdmin into a "use client" file.
components/         bottle-shelf.tsx is the signature element. ornaments.tsx
                    holds every piece of period decoration, drawn as SVG.
app/admin/          HTTP Basic auth via middleware.ts. Server actions in
                    actions.ts. noindex.
supabase/           schema.sql then seed.sql, run in the Supabase SQL editor.
```

## Data model

`clients` → `projects` (1:1 in practice) → `project_stats` (0..n).
Plus `posts` and `leads`.

- RLS: anon can read published rows only. `leads` is insert-only for anon —
  submissions are writable but not readable with the public key.
- `projects.services` is a `text[]` of `seo | web | content | paid | design`.
  It's what powers the filter chips.

## Deliberate empty states — do not "fix" these

- **Stat chips are empty on purpose.** The client is filling in real numbers
  later. The UI hides the chip row when a project has no stats, and shows it the
  moment one is added. Don't seed fake numbers.
- **Filter chips on `/work` only render for services that are actually present
  on at least one project.** With nothing tagged yet, only "ALL" shows. That's
  correct, not a bug.
- **Portfolio cards with no image** render the client's initials on a label-stock
  swatch. That's the intended empty state, not a placeholder to be replaced with
  a gray box.
- Supabase env vars fall back to placeholders so the project builds and runs
  before Supabase is configured. Queries fail into `.catch(() => [])` and pages
  render their empty states.

## Open items

- Contact form destination email not yet chosen. Leads are written to Supabase
  first and emailed second (best-effort via Resend), so nothing is lost if email
  isn't configured.
- No real portfolio screenshots yet.
- Graphic Design is included as Formula No. 05 because it has a live indexed page
  at `/graphic-design/`. The mockup only shelved four bottles. To retire it,
  delete one object from `lib/services.ts` — nothing else needs to change.

## Commands

```bash
npm install
npm run dev      # localhost:3000
npm run build    # must pass before pushing
```
