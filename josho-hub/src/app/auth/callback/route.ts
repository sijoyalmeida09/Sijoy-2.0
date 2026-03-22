import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const redirectTo = url.searchParams.get("redirect") || "/dashboard";
  const safeRedirect = redirectTo.startsWith("/") ? redirectTo : "/dashboard";

  if (!code) return NextResponse.redirect(new URL("/login?error=Missing+code", url.origin));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const cookieDomain = process.env.SUPABASE_COOKIE_DOMAIN;

  // Build response first so cookies can be set on it
  const response = NextResponse.redirect(new URL(safeRedirect, url.origin));

  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookieOptions: {
      domain: cookieDomain || undefined,
      sameSite: "lax" as const,
      secure: true,
      path: "/",
    },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options as Record<string, unknown>);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, url.origin)
    );
  }

  return response;
}
