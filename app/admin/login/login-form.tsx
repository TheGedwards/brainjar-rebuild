"use client";

import { useActionState } from "react";
import { signIn } from "../actions";

const input =
  "w-full border border-rule-strong bg-card px-4 py-3 font-body text-base text-ink focus:border-tincture focus:outline-none";

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, { error: "" });

  return (
    <form action={action} className="mt-8 space-y-4 text-left">
      <div>
        <label htmlFor="email" className="eyebrow mb-2 block">
          Email
        </label>
        <input id="email" name="email" type="email" required autoComplete="email" className={input} />
      </div>
      <div>
        <label htmlFor="password" className="eyebrow mb-2 block">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={input}
        />
      </div>

      {state?.error && (
        <p role="alert" className="border border-tincture bg-tincture-lt/40 px-4 py-2 text-base text-ink">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-fill w-full disabled:opacity-60">
        {pending ? "SIGNING IN…" : "SIGN IN"}
      </button>
    </form>
  );
}
