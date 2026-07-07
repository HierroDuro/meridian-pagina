"use client";

import { motion } from "framer-motion";
import {
  Package,
  CheckCircle2,
  Star,
  PackageX,
  Tag,
  FolderTree,
  Wallet,
  XCircle,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminStats } from "@/hooks/use-admin-stats";
import { formatCurrency } from "@/lib/utils";

/**
 * Dashboard KPI tiles.
 * Each tile follows the stat-tile contract: a sentence-case label, a
 * semibold auto-compact value, and an icon that pairs with — never
 * replaces — the color used to signal status (good/warning/critical),
 * so meaning never rides on color alone.
 */
export function StatsCards() {
  const { data, isLoading } = useAdminStats();

  const tiles = [
    {
      label: "Productos totales",
      value: data?.totalProducts,
      icon: Package,
      tone: "neutral" as const,
    },
    {
      label: "Productos activos",
      value: data?.activeProducts,
      icon: CheckCircle2,
      tone: "good" as const,
    },
    {
      label: "Productos inactivos",
      value: data?.inactiveProducts,
      icon: XCircle,
      tone: "muted" as const,
    },
    {
      label: "Destacados",
      value: data?.featuredProducts,
      icon: Star,
      tone: "highlight" as const,
    },
    {
      label: "Sin stock",
      value: data?.outOfStock,
      icon: PackageX,
      tone: "critical" as const,
    },
    {
      label: "En oferta",
      value: data?.onSale,
      icon: Tag,
      tone: "highlight" as const,
    },
    {
      label: "Categorías",
      value: data?.totalCategories,
      icon: FolderTree,
      tone: "neutral" as const,
    },
    {
      label: "Valor de inventario",
      value: data ? formatCurrency(data.inventoryValue) : undefined,
      icon: Wallet,
      tone: "good" as const,
      isCurrency: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {tiles.map((tile, i) => (
        <motion.div
          key={tile.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: i * 0.03 }}
        >
          <Card className="flex flex-col gap-3 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{tile.label}</span>
              <tile.icon className={toneClass(tile.tone)} size={16} />
            </div>
            {isLoading || tile.value === undefined ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <span className="text-2xl font-semibold tracking-tight text-foreground">
                {tile.value}
              </span>
            )}
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function toneClass(tone: "neutral" | "good" | "critical" | "highlight" | "muted") {
  switch (tone) {
    case "good":
      return "text-emerald-600 dark:text-emerald-400";
    case "critical":
      return "text-destructive";
    case "highlight":
      return "text-highlight";
    case "muted":
      return "text-muted-foreground";
    default:
      return "text-primary";
  }
}
