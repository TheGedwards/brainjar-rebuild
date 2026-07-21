import Link from "next/link";
import { Swirl } from "./ornaments";
import { BrandMark } from "./brand-mark";

/**
 * Full-bleed call-to-action band that closes the service pages. Cobalt ground
 * with cream type — the closest on-brand echo of the old site's blue contact
 * footer, rebuilt in the apothecary system (tokens only, no new colors).
 *
 * The centered "artwork placeholder" stands in for the bottle/jar art the
 * client is providing later — swap the placeholder block for an <Image> then.
 *
 * NAP is the canonical (503) 929-7436 — NOT the dead (503) 492-6500 that still
 * appears on the old footer. See CLAUDE.md "Contact info — canonical".
 *
 * Social links have no destinations yet; they render as non-navigating
 * placeholders until the client supplies real URLs (Facebook / Instagram /
 * YouTube). Give each an href and they become real links.
 */

type Social = { label: string; href: string | null; icon: React.ReactNode };

const SOCIAL: Social[] = [
  { label: "Facebook", href: null, icon: <FacebookIcon /> },
  { label: "Instagram", href: null, icon: <InstagramIcon /> },
  { label: "YouTube", href: null, icon: <YouTubeIcon /> },
];

export function ServiceCTA() {
  return (
    // -mb-20 cancels the site footer's mt-20 so this band sits flush against
    // the footer with no paper gap. Coupled to SiteFooter's top margin — keep
    // in sync if that changes.
    <section className="-mb-20 bg-cobalt px-6 py-16 text-center text-paper">
      <div className="mx-auto flex max-w-3xl flex-col items-center">
        {/* Flourish + the animated brain-in-jar mark, in the blue art set. */}
        <div className="flex w-full items-center justify-center gap-4">
          <Swirl className="hidden text-cobalt-lt sm:block" />
          <BrandMark width={110} jarSrc="/assets/jar-blue.png" brainSrc="/assets/BRAIN-BLUE.png" />
          <Swirl flip className="hidden text-cobalt-lt sm:block" />
        </div>

        <h2 className="display mt-8 text-4xl">Ready to fill the prescription?</h2>

        <p className="prose-apothecary mt-4 max-w-xl text-paper/90">
          Book a free diagnosis and we&rsquo;ll tell you exactly what your digital presence needs
          &mdash; no obligation, and no jargon to decode.
        </p>

        <Link
          href="/contact"
          className="btn mt-8 bg-paper text-ink hover:bg-ink hover:text-paper"
        >
          GET A FREE DIAGNOSIS
        </Link>

        {/* Canonical NAP — must match CLAUDE.md exactly. */}
        <address className="mt-8 not-italic">
          <div className="font-display text-xs uppercase tracking-[0.2em] text-cobalt-lt">
            Contact Us
          </div>
          <div className="mt-2 text-base leading-8 text-paper/90">
            109 N Main Ave #202, Gresham, OR 97030
          </div>
          <a
            href="tel:+15039297436"
            className="text-base font-semibold leading-8 text-paper hover:underline"
          >
            (503) 929-7436
          </a>
        </address>

        {/* Social placeholders — real hrefs land later. */}
        <ul className="mt-8 flex items-center justify-center gap-4">
          {SOCIAL.map((s) =>
            s.href ? (
              <li key={s.label}>
                <a
                  href={s.href}
                  aria-label={s.label}
                  className="block text-paper/80 transition-colors hover:text-paper"
                >
                  {s.icon}
                </a>
              </li>
            ) : (
              <li key={s.label}>
                <span
                  aria-label={`${s.label} (link coming soon)`}
                  title={`${s.label} — link coming soon`}
                  className="block text-paper/50"
                >
                  {s.icon}
                </span>
              </li>
            )
          )}
        </ul>
      </div>
    </section>
  );
}

/* Phosphor Icons, "light" weight (MIT). Inlined so they take currentColor and
   cost no request. viewBox 0 0 256 256. */

function FacebookIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 256 256" aria-hidden="true" fill="none">
      <circle
        cx="128"
        cy="128"
        r="96"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="12"
      />
      <path
        d="M168,88H152a24,24,0,0,0-24,24V224"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="12"
      />
      <line
        x1="96"
        y1="144"
        x2="160"
        y2="144"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="12"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 256 256" aria-hidden="true" fill="none">
      <circle
        cx="128"
        cy="128"
        r="40"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="12"
      />
      <rect
        x="32"
        y="32"
        width="192"
        height="192"
        rx="48"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="12"
      />
      <circle cx="180" cy="76" r="10" fill="currentColor" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 256 256" aria-hidden="true" fill="none">
      <polygon
        points="160 128 112 96 112 160 160 128"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="12"
      />
      <path
        d="M24,128c0,29.91,3.07,47.45,5.41,56.47A16,16,0,0,0,39,195.42C72.52,208.35,128,208,128,208s55.48.35,89-12.58a16,16,0,0,0,9.63-10.95c2.34-9,5.41-26.56,5.41-56.47s-3.07-47.45-5.41-56.47a16,16,0,0,0-9.63-11C183.48,47.65,128,48,128,48s-55.48-.35-89,12.58a16,16,0,0,0-9.63,11C27.07,80.54,24,98.09,24,128Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="12"
      />
    </svg>
  );
}
