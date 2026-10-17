import "server-only";
import { promises as dns } from "node:dns";

/**
 * Real-world checks that need the network. Both FAIL OPEN: if the lookup itself is down or slow
 * we let the order through rather than block a genuine customer. They only reject when the
 * outside world clearly says "this doesn't exist".
 */

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([p, new Promise<T>((_, reject) => setTimeout(() => reject(new Error("timeout")), ms))]);
}

/** Returns an error message if the email's domain can't receive mail, otherwise null. */
export async function checkEmailDomain(email: string): Promise<string | null> {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return "Enter a valid email address.";
  const notFound = `We couldn't find "${domain}". Please check your email address.`;
  const code = (e: unknown) => (e as { code?: string })?.code ?? "";
  const missing = (e: unknown) => ["ENOTFOUND", "ENODATA"].includes(code(e));

  try {
    const mx = await withTimeout(dns.resolveMx(domain), 3000);
    if (mx.length > 0) return null;
  } catch (e) {
    if (!missing(e)) {
      // The direct DNS resolver is unusable here (refused, timed out…). Ask the operating system
      // instead: "domain doesn't exist" is a clear answer, anything else lets the customer through.
      try {
        await withTimeout(dns.lookup(domain), 3000);
        return null;
      } catch (e2) {
        return code(e2) === "ENOTFOUND" ? notFound : null;
      }
    }
  }
  try {
    // Mail can also be delivered to a domain's plain address record.
    const a = await withTimeout(dns.resolve4(domain), 3000);
    if (a.length > 0) return null;
  } catch (e) {
    if (!missing(e)) return null;
  }
  return notFound;
}

const norm = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z]/g, "").replace(/^theu/, "u");

/** Pincode must exist, and belong to the state the customer picked. */
export async function checkPincode(pincode: string, state: string): Promise<string | null> {
  try {
    const res = await withTimeout(
      fetch(`https://api.postalpincode.in/pincode/${pincode}`, { cache: "force-cache", next: { revalidate: 86400 } }),
      3500
    );
    if (!res.ok) return null;
    const body = (await res.json()) as { Status?: string; PostOffice?: { State?: string }[] | null }[];
    const first = body?.[0];
    if (!first) return null;
    if (first.Status === "Error" || first.Status === "404") return `We couldn't find pincode ${pincode}. Please check it.`;
    const apiState = first.PostOffice?.[0]?.State;
    if (first.Status !== "Success" || !apiState) return null;

    const a = norm(apiState);
    const b = norm(state);
    // Ladakh pincodes are still listed under Jammu & Kashmir by India Post.
    const pair = new Set([a, b]);
    const ok = a === b || a.includes(b) || b.includes(a) || (pair.has("ladakh") && pair.has("jammuandkashmir"));
    return ok ? null : `Pincode ${pincode} belongs to ${apiState}, but you chose ${state}. Please check both.`;
  } catch {
    return null;
  }
}
