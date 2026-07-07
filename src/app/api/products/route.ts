import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { productQuerySchema } from "@/lib/validations/product.schema";
import type { ProductDTO, ProductListResponse } from "@/types/product";

/**
 * Public product listing endpoint — powers the storefront's real-time
 * search and filters. Everything here is read-only and safe to expose
 * without authentication; write operations live under /api/products/[id]
 * and are protected by the admin session (see that route + middleware.ts).
 *
 * All query params are parsed through Zod before touching Prisma, and all
 * filtering is expressed as typed Prisma `where` clauses (never raw SQL),
 * which is what actually prevents SQL injection here.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const rawParams = {
    search: url.searchParams.get("search") ?? undefined,
    categorySlugs: url.searchParams.getAll("categorySlugs"),
    brands: url.searchParams.getAll("brands"),
    onSale: url.searchParams.get("onSale") ?? undefined,
    inStock: url.searchParams.get("inStock") ?? undefined,
    featuredOnly: url.searchParams.get("featuredOnly") ?? undefined,
    minPrice: url.searchParams.get("minPrice") ?? undefined,
    maxPrice: url.searchParams.get("maxPrice") ?? undefined,
    sort: url.searchParams.get("sort") ?? undefined,
    page: url.searchParams.get("page") ?? undefined,
    pageSize: url.searchParams.get("pageSize") ?? undefined,
  };

  const parsed = productQuerySchema.safeParse(rawParams);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Parámetros de búsqueda inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const query = parsed.data;

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(query.search && {
      OR: [
        { name: { contains: query.search, mode: "insensitive" } },
        { brand: { contains: query.search, mode: "insensitive" } },
        { sku: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
        { category: { name: { contains: query.search, mode: "insensitive" } } },
      ],
    }),
    ...(query.categorySlugs.length > 0 && {
      category: { slug: { in: query.categorySlugs } },
    }),
    ...(query.brands.length > 0 && { brand: { in: query.brands } }),
    ...(query.onSale && { isOnSale: true }),
    ...(query.inStock && { stock: { gt: 0 } }),
    ...(query.featuredOnly && { isFeatured: true }),
    ...((query.minPrice !== undefined || query.maxPrice !== undefined) && {
      price: {
        ...(query.minPrice !== undefined && { gte: query.minPrice }),
        ...(query.maxPrice !== undefined && { lte: query.maxPrice }),
      },
    }),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    query.sort === "price-asc"
      ? { price: "asc" }
      : query.sort === "price-desc"
        ? { price: "desc" }
        : query.sort === "newest"
          ? { createdAt: "desc" }
          : { isFeatured: "desc" };

  const [products, total, brandRows, priceAgg] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: { category: { select: { id: true, name: true, slug: true } } },
    }),
    prisma.product.count({ where }),
    prisma.product.findMany({
      where: { isActive: true },
      select: { brand: true },
      distinct: ["brand"],
      orderBy: { brand: "asc" },
    }),
    prisma.product.aggregate({
      where: { isActive: true },
      _min: { price: true },
      _max: { price: true },
    }),
  ]);

  const dtos: ProductDTO[] = products.map((p) => ({
    ...p,
    price: Number(p.price),
    salePrice: p.salePrice ? Number(p.salePrice) : null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  const response: ProductListResponse = {
    products: dtos,
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
    availableBrands: brandRows.map((b) => b.brand),
    priceRange: {
      min: priceAgg._min.price ? Number(priceAgg._min.price) : 0,
      max: priceAgg._max.price ? Number(priceAgg._max.price) : 0,
    },
  };

  return NextResponse.json(response);
}
