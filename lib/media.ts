/**
 * Media alt-text resolution for public pages. Alt lives on the image (the
 * media_assets table), so editing it once in the library updates everywhere the
 * image is placed. Fail-soft: if the table doesn't exist yet or Supabase is
 * unreachable, the map is empty and callers fall back to their old alt.
 */
import { unstable_cache } from "next/cache";
import { supabase } from "@/lib/supabase";

/** Storage path out of a public media URL (…/object/public/media/<path>). */
export function mediaPathFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const marker = "/media/";
  const i = url.indexOf(marker);
  return i >= 0 ? url.slice(i + marker.length).split("?")[0] : null;
}

async function fetchAltMap(): Promise<Record<string, string>> {
  const { data } = await supabase
    .from("media_assets")
    .select("path, alt")
    .then((r) => r, () => ({ data: null }));
  const map: Record<string, string> = {};
  for (const r of (data ?? []) as { path: string; alt: string | null }[]) {
    if (r.alt && r.alt.trim()) map[r.path] = r.alt.trim();
  }
  return map;
}

/** path -> alt (non-empty only), cached briefly. */
export function getMediaAltMap(): Promise<Record<string, string>> {
  return unstable_cache(fetchAltMap, ["media-alt-map-v1"], { revalidate: 300 })();
}

/** Resolve alt for an image URL from the map, else the provided fallback. */
export function altFor(
  map: Record<string, string>,
  url: string | null | undefined,
  fallback = ""
): string {
  const p = mediaPathFromUrl(url);
  return (p && map[p]) || fallback;
}
