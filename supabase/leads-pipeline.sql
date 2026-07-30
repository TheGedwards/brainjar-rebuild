-- v1 lead pipeline: triage + stages + the next-action engine.
-- Run AFTER leads-status.sql (which added leads.status). In the SQL editor.

alter table public.leads
  add column if not exists reason           text,          -- lost / junk / disqualified reason code
  add column if not exists next_action      text,          -- the engine: what happens next
  add column if not exists next_action_at   date,          -- ...and by when (also the Nurture revisit date)
  add column if not exists notes            text,          -- free-form running notes
  add column if not exists stage_changed_at timestamptz not null default now(),
  add column if not exists updated_at       timestamptz not null default now();

-- Migrate the old lightweight statuses into the pipeline vocabulary.
-- "archived" was a junk drawer → disqualified (re-triage in the UI: mark true
-- spam as Junk, delete tests). "handled" was ambiguous → contacted.
update public.leads set status = 'disqualified' where status = 'archived';
update public.leads set status = 'contacted'    where status = 'handled';

create index if not exists leads_nextaction_idx on public.leads(next_action_at);
