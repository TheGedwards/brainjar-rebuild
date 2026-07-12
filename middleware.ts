import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

/**
 * Session gate for /admin. Replaces the old HTTP Basic auth: there are now real
 * per-user accounts (Supabase Auth) with roles in public.profiles. This layer
 * only answers "is someone signed in?" and refreshes their session cookie —
 * role/active checks live in lib/auth.ts (getCurrentUser / requireRole), applied
 * at each page and server action.
 *
 * /admin/login is public so people can actually reach the form; everything else
 * under /admin redirects there when signed out.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(toSet: CookieToSet[]) {
        toSet.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        toSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLogin = req.nextUrl.pathname === "/admin/login";

  // Signed out and trying to reach the CMS -> send to the login page.
  if (!user && !isLogin) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }

  // Signed in: let the login PAGE decide whether to bounce to /admin (it checks
  // the profile is active). Deciding here on session alone would loop out a
  // deactivated user, so we just pass through with the refreshed cookies.
  return res;
}

export const config = { matcher: ["/admin/:path*"] };
