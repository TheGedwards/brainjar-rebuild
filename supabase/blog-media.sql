-- Brainjar Media — blog SEO + media storage (Phase B1)
-- Run in the Supabase SQL editor. Safe to re-run.

-- SEO fields on posts. Fall back to title/excerpt when blank (handled in app).
alter table public.posts
  add column if not exists seo_title       text,
  add column if not exists seo_description text;

-- Public "media" bucket for uploaded images (blog covers, inline images,
-- portfolio galleries). Uploads happen server-side with the service_role key,
-- so no storage write policies are needed; public = true makes reads work.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;
