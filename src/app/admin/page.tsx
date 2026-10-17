import Link from "next/link";
import { ADMIN_SECTIONS, canAccess, requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const profile = await requireAdmin();
  const sections = ADMIN_SECTIONS.filter((s) => canAccess(profile, s));

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Signed in as {profile.email} ({profile.role.toLowerCase()})
      </p>
      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {sections.map((s) => (
          <li
            key={s}
            className="rounded-lg border border-neutral-200 bg-white p-4 text-sm font-medium capitalize"
          >
            {s === "products" || s === "categories" || s === "orders" ? (
              <Link href={`/admin/${s}`} className="block text-tribe hover:underline">
                {s}
              </Link>
            ) : (
              <>
                {s}
                <span className="mt-1 block text-xs font-normal text-neutral-500">Coming soon</span>
              </>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
