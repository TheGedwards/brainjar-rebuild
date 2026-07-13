"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROLE_LABELS, type Role } from "@/lib/roles";

/** Simple inline line-icons — no icon-font dependency for the console. */
const ICONS: Record<string, React.ReactNode> = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </>
  ),
  flask: (
    <>
      <path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3" />
      <path d="M7 14h10" />
    </>
  ),
  news: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="1" />
      <path d="M7 8h6M7 12h10M7 16h10" />
    </>
  ),
  file: (
    <>
      <path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z" />
      <path d="M14 3v5h5M9 13l2 2 4-4" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V4M4 20h16" />
      <path d="M8 16v-4M12 16V8M16 16v-6" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20a6 6 0 0 1 12 0M16 6a3 3 0 0 1 0 6M21 20a6 6 0 0 0-4-5.6" />
    </>
  ),
};

function Icon({ name }: { name: string }) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

type NavItem = {
  href: string;
  label: string;
  icon: string;
  roles?: Role[];
  soon?: boolean;
};

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/portfolio", label: "Portfolio", icon: "flask" },
  { href: "/admin/blog", label: "Blog", icon: "news" },
  { href: "/admin/pages", label: "Pages", icon: "file", roles: ["super_admin", "admin"], soon: true },
  { href: "/admin/analytics", label: "Analytics", icon: "chart", soon: true },
  { href: "/admin/users", label: "Users", icon: "users", roles: ["super_admin"] },
];

export function Sidebar({
  role,
  name,
  email,
}: {
  role: Role;
  name: string;
  email: string;
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const items = NAV.filter((i) => !i.roles || i.roles.includes(role));

  return (
    <aside className="flex w-[200px] flex-shrink-0 flex-col justify-between border-r border-rule bg-panel">
      <div>
        <div className="double-rule px-4 py-4 text-center">
          <div className="display text-[13px] tracking-[0.2em]">BRAINJAR</div>
          <div className="mt-0.5 font-display text-[10px] tracking-[0.2em] text-ink-faint">
            THE BACK ROOM
          </div>
        </div>

        <nav className="p-2" aria-label="Admin">
          {items.map((item) => {
            const active = isActive(item.href);
            const base =
              "flex items-center gap-3 border-l-[3px] px-3 py-2.5 font-display text-xs font-semibold uppercase tracking-[0.1em] transition-colors";
            if (item.soon) {
              return (
                <span
                  key={item.href}
                  className={`${base} cursor-default border-transparent text-ink-faint/60`}
                  title="Coming soon"
                >
                  <Icon name={item.icon} />
                  <span className="flex-1">{item.label}</span>
                  <span className="font-display text-[8px] tracking-[0.15em] text-ink-faint/70">
                    SOON
                  </span>
                </span>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`${base} ${
                  active
                    ? "border-tincture bg-card text-tincture"
                    : "border-transparent text-ink-soft hover:bg-card hover:text-tincture"
                }`}
              >
                <Icon name={item.icon} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-3 border-t border-rule p-3">
        <div className="flex size-8 flex-shrink-0 items-center justify-center rounded-full bg-tincture font-display text-[13px] font-bold text-paper">
          {(name[0] ?? "?").toUpperCase()}
        </div>
        <div className="min-w-0 leading-tight">
          <div className="truncate text-sm">{name}</div>
          <div className="font-display text-[9px] tracking-[0.15em] text-cobalt">
            {ROLE_LABELS[role].toUpperCase()}
          </div>
        </div>
      </div>
    </aside>
  );
}
