import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Frame, Lozenge } from "@/components/ornaments";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Sign In — The Back Room",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  // Already signed in (and active) — no reason to show the form.
  const current = await getCurrentUser();
  if (current) redirect("/admin");

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-md">
        <Frame>
          <div className="text-center">
            <div className="eyebrow">Brainjar Media</div>
            <h1 className="display mt-2 text-2xl">The Back Room</h1>
            <Lozenge className="my-6" />
            <p className="text-base italic text-ink-soft">Sign in to manage the site.</p>
          </div>
          <LoginForm />
        </Frame>
      </div>
    </section>
  );
}
