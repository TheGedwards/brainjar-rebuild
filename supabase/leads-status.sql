-- Lightweight lead status for the admin leads screen.
-- Workflow: new → contacted → handled (or archived for junk/irrelevant).
-- Run in the Supabase SQL editor.

alter table public.leads add column if not exists status text not null default 'new';

-- Fast filtering/sorting on the leads screen.
create index if not exists leads_status_idx on public.leads(status, created_at desc);
