import type { Category, Product } from "@prisma/client";

/** Product shape as returned to the client: Decimal fields become plain numbers. */
export interface ProductDTO
  extends Omit<Product, "price" | "salePrice" | "createdAt" | "updatedAt"> {
  price: number;
  salePrice: number | null;
  createdAt: string;
  updatedAt: string;
  category: Pick<Category, "id" | "name" | "slug">;
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

export interface AdminStats {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  featuredProducts: number;
  outOfStock: number;
  onSale: number;
  totalCategories: number;
  inventoryValue: number;
}
