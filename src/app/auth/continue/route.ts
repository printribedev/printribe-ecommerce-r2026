import { NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";

/**
 * Where to go right after signing in with a password.
 * An explicit ?next= wins; otherwise staff go to the admin and customers to their account.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get("next");
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;

  const profile = await getProfile();
  if (!profile) return NextResponse.redirect(`${origin}/login?error=1`);

  const staff = profile.role === "ADMIN" || profile.role === "STAFF";
  return NextResponse.redirect(`${origin}${safeNext ?? (staff ? "/admin" : "/account")}`);
}
