"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import type { ActionResult } from "@/lib/actions/types";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CategoryFormProps = {
  action: (state: ActionResult, formData: FormData) => Promise<ActionResult>;
  initialValues?: {
    name?: string;
    slug?: string;
    shortDescription?: string | null;
    imageUrl?: string | null;
    featured?: boolean;
    active?: boolean;
    sortOrder?: number;
  };
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save category"}
    </Button>
  );
}

export function CategoryForm({ action, initialValues }: CategoryFormProps) {
  const [state, formAction] = useActionState(action, {});
  const [imageUrl, setImageUrl] = useState(initialValues?.imageUrl || "");
  const router = useRouter();

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
    if (state.success) {
      toast.success(state.message || "Saved");
      router.push("/admin/categories");
      router.refresh();
    }
  }, [router, state.error, state.message, state.success]);

  return (
    <form action={formAction} className="space-y-5">
      <Card>
        <CardContent className="grid gap-4 p-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Category name</Label>
            <Input id="name" name="name" defaultValue={initialValues?.name || ""} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" name="slug" defaultValue={initialValues?.slug || ""} required />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="shortDescription">Short description</Label>
            <Textarea
              id="shortDescription"
              name="shortDescription"
              defaultValue={initialValues?.shortDescription || ""}
              rows={3}
            />
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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox id="featured" name="featured" defaultChecked={Boolean(initialValues?.featured)} />
              <Label htmlFor="featured">Featured</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="active" name="active" defaultChecked={initialValues?.active ?? true} />
              <Label htmlFor="active">Active</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <ImageUploadField
            label="Category image"
            name="imageUrl"
            value={imageUrl}
            onChange={setImageUrl}
          />
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <SubmitButton />
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/categories")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
