import type { Metadata } from "next";

import { CategoryManager } from "@/components/admin/category-manager";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Categorías",
  robots: { index: false, follow: false },
};

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  const categoriesDTO = categories.map((c) => ({
    ...c,
    productCount: c._count.products,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Categorías</h1>
        <p className="text-sm text-muted-foreground">
          Administrá las categorías del catálogo.
        </p>
      </div>
      <CategoryManager categories={categoriesDTO} />
    </div>
  );
}
