import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { publicUrl } from "@/lib/r2";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Card, DangerButton, ErrorBanner, Field, PrimaryButton, inputCls } from "@/components/admin/ui";
import { deleteCategory, saveCategory } from "./actions";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  await requireAdmin("categories");
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <h1 className="text-2xl font-semibold">Categories</h1>
      <ErrorBanner message={searchParams.error} />

      <Card title="Add category">
        <form action={saveCategory.bind(null, null)} className="grid gap-3 sm:grid-cols-2">
          <Field label="Name">
            <input name="name" required className={inputCls} placeholder="Hoodies" />
          </Field>
          <Field label="URL name" hint="Leave blank to generate from the name">
            <input name="slug" className={inputCls} placeholder="hoodies" />
          </Field>
          <Field label="Parent category">
            <select name="parentId" className={inputCls} defaultValue="">
              <option value="">None (top level)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Sort order" hint="Lower numbers show first">
            <input name="sortOrder" type="number" defaultValue={0} className={inputCls} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description">
              <textarea name="description" rows={2} className={inputCls} />
            </Field>
          </div>
          <div className="flex items-center justify-between sm:col-span-2">
            <ImageUploader name="imageKey" label="Category image" />
            <PrimaryButton>Add category</PrimaryButton>
          </div>
        </form>
      </Card>

      <div className="space-y-3">
        {categories.length === 0 && (
          <p className="text-sm text-neutral-500">No categories yet. Add your first one above.</p>
        )}
        {categories.map((c) => (
          <Card key={c.id} title={c.name}>
            <form action={saveCategory.bind(null, c.id)} className="grid gap-3 sm:grid-cols-2">
              <Field label="Name">
                <input name="name" defaultValue={c.name} required className={inputCls} />
              </Field>
              <Field label="URL name">
                <input name="slug" defaultValue={c.slug} className={inputCls} />
              </Field>
              <Field label="Parent category">
                <select name="parentId" defaultValue={c.parentId ?? ""} className={inputCls}>
                  <option value="">None (top level)</option>
                  {categories
                    .filter((o) => o.id !== c.id)
                    .map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                </select>
              </Field>
              <Field label="Sort order">
                <input name="sortOrder" type="number" defaultValue={c.sortOrder} className={inputCls} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Description">
                  <textarea name="description" rows={2} defaultValue={c.description ?? ""} className={inputCls} />
                </Field>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2">
                <ImageUploader
                  name="imageKey"
                  initialKey={c.imageKey}
                  initialUrl={c.imageKey ? publicUrl(c.imageKey) : null}
                  label={c.imageKey ? "Replace image" : "Category image"}
                />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="active" defaultChecked={c.active} /> Visible on site
                </label>
                <span className="text-xs text-neutral-500">{c._count.products} products</span>
                <PrimaryButton>Save</PrimaryButton>
              </div>
            </form>
            <form action={deleteCategory.bind(null, c.id)} className="mt-3">
              <DangerButton>Delete category</DangerButton>
            </form>
          </Card>
        ))}
      </div>
    </main>
  );
}
