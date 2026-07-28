"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadImage, type MediaItem } from "@/app/admin/actions";
import { MediaTile } from "@/components/admin/media-tile";

type Cat = "all" | "pages" | "portfolio" | "blog";
/** Storage folder -> filter category. Everything that isn't portfolio/blog is a "page" image. */
const catOf = (folder: string): Exclude<Cat, "all"> =>
  folder === "portfolio" ? "portfolio" : folder === "blog" ? "blog" : "pages";
const FILTERS: { key: Cat; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pages", label: "Pages" },
  { key: "portfolio", label: "Portfolio" },
  { key: "blog", label: "Blog" },
];

export function MediaLibrary({ items }: { items: MediaItem[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [cat, setCat] = useState<Cat>("all");

  const shown = useMemo(() => (cat === "all" ? items : items.filter((m) => catOf(m.folder) === cat)), [items, cat]);
  const count = (c: Cat) => (c === "all" ? items.length : items.filter((m) => catOf(m.folder) === c).length);

  async function handleFiles(files: FileList) {
    setBusy(true);
    setError("");
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("folder", "uploads");
      const res = await uploadImage(fd);
      if (res.error) {
        setError(`${file.name}: ${res.error}`);
        break;
      }
    }
    setBusy(false);
    router.refresh();
  }

  async function copy(url: string, path: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(path);
      setTimeout(() => setCopied((c) => (c === path ? null : c)), 1500);
    } catch {
      setError("Couldn't copy — select the URL and copy manually.");
    }
  }

  return (
    <div>
      {/* Upload dropzone */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="flex h-24 w-full items-center justify-center border border-dashed border-rule-strong bg-card font-display text-[11px] tracking-[0.2em] text-ink-faint hover:border-tincture hover:text-tincture disabled:opacity-60"
      >
        {busy ? "UPLOADING…" : "+ UPLOAD IMAGES"}
      </button>
      {error && <p className="mt-2 text-base text-tincture">{error}</p>}

      {/* Category filter */}
      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setCat(f.key)}
            aria-pressed={cat === f.key}
            className={`border px-4 py-2 font-display text-[11px] font-bold tracking-[0.18em] transition-colors ${
              cat === f.key
                ? "border-tincture bg-tincture text-paper"
                : "border-rule-strong bg-card text-ink-soft hover:border-tincture hover:text-tincture"
            }`}
          >
            {f.label.toUpperCase()} <span className="opacity-60">{count(f.key)}</span>
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="mt-8 text-lg italic text-ink-faint">
          {items.length === 0
            ? "Nothing here yet. Upload an image and it’ll appear, ready to reuse anywhere."
            : "No images in this category yet."}
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((m) => (
            <MediaTile
              key={m.path}
              item={m}
              category={catOf(m.folder)}
              copied={copied === m.path}
              onCopy={copy}
            />
          ))}
        </div>
      )}
    </div>
  );
}
