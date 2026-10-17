import { getLang } from "@/lib/lang";
import { dict } from "@/lib/i18n";
import { formatINR } from "@/lib/money";
import { QUICK_PRODUCT as P, productText } from "@/lib/quick-product";
import { OrderHeader } from "./OrderHeader";
import { ProductPicker } from "./ProductPicker";
import { Stepper } from "./Stepper";

/** Step 1 of the order flow. Shown at the site root ("/"). */
export function ProductView() {
  const lang = getLang();
  const text = productText(lang);
  const t = dict[lang];

  return (
    <>
      {/* Karnataka flag colours */}
      <div aria-hidden className="h-1.5 w-full bg-gradient-to-b from-gold from-50% to-tribe to-50%" />
      <main className="mx-auto max-w-xl px-4 pb-0 pt-6">
        <OrderHeader lang={lang} />
        <Stepper current={1} lang={lang} />

        <p className="text-xs font-semibold uppercase tracking-wider text-gold-dark">{text.eyebrow}</p>
        <h1 className="mt-1 text-3xl font-extrabold leading-tight">{text.name}</h1>
        <p className="mt-2 text-lg font-medium text-tribe-dark">{text.tagline}</p>
        <p className="mt-4 text-2xl font-semibold">
          {formatINR(P.price)} <span className="text-sm font-normal text-neutral-500">{t.product.perPiece}</span>
        </p>
        <p className="mt-1 text-xs text-neutral-500">{t.product.buyMore}</p>
        <p className="mt-4 text-sm leading-relaxed text-neutral-700">{text.description}</p>

        <ul className="mb-6 mt-4 grid grid-cols-2 gap-2 text-sm font-medium">
          {text.highlights.map((h) => (
            <li key={h} className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2">
              <span aria-hidden className="text-gold-dark">
                ✦
              </span>
              {h}
            </li>
          ))}
        </ul>

        <ProductPicker lang={lang} />

        <p className="mb-24 mt-10 text-center text-sm font-semibold uppercase tracking-wider text-gold-dark">
          {text.closing}
        </p>
      </main>
    </>
  );
}
