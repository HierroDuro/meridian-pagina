"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { productSchema, type ProductInput } from "@/lib/validations/product.schema";
import { createProduct, updateProduct } from "@/actions/product-actions";
import type { CategoryDTO, ProductDTO } from "@/types/product";

interface ProductFormProps {
  categories: CategoryDTO[];
  product?: ProductDTO;
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          sku: product.sku,
          name: product.name,
          description: product.description,
          brand: product.brand,
          price: product.price,
          isOnSale: product.isOnSale,
          salePrice: product.salePrice ?? undefined,
          stock: product.stock,
          imageUrl: product.imageUrl,
          categoryId: product.categoryId,
          isFeatured: product.isFeatured,
          isActive: product.isActive,
        }
      : {
          isFeatured: false,
          isActive: true,
          isOnSale: false,
          stock: 0,
        },
  });

  const imageUrl = watch("imageUrl");
  const isOnSale = watch("isOnSale");

  const onSubmit = async (values: ProductInput) => {
    const result = product
      ? await updateProduct(product.id, values)
      : await createProduct(values);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    router.push("/admin/products");
    router.refresh();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "No se pudo subir la imagen");
        return;
      }

      setValue("imageUrl", data.url, { shouldValidate: true });
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6" noValidate>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" {...register("sku")} />
          {errors.sku && <p className="text-xs text-destructive">{errors.sku.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="brand">Marca</Label>
          <Input id="brand" {...register("brand")} />
          {errors.brand && <p className="text-xs text-destructive">{errors.brand.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Descripción</Label>
        <Textarea id="description" rows={4} {...register("description")} />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Categoría</Label>
        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Elegí una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.categoryId && (
          <p className="text-xs text-destructive">{errors.categoryId.message}</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="price">Precio</Label>
          <Input id="price" type="number" step="0.01" {...register("price")} />
          {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="salePrice">Precio oferta</Label>
          <Input
            id="salePrice"
            type="number"
            step="0.01"
            disabled={!isOnSale}
            {...register("salePrice")}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="stock">Stock</Label>
          <Input id="stock" type="number" {...register("stock")} />
          {errors.stock && <p className="text-xs text-destructive">{errors.stock.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Imagen del producto</Label>
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-border bg-muted/40">
            {imageUrl ? (
              <Image src={imageUrl} alt="Vista previa" fill className="object-contain p-2" />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <Upload className="h-5 w-5" />
              </div>
            )}
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleImageUpload}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subir imagen"}
            </Button>
            {errors.imageUrl && (
              <p className="mt-1 text-xs text-destructive">{errors.imageUrl.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 rounded-lg border border-border p-4">
        <Controller
          control={control}
          name="isFeatured"
          render={({ field }) => (
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="isFeatured" className="cursor-pointer">
                Destacado
              </Label>
              <Switch id="isFeatured" checked={field.value} onCheckedChange={field.onChange} />
            </div>
          )}
        />
        <Controller
          control={control}
          name="isActive"
          render={({ field }) => (
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="isActive" className="cursor-pointer">
                Activo
              </Label>
              <Switch id="isActive" checked={field.value} onCheckedChange={field.onChange} />
            </div>
          )}
        />
        <Controller
          control={control}
          name="isOnSale"
          render={({ field }) => (
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="isOnSale" className="cursor-pointer">
                En oferta
              </Label>
              <Switch id="isOnSale" checked={field.value} onCheckedChange={field.onChange} />
            </div>
          )}
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : product ? (
            "Guardar cambios"
          ) : (
            "Crear producto"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
