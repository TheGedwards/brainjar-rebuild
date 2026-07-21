/**
 * The brand mark: a brain floating inside an apothecary jar. Two layers — the
 * jar sets the width, the brain sits centered in the jar body (~top 40%) and
 * gently bobs + tilts.
 *
 * The keyframe (BRAIN_KEYFRAMES) is rendered ONCE by the root layout in a valid
 * <style> position — NOT here inside the <span>, because a <style> nested in a
 * <span> is invalid HTML and breaks React hydration app-wide. Tunables live in
 * ANIM; the global reduced-motion rule in globals.css still disables it.
 *
 * Needs two transparent PNGs: /assets/brain.png and /assets/jar.png.
 */

// --- Animation tunables (easy to revert) ---
export const ANIM = {
  rise: "5px", // how far it floats up (was 8px — reduced so it stays in the jar)
  tilt: "2.5deg", // slight rotation at the top of the rise
  duration: "5.5s", // slower than the original 4s
};

export const BRAIN_KEYFRAMES = `@keyframes bj-brain-float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50%      { transform: translateY(-${ANIM.rise}) rotate(${ANIM.tilt}); }
}`;

export function BrandMark({
  width = 75,
  className = "",
  jarSrc = "/assets/jar.png",
  brainSrc = "/assets/brain.png",
}: {
  width?: number;
  className?: string;
  /** Swap the art (e.g. the blue set for the cobalt CTA). Same 500×500 jar /
   *  322×262 brain proportions, so the positioning holds. */
  jarSrc?: string;
  brainSrc?: string;
}) {
  return (
    <span
      className={`relative inline-block ${className}`}
      style={{ width }}
      aria-hidden="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={jarSrc} alt="" className="block w-full" />
      <span className="absolute left-1/2 top-[40%] w-[60%] -translate-x-1/2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={brainSrc}
          alt=""
          className="block w-full"
          style={{ animation: `bj-brain-float ${ANIM.duration} ease-in-out infinite` }}
        />
      </span>
    </span>
  );
}
