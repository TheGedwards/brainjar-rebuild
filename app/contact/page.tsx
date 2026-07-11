import type { Metadata } from "next";
import { Frame, Lozenge } from "@/components/ornaments";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Get a Diagnosis — Contact",
  description:
    "Tell us the symptom and we'll mix the cure. Brainjar Media, 109 N Main Ave #202, Gresham, OR 97030. (503) 492-6500.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <section className="px-6 py-16 text-center sm:py-20">
        <Frame>
          <div className="eyebrow">Take as Directed</div>
          <h1 className="display mt-5 text-[32px] leading-tight sm:text-[46px]">
            Get a Diagnosis
          </h1>
          <Lozenge className="my-6" />
          <p className="mx-auto max-w-xl text-lg italic leading-relaxed text-ink-soft">
            More leads, calls, foot traffic or sales — tell us the symptom, we&rsquo;ll mix the cure.
            The consultation is free.
          </p>
        </Frame>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto grid max-w-4xl gap-14 lg:grid-cols-[1.4fr_1fr]">
          <ContactForm />

          <aside className="space-y-10">
            <div>
              <div className="eyebrow mb-3">The Dispensary</div>
              <address className="text-lg not-italic leading-relaxed text-ink-soft">
                109 N Main Ave #202
                <br />
                Gresham, OR 97030
              </address>
            </div>
            <div>
              <div className="eyebrow mb-3">By Telephone</div>
              <a href="tel:+15034926500" className="text-lg text-tincture hover:underline">
                (503) 492-6500
              </a>
            </div>
            <div>
              <div className="eyebrow mb-3">Hours</div>
              <p className="text-lg italic text-ink-soft">
                Monday to Friday, 9 to 5.
                <br />
                We answer the phone.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
