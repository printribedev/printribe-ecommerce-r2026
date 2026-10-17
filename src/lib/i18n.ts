/**
 * Customer-facing text in English and Kannada. English is the default.
 * To change wording, edit it here; both languages must have the same keys (TypeScript checks this).
 * Placeholders like {n} are filled in with fmt().
 * The admin panel is English only and does not use this file.
 */
export type Lang = "en" | "kn";
export const DEFAULT_LANG: Lang = "en";
export const LANG_COOKIE = "lang";

export const isLang = (v: unknown): v is Lang => v === "en" || v === "kn";

export function fmt(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

const en = {
  switchTo: "ಕನ್ನಡ",
  stepper: ["Choose", "Your details", "Pay", "Done"],

  product: {
    perPiece: "per piece, incl. GST",
    buyMore: "Buy more, pay less per piece. See prices below.",
    colour: "Colour",
    size: "Size",
    quantity: "Quantity",
    tier: "{n}+ pieces: {price} each",
    delivery: "Delivery",
    free: "Free",
    total: "Total",
    addMore: "Add {amount} more for free delivery",
    continue: "Continue",
    chooseSize: "Choose a size to continue",
    decrease: "Decrease quantity",
    increase: "Increase quantity",
  },

  sizeGuide: {
    title: "Size guide (inches)",
    size: "Size",
    chest: "Chest",
    width: "Width",
    height: "Height",
    note: "Width is measured across the chest. Height is measured from shoulder to hem. Choose your size using these measurements.",
  },

  details: {
    heading: "Delivery details",
    change: "Change",
    plusDelivery: "+ {amount} delivery",
    plusFree: "+ free delivery",
    name: "Full name (first and last name)",
    phone: "Mobile number",
    email: "Email",
    line1: "House / flat no., street, area",
    line2: "Landmark, address line 2 (optional)",
    city: "City",
    pincode: "Pincode",
    state: "State",
    submit: "Continue to payment · {total}",
    submitting: "Checking and placing order…",
    note: "Please use real details. We deliver to this address and confirm your order on this number and email.",
    generic: "Something went wrong. Please check your details and try again.",
  },

  errors: {
    "name.letters": "Use letters only in your name.",
    "name.full": "Enter your full name (first and last name).",
    "name.fake": "That doesn't look like a real name. Please enter your full name.",
    "phone.invalid": "Enter a valid 10-digit Indian mobile number (starts with 6, 7, 8 or 9).",
    "phone.fake": "That doesn't look like a real mobile number.",
    "email.invalid": "Enter a valid email address, like name@gmail.com.",
    "email.disposable": "Please use your real email address.",
    "email.fake": "That doesn't look like a real email address.",
    "address.full": "Enter your full address: house or flat number, street and area.",
    "address.fake": "That doesn't look like a real address. Please check it.",
    "city.invalid": "Enter your city or town.",
    "city.fake": "That doesn't look like a real city. Please check it.",
    "pincode.invalid": "Enter a valid 6-digit pincode.",
    "pincode.fake": "That doesn't look like a real pincode.",
    "state.required": "Choose your state.",
    "email.domain": 'We couldn\'t find "{domain}". Please check your email address.',
    "pincode.notfound": "We couldn't find pincode {pin}. Please check it.",
    "pincode.mismatch": "Pincode {pin} belongs to {apiState}, but you chose {state}. Please check both.",
    "pay.utr": "Enter the UPI transaction ID from your payment app (usually 12 digits).",
    "order.notfound": "Order not found.",
  },

  pay: {
    order: "Order {n}",
    title: "Pay {amount} by UPI",
    scan: "Scan with any UPI app and pay the exact amount.",
    qrAlt: "UPI QR code",
    noteHint: "Add {n} in the payment note if your app allows.",
    afterPaid: "After you've paid",
    utrLabel: "UPI transaction ID (UTR)",
    utrPlaceholder: "e.g. 412345678901",
    utrHelp: 'Find it in your UPI app under the payment details, as "UPI transaction ID" or "UTR".',
    submit: "I've paid",
    submitting: "Submitting…",
    uploadHint: "Optional: upload your payment screenshot",
    upload: "Upload screenshot",
    chooseOne: "Confirm your payment in either way:",
    optionUtr: "Enter transaction ID",
    optionShot: "Upload screenshot",
    shotHelp: "Upload a clear screenshot of the payment success screen, showing the amount and transaction ID.",
    shotUnavailable: "Screenshot upload isn't available yet. Please enter your transaction ID instead.",
  },

  done: {
    thanks: "ಧನ್ಯವಾದಗಳು · Thank you",
    submitted: "Payment submitted",
    cancelled: "Order cancelled",
    confirmed: "Order confirmed",
    bodySubmitted:
      "We'll verify your payment and confirm your order shortly. You can close this page and come back to this link any time.",
    bodyCancelled: "This order was cancelled. Contact us if you think this is a mistake.",
    bodyConfirmed: "Thank you! Your payment is confirmed and we're getting started.",
    utrGiven: "Transaction ID you gave us: {ref}",
    whatsapp: "Send payment screenshot on WhatsApp",
    items: "Items",
    total: "Total",
    delivery: "Delivery",
    free: "Free",
    timeline: "Order timeline",
    saveLink: "Save this page's link to check your order status any time.",
  },

  status: {
    PENDING_PAYMENT: "Awaiting payment",
    PAID: "Payment confirmed",
    IN_DESIGN: "In design",
    IN_PRODUCTION: "In production",
    QC: "Quality check",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    REFUNDED: "Refunded",
  },

  events: {
    placed: "Order placed, awaiting UPI payment",
    reported: "Customer reported payment, UTR {ref}",
    screenshot: "Payment screenshot uploaded",
    verified: "Payment verified by Printribe",
    cancelled: "Order cancelled by Printribe",
  },
};

export type Dict = typeof en;

const kn: Dict = {
  switchTo: "English",
  stepper: ["ಆಯ್ಕೆ", "ನಿಮ್ಮ ವಿವರಗಳು", "ಪಾವತಿ", "ಮುಗಿದಿದೆ"],

  product: {
    perPiece: "ಪ್ರತಿ ತುಂಡಿಗೆ, GST ಸೇರಿ",
    buyMore: "ಹೆಚ್ಚು ಖರೀದಿಸಿ, ಪ್ರತಿ ತುಂಡಿಗೆ ಕಡಿಮೆ ಪಾವತಿಸಿ. ಬೆಲೆಗಳನ್ನು ಕೆಳಗೆ ನೋಡಿ.",
    colour: "ಬಣ್ಣ",
    size: "ಗಾತ್ರ",
    quantity: "ಪ್ರಮಾಣ",
    tier: "{n}+ ತುಂಡುಗಳು: ತಲಾ {price}",
    delivery: "ಡೆಲಿವರಿ",
    free: "ಉಚಿತ",
    total: "ಒಟ್ಟು",
    addMore: "ಉಚಿತ ಡೆಲಿವರಿಗಾಗಿ ಇನ್ನೂ {amount} ಸೇರಿಸಿ",
    continue: "ಮುಂದುವರಿಸಿ",
    chooseSize: "ಮುಂದುವರಿಸಲು ಗಾತ್ರ ಆಯ್ಕೆಮಾಡಿ",
    decrease: "ಪ್ರಮಾಣ ಕಡಿಮೆ ಮಾಡಿ",
    increase: "ಪ್ರಮಾಣ ಹೆಚ್ಚಿಸಿ",
  },

  sizeGuide: {
    title: "ಗಾತ್ರ ಮಾರ್ಗದರ್ಶಿ (ಇಂಚುಗಳಲ್ಲಿ)",
    size: "ಗಾತ್ರ",
    chest: "ಎದೆ",
    width: "ಅಗಲ",
    height: "ಉದ್ದ",
    note: "ಅಗಲವನ್ನು ಎದೆಯ ಮೇಲೆ ಅಡ್ಡಲಾಗಿ ಅಳೆಯಲಾಗುತ್ತದೆ. ಉದ್ದವನ್ನು ಭುಜದಿಂದ ಅಂಚಿನವರೆಗೆ ಅಳೆಯಲಾಗುತ್ತದೆ. ಈ ಅಳತೆಗಳನ್ನು ಬಳಸಿ ನಿಮ್ಮ ಗಾತ್ರವನ್ನು ಆರಿಸಿ.",
  },

  details: {
    heading: "ಡೆಲಿವರಿ ವಿವರಗಳು",
    change: "ಬದಲಿಸಿ",
    plusDelivery: "+ {amount} ಡೆಲಿವರಿ",
    plusFree: "+ ಉಚಿತ ಡೆಲಿವರಿ",
    name: "ಪೂರ್ಣ ಹೆಸರು (ಮೊದಲ ಮತ್ತು ಕೊನೆಯ ಹೆಸರು)",
    phone: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
    email: "ಇಮೇಲ್",
    line1: "ಮನೆ / ಫ್ಲಾಟ್ ಸಂಖ್ಯೆ, ರಸ್ತೆ, ಪ್ರದೇಶ",
    line2: "ಹತ್ತಿರದ ಗುರುತು, ವಿಳಾಸ ಸಾಲು 2 (ಐಚ್ಛಿಕ)",
    city: "ನಗರ",
    pincode: "ಪಿನ್‌ಕೋಡ್",
    state: "ರಾಜ್ಯ",
    submit: "ಪಾವತಿಗೆ ಮುಂದುವರಿಸಿ · {total}",
    submitting: "ಪರಿಶೀಲಿಸಿ ಆರ್ಡರ್ ಮಾಡಲಾಗುತ್ತಿದೆ…",
    note: "ದಯವಿಟ್ಟು ನಿಜವಾದ ವಿವರಗಳನ್ನು ನೀಡಿ. ಈ ವಿಳಾಸಕ್ಕೆ ನಾವು ಡೆಲಿವರಿ ಮಾಡುತ್ತೇವೆ ಮತ್ತು ಈ ಸಂಖ್ಯೆ ಹಾಗೂ ಇಮೇಲ್‌ನಲ್ಲಿ ನಿಮ್ಮ ಆರ್ಡರ್ ದೃಢಪಡಿಸುತ್ತೇವೆ.",
    generic: "ಏನೋ ತಪ್ಪಾಗಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
  },

  errors: {
    "name.letters": "ನಿಮ್ಮ ಹೆಸರಿನಲ್ಲಿ ಅಕ್ಷರಗಳನ್ನು ಮಾತ್ರ ಬಳಸಿ.",
    "name.full": "ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ (ಮೊದಲ ಮತ್ತು ಕೊನೆಯ ಹೆಸರು).",
    "name.fake": "ಇದು ನಿಜವಾದ ಹೆಸರಿನಂತೆ ಕಾಣುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.",
    "phone.invalid": "ಮಾನ್ಯವಾದ 10 ಅಂಕಿಯ ಭಾರತೀಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ (6, 7, 8 ಅಥವಾ 9 ರಿಂದ ಪ್ರಾರಂಭ).",
    "phone.fake": "ಇದು ನಿಜವಾದ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯಂತೆ ಕಾಣುತ್ತಿಲ್ಲ.",
    "email.invalid": "ಮಾನ್ಯವಾದ ಇಮೇಲ್ ವಿಳಾಸ ನಮೂದಿಸಿ, ಉದಾ: name@gmail.com.",
    "email.disposable": "ದಯವಿಟ್ಟು ನಿಮ್ಮ ನಿಜವಾದ ಇಮೇಲ್ ವಿಳಾಸ ಬಳಸಿ.",
    "email.fake": "ಇದು ನಿಜವಾದ ಇಮೇಲ್ ವಿಳಾಸದಂತೆ ಕಾಣುತ್ತಿಲ್ಲ.",
    "address.full": "ನಿಮ್ಮ ಪೂರ್ಣ ವಿಳಾಸ ನಮೂದಿಸಿ: ಮನೆ ಅಥವಾ ಫ್ಲಾಟ್ ಸಂಖ್ಯೆ, ರಸ್ತೆ ಮತ್ತು ಪ್ರದೇಶ.",
    "address.fake": "ಇದು ನಿಜವಾದ ವಿಳಾಸದಂತೆ ಕಾಣುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ಪರಿಶೀಲಿಸಿ.",
    "city.invalid": "ನಿಮ್ಮ ನಗರ ಅಥವಾ ಪಟ್ಟಣವನ್ನು ನಮೂದಿಸಿ.",
    "city.fake": "ಇದು ನಿಜವಾದ ನಗರದಂತೆ ಕಾಣುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ಪರಿಶೀಲಿಸಿ.",
    "pincode.invalid": "ಮಾನ್ಯವಾದ 6 ಅಂಕಿಯ ಪಿನ್‌ಕೋಡ್ ನಮೂದಿಸಿ.",
    "pincode.fake": "ಇದು ನಿಜವಾದ ಪಿನ್‌ಕೋಡ್‌ನಂತೆ ಕಾಣುತ್ತಿಲ್ಲ.",
    "state.required": "ನಿಮ್ಮ ರಾಜ್ಯವನ್ನು ಆರಿಸಿ.",
    "email.domain": '"{domain}" ಕಂಡುಬಂದಿಲ್ಲ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಇಮೇಲ್ ವಿಳಾಸ ಪರಿಶೀಲಿಸಿ.',
    "pincode.notfound": "ಪಿನ್‌ಕೋಡ್ {pin} ಕಂಡುಬಂದಿಲ್ಲ. ದಯವಿಟ್ಟು ಪರಿಶೀಲಿಸಿ.",
    "pincode.mismatch": "ಪಿನ್‌ಕೋಡ್ {pin} {apiState} ರಾಜ್ಯಕ್ಕೆ ಸೇರಿದೆ, ಆದರೆ ನೀವು {state} ಆರಿಸಿದ್ದೀರಿ. ದಯವಿಟ್ಟು ಎರಡನ್ನೂ ಪರಿಶೀಲಿಸಿ.",
    "pay.utr": "ನಿಮ್ಮ ಪಾವತಿ ಆ್ಯಪ್‌ನಲ್ಲಿರುವ UPI ಟ್ರಾನ್ಸಾಕ್ಷನ್ ID ನಮೂದಿಸಿ (ಸಾಮಾನ್ಯವಾಗಿ 12 ಅಂಕಿ).",
    "order.notfound": "ಆರ್ಡರ್ ಕಂಡುಬಂದಿಲ್ಲ.",
  },

  pay: {
    order: "ಆರ್ಡರ್ {n}",
    title: "UPI ಮೂಲಕ {amount} ಪಾವತಿಸಿ",
    scan: "ಯಾವುದೇ UPI ಆ್ಯಪ್‌ನಿಂದ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಸರಿಯಾದ ಮೊತ್ತವನ್ನು ಪಾವತಿಸಿ.",
    qrAlt: "UPI QR ಕೋಡ್",
    noteHint: "ನಿಮ್ಮ ಆ್ಯಪ್‌ನಲ್ಲಿ ಸಾಧ್ಯವಿದ್ದರೆ ಪಾವತಿ ಟಿಪ್ಪಣಿಯಲ್ಲಿ {n} ಸೇರಿಸಿ.",
    afterPaid: "ಪಾವತಿಸಿದ ನಂತರ",
    utrLabel: "UPI ಟ್ರಾನ್ಸಾಕ್ಷನ್ ID (UTR)",
    utrPlaceholder: "ಉದಾ: 412345678901",
    utrHelp: 'ನಿಮ್ಮ UPI ಆ್ಯಪ್‌ನ ಪಾವತಿ ವಿವರಗಳಲ್ಲಿ "UPI ಟ್ರಾನ್ಸಾಕ್ಷನ್ ID" ಅಥವಾ "UTR" ಎಂದು ಕಾಣಿಸುತ್ತದೆ.',
    submit: "ನಾನು ಪಾವತಿಸಿದ್ದೇನೆ",
    submitting: "ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ…",
    uploadHint: "ಐಚ್ಛಿಕ: ನಿಮ್ಮ ಪಾವತಿ ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    upload: "ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಅಪ್‌ಲೋಡ್",
    chooseOne: "ನಿಮ್ಮ ಪಾವತಿಯನ್ನು ಈ ಎರಡರಲ್ಲಿ ಒಂದು ರೀತಿಯಲ್ಲಿ ದೃಢೀಕರಿಸಿ:",
    optionUtr: "ಟ್ರಾನ್ಸಾಕ್ಷನ್ ID ನಮೂದಿಸಿ",
    optionShot: "ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಅಪ್‌ಲೋಡ್",
    shotHelp: "ಮೊತ್ತ ಮತ್ತು ಟ್ರಾನ್ಸಾಕ್ಷನ್ ID ಕಾಣುವಂತೆ ಪಾವತಿ ಯಶಸ್ವಿ ಪರದೆಯ ಸ್ಪಷ್ಟ ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
    shotUnavailable: "ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಅಪ್‌ಲೋಡ್ ಇನ್ನೂ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಬದಲಿಗೆ ನಿಮ್ಮ ಟ್ರಾನ್ಸಾಕ್ಷನ್ ID ನಮೂದಿಸಿ.",
  },

  done: {
    thanks: "ಧನ್ಯವಾದಗಳು",
    submitted: "ಪಾವತಿ ಸಲ್ಲಿಸಲಾಗಿದೆ",
    cancelled: "ಆರ್ಡರ್ ರದ್ದುಗೊಂಡಿದೆ",
    confirmed: "ಆರ್ಡರ್ ದೃಢಪಟ್ಟಿದೆ",
    bodySubmitted:
      "ನಾವು ನಿಮ್ಮ ಪಾವತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ ಶೀಘ್ರದಲ್ಲೇ ನಿಮ್ಮ ಆರ್ಡರ್ ದೃಢಪಡಿಸುತ್ತೇವೆ. ನೀವು ಈ ಪುಟವನ್ನು ಮುಚ್ಚಿ ಯಾವಾಗ ಬೇಕಾದರೂ ಈ ಲಿಂಕ್‌ಗೆ ಮರಳಬಹುದು.",
    bodyCancelled: "ಈ ಆರ್ಡರ್ ರದ್ದುಗೊಂಡಿದೆ. ಇದು ತಪ್ಪು ಎಂದು ನಿಮಗೆ ಅನಿಸಿದರೆ ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ.",
    bodyConfirmed: "ಧನ್ಯವಾದಗಳು! ನಿಮ್ಮ ಪಾವತಿ ದೃಢಪಟ್ಟಿದೆ, ನಾವು ಕೆಲಸ ಆರಂಭಿಸುತ್ತಿದ್ದೇವೆ.",
    utrGiven: "ನೀವು ನೀಡಿದ ಟ್ರಾನ್ಸಾಕ್ಷನ್ ID: {ref}",
    whatsapp: "ಪಾವತಿ ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಕಳುಹಿಸಿ",
    items: "ವಸ್ತುಗಳು",
    total: "ಒಟ್ಟು",
    delivery: "ಡೆಲಿವರಿ",
    free: "ಉಚಿತ",
    timeline: "ಆರ್ಡರ್ ಟೈಮ್‌ಲೈನ್",
    saveLink: "ನಿಮ್ಮ ಆರ್ಡರ್ ಸ್ಥಿತಿಯನ್ನು ಯಾವಾಗ ಬೇಕಾದರೂ ನೋಡಲು ಈ ಪುಟದ ಲಿಂಕ್ ಉಳಿಸಿಕೊಳ್ಳಿ.",
  },

  status: {
    PENDING_PAYMENT: "ಪಾವತಿಗಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ",
    PAID: "ಪಾವತಿ ದೃಢಪಟ್ಟಿದೆ",
    IN_DESIGN: "ವಿನ್ಯಾಸದಲ್ಲಿ",
    IN_PRODUCTION: "ತಯಾರಿಕೆಯಲ್ಲಿ",
    QC: "ಗುಣಮಟ್ಟ ಪರಿಶೀಲನೆ",
    SHIPPED: "ರವಾನಿಸಲಾಗಿದೆ",
    DELIVERED: "ತಲುಪಿಸಲಾಗಿದೆ",
    CANCELLED: "ರದ್ದುಗೊಂಡಿದೆ",
    REFUNDED: "ಹಣ ಮರುಪಾವತಿಸಲಾಗಿದೆ",
  },

  events: {
    placed: "ಆರ್ಡರ್ ಇಡಲಾಗಿದೆ, UPI ಪಾವತಿಗಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ",
    reported: "ಪಾವತಿ ವರದಿ ಮಾಡಲಾಗಿದೆ, UTR {ref}",
    screenshot: "ಪಾವತಿ ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಲಾಗಿದೆ",
    verified: "ಪ್ರಿಂಟ್ರೈಬ್ ಪಾವತಿಯನ್ನು ಪರಿಶೀಲಿಸಿದೆ",
    cancelled: "ಪ್ರಿಂಟ್ರೈಬ್ ಆರ್ಡರ್ ರದ್ದುಗೊಳಿಸಿದೆ",
  },
};

export const dict: Record<Lang, Dict> = { en, kn };

export type ErrorCode = keyof Dict["errors"];

/** A localised error message, with placeholders filled in. */
export function errorMessage(lang: Lang, code: ErrorCode, vars?: Record<string, string | number>): string {
  return fmt(dict[lang].errors[code], vars);
}

/** Customer-facing text for a stored order-history note (notes are saved in English for the admin). */
export function eventText(lang: Lang, note: string | null, status: string): string {
  const d = dict[lang];
  if (note) {
    if (note.startsWith("Order placed")) return d.events.placed;
    if (note.startsWith("Customer reported payment")) {
      const ref = note.split("UTR ")[1] ?? "";
      return fmt(d.events.reported, { ref });
    }
    if (note.startsWith("Payment screenshot")) return d.events.screenshot;
    if (note.startsWith("Payment verified")) return d.events.verified;
    if (note.startsWith("Order cancelled")) return d.events.cancelled;
  }
  return d.status[status as keyof Dict["status"]] ?? status;
}
