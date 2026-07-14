import { z } from "zod";

/**
 * Shared validation for creating/editing a product from the admin panel.
 * Used both on the client (React Hook Form resolver) and on the server
 * (Server Actions / API routes) so invalid data can never reach Prisma —
 * this is also a first line of defense against XSS payloads stored in
 * free-text fields like `description`.
 */
export const productSchema = z.object({
  sku: z
    .string()
    .trim()
    .min(2, "El SKU debe tener al menos 2 caracteres")
    .max(64, "El SKU es demasiado largo")
    .regex(/^[A-Za-z0-9._-]+$/, "El SKU solo puede tener letras, números, guiones y puntos"),
  name: z
    .string()
    .trim()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(160, "El nombre es demasiado largo"),
  description: z
    .string()
    .trim()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(2000, "La descripción es demasiado larga"),
  brand: z.string().trim().min(1, "La marca es obligatoria").max(80),
  price: z.coerce.number().positive("El precio debe ser mayor a 0"),
  isOnSale: z.boolean().default(false),
  stock: z.coerce.number().int().min(0, "El stock no puede ser negativo"),
  imageUrl: z.string().min(1, "La imagen es obligatoria"),
  images: z.array(z.string().min(1)).max(8, "Máximo 8 imágenes de galería").optional().default([]),
  categoryId: z.string().min(1, "La categoría es obligatoria"),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export type ProductInput = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(80),
});

export type CategoryInput = z.infer<typeof categorySchema>;

/** Query params accepted by the public product listing endpoint. */
export const productQuerySchema = z.object({
  search: z.string().trim().max(160).optional().default(""),
  categorySlugs: z.array(z.string()).optional().default([]),
  onSale: z.coerce.boolean().optional().default(false),
  featuredOnly: z.coerce.boolean().optional().default(false),
  brands: z.array(z.string()).optional().default([]),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  sort: z.enum(["relevance", "price-asc", "price-desc", "newest"]).optional().default("relevance"),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(60).optional().default(20),
});

export type ProductQueryInput = z.infer<typeof productQuerySchema>;
