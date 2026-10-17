"use client";

import { useFormState, useFormStatus } from "react-dom";
import { INDIAN_STATES } from "@/lib/india";
import { placeOrder, type OrderFormState } from "./actions";
import type { Selection } from "./selection";

const field =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-3 text-base outline-none focus:border-tribe";

function Submit({ total }: { total: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="w-full rounded-lg bg-tribe px-4 py-4 text-base font-semibold text-white hover:bg-tribe-dark disabled:opacity-60"
    >
      {pending ? "Placing order…" : `Continue to payment · ${total}`}
    </button>
  );
}

export function DetailsForm({ selection, total }: { selection: Selection; total: string }) {
  const [state, action] = useFormState<OrderFormState, FormData>(placeOrder, {});

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="size" value={selection.size} />
      <input type="hidden" name="colour" value={selection.colour} />
      <input type="hidden" name="qty" value={selection.qty} />

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

      {state.error && (
        <p role="alert" className="rounded-lg bg-tribe-light px-3 py-2 text-sm text-tribe-dark">
          {state.error}
        </p>
      )}

      <div className="pt-3">
        <Submit total={total} />
        <p className="mt-2 text-center text-xs text-neutral-500">You&apos;ll pay by UPI on the next step.</p>
      </div>
    </form>
  );
}
