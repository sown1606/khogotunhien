"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { HomepageSectionType } from "@prisma/client";

import type { ActionResult } from "@/lib/actions/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type SectionItemValue = {
  id?: string;
  productId?: string;
  categoryId?: string;
  customTitle?: string;
  customDescription?: string;
  imageUrl?: string;
  linkUrl?: string;
  active: boolean;
  sortOrder: number;
};

type HomepageSectionFormProps = {
  action: (state: ActionResult, formData: FormData) => Promise<ActionResult>;
  products: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
  initialValues?: {
    title?: string;
    slug?: string;
    description?: string | null;
    type?: HomepageSectionType;
    visible?: boolean;
    sortOrder?: number;
    items?: SectionItemValue[];
  };
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save section"}
    </Button>
  );
}

const DEFAULT_ITEM: SectionItemValue = {
  customTitle: "",
  customDescription: "",
  imageUrl: "",
  linkUrl: "",
  productId: "",
  categoryId: "",
  active: true,
  sortOrder: 0,
};

export function HomepageSectionForm({
  action,
  products,
  categories,
  initialValues,
}: HomepageSectionFormProps) {
  const [state, formAction] = useActionState(action, {});
  const router = useRouter();
  const [items, setItems] = useState<SectionItemValue[]>(initialValues?.items?.length ? initialValues.items : []);

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
    if (state.success) {
      toast.success(state.message || "Saved.");
      router.push("/admin/homepage");
      router.refresh();
    }
  }, [router, state.error, state.message, state.success]);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="items" value={JSON.stringify(items)} />

      <Card>
        <CardContent className="grid gap-4 p-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Section title</Label>
            <Input id="title" name="title" defaultValue={initialValues?.title || ""} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" name="slug" defaultValue={initialValues?.slug || ""} required />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={initialValues?.description || ""}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Section type</Label>
            <select
              id="type"
              name="type"
              defaultValue={initialValues?.type || "CUSTOM"}
              className="h-10 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm ring-focus"
            >
              <option value="FEATURED_PRODUCTS">Featured Products</option>
              <option value="FEATURED_CATEGORIES">Featured Categories</option>
              <option value="CURATED_COLLECTION">Curated Collection</option>
              <option value="PROMOTIONAL">Promotional</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sortOrder">Sort order</Label>
            <Input
              id="sortOrder"
              name="sortOrder"
              type="number"
              min={0}
              defaultValue={initialValues?.sortOrder ?? 0}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="visible" name="visible" defaultChecked={initialValues?.visible ?? true} />
            <Label htmlFor="visible">Visible on homepage</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <div>
              <Label>Section items</Label>
              <p className="text-xs text-stone-500">Add products, categories, or custom cards.</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setItems((previous) => [...previous, { ...DEFAULT_ITEM, sortOrder: previous.length }])
              }
            >
              <Plus className="size-4" />
              Add item
            </Button>
          </div>

          {items.length ? (
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={`${item.id || "item"}-${index}`} className="rounded-xl border border-stone-200 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-stone-800">Item #{index + 1}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setItems((previous) => previous.filter((_, itemIndex) => itemIndex !== index))
                      }
                    >
                      <Trash2 className="size-4" />
                      Remove
                    </Button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                      <Label>Product (optional)</Label>
                      <select
                        value={item.productId || ""}
                        onChange={(event) =>
                          setItems((previous) =>
                            previous.map((currentItem, itemIndex) =>
                              itemIndex === index
                                ? { ...currentItem, productId: event.target.value }
                                : currentItem,
                            ),
                          )
                        }
                        className="h-10 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm ring-focus"
                      >
                        <option value="">No product</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <Label>Category (optional)</Label>
                      <select
                        value={item.categoryId || ""}
                        onChange={(event) =>
                          setItems((previous) =>
                            previous.map((currentItem, itemIndex) =>
                              itemIndex === index
                                ? { ...currentItem, categoryId: event.target.value }
                                : currentItem,
                            ),
                          )
                        }
                        className="h-10 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm ring-focus"
                      >
                        <option value="">No category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <Label>Custom title</Label>
                      <Input
                        value={item.customTitle || ""}
                        onChange={(event) =>
                          setItems((previous) =>
                            previous.map((currentItem, itemIndex) =>
                              itemIndex === index
                                ? { ...currentItem, customTitle: event.target.value }
                                : currentItem,
                            ),
                          )
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>Image URL</Label>
                      <Input
                        value={item.imageUrl || ""}
                        onChange={(event) =>
                          setItems((previous) =>
                            previous.map((currentItem, itemIndex) =>
                              itemIndex === index
                                ? { ...currentItem, imageUrl: event.target.value }
                                : currentItem,
                            ),
                          )
                        }
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <Label>Custom description</Label>
                      <Textarea
                        value={item.customDescription || ""}
                        onChange={(event) =>
                          setItems((previous) =>
                            previous.map((currentItem, itemIndex) =>
                              itemIndex === index
                                ? { ...currentItem, customDescription: event.target.value }
                                : currentItem,
                            ),
                          )
                        }
                        rows={2}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>Link URL</Label>
                      <Input
                        value={item.linkUrl || ""}
                        onChange={(event) =>
                          setItems((previous) =>
                            previous.map((currentItem, itemIndex) =>
                              itemIndex === index
                                ? { ...currentItem, linkUrl: event.target.value }
                                : currentItem,
                            ),
                          )
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>Sort order</Label>
                      <Input
                        type="number"
                        min={0}
                        value={item.sortOrder}
                        onChange={(event) =>
                          setItems((previous) =>
                            previous.map((currentItem, itemIndex) =>
                              itemIndex === index
                                ? { ...currentItem, sortOrder: Number(event.target.value) || 0 }
                                : currentItem,
                            ),
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={item.active}
                        onCheckedChange={(checked) =>
                          setItems((previous) =>
                            previous.map((currentItem, itemIndex) =>
                              itemIndex === index
                                ? { ...currentItem, active: checked === true }
                                : currentItem,
                            ),
                          )
                        }
                      />
                      <Label>Active item</Label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone-500">No items added yet.</p>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <SubmitButton />
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/homepage")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
