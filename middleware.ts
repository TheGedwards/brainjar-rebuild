import { NextResponse, type NextRequest } from "next/server";

/**
 * HTTP Basic auth on /admin. Deliberately the simplest thing that works: no
 * session table, no password reset flow, no auth provider to keep patched. If
 * you later want per-person logins and an audit trail, swap this for Supabase
 * Auth — the admin page itself won't change.
 */
export function middleware(req: NextRequest) {
  const header = req.headers.get("authorization");

  if (header) {
    const [, encoded] = header.split(" ");
    const [user, pass] = atob(encoded ?? "").split(":");
    if (
      user === process.env.ADMIN_USER &&
      pass === process.env.ADMIN_PASSWORD &&
      process.env.ADMIN_PASSWORD // never let a blank env var mean "no password"
    ) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Brainjar Back Room"' },
  });
}

export const config = { matcher: ["/admin/:path*"] };
