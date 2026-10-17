import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { formatINR } from "@/lib/money";
import { unitPrice } from "@/lib/pricing";
import { prisma } from "@/lib/prisma";
import { publicUrl } from "@/lib/r2";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { MockupEditor } from "@/components/admin/MockupEditor";
import {
  Card,
  DangerButton,
  ErrorBanner,
  Field,
  PrimaryButton,
  inputCls,
} from "@/components/admin/ui";
import {
  addPrintArea,
  addProductImage,
  addTier,
  createVariants,
  deleteMockup,
  deletePrintArea,
  deleteProduct,
  deleteProductImage,
  deleteTier,
  deleteVariant,
  saveMockup,
  updatePrintArea,
  updateProduct,
  updateVariant,
} from "../actions";

const rupees = (paise: number) => (paise / 100).toFixed(2);

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string };
}) {
  await requireAdmin("products");
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: {
        variants: { orderBy: { sortOrder: "asc" } },
        printAreas: { orderBy: { sortOrder: "asc" } },
        priceTiers: { orderBy: { minQty: "asc" } },
        images: { orderBy: { sortOrder: "asc" } },
        mockups: true,
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();
  const id = product.id;

  // One mockup photo per colour; products without colours use a single "default" photo.
  const colours = Array.from(new Set(product.variants.map((v) => v.colorName).filter(Boolean))) as string[];
  const mockupColours = colours.length ? colours : ["default"];

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div>
        <Link href="/admin/products" className="text-sm text-neutral-500 hover:underline">
          ← Products
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">{product.name}</h1>
      </div>
      <ErrorBanner message={searchParams.error} />

      {/* ───── Details & pricing ───── */}
      <Card title="Details & pricing" desc="Price is per piece, before GST. Everything here updates the live site when you save.">
        <form action={updateProduct.bind(null, id)} className="grid gap-3 sm:grid-cols-2">
          <Field label="Product name">
            <input name="name" defaultValue={product.name} required className={inputCls} />
          </Field>
          <Field label="URL name">
            <input name="slug" defaultValue={product.slug} className={inputCls} />
          </Field>
          <Field label="Category">
            <select name="categoryId" defaultValue={product.categoryId} className={inputCls}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Base price (₹ per piece)">
            <input name="basePrice" type="number" min="0" step="0.01" defaultValue={rupees(product.basePrice)} className={inputCls} />
          </Field>
          <Field label="GST rate (%)">
            <input name="gstRate" type="number" min="0" step="0.01" defaultValue={product.gstRate.toString()} className={inputCls} />
          </Field>
          <Field label="HSN code">
            <input name="hsn" defaultValue={product.hsn ?? ""} className={inputCls} />
          </Field>
          <Field label="Minimum order quantity">
            <input name="moq" type="number" min="1" defaultValue={product.moq} className={inputCls} />
          </Field>
          <Field label="Fabric">
            <input name="fabric" defaultValue={product.fabric ?? ""} className={inputCls} placeholder="100% combed cotton" />
          </Field>
          <Field label="GSM">
            <input name="gsm" defaultValue={product.gsm ?? ""} className={inputCls} placeholder="180" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description">
              <textarea name="description" rows={4} defaultValue={product.description ?? ""} className={inputCls} />
            </Field>
          </div>
          <Field label="Search title (SEO)">
            <input name="seoTitle" defaultValue={product.seoTitle ?? ""} className={inputCls} />
          </Field>
          <Field label="Search description (SEO)">
            <input name="seoDesc" defaultValue={product.seoDesc ?? ""} className={inputCls} />
          </Field>
          <div className="flex flex-wrap gap-5 text-sm sm:col-span-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="active" defaultChecked={product.active} /> Visible on site
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="customisable" defaultChecked={product.customisable} /> Customers can add their own design
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="featured" defaultChecked={product.featured} /> Featured
            </label>
          </div>
          <div className="sm:col-span-2">
            <PrimaryButton>Save details</PrimaryButton>
          </div>
        </form>
      </Card>

      {/* ───── Quantity pricing ───── */}
      <Card title="Bulk pricing" desc="Discount per piece once an order reaches a quantity. The best matching tier applies.">
        <table className="mb-4 w-full text-sm">
          <thead className="text-left text-xs text-neutral-500">
            <tr>
              <th className="py-1">Quantity</th>
              <th>Discount / piece</th>
              <th>Price / piece</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="py-2">1+</td>
              <td>—</td>
              <td>{formatINR(product.basePrice)}</td>
              <td />
            </tr>
            {product.priceTiers.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="py-2">{t.minQty}+</td>
                <td>{formatINR(t.discount)}</td>
                <td>
                  {formatINR(unitPrice({ basePrice: product.basePrice, tiers: product.priceTiers, qty: t.minQty }))}
                </td>
                <td className="text-right">
                  <form action={deleteTier.bind(null, id, t.id)}>
                    <DangerButton>Remove</DangerButton>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <form action={addTier.bind(null, id)} className="flex flex-wrap items-end gap-3">
          <Field label="From quantity">
            <input name="minQty" type="number" min="2" required className={`${inputCls} w-28`} />
          </Field>
          <Field label="Discount (₹ / piece)">
            <input name="discount" type="number" min="0" step="0.01" required className={`${inputCls} w-36`} />
          </Field>
          <PrimaryButton>Add tier</PrimaryButton>
        </form>
      </Card>

      {/* ───── Print areas ───── */}
      <Card title="Print areas" desc="Where artwork can go (front, back, sleeve…). The size is real-world millimetres and drives the low-resolution warning. The fee is added when a design uses that area; use ₹0 for the included one.">
        <div className="space-y-3">
          {product.printAreas.map((a) => (
            <div key={a.id} className="rounded-lg border border-neutral-200 p-3">
              <form action={updatePrintArea.bind(null, id, a.id)} className="grid items-end gap-3 sm:grid-cols-5">
                <Field label="Name">
                  <input name="label" defaultValue={a.label} className={inputCls} />
                </Field>
                <Field label="Width (mm)">
                  <input name="widthMm" type="number" min="1" defaultValue={a.widthMm} className={inputCls} />
                </Field>
                <Field label="Height (mm)">
                  <input name="heightMm" type="number" min="1" defaultValue={a.heightMm} className={inputCls} />
                </Field>
                <Field label="Fee (₹)">
                  <input name="fee" type="number" min="0" step="0.01" defaultValue={rupees(a.fee)} className={inputCls} />
                </Field>
                <PrimaryButton>Save</PrimaryButton>
              </form>
              <form action={deletePrintArea.bind(null, id, a.id)} className="mt-2">
                <DangerButton>Delete (also removes its mockups)</DangerButton>
              </form>
            </div>
          ))}
        </div>
        <form action={addPrintArea.bind(null, id)} className="mt-4 grid items-end gap-3 sm:grid-cols-5">
          <Field label="New area name">
            <input name="label" required className={inputCls} placeholder="Front" />
          </Field>
          <Field label="Width (mm)">
            <input name="widthMm" type="number" min="1" required className={inputCls} placeholder="300" />
          </Field>
          <Field label="Height (mm)">
            <input name="heightMm" type="number" min="1" required className={inputCls} placeholder="400" />
          </Field>
          <Field label="Fee (₹)">
            <input name="fee" type="number" min="0" step="0.01" defaultValue="0" className={inputCls} />
          </Field>
          <PrimaryButton>Add area</PrimaryButton>
        </form>
      </Card>

      {/* ───── Variants ───── */}
      <Card title="Sizes & colours" desc="Each size and colour combination is a variant. Add price changes per variant if a size costs more.">
        <form action={createVariants.bind(null, id)} className="grid gap-3 sm:grid-cols-2">
          <Field label="Sizes" hint="Comma separated">
            <input name="sizes" className={inputCls} placeholder="S, M, L, XL, 2XL" />
          </Field>
          <Field label="Extra price per piece (₹)" hint="Added to the base price for these variants">
            <input name="priceDelta" type="number" step="0.01" defaultValue="0" className={inputCls} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Colours" hint="One per line. Add a colour code after the name, e.g. Navy #1F2A44">
              <textarea name="colours" rows={3} className={inputCls} placeholder={"White #FFFFFF\nBlack #111111"} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <PrimaryButton>Add all combinations</PrimaryButton>
          </div>
        </form>

        {product.variants.length > 0 && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[34rem] text-sm">
              <thead className="text-left text-xs text-neutral-500">
                <tr>
                  <th className="py-1">Colour</th>
                  <th>Size</th>
                  <th>SKU</th>
                  <th>Price change (₹)</th>
                  <th>In stock</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {product.variants.map((v) => (
                  <tr key={v.id} className="border-t align-middle">
                    <td className="py-2">
                      <span className="flex items-center gap-2">
                        {v.colorHex && (
                          <span className="inline-block h-4 w-4 rounded-full border" style={{ background: v.colorHex }} />
                        )}
                        {v.colorName ?? "—"}
                      </span>
                    </td>
                    <td>{v.size ?? "—"}</td>
                    <td className="text-xs text-neutral-500">{v.sku}</td>
                    <td colSpan={3}>
                      <div className="flex items-center gap-3">
                        <form action={updateVariant.bind(null, id, v.id)} className="flex items-center gap-3">
                          <input name="priceDelta" type="number" step="0.01" defaultValue={rupees(v.priceDelta)} className={`${inputCls} w-24`} />
                          <label className="flex items-center gap-1 text-xs">
                            <input type="checkbox" name="inStock" defaultChecked={v.inStock} /> In stock
                          </label>
                          <button className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-50">
                            Save
                          </button>
                        </form>
                        <form action={deleteVariant.bind(null, id, v.id)}>
                          <DangerButton>Delete</DangerButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ───── Mockups ───── */}
      <Card title="Mockups" desc="For each colour and print area, upload a clean product photo and mark the print rectangle. The design maker uses these.">
        {product.printAreas.length === 0 ? (
          <p className="text-sm text-neutral-500">Add a print area first.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {mockupColours.flatMap((colour) =>
              product.printAreas.map((area) => {
                const m = product.mockups.find((x) => x.colorName === colour && x.printAreaId === area.id);
                return (
                  <MockupEditor
                    key={`${colour}-${area.id}-${m?.r2Key ?? "none"}`}
                    colorName={colour}
                    areaLabel={area.label}
                    heightOverWidth={area.heightMm / area.widthMm}
                    initial={
                      m ? { key: m.r2Key, url: publicUrl(m.r2Key), x: m.rectX, y: m.rectY, w: m.rectW } : undefined
                    }
                    save={saveMockup.bind(null, id, colour, area.id)}
                    remove={m ? deleteMockup.bind(null, id, m.id) : undefined}
                  />
                );
              })
            )}
          </div>
        )}
      </Card>

      {/* ───── Gallery ───── */}
      <Card title="Product photos" desc="Shown on the product page. The first one is the main photo.">
        <div className="mb-4 flex flex-wrap gap-3">
          {product.images.map((img) => (
            <div key={img.id} className="w-28">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={publicUrl(img.r2Key)} alt={img.alt ?? ""} className="h-28 w-28 rounded-md border object-cover" />
              <form action={deleteProductImage.bind(null, id, img.id)} className="mt-1">
                <DangerButton>Remove</DangerButton>
              </form>
            </div>
          ))}
        </div>
        <ImageUploader onDone={addProductImage.bind(null, id)} label="Add photo" />
      </Card>

      {/* ───── Danger zone ───── */}
      <Card title="Delete product" desc="Removes the product, its variants and mockups. Past orders keep their own copy of what was bought. To just take it off the site, untick “Visible on site” above instead.">
        <form action={deleteProduct.bind(null, id)}>
          <DangerButton>Delete this product</DangerButton>
        </form>
      </Card>
    </main>
  );
}
