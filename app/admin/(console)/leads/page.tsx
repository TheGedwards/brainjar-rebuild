import { redirect } from "next/navigation";
import { requireUser, ADMIN_ROLES, OWNER_ROLES } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { LeadsManager, type Lead } from "@/components/admin/leads-manager";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const { profile } = await requireUser();
  if (!ADMIN_ROLES.includes(profile.role)) redirect("/admin");

  const { data } = await supabaseAdmin()
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .then((r) => r, () => ({ data: null }));
  const leads = (data ?? []) as Lead[];

  return (
    <div className="max-w-4xl">
      <h1 className="display text-2xl">Leads</h1>
      <p className="mt-1 text-base italic text-ink-soft">
        Every inquiry from the site. Search, filter by status, and mark each one as you work it.
      </p>
      <div className="mt-6">
        <LeadsManager leads={leads} canDelete={OWNER_ROLES.includes(profile.role)} />
      </div>
    </div>
  );
}
