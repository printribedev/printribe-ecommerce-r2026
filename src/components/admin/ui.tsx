/** Tiny shared form pieces so admin pages stay consistent. */
import type { ReactNode } from "react";

export const inputCls =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-tribe";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-neutral-500">{hint}</span>}
    </label>
  );
}

export function Card({ title, children, desc }: { title: string; desc?: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5">
      <h2 className="text-base font-semibold">{title}</h2>
      {desc && <p className="mt-0.5 text-sm text-neutral-500">{desc}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function PrimaryButton({ children }: { children: ReactNode }) {
  return (
    <button className="rounded-md bg-tribe px-4 py-2 text-sm font-medium text-white hover:bg-tribe-dark">
      {children}
    </button>
  );
}

export function DangerButton({ children }: { children: ReactNode }) {
  return (
    <button className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-tribe-dark hover:bg-tribe-light">
      {children}
    </button>
  );
}

export function ErrorBanner({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mb-4 rounded-md bg-tribe-light px-3 py-2 text-sm text-tribe-dark">{message}</p>;
}
