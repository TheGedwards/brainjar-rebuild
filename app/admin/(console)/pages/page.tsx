import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser, ADMIN_ROLES } from "@/lib/auth";
import { PAGES } from "@/lib/pages";

export const dynamic = "force-dynamic";

export default async function PagesList() {
  const { profile } = await requireUser();
  if (!ADMIN_ROLES.includes(profile.role)) redirect("/admin");

  return (
    <div className="max-w-3xl">
      <h1 className="display text-2xl">Pages</h1>
      <p className="mt-1 text-base italic text-ink-soft">
        Edit each page’s SEO and its copy. The layout stays fixed — you’re editing the words.
      </p>

      <div className="mt-6 border border-rule bg-card">
        <ul className="divide-y divide-rule">
          {PAGES.map((p) => (
            <li key={p.key}>
              <Link
                href={`/admin/pages/${p.key}`}
                className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-panel"
              >
                <span className="text-base">{p.name}</span>
                <span className="flex items-center gap-4">
                  <span className="font-display text-[10px] tracking-widest text-ink-faint">
                    {p.path}
                  </span>
                  <span className="font-display text-[10px] tracking-[0.2em] text-cobalt">EDIT →</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
