import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Default social-share card for the whole site (Next uses this for og:image and,
// with the twitter card set in layout, for Twitter too). Apothecary theme:
// paper stock, a hairline frame, the cobalt brain-in-jar mark, wordmark + tagline.

export const runtime = "nodejs";
export const alt = "Brainjar Media — a digital apothecary for ambitious brands";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Pull a Google font as raw bytes for satori. Best-effort: if it fails we fall
// back to satori's rendering rather than breaking the build.
async function loadFont(family: string, weight: number, italic = false): Promise<ArrayBuffer | null> {
  const axis = italic ? `ital,wght@1,${weight}` : `wght@${weight}`;
  const api = `https://fonts.googleapis.com/css2?family=${family}:${axis}`;
  try {
    const css = await (await fetch(api, { headers: { "User-Agent": "Mozilla/5.0" } })).text();
    const url = css.match(/src: url\((.+?)\) format/)?.[1];
    if (!url) return null;
    return await (await fetch(url)).arrayBuffer();
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const jarData = readFileSync(join(process.cwd(), "public", "assets", "brainjar-site-id.png"));
  const jar = `data:image/png;base64,${jarData.toString("base64")}`;

  const [display, displayEyebrow, body] = await Promise.all([
    loadFont("Montserrat", 800),
    loadFont("Montserrat", 600),
    loadFont("Spectral", 400, true),
  ]);

  const fonts = [
    display && { name: "Montserrat", data: display, weight: 800 as const, style: "normal" as const },
    displayEyebrow && { name: "Montserrat", data: displayEyebrow, weight: 600 as const, style: "normal" as const },
    body && { name: "Spectral", data: body, weight: 400 as const, style: "italic" as const },
  ].filter(Boolean) as { name: string; data: ArrayBuffer; weight: 600 | 800; style: "normal" | "italic" }[];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#faf5eb",
          padding: 40,
          fontFamily: "Montserrat",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            alignItems: "center",
            border: "2px solid #c9b896",
            padding: "48px 64px",
          }}
        >
          <img src={jar} width={320} height={320} alt="" />
          <div style={{ display: "flex", flexDirection: "column", marginLeft: 56, flex: 1 }}>
            <div
              style={{
                fontFamily: "Montserrat",
                fontWeight: 600,
                fontSize: 22,
                letterSpacing: 6,
                textTransform: "uppercase",
                color: "#8a7e6c",
              }}
            >
              Est. 2003 · Gresham, Oregon
            </div>
            <div
              style={{
                fontFamily: "Montserrat",
                fontWeight: 800,
                fontSize: 76,
                letterSpacing: 1,
                lineHeight: 1,
                marginTop: 12,
                color: "#3b342a",
              }}
            >
              BRAINJAR MEDIA
            </div>
            <div style={{ width: 132, height: 5, backgroundColor: "#c4694b", margin: "28px 0" }} />
            <div
              style={{
                fontFamily: "Spectral",
                fontStyle: "italic",
                fontSize: 34,
                lineHeight: 1.3,
                color: "#5e574b",
              }}
            >
              A digital apothecary for ambitious brands.
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined }
  );
}
