"use client";

import { useRef, useState, useTransition } from "react";
import { uploadImage, saveGallery } from "@/app/admin/actions";

type Item = { url: string; alt?: string; caption?: string };

export function GalleryEditor({
  projectId,
  initial,
}: {
  projectId: string;
  initial: Item[];
}) {
  const [items, setItems] = useState<Item[]>(initial ?? []);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const dirty = () => setSaved(false);

  async function addFiles(files: FileList) {
    setBusy(true);
    dirty();
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("folder", "portfolio");
      const res = await uploadImage(fd);
      if (res.url) setItems((prev) => [...prev, { url: res.url!, alt: "", caption: "" }]);
    }
    setBusy(false);
  }

  const update = (i: number, patch: Partial<Item>) => {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
    dirty();
  };
  const remove = (i: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
    dirty();
  };
  const move = (i: number, dir: -1 | 1) => {
    setItems((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
    dirty();
  };

  const save = () =>
    startTransition(async () => {
      await saveGallery(projectId, items);
      setSaved(true);
    });

  return (
    <div className="border border-rule bg-card p-6">
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-sm font-bold uppercase tracking-[0.2em]">
          Gallery / Slideshow
        </h3>
        <span className="font-display text-[10px] tracking-[0.2em] text-ink-faint">
          {items.length} {items.length === 1 ? "IMAGE" : "IMAGES"}
        </span>
      </div>
      <p className="mt-1 text-base italic text-ink-soft">
        Uploaded images appear as a slideshow on the case-study page, in this order.
      </p>

      {items.length > 0 && (
        <ul className="mt-4 space-y-3">
          {items.map((it, i) => (
            <li key={i} className="flex gap-4 border border-rule bg-panel p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={it.url}
                alt=""
                className="h-20 w-28 flex-shrink-0 border border-rule-strong object-cover"
              />
              <div className="flex-1 space-y-2">
                <input
                  value={it.alt ?? ""}
                  onChange={(e) => update(i, { alt: e.target.value })}
                  placeholder="Alt text (for accessibility + SEO)"
                  className="w-full border border-rule-strong bg-card px-2 py-1 text-base focus:border-tincture focus:outline-none"
                />
                <input
                  value={it.caption ?? ""}
                  onChange={(e) => update(i, { caption: e.target.value })}
                  placeholder="Caption (optional, shown under the image)"
                  className="w-full border border-rule-strong bg-card px-2 py-1 text-base focus:border-tincture focus:outline-none"
                />
              </div>
              <div className="flex flex-shrink-0 flex-col items-center justify-center gap-1 font-display text-[11px] tracking-widest text-ink-faint">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="hover:text-tincture disabled:opacity-30" aria-label="Move up">
                  ↑
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="hover:text-tincture disabled:opacity-30" aria-label="Move down">
                  ↓
                </button>
                <button type="button" onClick={() => remove(i)} className="mt-1 text-[9px] hover:text-tincture" aria-label="Remove">
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="mt-4 flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="btn btn-outline disabled:opacity-60"
        >
          {busy ? "UPLOADING…" : "+ ADD IMAGES"}
        </button>
        <button type="button" onClick={save} disabled={pending} className="btn btn-fill disabled:opacity-60">
          {pending ? "SAVING…" : "SAVE GALLERY"}
        </button>
        {saved && <span className="font-display text-[10px] tracking-[0.2em] text-cobalt">SAVED ✓</span>}
      </div>
    </div>
  );
}
