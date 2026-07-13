/**
 * Role types + constants with NO server imports, so client components (e.g. the
 * sidebar) can use them. The server-only guards live in lib/auth.ts, which
 * re-exports everything here.
 */

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

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  manager: "Manager",
};

/** Anyone who may touch content (portfolio + blog). */
export const CONTENT_ROLES: Role[] = ["super_admin", "admin", "manager"];
/** Structural edits (nav, SEO, delete) — admins and up. */
export const ADMIN_ROLES: Role[] = ["super_admin", "admin"];
/** Managing other users — super admins only. */
export const OWNER_ROLES: Role[] = ["super_admin"];
