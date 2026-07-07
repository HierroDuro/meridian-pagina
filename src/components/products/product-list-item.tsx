"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Star, ShoppingCart, PackageX } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, truncate } from "@/lib/utils";
import type { ProductDTO } from "@/types/product";

/** Compact row layout used by the grid/list view toggle. */
export function ProductListItem({ product, index = 0 }: { product: ProductDTO; index?: number }) {
  const outOfStock = product.stock <= 0;
  const displayPrice = product.isOnSale && product.salePrice ? product.salePrice : product.price;

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index, 10) * 0.02 }}
      className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-soft transition-shadow hover:shadow-card-hover"
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted/40">
        {product.isFeatured && (
          <Badge variant="highlight" className="absolute left-1 top-1 z-10 gap-0.5 px-1.5 py-0 text-[10px]">
            <Star className="h-2.5 w-2.5 fill-current" />
          </Badge>
        )}
        <Image src={product.imageUrl} alt={product.name} fill className="object-contain p-2" />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-foreground">{product.name}</h3>
        <p className="truncate text-xs text-muted-foreground">{truncate(product.description, 100)}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {outOfStock ? (
            <span className="flex items-center gap-1 font-medium text-destructive">
              <PackageX className="h-3 w-3" /> Sin stock
            </span>
          ) : (
            <>Stock: {product.stock}</>
          )}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <span className="text-base font-bold text-foreground">{formatCurrency(displayPrice)}</span>
        <Button
          size="sm"
          disabled={outOfStock}
          className="gap-1.5"
          onClick={() =>
            toast.success(`${product.name} agregado al pedido`, {
              description: `SKU ${product.sku}`,
            })
          }
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          Comprar
        </Button>
      </div>
    </motion.article>
  );
}
