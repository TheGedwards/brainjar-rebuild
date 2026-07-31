import type { NextConfig } from "next";
import { REDIRECTS } from "./lib/redirects";

/**
 * 301 REDIRECT MAP lives in lib/redirects.ts (single source of truth), so the
 * in-admin checker at /admin/redirects can verify the exact same rules the site
 * serves. `permanent: true` emits a real permanent redirect (HTTP 308, which
 * Google treats identically to a 301 for consolidation). Never delete a rule —
 * repoint it if a route is renamed or retired.
 */

const nextConfig: NextConfig = {
  // Image uploads go through a Server Action, whose request body defaults to
  // 1MB — too small for real photos. Raise it. NOTE the real ceiling on Vercel
  // is the ~4.5MB serverless function body limit; for anything larger we'd need
  // to upload straight to Supabase Storage from the browser (signed URL).
  experimental: {
    serverActions: { bodySizeLimit: "6mb" },
  },

  images: {
    remotePatterns: [
      // Supabase Storage — portfolio screenshots and blog cover images
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },

  async redirects() {
    return REDIRECTS.map((r) => ({ ...r, permanent: true })); // permanent: true === HTTP 308/301
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Deny browser features the site never uses (defense in depth).
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
        ],
      },
    ];
  },
};

export default nextConfig;

/**
 * NOT handled here, handle in the Vercel dashboard instead:
 *
 * 1. apex -> www. The live site canonicalizes on https://www.brainjarmedia.com,
 *    so keep www as canonical to preserve existing backlink equity. In Vercel:
 *    Project -> Domains -> add both, set brainjarmedia.com to "Redirect to
 *    www.brainjarmedia.com" (Vercel issues a 308, which search engines treat
 *    the same as a 301 for consolidation).
 *
 * 2. http -> https is automatic on Vercel.
 *
 * 3. /wp-content/uploads/** — old image URLs. These have accumulated image
 *    search equity over 15 years. Two options:
 *      a) leave them 404ing (acceptable, images aren't a ranking asset here), or
 *      b) rehost the originals in Supabase Storage under the same paths and add
 *         a rewrite. Only worth it if Google Images sends you real traffic —
 *         check Search Console -> Performance -> Search type: Image first.
 */
