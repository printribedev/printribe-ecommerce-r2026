"use client";

import { useFormState, useFormStatus } from "react-dom";
import { submitPayment, type OrderFormState } from "../actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="w-full rounded-lg bg-tribe px-4 py-4 text-base font-semibold text-white hover:bg-tribe-dark disabled:opacity-60"
    >
      {pending ? "Submitting…" : "I've paid"}
    </button>
  );
}

export function PaymentForm({ token }: { token: string }) {
  const [state, action] = useFormState<OrderFormState, FormData>(submitPayment.bind(null, token), {});
  return (
    <form action={action} className="space-y-3 text-left">
      <label className="block text-sm font-medium" htmlFor="ref">
        UPI transaction ID (UTR)
      </label>
      <input
        id="ref"
        name="ref"
        required
        inputMode="text"
        autoComplete="off"
        placeholder="e.g. 412345678901"
        className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-3 text-base outline-none focus:border-tribe"
      />
      <p className="text-xs text-neutral-500">
        Find it in your UPI app under the payment details, as &quot;UPI transaction ID&quot; or &quot;UTR&quot;.
      </p>
      {state.error && (
        <p role="alert" className="rounded-lg bg-tribe-light px-3 py-2 text-sm text-tribe-dark">
          {state.error}
        </p>
      )}
      <Submit />
    </form>
  );
}
