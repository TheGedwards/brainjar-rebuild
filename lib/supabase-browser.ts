"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client that reads the same @supabase/ssr cookie session the
 * CMS login sets. Used only to cheaply tell whether someone is signed in (for
 * the admin bar) — no network call when there's no session cookie. Not a
 * security boundary: the /admin pages + server actions still enforce auth+roles.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function browserSupabase() {
  if (!client) client = createBrowserClient(url, anonKey);
  return client;
}
