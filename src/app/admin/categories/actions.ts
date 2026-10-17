"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { bool, int, optStr, slugify, str } from "@/lib/forms";
import { prisma } from "@/lib/prisma";

const BACK = "/admin/categories";

function done() {
  revalidateTag("catalogue");
  revalidatePath(BACK);
}

export async function saveCategory(id: string | null, formData: FormData) {
  await requireAdmin("categories");

  const name = str(formData, "name");
  if (!name) redirect(`${BACK}?error=${encodeURIComponent("Name is required")}`);

  const data = {
    name,
    slug: slugify(str(formData, "slug") || name),
    description: optStr(formData, "description"),
    imageKey: optStr(formData, "imageKey"),
    parentId: optStr(formData, "parentId"),
    sortOrder: int(formData, "sortOrder"),
    active: id ? bool(formData, "active") : true,
  };
  if (id && data.parentId === id) data.parentId = null;

  try {
    if (id) await prisma.category.update({ where: { id }, data });
    else await prisma.category.create({ data });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
      redirect(`${BACK}?error=${encodeURIComponent(`The URL name "${data.slug}" is already used`)}`);
    throw e;
  }
  done();
}

export async function deleteCategory(id: string) {
  await requireAdmin("categories");
  const [products, children] = await Promise.all([
    prisma.product.count({ where: { categoryId: id } }),
    prisma.category.count({ where: { parentId: id } }),
  ]);
  if (products || children)
    redirect(
      `${BACK}?error=${encodeURIComponent("Move or delete its products and sub-categories first")}`
    );
  await prisma.category.delete({ where: { id } });
  done();
}
