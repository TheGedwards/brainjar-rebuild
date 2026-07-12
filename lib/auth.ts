import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieToSet = { name: string; value: string; options?: CookieOptions };
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Auth for the CMS. Public reads still use the plain client in lib/supabase.ts;
 * this file is only about *who is signed in* to /admin.
 *
 *   createServerSupabase() — cookie-aware client, reads/sets the Supabase
 *                            session. Use in server actions (sign in/out).
 *   getCurrentUser()       — the signed-in user + their profile/role, or null.
 *   requireUser()          — page guard: redirects to /admin/login if signed out.
 *   requireRole([...])     — action guard: throws unless the role is allowed.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export type Role = "super_admin" | "admin" | "manager";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

/** Human labels + the ordering used to render/limit role pickers. */
export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  manager: "Manager",
};

/** Anyone who may touch content (portfolio + blog). */
export const CONTENT_ROLES: Role[] = ["super_admin", "admin", "manager"];
/** Structural edits (nav, SEO) — reserved for admins and up. */
export const ADMIN_ROLES: Role[] = ["super_admin", "admin"];
/** Managing other users — super admins only. */
export const OWNER_ROLES: Role[] = ["super_admin"];

export async function createServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(toSet: CookieToSet[]) {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component render — cookies are read-only there.
          // The middleware refreshes the session, so this is safe to ignore.
        }
      },
    },
  });
}

export async function getCurrentUser(): Promise<{ user: { id: string; email?: string }; profile: Profile } | null> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Profile read via service_role: simple, and it dodges any RLS recursion.
  const { data: profile } = await supabaseAdmin()
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // A deactivated account is treated as signed out.
  if (!profile || !(profile as Profile).is_active) return null;
  return { user, profile: profile as Profile };
}

/** Page guard. Returns the current user, or redirects to the login page. */
export async function requireUser() {
  const current = await getCurrentUser();
  if (!current) redirect("/admin/login");
  return current;
}

/** Action guard. Throws (rejecting the mutation) unless the role is allowed. */
export async function requireRole(roles: Role[]) {
  const current = await getCurrentUser();
  if (!current) throw new Error("Not signed in.");
  if (!roles.includes(current.profile.role)) {
    throw new Error("You don't have permission to do that.");
  }
  return current;
}
