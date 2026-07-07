"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin";
import { categorySchema } from "@/lib/validations/product.schema";
import { slugify } from "@/lib/utils";
import type { ActionResult } from "@/actions/product-actions";

async function ensureAdmin() {
  const session = await requireAdminSession();
  if (!session) throw new Error("No autorizado");
  return session;
}

export async function createCategory(name: string): Promise<ActionResult> {
  await ensureAdmin();

  const parsed = categorySchema.safeParse({ name });
  if (!parsed.success) {
    return {
      success: false,
      message: "Nombre de categoría inválido.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.category.create({
      data: { name: parsed.data.name, slug: slugify(parsed.data.name) },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, message: "Ya existe una categoría con ese nombre." };
    }
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/admin/categories");
  return { success: true, message: "Categoría creada." };
}

export async function updateCategory(id: string, name: string): Promise<ActionResult> {
  await ensureAdmin();

  const parsed = categorySchema.safeParse({ name });
  if (!parsed.success) {
    return { success: false, message: "Nombre de categoría inválido." };
  }

  try {
    await prisma.category.update({
      where: { id },
      data: { name: parsed.data.name, slug: slugify(parsed.data.name) },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, message: "Ya existe una categoría con ese nombre." };
    }
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/admin/categories");
  return { success: true, message: "Categoría actualizada." };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  await ensureAdmin();

  const productsUsingCategory = await prisma.product.count({ where: { categoryId: id } });
  if (productsUsingCategory > 0) {
    return {
      success: false,
      message: `No se puede eliminar: ${productsUsingCategory} producto(s) usan esta categoría.`,
    };
  }

  await prisma.category.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/admin/categories");
  return { success: true, message: "Categoría eliminada." };
}
