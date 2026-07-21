-- Brainjar Media — blog category
-- Run in Supabase SQL editor. Adds an optional single category to posts so the
-- admin blog list can group/sort like posts together (distinct from free-form
-- tags). Nullable — existing posts just show no category until one is set.

alter table public.posts add column if not exists category text;
