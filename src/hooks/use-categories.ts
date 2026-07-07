"use client";

import { useQuery } from "@tanstack/react-query";

import type { CategoryDTO } from "@/types/product";

export function useCategories(initialData?: CategoryDTO[]) {
  return useQuery<CategoryDTO[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("No se pudieron cargar las categorías");
      return res.json();
    },
    initialData,
    staleTime: 5 * 60 * 1000,
  });
}
