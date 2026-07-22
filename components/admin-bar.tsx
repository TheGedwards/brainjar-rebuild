"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PAGES } from "@/lib/pages";
import { ADMIN_ROLES, type Role } from "@/lib/roles";
import { browserSupabase } from "@/lib/supabase-browser";
import { getMyRole, signOut } from "@/app/admin/actions";

/**
 * WordPress-style admin bar. When a CMS user is signed in, a black bar rides the
 * top of every PUBLIC page with a contextual "edit this" link. Detection is
 * client-side off the existing session cookie, so anonymous visitors trigger
 * nothing and the public pages stay static. It's navigation only — the /admin
 * pages still enforce auth + roles server-side.
 */

type Target = { href: string; label: string } | null;
type Ctx = { authed: boolean; role: Role | null; setEditTarget: (t: Target) => void };

const AdminCtx = createContext<Ctx>({ authed: false, role: null, setEditTarget: () => {} });

/** path → pages-registry key, for the marketing pages editable at /admin/pages. */
const PATH_TO_KEY: Record<string, string> = Object.fromEntries(PAGES.map((p) => [p.path, p.key]));

const BAR_H = "40px";

export function AdminBarProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  const onAdmin = pathname.startsWith("/admin");
  const [role, setRole] = useState<Role | null>(null);
  const [authed, setAuthed] = useState(false);
  const [editTarget, setEditTarget] = useState<Target>(null);

  useEffect(() => {
    let active = true;
    const sb = browserSupabase();
    // getSession() reads the cookie without a network call — instant null for
    // anonymous visitors. Only signed-in staff pay for the role lookup.
    sb.auth.getSession().then(async ({ data: { session } }) => {
      if (!session || !active) return;
      const r = await getMyRole();
      if (!active) return;
      if (r) {
        setRole(r);
        setAuthed(true);
      }
    });
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
      if (!session) {
        setAuthed(false);
        setRole(null);
      }
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const show = authed && !onAdmin;

  // Offset the site's condensed sticky header (which is fixed at top-0) so it
  // sits below the bar instead of under it.
  useEffect(() => {
    document.documentElement.style.setProperty("--bjm-adminbar", show ? BAR_H : "0px");
    return () => document.documentElement.style.setProperty("--bjm-adminbar", "0px");
  }, [show]);

  return (
    <AdminCtx.Provider value={{ authed: show, role, setEditTarget }}>
      {show && (
        <>
          <AdminBar role={role} pathname={pathname} editTarget={editTarget} />
          <div aria-hidden style={{ height: BAR_H }} />
        </>
      )}
      {children}
    </AdminCtx.Provider>
  );
}

function AdminBar({
  role,
  pathname,
  editTarget,
}: {
  role: Role | null;
  pathname: string;
  editTarget: Target;
}) {
  // Explicit target (set by a detail page) wins; otherwise fall back to the
  // marketing-page map — but Pages editing is admin+, so gate that.
  let edit = editTarget;
  if (!edit) {
    const key = PATH_TO_KEY[pathname];
    if (key && role && ADMIN_ROLES.includes(role)) {
      edit = { href: `/admin/pages/${key}`, label: "Edit this page" };
    }
  }

  return (
    <div className="fixed inset-x-0 top-0 z-[60] flex h-10 items-center gap-3 bg-ink px-3 text-paper sm:px-4">
      <Link
        href="/admin"
        className="flex items-center gap-2 font-display text-[11px] font-bold tracking-[0.2em] hover:text-tincture-lt"
      >
        <span aria-hidden>⚗</span>
        <span className="hidden sm:inline">BRAINJAR ADMIN</span>
      </Link>
      {role && (
        <span className="hidden font-display text-[9px] tracking-[0.2em] text-paper/50 md:inline">
          {role.replace(/_/g, " ").toUpperCase()}
        </span>
      )}

      {edit && (
        <Link
          href={edit.href}
          className="flex items-center gap-1.5 rounded-full bg-tincture px-3 py-1 font-display text-[10px] font-bold tracking-[0.15em] text-paper transition-colors hover:bg-tincture-dk"
        >
          <PencilIcon />
          {edit.label.toUpperCase()}
        </Link>
      )}

      {/* Global quick-add — author a new post from anywhere on the site. */}
      {role && (
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-1.5 rounded-full border border-paper/30 px-3 py-1 font-display text-[10px] font-bold tracking-[0.15em] text-paper transition-colors hover:border-paper hover:bg-paper hover:text-ink"
        >
          <PlusIcon />
          NEW POST
        </Link>
      )}

      <div className="ml-auto flex items-center gap-4">
        <Link
          href="/admin"
          className="font-display text-[10px] tracking-[0.2em] text-paper/80 hover:text-paper"
        >
          DASHBOARD
        </Link>
        <form action={signOut}>
          <button className="font-display text-[10px] tracking-[0.2em] text-paper/80 hover:text-paper">
            SIGN OUT
          </button>
        </form>
      </div>
    </div>
  );
}

/** Sets the bar's contextual edit link for a detail page (case study, post). */
export function EditTarget({ href, label }: { href: string; label: string }) {
  const { setEditTarget } = useContext(AdminCtx);
  useEffect(() => {
    setEditTarget({ href, label });
    return () => setEditTarget(null);
  }, [href, label, setEditTarget]);
  return null;
}

/** Renders children only for signed-in staff (used for card "Edit" pills). */
export function AdminOnly({ children }: { children: ReactNode }) {
  const { authed } = useContext(AdminCtx);
  return authed ? <>{children}</> : null;
}

function PencilIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
