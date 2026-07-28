"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { renameMedia, updateMediaMeta, deleteMedia, type MediaItem } from "@/app/admin/actions";

const INPUT =
  "w-full border border-rule bg-paper px-2 py-1.5 text-sm text-ink focus:border-tincture focus:outline-none";

function prettySize(bytes: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
const baseOf = (name: string) => name.replace(/\.[^.]+$/, "");
const extOf = (name: string) => name.split(".").pop() ?? "";

export function MediaTile({
  item,
  category,
  copied,
  onCopy,
}: {
  item: MediaItem;
  category: string;
  copied: boolean;
  onCopy: (url: string, path: string) => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(baseOf(item.name));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function rename() {
    const clean = name.trim();
    if (!clean || clean === baseOf(item.name)) return;
    if (
      !window.confirm(
        `Rename to "${clean}.${extOf(item.name)}" and repoint every page that uses this image?\n\nThe old filename will stop working.`
      )
    )
      return;
    setBusy(true);
    setErr("");
    const fd = new FormData();
    fd.set("path", item.path);
    fd.set("name", clean);
    const res = await renameMedia(fd);
    setBusy(false);
    if (res?.error) setErr(res.error);
    else router.refresh();
  }

  return (
    <figure className="flex flex-col border border-rule bg-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.url} alt={item.alt || item.name} className="aspect-4/3 w-full border-b border-rule bg-panel object-cover" />
      <figcaption className="flex flex-1 flex-col gap-3 p-3">
        {/* Filename + rename */}
        <div>
          <div className="mb-1 font-display text-[9px] font-bold uppercase tracking-[0.15em] text-ink-faint">
            {category.toUpperCase()}
            {item.size ? ` · ${prettySize(item.size)}` : ""}
          </div>
          <div className="flex items-center gap-1">
            <input value={name} onChange={(e) => setName(e.target.value)} disabled={busy} className={INPUT} />
            <span className="shrink-0 font-display text-[11px] text-ink-faint">.{extOf(item.name)}</span>
          </div>
          <button type="button" onClick={rename} disabled={busy} className="btn btn-outline mt-1.5 !py-1 !text-[10px]">
            {busy ? "RENAMING…" : "RENAME FILE"}
          </button>
          {err && <p className="mt-1 text-[11px] leading-snug text-tincture">{err}</p>}
        </div>

        {/* Alt text — travels with the image everywhere it's placed. */}
        <form action={updateMediaMeta} className="flex flex-col gap-1.5 border-t border-rule pt-2">
          <input type="hidden" name="path" value={item.path} />
          <label className="font-display text-[9px] font-bold uppercase tracking-[0.15em] text-ink-faint">
            Alt text (SEO)
          </label>
          <input name="alt" defaultValue={item.alt} placeholder="Describe the image…" className={INPUT} />
          <button className="btn btn-outline !py-1.5 !text-[10px]">SAVE ALT</button>
        </form>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-rule pt-2">
          <button
            type="button"
            onClick={() => onCopy(item.url, item.path)}
            className="font-display text-[10px] tracking-[0.15em] text-cobalt hover:text-tincture"
          >
            {copied ? "COPIED!" : "COPY URL"}
          </button>
          <form
            action={deleteMedia}
            onSubmit={(e) => {
              if (
                !window.confirm(
                  `Delete "${item.name}" permanently?\n\nIf any portfolio or blog page is using this image, that page will lose it — this can't be undone.`
                )
              )
                e.preventDefault();
            }}
          >
            <input type="hidden" name="path" value={item.path} />
            <button className="font-display text-[10px] tracking-[0.15em] text-ink-faint hover:text-tincture">
              DELETE
            </button>
          </form>
        </div>
      </figcaption>
    </figure>
  );
}
