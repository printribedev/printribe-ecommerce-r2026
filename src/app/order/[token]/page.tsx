import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dict, eventText, fmt } from "@/lib/i18n";
import { getLang } from "@/lib/lang";
import { formatINR } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { QUICK_PRODUCT as P, colourLabel, productText } from "@/lib/quick-product";
import { attachProof } from "../actions";
import { OrderHeader } from "../OrderHeader";
import { Stepper } from "../Stepper";
import { PaymentOptions } from "./PaymentOptions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Printribe", robots: { index: false } };

/** Screenshot upload needs the R2 bucket, so only offer it once that's configured. */
const uploadsEnabled = () => Boolean(process.env.R2_PRIVATE_BUCKET && process.env.R2_ACCOUNT_ID);

export default async function OrderStatusPage({ params }: { params: { token: string } }) {
  const order = await prisma.order.findUnique({
    where: { trackingToken: params.token },
    include: { items: true, events: { orderBy: { createdAt: "asc" } } },
  });
  if (!order) notFound();

  const lang = getLang();
  const t = dict[lang];
  const locale = lang === "kn" ? "kn-IN" : "en-IN";

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
      <OrderHeader lang={lang} />
      <Stepper current={stage} lang={lang} />

      {/* ───── Step 3: pay ───── */}
      {awaiting && !submitted && (
        <section className="rounded-2xl border border-neutral-200 bg-white p-5 text-center">
          <p className="text-sm text-neutral-500">{fmt(t.pay.order, { n: order.number })}</p>
          <h1 className="mt-1 text-xl font-bold">{fmt(t.pay.title, { amount: formatINR(order.total) })}</h1>
          <p className="mt-1 text-sm text-neutral-600">{t.pay.scan}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/upi-qr.png" alt={t.pay.qrAlt} className="mx-auto mt-4 w-56 max-w-full" />
          <p className="mt-2 text-xs text-neutral-500">{fmt(t.pay.noteHint, { n: order.number })}</p>

          <div className="mt-6 border-t pt-5">
            <h2 className="mb-3 text-left text-base font-semibold">{t.pay.afterPaid}</h2>
            <PaymentOptions
              token={order.trackingToken}
              lang={lang}
              uploadsEnabled={uploadsEnabled()}
              onScreenshot={attachProof.bind(null, order.trackingToken)}
            />
          </div>
        </section>
      )}

      {/* ───── Step 4: confirmation ───── */}
      {stage === 4 && (
        <section className="rounded-2xl border border-neutral-200 bg-white p-5 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-tribe text-2xl text-white">
            ✓
          </div>
          <p className="mt-3 text-sm font-semibold text-gold-dark">{t.done.thanks}</p>
          <h1 className="mt-1 text-xl font-bold">
            {awaiting ? t.done.submitted : order.status === "CANCELLED" ? t.done.cancelled : t.done.confirmed}
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            {awaiting
              ? t.done.bodySubmitted
              : order.status === "CANCELLED"
                ? t.done.bodyCancelled
                : t.done.bodyConfirmed}
          </p>
          <p className="mt-4 inline-block rounded-full bg-tribe-light px-3 py-1 text-sm font-medium text-tribe-dark">
            {order.number} · {t.status[order.status]}
          </p>
          {awaiting && order.paymentRef && (
            <p className="mt-3 text-xs text-neutral-500">{fmt(t.done.utrGiven, { ref: order.paymentRef })}</p>
          )}
          {awaiting && !order.paymentProofKey && whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="mt-4 block rounded-lg border border-neutral-300 px-4 py-3 text-sm font-medium hover:bg-neutral-50"
            >
              {t.done.whatsapp}
            </a>
          )}
        </section>
      )}

      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="font-semibold">{t.done.items}</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-3">
              <span>
                {i.sku === P.sku ? productText(lang).name : i.productName}
                <span className="block text-neutral-500">
                  {[i.colorName ? colourLabel(lang, i.colorName) : null, i.size].filter(Boolean).join(" · ")} · {i.qty} ×{" "}
                  {formatINR(i.unitPrice)}
                </span>
              </span>
              <span className="font-medium">{formatINR(i.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between border-t pt-3 text-sm text-neutral-600">
          <span>{t.done.delivery}</span>
          <span>{order.shipping === 0 ? t.done.free : formatINR(order.shipping)}</span>
        </p>
        <p className="mt-1 flex justify-between font-semibold">
          <span>{t.done.total}</span>
          <span>{formatINR(order.total)}</span>
        </p>
      </section>

      {stage === 4 && (
        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="font-semibold">{t.done.timeline}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {order.events.map((e) => (
              <li key={e.id} className="flex justify-between gap-3">
                <span>{eventText(lang, e.note, e.status)}</span>
                <span className="shrink-0 text-xs text-neutral-500">
                  {e.createdAt.toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" })}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-center text-xs text-neutral-500">{t.done.saveLink}</p>
    </main>
  );
}
