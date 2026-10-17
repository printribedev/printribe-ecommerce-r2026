import type { Metadata } from "next";
import { formatINR } from "@/lib/money";
import { QUICK_PRODUCT as P } from "@/lib/quick-product";
import { ProductPicker } from "./ProductPicker";
import { Stepper } from "./Stepper";

export const metadata: Metadata = {
  title: `${P.name} · Printribe`,
  description: P.tagline,
};

export default function OrderPage() {
  return (
    <main className="mx-auto max-w-xl px-4 pb-0 pt-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/printribe-logo.png" alt="Printribe" className="mb-5 h-8 w-auto" />
      <Stepper current={1} />

      <h1 className="text-2xl font-bold">{P.name}</h1>
      <p className="mt-1 text-neutral-600">{P.tagline}</p>
      <p className="mt-3 text-2xl font-semibold">
        {formatINR(P.price)} <span className="text-sm font-normal text-neutral-500">per piece, incl. GST</span>
      </p>
      <p className="mb-6 mt-3 text-sm leading-relaxed text-neutral-700">{P.description}</p>

      <ProductPicker />
    </main>
  );
}
