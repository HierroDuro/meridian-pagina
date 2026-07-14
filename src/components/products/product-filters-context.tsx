"use client";

import * as React from "react";

export interface ProductFiltersState {
  search: string;
  categorySlugs: string[];
  brands: string[];
  onSale: boolean;
  featuredOnly: boolean;
  sort: "relevance" | "price-asc" | "price-desc" | "newest";
}

interface ProductFiltersContextValue {
  filters: ProductFiltersState;
  setSearch: (value: string) => void;
  toggleCategory: (slug: string) => void;
  toggleBrand: (brand: string) => void;
  setOnSale: (value: boolean) => void;
  setFeaturedOnly: (value: boolean) => void;
  setSort: (value: ProductFiltersState["sort"]) => void;
  clearAll: () => void;
  activeFilterCount: number;
}

const initialState: ProductFiltersState = {
  search: "",
  categorySlugs: [],
  brands: [],
  onSale: false,
  featuredOnly: false,
  sort: "relevance",
};

const ProductFiltersContext = React.createContext<ProductFiltersContextValue | null>(null);

/**
 * Client-side "single source of truth" for the storefront's search bar and
 * sidebar filters. Living in Context (rather than prop-drilling or a URL
 * round-trip) is what makes filtering feel instant: every consumer
 * re-renders in the same tick, no navigation/reload involved.
 */
export function ProductFiltersProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = React.useState<ProductFiltersState>(initialState);

  const setSearch = React.useCallback(
    (value: string) => setFilters((prev) => ({ ...prev, search: value })),
    [],
  );

  const toggleCategory = React.useCallback((slug: string) => {
    setFilters((prev) => ({
      ...prev,
      categorySlugs: prev.categorySlugs.includes(slug)
        ? prev.categorySlugs.filter((s) => s !== slug)
        : [...prev.categorySlugs, slug],
    }));
  }, []);

  const toggleBrand = React.useCallback((brand: string) => {
    setFilters((prev) => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter((b) => b !== brand)
        : [...prev.brands, brand],
    }));
  }, []);

  const setOnSale = React.useCallback(
    (value: boolean) => setFilters((prev) => ({ ...prev, onSale: value })),
    [],
  );
  const setFeaturedOnly = React.useCallback(
    (value: boolean) => setFilters((prev) => ({ ...prev, featuredOnly: value })),
    [],
  );
  const setSort = React.useCallback(
    (value: ProductFiltersState["sort"]) => setFilters((prev) => ({ ...prev, sort: value })),
    [],
  );

  const clearAll = React.useCallback(() => setFilters(initialState), []);

  const activeFilterCount =
    filters.categorySlugs.length +
    filters.brands.length +
    (filters.onSale ? 1 : 0) +
    (filters.featuredOnly ? 1 : 0);

  const value = React.useMemo(
    () => ({
      filters,
      setSearch,
      toggleCategory,
      toggleBrand,
      setOnSale,
      setFeaturedOnly,
      setSort,
      clearAll,
      activeFilterCount,
    }),
    [filters, setSearch, toggleCategory, toggleBrand, setOnSale, setFeaturedOnly, setSort, clearAll, activeFilterCount],
  );

  return (
    <ProductFiltersContext.Provider value={value}>{children}</ProductFiltersContext.Provider>
  );
}

export function useProductFilters() {
  const ctx = React.useContext(ProductFiltersContext);
  if (!ctx) {
    throw new Error("useProductFilters must be used within a ProductFiltersProvider");
  }
  return ctx;
}
