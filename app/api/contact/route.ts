import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * The lead is written to Supabase FIRST, then emailed. If the email provider is
 * down or unconfigured, the lead still exists in the database — a lead is never
 * lost because SMTP had a bad afternoon. Check /admin, or the `leads` table.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Malformed request." }, { status: 400 });

  const { name, email, phone, company, symptom, message, website } = body;

  if (website) return NextResponse.json({ ok: true }); // honeypot tripped
  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
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

  // Email is best-effort.
  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (key && to) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Brainjar Media <website@brainjarmedia.com>",
          to: [to],
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
        }),
      });
      if (res.ok) {
        await db.from("leads").update({ emailed_at: new Date().toISOString() }).eq("id", data.id);
      } else {
        console.error("resend failed", await res.text());
      }
    } catch (e) {
      console.error("resend threw", e);
    }
  }

  return NextResponse.json({ ok: true });
}
