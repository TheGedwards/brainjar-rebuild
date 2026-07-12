-- Brainjar Media — CMS auth & roles (Phase 1)
-- Run AFTER schema.sql. Safe to re-run (idempotent).
--
-- Adds real per-user accounts on top of Supabase Auth:
--   auth.users (managed by Supabase)  ->  public.profiles (our role + status)
--
-- Roles: super_admin | admin | manager
--   super_admin — everything, incl. managing users & roles
--   admin       — nav, SEO, portfolio, blog (no user management)
--   manager     — portfolio + blog + view leads
--
-- Bootstrap: the FIRST account ever created becomes super_admin automatically
-- (see handle_new_user). Create it in the Supabase dashboard:
--   Authentication -> Users -> Add user  (your email + password, auto-confirm),
-- then log in at /admin/login and add everyone else from the CMS.

-- --- profiles ---------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  full_name  text,
  role       text not null default 'manager'
             check (role in ('super_admin', 'admin', 'manager')),
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- --- role helper ------------------------------------------------------------
-- Returns the calling user's role (or null if not signed in / no profile).
-- SECURITY DEFINER so RLS policies can call it without recursing on profiles.
create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- --- auto-create a profile on signup ---------------------------------------
-- First profile ever -> super_admin (bootstrap). Everyone after -> manager;
-- the CMS "add user" flow overwrites that with the chosen role right after.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role, is_active)
  values (
    new.id,
    new.email,
    case when (select count(*) from public.profiles) = 0
         then 'super_admin' else 'manager' end,
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- --- RLS --------------------------------------------------------------------
-- App writes go through the service_role key (server actions), which bypasses
-- RLS; these policies are defense-in-depth for any anon/authenticated access.
alter table public.profiles enable row level security;

drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles
  for select using (id = auth.uid());

drop policy if exists "profiles super_admin read all" on public.profiles;
create policy "profiles super_admin read all" on public.profiles
  for select using (public.current_role() = 'super_admin');

drop policy if exists "profiles super_admin write" on public.profiles;
create policy "profiles super_admin write" on public.profiles
  for all using (public.current_role() = 'super_admin')
  with check (public.current_role() = 'super_admin');

-- keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
