import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { formatINR } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { presignDownload } from "@/lib/r2";
import { Card, DangerButton, PrimaryButton } from "@/components/admin/ui";
import { advanceOrder, cancelOrder, confirmPayment } from "../actions";

const NEXT_STEP = {
  PAID: ["IN_DESIGN", "Move to design"],
  IN_DESIGN: ["IN_PRODUCTION", "Move to production"],
  IN_PRODUCTION: ["QC", "Move to quality check"],
  QC: ["SHIPPED", "Mark shipped"],
  SHIPPED: ["DELIVERED", "Mark delivered"],
} as const;

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  await requireAdmin("orders");
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true, events: { orderBy: { createdAt: "desc" } } },
  });
  if (!order) notFound();

  const addr = order.shippingAddr as Record<string, string | null>;
  const proofUrl = order.paymentProofKey ? await presignDownload(order.paymentProofKey, 600) : null;
  const next = NEXT_STEP[order.status as keyof typeof NEXT_STEP];

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div>
        <Link href="/admin/orders" className="text-sm text-neutral-500 hover:underline">
          ← Orders
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">{order.number}</h1>
        <p className="text-sm text-neutral-500">
          {order.status.replace(/_/g, " ").toLowerCase()} · {formatINR(order.total)}
        </p>
      </div>

      {order.status === "PENDING_PAYMENT" && (
        <Card title="Verify payment" desc={`Check ${formatINR(order.total)} has reached your bank/UPI, then confirm.`}>
          <p className="mb-3 text-sm">
            UPI transaction ID from customer:{" "}
            {order.paymentRef ? (
              <b className="font-mono">{order.paymentRef}</b>
            ) : (
              <span className="text-neutral-500">not given yet</span>
            )}
          </p>
          {proofUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={proofUrl} alt="Payment screenshot" className="max-h-96 rounded-lg border" />
          ) : (
            <p className="text-sm text-neutral-500">No screenshot uploaded.</p>
          )}
          <div className="mt-4 flex gap-3">
            <form action={confirmPayment.bind(null, order.id)}>
              <PrimaryButton>Confirm payment received</PrimaryButton>
            </form>
            <form action={cancelOrder.bind(null, order.id)}>
              <DangerButton>Cancel order</DangerButton>
            </form>
          </div>
        </Card>
      )}

      {next && (
        <Card title="Progress">
          <form action={advanceOrder.bind(null, order.id, next[0])}>
            <PrimaryButton>{next[1]}</PrimaryButton>
          </form>
        </Card>
      )}

      <Card title="Items">
        <ul className="space-y-2 text-sm">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-3">
              <span>
                {i.productName} <span className="text-neutral-500">({i.sku})</span>
                <span className="block text-neutral-500">
                  {[i.colorName, i.size].filter(Boolean).join(" · ")} · {i.qty} × {formatINR(i.unitPrice)}
                </span>
              </span>
              <span className="font-medium">{formatINR(i.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 flex justify-between border-t pt-3 text-sm text-neutral-600">
          <span>Delivery</span>
          <span>{order.shipping === 0 ? "Free" : formatINR(order.shipping)}</span>
        </p>
        <p className="mt-1 flex justify-between text-sm font-semibold">
          <span>Total</span>
          <span>{formatINR(order.total)}</span>
        </p>
      </Card>

      <Card title="Customer & delivery">
        <p className="text-sm leading-relaxed">
          <b>{addr.name}</b>
          <br />
          {order.phone} · {order.email}
          <br />
          {addr.line1}
          {addr.line2 ? `, ${addr.line2}` : ""}
          <br />
          {addr.city}, {addr.state} {addr.pincode}
        </p>
      </Card>

      <Card title="History">
        <ul className="space-y-1 text-sm">
          {order.events.map((e) => (
            <li key={e.id} className="flex justify-between gap-3">
              <span>{e.note ?? e.status}</span>
              <span className="shrink-0 text-xs text-neutral-500">
                {e.createdAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </main>
  );
}
