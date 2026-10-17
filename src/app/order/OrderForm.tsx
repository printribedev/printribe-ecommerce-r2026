"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { INDIAN_STATES } from "@/lib/india";
import { formatINR } from "@/lib/money";
import { unitPrice } from "@/lib/pricing";
import { QUICK_PRODUCT as P } from "@/lib/quick-product";
import { placeOrder, type OrderFormState } from "./actions";

const field =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-3 text-base outline-none focus:border-tribe";

function Submit({ total }: { total: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="w-full rounded-lg bg-tribe px-4 py-4 text-base font-semibold text-white hover:bg-tribe-dark disabled:opacity-60"
    >
      {pending ? "Placing order…" : `Place order · ${total}`}
    </button>
  );
}

export function OrderForm() {
  const [state, action] = useFormState<OrderFormState, FormData>(placeOrder, {});
  const [size, setSize] = useState("");
  const [colour, setColour] = useState(P.colours[0].name);
  const [qty, setQty] = useState(P.moq);

  const unit = unitPrice({ basePrice: P.price, tiers: P.tiers, qty });
  const total = formatINR(unit * qty);
  const hex = P.colours.find((c) => c.name === colour)?.hex ?? "#fff";

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="size" value={size} />
      <input type="hidden" name="colour" value={colour} />
      <input type="hidden" name="qty" value={qty} />

      <section className="space-y-5">
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
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Delivery details</h2>
        <input name="name" required autoComplete="name" placeholder="Full name" className={field} />
        <input name="phone" required type="tel" inputMode="numeric" autoComplete="tel" placeholder="Mobile number" className={field} />
        <input name="email" required type="email" autoComplete="email" placeholder="Email" className={field} />
        <input name="line1" required autoComplete="address-line1" placeholder="Address line 1" className={field} />
        <input name="line2" autoComplete="address-line2" placeholder="Address line 2 (optional)" className={field} />
        <div className="grid grid-cols-2 gap-3">
          <input name="city" required autoComplete="address-level2" placeholder="City" className={field} />
          <input name="pincode" required inputMode="numeric" maxLength={6} autoComplete="postal-code" placeholder="Pincode" className={field} />
        </div>
        <select name="state" required defaultValue="" autoComplete="address-level1" className={field}>
          <option value="" disabled>
            State
          </option>
          {INDIAN_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-4 rounded-xl bg-white p-4">
          <div className="h-12 w-12 shrink-0 rounded-lg border" style={{ background: hex }} />
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-medium">{P.name}</p>
            <p className="text-neutral-600">
              {colour}
              {size ? ` · ${size}` : ""} · {qty} × {formatINR(unit)}
            </p>
          </div>
          <p className="font-semibold">{total}</p>
        </div>

        {state.error && (
          <p role="alert" className="rounded-lg bg-tribe-light px-3 py-2 text-sm text-tribe-dark">
            {state.error}
          </p>
        )}
        {!size && <p className="text-sm text-neutral-500">Choose a size to continue.</p>}
        <Submit total={total} />
        <p className="text-center text-xs text-neutral-500">
          You&apos;ll pay by UPI on the next screen. Prices include GST.
        </p>
      </section>
    </form>
  );
}
