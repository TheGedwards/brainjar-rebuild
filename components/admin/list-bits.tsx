/** Small shared bits for the admin list tables (server-safe, no "use client"). */

export function StatusBadge({
  published,
  labels = ["PUBLISHED", "DRAFT"],
}: {
  published: boolean;
  labels?: [string, string];
}) {
  return (
    <span
      className={`inline-block border px-1.5 py-0.5 font-display text-[9px] font-bold tracking-[0.15em] ${
        published ? "border-cobalt-lt text-cobalt" : "border-rule-strong text-ink-faint"
      }`}
    >
      {published ? labels[0] : labels[1]}
    </span>
  );
}

export function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
