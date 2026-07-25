"use client";

import { useState } from "react";
import Script from "next/script";

type State = "idle" | "sending" | "sent" | "error";

// Cloudflare Turnstile site key (public — embedded in the page by design).
const TURNSTILE_SITE_KEY = "0x4AAAAAAD9ofoq-ALj7HQLR";

const FIELD_BASE =
  "w-full border bg-card px-4 py-4 font-body text-lg text-ink placeholder:text-ink-faint/60 focus:outline-none";

function fieldCls(hasError: boolean) {
  return `${FIELD_BASE} ${
    hasError
      ? "border-tincture-dk focus:border-tincture-dk"
      : "border-rule-strong focus:border-tincture"
  }`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function resetTurnstile() {
  (window as unknown as { turnstile?: { reset: () => void } }).turnstile?.reset?.();
}

export function ContactForm() {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    // Honeypot: bots fill every field they find. Humans never see this one.
    if (form.get("website")) {
      setState("sent");
      return;
    }

    // Required-field validation with clear, specific messages.
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();

    const next: Record<string, string> = {};
    if (!name) next.name = "Please enter your name.";
    if (!email) next.email = "Please enter your email address.";
    else if (!EMAIL_RE.test(email)) next.email = "That doesn’t look like a valid email address.";
    if (!phone) next.phone = "Please enter a phone number so we can reach you.";

    if (Object.keys(next).length > 0) {
      setErrors(next);
      setState("idle");
      setError("");
      document.getElementById(Object.keys(next)[0])?.focus();
      return;
    }

    // Turnstile: the token is injected by the widget as cf-turnstile-response.
    const token = String(form.get("cf-turnstile-response") ?? "");
    if (!token) {
      setErrors({});
      setState("idle");
      setError("Please complete the “I’m human” check below, then resend.");
      return;
    }

    setErrors({});
    setState("sending");
    setError("");

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...Object.fromEntries(form), turnstileToken: token }),
    });

    if (res.ok) {
      setState("sent");
    } else {
      const body = await res.json().catch(() => ({}));
      setState("error");
      resetTurnstile(); // Turnstile tokens are single-use — get a fresh one.
      // Say what went wrong and what to do instead. Never just "Oops!"
      setError(
        body.error ??
          "That didn’t send. Call (503) 929-7436 and we’ll take it down over the phone."
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
            <a href="tel:+15039297436" className="text-tincture underline underline-offset-4">
              (503) 929-7436
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  const req = (
    <span aria-hidden="true" className="text-tincture-dk">
      {" "}
      *
    </span>
  );

  const errorLine = (field: string) =>
    errors[field] ? (
      <p id={`${field}-error`} role="alert" className="mt-1 font-body text-base italic text-tincture-dk">
        {errors[field]}
      </p>
    ) : null;

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        async
        defer
      />
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="eyebrow mb-2 block">
              Name{req}
            </label>
            <input
              id="name"
              name="name"
              autoComplete="name"
              aria-required="true"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
              className={fieldCls(!!errors.name)}
            />
            {errorLine("name")}
          </div>
          <div>
            <label htmlFor="email" className="eyebrow mb-2 block">
              Email{req}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              aria-required="true"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={fieldCls(!!errors.email)}
            />
            {errorLine("email")}
          </div>
          <div>
            <label htmlFor="phone" className="eyebrow mb-2 block">
              Phone{req}
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              aria-required="true"
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              className={fieldCls(!!errors.phone)}
            />
            {errorLine("phone")}
          </div>
          <div>
            <label htmlFor="company" className="eyebrow mb-2 block">
              Company
            </label>
            <input id="company" name="company" autoComplete="organization" className={fieldCls(false)} />
          </div>
        </div>

        <div>
          <label htmlFor="symptom" className="eyebrow mb-2 block">
            What&rsquo;s the symptom?
          </label>
          <select id="symptom" name="symptom" className={fieldCls(false)} defaultValue="">
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
          <textarea id="message" name="message" rows={5} className={fieldCls(false)} />
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

        <p className="font-body text-base text-ink-faint">
          <span className="text-tincture-dk">*</span> Required
        </p>

        {/* Cloudflare Turnstile — injects a hidden cf-turnstile-response token. */}
        <div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} data-theme="light" />

        {state === "error" && (
          <p role="alert" className="border border-tincture bg-tincture-lt/40 px-4 py-2 text-base text-ink">
            {error}
          </p>
        )}

        <button type="submit" disabled={state === "sending"} className="btn btn-fill disabled:opacity-60">
          {state === "sending" ? "SENDING…" : "SEND IT OVER"}
        </button>
      </form>
    </>
  );
}
