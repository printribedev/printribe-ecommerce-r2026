import { cache } from "react";
import { redirect } from "next/navigation";
import { Prisma, type Profile } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

/** Admin sections a STAFF member can be granted. ADMIN always has all of them. */
export const ADMIN_SECTIONS = [
  "products",
  "categories",
  "orders",
  "customers",
  "coupons",
  "shipping",
  "content",
  "settings",
] as const;
export type AdminSection = (typeof ADMIN_SECTIONS)[number];

/**
 * The signed-in user's Profile, created on first sign-in.
 * Emails listed in ADMIN_EMAILS (comma-separated env) become ADMIN when their profile is created,
 * so you can bootstrap the first admin without touching the database.
 */
export const getProfile = cache(async (): Promise<Profile | null> => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const existing = await prisma.profile.findUnique({ where: { id: user.id } });
  if (existing) return existing;

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const email = user.email.toLowerCase();

  try {
    return await prisma.profile.create({
      data: {
        id: user.id,
        email,
        name: (user.user_metadata?.full_name as string | undefined) ?? null,
        role: adminEmails.includes(email) ? "ADMIN" : "CUSTOMER",
      },
    });
  } catch (e) {
    // The layout and the page can both try to create the profile on a first visit;
    // whichever loses the race just reads the row the other one made.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return prisma.profile.findUnique({ where: { id: user.id } });
    }
    throw e;
  }
});

export function canAccess(profile: Profile, section: AdminSection): boolean {
  if (profile.role === "ADMIN") return true;
  return profile.role === "STAFF" && profile.permissions.includes(section);
}

/** For customer pages (/account). Redirects to login if signed out. */
export async function requireUser(next = "/account"): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) redirect(`/login?next=${encodeURIComponent(next)}`);
  return profile;
}

/**
 * For admin pages. Pass the section the page belongs to; omit it for the admin home,
 * which any ADMIN or STAFF member may open.
 */
export async function requireAdmin(section?: AdminSection): Promise<Profile> {
  const profile = await requireUser("/admin");
  const isStaffOrAdmin = profile.role === "ADMIN" || profile.role === "STAFF";
  if (!isStaffOrAdmin || (section && !canAccess(profile, section))) redirect("/");
  return profile;
}

/** Same checks for API routes: returns null instead of redirecting. */
export async function getAdminForApi(section: AdminSection): Promise<Profile | null> {
  const profile = await getProfile();
  return profile && canAccess(profile, section) ? profile : null;
}
