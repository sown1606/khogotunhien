"use client";

import Image from "next/image";
import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { ImagePlus, X } from "lucide-react";

import type { ActionResult } from "@/lib/actions/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "@/components/admin/image-upload-field";

type ProductFormProps = {
  action: (state: ActionResult, formData: FormData) => Promise<ActionResult>;
  categories: Array<{ id: string; name: string }>;
  relatedProducts: Array<{ id: string; name: string }>;
  initialValues?: {
    id?: string;
    name?: string;
    nameEn?: string | null;
    slug?: string;
    shortDescription?: string | null;
    shortDescriptionEn?: string | null;
    description?: string | null;
    descriptionEn?: string | null;
    thumbnailUrl?: string | null;
    price?: number | null;
    comparePrice?: number | null;
    discountPercent?: number | null;
    shippingLabel?: string | null;
    badgeLabel?: string | null;
    tags?: string[] | null;
    rating?: number | null;
    reviewCount?: number | null;
    woodType?: string | null;
    woodTypeEn?: string | null;
    material?: string | null;
    materialEn?: string | null;
    dimensions?: string | null;
    dimensionsEn?: string | null;
    finish?: string | null;
    finishEn?: string | null;
    featured?: boolean;
    active?: boolean;
    sortOrder?: number;
    categoryId?: string | null;
    galleryUrls?: string[];
    relatedProductIds?: string[];
  };
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Đang lưu..." : "Lưu sản phẩm"}
    </Button>
  );
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;

  return <p className="text-xs text-red-600">{messages[0]}</p>;
}

export function ProductForm({
  action,
  categories,
  relatedProducts,
  initialValues,
}: ProductFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(action, {});
  const [thumbnailUrl, setThumbnailUrl] = useState(initialValues?.thumbnailUrl || "");
  const [galleryUrls, setGalleryUrls] = useState<string[]>(initialValues?.galleryUrls || []);
  const [relatedIds, setRelatedIds] = useState<string[]>(initialValues?.relatedProductIds || []);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fieldErrorMessages = Object.values(state.fieldErrors || {}).flat();

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
    if (state?.success) {
      toast.success(state.message || "Saved.");
      router.push("/admin/products");
      router.refresh();
    }
  }, [router, state]);

  const uploadGalleryFiles = async (files: FileList) => {
    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        const json = (await response.json()) as { url?: string; error?: string };
        if (response.ok && json.url) {
          uploadedUrls.push(json.url);
        } else {
          toast.error(json.error || `Failed to upload ${file.name}`);
        }
      }

      if (uploadedUrls.length) {
        setGalleryUrls((previous) => [...previous, ...uploadedUrls]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Gallery upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <form action={formAction} className="space-y-5">
      {fieldErrorMessages.length ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <p className="font-medium">Please correct the highlighted fields.</p>
          <ul className="mt-1 list-disc pl-5">
            {fieldErrorMessages.map((message, index) => (
              <li key={`${message}-${index}`}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <input type="hidden" name="galleryUrls" value={JSON.stringify(galleryUrls)} />
      <input type="hidden" name="relatedProductIds" value={JSON.stringify(relatedIds)} />

      <Card>
        <CardContent className="grid gap-4 p-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Product name (Vietnamese)</Label>
            <Input id="name" name="name" defaultValue={initialValues?.name || ""} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nameEn">Product name (English)</Label>
            <Input id="nameEn" name="nameEn" defaultValue={initialValues?.nameEn || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" name="slug" defaultValue={initialValues?.slug || ""} required />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="shortDescription">Short description (Vietnamese)</Label>
            <Textarea
              id="shortDescription"
              name="shortDescription"
              defaultValue={initialValues?.shortDescription || ""}
              rows={2}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="shortDescriptionEn">Short description (English)</Label>
            <Textarea
              id="shortDescriptionEn"
              name="shortDescriptionEn"
              defaultValue={initialValues?.shortDescriptionEn || ""}
              rows={2}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Overview (Vietnamese)</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={initialValues?.description || ""}
              rows={5}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="descriptionEn">Overview (English)</Label>
            <Textarea
              id="descriptionEn"
              name="descriptionEn"
              defaultValue={initialValues?.descriptionEn || ""}
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Category</Label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={initialValues?.categoryId || ""}
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

          <div className="space-y-2">
            <Label htmlFor="price">Giá hiện tại (VND)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              defaultValue={initialValues?.price ?? ""}
              placeholder="2630000"
            />
            <FieldError messages={state.fieldErrors?.price} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="comparePrice">Giá cũ / giá so sánh (VND)</Label>
            <Input
              id="comparePrice"
              name="comparePrice"
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              defaultValue={initialValues?.comparePrice ?? ""}
              placeholder="3030000"
            />
            <FieldError messages={state.fieldErrors?.comparePrice} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discountPercent">Giảm giá thủ công (%)</Label>
            <Input
              id="discountPercent"
              name="discountPercent"
              type="number"
              min={0}
              max={100}
              step={1}
              inputMode="numeric"
              defaultValue={initialValues?.discountPercent ?? ""}
              placeholder="Tự tính nếu bỏ trống"
            />
            <FieldError messages={state.fieldErrors?.discountPercent} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shippingLabel">Nhãn vận chuyển</Label>
            <Input
              id="shippingLabel"
              name="shippingLabel"
              defaultValue={initialValues?.shippingLabel || ""}
              placeholder="Miễn phí vận chuyển"
            />
            <FieldError messages={state.fieldErrors?.shippingLabel} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="badgeLabel">Nhãn nổi bật</Label>
            <Input
              id="badgeLabel"
              name="badgeLabel"
              defaultValue={initialValues?.badgeLabel || ""}
              placeholder="Phổ biến"
            />
            <FieldError messages={state.fieldErrors?.badgeLabel} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags / chips</Label>
            <Input
              id="tags"
              name="tags"
              defaultValue={initialValues?.tags?.join(", ") || ""}
              placeholder="Gỗ Thông Tự Nhiên, Gỗ Thông Mỹ, Thông Mỹ"
            />
            <FieldError messages={state.fieldErrors?.tags} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rating">Đánh giá</Label>
            <Input
              id="rating"
              name="rating"
              type="number"
              min={0}
              max={5}
              step={0.1}
              inputMode="decimal"
              defaultValue={initialValues?.rating ?? ""}
              placeholder="4.8"
            />
            <FieldError messages={state.fieldErrors?.rating} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reviewCount">Số lượt đánh giá</Label>
            <Input
              id="reviewCount"
              name="reviewCount"
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              defaultValue={initialValues?.reviewCount ?? ""}
              placeholder="128"
            />
            <FieldError messages={state.fieldErrors?.reviewCount} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="woodType">Wood type (Vietnamese)</Label>
            <Input id="woodType" name="woodType" defaultValue={initialValues?.woodType || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="woodTypeEn">Wood type (English)</Label>
            <Input id="woodTypeEn" name="woodTypeEn" defaultValue={initialValues?.woodTypeEn || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="material">Material (Vietnamese)</Label>
            <Input id="material" name="material" defaultValue={initialValues?.material || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="materialEn">Material (English)</Label>
            <Input id="materialEn" name="materialEn" defaultValue={initialValues?.materialEn || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dimensions">Dimensions (Vietnamese)</Label>
            <Input id="dimensions" name="dimensions" defaultValue={initialValues?.dimensions || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dimensionsEn">Dimensions (English)</Label>
            <Input
              id="dimensionsEn"
              name="dimensionsEn"
              defaultValue={initialValues?.dimensionsEn || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="finish">Finish (Vietnamese)</Label>
            <Input id="finish" name="finish" defaultValue={initialValues?.finish || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="finishEn">Finish (English)</Label>
            <Input id="finishEn" name="finishEn" defaultValue={initialValues?.finishEn || ""} />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="featured" name="featured" defaultChecked={Boolean(initialValues?.featured)} />
            <Label htmlFor="featured">Featured product</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="active"
              name="active"
              defaultChecked={initialValues?.active ?? true}
            />
            <Label htmlFor="active">Active on storefront</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-5">
          <ImageUploadField
            label="Thumbnail image"
            name="thumbnailUrl"
            value={thumbnailUrl}
            onChange={setThumbnailUrl}
            helperText="Upload or paste image URL"
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Label>Gallery images</Label>
              <p className="text-xs text-stone-500">Upload multiple images and reorder manually if needed.</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <ImagePlus className="size-4" />
              {uploading ? "Uploading..." : "Add images"}
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif"
            multiple
            className="hidden"
            onChange={(event) => {
              if (event.target.files?.length) {
                void uploadGalleryFiles(event.target.files);
              }
            }}
          />

          {galleryUrls.length ? (
            <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4">
              {galleryUrls.map((url, index) => (
                <div key={`${url}-${index}`} className="space-y-2">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-stone-200">
                    <Image src={url} alt={`Gallery ${index + 1}`} fill className="object-cover" />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      setGalleryUrls((previous) => previous.filter((_, currentIndex) => currentIndex !== index))
                    }
                  >
                    <X className="size-4" />
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone-500">No gallery images yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-5">
          <Label>Related products</Label>
          <p className="text-xs text-stone-500">Select products to show in the related section.</p>
          <div className="grid max-h-72 gap-2 overflow-auto rounded-xl border border-stone-200 p-3 sm:grid-cols-2">
            {relatedProducts
              .filter((product) => product.id !== initialValues?.id)
              .map((product) => (
                <label
                  key={product.id}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 hover:border-stone-200"
                >
                  <input
                    type="checkbox"
                    checked={relatedIds.includes(product.id)}
                    onChange={(event) => {
                      if (event.target.checked) {
                        setRelatedIds((previous) => [...previous, product.id]);
                      } else {
                        setRelatedIds((previous) => previous.filter((id) => id !== product.id));
                      }
                    }}
                  />
                  <span className="text-sm text-stone-700">{product.name}</span>
                </label>
              ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <SubmitButton />
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/products")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
