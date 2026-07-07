"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { createCategory, updateCategory, deleteCategory } from "@/actions/category-actions";
import type { CategoryDTO } from "@/types/product";

export function CategoryManager({ categories }: { categories: CategoryDTO[] }) {
  const router = useRouter();
  const [newName, setNewName] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingName, setEditingName] = React.useState("");
  const [deleteTarget, setDeleteTarget] = React.useState<CategoryDTO | null>(null);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    const result = await createCategory(newName);
    setCreating(false);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setNewName("");
    router.refresh();
  };

  const startEdit = (category: CategoryDTO) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const saveEdit = async (id: string) => {
    const result = await updateCategory(id, editingName);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setEditingId(null);
    router.refresh();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const result = await deleteCategory(deleteTarget.id);
    setDeleteTarget(null);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    router.refresh();
  };

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex gap-2">
        <Input
          placeholder="Nombre de la nueva categoría"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />
        <Button onClick={handleCreate} disabled={creating} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Agregar
        </Button>
      </div>

      <ul className="divide-y divide-border rounded-lg border border-border bg-card">
        {categories.map((category) => (
          <li key={category.id} className="flex items-center justify-between gap-3 px-4 py-3">
            {editingId === category.id ? (
              <>
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="h-8"
                  autoFocus
                />
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => saveEdit(category.id)}>
                    <Check className="h-4 w-4 text-emerald-600" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{category.name}</span>
                  {typeof category.productCount === "number" && (
                    <Badge variant="secondary">{category.productCount} productos</Badge>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => startEdit(category)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(category)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar categoría</DialogTitle>
            <DialogDescription>
              ¿Seguro que querés eliminar &quot;{deleteTarget?.name}&quot;? Si tiene productos
              asociados, no se podrá eliminar.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
