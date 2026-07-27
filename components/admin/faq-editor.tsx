"use client";

import { useState } from "react";
import { parseFaq, serializeFaq, type FaqItem } from "@/lib/faq";
import { field, linkMuted } from "@/components/admin/ui";

/**
 * Repeatable question/answer editor. Manages rows in state and mirrors them into
 * a hidden input as a JSON string, so the existing savePage action stores it
 * like any other slot — no server-side changes needed.
 */
export function FaqEditor({ name, initial }: { name: string; initial?: string }) {
  const [items, setItems] = useState<FaqItem[]>(() => parseFaq(initial));

  const patch = (i: number, p: Partial<FaqItem>) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...p } : it)));
  const add = () => setItems((prev) => [...prev, { q: "", a: "" }]);
  const remove = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) =>
    setItems((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = prev.slice();
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  return (
    <div className="space-y-4">
      <input type="hidden" name={name} value={serializeFaq(items)} />

      {items.length === 0 && (
        <p className="text-base italic text-ink-faint">
          No questions yet. Add a few common questions and plain-English answers —
          they show as an accordion on the page and are eligible for Google&rsquo;s
          FAQ rich result.
        </p>
      )}

      {items.map((it, i) => (
        <div key={i} className="border border-rule bg-paper p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="eyebrow">Q{i + 1}</span>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className={`${linkMuted} disabled:opacity-30`}>
                ↑
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className={`${linkMuted} disabled:opacity-30`}>
                ↓
              </button>
              <button type="button" onClick={() => remove(i)} className="font-display text-[10px] tracking-[0.2em] text-tincture hover:text-tincture-dk">
                REMOVE
              </button>
            </div>
          </div>
          <input
            value={it.q}
            onChange={(e) => patch(i, { q: e.target.value })}
            placeholder="Question"
            className={`${field} mb-2`}
          />
          <textarea
            value={it.a}
            onChange={(e) => patch(i, { a: e.target.value })}
            placeholder="Answer (a blank line starts a new paragraph)"
            rows={3}
            className={field}
          />
        </div>
      ))}

      <button type="button" onClick={add} className="btn btn-outline !py-2.5">
        + ADD QUESTION
      </button>
    </div>
  );
}
