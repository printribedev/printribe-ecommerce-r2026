import type { Metadata } from "next";
import { dict } from "@/lib/i18n";
import { getLang } from "@/lib/lang";
import { OrderHeader } from "../order/OrderHeader";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Printribe", robots: { index: false } };

/** Shown instead of the product page and delivery form once the storefront is closed (see src/lib/site.ts). */
export default function ClosedPage() {
  const lang = getLang();
  const t = dict[lang].closed;
  return (
    <>
      <div aria-hidden className="h-1.5 w-full bg-gradient-to-b from-gold from-50% to-tribe to-50%" />
      <main className="mx-auto flex min-h-[80vh] max-w-xl flex-col px-4 pt-6">
        <OrderHeader lang={lang} />
        <div className="flex flex-1 flex-col items-center justify-center pb-16 text-center">
          <h1 className="text-3xl font-extrabold leading-tight">{t.title}</h1>
          <p className="mt-4 text-base leading-relaxed text-neutral-700">{t.body}</p>
          <p className="mt-6 text-sm text-neutral-500">{t.existing}</p>
        </div>
      </main>
    </>
  );
}
