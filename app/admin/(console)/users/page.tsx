import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { requireUser, ROLE_LABELS, OWNER_ROLES, type Role, type Profile } from "@/lib/auth";
import { createUser, updateUserRole, setUserActive } from "@/app/admin/actions";
import { field, label } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const ROLES: Role[] = ["super_admin", "admin", "manager"];

export default async function UsersPage() {
  const { user, profile } = await requireUser();
  if (!OWNER_ROLES.includes(profile.role)) redirect("/admin");

  const { data } = await supabaseAdmin().from("profiles").select("*").order("created_at");
  const users = (data ?? []) as Profile[];

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h1 className="display text-2xl">Users</h1>
        <span className="font-display text-[10px] tracking-[0.2em] text-ink-faint">
          {users.length} PEOPLE
        </span>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="overflow-x-auto border border-rule bg-card">
          <table className="w-full text-base">
            <thead className="border-b border-rule bg-panel">
              <tr className="text-left">
                {["Email", "Name", "Role", "Status", ""].map((h) => (
                  <th key={h} className="eyebrow px-4 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {users.map((u) => {
                const self = u.id === user.id;
                return (
                  <tr key={u.id}>
                    <td className="px-4 py-3">
                      {u.email}
                      {self && (
                        <span className="ml-2 font-display text-[9px] tracking-widest text-cobalt">
                          YOU
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{u.full_name ?? "—"}</td>
                    <td className="px-4 py-3">
                      {self ? (
                        <span>{ROLE_LABELS[u.role]}</span>
                      ) : (
                        <form action={updateUserRole} className="flex items-center gap-2">
                          <input type="hidden" name="id" value={u.id} />
                          <select name="role" defaultValue={u.role} className={`${field} !w-auto !py-1`}>
                            {ROLES.map((r) => (
                              <option key={r} value={r}>
                                {ROLE_LABELS[r]}
                              </option>
                            ))}
                          </select>
                          <button className="font-display text-[10px] tracking-widest text-cobalt hover:text-tincture">
                            SAVE
                          </button>
                        </form>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.is_active ? (
                        <span className="text-ink-soft">Active</span>
                      ) : (
                        <span className="text-tincture">Inactive</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!self && (
                        <form action={setUserActive}>
                          <input type="hidden" name="id" value={u.id} />
                          <input type="hidden" name="active" value={u.is_active ? "false" : "true"} />
                          <button className="font-display text-[10px] tracking-widest text-ink-faint hover:text-tincture">
                            {u.is_active ? "DEACTIVATE" : "REACTIVATE"}
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <form action={createUser} className="space-y-4 self-start border border-rule bg-card p-6">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em]">Add a User</h2>
          <div>
            <label className={label}>Full name</label>
            <input name="full_name" className={field} />
          </div>
          <div>
            <label className={label}>Email</label>
            <input name="email" type="email" required className={field} />
          </div>
          <div>
            <label className={label}>Temporary password</label>
            <input name="password" required minLength={8} className={field} />
          </div>
          <div>
            <label className={label}>Role</label>
            <select name="role" defaultValue="manager" className={field}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn-fill">CREATE USER</button>
          <p className="text-base italic text-ink-faint">
            They can sign in immediately with this password — no email is sent, so share it with
            them directly.
          </p>
        </form>
      </div>
    </div>
  );
}
