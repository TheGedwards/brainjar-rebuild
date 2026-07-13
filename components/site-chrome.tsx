"use client";

import { usePathname } from "next/navigation";

/**
 * The public marketing header/footer wrap the whole app via the root layout —
 * except on the CMS. /admin renders its own full-bleed console shell, so we
 * hide the site chrome there. usePathname is a client hook, so this doesn't
 * force the static marketing pages into dynamic rendering.
 */
export function SiteChrome({
  header,
  footer,
  children,
}: {
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  return (
    <>
      {!isAdmin && header}
      <main id="main" className="flex-1">
        {children}
      </main>
      {!isAdmin && footer}
    </>
  );
}
