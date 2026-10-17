"use client";

import Link from "next/link";
import { useState } from "react";
import { formatINR } from "@/lib/money";
import { shippingFee, unitPrice } from "@/lib/pricing";
import { QUICK_PRODUCT as P } from "@/lib/quick-product";
import { SizeChart } from "./SizeChart";

/**
 * Polo illustration (collar, placket, embroidered Karnataka-flag emblem on the left chest),
 * tinted with the chosen colour. Shown until a real product photo is set in quick-product.ts.
 */
function PoloVisual({ hex }: { hex: string }) {
  return (
    <svg viewBox="0 0 200 200" className="mx-auto h-full w-full max-w-sm" role="img" aria-label={P.name}>
      {/* body and sleeves */}
      <path
        d="M72 24 L16 54 L38 92 L60 78 L60 184 L140 184 L140 78 L162 92 L184 54 L128 24 Z"
        fill={hex}
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* collar */}
      <path d="M72 24 L88 22 L100 44 L112 22 L128 24 L118 50 L100 58 L82 50 Z" fill={hex} stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinejoin="round" />
      {/* placket and buttons */}
      <line x1="100" y1="44" x2="100" y2="82" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
      <circle cx="96" cy="64" r="1.8" fill="rgba(255,255,255,0.55)" />
      <circle cx="96" cy="74" r="1.8" fill="rgba(255,255,255,0.55)" />
      {/* embroidered emblem, left chest */}
      <g transform="translate(118 78)">
        <rect x="0" y="0" width="16" height="5" rx="1" fill="#F2B705" />
        <rect x="0" y="5" width="16" height="5" rx="1" fill="#EE3C30" />
      </g>
    </svg>
  );
}

export function ProductPicker() {
  const [size, setSize] = useState("");
  const [colour, setColour] = useState(P.colours[0].name);
  const [qty, setQty] = useState(P.moq);

  const unit = unitPrice({ basePrice: P.price, tiers: P.tiers, qty });
  const subtotal = unit * qty;
  const shipping = shippingFee(subtotal, P.shipping);
  const hex = P.colours.find((c) => c.name === colour)?.hex ?? "#fff";
  const next = `/order/details?${new URLSearchParams({ size, colour, qty: String(qty) })}`;

  return (
    <div className="space-y-6">
      <div className="aspect-square overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6">
        {P.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={P.image} alt={P.name} className="h-full w-full object-cover" />
        ) : (
          <PoloVisual hex={hex} />
        )}
      </div>

      {P.colours.length > 1 ? (
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
      ) : (
        <p className="text-sm font-medium">
          Colour: <span className="font-normal text-neutral-600">{colour}</span>
        </p>
      )}

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
        <SizeChart selected={size} />
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
        <div className="mb-3 space-y-1 text-sm text-neutral-600">
          <div className="flex justify-between">
            <span>
              {qty} × {formatINR(unit)}
            </span>
            <span>{formatINR(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>{shipping === 0 ? "Free" : formatINR(shipping)}</span>
          </div>
          <div className="flex items-baseline justify-between pt-1 text-foreground">
            <span className="font-medium">Total</span>
            <span className="text-xl font-bold">{formatINR(subtotal + shipping)}</span>
          </div>
          {shipping > 0 && (
            <p className="text-xs text-tribe-dark">
              Add {formatINR(P.shipping.freeAbove - subtotal)} more for free delivery
            </p>
          )}
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
