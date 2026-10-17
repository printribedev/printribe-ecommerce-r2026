import { dict, type Lang } from "@/lib/i18n";
import { QUICK_PRODUCT as P } from "@/lib/quick-product";

/** Size guide table. The customer's current size is highlighted. */
export function SizeChart({ selected, lang }: { selected: string; lang: Lang }) {
  const t = dict[lang].sizeGuide;
  return (
    <details className="mt-3 rounded-xl border border-neutral-200 bg-white">
      <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-tribe">{t.title}</summary>
      <div className="px-4 pb-4">
        <table className="w-full text-center text-sm">
          <thead>
            <tr className="border-b text-xs text-neutral-500">
              <th className="py-2 text-left font-medium">{t.size}</th>
              <th className="font-medium">{t.chest}</th>
              <th className="font-medium">{t.width}</th>
              <th className="font-medium">{t.height}</th>
            </tr>
          </thead>
          <tbody>
            {P.sizeChart.map((r) => (
              <tr
                key={r.size}
                className={`border-b last:border-0 ${r.size === selected ? "bg-tribe-light font-semibold" : ""}`}
              >
                <td className="py-2 text-left">{r.size}</td>
                <td>{r.chest}</td>
                <td>{r.width}</td>
                <td>{r.height}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-xs leading-relaxed text-neutral-500">{t.note}</p>
      </div>
    </details>
  );
}
