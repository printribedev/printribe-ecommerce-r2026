"use server";

import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getProfile } from "@/lib/auth";
import { INDIAN_STATES } from "@/lib/india";
import { shippingFee, unitPrice } from "@/lib/pricing";
import { prisma } from "@/lib/prisma";
import { QUICK_PRODUCT as P } from "@/lib/quick-product";

export type OrderFormState = { error?: string };

const Schema = z.object({
  size: z.string().refine((s) => P.sizes.includes(s), "Choose a size"),
  colour: z.string().refine((c) => P.colours.some((x) => x.name === c), "Choose a colour"),
  qty: z.coerce.number().int().min(P.moq, `Minimum order is ${P.moq}`).max(P.maxQty),
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: z
    .string()
    .transform((v) => v.replace(/[\s-]/g, "").replace(/^(\+91|91|0)(?=\d{10}$)/, ""))
    .refine((v) => /^[6-9]\d{9}$/.test(v), "Enter a 10-digit mobile number"),
  line1: z.string().trim().min(3, "Enter your address").max(150),
  line2: z.string().trim().max(150).optional(),
  city: z.string().trim().min(2, "Enter your city").max(60),
  state: z.string().refine((s) => (INDIAN_STATES as readonly string[]).includes(s), "Choose your state"),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a 6-digit pincode"),
});

/** PTW-XXXXXX, avoiding look-alike characters so it's easy to read out over a call. */
function orderNumber() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return "PTW-" + Array.from({ length: 6 }, () => chars[randomInt(chars.length)]).join("");
}

export async function placeOrder(_prev: OrderFormState, formData: FormData): Promise<OrderFormState> {
  const parsed = Schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;

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
export async function attachProof(token: string, key: string) {
  // Only keys our own upload route hands out are accepted.
  if (!/^artwork\/\d{4}-\d{2}\/[0-9a-f-]{36}\.(png|jpg|webp)$/.test(key)) throw new Error("Invalid file");

  const order = await prisma.order.findUnique({ where: { trackingToken: token } });
  if (!order || order.status !== "PENDING_PAYMENT") throw new Error("Order not found");

  await prisma.$transaction([
    prisma.order.update({ where: { id: order.id }, data: { paymentProofKey: key } }),
    prisma.orderEvent.create({
      data: { orderId: order.id, status: "PENDING_PAYMENT", note: "Payment screenshot uploaded" },
    }),
  ]);
  revalidatePath(`/order/${token}`);
}

/** The "I've paid" step: the customer types the UPI transaction (UTR) number from their payment app. */
export async function submitPayment(token: string, _prev: OrderFormState, formData: FormData): Promise<OrderFormState> {
  const ref = String(formData.get("ref") ?? "").replace(/\s/g, "").toUpperCase();
  if (!/^[A-Z0-9]{8,30}$/.test(ref))
    return { error: "Enter the UPI transaction ID from your payment app (usually 12 digits)." };

  const order = await prisma.order.findUnique({ where: { trackingToken: token } });
  if (!order) return { error: "Order not found." };
  if (order.status !== "PENDING_PAYMENT") return {};

  await prisma.$transaction([
    prisma.order.update({ where: { id: order.id }, data: { paymentRef: ref } }),
    prisma.orderEvent.create({
      data: { orderId: order.id, status: "PENDING_PAYMENT", note: `Customer reported payment, UTR ${ref}` },
    }),
  ]);
  revalidatePath(`/order/${token}`);
  redirect(`/order/${token}`);
}
