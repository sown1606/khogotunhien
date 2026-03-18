"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Edit, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  featured: boolean;
  active: boolean;
  updatedAt: Date;
  category: { name: string } | null;
};

type ProductsTableProps = {
  products: ProductRow[];
};

const bulkActions = [
  { value: "activate", label: "Activate" },
  { value: "deactivate", label: "Deactivate" },
  { value: "feature", label: "Mark featured" },
  { value: "unfeature", label: "Unmark featured" },
  { value: "delete", label: "Delete" },
] as const;

export function ProductsTable({ products }: ProductsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<(typeof bulkActions)[number]["value"]>("activate");

  const allSelected = useMemo(
    () => products.length > 0 && selectedIds.length === products.length,
    [products.length, selectedIds.length],
  );

  const toggleRow = (id: string, checked: boolean) => {
    setSelectedIds((previous) =>
      checked ? [...new Set([...previous, id])] : previous.filter((item) => item !== id),
    );
  };

  const runBulkAction = () => {
    if (!selectedIds.length) {
      toast.error("Select at least one product.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/products/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ids: selectedIds,
            action: bulkAction,
          }),
        });

        if (!response.ok) {
          const json = (await response.json()) as { error?: string };
          throw new Error(json.error || "Bulk action failed.");
        }

        toast.success("Bulk action completed.");
        setSelectedIds([]);
        router.refresh();
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : "Bulk action failed.");
      }
    });
  };

  const patchProduct = (id: string, payload: { active?: boolean; featured?: boolean }) => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/products/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const json = (await response.json()) as { error?: string };
          throw new Error(json.error || "Failed to update product.");
        }

        toast.success("Product updated.");
        router.refresh();
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : "Failed to update product.");
      }
    });
  };

  const deleteProduct = (id: string) => {
    if (!window.confirm("Delete this product? This action cannot be undone.")) return;

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/products/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const json = (await response.json()) as { error?: string };
          throw new Error(json.error || "Failed to delete product.");
        }

        toast.success("Product deleted.");
        router.refresh();
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : "Failed to delete product.");
      }
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-stone-200 bg-white p-3">
        <p className="text-sm text-stone-600">
          {selectedIds.length ? `${selectedIds.length} selected` : "Select products for bulk actions"}
        </p>
        <select
          value={bulkAction}
          onChange={(event) =>
            setBulkAction(event.target.value as (typeof bulkActions)[number]["value"])
          }
          className="h-9 rounded-lg border border-stone-300 px-2 text-sm ring-focus"
        >
          {bulkActions.map((action) => (
            <option key={action.value} value={action.value}>
              {action.label}
            </option>
          ))}
        </select>
        <Button size="sm" onClick={runBulkAction} disabled={isPending}>
          Apply
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) =>
                    setSelectedIds(checked === true ? products.map((product) => product.id) : [])
                  }
                />
              </TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sort</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(product.id)}
                    onCheckedChange={(checked) => toggleRow(product.id, checked === true)}
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-semibold text-stone-900">{product.name}</p>
                    <p className="text-xs text-stone-500">/{product.slug}</p>
                  </div>
                </TableCell>
                <TableCell>{product.category?.name || "-"}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant={product.active ? "success" : "outline"}>
                      {product.active ? "Active" : "Hidden"}
                    </Badge>
                    {product.featured ? <Badge variant="warning">Featured</Badge> : null}
                  </div>
                </TableCell>
                <TableCell>{product.sortOrder}</TableCell>
                <TableCell>{new Date(product.updatedAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => patchProduct(product.id, { active: !product.active })}
                    >
                      {product.active ? "Hide" : "Show"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => patchProduct(product.id, { featured: !product.featured })}
                    >
                      <Star className="size-4" />
                    </Button>
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Edit className="size-4" />
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => deleteProduct(product.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
