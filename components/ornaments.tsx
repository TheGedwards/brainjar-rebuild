/**
 * Ornaments. Every one of these is drawn, not imported — they scale, they take
 * currentColor, and they don't cost a request. Used with restraint: a swirl pair
 * flanks a section title, a lozenge divides a hero, a corner frame belongs only
 * to the hero. Anything more and the page starts to look like a wedding invite.
 */

/** The flourish that flanks a section title. Mirror it with `flip`. */
export function Swirl({ flip = false, className = "" }: { flip?: boolean; className?: string }) {
  return (
    <svg
      width="150"
      height="16"
      viewBox="0 0 150 16"
      aria-hidden="true"
      className={className}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <path
        d="M6 8 Q45 -4 75 8 Q105 20 144 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <circle cx="6" cy="8" r="2" fill="currentColor" />
      <circle cx="144" cy="8" r="2" fill="currentColor" />
    </svg>
  );
}

/** Rule — lozenge — rule. Sits between a headline and its subhead. */
export function Lozenge({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
      <div className="h-px w-16 bg-rule-strong sm:w-[70px]" />
      <div className="size-[7px] rotate-45 border-[1.5px] border-tincture" />
      <div className="h-px w-16 bg-rule-strong sm:w-[70px]" />
    </div>
  );
}

/** Section title with swirls. Collapses to just the title on small screens. */
export function SectionTitle({
  children,
  eyebrow,
}: {
  children: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="text-center">
      {eyebrow && <div className="eyebrow mb-3">{eyebrow}</div>}
      <div className="flex items-center justify-center gap-5">
        <Swirl className="hidden text-tincture sm:block" />
        <h2 className="display text-2xl text-ink sm:text-[28px]">{children}</h2>
        <Swirl flip className="hidden text-tincture sm:block" />
      </div>
    </div>
  );
}

/**
 * The hero frame: hairline box, inside it a heavy box, and four tincture
 * corners that break the rule by a pixel. This is the one place the design
 * spends its boldness.
 */
export function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[900px] border border-rule-strong p-2">
      <div className="relative bg-card px-6 py-12 sm:px-16 sm:py-14">
        <span className="absolute -left-px -top-px size-[26px] border-l-4 border-t-4 border-tincture" />
        <span className="absolute -right-px -top-px size-[26px] border-r-4 border-t-4 border-tincture" />
        <span className="absolute -bottom-px -left-px size-[26px] border-b-4 border-l-4 border-tincture" />
        <span className="absolute -bottom-px -right-px size-[26px] border-b-4 border-r-4 border-tincture" />
        {children}
      </div>
    </div>
  );
}

/** A printer's rule with a point in the middle — closes a section. */
export function PointedRule() {
  return (
    <div className="flex items-center justify-center py-2" aria-hidden="true">
      <div className="h-px flex-1 bg-rule" />
      <svg width="18" height="10" viewBox="0 0 18 10" className="text-rule-strong">
        <path d="M0 0 L9 9 L18 0" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <div className="h-px flex-1 bg-rule" />
    </div>
  );
}
