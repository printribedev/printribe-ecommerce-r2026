import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { formatINR } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { attachProof } from "../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your order · Printribe", robots: { index: false } };

const STATUS_COPY: Record<string, string> = {
  PENDING_PAYMENT: "Awaiting payment",
  PAID: "Payment confirmed",
  IN_DESIGN: "In design",
  IN_PRODUCTION: "In production",
  QC: "Quality check",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

export default async function OrderStatusPage({ params }: { params: { token: string } }) {
  const order = await prisma.order.findUnique({
    where: { trackingToken: params.token },
    include: { items: true },
  });
  if (!order) notFound();

  const awaiting = order.status === "PENDING_PAYMENT";
  const proofSent = Boolean(order.paymentProofKey);

  return (
    <main className="mx-auto max-w-xl space-y-6 px-4 pb-16 pt-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/printribe-logo.png" alt="Printribe" className="h-8 w-auto" />

      <div>
        <p className="text-sm text-neutral-500">Order</p>
        <h1 className="text-2xl font-bold">{order.number}</h1>
        <p className="mt-1 inline-block rounded-full bg-tribe-light px-3 py-1 text-sm font-medium text-tribe-dark">
          {STATUS_COPY[order.status] ?? order.status}
        </p>
      </div>

      {awaiting && (
        <section className="rounded-2xl border border-neutral-200 bg-white p-5 text-center">
          <h2 className="text-lg font-semibold">Pay {formatINR(order.total)} by UPI</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Scan with any UPI app and pay the exact amount.
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/upi-qr.png" alt="UPI QR code" className="mx-auto mt-4 w-56 max-w-full" />
          <p className="mt-3 text-xs text-neutral-500">
            Mention <b>{order.number}</b> in the payment note if your app allows.
          </p>

          <div className="mt-5 border-t pt-5">
            {proofSent ? (
              <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
                Screenshot received. We&apos;ll verify your payment and confirm shortly.
              </p>
            ) : (
              <>
                <p className="mb-3 text-sm font-medium">After paying, upload the payment screenshot</p>
                <div className="flex justify-center">
                  <ImageUploader kind="artwork" label="Upload screenshot" onDone={attachProof.bind(null, order.trackingToken)} />
                </div>
              </>
            )}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="font-semibold">Items</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-3">
              <span>
                {i.productName}
                <span className="block text-neutral-500">
                  {[i.colorName, i.size].filter(Boolean).join(" · ")} · {i.qty} × {formatINR(i.unitPrice)}
                </span>
              </span>
              <span className="font-medium">{formatINR(i.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between border-t pt-3 font-semibold">
          <span>Total</span>
          <span>{formatINR(order.total)}</span>
        </p>
      </section>

      <p className="text-center text-xs text-neutral-500">
        Save this page&apos;s link to check your order status any time.
      </p>
    </main>
  );
}
