"use client";

import { useEffect, useRef, useState } from "react";
import { uploadImage, listMedia, type MediaItem } from "@/app/admin/actions";

/**
 * Hero image field for the portfolio editor. Large (up to 960px) preview with a
 * hover pill overlay: Replace (repeat) and Delete (trash). Replace opens a modal
 * offering either an upload OR a pick from the media library. The chosen URL
 * rides along in a hidden input so it submits with the normal form.
 */
export function HeroImageField({ name, initialUrl = "" }: { name: string; initialUrl?: string }) {
  const [url, setUrl] = useState(initialUrl);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function openPicker() {
    setError("");
    setOpen(true);
    if (items === null) {
      try {
        setItems(await listMedia());
      } catch {
        setItems([]);
      }
    }
  }

  async function onFile(file: File) {
    setBusy(true);
    setError("");
    const fd = new FormData();
    fd.set("file", file);
    fd.set("folder", "portfolio");
    const res = await uploadImage(fd);
    setBusy(false);
    if (res.error) return setError(res.error);
    if (res.url) {
      setUrl(res.url);
      setOpen(false);
    }
  }

  // Close the modal on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div>
      <input type="hidden" name={name} value={url} />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />

      {url ? (
        <div className="group relative w-full max-w-[960px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt=""
            className="aspect-16/10 w-full border border-rule-strong bg-panel object-cover"
          />
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-white/20 bg-ink/80 p-1 backdrop-blur">
            <PillButton label="Replace" onClick={openPicker}>
              <IconReplace />
            </PillButton>
            <PillButton label="Delete" onClick={() => setUrl("")}>
              <IconTrash />
            </PillButton>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openPicker}
          className="flex aspect-16/10 w-full max-w-[960px] flex-col items-center justify-center gap-2 border border-dashed border-rule-strong bg-card text-ink-faint hover:border-tincture hover:text-tincture"
        >
          <IconReplace />
          <span className="font-display text-[11px] tracking-[0.2em]">ADD HERO IMAGE</span>
          <span className="text-sm italic">no image → the plate shows the client&rsquo;s initials</span>
        </button>
      )}
      {error && <p className="mt-2 text-base text-tincture">{error}</p>}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="flex max-h-[85vh] w-full max-w-3xl flex-col border border-rule-strong bg-paper">
            <div className="flex items-center justify-between border-b border-rule px-6 py-4">
              <h2 className="display text-lg">Choose a hero image</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="font-display text-[11px] tracking-[0.2em] text-ink-faint hover:text-tincture"
              >
                CLOSE ✕
              </button>
            </div>

            <div className="overflow-y-auto p-6">
              {/* Upload */}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={busy}
                className="flex h-20 w-full items-center justify-center border border-dashed border-rule-strong bg-card font-display text-[11px] tracking-[0.2em] text-ink-faint hover:border-tincture hover:text-tincture disabled:opacity-60"
              >
                {busy ? "UPLOADING…" : "+ UPLOAD FROM YOUR COMPUTER"}
              </button>

              {/* Library */}
              <div className="mt-6 flex items-center gap-3">
                <span className="font-display text-[10px] tracking-[0.2em] text-ink-faint">
                  OR CHOOSE FROM THE LIBRARY
                </span>
                <span className="h-px flex-1 bg-rule" />
              </div>

              {items === null ? (
                <p className="mt-4 text-base italic text-ink-faint">Loading the library…</p>
              ) : items.length === 0 ? (
                <p className="mt-4 text-base italic text-ink-faint">
                  The library is empty — upload an image above.
                </p>
              ) : (
                <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {items.map((m) => (
                    <button
                      key={m.path}
                      type="button"
                      title={m.name}
                      onClick={() => {
                        setUrl(m.url);
                        setOpen(false);
                      }}
                      className="group/lib overflow-hidden border border-rule bg-card hover:border-tincture"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.url}
                        alt={m.name}
                        className="aspect-4/3 w-full bg-panel object-cover"
                      />
                      <div className="truncate px-2 py-1 text-left font-display text-[9px] tracking-[0.1em] text-ink-faint">
                        {(m.folder || "root").toUpperCase()}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PillButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="group/btn relative flex size-8 items-center justify-center rounded-full text-paper/90 transition-colors hover:bg-white/15 hover:text-paper"
    >
      {children}
      <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-ink px-2 py-1 font-display text-[9px] tracking-[0.15em] text-paper opacity-0 transition-opacity group-hover/btn:opacity-100">
        {label.toUpperCase()}
      </span>
    </button>
  );
}

function IconReplace() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 2l4 4-4 4" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <path d="M7 22l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}
