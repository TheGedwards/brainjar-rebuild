import { Fragment } from "react";

/**
 * Renders a "heading" slot: `*word*` becomes the tincture accent span, and a
 * newline becomes a <br>. Pure + client-safe. Everything else is plain text
 * (React escapes it), so editors can't inject markup.
 */
export function renderHeading(text: string): React.ReactNode {
  const lines = text.split("\n");
  return lines.map((line, li) => (
    <Fragment key={li}>
      {line.split(/(\*[^*]+\*)/g).map((part, pi) =>
        part.startsWith("*") && part.endsWith("*") && part.length > 2 ? (
          <span key={pi} className="text-tincture">
            {part.slice(1, -1)}
          </span>
        ) : (
          <Fragment key={pi}>{part}</Fragment>
        )
      )}
      {li < lines.length - 1 && <br />}
    </Fragment>
  ));
}
