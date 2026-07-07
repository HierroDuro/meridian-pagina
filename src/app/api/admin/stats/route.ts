import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin";
import type { AdminStats } from "@/types/product";

/** Admin-only: aggregate counters for the dashboard's stat tiles. */
export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const [
    totalProducts,
    activeProducts,
    featuredProducts,
    outOfStock,
    onSale,
    totalCategories,
    inventoryAgg,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.count({ where: { isFeatured: true } }),
    prisma.product.count({ where: { stock: 0 } }),
    prisma.product.count({ where: { isOnSale: true } }),
    prisma.category.count(),
    prisma.product.findMany({ select: { price: true, stock: true } }),
  ]);

  const inventoryValue = inventoryAgg.reduce(
    (sum, p) => sum + Number(p.price) * p.stock,
    0,
  );

  const stats: AdminStats = {
    totalProducts,
    activeProducts,
    inactiveProducts: totalProducts - activeProducts,
    featuredProducts,
    outOfStock,
    onSale,
    totalCategories,
    inventoryValue,
  };

  return NextResponse.json(stats);
}
