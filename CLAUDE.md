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
3. **The design brief is fixed.** Theme "1a — Victorian Apothecary". Palette,
   fonts, and border radii are defined as tokens in `app/globals.css`. Do not
   introduce new colors, new fonts, or new border radii. If something needs a
   tone that isn't there, it's almost always `--color-ink` at reduced opacity.
   The type scale and spacing follow a **locked-in 8pt grid system** (adopted
   2026-07-12, superseding the original mockup's ad-hoc measurements):
   - **8pt grid.** Every margin, padding, and gap is a multiple of 8px. 4px is
     the *only* permitted half-step, and only for tight type pairs (label→value,
     icon gaps). No 6/10/12/14/20/28/36/44px spacing. In Tailwind terms: even
     steps only (`p-2 p-4 p-6 p-8 p-10 p-12`…); avoid odd/half steps (`p-3 p-5
     p-7 p-1.5 p-2.5`). Hairline borders (1–3px rules) are exempt.
   - **Type scale is grid-aligned.** Sizes and line-heights are the `--text-*`
     tokens in `globals.css`; every line-height is a multiple of 8. Don't set
     arbitrary `text-[Npx]` unless N is grid-aligned, and pair body copy with a
     grid `leading-*` (e.g. `leading-8`), never `leading-relaxed`.
   - **Body/paragraph copy is 24px minimum** (`--text-lg` = 24/32, or
     `.prose-apothecary`). Running prose never goes below this. Sizes under 16px
     (`text-xs`/`text-sm` and the `text-[9–14px]` micro-labels: eyebrows, nav,
     No. plates, stat/chip labels) are the documented exception — they're
     single-line UI labels, not paragraphs.
   - **Density.** Section padding and gaps were tightened ~20% from the original
     airy mockup. Keep that density; don't reintroduce large `py-20`/`py-24`
     section padding without reason.
   `app/admin` is deliberately excluded from this system — it's internal,
   noindexed tooling and keeps its utilitarian spacing.
4. **The blog uses a rich text editor.** As of Phase B1, posts are authored in a
   curated TipTap editor (headings, bold/italic/underline, lists, links,
   blockquote, inline images; Word paste preserved) and stored as **sanitized
   HTML** — see `lib/sanitize.ts` (sanitize on save AND on render). The public
   page renders HTML when the body is HTML, else falls back to the original
   markdown-lite parser (the one seed post). Editor lives in
   `components/admin/rich-editor.tsx`. Posts also carry `seo_title` /
   `seo_description` (fall back to title/excerpt). Still no comments, categories,
   or RSS unless asked. Images upload to the Supabase `media` bucket via the
   `uploadImage` server action (`components/admin/image-upload.tsx`).

## Architecture

```
lib/services.ts     ONE array (SERVICES) drives: the bottle shelf, /services,
                    17 service + sub-service routes, the portfolio filter chips,
                    and the footer. Adding a service = adding one object here.
lib/supabase.ts     `supabase` = anon client, public reads, obeys RLS.
                    `supabaseAdmin()` = service_role, SERVER ONLY, bypasses RLS.
                    Never import supabaseAdmin into a "use client" file.
lib/auth.ts         CMS auth. `getCurrentUser()` = signed-in user + profile/role.
                    `requireUser()` guards pages, `requireRole([...])` guards
                    server actions. Roles: super_admin | admin | manager.
components/         bottle-shelf.tsx is the signature element. ornaments.tsx
                    holds every piece of period decoration, drawn as SVG.
app/admin/          Supabase Auth via middleware.ts (session gate -> /admin/login).
                    Server actions in actions.ts, each role-gated. noindex.
                    Users are managed in-app by super_admins.
supabase/           schema.sql then seed.sql, then cms-auth.sql. Run in the
                    Supabase SQL editor, in that order.
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
