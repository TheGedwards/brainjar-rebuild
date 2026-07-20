-- Brainjar Media — specimen plate additions
-- Run in Supabase Dashboard -> SQL Editor after schema.sql / seed.sql.
--
-- Adds the optional mock-Latin "binomial" epithet shown under the client name
-- on the /work/[slug] specimen plate (e.g. "Officina reparandi"). Nullable —
-- when empty the line simply doesn't render. Everything else the specimen page
-- needs (services, category, stats, hero image) already exists.

alter table public.projects add column if not exists binomial text;
