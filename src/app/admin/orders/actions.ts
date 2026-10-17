"use server";

import { revalidatePath } from "next/cache";
import type { OrderStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const NOTES: Partial<Record<OrderStatus, string>> = {
  PAID: "Payment verified by Printribe",
  CANCELLED: "Order cancelled by Printribe",
};

async function setStatus(id: string, status: OrderStatus, from: OrderStatus[]) {
  await requireAdmin("orders");
  const order = await prisma.order.findUniqueOrThrow({ where: { id } });
  if (!from.includes(order.status)) throw new Error(`Order is ${order.status}`);

  await prisma.$transaction([
    prisma.order.update({ where: { id }, data: { status } }),
    prisma.orderEvent.create({ data: { orderId: id, status, note: NOTES[status] ?? null } }),
  ]);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath(`/order/${order.trackingToken}`);
}

export async function confirmPayment(id: string) {
  await setStatus(id, "PAID", ["PENDING_PAYMENT"]);
}

export async function cancelOrder(id: string) {
  await setStatus(id, "CANCELLED", ["PENDING_PAYMENT", "PAID"]);
}

/** Later stages are moved forward by hand until the CRM status webhook (phase 6) takes over. */
export async function advanceOrder(id: string, status: OrderStatus) {
  await setStatus(id, status, ["PAID", "IN_DESIGN", "IN_PRODUCTION", "QC", "SHIPPED"]);
}
