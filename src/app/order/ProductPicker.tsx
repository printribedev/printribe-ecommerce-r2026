"use client";

import Link from "next/link";
import { useState } from "react";
import { formatINR } from "@/lib/money";
import { unitPrice } from "@/lib/pricing";
import { QUICK_PRODUCT as P } from "@/lib/quick-product";

/** Simple tee silhouette tinted with the chosen colour, used until a real product photo is set. */
function TeeVisual({ hex }: { hex: string }) {
  return (
    <svg viewBox="0 0 200 200" className="mx-auto h-full w-full max-w-sm" role="img" aria-label={P.name}>
      <path
        d="M70 22 L18 52 L40 88 L60 75 L60 182 L140 182 L140 75 L160 88 L182 52 L130 22 Q100 44 70 22 Z"
        fill={hex}
        stroke="rgba(0,0,0,0.18)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ProductPicker() {
  const [size, setSize] = useState("");
  const [colour, setColour] = useState(P.colours[0].name);
  const [qty, setQty] = useState(P.moq);

  const unit = unitPrice({ basePrice: P.price, tiers: P.tiers, qty });
  const hex = P.colours.find((c) => c.name === colour)?.hex ?? "#fff";
  const next = `/order/details?${new URLSearchParams({ size, colour, qty: String(qty) })}`;

  return (
    <div className="space-y-6">
      <div className="aspect-square overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6">
        {P.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={P.image} alt={P.name} className="h-full w-full object-cover" />
        ) : (
          <TeeVisual hex={hex} />
        )}
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">
          Colour: <span className="font-normal text-neutral-600">{colour}</span>
        </p>
        <div className="flex gap-3">
          {P.colours.map((c) => (
            <button
              type="button"
              key={c.name}
              aria-label={c.name}
              aria-pressed={colour === c.name}
              onClick={() => setColour(c.name)}
              className={`h-11 w-11 rounded-full border-2 ${
                colour === c.name ? "border-tribe ring-2 ring-tribe/30" : "border-neutral-300"
              }`}
              style={{ background: c.hex }}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Size</p>
        <div className="flex flex-wrap gap-2">
          {P.sizes.map((s) => (
            <button
              type="button"
              key={s}
              aria-pressed={size === s}
              onClick={() => setSize(s)}
              className={`min-w-[3.25rem] rounded-lg border px-3 py-3 text-sm font-medium ${
                size === s ? "border-tribe bg-tribe text-white" : "border-neutral-300 bg-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Quantity</p>
        <div className="inline-flex items-center rounded-lg border border-neutral-300 bg-white">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => Math.max(P.moq, q - 1))}
            className="h-12 w-12 text-xl"
          >
            −
          </button>
          <span className="w-12 text-center font-medium">{qty}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQty((q) => Math.min(P.maxQty, q + 1))}
            className="h-12 w-12 text-xl"
          >
            +
          </button>
        </div>
        {P.tiers.length > 0 && (
          <p className="mt-2 text-xs text-neutral-500">
            {P.tiers.map((t) => `${t.minQty}+ pieces: ${formatINR(P.price - t.discount)} each`).join(" · ")}
          </p>
        )}
      </div>

      <div className="sticky bottom-0 -mx-4 border-t border-neutral-200 bg-paper/95 px-4 py-4 backdrop-blur">
        <div className="mb-3 flex items-baseline justify-between">
          <span className="text-sm text-neutral-600">
            {qty} × {formatINR(unit)}
          </span>
          <span className="text-xl font-bold">{formatINR(unit * qty)}</span>
        </div>
        {size ? (
          <Link
            href={next}
            className="block w-full rounded-lg bg-tribe px-4 py-4 text-center text-base font-semibold text-white hover:bg-tribe-dark"
          >
            Continue
          </Link>
        ) : (
          <button
            disabled
            className="block w-full rounded-lg bg-neutral-300 px-4 py-4 text-center text-base font-semibold text-white"
          >
            Choose a size to continue
          </button>
        )}
      </div>
    </div>
  );
}
