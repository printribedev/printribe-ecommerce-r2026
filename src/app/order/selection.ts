import { z } from "zod";
import { QUICK_PRODUCT as P } from "@/lib/quick-product";

const Selection = z.object({
  size: z.string().refine((s) => P.sizes.includes(s)),
  colour: z.string().refine((c) => P.colours.some((x) => x.name === c)),
  qty: z.coerce.number().int().min(P.moq).max(P.maxQty),
});

export type Selection = z.infer<typeof Selection>;

/** The product page passes the customer's choices to the next step in the URL. */
export function parseSelection(
  searchParams: Record<string, string | string[] | undefined>
): Selection | null {
  const flat = Object.fromEntries(
    Object.entries(searchParams).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
  );
  const parsed = Selection.safeParse(flat);
  return parsed.success ? parsed.data : null;
}
