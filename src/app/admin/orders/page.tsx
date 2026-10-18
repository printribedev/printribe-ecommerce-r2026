import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatINR } from "@/lib/money";
import { STATUS_ORDER, isOrderStatus, statusLabel } from "@/lib/order-status";
import { prisma } from "@/lib/prisma";

export default async function OrdersPage({ searchParams }: { searchParams: { status?: string } }) {
  await requireAdmin("orders");

  // ?status=PAID filters the list; anything else (or nothing) shows every order.
  const active = isOrderStatus(searchParams.status) ? searchParams.status : null;

  const [orders, grouped] = await Promise.all([
    prisma.order.findMany({
      where: active ? { status: active } : undefined,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { items: { select: { qty: true } } },
    }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const countOf = (status: string) => grouped.find((g) => g.status === status)?._count._all ?? 0;
  const total = grouped.reduce((n, g) => n + g._count._all, 0);

  const chip = (href: string, label: string, count: number, selected: boolean) => (
    <Link
      key={label}
      href={href}
      aria-current={selected ? "page" : undefined}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium ${
        selected
          ? "border-tribe bg-tribe text-white"
          : "border-neutral-300 bg-white text-neutral-700 hover:border-tribe hover:text-tribe"
      }`}
    >
      {label} <span className={selected ? "text-white/80" : "text-neutral-400"}>{count}</span>
    </Link>
  );

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Orders</h1>

      <nav aria-label="Filter by status" className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {chip("/admin/orders", "All", total, active === null)}
        {STATUS_ORDER.map((s) => chip(`/admin/orders?status=${s}`, statusLabel(s), countOf(s), active === s))}
      </nav>

      {orders.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">
          {active ? `No orders with the status “${statusLabel(active)}”.` : "No orders yet."}
        </p>
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
                    <p className="text-xs text-neutral-500">{statusLabel(o.status)}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      {orders.length === 200 && (
        <p className="mt-3 text-xs text-neutral-500">Showing the latest 200 orders.</p>
      )}
    </main>
  );
}
