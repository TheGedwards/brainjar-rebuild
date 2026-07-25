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

## Chosen path: full GoDaddy move at launch (Path 2)
GoDaddy locks its DNS zone editor while the domain points at third-party
nameservers, so we **cannot pre-stage** the zone. The editor only unlocks *after*
switching nameservers to GoDaddy. Therefore the safe procedure is **switch, then
immediately populate** — de-risked by:
- The **old zone stays intact** at cloudwebhosting, and most resolvers keep using
  the *cached* old nameservers for hours after the switch, so mail/traffic largely
  keep flowing on the old zone during the window.
- We **pre-write the complete target zone** (Claude, from Guy's export) so data entry
  is a 2–3 minute paste, not a hunt.
- We **enter MX + mail records first**, off-hours, to shrink the email window to near zero.
- **Rollback is instant:** switch nameservers back to cloudwebhosting; nothing there changed.

## The two hard rules
1. **At cutover, enter the MX + mail auth records into GoDaddy FIRST, within seconds
   of the editor unlocking**, working from the pre-written list. That's what keeps
   email from gapping, since we can't pre-stage.
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

## Phase C — Prepare everything for a fast cutover  *(Guy + Claude, no NS change yet)*
- **C1.** In Vercel, add `brainjarmedia.com` + `www` to the project. Vercel shows the
  exact records to use (apex `A` = `76.76.21.21`; `www` `CNAME` = `cname.vercel-dns.com`
  — use whatever Vercel displays).
- **C2.** Add `brainjarmedia.com` in **Resend**; note its DKIM/SPF/MX records.
- **C3.** In Vercel Production env, set: `NEXT_PUBLIC_SITE_URL=https://www.brainjarmedia.com`,
  Supabase URL/anon/service keys, `RESEND_API_KEY`, `CONTACT_TO_EMAIL=hello@brainjarmedia.com`.
  (Site is fully ready to serve before we touch DNS.)
- **C4. Claude pre-writes the complete target zone** from Guy's export (B1): every
  current record, **minus** the old website A records (`165.140.69.213`) for apex/www,
  **plus** Vercel's apex A + `www` CNAME, **plus** Resend's records + the DMARC TXT
  (`v=DMARC1; p=none; rua=mailto:hello@brainjarmedia.com; fo=1`). One SPF record only.
  Google MX carried over verbatim. This becomes the paste-in checklist for D2.
- **C5.** (Optional) Lower record TTLs at cloudwebhosting a day ahead — speeds rollback.

## Phase D — Cutover  *(Guy, off-hours)*
- **D1.** At a low-traffic time, at GoDaddy (registrar → Nameservers), switch from the
  cloudwebhosting nameservers to **GoDaddy's**. The DNS editor unlocks.
- **D2.** Immediately enter the pre-written zone (C4) into GoDaddy DNS — **MX + mail
  records first**, then Vercel A/CNAME, then TXT/Resend/DMARC, then the rest. Check
  against the list.
- **D3.** Most resolvers still use the cached old nameservers for a while, so email/traffic
  keep flowing on the intact old zone during propagation (1–48h, usually faster).
- **Rollback:** if anything's wrong, switch nameservers back to cloudwebhosting — its
  zone is unchanged.

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
