const STEPS = ["Choose", "Your details", "Pay", "Done"];

/** Progress bar shown on every step of the order flow. `current` is 1-based. */
export function Stepper({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <ol className="mb-6 flex items-center gap-2 text-xs">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                done || active ? "bg-tribe text-white" : "bg-neutral-200 text-neutral-500"
              }`}
            >
              {done ? "✓" : n}
            </span>
            <span className={`hidden sm:inline ${active ? "font-semibold" : "text-neutral-500"}`}>{label}</span>
            {n < STEPS.length && <span className="h-px flex-1 bg-neutral-300" />}
          </li>
        );
      })}
    </ol>
  );
}
