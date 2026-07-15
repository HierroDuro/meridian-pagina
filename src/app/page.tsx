import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/layout/hero";
import { Storefront } from "@/components/products/storefront";
import { SearchBar } from "@/components/products/search-bar";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/site";
import type { CategoryDTO } from "@/types/product";

// Product data changes often (stock, prices), so this page revalidates
// frequently rather than being fully static — a good default for a
// catalog whose content is admin-managed.
export const revalidate = 30;

async function getCategories(): Promise<CategoryDTO[]> {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    productCount: c._count.products,
  }));
}

export default async function HomePage() {
  const categories = await getCategories();
  const productCount = categories.reduce((sum, c) => sum + (c.productCount ?? 0), 0);

  return (
    <div className="min-h-screen">
      <Header />
      <main
        className="mx-auto max-w-[1920px] px-6 pb-20 lg:px-10"
        style={{ paddingTop: siteConfig.headerHeight + 32 }}
      >
        <Hero productCount={productCount} categoryCount={categories.length} />

        {/* The header's search bar is hidden below `md`; this gives mobile
            users the same real-time search without cramming it into the
            fixed 75px header. */}
        <div className="mb-5 md:hidden">
          <SearchBar />
        </div>
        <Storefront categories={categories} />
      </main>
      <Footer />
    </div>
  );
}
