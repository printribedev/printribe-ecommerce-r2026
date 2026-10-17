/** Small FormData readers for admin server actions. */
export const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
export const optStr = (f: FormData, k: string) => str(f, k) || null;
export const bool = (f: FormData, k: string) => f.get(k) === "on";

export function int(f: FormData, k: string, fallback = 0) {
  const n = parseInt(str(f, k), 10);
  return Number.isFinite(n) ? n : fallback;
}

/** Admin types rupees; the database stores paise. */
export function paise(f: FormData, k: string) {
  const n = parseFloat(str(f, k));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
