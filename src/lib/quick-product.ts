import type { Lang } from "@/lib/i18n";
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
  /** One colour = no colour picker is shown. `kn` is the Kannada name. */
  colours: [{ name: "Black", hex: "#111111", kn: "ಕಪ್ಪು" }],
  /** The same customer-facing text in Kannada (shown when the visitor switches language) */
  kn: {
    name: "ಕನ್ನಡ ರಾಜ್ಯೋತ್ಸವ ಪೋಲೋ",
    eyebrow: "ಕನ್ನಡ ರಾಜ್ಯೋತ್ಸವ ವಿಶೇಷ",
    tagline: "ಹೆಮ್ಮೆಯ ಕನ್ನಡಿಗ. ನಿಮ್ಮ ಹೆಮ್ಮೆಯನ್ನು ಧರಿಸಿ. ಕರ್ನಾಟಕವನ್ನು ಸಂಭ್ರಮಿಸಿ.",
    description:
      "ಕೆಲವನ್ನು ನಾವು ಧರಿಸುತ್ತೇವೆ. ಕೆಲವನ್ನು ಹೃದಯದಲ್ಲಿ ಹೊತ್ತುಕೊಳ್ಳುತ್ತೇವೆ. ಈ ಕಪ್ಪು ಪೋಲೋ ಎರಡನ್ನೂ ಹೊತ್ತಿದೆ: ಕರ್ನಾಟಕದ ನಕ್ಷೆ ಮತ್ತು ‘ಹೆಮ್ಮೆಯ ಕನ್ನಡಿಗ’ ಎಂಬ ಮಾತುಗಳು, ಕನ್ನಡ ಧ್ವಜದ ಬಣ್ಣಗಳಲ್ಲಿ ನಿಮ್ಮ ಹೃದಯದ ಮೇಲೆ ನಾಜೂಕಾಗಿ ಕಸೂತಿ ಮಾಡಲಾಗಿದೆ. ಕನ್ನಡಿಗರಿಗಾಗಿ ತಯಾರಿಸಲಾಗಿದೆ: ರಾಜ್ಯೋತ್ಸವಕ್ಕಾಗಿ ಮತ್ತು ನೀವು ಎಲ್ಲಿಂದ ಬಂದವರು ಎಂದು ಹೇಳಲು ಬಯಸುವ ಪ್ರತಿದಿನಕ್ಕಾಗಿ.",
    highlights: ["ಪ್ರೀಮಿಯಂ ಗುಣಮಟ್ಟ", "ಆರಾಮದಾಯಕ ಫಿಟ್", "ನಾಜೂಕು ಕಸೂತಿ", "ಕನ್ನಡಿಗರಿಗಾಗಿ ತಯಾರಿಸಲಾಗಿದೆ"],
    closing: "ಸಂಪ್ರದಾಯದಲ್ಲಿ ಬೇರೂರಿದೆ. ಹೆಮ್ಮೆಯಿಂದ ಧರಿಸಿ.",
  },
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
    { src: "/products/polo-folded.webp", alt: "Stack of folded Kannada Rajyotsava polos" },
  ],
  /**
   * WhatsApp number customers can send their payment screenshot to, digits only with country
   * code, e.g. "919876543210". Leave empty to hide the WhatsApp button.
   */
  whatsapp: "",
};

export type QuickProduct = typeof QUICK_PRODUCT;

/** The product's customer-facing text in the visitor's language (price, sizes etc. are the same). */
export function productText(lang: Lang) {
  const P = QUICK_PRODUCT;
  return lang === "kn" ? P.kn : {
    name: P.name,
    eyebrow: P.eyebrow,
    tagline: P.tagline,
    description: P.description,
    highlights: P.highlights,
    closing: P.closing,
  };
}

export function colourLabel(lang: Lang, name: string): string {
  const c = QUICK_PRODUCT.colours.find((x) => x.name === name);
  return lang === "kn" && c ? c.kn : name;
}
