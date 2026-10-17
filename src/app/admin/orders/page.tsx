import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatINR } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export default async function OrdersPage() {
  await requireAdmin("orders");
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { items: { select: { qty: true } } },
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Orders</h1>
      {orders.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">No orders yet.</p>
      ) : (
        <ul className="mt-6 divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
          {orders.map((o) => {
            const addr = o.shippingAddr as { name?: string; city?: string };
            const needsCheck = o.status === "PENDING_PAYMENT" && (o.paymentProofKey || o.paymentRef);
            return (
              <li key={o.id}>
                <Link
                  href={`/admin/orders/${o.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-neutral-50"
                >
                  <div className="min-w-0">
                    <p className="font-medium">
                      {o.number}
                      {needsCheck && (
                        <span className="ml-2 rounded-full bg-tribe px-2 py-0.5 text-xs font-medium text-white">
                          Verify payment
                        </span>
                      )}
                    </p>
                    <p className="truncate text-xs text-neutral-500">
                      {addr.name} · {addr.city} · {o.items.reduce((n, i) => n + i.qty, 0)} pcs ·{" "}
                      {o.createdAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                  <div className="shrink-0 text-right text-sm">
                    <p className="font-medium">{formatINR(o.total)}</p>
                    <p className="text-xs text-neutral-500">{o.status.replace(/_/g, " ").toLowerCase()}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
