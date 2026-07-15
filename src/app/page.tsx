import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/layout/hero";
import { Storefront } from "@/components/products/storefront";
import { SearchBar } from "@/components/products/search-bar";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/site";
import type { CategoryDTO, ProductDTO } from "@/types/product";

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

/** Feeds the hero banner's auto-scrolling strip — every active on-sale
 * product, same "isOnSale" flag the rest of the catalog already uses. */
async function getOnSaleProducts(): Promise<ProductDTO[]> {
  const products = await prisma.product.findMany({
    where: { isActive: true, isOnSale: true },
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { order: "asc" } },
    },
  });
  return products.map((p) => ({
    ...p,
    price: Number(p.price),
    originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
    images: p.images.map((i) => i.url),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));
}

export default async function HomePage() {
  const [categories, onSaleProducts] = await Promise.all([getCategories(), getOnSaleProducts()]);
  const productCount = categories.reduce((sum, c) => sum + (c.productCount ?? 0), 0);

  return (
    <div className="min-h-screen">
      <Header />
      <main
        className="mx-auto max-w-[1920px] px-6 pb-20 lg:px-10"
        style={{ paddingTop: siteConfig.headerHeight + 32 }}
      >
        <Hero productCount={productCount} categoryCount={categories.length} offers={onSaleProducts} />

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
