import type { OrderStatus } from "@prisma/client";

/** Display order for order statuses in the admin. */
export const STATUS_ORDER: OrderStatus[] = [
  "PENDING_PAYMENT",
  "PAID",
  "IN_DESIGN",
  "IN_PRODUCTION",
  "QC",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

const LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Awaiting payment",
  PAID: "Payment confirmed",
  IN_DESIGN: "In design",
  IN_PRODUCTION: "In production",
  QC: "Quality check",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

export const statusLabel = (s: OrderStatus) => LABELS[s];

export const isOrderStatus = (v: unknown): v is OrderStatus => STATUS_ORDER.includes(v as OrderStatus);

/** Statuses shown on the dashboard's size table: everything except cancelled orders. */
export const ACTIVE_STATUSES = STATUS_ORDER.filter((s) => s !== "CANCELLED");

export type SizeMatrix = {
  /** One row per size: pieces per status, plus the row total. */
  rows: { size: string; counts: Partial<Record<OrderStatus, number>>; total: number }[];
  /** Pieces per status across all sizes, plus the grand total. */
  columnTotals: Partial<Record<OrderStatus, number>>;
  grandTotal: number;
};

/**
 * Adds up pieces (quantities) by size and status. Cancelled orders are left out.
 * Sizes follow `sizeOrder` first (so the table reads XS → 4XL); any other size found in the data comes after.
 */
export function buildSizeMatrix(
  items: { size: string | null; qty: number; status: OrderStatus }[],
  sizeOrder: string[]
): SizeMatrix {
  const bySize = new Map<string, Partial<Record<OrderStatus, number>>>();
  for (const size of sizeOrder) bySize.set(size, {});

  for (const item of items) {
    if (item.status === "CANCELLED") continue;
    const size = item.size ?? "—";
    const counts = bySize.get(size) ?? {};
    counts[item.status] = (counts[item.status] ?? 0) + item.qty;
    bySize.set(size, counts);
  }

  const columnTotals: Partial<Record<OrderStatus, number>> = {};
  let grandTotal = 0;
  const rows = [...bySize.entries()].map(([size, counts]) => {
    let total = 0;
    for (const status of ACTIVE_STATUSES) {
      const n = counts[status] ?? 0;
      total += n;
      columnTotals[status] = (columnTotals[status] ?? 0) + n;
    }
    grandTotal += total;
    return { size, counts, total };
  });

  return { rows, columnTotals, grandTotal };
}
