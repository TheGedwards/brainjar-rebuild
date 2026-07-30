"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createLead } from "@/app/admin/actions";
import { LeadCard } from "@/components/admin/lead-card";
import { ACTIVE_STAGES, isOpen, normalizeStatus, type Lead } from "@/lib/lead-pipeline";

export type { Lead };

const INPUT =
  "w-full border border-rule bg-paper px-3 py-2 font-body text-base text-ink focus:border-tincture focus:outline-none";

type View = "active" | "needs" | "won" | "nurture" | "closed" | "all";
const VIEWS: { key: View; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "needs", label: "Needs action" },
  { key: "won", label: "Won" },
  { key: "nurture", label: "Nurture" },
  { key: "closed", label: "Closed" },
  { key: "all", label: "All" },
];

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function inView(view: View, l: Lead, today: string): boolean {
  const s = normalizeStatus(l.status);
  switch (view) {
    case "active": return (ACTIVE_STAGES as string[]).includes(s);
    case "needs": return isOpen(s) && (!l.next_action_at || l.next_action_at <= today);
    case "won": return s === "won";
    case "nurture": return s === "nurture";
    case "closed": return ["lost", "junk", "disqualified"].includes(s);
    case "all": return true;
  }
}
/** Open leads that are due/unset sort to the top; then newest first. */
function dueRank(l: Lead, today: string): number {
  const s = normalizeStatus(l.status);
  return isOpen(s) && (!l.next_action_at || l.next_action_at <= today) ? 0 : 1;
}

export function LeadsManager({ leads }: { leads: Lead[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [view, setView] = useState<View>("active");
  const [adding, setAdding] = useState(false);
  const [addBusy, setAddBusy] = useState(false);
  const [addErr, setAddErr] = useState("");
  const today = todayStr();

  async function submitAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setAddBusy(true);
    setAddErr("");
    const res = await createLead(new FormData(form));
    setAddBusy(false);
    if (res?.error) return setAddErr(res.error);
    form.reset();
    setAdding(false);
    router.refresh();
  }

  const counts = useMemo(() => {
    const c = {} as Record<View, number>;
    for (const v of VIEWS) c[v.key] = leads.filter((l) => inView(v.key, l, today)).length;
    return c;
  }, [leads, today]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads
      .filter((l) => inView(view, l, today))
      .filter((l) =>
        !q ||
        [l.name, l.email, l.phone, l.company, l.symptom, l.message, l.notes, l.next_action]
          .filter(Boolean)
          .some((v) => (v as string).toLowerCase().includes(q))
      )
      .sort((a, b) => dueRank(a, today) - dueRank(b, today) || b.created_at.localeCompare(a.created_at));
  }, [leads, view, query, today]);

  return (
    <div>
      {/* Add a lead manually (bypasses the public contact form) */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => { setAdding((a) => !a); setAddErr(""); }}
          className={adding ? "btn btn-outline !py-2" : "btn btn-fill !py-2"}
        >
          {adding ? "CANCEL" : "+ ADD LEAD"}
        </button>
        {adding && (
          <form onSubmit={submitAdd} className="mt-3 space-y-3 border border-rule bg-card p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="name" required placeholder="Name *" className={INPUT} />
              <input name="company" placeholder="Company" className={INPUT} />
              <input name="email" type="email" placeholder="Email" className={INPUT} />
              <input name="phone" placeholder="Phone" className={INPUT} />
            </div>
            <input name="symptom" placeholder="What they need (short)" className={INPUT} />
            <textarea name="message" rows={2} placeholder="Notes / message" className={INPUT} />
            {addErr && <p className="text-base text-tincture">{addErr}</p>}
            <div className="flex items-center gap-3">
              <button disabled={addBusy} className="btn btn-fill">{addBusy ? "SAVING…" : "SAVE LEAD"}</button>
              <span className="text-[12px] italic text-ink-faint">Name required · add at least an email or phone.</span>
            </div>
          </form>
        )}
      </div>

      {/* Search */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search name, email, phone, company, message…"
        className="w-full border border-rule-strong bg-card px-3 py-2 font-body text-base text-ink focus:border-tincture focus:outline-none"
      />

      {/* Views */}
      <div className="mt-3 flex flex-wrap gap-2">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            type="button"
            onClick={() => setView(v.key)}
            aria-pressed={view === v.key}
            className={`border px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.15em] transition-colors ${
              view === v.key
                ? "border-tincture bg-tincture text-paper"
                : "border-rule-strong bg-card text-ink-soft hover:border-tincture hover:text-tincture"
            }`}
          >
            {v.label} <span className="opacity-60">{counts[v.key]}</span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="mt-4 border border-rule bg-card">
        {shown.length === 0 ? (
          <p className="px-4 py-6 text-base italic text-ink-faint">
            {leads.length === 0 ? "No leads yet." : "Nothing in this view."}
          </p>
        ) : (
          <div className="divide-y divide-rule">
            {shown.map((l) => <LeadCard key={l.id} lead={l} />)}
          </div>
        )}
      </div>
    </div>
  );
}
