import { listMedia } from "@/app/admin/actions";
import { MediaLibrary } from "@/components/admin/media-library";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const items = await listMedia().catch(() => []);

  return (
    <div className="max-w-5xl">
      <h1 className="display text-2xl">Media Library</h1>
      <p className="mt-1 text-base italic text-ink-soft">
        Every image in the shared <code>media</code> bucket — portfolio screenshots, blog images,
        uploads. Upload once here, then reuse anywhere by copying the URL into a hero or blog image
        field.
      </p>

      <div className="mt-6">
        <MediaLibrary items={items} />
      </div>
    </div>
  );
}
