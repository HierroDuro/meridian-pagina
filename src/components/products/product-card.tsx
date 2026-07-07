"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Star, ShoppingCart, PackageX } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, truncate } from "@/lib/utils";
import type { ProductDTO } from "@/types/product";

interface ProductCardProps {
  product: ProductDTO;
  /** Disables the mount fade-in; used when cards are appended, not the initial grid load. */
  index?: number;
}

/**
 * Product card: image, "Destacado" badge, name, short description, price,
 * stock and a buy action. Hover/entry animation is intentionally subtle
 * (slight lift + shadow growth) per the "elegant, not exaggerated" brief.
 */
export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const outOfStock = product.stock <= 0;
  const displayPrice = product.isOnSale && product.salePrice ? product.salePrice : product.price;

  const handleBuy = () => {
    if (outOfStock) return;
    toast.success(`${product.name} agregado al pedido`, {
      description: `SKU ${product.sku} · ${formatCurrency(displayPrice)}`,
    });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.03, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-shadow duration-300 hover:shadow-card-hover"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted/40">
        {product.isFeatured && (
          <Badge
            variant="highlight"
            className="absolute left-3 top-3 z-10 gap-1 px-2.5 py-1 shadow-soft"
          >
            <Star className="h-3 w-3 fill-current" />
            Destacado
          </Badge>
        )}
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          loading="lazy"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-contain p-6 transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
          {product.name}
        </h3>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {truncate(product.description, 90)}
        </p>

        <div className="mt-auto flex flex-col gap-3 pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-foreground">
              {formatCurrency(displayPrice)}
            </span>
            {product.isOnSale && product.salePrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs">
            {outOfStock ? (
              <span className="flex items-center gap-1 font-medium text-destructive">
                <PackageX className="h-3.5 w-3.5" />
                Sin stock
              </span>
            ) : (
              <span className="text-muted-foreground">
                Stock: <span className="font-medium text-foreground">{product.stock}</span>
              </span>
            )}
          </div>

          <Button
            onClick={handleBuy}
            disabled={outOfStock}
            className="w-full gap-2"
            size="sm"
          >
            <ShoppingCart className="h-4 w-4" />
            Comprar
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
