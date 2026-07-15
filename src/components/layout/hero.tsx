"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Tag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { ProductDTO } from "@/types/product";

interface HeroProps {
  productCount: number;
  categoryCount: number;
  offers: ProductDTO[];
}

/**
 * Homepage-only focal point: shown once, above the filters/grid, so a
 * first-time visitor's eye lands somewhere deliberate instead of straight
 * into the catalog grid. The banner itself is the on-sale products —
 * large tiles, auto-scrolling horizontally — with a short heading above
 * it for context. Purely presentational — Storefront right below is
 * untouched, and the same on-sale products still show in their own
 * category section and in the curated feed's "Ofertas" section.
 */
export function Hero({ productCount, categoryCount, offers }: HeroProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mb-10 flex flex-col items-center gap-4 py-6 text-center sm:py-8"
    >
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft backdrop-blur">
        <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--aurora-2))]" />
        Stock actualizado en tiempo real
      </span>

      <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
        Tecnología, resmas y gráfica{" "}
        <span className="text-gradient-aurora">para tu empresa</span>
      </h1>

      <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
        <span className="rounded-full bg-secondary px-3 py-1">{productCount} productos</span>
        <span className="rounded-full bg-secondary px-3 py-1">{categoryCount} categorías</span>
        <span className="rounded-full bg-secondary px-3 py-1">Consultas por chat</span>
      </div>

      {offers.length > 0 && <OffersMarquee offers={offers} />}
    </motion.section>
  );
}

/** Auto-scrolling horizontal strip of on-sale products — pure CSS
 * animation (no JS timer), the item list is rendered twice back-to-back
 * and the track scrolls exactly half its width, so the loop is seamless.
 * Hover pauses it (CSS-only) so it's actually readable/clickable. */
function OffersMarquee({ offers }: { offers: ProductDTO[] }) {
  const track = [...offers, ...offers];
  // Roughly constant per-item speed regardless of how many are on sale.
  const durationSeconds = Math.max(offers.length * 5, 20);

  return (
    <div className="group mt-4 w-full max-w-none overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
      <div
        className="flex w-max items-stretch gap-5 [animation-play-state:running] group-hover:[animation-play-state:paused]"
        style={{
          // Longhand properties on purpose: the `animation` shorthand
          // implicitly resets animation-play-state to "running" and, set
          // inline, would out-specificity the group-hover class above —
          // leaving play-state out of this inline style is what lets the
          // hover-to-pause utility actually take effect.
          animationName: "marquee",
          animationDuration: `${durationSeconds}s`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
        }}
      >
        {track.map((product, i) => (
          <Link
            key={`${product.id}-${i}`}
            href={`/productos/${product.id}`}
            className="relative flex w-56 shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-card text-left shadow-soft transition-shadow hover:border-primary/30 hover:shadow-[0_18px_40px_-16px_hsl(var(--primary)/0.45)] sm:w-64"
          >
            <Badge
              variant="destructive"
              className="absolute left-2.5 top-2.5 z-10 gap-1 px-2 py-0.5 text-[10px]"
            >
              <Tag className="h-3 w-3" />
              Oferta
            </Badge>
            <div className="relative aspect-square w-full bg-white">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="256px"
                className="object-contain p-6"
              />
            </div>
            <div className="flex flex-1 flex-col gap-1 p-3.5">
              <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
                {product.name}
              </p>
              <div className="mt-auto flex items-baseline gap-2 pt-1">
                {product.originalPrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
                <span className="font-bold text-foreground">{formatCurrency(product.price)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
