"use client";

import { useQuery } from "@tanstack/react-query";

import { useDebounce } from "@/hooks/use-debounce";
import type { ProductFiltersState } from "@/components/products/product-filters-context";
import type { ProductListResponse } from "@/types/product";

function buildQueryString(filters: ProductFiltersState, debouncedSearch: string) {
  const params = new URLSearchParams();
  if (debouncedSearch) params.set("search", debouncedSearch);
  filters.categorySlugs.forEach((slug) => params.append("categorySlugs", slug));
  filters.brands.forEach((brand) => params.append("brands", brand));
  if (filters.onSale) params.set("onSale", "true");
  if (filters.inStock) params.set("inStock", "true");
  if (filters.featuredOnly) params.set("featuredOnly", "true");
  params.set("sort", filters.sort);
  params.set("pageSize", "60");
  return params.toString();
}

/**
 * Fetches the filtered product list. The search term is debounced (250ms)
 * so the API isn't hit on every keystroke, while checkbox/select filters
 * apply immediately — matching the "instant filters, real-time search"
 * requirement without spamming the network.
 */
export function useProducts(filters: ProductFiltersState) {
  const debouncedSearch = useDebounce(filters.search, 250);

  const queryString = buildQueryString(filters, debouncedSearch);

  return useQuery<ProductListResponse>({
    queryKey: ["products", queryString],
    queryFn: async () => {
      const res = await fetch(`/api/products?${queryString}`);
      if (!res.ok) throw new Error("No se pudieron cargar los productos");
      return res.json();
    },
    placeholderData: (previousData) => previousData,
  });
}
