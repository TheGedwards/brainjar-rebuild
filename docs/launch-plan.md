# Go-Live Plan — brainjarmedia.com

**Status:** Draft for approval · **Date:** 2026-07-24 · **Goal:** take the current
staging site live on the custom domain, with a working (simple) contact form, DNS
moved to GoDaddy, and full SEO due diligence — *before* the lead-gen build.

## Known facts (verified 2026-07-24)
- **Registrar:** GoDaddy. **Current nameservers:** `ns202/ns203.cloudwebhosting.com`
  (the old WordPress host). Moving DNS to GoDaddy = switch nameservers back to
  GoDaddy's and manage the zone in GoDaddy.
- **Website now:** `165.140.69.213` (old host); apex + `www` are both A records to it.
- **Email:** Google Workspace (MX → `aspmx.l.google.com` et al). **Must be preserved
  exactly** through the move.
- **Canonical host:** `https://www.brainjarmedia.com` (per CLAUDE.md). Apex 301s to www.

## The two hard rules
1. **Rebuild the whole DNS zone at GoDaddy BEFORE switching nameservers.** Email has
   zero downtime only if the MX (+ SPF/DKIM/DMARC) already exist in the GoDaddy zone
   at cutover. Both the old and new zones carry the same Google MX, so mail never gaps.
2. **`NEXT_PUBLIC_SITE_URL=https://www.brainjarmedia.com` must be set in Vercel
   Production at launch.** If it still points at a `*.vercel.app` URL, the live site
   ships `noindex` and Google will deindex it. This is the single most important
   launch switch (CLAUDE.md).

---

## Phase A — Code & content pre-flight  *(Claude; no DNS needed)*
- **A1. Simple contact form.** Keep the current behavior (save to Supabase, then
  email — lossless if email fails) and **add a branded auto-reply to the submitter**.
  Net: on submit, Guy gets the lead email (Reply-To = submitter) and the submitter
  gets a short "we got it" confirmation. No CRM, no Cal.com — that's the later phase.
- **A2. 301 audit.** Pull the old WordPress site's URL inventory (its `sitemap.xml`)
  and cross-check every indexed URL against `next.config.ts`. Add any missing
  redirects. This protects 20 years of backlinks.
- **A3. Production readiness sweep:** confirm `robots.ts` + layout robots meta flip
  correctly on the production URL; `sitemap.xml` correct; canonical tags; OG image +
  favicon; 404 page; `ProfessionalService` JSON-LD NAP/phone = **(503) 929-7436**;
  `npm run build` clean.
- **A4. Decide + implement apex→www 301** (Vercel handles this once the domain's added).

## Phase B — Accounts & content prep  *(Guy; parallel with A)*
- **B1. Export the complete current DNS zone** from cloudwebhosting.com (screenshot or
  export *every* record: A, CNAME, MX, TXT/SPF/DKIM/DMARC, any subdomains). This is
  the master list we recreate at GoDaddy. **Nothing gets migrated that isn't on it.**
- **B2. Confirm Google Workspace mail records** you use (MX set, and whether SPF/DKIM/
  DMARC exist — my remote lookup came back empty, so verify in the host panel and/or
  Google Admin).
- **B3. Verify `brainjarmedia.com` in Resend** — but *enter its records into the
  GoDaddy zone in Phase C*, not the old host (we're about to leave it).

## Phase C — Build the GoDaddy zone  *(Guy + Claude, BEFORE cutover)*
- **C1.** In Vercel, add `brainjarmedia.com` + `www` to the project. Vercel shows the
  exact records (an A record for the apex, a CNAME for `www`).
- **C2.** In **GoDaddy DNS Management**, build the full zone:
  - Recreate **every** record from B1 **except** the old website A records
    (`165.140.69.213`) for apex/www.
  - Add **Vercel's** apex A + `www` CNAME (from C1).
  - Add **Resend's** DKIM/SPF/MX (from B3) and the **DMARC** TXT
    (`v=DMARC1; p=none; rua=mailto:hello@brainjarmedia.com; fo=1`).
  - Keep the **Google MX** exactly as they are. One SPF record only (merge includes).
- **C3.** In Vercel Production env, set: `NEXT_PUBLIC_SITE_URL=https://www.brainjarmedia.com`,
  Supabase URL/anon/service keys, `RESEND_API_KEY`, `CONTACT_TO_EMAIL=hello@brainjarmedia.com`.
- **C4.** (Optional) Lower TTLs on the old host a day ahead to speed any rollback.

## Phase D — Cutover  *(Guy)*
- **D1.** At GoDaddy (registrar → Nameservers), switch from the cloudwebhosting
  nameservers to **GoDaddy's** default nameservers. This activates the zone from C2.
- **D2.** Propagation is 1–48h (usually much faster). During it, some visitors hit the
  old host, some hit Vercel — both serve a working site, and email works on both
  because both zones carry the Google MX.

## Phase E — Post-cutover verification  *(Claude + Guy)*
- **E1.** `https://www.brainjarmedia.com` loads with valid SSL (Vercel auto-issues).
- **E2. 🚨 Indexability:** `/robots.txt` shows `Allow: /` (not `Disallow: /`), and
  View-Source shows **no** `noindex` robots meta. If it's `noindex`, `NEXT_PUBLIC_SITE_URL`
  is wrong — fix immediately.
- **E3.** Spot-check 301s: hit several old URLs → confirm 301 to the right new URLs.
- **E4.** Contact form end-to-end: submit → Guy receives the lead, submitter receives
  the auto-reply.
- **E5.** Send + receive a test email (Google Workspace unaffected).
- **E6.** Google Search Console: add/verify the property, submit `sitemap.xml`, request
  indexing of the home page.
- **E7.** Lighthouse / mobile pass.

## Phase F — Aftercare
- Keep the old cloudwebhosting site **up for 2–4 weeks** as a fallback; don't cancel
  hosting until Search Console is clean and traffic has fully moved.
- Then proceed to the lead-generation build on the live site.

---

## Decisions / prerequisites
- Guy has GoDaddy (registrar) login and cloudwebhosting (current DNS) access. ✓ needed.
- Keep Google Workspace as the mail host (yes).
- Canonical = `www` (yes).
- Simple contact form for launch; Cal.com/CRM comes after (yes).
