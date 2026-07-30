"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { saveLeadPipeline, deleteLead } from "@/app/admin/actions";
import {
  STATUS_META,
  ACTIVE_STAGES,
  REASON_REQUIRED,
  TRIAGE_REASONS,
  LOST_REASONS,
  normalizeStatus,
  isOpen,
  type Lead,
  type LeadStatus,
} from "@/lib/lead-pipeline";

const INPUT =
  "w-full border border-rule bg-paper px-2 py-1.5 text-sm text-ink focus:border-tincture focus:outline-none";

/** Local YYYY-MM-DD for "overdue" comparison. */
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function fmtDay(s: string | null) {
  if (!s) return "";
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function daysAgo(iso: string | null): string {
  if (!iso) return "";
  const n = Math.floor((Date.now() - Date.parse(iso)) / 86400000);
  return n <= 0 ? "today" : n === 1 ? "1 day" : `${n} days`;
}

function Field({ label, children, full }: { label: string; children: ReactNode; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <dt className="font-display text-[9px] font-bold uppercase tracking-[0.15em] text-ink-faint">{label}</dt>
      <dd className="mt-0.5 text-base text-ink">{children}</dd>
    </div>
  );
}

export function LeadCard({ lead, canDelete = false }: { lead: Lead; canDelete?: boolean }) {
  const router = useRouter();
  const saved = normalizeStatus(lead.status);
  const [status, setStatus] = useState<LeadStatus>(saved);
  const [reason, setReason] = useState(lead.reason ?? "");
  const [nextAction, setNextAction] = useState(lead.next_action ?? "");
  const [nextAt, setNextAt] = useState(lead.next_action_at ?? "");
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [tried, setTried] = useState(false);

  const showReason = (REASON_REQUIRED as string[]).includes(status);
  const reasonOptions = status === "lost" ? LOST_REASONS : TRIAGE_REASONS;
  const reasonMissing = showReason && !reason;

  // Summary signals use the SAVED lead (not the in-progress edits).
  const open = isOpen(saved);
  const overdue = open && !!lead.next_action_at && lead.next_action_at < todayStr();

  async function save() {
    setTried(true);
    if (showReason && !reason) return setErr(`Pick a reason before saving as ${STATUS_META[status].label}.`);
    if (status === "nurture" && !nextAt) return setErr("Set a revisit date before saving as Nurture.");
    setBusy(true);
    setErr("");
    const fd = new FormData();
    fd.set("id", lead.id);
    fd.set("status", status);
    fd.set("reason", showReason ? reason : "");
    fd.set("next_action", nextAction);
    fd.set("next_action_at", nextAt);
    fd.set("notes", notes);
    const res = await saveLeadPipeline(fd);
    setBusy(false);
    if (res?.error) return setErr(res.error);
    router.refresh();
  }

  return (
    <details className="group">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-2.5 text-base hover:bg-panel/50 [&::-webkit-details-marker]:hidden">
        <span aria-hidden className={`size-2 shrink-0 rounded-full ${STATUS_META[saved].dot}`} />
        <span className="min-w-0 flex-1 truncate">
          <span className="text-ink">{lead.name}</span>
          {lead.company && <span className="text-ink-faint"> · {lead.company}</span>}
        </span>
        <span className={`hidden font-display text-[9px] font-bold uppercase tracking-[0.15em] sm:inline ${STATUS_META[saved].tone}`}>
          {STATUS_META[saved].label}
        </span>
        <span className="whitespace-nowrap text-sm">
          {open ? (
            overdue ? (
              <span className="font-display text-[10px] font-bold tracking-[0.1em] text-tincture">⚠ OVERDUE</span>
            ) : lead.next_action_at ? (
              <span className="text-ink-faint">{fmtDay(lead.next_action_at)}</span>
            ) : (
              <span className="text-tincture">no next step</span>
            )
          ) : (
            <span className="text-ink-faint">{daysAgo(lead.updated_at)} ago</span>
          )}
        </span>
      </summary>

      <div className="border-t border-rule bg-panel/40 px-4 py-3">
        <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
          <Field label="Email">
            {lead.email ? <a href={`mailto:${lead.email}`} className="text-cobalt hover:text-tincture">{lead.email}</a> : "—"}
          </Field>
          <Field label="Phone">
            {lead.phone ? <a href={`tel:${lead.phone}`} className="text-cobalt hover:text-tincture">{lead.phone}</a> : "—"}
          </Field>
          {lead.company && <Field label="Company">{lead.company}</Field>}
          <Field label="Received">
            {new Date(lead.created_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
          </Field>
          {lead.symptom && <Field label="What they need" full>{lead.symptom}</Field>}
          {lead.message && (
            <Field label="Message" full>
              <span className="whitespace-pre-wrap">{lead.message}</span>
            </Field>
          )}
          {lead.source_path && (
            <Field label="Source"><span className="font-mono text-[12px]">{lead.source_path}</span></Field>
          )}
        </dl>

        <p className="mt-2 font-display text-[10px] tracking-[0.12em] text-ink-faint">
          IN {STATUS_META[saved].label.toUpperCase()} FOR {daysAgo(lead.stage_changed_at) || "—"}
          {lead.updated_at ? ` · LAST TOUCHED ${daysAgo(lead.updated_at)} AGO` : ""}
        </p>

        {/* Pipeline editor */}
        <div className="mt-3 grid gap-3 border-t border-rule pt-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block font-display text-[9px] font-bold uppercase tracking-[0.15em] text-ink-faint">Stage / outcome</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as LeadStatus)} className={INPUT}>
              <optgroup label="Pipeline">
                {ACTIVE_STAGES.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
              </optgroup>
              <optgroup label="Outcome">
                <option value="won">{STATUS_META.won.label}</option>
                <option value="lost">{STATUS_META.lost.label}</option>
                <option value="nurture">{STATUS_META.nurture.label}</option>
              </optgroup>
              <optgroup label="Not a real lead">
                <option value="junk">{STATUS_META.junk.label}</option>
                <option value="disqualified">{STATUS_META.disqualified.label}</option>
              </optgroup>
            </select>
          </div>

          {showReason && (
            <div>
              <label className="mb-1 block font-display text-[9px] font-bold uppercase tracking-[0.15em] text-tincture">
                Reason — required
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className={`${INPUT} ${tried && reasonMissing ? "border-tincture ring-1 ring-tincture" : ""}`}
              >
                <option value="">— pick a reason —</option>
                {reasonOptions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              {tried && reasonMissing && (
                <p className="mt-1 text-sm text-tincture">Choose a reason to save.</p>
              )}
            </div>
          )}

          <div>
            <label className="mb-1 block font-display text-[9px] font-bold uppercase tracking-[0.15em] text-ink-faint">
              {status === "nurture" ? "Revisit — what & why" : "Next action"}
            </label>
            <input value={nextAction} onChange={(e) => setNextAction(e.target.value)} placeholder="e.g. Send proposal" className={INPUT} />
          </div>
          <div>
            <label className="mb-1 block font-display text-[9px] font-bold uppercase tracking-[0.15em] text-ink-faint">
              {status === "nurture" ? "Revisit date" : "By when"}
            </label>
            <input type="date" value={nextAt} onChange={(e) => setNextAt(e.target.value)} className={INPUT} />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block font-display text-[9px] font-bold uppercase tracking-[0.15em] text-ink-faint">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Running notes…" className={INPUT} />
          </div>
        </div>

        {err && (
          <p className="mt-3 border border-tincture bg-tincture/5 px-3 py-2 text-base text-tincture">{err}</p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button type="button" onClick={save} disabled={busy} className="btn btn-fill !py-1.5 !text-[10px]">
            {busy ? "SAVING…" : "SAVE"}
          </button>
          {lead.email && (
            <a
              href={`mailto:${lead.email}?subject=${encodeURIComponent("Re: your inquiry to Brainjar Media")}`}
              className="btn btn-outline !py-1.5 !text-[10px]"
            >
              REPLY BY EMAIL
            </a>
          )}
          {canDelete && (
            <form
              action={deleteLead}
              className="ml-auto"
              onSubmit={(e) => {
                if (
                  !window.confirm(
                    `Permanently delete "${lead.name}"? This can't be undone.\n\nFor a real lead you're not pursuing, use Disqualified or Lost instead — delete is for test rows, duplicates, or data-removal requests.`
                  )
                )
                  e.preventDefault();
              }}
            >
              <input type="hidden" name="id" value={lead.id} />
              <button className="font-display text-[10px] tracking-[0.15em] text-ink-faint hover:text-tincture">
                DELETE LEAD
              </button>
            </form>
          )}
        </div>
      </div>
    </details>
  );
}
