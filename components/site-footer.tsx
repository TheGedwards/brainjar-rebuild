import Link from "next/link";
import { SERVICES } from "@/lib/services";
import { PointedRule } from "./ornaments";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-rule bg-panel">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="display text-base tracking-[0.25em] text-ink">BRAINJAR MEDIA</div>
            <p className="mt-4 max-w-sm text-base italic leading-relaxed text-ink-soft">
              Two decades of remedies for recognizable brands and beloved local business alike.
              Praised in the Wall Street Journal, Barron&rsquo;s and the Portland Tribune.
            </p>
          </div>

          <div>
            <div className="eyebrow mb-4">Visit</div>
            <address className="space-y-1 text-base not-italic text-ink-soft">
              <div>109 N Main Ave #202</div>
              <div>Gresham, OR 97030</div>
              <a href="tel:+15034926500" className="mt-2 block text-tincture hover:underline">
                (503) 492-6500
              </a>
            </address>
          </div>

          <div>
            <div className="eyebrow mb-4">The Formulary</div>
            <ul className="space-y-1.5 text-base text-ink-soft">
              {SERVICES.map((s) => (
                <li key={s.slug}>
                  <Link href={`/services/${s.slug}`} className="hover:text-tincture">
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14">
          <PointedRule />
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <p className="font-display text-[11px] tracking-[0.15em] text-ink-faint">
            © {new Date().getFullYear()} BRAINJAR MEDIA · GRESHAM, OREGON
          </p>
          <nav className="flex gap-6" aria-label="Footer">
            <Link href="/work" className="font-display text-[11px] tracking-[0.15em] text-ink-faint hover:text-tincture">
              PORTFOLIO
            </Link>
            <Link href="/blog" className="font-display text-[11px] tracking-[0.15em] text-ink-faint hover:text-tincture">
              BLOG
            </Link>
            <Link href="/contact" className="font-display text-[11px] tracking-[0.15em] text-ink-faint hover:text-tincture">
              CONTACT
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
