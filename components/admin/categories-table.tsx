"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Edit, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  featured: boolean;
  active: boolean;
  updatedAt: Date;
  _count: {
    products: number;
  };
};

type CategoriesTableProps = {
  categories: CategoryRow[];
};

export function CategoriesTable({ categories }: CategoriesTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const patchCategory = (id: string, payload: { active?: boolean; featured?: boolean }) => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/categories/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const json = (await response.json()) as { error?: string };
          throw new Error(json.error || "Failed to update category.");
        }

        toast.success("Category updated.");
        router.refresh();
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : "Failed to update category.");
      }
    });
  };

  const deleteCategory = (id: string) => {
    if (!window.confirm("Delete this category?")) return;

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/categories/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const json = (await response.json()) as { error?: string };
          throw new Error(json.error || "Failed to delete category.");
        }

        toast.success("Category deleted.");
        router.refresh();
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : "Failed to delete category.");
      }
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Products</TableHead>
            <TableHead>Sort</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell>
                <div>
                  <p className="font-semibold text-stone-900">{category.name}</p>
                  <p className="text-xs text-stone-500">/{category.slug}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Badge variant={category.active ? "success" : "outline"}>
                    {category.active ? "Active" : "Hidden"}
                  </Badge>
                  {category.featured ? <Badge variant="warning">Featured</Badge> : null}
                </div>
              </TableCell>
              <TableCell>{category._count.products}</TableCell>
              <TableCell>{category.sortOrder}</TableCell>
              <TableCell>{new Date(category.updatedAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => patchCategory(category.id, { active: !category.active })}
                    disabled={isPending}
                  >
                    {category.active ? "Hide" : "Show"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => patchCategory(category.id, { featured: !category.featured })}
                    disabled={isPending}
                  >
                    <Star className="size-4" />
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/admin/categories/${category.id}/edit`}>
                      <Edit className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => deleteCategory(category.id)}
                    disabled={isPending}
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
  );
}
