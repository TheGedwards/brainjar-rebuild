"use client";

import { useState } from "react";
import { field, label } from "@/components/admin/ui";

/**
 * SEO title/description inputs with a live Google-result preview and length
 * counters. Values fall back to the page's own defaults when left blank, so the
 * preview shows the fallback in muted text.
 */
export function SeoFields({
  initialTitle,
  initialDescription,
  fallbackTitle,
  fallbackDescription,
  displayUrl,
}: {
  initialTitle: string;
  initialDescription: string;
  fallbackTitle: string;
  fallbackDescription: string;
  displayUrl: string;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [desc, setDesc] = useState(initialDescription);

  const shownTitle = title.trim() || fallbackTitle;
  const shownDesc = desc.trim() || fallbackDescription;

  const counter = (len: number, ideal: number) => (
    <span className={len > ideal ? "text-tincture" : "text-ink-faint"}>
      {len}/{ideal}
    </span>
  );

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-baseline justify-between">
          <label className={label}>SEO title</label>
          <span className="font-display text-[10px] tracking-widest">{counter(title.length, 60)}</span>
        </div>
        <input
          name="seo_title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={fallbackTitle}
          className={field}
        />
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <label className={label}>SEO description</label>
          <span className="font-display text-[10px] tracking-widest">{counter(desc.length, 155)}</span>
        </div>
        <textarea
          name="seo_description"
          rows={2}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder={fallbackDescription}
          className={field}
        />
      </div>

      {/* Google-result preview */}
      <div className="border border-rule bg-panel p-4">
        <div className="font-display text-[9px] uppercase tracking-[0.2em] text-ink-faint">
          Search preview
        </div>
        <div className="mt-3 max-w-xl">
          <div className="text-[13px] text-cobalt">{displayUrl}</div>
          <div className="mt-0.5 truncate text-lg text-tincture-dk">{shownTitle}</div>
          <div className="mt-0.5 line-clamp-2 text-base text-ink-soft">{shownDesc}</div>
        </div>
      </div>
    </div>
  );
}
