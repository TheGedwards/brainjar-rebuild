-- =============================================================================
-- LEAD-GENERATION / CRM  (Phase L1 foundation)
-- Run in the Supabase SQL editor AFTER schema.sql (and the other migrations).
--
-- Extends the existing `leads` table into a pipeline, and adds two tables:
--   meetings         one row per Cal.com booking, linked to a lead
--   lead_activities  append-only timeline (notes, status changes, bookings)
--
-- Access model (unchanged in spirit from schema.sql):
--   anon may INSERT a lead (the public forms) but never SELECT one.
--   Staff read/write through server actions using the service_role key, which
--   BYPASSES RLS. The Cal.com webhook also writes with the service role.
--   So the new tables enable RLS with NO anon policies: locked to the public
--   key, fully open to the service role. Do not add a public read policy.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Extend leads into a pipeline
-- ---------------------------------------------------------------------------
alter table public.leads
  add column if not exists source            text        not null default 'contact_form',
  add column if not exists status            text        not null default 'new',
  add column if not exists owner_id          uuid        references public.profiles(id) on delete set null,
  add column if not exists next_follow_up_at timestamptz,
  add column if not exists last_activity_at  timestamptz not null default now(),
  add column if not exists utm               jsonb,
  add column if not exists attribution       jsonb,       -- landing/referrer/service page, first-party captured
  add column if not exists updated_at         timestamptz not null default now();

-- Existing rows predate the pipeline: they came from the contact form and are
-- unworked. The defaults above already backfill source/status, but be explicit.
update public.leads set source = 'contact_form' where source is null;
update public.leads set status = 'new'          where status is null;

create index if not exists leads_status_idx     on public.leads(status);
create index if not exists leads_created_idx     on public.leads(created_at desc);
create index if not exists leads_followup_idx    on public.leads(next_follow_up_at)
  where next_follow_up_at is not null;

-- ---------------------------------------------------------------------------
-- 2. meetings — one row per Cal.com booking
-- ---------------------------------------------------------------------------
create table if not exists public.meetings (
  id                 uuid primary key default gen_random_uuid(),
  lead_id            uuid not null references public.leads(id) on delete cascade,
  cal_booking_uid    text unique,                 -- idempotency key for the webhook
  event_type         text,
  starts_at          timestamptz,
  ends_at            timestamptz,
  attendee_timezone  text,
  join_url           text,                         -- Zoom link
  reschedule_url     text,
  cancel_url         text,
  status             text not null default 'booked', -- booked|rescheduled|cancelled|completed|no_show
  raw                jsonb,                        -- full webhook payload, for audit
  created_at         timestamptz not null default now()
);
create index if not exists meetings_lead_idx   on public.meetings(lead_id);
create index if not exists meetings_starts_idx  on public.meetings(starts_at);

-- ---------------------------------------------------------------------------
-- 3. lead_activities — the timeline
-- ---------------------------------------------------------------------------
create table if not exists public.lead_activities (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid not null references public.leads(id) on delete cascade,
  kind       text not null,                        -- note|status_change|meeting_booked|meeting_cancelled|email_sent|system
  body       text,
  meta       jsonb,                                -- e.g. {"from":"new","to":"contacted"}
  author_id  uuid references public.profiles(id) on delete set null,  -- null = system/automated
  created_at timestamptz not null default now()
);
create index if not exists lead_activities_lead_idx on public.lead_activities(lead_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 4. RLS: enable, but grant the public key nothing on the new tables.
--    (service_role bypasses RLS; that's how staff + the webhook write.)
-- ---------------------------------------------------------------------------
alter table public.meetings        enable row level security;
alter table public.lead_activities enable row level security;
-- No policies for anon/authenticated by design. Reads/writes are server-side.

-- ---------------------------------------------------------------------------
-- 5. Keep updated_at / last_activity_at honest at the DB level.
-- ---------------------------------------------------------------------------
create or replace function public.touch_lead_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists leads_touch_updated_at on public.leads;
create trigger leads_touch_updated_at
  before update on public.leads
  for each row execute function public.touch_lead_updated_at();
