# Lead-Generation Machine — Spec

**Status:** Draft for approval · **Author:** Claude + Guy · **Date:** 2026-07-21

Turns the site from a brochure into a lead engine: capture prospects from every
entry point, let them self-book a Zoom consult against Guy's real Google Calendar
availability, track every lead through a pipeline in the admin console, and get
notified + reminded to follow up.

**Decided going in:**
- Scheduling engine = **Cal.com (embed + capture)**. Cal.com owns the hard calendar
  mechanics (Google Calendar sync, Zoom links, timezones, reminders, reschedule/
  cancel). Every booking is captured into **our own Supabase pipeline via webhook**,
  so the CRM/lead data stays native and on-brand.
- This document is written **before any building**. Nothing here is built yet.

---

## 1. Principles & fit with the existing app

- **One `leads` table is the spine.** Contact form, "book a consult," and any future
  CTA all write to `public.leads` with a `source`. The pipeline reads that one table.
- **No new calendar/Zoom/Google secrets in our app.** Cal.com holds those integrations.
  We only store a **webhook signing secret**. This sidesteps Google's OAuth app-
  verification process for calendar scopes — a major reason not to build native.
- **Reuse what exists:** `supabaseAdmin()` for server writes, `@supabase/ssr` auth,
  role gates (`lib/roles.ts`, `lib/auth.ts`), the sortable `AdminTable`, Resend
  (already wired in `app/api/contact/route.ts`), and the "Victorian Apothecary"
  theme tokens + 8pt grid.
- **RLS unchanged in spirit:** anon can *insert* a lead, never *read* one; all
  reads/writes for staff go through server actions/service role.
- **Roles:** viewing/managing leads = `CONTENT_ROLES` (manager, admin, super_admin),
  matching who already edits content. Revisit if Guy wants leads restricted tighter.

---

## 2. Data model

### 2.1 Extend `public.leads`
Current columns: `id, name, email, phone, company, symptom, message, source_path,
emailed_at, created_at`. Add:

| Column | Type | Notes |
|---|---|---|
| `source` | text | `contact_form` \| `book_consult` \| `cta` \| `manual` \| `import`. Defaults `contact_form`. |
| `status` | text | Pipeline stage (see §2.4). Default `new`. |
| `owner_id` | uuid null | FK → `profiles.id`; who's working the lead (later; default Guy). |
| `next_follow_up_at` | timestamptz null | Drives the reminder/"due" surfacing. |
| `last_activity_at` | timestamptz | Bumped on any activity; default `now()`. |
| `utm` | jsonb null | Optional `{source,medium,campaign,term,content}` capture. |
| `updated_at` | timestamptz | `now()`, bumped on write. |

Keep `symptom`/`message`; both feed the lead detail view.

### 2.2 New table: `public.meetings`
One row per Cal.com booking, linked to a lead.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid pk | |
| `lead_id` | uuid | FK → leads. |
| `cal_booking_uid` | text unique | Cal.com booking UID (idempotency key for the webhook). |
| `event_type` | text | e.g. "Free Diagnosis (30 min)". |
| `starts_at` / `ends_at` | timestamptz | In UTC; render in viewer/staff tz. |
| `attendee_timezone` | text | From Cal.com. |
| `join_url` | text | Zoom link. |
| `reschedule_url` / `cancel_url` | text | Cal.com-hosted. |
| `status` | text | `booked` \| `rescheduled` \| `cancelled` \| `completed` \| `no_show`. |
| `raw` | jsonb | Full webhook payload, for audit/debugging. |
| `created_at` | timestamptz | |

### 2.3 New table: `public.lead_activities` (the timeline)
Append-only history shown on the lead detail page.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid pk | |
| `lead_id` | uuid | FK. |
| `kind` | text | `note` \| `status_change` \| `meeting_booked` \| `meeting_cancelled` \| `email_sent` \| `system`. |
| `body` | text null | Note text / human summary. |
| `meta` | jsonb null | e.g. `{from:"new",to:"contacted"}`. |
| `author_id` | uuid null | `profiles.id`; null = system/automated. |
| `created_at` | timestamptz | |

### 2.4 Pipeline statuses (starting set)
`new → contacted → meeting_booked → met → proposal → won` / `lost` (+ `nurturing`).
Stored as text (not a hard enum) so we can adjust without a migration. A small
`LEAD_STATUSES` array in `lib/leads.ts` drives the UI labels/order/colors, exactly
like `SERVICES` drives the service UI.

### 2.5 RLS
- `leads`: keep anon **insert-only**; add staff **select/update** via authenticated
  policies (or route all staff access through server actions using `supabaseAdmin()`,
  matching current admin patterns — preferred for consistency).
- `meetings`, `lead_activities`: **no anon access**; staff read/write via server
  actions. The webhook writes with the service role.

Migration lands as `supabase/leads-crm.sql` (run in the SQL editor, same as the others).

---

## 3. Block 1 — Capture

- **Consolidate entry points → one table + `source` tag.**
  - Contact form (`/contact`) → `source: contact_form` (already writes to `leads`;
    just add the column).
  - "Book a consult" page → booking webhook creates/updates a lead → `source: book_consult`.
  - Site CTAs ("Get a free diagnosis") point at `/book` (or `/contact`).
  - Manual add in admin → `source: manual`.
- **Optional UTM capture:** read `utm_*` query params client-side, stash in a cookie,
  include on form submit → `leads.utm`. Lets you see which campaigns produce leads.
- **Spam control (no CAPTCHA):** honeypot field + minimum time-to-submit + basic
  per-IP rate limiting in the API route. Cheap, invisible, no third-party.

---

## 4. Block 2 — Schedule (Cal.com, embed + capture)

### 4.1 One-time Cal.com setup (Guy)
1. Create a Cal.com account (free tier is fine for a single calendar).
2. Connect **Google Calendar** (availability source + writes the event) and **Zoom**
   (auto-creates the meeting link) in Cal.com's app store.
3. Create an **event type**: "Free Diagnosis (30 min)", location = Zoom, with buffers,
   min-notice, daily cap, and availability windows (Guy's working hours). Add any
   intake questions (e.g. "What's the symptom?", website URL) — these come through
   on the webhook and prefill the lead.
4. Set the event's **brand color** to our tincture; we style the embed frame to match.

### 4.2 The `/book` page
- New route `app/book/page.tsx`, themed in the apothecary style (framed like the
  specimen plate). Indexable — it's a conversion page.
- Embed via **`@calcom/embed-react`** (inline embed) so it lives inside our layout
  rather than bouncing off-site. Popup embeds also wired onto CTA buttons if we want.
- Add "Book a consult" to primary nav / the cobalt CTA button target.

### 4.3 Webhook capture — `app/api/cal/webhook/route.ts`
- Cal.com sends `BOOKING_CREATED`, `BOOKING_RESCHEDULED`, `BOOKING_CANCELLED`.
- **Verify the HMAC signature** against `CAL_WEBHOOK_SECRET` before trusting anything.
- On `BOOKING_CREATED`:
  1. Upsert a **lead** by email (`source: book_consult`, `status: meeting_booked`).
  2. Insert a **meeting** row (idempotent on `cal_booking_uid`).
  3. Insert a `meeting_booked` **activity**.
  4. Fire the **notify-Guy** email (§6).
- Reschedule/cancel → update the meeting row + append an activity (+ optionally move
  the lead back to `contacted` on cancel).
- Writes use the service role; the route is unauthenticated but signature-gated.

**What we deliberately do NOT build:** availability logic, timezone math, Zoom API,
Google OAuth, reminder emails to the attendee — Cal.com does all of it.

---

## 5. Block 3 — Pipeline (CRM in the admin console)

- **`/admin/leads`** — list built on the existing `AdminTable`: Name, Source, Status
  (colored chip), Created, Next follow-up. Sortable; row click → detail; filter by
  status. Reuses the console shell + role gate.
- **`/admin/leads/[id]`** — detail:
  - Contact block (name, email, phone, company, source, UTM).
  - The message/symptom.
  - **Meeting card** if booked: date/time in Guy's tz, Zoom join link, reschedule/
    cancel links, status.
  - **Status changer** (dropdown from `LEAD_STATUSES`) — writes a `status_change`
    activity automatically.
  - **Notes** — add a note → `note` activity.
  - **Follow-up** — set `next_follow_up_at` with a note ("call Thursday").
  - **Activity timeline** — reverse-chron feed of all activities.
- Server actions (`app/admin/(console)/leads/actions.ts`), each role-gated, mirroring
  the portfolio/blog action pattern.
- **Dashboard tiles:** new-leads-this-week, upcoming meetings, and **follow-ups due**.

---

## 6. Block 4 — Notify & follow up

- **Instant notify Guy** (via Resend, already wired) on:
  - New form lead (exists today — just needs `CONTACT_TO_EMAIL` set).
  - New booking (from the webhook) — includes the Zoom link + time.
- **Confirmation to the lead:**
  - Bookings: Cal.com already sends a branded confirmation + calendar invite +
    reminders. Decision needed (§8) whether that's enough or we also send our own.
  - Form leads: send a short "we got your message" auto-reply (optional).
- **Follow-up reminders:** `next_follow_up_at` surfaces on the dashboard as "due."
  A lightweight **daily digest email** (Vercel Cron → route that queries due
  follow-ups) keeps Guy on top of them without opening the console.
- **Later / optional:** SMS via Twilio (instant text on a hot lead), multi-step drip
  sequences, lead scoring.

---

## 7. Integrations & environment variables

| Var | Where | Purpose |
|---|---|---|
| `CONTACT_TO_EMAIL` | Vercel | Destination for lead notifications. **Currently unset** — blocks all notifications (see CLAUDE.md open item). |
| `RESEND_API_KEY` | Vercel | Already used by the contact route. |
| `CAL_WEBHOOK_SECRET` | Vercel | Verifies Cal.com webhook signatures. |
| `NEXT_PUBLIC_CAL_LINK` | Vercel | Cal.com username/event slug for the embed. |
| (Google, Zoom) | **Cal.com only** | Not stored in our app. |

No changes to the 301 map. New routes: `/book` (public), `/api/cal/webhook`,
`/admin/leads`, `/admin/leads/[id]`. None replace an existing URL, so no redirects
needed.

---

## 8. Decisions still needed from Guy

1. **Notification email** — what address should new leads/bookings go to?
   (Sets `CONTACT_TO_EMAIL` and unblocks all notifications, form leads included.)
2. **Consult definition** — length (30 min?), your weekly availability windows,
   buffer between calls, max/day, and what questions to ask on the booking form.
3. **Zoom account** — do you have a Zoom account to connect to Cal.com? (Free Zoom
   works; 40-min limit on group calls but 1:1 is unlimited.)
4. **Confirmation emails** — rely on Cal.com's built-in confirmations, or also send
   our own apothecary-branded one?
5. **Lead access** — managers + admins see all leads (proposed), or restrict to you?
6. **Nav placement** — add "Book a Consult" to the main nav, or keep it as the
   destination of the existing "Get a free diagnosis" CTA buttons?

---

## 9. Proposed phasing (build order, once approved)

- **Phase L1 — Booking live.** Cal.com setup (Guy) + `supabase/leads-crm.sql` +
  themed `/book` embed + `/api/cal/webhook` capturing bookings into `leads`/`meetings`
  + instant email to Guy. *Outcome: prospects self-schedule a Zoom consult and you're
  notified; bookings are recorded.*
- **Phase L2 — Pipeline.** `/admin/leads` list + detail, statuses, notes, activity
  timeline; unify form + booking leads; dashboard tiles. *Outcome: every lead is
  trackable end-to-end.*
- **Phase L3 — Follow-up.** `next_follow_up_at` + daily digest cron + (optional)
  branded confirmations + auto-reply. *Outcome: nothing slips through the cracks.*
- **Phase L4 — Optional.** SMS, drip sequences, lead scoring, richer analytics.

---

## 10. Rough effort (Claude-time, excluding Guy's Cal.com/Vercel setup)

| Phase | Scope | Effort |
|---|---|---|
| L1 | migration, `/book` embed, webhook, notify | ~½–1 day |
| L2 | leads list + detail + actions + statuses + activity | ~1–1.5 days |
| L3 | follow-ups, digest cron, confirmations | ~½ day |

Cost note: Cal.com free tier and a free Zoom account cover a single-calendar setup;
Resend's free tier covers this volume. No new recurring spend expected for L1–L3.
