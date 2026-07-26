"use client";

import { useState } from "react";

/**
 * Publish date + time picker. The visible <input type="datetime-local"> shows the
 * admin's local (Pacific) time in hour steps; a hidden field carries the exact
 * UTC ISO timestamp that the server stores. A future value = a scheduled post.
 */
function toLocalInput(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:00`;
}

export function PublishDateField({
  name = "published_at",
  initialIso,
  className = "",
}: {
  name?: string;
  initialIso?: string | null;
  className?: string;
}) {
  const [local, setLocal] = useState(toLocalInput(initialIso));
  const iso = local ? new Date(local).toISOString() : "";
  return (
    <>
      <input
        type="datetime-local"
        step={3600}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        className={className}
      />
      <input type="hidden" name={name} value={iso} />
    </>
  );
}
