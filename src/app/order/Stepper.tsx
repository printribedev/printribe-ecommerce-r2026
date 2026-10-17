import { dict, type Lang } from "@/lib/i18n";

/** Progress bar shown on every step of the order flow. `current` is 1-based. */
export function Stepper({ current, lang }: { current: 1 | 2 | 3 | 4; lang: Lang }) {
  const steps = dict[lang].stepper;
  return (
    <ol className="mb-6 flex items-center gap-2 text-xs">
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <li key={n} className="flex flex-1 items-center gap-2">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                done || active ? "bg-tribe text-white" : "bg-neutral-200 text-neutral-500"
              }`}
            >
              {done ? "✓" : n}
            </span>
            <span className={`hidden sm:inline ${active ? "font-semibold" : "text-neutral-500"}`}>{label}</span>
            {n < steps.length && <span className="h-px flex-1 bg-neutral-300" />}
          </li>
        );
      })}
    </ol>
  );
}
