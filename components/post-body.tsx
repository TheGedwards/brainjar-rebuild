import { sanitizeRichText, isHtml } from "@/lib/sanitize";

/**
 * Renders a post body identically on the public page and in the admin draft
 * preview. New posts are sanitized HTML (TipTap); the original seed post is
 * markdown-lite (paragraphs + ## headings).
 */
export function PostBody({ body, className = "" }: { body: string; className?: string }) {
  if (isHtml(body)) {
    return (
      <div
        className={`prose-apothecary dropcap mx-auto max-w-2xl [&_blockquote]:my-6 [&_blockquote]:border-l-2 [&_blockquote]:border-tincture [&_blockquote]:pl-4 [&_blockquote]:italic [&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-lg [&_h3]:font-bold [&_h3]:uppercase [&_h3]:tracking-[0.1em] [&_img]:my-6 [&_img]:w-full [&_img]:border [&_img]:border-rule [&_li]:mb-2 [&_ol]:mb-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:mb-6 [&_ul]:list-disc [&_ul]:pl-6 ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitizeRichText(body) }}
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
