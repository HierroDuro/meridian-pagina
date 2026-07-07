"use client";

import { useQuery } from "@tanstack/react-query";

import type { AdminStats } from "@/types/product";

export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("No se pudieron cargar las estadísticas");
      return res.json();
    },
    refetchInterval: 60_000,
  });
}
