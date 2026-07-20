"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadImage, deleteMedia, type MediaItem } from "@/app/admin/actions";

function prettySize(bytes: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaLibrary({ items }: { items: MediaItem[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

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

      {items.length === 0 ? (
        <p className="mt-8 text-lg italic text-ink-faint">
          Nothing here yet. Upload an image and it&rsquo;ll appear, ready to reuse anywhere.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((m) => (
            <figure key={m.path} className="flex flex-col border border-rule bg-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.url}
                alt={m.name}
                className="aspect-4/3 w-full border-b border-rule bg-panel object-cover"
              />
              <figcaption className="flex flex-1 flex-col gap-2 p-3">
                <div className="min-w-0">
                  <div className="truncate text-sm" title={m.name}>
                    {m.name}
                  </div>
                  <div className="mt-0.5 font-display text-[9px] tracking-[0.15em] text-ink-faint">
                    {(m.folder || "root").toUpperCase()}
                    {m.size ? ` · ${prettySize(m.size)}` : ""}
                  </div>
                </div>
                <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => copy(m.url, m.path)}
                    className="font-display text-[10px] tracking-[0.15em] text-cobalt hover:text-tincture"
                  >
                    {copied === m.path ? "COPIED!" : "COPY URL"}
                  </button>
                  <form
                    action={deleteMedia}
                    onSubmit={(e) => {
                      if (
                        !window.confirm(
                          `Delete "${m.name}" permanently?\n\nIf any portfolio or blog page is using this image, that page will lose it — this can't be undone.`
                        )
                      )
                        e.preventDefault();
                    }}
                  >
                    <input type="hidden" name="path" value={m.path} />
                    <button className="font-display text-[10px] tracking-[0.15em] text-ink-faint hover:text-tincture">
                      DELETE
                    </button>
                  </form>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
