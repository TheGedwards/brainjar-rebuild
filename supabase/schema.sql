-- Brainjar Media — Supabase schema
-- Run in Supabase Dashboard -> SQL Editor -> New query -> Run.

-- =============================================================================
-- CLIENTS  — the thing you add most often. One row per business you've worked
-- with. A client can have many projects, but most have exactly one.
-- =============================================================================
create table if not exists public.clients (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,          -- /work/{slug}
  name          text not null,                 -- "Tiki Pets"
  legal_name    text,                          -- "Petropics, Inc."
  category      text not null                  -- shown in the portfolio filter
                check (category in ('corporation','organization','local-business','public-event')),
  industry      text,                          -- "Pet food", "Credit union"
  city          text,
  website_url   text,
  logo_url      text,                          -- Supabase Storage public URL
  is_featured   boolean not null default false,-- drives the home page case study
  sort_order    int not null default 100,      -- lower = earlier on /work
  created_at    timestamptz not null default now()
);

-- =============================================================================
-- PROJECTS — the actual case study. This is what /work/{slug} renders.
-- `services` is which bottles were involved; it powers the ALL/SEO/WEB/CONTENT/
-- PAID ADS filter chips.
-- =============================================================================
create table if not exists public.projects (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references public.clients(id) on delete cascade,
  slug          text unique not null,          -- usually same as client slug
  title         text not null,
  tagline       text,                          -- one italic line on the card
  services      text[] not null default '{}',  -- {'seo','web','content','paid','design'}
  summary       text,                          -- 1-2 paragraphs, portfolio card + hero
  challenge     text,                          -- long-form body, markdown ok
  approach      text,
  outcome       text,
  hero_image_url text,
  gallery       jsonb not null default '[]'::jsonb,  -- [{url, alt, caption}]
  year          int,
  is_published  boolean not null default true,
  published_at  timestamptz default now(),
  updated_at    timestamptz not null default now()
);

-- =============================================================================
-- PROJECT_STATS — the chip on the card ("+212% ORGANIC TRAFFIC").
-- Separate table so a project can have 0, 1 or 3 of them. Right now they're all
-- empty; the UI hides the chip row when there are no stats, so /work looks
-- correct today and gets better the moment you fill these in.
-- =============================================================================
create table if not exists public.project_stats (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references public.projects(id) on delete cascade,
  value         text not null,                 -- "+212%"  "3.4x"  "-41%"
  label         text not null,                 -- "ORGANIC TRAFFIC"
  is_headline   boolean not null default false,-- true = show on the portfolio card
  sort_order    int not null default 0
);

-- =============================================================================
-- POSTS — the basic blog.
-- =============================================================================
create table if not exists public.posts (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,          -- /blog/{slug}
  title         text not null,
  excerpt       text,
  body          text not null default '',      -- markdown
  cover_image_url text,
  author        text not null default 'Brainjar Media',
  tags          text[] not null default '{}',
  is_published  boolean not null default false,
  published_at  timestamptz,
  updated_at    timestamptz not null default now()
);

-- =============================================================================
-- LEADS — contact form submissions. Stored even if email delivery fails, so a
-- lead is never lost to a bounced SMTP call.
-- =============================================================================
create table if not exists public.leads (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null,
  phone         text,
  company       text,
  symptom       text,                          -- "tell us the symptom"
  message       text,
  source_path   text,
  emailed_at    timestamptz,
  created_at    timestamptz not null default now()
);

-- Indexes
create index if not exists projects_client_idx  on public.projects(client_id);
create index if not exists projects_services_idx on public.projects using gin(services);
create index if not exists posts_published_idx  on public.posts(is_published, published_at desc);

-- =============================================================================
-- ROW LEVEL SECURITY
-- Public site reads with the anon key -> only published rows, read-only.
-- /admin writes with the service_role key -> bypasses RLS entirely.
-- Leads are insert-only for anon: the public can submit, but cannot read back
-- what anyone else submitted.
-- =============================================================================
alter table public.clients       enable row level security;
alter table public.projects      enable row level security;
alter table public.project_stats enable row level security;
alter table public.posts         enable row level security;
alter table public.leads         enable row level security;

drop policy if exists "clients readable" on public.clients;
create policy "clients readable" on public.clients
  for select to anon, authenticated using (true);

drop policy if exists "published projects readable" on public.projects;
create policy "published projects readable" on public.projects
  for select to anon, authenticated using (is_published = true);

drop policy if exists "stats readable" on public.project_stats;
create policy "stats readable" on public.project_stats
  for select to anon, authenticated using (true);

drop policy if exists "published posts readable" on public.posts;
create policy "published posts readable" on public.posts
  for select to anon, authenticated
  using (is_published = true and published_at <= now());

drop policy if exists "anyone can submit a lead" on public.leads;
create policy "anyone can submit a lead" on public.leads
  for insert to anon, authenticated with check (true);
-- (no select policy on leads = nobody can read them with the anon key. Correct.)

-- =============================================================================
-- STORAGE — one public bucket for screenshots, logos, blog covers.
-- =============================================================================
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "media publicly readable" on storage.objects;
create policy "media publicly readable" on storage.objects
  for select to anon, authenticated using (bucket_id = 'media');
