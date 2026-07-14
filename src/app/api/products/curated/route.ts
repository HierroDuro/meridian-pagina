import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { sortAvailableFirst } from "@/lib/utils";
import type { CategoryDTO, CuratedFeedResponse, CuratedSection, ProductDTO } from "@/types/product";

/** Categories that rotate through the homepage feed in this fixed order,
 * repeating (A→T→M→P→A→T→M→P→...) until every one is exhausted — see
 * CHUNK_SIZE below for how big each pass through a category is. */
const ROTATION_SLUGS = ["auriculares", "teclados", "mouses", "parlantes"];

/** "3 filas" at the grid's widest breakpoint (4 columns) — see
 * product-grid.tsx's `lg:grid-cols-4`. Smaller screens just wrap into more
 * visual rows for the same 12 items, which is normal responsive behavior. */
const CHUNK_SIZE = 12;

/**
 * Powers the homepage's default (no filters active) browsing feed: instead
 * of one flat list, visitors scroll through repeating category sections —
 * a few rows of Auriculares, then Teclados, then Mouses, then Parlantes,
 * then back to a *different* batch of Auriculares, and so on — with any
 * remaining categories (Resmas, Gráfica, etc.) appended at the end as a
 * single section each. Within every section, ofertas come first, then
 * destacados, then everything else — and out-of-stock products (shown as
 * "Agotado" rather than hidden, see ProductCard) are pushed after
 * all of that, so a section still leads with what's actually purchasable.
 */
export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  const productsByCategory = new Map<string, ProductDTO[]>();
  for (const category of categories) {
    const products = await prisma.product.findMany({
      where: { isActive: true, categoryId: category.id },
      orderBy: [{ isOnSale: "desc" }, { isFeatured: "desc" }, { createdAt: "desc" }],
      include: { images: { orderBy: { order: "asc" } } },
    });
    const dtos = products.map((p) => ({
      ...p,
      price: Number(p.price),
      images: p.images.map((i) => i.url),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      category: { id: category.id, name: category.name, slug: category.slug },
    }));
    productsByCategory.set(category.slug, sortAvailableFirst(dtos));
  }

  const categoryBySlug = new Map<string, CategoryDTO>(categories.map((c) => [c.slug, c]));
  const sections: CuratedSection[] = [];

  const cursors = new Map(ROTATION_SLUGS.map((slug) => [slug, 0]));
  let addedThisPass = true;
  while (addedThisPass) {
    addedThisPass = false;
    for (const slug of ROTATION_SLUGS) {
      const products = productsByCategory.get(slug) ?? [];
      const start = cursors.get(slug) ?? 0;
      if (start >= products.length) continue;

      const chunk = products.slice(start, start + CHUNK_SIZE);
      const category = categoryBySlug.get(slug);
      if (category && chunk.length > 0) {
        sections.push({ categorySlug: slug, categoryName: category.name, products: chunk });
        cursors.set(slug, start + CHUNK_SIZE);
        addedThisPass = true;
      }
    }
  }

  // Everything outside the rotation (Resmas, Gráfica, catch-all Tecnología,
  // future categories) gets appended as one trailing section each, in the
  // same oferta > destacado > resto order.
  for (const category of categories) {
    if (ROTATION_SLUGS.includes(category.slug)) continue;
    const products = productsByCategory.get(category.slug) ?? [];
    if (products.length === 0) continue;
    sections.push({ categorySlug: category.slug, categoryName: category.name, products });
  }

  const response: CuratedFeedResponse = { sections };
  return NextResponse.json(response);
}
