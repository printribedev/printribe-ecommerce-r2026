import { formatINR } from "@/lib/money";
import { QUICK_PRODUCT as P } from "@/lib/quick-product";
import { ProductPicker } from "./ProductPicker";
import { Stepper } from "./Stepper";

/** Step 1 of the order flow. Shown at the site root ("/"). */
export function ProductView() {
  return (
    <>
      {/* Karnataka flag colours */}
      <div aria-hidden className="h-1.5 w-full bg-gradient-to-b from-gold from-50% to-tribe to-50%" />
      <main className="mx-auto max-w-xl px-4 pb-0 pt-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/printribe-logo.png" alt="Printribe" className="mb-5 h-8 w-auto" />
        <Stepper current={1} />

        <p className="text-xs font-semibold uppercase tracking-wider text-gold-dark">{P.eyebrow}</p>
        <h1 className="mt-1 text-3xl font-extrabold leading-tight">{P.name}</h1>
        <p className="mt-2 text-lg font-medium text-tribe-dark">{P.tagline}</p>
        <p className="mt-4 text-2xl font-semibold">
          {formatINR(P.price)} <span className="text-sm font-normal text-neutral-500">per piece, incl. GST</span>
        </p>
        <p className="mt-1 text-xs text-neutral-500">
          Buy more, pay less per piece. See prices below.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-neutral-700">{P.description}</p>

        <ul className="mb-6 mt-4 grid grid-cols-2 gap-2 text-sm font-medium">
          {P.highlights.map((h) => (
            <li key={h} className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2">
              <span aria-hidden className="text-gold-dark">
                ✦
              </span>
              {h}
            </li>
          ))}
        </ul>

        <ProductPicker />

        <p className="mb-24 mt-10 text-center text-sm font-semibold uppercase tracking-wider text-gold-dark">
          {P.closing}
        </p>
      </main>
    </>
  );
}
