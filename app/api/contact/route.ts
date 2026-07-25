import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * The lead is written to Supabase FIRST, then emailed. If the email provider is
 * down or unconfigured, the lead still exists in the database — a lead is never
 * lost because SMTP had a bad afternoon. Check /admin, or the `leads` table.
 */

// ---------------------------------------------------------------------------
// Rate limit — per-IP throttle to blunt form-spam bursts.
// TO CHANGE THE LIMITS: edit these two constants. RATE_MAX submissions are
// allowed per IP within RATE_WINDOW_MS. e.g. 5 per 10 min = a generous ceiling
// for real visitors, a wall for a bot hammering the endpoint.
// NOTE: memory is per serverless instance, so this is best-effort (it stops a
// burst from one IP hitting one instance), not a global guarantee. For durable,
// global limits add a Vercel Firewall rate rule on /api/contact, or wire Upstash.
// ---------------------------------------------------------------------------
const RATE_MAX = 5;
const RATE_WINDOW_MS = 10 * 60_000; // 10 minutes
const rateHits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  if (rateHits.size > 5000) rateHits.clear(); // crude guard against unbounded growth
  const recent = (rateHits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  rateHits.set(ip, recent);
  return recent.length > RATE_MAX;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Malformed request." }, { status: 400 });

  const { name, email, phone, company, symptom, message, website } = body;

  if (website) return NextResponse.json({ ok: true }); // honeypot tripped

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many submissions. Please wait a few minutes, or call (503) 929-7436." },
      { status: 429 }
    );
  }

  if (!name || !email || !phone) {
    return NextResponse.json(
      { error: "Name, email, and phone are required." },
      { status: 400 }
    );
  }

  const db = supabaseAdmin();
  const { data, error } = await db
    .from("leads")
    .insert({ name, email, phone, company, symptom, message, source_path: "/contact" })
    .select("id")
    .single();

  if (error) {
    console.error("lead insert failed", error);
    return NextResponse.json(
      { error: "We couldn't save that. Call (503) 929-7436 and we'll take it down." },
      { status: 500 }
    );
  }

  // Email is best-effort — the lead is already saved. Two messages go out: an
  // internal notification to the team, and an auto-reply to the person who
  // submitted. Sent from notifications@; the team can reply straight to the lead.
  const key = process.env.RESEND_API_KEY;
  const notifyTo = process.env.CONTACT_TO_EMAIL; // e.g. hello@brainjarmedia.com
  const FROM = "Brainjar Media <notifications@brainjarmedia.com>";

  if (key) {
    const send = (payload: Record<string, unknown>) =>
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: FROM, ...payload }),
      });

    try {
      let sent = false;

      // 1) Internal notification — reply goes straight to the lead.
      if (notifyTo) {
        const res = await send({
          to: [notifyTo],
          reply_to: email,
          subject: `New diagnosis request — ${name}${company ? ` (${company})` : ""}`,
          text: [
            `Name:    ${name}`,
            `Email:   ${email}`,
            `Phone:   ${phone || "—"}`,
            `Company: ${company || "—"}`,
            `Symptom: ${symptom || "—"}`,
            ``,
            message || "(no message)",
          ].join("\n"),
        });
        sent = res.ok;
        if (!res.ok) console.error("resend notify failed", await res.text());
      }

      // 2) Auto-reply to the submitter. Replies route to the team inbox.
      const ack = await send({
        to: [email],
        reply_to: notifyTo || "hello@brainjarmedia.com",
        subject: "We received your message — Brainjar Media",
        text: [
          `Hi ${name},`,
          ``,
          `Thanks for reaching out to Brainjar Media. We've received your message`,
          `and someone will get back to you within one business day.`,
          ``,
          `If it's urgent, call us at (503) 929-7436.`,
          ``,
          `— Brainjar Media`,
          `109 N Main Ave #202, Gresham, OR 97030`,
        ].join("\n"),
      });
      if (!ack.ok) console.error("resend autoreply failed", await ack.text());

      if (sent || ack.ok) {
        await db.from("leads").update({ emailed_at: new Date().toISOString() }).eq("id", data.id);
      }
    } catch (e) {
      console.error("resend threw", e);
    }
  }

  return NextResponse.json({ ok: true });
}
