import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { formatINR } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { QUICK_PRODUCT as P } from "@/lib/quick-product";
import { attachProof } from "../actions";
import { Stepper } from "../Stepper";
import { PaymentForm } from "./PaymentForm";

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

/** Screenshot upload needs the R2 bucket, so only offer it once that's configured. */
const uploadsEnabled = () => Boolean(process.env.R2_PRIVATE_BUCKET && process.env.R2_ACCOUNT_ID);

export default async function OrderStatusPage({ params }: { params: { token: string } }) {
  const order = await prisma.order.findUnique({
    where: { trackingToken: params.token },
    include: { items: true, events: { orderBy: { createdAt: "asc" } } },
  });
  if (!order) notFound();

  const awaiting = order.status === "PENDING_PAYMENT";
  const submitted = Boolean(order.paymentRef || order.paymentProofKey);
  const stage = awaiting && !submitted ? 3 : 4;
  const whatsappHref = P.whatsapp
    ? `https://wa.me/${P.whatsapp}?text=${encodeURIComponent(
        `Hi Printribe, I've paid ${formatINR(order.total)} for order ${order.number}. Screenshot attached.`
      )}`
    : null;

  return (
    <main className="mx-auto max-w-xl space-y-6 px-4 pb-16 pt-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/printribe-logo.png" alt="Printribe" className="h-8 w-auto" />
      <Stepper current={stage} />

      {/* ───── Step 3: pay ───── */}
      {awaiting && !submitted && (
        <section className="rounded-2xl border border-neutral-200 bg-white p-5 text-center">
          <p className="text-sm text-neutral-500">Order {order.number}</p>
          <h1 className="mt-1 text-xl font-bold">Pay {formatINR(order.total)} by UPI</h1>
          <p className="mt-1 text-sm text-neutral-600">Scan with any UPI app and pay the exact amount.</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/upi-qr.png" alt="UPI QR code" className="mx-auto mt-4 w-56 max-w-full" />
          <p className="mt-2 text-xs text-neutral-500">
            Add <b>{order.number}</b> in the payment note if your app allows.
          </p>

          <div className="mt-6 border-t pt-5">
            <h2 className="mb-3 text-left text-base font-semibold">After you&apos;ve paid</h2>
            <PaymentForm token={order.trackingToken} />
            {uploadsEnabled() && (
              <div className="mt-4 border-t pt-4 text-left">
                <p className="mb-2 text-sm font-medium">Optional: upload your payment screenshot</p>
                <ImageUploader kind="artwork" label="Upload screenshot" onDone={attachProof.bind(null, order.trackingToken)} />
              </div>
            )}
          </div>
        </section>
      )}

      {/* ───── Step 4: confirmation ───── */}
      {stage === 4 && (
        <section className="rounded-2xl border border-neutral-200 bg-white p-5 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-tribe text-2xl text-white">
            ✓
          </div>
          <h1 className="mt-3 text-xl font-bold">
            {awaiting ? "Payment submitted" : order.status === "CANCELLED" ? "Order cancelled" : "Order confirmed"}
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            {awaiting
              ? "We'll verify your payment and confirm your order shortly. You can close this page and come back to this link any time."
              : order.status === "CANCELLED"
                ? "This order was cancelled. Contact us if you think this is a mistake."
                : "Thank you! Your payment is confirmed and we're getting started."}
          </p>
          <p className="mt-4 inline-block rounded-full bg-tribe-light px-3 py-1 text-sm font-medium text-tribe-dark">
            {order.number} · {STATUS_COPY[order.status] ?? order.status}
          </p>
          {awaiting && order.paymentRef && (
            <p className="mt-3 text-xs text-neutral-500">Transaction ID you gave us: {order.paymentRef}</p>
          )}
          {awaiting && !order.paymentProofKey && whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="mt-4 block rounded-lg border border-neutral-300 px-4 py-3 text-sm font-medium hover:bg-neutral-50"
            >
              Send payment screenshot on WhatsApp
            </a>
          )}
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

      {stage === 4 && (
        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="font-semibold">Order timeline</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {order.events.map((e) => (
              <li key={e.id} className="flex justify-between gap-3">
                <span>{e.note ?? STATUS_COPY[e.status]}</span>
                <span className="shrink-0 text-xs text-neutral-500">
                  {e.createdAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-center text-xs text-neutral-500">
        Save this page&apos;s link to check your order status any time.
      </p>
    </main>
  );
}
