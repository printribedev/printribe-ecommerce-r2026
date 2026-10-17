import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatINR } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export default async function ProductsPage() {
  await requireAdmin("products");
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, _count: { select: { variants: true } } },
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-md bg-tribe px-4 py-2 text-sm font-medium text-white hover:bg-tribe-dark"
        >
          New product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">
          No products yet. Create a category first, then add your first product.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
          {products.map((p) => (
            <li key={p.id}>
              <Link
                href={`/admin/products/${p.id}`}
                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-neutral-50"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="text-xs text-neutral-500">
                    {p.category.name} · {p._count.variants} variants
                  </p>
                </div>
                <div className="shrink-0 text-right text-sm">
                  <p className="font-medium">{formatINR(p.basePrice)}</p>
                  <p className={p.active ? "text-xs text-green-700" : "text-xs text-neutral-400"}>
                    {p.active ? "Live" : "Hidden"}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
