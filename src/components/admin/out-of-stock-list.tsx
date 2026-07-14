"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { PackageX, CheckCircle2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminStats } from "@/hooks/use-admin-stats";

/** Lists exactly which products are out of stock — the "Sin stock" tile
 * gives the count, this gives the actual products so nobody has to go
 * hunting for them in the full product table. */
export function OutOfStockList() {
  const { data, isLoading } = useAdminStats();

  if (isLoading || !data) {
    return (
      <Card className="p-5">
        <Skeleton className="h-5 w-40" />
        <div className="mt-4 space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </Card>
    );
  }

  const { outOfStockProducts } = data;

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <PackageX className="h-4 w-4 text-destructive" />
        <h2 className="text-sm font-semibold text-foreground">
          Productos sin stock {outOfStockProducts.length > 0 && `(${outOfStockProducts.length})`}
        </h2>
      </div>

      {outOfStockProducts.length === 0 ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          Todos los productos tienen stock disponible.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {outOfStockProducts.map((product, i) => (
            <motion.li
              key={product.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: Math.min(i, 10) * 0.02 }}
            >
              <Link
                href={`/admin/products/${product.id}/edit`}
                className="flex items-center gap-3 py-2.5 transition-colors hover:bg-accent/50"
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted/40">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-contain p-1"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                  <p className="text-xs text-muted-foreground">SKU {product.sku}</p>
                </div>
                {!product.isActive && (
                  <Badge variant="secondary" className="shrink-0">
                    Inactivo
                  </Badge>
                )}
              </Link>
            </motion.li>
          ))}
        </ul>
      )}
    </Card>
  );
}
