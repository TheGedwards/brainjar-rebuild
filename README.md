# Brainjar Media

Rebuild of brainjarmedia.com. Next.js 15 (App Router) + Supabase + Vercel.
Theme: **1a — The Victorian Apothecary**.

- **Portfolio** (`/work`) — the main use of the database. 33 real clients seeded.
- **Blog** (`/blog`) — deliberately basic.
- **Back room** (`/admin`) — password-protected. Add clients, write case studies,
  add stat chips, publish posts, read leads.
- **301s** — every old WordPress URL is mapped in `next.config.ts`.

---

## Setup, start to finish

You need about 40 minutes. Do the steps in order — Vercel needs the Supabase keys.

### Step 1 — Create the Supabase project

1. Go to **supabase.com/dashboard** and sign in.
2. Click **New project**.
   - **Organization**: your existing one.
   - **Name**: `brainjar`
   - **Database password**: click Generate, then **save it in your password
     manager**. You will not be shown it again. (You won't need it day to day —
     the app uses API keys, not the DB password — but you'll want it eventually.)
   - **Region**: **West US (Oregon)** — closest to you and to Vercel's default.
   - **Plan**: Free is fine. This site will not come close to the limits.
3. Click **Create new project** and wait ~2 minutes for it to provision.

### Step 2 — Create the tables

1. In the left sidebar: **SQL Editor** → **New query**.
2. Open `supabase/schema.sql` from this repo, copy the whole file, paste it in,
   click **Run**. You should see "Success. No rows returned."
3. New query again. Copy `supabase/seed.sql`, paste, **Run**. This loads all 33
   clients with the exact slugs the 301 redirects point at.
4. Sidebar → **Table Editor**. You should see `clients` (33 rows), `projects`
   (33 rows), `project_stats` (0), `posts` (1), `leads` (0).

### Step 3 — Copy the keys

Sidebar → **Project Settings** → **API**. You need three values:

| Supabase calls it | Goes in the env var |
|---|---|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` `public` key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` `secret` key | `SUPABASE_SERVICE_ROLE_KEY` |

The `service_role` key bypasses all security rules. It only ever lives in
Vercel's environment variables and in your local `.env.local`. Never commit it,
never put it in a `NEXT_PUBLIC_` variable, never paste it into a client file.

### Step 4 — Run it locally (optional but recommended)

```bash
cp .env.example .env.local     # then fill in the values from Step 3
npm install
npm run dev                    # http://localhost:3000
```

Visit `/admin` — it will ask for a username and password. Those are the
`ADMIN_USER` / `ADMIN_PASSWORD` you set in `.env.local`.

### Step 5 — Put the code on GitHub

1. On github.com click **New repository**. Name it `brainjar`. **Private**.
   Do **not** add a README or .gitignore — this repo already has them.
2. In this folder:

```bash
git init
git add .
git commit -m "Brainjar rebuild"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/brainjar.git
git push -u origin main
```

### Step 6 — Deploy to Vercel

1. **vercel.com/new** → **Import Git Repository** → pick `brainjar`.
   (First time, you'll grant Vercel access to your GitHub account.)
2. Vercel auto-detects Next.js. **Do not change the build settings.**
3. Expand **Environment Variables** and add all of these:

```
NEXT_PUBLIC_SUPABASE_URL       https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY  eyJ...
SUPABASE_SERVICE_ROLE_KEY      eyJ...
ADMIN_USER                     brainjar
ADMIN_PASSWORD                 (pick something long)
CONTACT_TO_EMAIL               (where contact form emails should land)
NEXT_PUBLIC_SITE_URL           https://www.brainjarmedia.com
RESEND_API_KEY                 (leave blank for now — see below)
```

4. **Deploy.** You'll get a `brainjar-xxxx.vercel.app` URL in about 90 seconds.

Click around it. The old site is still running untouched at brainjarmedia.com —
nothing you do here affects it until Step 7.

> **Shortcut for next time:** Vercel → your project → **Integrations** → add the
> **Supabase** integration, and it will sync the Supabase env vars for you
> automatically instead of you copying them by hand.

### Step 7 — Point the domain (the cutover)

Only do this when you're happy with the preview.

1. Vercel → project → **Settings** → **Domains**.
2. Add `www.brainjarmedia.com`. Vercel shows you a CNAME record.
3. Add `brainjarmedia.com` too, and set it to **Redirect to
   www.brainjarmedia.com**. (www stays canonical — that's where 20 years of
   backlinks point.)
4. Go to wherever the domain's DNS lives today and update the records Vercel
   showed you. Propagation is usually minutes.
5. **Immediately after**, spot-check the redirects:

```bash
curl -sI https://www.brainjarmedia.com/portfolio-tikipets/ | head -3
# expect: HTTP/2 308 ... location: /work/tikipets
# (Next reports 308 for permanent redirects; Google treats 301 and 308
#  identically for passing ranking signals.)

curl -sI https://www.brainjarmedia.com/search-engine-optimization/ | head -3
curl -sI https://www.brainjarmedia.com/about-our-process/ | head -3
```

6. In **Google Search Console**, add the property if it isn't there, and submit
   `https://www.brainjarmedia.com/sitemap.xml`.

### Step 8 — Contact form email (optional)

Right now every submission is saved to the `leads` table and shows up at
`/admin`, so nothing is lost. To also get an email:

1. Sign up at **resend.com** (free tier: 3,000/month).
2. Add and verify `brainjarmedia.com` as a sending domain — this means adding
   three DNS records. Resend walks you through it.
3. Put the API key in Vercel as `RESEND_API_KEY` and redeploy.

If you'd rather not touch DNS, **Formspree** works with zero DNS setup; swap the
`fetch` call in `app/api/contact/route.ts`.

---

## Adding a client (the thing you'll do most)

`/admin` → **Add a Client** → name, category, website. Save.

That creates the client *and* an empty `/work/{slug}` page. Then find it in the
**Portfolio** list, and fill in:

- **Services** — check the boxes. This is what makes the SEO / WEB / CONTENT /
  PAID ADS filter chips appear on `/work`. Until at least one project is tagged,
  the filter row correctly hides itself instead of showing five chips that all
  return nothing.
- **Tagline** — the one italic line on the card.
- **The Symptom / The Formula / The Result** — the case study body.
- **Stat chips** — `+212%` / `ORGANIC TRAFFIC`. Mark one **headline** to show it
  on the portfolio card. Leave them empty and the chip row just doesn't render.

Images: Supabase → **Storage** → `media` bucket → upload → click the file → copy
the public URL → paste into **Hero image URL**.

---

## Structure

```
app/
  page.tsx                       home (hero, bottle shelf, featured case study)
  work/                          portfolio index + case study template
  services/[service]/[sub]/      17 pages from one template
  blog/                          index + post template
  contact/                       form -> /api/contact -> Supabase -> Resend
  admin/                         the back room (Basic auth via middleware.ts)
components/
  bottle-shelf.tsx               the signature element
  ornaments.tsx                  all period decoration, drawn as SVG
lib/
  services.ts                    ONE array drives the shelf, the formulary,
                                 17 routes, the filters and the footer
  supabase.ts                    typed queries
next.config.ts                   the 301 map
supabase/schema.sql              run first
supabase/seed.sql                run second
```

## Two open decisions

1. **Graphic Design** was retired (2026-07-18). The old `/graphic-design` URL
   now 301s to `/services` rather than the deleted page — if you ever retire
   another service, repoint its redirects too or the old URL starts 404ing.
2. **Stat chips are empty**, as you asked. The design is fully built for them;
   the moment you add real numbers in `/admin` they light up on the cards, the
   case studies and the home page.
