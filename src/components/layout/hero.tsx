"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface HeroProps {
  productCount: number;
  categoryCount: number;
}

/**
 * Homepage-only focal point: shown once, above the filters/grid, so a
 * first-time visitor's eye lands somewhere deliberate instead of straight
 * into the catalog grid. Purely presentational — Storefront right below
 * is untouched.
 */
export function Hero({ productCount, categoryCount }: HeroProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mb-10 flex flex-col items-center gap-4 py-6 text-center sm:py-10"
    >
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft backdrop-blur">
        <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--aurora-2))]" />
        Stock actualizado en tiempo real
      </span>

      <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
        Tecnología, resmas y gráfica{" "}
        <span className="text-gradient-aurora">para tu empresa</span>
      </h1>

      <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
        Precios preferenciales y stock en tiempo real. Consultá por cualquier
        producto del catálogo y te respondemos por chat.
      </p>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
        <span className="rounded-full bg-secondary px-3 py-1">{productCount} productos</span>
        <span className="rounded-full bg-secondary px-3 py-1">{categoryCount} categorías</span>
        <span className="rounded-full bg-secondary px-3 py-1">Consultas por chat</span>
      </div>
    </motion.section>
  );
}
