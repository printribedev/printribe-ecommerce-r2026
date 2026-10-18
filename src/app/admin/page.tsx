import Link from "next/link";
import { ADMIN_SECTIONS, canAccess, requireAdmin } from "@/lib/auth";
import { ACTIVE_STATUSES, buildSizeMatrix, statusLabel } from "@/lib/order-status";
import { prisma } from "@/lib/prisma";
import { QUICK_PRODUCT } from "@/lib/quick-product";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const profile = await requireAdmin();
  const sections = ADMIN_SECTIONS.filter((s) => canAccess(profile, s));

  // Pieces by size and status (cancelled orders left out). Only for people allowed to see orders.
  let matrix: ReturnType<typeof buildSizeMatrix> | null = null;
  if (canAccess(profile, "orders")) {
    const items = await prisma.orderItem.findMany({
      where: { order: { status: { not: "CANCELLED" } } },
      select: { size: true, qty: true, order: { select: { status: true } } },
    });
    matrix = buildSizeMatrix(
      items.map((i) => ({ size: i.size, qty: i.qty, status: i.order.status })),
      QUICK_PRODUCT.sizes
    );
  }

  const cell = (n: number | undefined) =>
    n ? <span className="font-semibold">{n}</span> : <span className="text-neutral-300">–</span>;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Signed in as {profile.email} ({profile.role.toLowerCase()})
      </p>

      {matrix && (
        <section className="mt-6 rounded-xl border border-neutral-200 bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-base font-semibold">Pieces by size and status</h2>
            <p className="text-sm text-neutral-500">
              {matrix.grandTotal} {matrix.grandTotal === 1 ? "piece" : "pieces"} · cancelled orders not counted
            </p>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[40rem] text-center text-sm">
              <thead>
                <tr className="border-b text-xs text-neutral-500">
                  <th className="sticky left-0 bg-white py-2 pr-3 text-left font-medium">Size</th>
                  {ACTIVE_STATUSES.map((s) => (
                    <th key={s} className="px-2 font-medium">
                      <Link href={`/admin/orders?status=${s}`} className="hover:text-tribe hover:underline">
                        {statusLabel(s)}
                      </Link>
                    </th>
                  ))}
                  <th className="pl-3 font-medium text-neutral-700">Total</th>
                </tr>
              </thead>
              <tbody>
                {matrix.rows.map((r) => (
                  <tr key={r.size} className="border-b last:border-0">
                    <td className="sticky left-0 bg-white py-2 pr-3 text-left font-medium">{r.size}</td>
                    {ACTIVE_STATUSES.map((s) => (
                      <td key={s} className="px-2">
                        {cell(r.counts[s])}
                      </td>
                    ))}
                    <td className="pl-3 font-semibold">{r.total || <span className="text-neutral-300">–</span>}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 bg-neutral-50">
                  <td className="sticky left-0 bg-neutral-50 py-2 pr-3 text-left font-semibold">Total</td>
                  {ACTIVE_STATUSES.map((s) => (
                    <td key={s} className="px-2 font-semibold">
                      {matrix!.columnTotals[s] || <span className="text-neutral-300">–</span>}
                    </td>
                  ))}
                  <td className="pl-3 font-bold">{matrix.grandTotal}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="mt-3 text-xs text-neutral-500">Click a status heading to see those orders.</p>
        </section>
      )}

      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
