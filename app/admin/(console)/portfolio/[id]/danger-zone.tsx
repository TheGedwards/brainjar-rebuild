"use client";

import { archiveClient, deleteClient } from "@/app/admin/actions";

/**
 * Archive vs delete. Archive just unpublishes (keeps the /work/[slug] URL alive
 * so old backlinks/redirects don't 404). Delete is permanent and cascades to the
 * project + stats — hence the typed-name confirm and the SEO warning.
 */
export function DangerZone({
  clientId,
  name,
  slug,
  isPublished,
}: {
  clientId: string;
  name: string;
  slug: string;
  isPublished: boolean;
}) {
  return (
    <div className="border border-tincture/40 bg-tincture-lt/20 p-6">
      <h3 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-tincture">
        Danger Zone
      </h3>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-md">
          <div className="text-base font-semibold">Archive this client</div>
          <p className="mt-1 text-base italic text-ink-soft">
            Hides it from the public site but keeps <code>/work/{slug}</code> reachable, so
            existing links and redirects don&rsquo;t break.
          </p>
        </div>
        {isPublished ? (
          <form action={archiveClient}>
            <input type="hidden" name="client_id" value={clientId} />
            <button className="btn btn-outline whitespace-nowrap">ARCHIVE</button>
          </form>
        ) : (
          <span className="whitespace-nowrap font-display text-[11px] tracking-[0.2em] text-ink-faint">
            ALREADY ARCHIVED
          </span>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-4 border-t border-tincture/30 pt-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-md">
          <div className="text-base font-semibold text-tincture">Delete permanently</div>
          <p className="mt-1 text-base italic text-ink-soft">
            Removes the client, its <code>/work/{slug}</code> page, and all stats for good.
            The old <code>/portfolio-{slug}</code> backlink will then 404. Prefer Archive unless
            you&rsquo;re sure.
          </p>
        </div>
        <form
          action={deleteClient}
          onSubmit={(e) => {
            const typed = window.prompt(
              `This permanently deletes "${name}" and its /work/${slug} page.\n\nType the slug "${slug}" to confirm:`
            );
            if (typed !== slug) {
              e.preventDefault();
            }
          }}
        >
          <input type="hidden" name="client_id" value={clientId} />
          <button className="btn btn-fill whitespace-nowrap">DELETE</button>
        </form>
      </div>
    </div>
  );
}
