import sanitizeHtml from "sanitize-html";

/**
 * Blog body is now rich HTML from the TipTap editor. We sanitize on save AND on
 * render (defense in depth) down to the curated tag set the editor produces —
 * anything pasted from Word beyond this is stripped. Server-only (sanitize-html
 * is a Node module); never import into a client component.
 */
export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "strong", "b", "em", "i", "u", "s",
      "h2", "h3", "ul", "ol", "li", "blockquote", "a", "img",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, target: "_blank", rel: "noopener noreferrer" },
      }),
    },
  });
}

/** True if the stored body is HTML (new posts) vs plain markdown-lite (old). */
export function isHtml(body: string): boolean {
  return /<[a-z][\s\S]*>/i.test(body);
}
