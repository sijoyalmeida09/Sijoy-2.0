import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const cookieDomain = process.env.SUPABASE_COOKIE_DOMAIN;
  if (!supabaseUrl || !anonKey) return response;

  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookieOptions: {
      domain: cookieDomain || undefined,
      sameSite: "lax",
      secure: true,
      path: "/"
    },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: object }>) {
        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const protectedPaths = ["/dashboard", "/my-bookings", "/my-gigs", "/my-wallet", "/my-earnings", "/admin"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from login page
  if (user && pathname === "/login") {
    const redirect = request.nextUrl.searchParams.get("redirect") || "/dashboard";
    return NextResponse.redirect(new URL(redirect, request.url));
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/my-bookings/:path*", "/my-gigs/:path*", "/my-wallet/:path*", "/my-earnings/:path*", "/admin/:path*", "/login", "/auth/:path*"]
};
