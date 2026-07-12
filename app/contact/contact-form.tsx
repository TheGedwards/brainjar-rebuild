"use client";

import { useState } from "react";

type State = "idle" | "sending" | "sent" | "error";

const FIELD =
  "w-full border border-rule-strong bg-card px-4 py-4 font-body text-lg text-ink placeholder:text-ink-faint/60 focus:border-tincture focus:outline-none";

export function ContactForm() {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    setError("");

    const form = new FormData(e.currentTarget);
    // Honeypot: bots fill every field they find. Humans never see this one.
    if (form.get("website")) {
      setState("sent");
      return;
    }

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form)),
    });

    if (res.ok) {
      setState("sent");
    } else {
      const body = await res.json().catch(() => ({}));
      setState("error");
      // Say what went wrong and what to do instead. Never just "Oops!"
      setError(
        body.error ??
          "That didn't send. Call (503) 492-6500 and we'll take it down over the phone."
      );
    }
  }

  if (state === "sent") {
    return (
      <div className="border border-rule-strong p-2">
        <div className="border-2 border-ink bg-card px-8 py-12 text-center">
          <div className="display text-xl text-tincture">PRESCRIPTION RECEIVED</div>
          <p className="mt-4 text-lg italic text-ink-soft">
            We&rsquo;ll be in touch within one business day. If it&rsquo;s urgent, call{" "}
            <a href="tel:+15034926500" className="text-tincture underline underline-offset-4">
              (503) 492-6500
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="eyebrow mb-2 block">
            Name
          </label>
          <input id="name" name="name" required autoComplete="name" className={FIELD} />
        </div>
        <div>
          <label htmlFor="email" className="eyebrow mb-2 block">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={FIELD}
          />
        </div>
        <div>
          <label htmlFor="phone" className="eyebrow mb-2 block">
            Phone
          </label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" className={FIELD} />
        </div>
        <div>
          <label htmlFor="company" className="eyebrow mb-2 block">
            Company
          </label>
          <input id="company" name="company" autoComplete="organization" className={FIELD} />
        </div>
      </div>

      <div>
        <label htmlFor="symptom" className="eyebrow mb-2 block">
          What&rsquo;s the symptom?
        </label>
        <select id="symptom" name="symptom" className={FIELD} defaultValue="">
          <option value="" disabled>
            Choose one
          </option>
          <option>Nobody can find us on Google</option>
          <option>Our website is old, slow or embarrassing</option>
          <option>Traffic comes, but nobody buys</option>
          <option>We&rsquo;re spending on ads and can&rsquo;t tell if it works</option>
          <option>We need everything</option>
          <option>Something else</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="eyebrow mb-2 block">
          Tell us more
        </label>
        <textarea id="message" name="message" rows={5} className={FIELD} />
      </div>

      {/* honeypot */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] size-0"
      />

      {state === "error" && (
        <p role="alert" className="border border-tincture bg-tincture-lt/40 px-4 py-2 text-base text-ink">
          {error}
        </p>
      )}

      <button type="submit" disabled={state === "sending"} className="btn btn-fill disabled:opacity-60">
        {state === "sending" ? "SENDING…" : "SEND IT OVER"}
      </button>
    </form>
  );
}
