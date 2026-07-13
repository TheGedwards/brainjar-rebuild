-- Brainjar Media — editable page copy + SEO (Phase B)
-- Run in the Supabase SQL editor. Safe to re-run.
--
-- One row per editable marketing page. `content` is a { slotKey: text } map;
-- missing keys fall back to the in-code defaults (lib/pages.ts), so the site
-- looks identical until someone edits a field. Reads are public (the copy is
-- public); writes go through the service_role key in server actions.

create table if not exists public.page_content (
  path            text primary key,
  seo_title       text,
  seo_description text,
  content         jsonb not null default '{}',
  updated_at      timestamptz not null default now()
);

alter table public.page_content enable row level security;

drop policy if exists "page_content anon read" on public.page_content;
create policy "page_content anon read" on public.page_content
  for select using (true);
