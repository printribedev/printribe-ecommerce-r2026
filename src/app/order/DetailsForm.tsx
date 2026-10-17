"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { INDIAN_STATES } from "@/lib/india";
import {
  validateAddressLine1,
  validateAddressLine2,
  validateCity,
  validateEmail,
  validateName,
  validatePhone,
  validatePincode,
} from "@/lib/validation";
import { placeOrder, type OrderFormState } from "./actions";
import type { Selection } from "./selection";

const base = "w-full rounded-lg border bg-white px-3 py-3 text-base outline-none focus:border-tribe";

function Submit({ total }: { total: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="w-full rounded-lg bg-tribe px-4 py-4 text-base font-semibold text-white hover:bg-tribe-dark disabled:opacity-60"
    >
      {pending ? "Checking and placing order…" : `Continue to payment · ${total}`}
    </button>
  );
}

/** The same rules the server enforces, so mistakes show up as the customer types. */
const RULES: Record<string, (v: string) => string | null> = {
  name: validateName,
  phone: validatePhone,
  email: validateEmail,
  line1: validateAddressLine1,
  line2: validateAddressLine2,
  city: validateCity,
  pincode: validatePincode,
  state: (v) => (v ? null : "Choose your state."),
};

export function DetailsForm({ selection, total }: { selection: Selection; total: string }) {
  const [state, action] = useFormState<OrderFormState, FormData>(placeOrder, {});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Problems found by the server (fake-looking details, unknown email domain, pincode/state mismatch).
  useEffect(() => {
    if (state.error) setErrors((e) => ({ ...e, [state.field || "form"]: state.error! }));
  }, [state]);

  const check = (name: string, value: string) =>
    setErrors((e) => {
      const next = { ...e };
      const msg = RULES[name]?.(value) ?? null;
      if (msg) next[name] = msg;
      else delete next[name];
      return next;
    });
  const clear = (name: string) =>
    setErrors((e) => {
      if (!e[name] && !e.form) return e;
      const next = { ...e };
      delete next[name];
      delete next.form;
      return next;
    });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    const data = new FormData(e.currentTarget);
    const found: Record<string, string> = {};
    for (const [name, rule] of Object.entries(RULES)) {
      const msg = rule(String(data.get(name) ?? ""));
      if (msg) found[name] = msg;
    }
    if (Object.keys(found).length > 0) {
      e.preventDefault();
      setErrors(found);
      e.currentTarget.querySelector<HTMLElement>(`[name="${Object.keys(found)[0]}"]`)?.focus();
    }
  }

  const input = (name: string, props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <input
        name={name}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
        onBlur={(e) => check(name, e.target.value)}
        onChange={() => clear(name)}
        className={`${base} ${errors[name] ? "border-tribe-dark bg-tribe-light/40" : "border-neutral-300"}`}
        {...props}
      />
      {errors[name] && (
        <p id={`${name}-error`} role="alert" className="mt-1 text-sm text-tribe-dark">
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <form action={action} onSubmit={onSubmit} noValidate className="space-y-3">
      <input type="hidden" name="size" value={selection.size} />
      <input type="hidden" name="colour" value={selection.colour} />
      <input type="hidden" name="qty" value={selection.qty} />

      {input("name", { required: true, autoComplete: "name", placeholder: "Full name (first and last name)" })}
      {input("phone", { required: true, type: "tel", inputMode: "numeric", autoComplete: "tel", placeholder: "Mobile number" })}
      {input("email", { required: true, type: "email", autoComplete: "email", placeholder: "Email" })}
      {input("line1", { required: true, autoComplete: "address-line1", placeholder: "House / flat no., street, area" })}
      {input("line2", { autoComplete: "address-line2", placeholder: "Landmark, address line 2 (optional)" })}
      <div className="grid grid-cols-2 items-start gap-3">
        {input("city", { required: true, autoComplete: "address-level2", placeholder: "City" })}
        {input("pincode", { required: true, inputMode: "numeric", maxLength: 6, autoComplete: "postal-code", placeholder: "Pincode" })}
      </div>
      <div>
        <select
          name="state"
          required
          defaultValue=""
          autoComplete="address-level1"
          onBlur={(e) => check("state", e.target.value)}
          onChange={(e) => {
            clear("state");
            clear("pincode");
            void e;
          }}
          className={`${base} ${errors.state ? "border-tribe-dark" : "border-neutral-300"}`}
        >
          <option value="" disabled>
            State
          </option>
          {INDIAN_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {errors.state && (
          <p role="alert" className="mt-1 text-sm text-tribe-dark">
            {errors.state}
          </p>
        )}
      </div>

      {errors.form && (
        <p role="alert" className="rounded-lg bg-tribe-light px-3 py-2 text-sm text-tribe-dark">
          {errors.form}
        </p>
      )}

      <div className="pt-3">
        <Submit total={total} />
        <p className="mt-2 text-center text-xs text-neutral-500">
          Please use real details. We deliver to this address and confirm your order on this number and email.
        </p>
      </div>
    </form>
  );
}
