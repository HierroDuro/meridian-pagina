import type { Metadata } from "next";

import { StatsCards } from "@/components/admin/stats-cards";
import { OutOfStockList } from "@/components/admin/out-of-stock-list";

export const metadata: Metadata = {
  title: "Panel",
  robots: { index: false, follow: false },
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Panel</h1>
        <p className="text-sm text-muted-foreground">
          Resumen general del catálogo y del estado del inventario.
        </p>
      </div>
      <StatsCards />
      <OutOfStockList />
    </div>
  );
}
