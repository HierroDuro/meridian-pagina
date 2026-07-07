"use client";

import { SidebarFilters } from "@/components/layout/sidebar-filters";
import { MobileFiltersDialog } from "@/components/layout/mobile-filters-dialog";
import { ProductGrid } from "@/components/products/product-grid";
import type { CategoryDTO } from "@/types/product";

/**
 * Note: this does NOT wrap itself in a `ProductFiltersProvider` — the
 * provider lives once, at the root layout, so the header's search bar
 * (rendered as a sibling, outside this component) shares the exact same
 * filter state as the sidebar and grid below. See src/app/layout.tsx.
 */
export function Storefront({ categories }: { categories: CategoryDTO[] }) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-8">
      <SidebarFilters categories={categories} />
      <div className="flex-1">
        <div className="mb-4 lg:hidden">
          <MobileFiltersDialog categories={categories} />
        </div>
        <ProductGrid />
      </div>
    </div>
  );
}
