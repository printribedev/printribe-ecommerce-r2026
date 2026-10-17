import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const profile = await requireUser();
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">My account</h1>
      <p className="mt-1 text-sm text-neutral-600">{profile.email}</p>
      <p className="mt-6 text-sm text-neutral-500">Order history arrives with the checkout phase.</p>
    </main>
  );
}
