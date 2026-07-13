"use client";

import { useRef, useState } from "react";
import { uploadImage } from "@/app/admin/actions";

/**
 * Uploads an image to the "media" bucket and stores its public URL in a hidden
 * input (so it rides along with the normal form submit). Preview uses a plain
 * <img> — these are arbitrary Supabase URLs, not next/image.
 */
export function ImageUpload({
  name,
  initialUrl = "",
  folder = "uploads",
}: {
  name: string;
  initialUrl?: string;
  folder?: string;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setBusy(true);
    setError("");
    const fd = new FormData();
    fd.set("file", file);
    fd.set("folder", folder);
    const res = await uploadImage(fd);
    setBusy(false);
    if (res.error) return setError(res.error);
    if (res.url) setUrl(res.url);
  }

  return (
    <div>
      <input type="hidden" name={name} value={url} />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      {url ? (
        <div className="flex items-start gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt=""
            className="h-24 w-32 border border-rule-strong bg-card object-cover"
          />
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="font-display text-[10px] tracking-[0.2em] text-cobalt hover:text-tincture"
            >
              REPLACE
            </button>
            <button
              type="button"
              onClick={() => setUrl("")}
              className="font-display text-[10px] tracking-[0.2em] text-ink-faint hover:text-tincture"
            >
              REMOVE
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex h-24 w-full items-center justify-center border border-dashed border-rule-strong bg-card font-display text-[11px] tracking-[0.2em] text-ink-faint hover:border-tincture hover:text-tincture disabled:opacity-60"
        >
          {busy ? "UPLOADING…" : "+ UPLOAD IMAGE"}
        </button>
      )}
      {error && <p className="mt-2 text-base text-tincture">{error}</p>}
    </div>
  );
}
