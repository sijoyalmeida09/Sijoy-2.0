import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/email";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) return NextResponse.redirect(new URL("/login?error=Missing+code", url.origin));

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, url.origin));

  const user = data.user;
  if (!user?.id || !user.email) return NextResponse.redirect(new URL("/login?error=Invalid+user", url.origin));

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, metadata, full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  const metadata = (profile?.metadata as Record<string, unknown> | null) ?? {};
  const alreadySent = metadata.welcome_sent === true;

  if (!alreadySent) {
    await sendWelcomeEmail({ to: user.email, fullName: profile?.full_name ?? null });
    await supabase
      .from("profiles")
      .update({
        metadata: {
          ...metadata,
          welcome_sent: true,
          welcome_sent_at: new Date().toISOString()
        }
      })
      .eq("id", user.id);
  }

  return NextResponse.redirect(new URL("/dashboard", url.origin));
}
