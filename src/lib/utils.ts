import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind class names safely, resolving conflicting utility
 * classes (e.g. "p-2" vs "p-4") in favor of the last one supplied.
 * Standard shadcn/ui helper.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats a number as ARS currency, e.g. 1234.5 -> "$ 1.234,50". */
export function formatCurrency(value: number | string, currency = "ARS") {
  const numeric = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(numeric);
}

/** Turns "Multifunción InkTank DCP-T430W" into "multifuncion-inktank-dcp-t430w". */
export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/** Truncates text to a max length, appending an ellipsis if it was cut. */
export function truncate(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

/** Moves out-of-stock items to the end, keeping each group's existing
 * relative order — used everywhere the customer-facing catalog lists
 * products, so "Agotado" items don't crowd out what's actually
 * purchasable without hiding them entirely. */
export function sortAvailableFirst<T extends { stock: number }>(items: T[]): T[] {
  const available = items.filter((item) => item.stock > 0);
  const unavailable = items.filter((item) => item.stock <= 0);
  return [...available, ...unavailable];
}
