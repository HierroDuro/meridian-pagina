import type { Category, Product } from "@prisma/client";

/** Product shape as returned to the client: Decimal fields become plain numbers. */
export interface ProductDTO extends Omit<Product, "price" | "createdAt" | "updatedAt"> {
  price: number;
  createdAt: string;
  updatedAt: string;
  category: Pick<Category, "id" | "name" | "slug">;
  /** Additional gallery image URLs (besides the cover `imageUrl`), in display order. */
  images: string[];
}

export interface CategoryDTO extends Category {
  productCount?: number;
}

export interface ProductListResponse {
  products: ProductDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  availableBrands: string[];
  priceRange: { min: number; max: number };
}

/** One block of the curated homepage feed — a run of products from a
 * single category, already sorted (oferta > destacado > el resto). */
export interface CuratedSection {
  categorySlug: string;
  categoryName: string;
  products: ProductDTO[];
}

export interface CuratedFeedResponse {
  sections: CuratedSection[];
}

export interface OutOfStockProduct {
  id: string;
  name: string;
  sku: string;
  imageUrl: string;
  isActive: boolean;
}

export interface AdminStats {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  featuredProducts: number;
  outOfStock: number;
  onSale: number;
  totalCategories: number;
  inventoryValue: number;
  outOfStockProducts: OutOfStockProduct[];
}
