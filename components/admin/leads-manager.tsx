"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { updateLeadStatus } from "@/app/admin/actions";

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  symptom: string | null;
  message: string | null;
  source_path: string | null;
  emailed_at: string | null;
  created_at: string;
  status: string | null;
};

const STATES = ["new", "contacted", "handled", "archived"] as const;
type State = (typeof STATES)[number];
const META: Record<State, { label: string; tone: string; dot: string }> = {
  new: { label: "New", tone: "text-tincture", dot: "bg-tincture" },
  contacted: { label: "Contacted", tone: "text-cobalt", dot: "bg-cobalt" },
  handled: { label: "Handled", tone: "text-ink", dot: "bg-ink" },
  archived: { label: "Archived", tone: "text-ink-faint", dot: "bg-ink-faint" },
};
const norm = (s: string | null): State => (STATES.includes((s ?? "new") as State) ? (s as State) : "new");

const SELECT =
  "border border-rule bg-paper px-2 py-1.5 font-display text-[11px] font-bold uppercase tracking-[0.1em] text-ink focus:border-tincture focus:outline-none";

function Field({ label, children, full }: { label: string; children: ReactNode; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <dt className="font-display text-[9px] font-bold uppercase tracking-[0.15em] text-ink-faint">{label}</dt>
      <dd className="mt-0.5 text-base text-ink">{children}</dd>
    </div>
  );
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function LeadsManager({ leads }: { leads: Lead[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | State>("all");
  const [savingId, setSavingId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: leads.length, new: 0, contacted: 0, handled: 0, archived: 0 };
    for (const l of leads) c[norm(l.status)]++;
    return c;
  }, [leads]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((l) => {
      if (filter !== "all" && norm(l.status) !== filter) return false;
      if (!q) return true;
      return [l.name, l.email, l.phone, l.company, l.symptom, l.message]
        .filter(Boolean)
        .some((v) => (v as string).toLowerCase().includes(q));
    });
  }, [leads, query, filter]);

  async function changeStatus(id: string, status: string) {
    setSavingId(id);
    const fd = new FormData();
    fd.set("id", id);
    fd.set("status", status);
    await updateLeadStatus(fd);
    setSavingId(null);
    router.refresh();
  }

  const FILTERS: ("all" | State)[] = ["all", ...STATES];

  return (
    <div>
      {/* Search + status filter */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search name, email, phone, company, or message…"
        className="w-full border border-rule-strong bg-card px-3 py-2 font-body text-base text-ink focus:border-tincture focus:outline-none"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`border px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.15em] transition-colors ${
              filter === f
                ? "border-tincture bg-tincture text-paper"
                : "border-rule-strong bg-card text-ink-soft hover:border-tincture hover:text-tincture"
            }`}
          >
            {f === "all" ? "All" : META[f].label} <span className="opacity-60">{counts[f]}</span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="mt-4 border border-rule bg-card">
        {shown.length === 0 ? (
          <p className="px-4 py-6 text-base italic text-ink-faint">
            {leads.length === 0 ? "No leads yet." : "No leads match this search/filter."}
          </p>
        ) : (
          <div className="divide-y divide-rule">
            {shown.map((l) => {
              const st = norm(l.status);
              return (
                <details key={l.id} className="group">
                  <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-2.5 text-base hover:bg-panel/50 [&::-webkit-details-marker]:hidden">
                    <span aria-hidden className={`size-2 shrink-0 rounded-full ${META[st].dot}`} />
                    <span className="min-w-0 flex-1 truncate">
                      <span className="text-ink">{l.name}</span>
                      {l.symptom && <span className="ml-2 italic text-ink-soft">{l.symptom}</span>}
                    </span>
                    <span className={`hidden font-display text-[9px] font-bold uppercase tracking-[0.15em] sm:inline ${META[st].tone}`}>
                      {META[st].label}
                    </span>
                    <span className="whitespace-nowrap text-sm text-ink-faint">{fmtDate(l.created_at)}</span>
                  </summary>

                  <div className="border-t border-rule bg-panel/40 px-4 py-3">
                    <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                      <Field label="Email">
                        <a href={`mailto:${l.email}`} className="text-cobalt hover:text-tincture">{l.email}</a>
                      </Field>
                      <Field label="Phone">
                        {l.phone ? <a href={`tel:${l.phone}`} className="text-cobalt hover:text-tincture">{l.phone}</a> : "—"}
                      </Field>
                      {l.company && <Field label="Company">{l.company}</Field>}
                      <Field label="Received">
                        {new Date(l.created_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                      </Field>
                      {l.symptom && <Field label="Symptom" full>{l.symptom}</Field>}
                      {l.message && (
                        <Field label="Message" full>
                          <span className="whitespace-pre-wrap">{l.message}</span>
                        </Field>
                      )}
                      {l.source_path && (
                        <Field label="Submitted from">
                          <span className="font-mono text-[12px]">{l.source_path}</span>
                        </Field>
                      )}
                      <Field label="Email notification">
                        {l.emailed_at ? `Sent ${fmtDate(l.emailed_at)}` : "Not sent"}
                      </Field>
                    </dl>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <label className="font-display text-[9px] font-bold uppercase tracking-[0.15em] text-ink-faint">
                        Status
                      </label>
                      <select
                        value={st}
                        disabled={savingId === l.id}
                        onChange={(e) => changeStatus(l.id, e.target.value)}
                        className={SELECT}
                      >
                        {STATES.map((s) => (
                          <option key={s} value={s}>{META[s].label}</option>
                        ))}
                      </select>
                      <a
                        href={`mailto:${l.email}?subject=${encodeURIComponent("Re: your inquiry to Brainjar Media")}`}
                        className="btn btn-outline !py-1.5 !text-[10px]"
                      >
                        REPLY BY EMAIL
                      </a>
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
