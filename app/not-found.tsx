import Link from "next/link";
import { Frame, Lozenge } from "@/components/ornaments";

export default function NotFound() {
  return (
    <section className="px-6 py-16 text-center">
      <Frame>
        <div className="eyebrow">Not on the Shelf</div>
        <h1 className="display mt-4 text-[32px] sm:text-[48px]">
          This Bottle Is <span className="text-tincture">Empty</span>
        </h1>
        <Lozenge className="my-6" />
        <p className="mx-auto max-w-md text-lg italic text-ink-soft">
          The page you asked for isn&rsquo;t here. It may have moved when we rebuilt the shop.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/work" className="btn btn-fill">
            SEE THE WORK
          </Link>
          <Link href="/" className="btn btn-outline">
            BACK TO THE FRONT
          </Link>
        </div>
      </Frame>
    </section>
  );
}
