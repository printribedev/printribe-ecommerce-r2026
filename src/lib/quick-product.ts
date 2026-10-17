import type { Tier } from "@/lib/pricing";

/** All measurements in inches. `chest` is the number in the size name (S-36 = 36"). */
const SIZE_CHART = [
  { size: "32", chest: 32, width: 16.5, height: 23.5 },
  { size: "XS", chest: 34, width: 17.5, height: 25.5 },
  { size: "S", chest: 36, width: 18, height: 26.5 },
  { size: "M", chest: 38, width: 19, height: 27.5 },
  { size: "L", chest: 40, width: 20, height: 28.5 },
  { size: "XL", chest: 42, width: 21, height: 29.5 },
  { size: "XXL", chest: 44, width: 22, height: 30.5 },
  { size: "XXXL", chest: 46, width: 23, height: 32 },
  { size: "4XL", chest: 48, width: 24, height: 32.5 },
  { size: "5XL", chest: 50, width: 25, height: 33 },
];

/**
 * The one product sold on the home page. This is deliberately hard-coded for the quick launch;
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
  price: 59900,
  gstRate: 5,
  hsn: "6109",
  moq: 1,
  maxQty: 500,
  /** Selectable sizes, taken from the size guide below */
  sizes: SIZE_CHART.map((r) => r.size),
  /** Size guide shown on the product page (inches) */
  sizeChart: SIZE_CHART,
  /** One colour = no colour picker is shown */
  colours: [{ name: "Black", hex: "#111111" }],
  /**
   * Discount per piece off `price` once the order reaches minQty (paise).
   * 2–9 pcs ₹549 · 10–19 pcs ₹499 · 20+ pcs ₹469
   */
  tiers: [
    { minQty: 2, discount: 5000 },
    { minQty: 10, discount: 10000 },
    { minQty: 20, discount: 13000 },
  ] as Tier[],
  /** Delivery: flat fee, waived once the items total reaches freeAbove (paise) */
  shipping: { fee: 7500, freeAbove: 100000 },
  /** Optional photo under /public, e.g. "/products/tee.jpg" */
  image: null as string | null,
  /**
   * WhatsApp number customers can send their payment screenshot to, digits only with country
   * code, e.g. "919876543210". Leave empty to hide the WhatsApp button.
   */
  whatsapp: "",
};

export type QuickProduct = typeof QUICK_PRODUCT;
