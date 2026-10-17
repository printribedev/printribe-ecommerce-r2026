import type { Tier } from "@/lib/pricing";

/**
 * The one product sold on /order. This is deliberately hard-coded for the quick launch;
 * once the catalogue pages (phase 3) exist, /order is replaced by /products/[slug] reading the DB.
 * EDIT THE VALUES BELOW to match the real product.
 */
export const QUICK_PRODUCT = {
  sku: "PT-TEE-001",
  name: "Custom Printed Tee",
  tagline: "Premium cotton tee, printed in Bengaluru",
  description:
    "180 GSM combed cotton, soft hand-feel, colour-fast print. Pick your size and colour and we'll take it from there.",
  /** paise per piece, GST included */
  price: 49900,
  gstRate: 5,
  hsn: "6109",
  moq: 1,
  maxQty: 500,
  sizes: ["S", "M", "L", "XL", "2XL"],
  colours: [
    { name: "White", hex: "#FFFFFF" },
    { name: "Black", hex: "#111111" },
  ],
  /** Discount per piece once the order reaches minQty (paise) */
  tiers: [{ minQty: 10, discount: 3000 }] as Tier[],
  /** Optional photo under /public, e.g. "/products/tee.jpg" */
  image: null as string | null,
};

export type QuickProduct = typeof QUICK_PRODUCT;
