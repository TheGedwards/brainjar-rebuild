"use client";

import Link from "next/link";
import { deletePost } from "@/app/admin/actions";

const action =
  "font-display text-[10px] tracking-[0.2em] text-cobalt hover:text-tincture";

export function PostRowActions({
  id,
  slug,
  isPublished,
}: {
  id: string;
  slug: string;
  isPublished: boolean;
}) {
  return (
    <div className="flex flex-shrink-0 items-center gap-4">
      <Link href={`/admin/blog/${id}`} className={action}>
        EDIT
      </Link>

      {isPublished ? (
        <a href={`/blog/${slug}`} target="_blank" rel="noopener noreferrer" className={action}>
          VIEW ↗
        </a>
      ) : (
        <Link href={`/admin/blog/${id}/preview`} className={action}>
          PREVIEW
        </Link>
      )}

      <form
        action={deletePost}
        onSubmit={(e) => {
          if (!window.confirm("Delete this post permanently?")) e.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={id} />
        <button className="font-display text-[10px] tracking-[0.2em] text-ink-faint hover:text-tincture">
          DELETE
        </button>
      </form>
    </div>
  );
}
