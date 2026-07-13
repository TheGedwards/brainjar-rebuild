import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { Sidebar } from "@/components/admin/sidebar";
import { signOut } from "@/app/admin/actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireUser();

  return (
    <div className="flex min-h-screen bg-paper text-ink">
      <Sidebar
        role={profile.role}
        name={profile.full_name ?? profile.email}
        email={profile.email}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-end gap-6 border-b border-rule bg-paper px-6 py-4">
          <a
            href="/"
            target="_blank"
            className="font-display text-[11px] tracking-[0.15em] text-cobalt hover:text-tincture"
          >
            VIEW SITE ↗
          </a>
          <form action={signOut}>
            <button className="font-display text-[11px] tracking-[0.15em] text-ink-faint hover:text-tincture">
              SIGN OUT
            </button>
          </form>
        </header>
        <div className="min-w-0 flex-1 px-6 py-8">{children}</div>
      </div>
    </div>
  );
}
