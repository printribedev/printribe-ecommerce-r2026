/**
 * Rules that keep dummy or gibberish details ("ABC", "9545", "askfjkhds@vdgdf") out of orders.
 * Pure functions: the form uses them for instant feedback and the server uses the same ones
 * (the server is the one that actually enforces them). Each returns an error message, or null if OK.
 */

const BLOCKED_WORDS = new Set([
  "test", "testing", "abc", "abcd", "abcde", "abcdef", "xyz", "asdf", "asdfg", "asdfgh", "qwerty",
  "dummy", "fake", "sample", "demo", "none", "null", "name", "xxx", "aaa", "na", "lorem", "ipsum",
  "address", "city", "random", "nothing",
]);

const KEYBOARD_MASH =
  /(asdf|sdfg|dfgh|fghj|ghjk|hjkl|qwer|wert|erty|rtyu|tyui|yuio|uiop|zxcv|xcvb|cvbn|vbnm|abcd|qazw|wsxe)/;

const DISPOSABLE_DOMAINS = new Set([
  "example.com", "example.org", "example.net", "test.com", "test.in", "mailinator.com", "yopmail.com",
  "guerrillamail.com", "sharklasers.com", "10minutemail.com", "tempmail.com", "temp-mail.org",
  "trashmail.com", "dispostable.com", "getnada.com", "maildrop.cc", "throwawaymail.com", "fakeinbox.com",
]);

const LETTERS = /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u;

/** True if a single Latin-script word looks like keyboard mashing (kannada/hindi words are never flagged). */
function looksLikeMash(word: string): boolean {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length < 3) return false;
  if (/(.)\1{3,}/.test(w)) return true; // aaaa
  if (/[^aeiouy]{6,}/.test(w)) return true; // 6+ consonants in a row
  return KEYBOARD_MASH.test(w);
}

const wordsOf = (s: string) => s.split(/[^\p{L}\p{M}\p{N}]+/u).filter(Boolean);

function looksFake(text: string): boolean {
  const words = wordsOf(text);
  if (words.some((w) => BLOCKED_WORDS.has(w.toLowerCase()))) return true;
  if (words.some(looksLikeMash)) return true;
  const letters = text.toLowerCase().replace(/[^\p{L}]/gu, "");
  return letters.length > 0 && new Set(letters).size === 1; // "aaaaaa"
}

export function validateName(raw: string): string | null {
  const name = raw.trim().replace(/\s+/g, " ");
  if (!LETTERS.test(name)) return "Use letters only in your name.";
  const words = name.split(" ");
  if (words.length < 2) return "Enter your full name (first and last name).";
  const letterCount = name.replace(/[^\p{L}]/gu, "").length;
  if (letterCount < 4 || !words.some((w) => w.replace(/[^\p{L}]/gu, "").length >= 3))
    return "Enter your full name (first and last name).";
  if (looksFake(name) || new Set(words.map((w) => w.toLowerCase())).size === 1)
    return "That doesn't look like a real name. Please enter your full name.";
  return null;
}

export function normalizePhone(raw: string): string {
  return raw.replace(/[\s()-]/g, "").replace(/^(\+91|91|0)(?=\d{10}$)/, "");
}

export function validatePhone(raw: string): string | null {
  const d = normalizePhone(raw);
  if (!/^[6-9]\d{9}$/.test(d)) return "Enter a valid 10-digit Indian mobile number (starts with 6, 7, 8 or 9).";
  if (new Set(d).size < 4) return "That doesn't look like a real mobile number.";
  if (/^(\d{2})\1{4}$/.test(d) || /^(\d{5})\1$/.test(d)) return "That doesn't look like a real mobile number.";
  // 7 or more digits in a row going up or down (1234567, 9876543). Shorter runs such as 012345
  // do occur in genuine numbers, so they are allowed.
  let up = 1;
  let down = 1;
  for (let i = 1; i < d.length; i++) {
    const diff = Number(d[i]) - Number(d[i - 1]);
    up = diff === 1 ? up + 1 : 1;
    down = diff === -1 ? down + 1 : 1;
    if (up >= 7 || down >= 7) return "That doesn't look like a real mobile number.";
  }
  return null;
}

export function validateEmail(raw: string): string | null {
  const email = raw.trim().toLowerCase();
  if (!/^[a-z0-9._%+-]+@([a-z0-9-]+\.)+[a-z]{2,}$/.test(email)) return "Enter a valid email address, like name@gmail.com.";
  const [local, domain] = email.split("@");
  if (local.length < 3) return "Enter a valid email address, like name@gmail.com.";
  if (DISPOSABLE_DOMAINS.has(domain)) return "Please use your real email address.";
  const labels = domain.split(".");
  if (looksFake(local) || labels.slice(0, -1).some(looksLikeMash))
    return "That doesn't look like a real email address.";
  return null;
}

export function validateAddressLine1(raw: string): string | null {
  const a = raw.trim().replace(/\s+/g, " ");
  const letters = a.replace(/[^\p{L}]/gu, "").length;
  if (a.length < 8 || letters < 4 || a.split(" ").length < 2)
    return "Enter your full address: house or flat number, street and area.";
  if (looksFake(a)) return "That doesn't look like a real address. Please check it.";
  return null;
}

export function validateAddressLine2(raw: string): string | null {
  const a = raw.trim();
  if (!a) return null;
  return looksFake(a) ? "That doesn't look like a real address. Please check it." : null;
}

export function validateCity(raw: string): string | null {
  const c = raw.trim().replace(/\s+/g, " ");
  if (!LETTERS.test(c) || c.replace(/[^\p{L}]/gu, "").length < 3) return "Enter your city or town.";
  if (looksFake(c)) return "That doesn't look like a real city. Please check it.";
  return null;
}

export function validatePincode(raw: string): string | null {
  const p = raw.trim();
  if (!/^[1-9]\d{5}$/.test(p)) return "Enter a valid 6-digit pincode.";
  if (new Set(p).size === 1 || p === "123456" || p === "654321" || p === "121212")
    return "That doesn't look like a real pincode.";
  return null;
}

/** Everything the details form collects. */
export type DetailsInput = {
  name: string;
  phone: string;
  email: string;
  line1: string;
  line2?: string;
  city: string;
  pincode: string;
};

/** Runs every field rule and returns messages keyed by field name (empty object = all good). */
export function validateDetails(d: DetailsInput): Partial<Record<keyof DetailsInput, string>> {
  const checks: [keyof DetailsInput, string | null][] = [
    ["name", validateName(d.name)],
    ["phone", validatePhone(d.phone)],
    ["email", validateEmail(d.email)],
    ["line1", validateAddressLine1(d.line1)],
    ["line2", validateAddressLine2(d.line2 ?? "")],
    ["city", validateCity(d.city)],
    ["pincode", validatePincode(d.pincode)],
  ];
  return Object.fromEntries(checks.filter(([, e]) => e)) as Partial<Record<keyof DetailsInput, string>>;
}
