# GoDaddy target zone — brainjarmedia.com

The exact records to create in GoDaddy DNS at cutover (Phase D). Built from the
cloudwebhosting export (2026-07-24). Two values are pending — Vercel's and
Resend's — marked `⧗`. Enter in the order shown (**MX/mail first** for email safety).

GoDaddy naming: apex = `@`; subdomains are entered **without** the domain
(`www`, `_dmarc`, `google._domainkey`, `send`, `resend._domainkey`).

---

## KEEP — Google Workspace mail (recreate verbatim)

| Type | Host (Name) | Value / Points to | Priority | TTL |
|---|---|---|---|---|
| MX | `@` | `aspmx.l.google.com` | 1 | 1 hr |
| MX | `@` | `alt1.aspmx.l.google.com` | 5 | 1 hr |
| MX | `@` | `alt2.aspmx.l.google.com` | 5 | 1 hr |
| MX | `@` | `alt3.aspmx.l.google.com` | 10 | 1 hr |
| MX | `@` | `alt4.aspmx.l.google.com` | 10 | 1 hr |
| TXT | `google._domainkey` | `v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCRKqJBghZY5YDAaRlz4UwDH72FtlOphaSaf08ltqTLUAhR4fb2aQfaQxMKTX6lW4+b/tt/lgd4QgAl/AXe5SPoymIJTwvLHpwf3CY16G7YAS8B/YcgVlw+0MTPisQ9ydHo0v93AoCzRkAs+vmghCtedZtChFq/RyJ/cDp+a+H1OQIDAQAB` | — | 1 hr |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:hello@brainjarmedia.com; fo=1` | — | 1 hr |

*(DKIM value copied verbatim from your export. DMARC enhanced with a `rua` so you
receive reports — still `p=none` monitoring mode.)*

## REPLACE — website + sending SPF (new values, not the old ones)

| Type | Host | Value | TTL | Was |
|---|---|---|---|---|
| A | `@` | `216.150.1.1` (Vercel — confirmed) | 10 min | `165.140.69.213` (old host) |
| CNAME | `www` | `5bc3be518e9e6334.vercel-dns-016.com` (Vercel — confirmed; **omit trailing dot** in GoDaddy) | 10 min | `→ brainjarmedia.com` |
| TXT | `@` | `v=spf1 include:_spf.google.com ~all` | 1 hr | old cloudwebhosting SPF |

*SPF rewrite: the old record authorized the old host (`ip4:165.140.69.202`,
`_spf.cloudwebhosting.com`) — obsolete. Google Workspace only now. Resend's SPF lives
on the `send` subdomain below, so the root SPF stays Google-only. **One SPF record only.***

## ADD — Resend (sending) — confirmed from the Resend dashboard

| Type | Host | Value | Priority |
|---|---|---|---|
| TXT | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC03zDKDWPDZ27XF8LYtlJbE2lhmPyqTR+Pet/7i7hsNzkIY6KTZb4aY/i9IboXoHaU7Xsoi373SDfl7FjagqTWH/p0edI9mtw5J36OBg4h/+pyzTCv341EcNs2RD3qvycr+qvPqbKDQDtU/XX49dNDEke1zrrtGHfqw9DVTBtzQQIDAQAB` | — |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` | — |
| MX | `send` | `feedback-smtp.us-east-1.amazonses.com` | 10 |

*Paste the DKIM value verbatim (it's long — GoDaddy will accept it). The `send`
subdomain keeps Resend's SPF/return-path separate from the root Google SPF.*

---

## DROP — do NOT recreate (cPanel / old-host artifacts)

All of these are tied to the cPanel host or its mail server and are obsolete on
Vercel + Google Workspace:

- `mail` CNAME (old cPanel webmail; use Gmail — optional to recreate later as a Google URL)
- `ftp`, `cpanel`, `webdisk`, `cpcontacts`, `webmail`, `whm`, `cpcalendars` (A → old host)
- `autodiscover`, `autoconfig` (A → old host)
- `_cpanel-dcv-test-record` TXT (cPanel domain-validation)
- `_acme-challenge` TXT (old host's SSL validation; Vercel issues its own certs)
- `_autodiscover._tcp` SRV (→ cPanel), `_carddav`/`_carddavs`/`_caldav`/`_caldavs`
  `_tcp` SRV + their `path=/` TXTs (cPanel contacts/calendar autodiscovery)
- `_mailchannels` TXT (`v=mc1 auth=namehero` — old host's outbound relay)

*If any desktop mail client relied on the cPanel autodiscover records, reconfigure it
with Google Workspace IMAP/SMTP settings instead — those records pointed at the wrong
server for Workspace anyway.*

---

## Cutover paste order (Phase D2)
1. The **5 MX** records (Google).
2. `google._domainkey` TXT (DKIM), then `_dmarc` TXT.
3. Root `@` SPF TXT.
4. Apex `@` A (Vercel), then `www` CNAME (Vercel).
5. Resend's `resend._domainkey`, `send` SPF, `send` MX.
6. **Delete** any default parking `A`/`CNAME`/junk GoDaddy auto-creates. Leave GoDaddy's
   own NS + SOA records alone.

Then verify: email send/receive, `https://www.brainjarmedia.com` + SSL, `/robots.txt`
= allow with no `noindex`, 301 spot-checks, contact form.
