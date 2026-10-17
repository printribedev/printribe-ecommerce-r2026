import type { Tier } from "@/lib/pricing";

/** All measurements in inches. `chest` is the number in the size name (S-36 = 36"). */
const SIZE_CHART = [
  { size: "XS", chest: 34, width: 17.5, height: 25.5 },
  { size: "S", chest: 36, width: 18, height: 26.5 },
  { size: "M", chest: 38, width: 19, height: 27.5 },
  { size: "L", chest: 40, width: 20, height: 28.5 },
  { size: "XL", chest: 42, width: 21, height: 29.5 },
  { size: "XXL", chest: 44, width: 22, height: 30.5 },
  { size: "XXXL", chest: 46, width: 23, height: 32 },
  { size: "4XL", chest: 48, width: 24, height: 32.5 },
];

/**
 * The one product sold on the home page. This is deliberately hard-coded for the quick launch;
 * once the catalogue pages (phase 3) exist, /order is replaced by /products/[slug] reading the DB.
 * EDIT THE VALUES BELOW to match the real product.
 */
export const QUICK_PRODUCT = {
  sku: "PT-POLO-RAJYOTSAVA-001",
  name: "Kannada Rajyotsava Polo",
  /** Small line above the product name */
  eyebrow: "ಕನ್ನಡ ರಾಜ್ಯೋತ್ಸವ ವಿಶೇಷ · Rajyotsava Special",
  tagline: "ಹೆಮ್ಮೆಯ ಕನ್ನಡಿಗ. Wear your pride. Celebrate Karnataka.",
  description:
    "Some things you wear. Some things you carry in your heart. This black polo carries both: the map of Karnataka and the words ಹೆಮ್ಮೆಯ ಕನ್ನಡಿಗ, finely embroidered over your heart in the colours of the Kannada flag. Made for Kannadigas, for Rajyotsava and every day you want to say where you come from.",
  /** Four short selling points shown under the description */
  highlights: [
    "Premium quality",
    "Comfort fit",
    "Fine embroidery",
    "Made for Kannadigas",
  ],
  /** Closing line at the bottom of the product page */
  closing: "Rooted in tradition. Worn with pride.",
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
  /** Product photos under /public/products, all cropped to 4:5. The first one is the main image. */
  images: [
    { src: "/products/polo-front.webp", alt: "Black Kannada Rajyotsava polo, front view" },
    { src: "/products/polo-embroidery.webp", alt: "Close-up of the embroidered Karnataka map and ಹೆಮ್ಮೆಯ ಕನ್ನಡಿಗ" },
    { src: "/products/polo-folded.webp", alt: "Stack of folded Kannada Rajyotsava polos" },
  ],
  /**
   * WhatsApp number customers can send their payment screenshot to, digits only with country
   * code, e.g. "919876543210". Leave empty to hide the WhatsApp button.
   */
  whatsapp: "",
};

export type QuickProduct = typeof QUICK_PRODUCT;
