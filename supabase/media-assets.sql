-- Media metadata: per-image SEO alt text + title for files in the `media`
-- bucket. The library edits these; public pages read `alt` at render so it
-- travels with the image everywhere it's placed.
--
-- Run in the Supabase SQL editor (after schema.sql / blog-media.sql).

create table if not exists public.media_assets (
  path       text primary key,           -- storage path within the media bucket, e.g. "blog/foo.jpg"
  alt        text not null default '',
  title      text,
  folder     text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.media_assets enable row level security;

-- Public may READ alt (it renders on public pages). Writes go through the
-- service role (admin actions), which bypasses RLS.
drop policy if exists "media_assets public read" on public.media_assets;
create policy "media_assets public read" on public.media_assets
  for select to anon, authenticated using (true);

-- Backfill: one row per image already in the bucket (empty alt, ready to edit).
insert into public.media_assets (path, folder)
select o.name,
       case when position('/' in o.name) > 0 then split_part(o.name, '/', 1) else '' end
from storage.objects o
where o.bucket_id = 'media'
  and o.name ~* '\.(png|jpe?g|gif|webp|avif|svg)$'
on conflict (path) do nothing;
