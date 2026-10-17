import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, ErrorBanner, Field, PrimaryButton, inputCls } from "@/components/admin/ui";
import { createProduct } from "../actions";

export default async function NewProductPage({ searchParams }: { searchParams: { error?: string } }) {
  await requireAdmin("products");
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <main className="mx-auto max-w-xl space-y-4 px-4 py-8">
      <h1 className="text-2xl font-semibold">New product</h1>
      <ErrorBanner message={searchParams.error} />
      {categories.length === 0 ? (
        <p className="text-sm">
          You need a category first.{" "}
          <Link href="/admin/categories" className="text-tribe underline">
            Create one
          </Link>
          .
        </p>
      ) : (
        <Card title="The basics" desc="You can add sizes, colours, print areas and mockups on the next screen.">
          <form action={createProduct} className="space-y-3">
            <Field label="Product name">
              <input name="name" required className={inputCls} placeholder="Classic Cotton Tee" />
            </Field>
            <Field label="Category">
              <select name="categoryId" required className={inputCls} defaultValue="">
                <option value="" disabled>
                  Choose…
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Base price (₹ per piece)">
              <input name="basePrice" type="number" min="0" step="0.01" required className={inputCls} />
            </Field>
            <PrimaryButton>Create and continue</PrimaryButton>
          </form>
        </Card>
      )}
    </main>
  );
}
