"use server";

import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getProfile } from "@/lib/auth";
import { dict, errorMessage } from "@/lib/i18n";
import { INDIAN_STATES } from "@/lib/india";
import { getLang } from "@/lib/lang";
import { shippingFee, unitPrice } from "@/lib/pricing";
import { prisma } from "@/lib/prisma";
import { privateObjectExists } from "@/lib/r2";
import { QUICK_PRODUCT as P } from "@/lib/quick-product";
import { STOREFRONT_OPEN } from "@/lib/site";
import { normalizePhone, validateDetails } from "@/lib/validation";
import { checkEmailDomain, checkPincode } from "@/lib/verify";

/** `field` names the input to highlight, so the form can point at the problem. */
export type OrderFormState = { error?: string; field?: string };

const Schema = z.object({
  size: z.string().refine((s) => P.sizes.includes(s), "Choose a size"),
  colour: z.string().refine((c) => P.colours.some((x) => x.name === c), "Choose a colour"),
  qty: z.coerce.number().int().min(P.moq, `Minimum order is ${P.moq}`).max(P.maxQty),
  // Content rules (no dummy entries) are applied by validateDetails() below.
  name: z.string().trim().max(80).transform((v) => v.replace(/\s+/g, " ")),
  email: z.string().trim().toLowerCase().max(120),
  phone: z.string().max(20).transform(normalizePhone),
  line1: z.string().trim().max(150).transform((v) => v.replace(/\s+/g, " ")),
  line2: z.string().trim().max(150).optional(),
  city: z.string().trim().max(60).transform((v) => v.replace(/\s+/g, " ")),
  state: z.string().refine((s) => (INDIAN_STATES as readonly string[]).includes(s), "Choose your state"),
  pincode: z.string().trim().max(6),
});

/** PTW-XXXXXX, avoiding look-alike characters so it's easy to read out over a call. */
function orderNumber() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return "PTW-" + Array.from({ length: 6 }, () => chars[randomInt(chars.length)]).join("");
}

export async function placeOrder(_prev: OrderFormState, formData: FormData): Promise<OrderFormState> {
  const lang = getLang(); // error messages come back in the visitor's language
  // Storefront sunset: refuse new orders even if someone posts to this action directly.
  if (!STOREFRONT_OPEN) return { error: errorMessage(lang, "store.closed") };
  const parsed = Schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const field = String(parsed.error.issues[0].path[0] ?? "");
    return {
      error: field === "state" ? errorMessage(lang, "state.required") : dict[lang].details.generic,
      field,
    };
  }
  const d = parsed.data;

  // 1. Content rules: no dummy or gibberish entries (same rules the form shows live).
  const problems = validateDetails(d);
  const firstBad = (Object.keys(problems) as (keyof typeof problems)[])[0];
  if (firstBad) return { error: errorMessage(lang, problems[firstBad]!), field: firstBad };

  // 2. Real-world checks: does the email's domain exist, and does the pincode match the state?
  const [emailProblem, pinProblem] = await Promise.all([
    checkEmailDomain(d.email, lang),
    checkPincode(d.pincode, d.state, lang),
  ]);
  if (emailProblem) return { error: emailProblem, field: "email" };
  if (pinProblem) return { error: pinProblem, field: "pincode" };

  // The price is always recomputed here; the browser's number is never used.
  const unit = unitPrice({ basePrice: P.price, tiers: P.tiers, qty: d.qty });
  const subtotal = unit * d.qty;
  const shipping = shippingFee(subtotal, P.shipping);
  const total = subtotal + shipping;

  const profile = await getProfile(); // null for guests
  const order = await prisma.order.create({
    data: {
      number: orderNumber(),
      profileId: profile?.id ?? null,
      email: d.email,
      phone: d.phone,
      shippingAddr: {
        name: d.name,
        phone: d.phone,
        line1: d.line1,
        line2: d.line2 || null,
        city: d.city,
        state: d.state,
        pincode: d.pincode,
      },
      subtotal,
      shipping,
      total,
      items: {
        create: {
          productName: P.name,
          sku: P.sku,
          size: d.size,
          colorName: d.colour,
          hsn: P.hsn,
          gstRate: P.gstRate,
          unitPrice: unit,
          qty: d.qty,
          lineTotal: subtotal,
        },
      },
      events: { create: { status: "PENDING_PAYMENT", note: "Order placed, awaiting UPI payment" } },
    },
  });

  redirect(`/order/${order.trackingToken}`);
}

/** Called after the customer uploads their payment screenshot. */
export async function submitPaymentProof(
  token: string,
  key: string,
  utrRaw: string
): Promise<{ error?: string; ok?: boolean }> {
  const lang = getLang();

  const order = await prisma.order.findUnique({ where: { trackingToken: token } });
  if (!order) return { error: errorMessage(lang, "order.notfound") };
  if (order.status !== "PENDING_PAYMENT") return { ok: true };

  // GUARD RAIL: the order cannot move on without a payment screenshot, and the file must
  // really be in our bucket. A made-up key or a missing upload is rejected here, whatever the page does.
  const validKey = /^artwork\/\d{4}-\d{2}\/[0-9a-f-]{36}\.(png|jpg|webp)$/.test(key);
  if (!validKey || !(await privateObjectExists(key))) return { error: errorMessage(lang, "pay.proof") };

  // The transaction ID is optional, but if it's given it must look right.
  const ref = utrRaw.replace(/\s/g, "").toUpperCase();
  if (ref && !/^[A-Z0-9]{8,30}$/.test(ref)) return { error: errorMessage(lang, "pay.utr") };

  await prisma.$transaction([
    prisma.order.update({ where: { id: order.id }, data: { paymentProofKey: key, paymentRef: ref || null } }),
    prisma.orderEvent.create({
      data: { orderId: order.id, status: "PENDING_PAYMENT", note: "Payment screenshot uploaded" },
    }),
    ...(ref
      ? [
          prisma.orderEvent.create({
            data: { orderId: order.id, status: "PENDING_PAYMENT", note: `Customer reported payment, UTR ${ref}` },
          }),
        ]
      : []),
  ]);
  revalidatePath(`/order/${token}`);
  return { ok: true };
}
