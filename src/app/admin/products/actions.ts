"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { bool, int, optStr, paise, slugify, str } from "@/lib/forms";
import { prisma } from "@/lib/prisma";

const LIST = "/admin/products";
const edit = (id: string) => `${LIST}/${id}`;
const fail = (id: string, message: string): never =>
  redirect(`${edit(id)}?error=${encodeURIComponent(message)}`);

/** Everything the storefront shows comes from these tables, so refresh its cache on every save. */
function touch(productId?: string) {
  revalidateTag("catalogue");
  revalidatePath(LIST);
  if (productId) revalidatePath(edit(productId));
}

async function uniqueSlug(base: string) {
  const root = slugify(base) || "product";
  let slug = root;
  for (let i = 2; await prisma.product.findUnique({ where: { slug } }); i++) slug = `${root}-${i}`;
  return slug;
}

// ───────── Product ─────────

export async function createProduct(formData: FormData) {
  await requireAdmin("products");
  const name = str(formData, "name");
  const categoryId = str(formData, "categoryId");
  if (!name || !categoryId)
    redirect(`${LIST}/new?error=${encodeURIComponent("Name and category are required")}`);

  const product = await prisma.product.create({
    data: {
      name,
      categoryId,
      slug: await uniqueSlug(name),
      basePrice: paise(formData, "basePrice"),
    },
  });
  touch();
  redirect(edit(product.id));
}

export async function updateProduct(id: string, formData: FormData) {
  await requireAdmin("products");
  const name = str(formData, "name");
  const slug = slugify(str(formData, "slug") || name);
  if (!name || !slug) fail(id, "Name is required");

  const clash = await prisma.product.findFirst({ where: { slug, NOT: { id } } });
  if (clash) fail(id, `The URL name "${slug}" is already used by another product`);

  const gst = parseFloat(str(formData, "gstRate"));
  await prisma.product.update({
    where: { id },
    data: {
      name,
      slug,
      description: optStr(formData, "description"),
      categoryId: str(formData, "categoryId"),
      basePrice: paise(formData, "basePrice"),
      gstRate: Number.isFinite(gst) ? gst : 5,
      hsn: optStr(formData, "hsn"),
      moq: Math.max(1, int(formData, "moq", 1)),
      fabric: optStr(formData, "fabric"),
      gsm: optStr(formData, "gsm"),
      customisable: bool(formData, "customisable"),
      featured: bool(formData, "featured"),
      active: bool(formData, "active"),
      seoTitle: optStr(formData, "seoTitle"),
      seoDesc: optStr(formData, "seoDesc"),
    },
  });
  touch(id);
}

export async function deleteProduct(id: string) {
  await requireAdmin("products");
  await prisma.product.delete({ where: { id } });
  touch();
  redirect(LIST);
}

// ───────── Quantity price tiers ─────────

export async function addTier(productId: string, formData: FormData) {
  await requireAdmin("products");
  const minQty = int(formData, "minQty");
  const discount = paise(formData, "discount");
  if (minQty < 2 || discount <= 0) fail(productId, "Tier needs a quantity of 2 or more and a discount above ₹0");

  await prisma.priceTier.upsert({
    where: { productId_minQty: { productId, minQty } },
    create: { productId, minQty, discount },
    update: { discount },
  });
  touch(productId);
}

export async function deleteTier(productId: string, id: string) {
  await requireAdmin("products");
  await prisma.priceTier.delete({ where: { id } });
  touch(productId);
}

// ───────── Print areas (placements) ─────────

export async function addPrintArea(productId: string, formData: FormData) {
  await requireAdmin("products");
  const label = str(formData, "label");
  const key = slugify(str(formData, "key") || label).replace(/-/g, "_");
  const widthMm = int(formData, "widthMm");
  const heightMm = int(formData, "heightMm");
  if (!label || !key || widthMm <= 0 || heightMm <= 0)
    fail(productId, "Placement needs a name, width and height");
  if (await prisma.printArea.findUnique({ where: { productId_key: { productId, key } } }))
    fail(productId, `A placement called "${key}" already exists`);

  const count = await prisma.printArea.count({ where: { productId } });
  await prisma.printArea.create({
    data: { productId, key, label, widthMm, heightMm, fee: paise(formData, "fee"), sortOrder: count },
  });
  touch(productId);
}

export async function updatePrintArea(productId: string, id: string, formData: FormData) {
  await requireAdmin("products");
  const widthMm = int(formData, "widthMm");
  const heightMm = int(formData, "heightMm");
  if (widthMm <= 0 || heightMm <= 0) fail(productId, "Width and height must be above 0");
  await prisma.printArea.update({
    where: { id },
    data: { label: str(formData, "label"), widthMm, heightMm, fee: paise(formData, "fee") },
  });
  touch(productId);
}

export async function deletePrintArea(productId: string, id: string) {
  await requireAdmin("products");
  await prisma.printArea.delete({ where: { id } });
  touch(productId);
}

// ───────── Variants ─────────

/**
 * Creates every size × colour combination in one go.
 * Sizes: "S, M, L, XL".  Colours: one per line, "Black #111111" (hex optional).
 * Combinations that already exist are skipped.
 */
export async function createVariants(productId: string, formData: FormData) {
  await requireAdmin("products");
  const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });

  const sizes = str(formData, "sizes").split(",").map((s) => s.trim()).filter(Boolean);
  const colours = str(formData, "colours")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^(.*?)\s*(#[0-9a-fA-F]{3,8})?$/);
      return { name: (m?.[1] || line).trim(), hex: m?.[2] ?? null };
    });
  if (!sizes.length && !colours.length) fail(productId, "Enter at least one size or colour");

  const priceDelta = paise(formData, "priceDelta");
  const existing = await prisma.productVariant.count({ where: { productId } });
  const sizeList = sizes.length ? sizes : [null];
  const colourList = colours.length ? colours : [null];

  const rows = colourList.flatMap((c, ci) =>
    sizeList.map((size, si) => ({
      productId,
      size,
      colorName: c?.name ?? null,
      colorHex: c?.hex ?? null,
      priceDelta,
      sortOrder: existing + ci * sizeList.length + si,
      sku: [product.slug, c?.name, size]
        .filter(Boolean)
        .map((p) => slugify(String(p)))
        .join("-")
        .toUpperCase(),
    }))
  );
  await prisma.productVariant.createMany({ data: rows, skipDuplicates: true });
  touch(productId);
}

export async function updateVariant(productId: string, id: string, formData: FormData) {
  await requireAdmin("products");
  await prisma.productVariant.update({
    where: { id },
    data: { priceDelta: paise(formData, "priceDelta"), inStock: bool(formData, "inStock") },
  });
  touch(productId);
}

export async function deleteVariant(productId: string, id: string) {
  await requireAdmin("products");
  await prisma.productVariant.delete({ where: { id } });
  touch(productId);
}

// ───────── Gallery images ─────────

export async function addProductImage(productId: string, r2Key: string) {
  await requireAdmin("products");
  const count = await prisma.productImage.count({ where: { productId } });
  await prisma.productImage.create({ data: { productId, r2Key, sortOrder: count } });
  touch(productId);
}

export async function deleteProductImage(productId: string, id: string) {
  await requireAdmin("products");
  await prisma.productImage.delete({ where: { id } });
  touch(productId);
}

// ───────── Mockups (photo + print rectangle per colour and placement) ─────────

export async function saveMockup(
  productId: string,
  colorName: string,
  printAreaId: string,
  r2Key: string,
  rect: { x: number; y: number; w: number; h: number }
) {
  await requireAdmin("products");
  const inside = (n: number) => Number.isFinite(n) && n >= 0 && n <= 1;
  if (![rect.x, rect.y, rect.w, rect.h].every(inside) || rect.w <= 0 || rect.h <= 0)
    throw new Error("Invalid print rectangle");

  const data = { r2Key, rectX: rect.x, rectY: rect.y, rectW: rect.w, rectH: rect.h };
  await prisma.mockup.upsert({
    where: { productId_colorName_printAreaId: { productId, colorName, printAreaId } },
    create: { productId, colorName, printAreaId, ...data },
    update: data,
  });
  touch(productId);
}

export async function deleteMockup(productId: string, id: string) {
  await requireAdmin("products");
  await prisma.mockup.delete({ where: { id } });
  touch(productId);
}
