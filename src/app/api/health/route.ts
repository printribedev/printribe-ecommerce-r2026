import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Deployment check. Reports presence of settings (never their values) and database reachability. */
const NAMES = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "DATABASE_URL",
  "DIRECT_URL",
  "ADMIN_EMAILS",
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_PUBLIC_BUCKET",
  "R2_PRIVATE_BUCKET",
  "R2_PUBLIC_URL",
];

export async function GET() {
  const env = Object.fromEntries(NAMES.map((n) => [n, Boolean(process.env[n]?.trim())]));

  let database: string;
  try {
    await prisma.$queryRaw`SELECT 1`;
    database = "ok";
  } catch (e) {
    database = `failed (${e instanceof Error ? e.name : "unknown"})`;
  }

  return NextResponse.json({ env, database });
}
