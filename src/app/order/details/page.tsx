import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { dict, fmt } from "@/lib/i18n";
import { getLang } from "@/lib/lang";
import { formatINR } from "@/lib/money";
import { shippingFee, unitPrice } from "@/lib/pricing";
import { QUICK_PRODUCT as P, colourLabel, productText } from "@/lib/quick-product";
import { DetailsForm } from "../DetailsForm";
import { OrderHeader } from "../OrderHeader";
import { parseSelection } from "../selection";
import { Stepper } from "../Stepper";

export const metadata: Metadata = { title: "Printribe", robots: { index: false } };

export default function DetailsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const selection = parseSelection(searchParams);
  if (!selection) redirect("/");

  const lang = getLang();
  const t = dict[lang].details;

  const unit = unitPrice({ basePrice: P.price, tiers: P.tiers, qty: selection.qty });
  const subtotal = unit * selection.qty;
  const shipping = shippingFee(subtotal, P.shipping);
  const total = formatINR(subtotal + shipping);
  const hex = P.colours.find((c) => c.name === selection.colour)?.hex ?? "#fff";

  return (
    <main className="mx-auto max-w-xl px-4 pb-16 pt-6">
      <OrderHeader lang={lang} />
      <Stepper current={2} lang={lang} />

      <section className="mb-6 flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4">
        <div className="relative h-16 w-[3.2rem] shrink-0 overflow-hidden rounded-lg border" style={{ background: hex }}>
          {P.images[0] && <Image src={P.images[0].src} alt="" fill sizes="52px" className="object-cover" />}
        </div>
        <div className="min-w-0 flex-1 text-sm">
          <p className="font-medium">{productText(lang).name}</p>
          <p className="text-neutral-600">
            {colourLabel(lang, selection.colour)} · {selection.size} · {selection.qty} × {formatINR(unit)}
          </p>
          <Link href="/" className="text-xs text-tribe underline">
            {t.change}
          </Link>
        </div>
        <div className="text-right text-sm">
          <p className="font-semibold">{formatINR(subtotal)}</p>
          <p className="text-xs text-neutral-500">
            {shipping === 0 ? t.plusFree : fmt(t.plusDelivery, { amount: formatINR(shipping) })}
          </p>
        </div>
      </section>

      <h1 className="mb-3 text-xl font-bold">{t.heading}</h1>
      <DetailsForm selection={selection} total={total} lang={lang} />
    </main>
  );
}
