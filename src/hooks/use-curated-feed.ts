"use client";

import { useQuery } from "@tanstack/react-query";

import type { CuratedFeedResponse } from "@/types/product";

/** Fetches the whole homepage feed (already grouped into ordered sections)
 * in one request — the dataset is small enough that "infinite scroll" is
 * implemented as progressive client-side reveal (see CuratedProductFeed)
 * rather than real paginated fetching. */
export function useCuratedFeed() {
  return useQuery<CuratedFeedResponse>({
    queryKey: ["products-curated"],
    queryFn: async () => {
      const res = await fetch("/api/products/curated");
      if (!res.ok) throw new Error("No se pudo cargar el catálogo");
      return res.json();
    },
    staleTime: 60_000,
  });
}
