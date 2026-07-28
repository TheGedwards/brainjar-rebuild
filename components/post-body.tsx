import { sanitizeRichText, isHtml } from "@/lib/sanitize";

/** Storage path from a public media URL — kept local so this stays a pure module. */
function pathFromUrl(url: string): string | null {
  const i = url.indexOf("/media/");
  return i >= 0 ? url.slice(i + 7).split("?")[0] : null;
}
function escAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
/** Inject stored alt onto inline <img> tags so it's live everywhere the image is used. */
function applyImgAlt(html: string, altMap: Record<string, string>): string {
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    const src = tag.match(/src=["']([^"']+)["']/i)?.[1];
    const path = src ? pathFromUrl(src) : null;
    const alt = path ? altMap[path] : undefined;
    if (!alt) return tag;
    const a = ` alt="${escAttr(alt)}"`;
    return /\salt=["'][^"']*["']/i.test(tag)
      ? tag.replace(/\salt=["'][^"']*["']/i, a)
      : tag.replace(/<img\b/i, `<img${a}`);
  });
}

/**
 * Renders a post body identically on the public page and in the admin draft
 * preview. New posts are sanitized HTML (TipTap); the original seed post is
 * markdown-lite (paragraphs + ## headings). Pass `altMap` to apply stored alt
 * text to inline images (public page); omit it in the admin preview.
 */
export function PostBody({
  body,
  className = "",
  altMap,
}: {
  body: string;
  className?: string;
  altMap?: Record<string, string>;
}) {
  if (isHtml(body)) {
    let html = sanitizeRichText(body);
    if (altMap) html = applyImgAlt(html, altMap);
    return (
      <div
        className={`prose-apothecary dropcap mx-auto max-w-2xl [&_blockquote]:my-6 [&_blockquote]:border-l-2 [&_blockquote]:border-tincture [&_blockquote]:pl-4 [&_blockquote]:italic [&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-lg [&_h3]:font-bold [&_h3]:uppercase [&_h3]:tracking-[0.1em] [&_img]:my-6 [&_img]:w-full [&_img]:border [&_img]:border-rule [&_li]:mb-2 [&_ol]:mb-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:mb-6 [&_ul]:list-disc [&_ul]:pl-6 ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
  return (
    <div className={`prose-apothecary dropcap mx-auto max-w-2xl ${className}`}>
      {body.split("\n\n").map((block, i) =>
        block.startsWith("## ") ? <h2 key={i}>{block.slice(3)}</h2> : <p key={i}>{block}</p>
      )}
    </div>
  );
}
