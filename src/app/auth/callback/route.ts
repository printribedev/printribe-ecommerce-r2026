import { NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  // Only allow same-site relative redirects.
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // No explicit destination: staff go to the admin, customers to their account.
      const profile = await getProfile();
      const staff = profile?.role === "ADMIN" || profile?.role === "STAFF";
      return NextResponse.redirect(`${origin}${safeNext ?? (staff ? "/admin" : "/account")}`);
    }
  }
  return NextResponse.redirect(`${origin}/login?error=1`);
}
