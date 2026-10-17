/**
 * Price maths, in integer paise. Used by admin previews now and by the cart/checkout later —
 * the server must always recompute from the DB, never trust a price sent by the browser.
 *
 *   unit price = product.basePrice + variant.priceDelta − best matching quantity tier
 *   line total = (unit price + fees of the placements used) × qty
 */
export type Tier = { minQty: number; discount: number };

export function tierDiscount(tiers: Tier[], qty: number): number {
  return tiers
    .filter((t) => qty >= t.minQty)
    .reduce((best, t) => Math.max(best, t.discount), 0);
}

export function unitPrice(opts: {
  basePrice: number;
  priceDelta?: number;
  tiers?: Tier[];
  qty: number;
}): number {
  const raw = opts.basePrice + (opts.priceDelta ?? 0) - tierDiscount(opts.tiers ?? [], opts.qty);
  return Math.max(0, raw);
}

/** Flat delivery fee, free once the items total reaches `freeAbove`. All values in paise. */
export function shippingFee(subtotal: number, rule: { fee: number; freeAbove: number }): number {
  return subtotal >= rule.freeAbove ? 0 : rule.fee;
}

export function lineTotal(opts: {
  basePrice: number;
  priceDelta?: number;
  tiers?: Tier[];
  placementFees?: number[];
  qty: number;
}): number {
  const fees = (opts.placementFees ?? []).reduce((a, b) => a + b, 0);
  return (unitPrice(opts) + fees) * opts.qty;
}
