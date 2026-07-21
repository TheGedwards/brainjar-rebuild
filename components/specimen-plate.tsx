import Image from "next/image";

/** First letters of up to two words — the no-image fallback. */
function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * The framed "Fig. 1" specimen plate — a case study's hero image (or an
 * initials fallback), with corner ticks and a caption. Shared by the portfolio
 * detail page and the home featured card so they look identical. `children`
 * render inside the frame beneath the caption (e.g. the measurements block).
 */
export function SpecimenPlate({
  src,
  name,
  host,
  figNo = "Fig. 1",
  priority = false,
  sizes = "(max-width: 768px) 100vw, 520px",
  children,
}: {
  src?: string | null;
  name: string;
  host?: string | null;
  figNo?: string;
  priority?: boolean;
  sizes?: string;
  children?: React.ReactNode;
}) {
  return (
    <figure className="relative border border-rule-strong bg-card p-2.5">
      <span aria-hidden className="pointer-events-none absolute left-1 top-1 h-3 w-3 border-l-2 border-t-2 border-ink/50" />
      <span aria-hidden className="pointer-events-none absolute right-1 top-1 h-3 w-3 border-r-2 border-t-2 border-ink/50" />
      <span aria-hidden className="pointer-events-none absolute bottom-1 left-1 h-3 w-3 border-b-2 border-l-2 border-ink/50" />
      <span aria-hidden className="pointer-events-none absolute bottom-1 right-1 h-3 w-3 border-b-2 border-r-2 border-ink/50" />

      {src ? (
        <div className="relative aspect-16/10 border border-rule">
          <Image src={src} alt={name} fill sizes={sizes} priority={priority} className="object-cover" />
        </div>
      ) : (
        <div className="flex aspect-16/10 items-center justify-center border border-rule bg-panel">
          <span className="display text-5xl text-rule-strong">{initials(name)}</span>
        </div>
      )}

      {/* Caption falls back to the client name when there's no website host.
          Serif italic, lowercase, in the darker ink-soft — like a plate caption. */}
      <figcaption className="mt-3 text-center font-body text-sm italic lowercase text-ink-soft">
        {figNo} — {host || name}
      </figcaption>

      {children}
    </figure>
  );
}
