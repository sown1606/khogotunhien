"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import type { ActionResult } from "@/lib/actions/types";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type SettingsValues = {
  companyName: string;
  companyDescription: string | null;
  address: string | null;
  phoneNumber: string | null;
  email: string | null;
  zaloLink: string | null;
  facebookLink: string | null;
  tiktokLink: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  footerContent: string | null;
  openingHours: string | null;
  contactPrimaryLabel: string;
  contactSecondaryLabel: string;
};

type SettingsFormProps = {
  action: (state: ActionResult, formData: FormData) => Promise<ActionResult>;
  initialValues: SettingsValues;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save settings"}
    </Button>
  );
}

export function SettingsForm({ action, initialValues }: SettingsFormProps) {
  const [state, formAction] = useActionState(action, {});
  const [logoUrl, setLogoUrl] = useState(initialValues.logoUrl || "");
  const [faviconUrl, setFaviconUrl] = useState(initialValues.faviconUrl || "");

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
    if (state.success) {
      toast.success(state.message || "Settings saved.");
    }
  }, [state.error, state.message, state.success]);

  return (
    <form action={formAction} className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Company information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="companyName">Company name</Label>
            <Input
              id="companyName"
              name="companyName"
              defaultValue={initialValues.companyName}
              required
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="companyDescription">Company description</Label>
            <Textarea
              id="companyDescription"
              name="companyDescription"
              defaultValue={initialValues.companyDescription || ""}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone number</Label>
            <Input id="phoneNumber" name="phoneNumber" defaultValue={initialValues.phoneNumber || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" defaultValue={initialValues.email || ""} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" defaultValue={initialValues.address || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="openingHours">Opening hours</Label>
            <Input
              id="openingHours"
              name="openingHours"
              defaultValue={initialValues.openingHours || ""}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact and social links</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="zaloLink">Zalo link</Label>
            <Input id="zaloLink" name="zaloLink" defaultValue={initialValues.zaloLink || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="facebookLink">Facebook link</Label>
            <Input
              id="facebookLink"
              name="facebookLink"
              defaultValue={initialValues.facebookLink || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tiktokLink">TikTok link</Label>
            <Input id="tiktokLink" name="tiktokLink" defaultValue={initialValues.tiktokLink || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPrimaryLabel">Primary CTA label</Label>
            <Input
              id="contactPrimaryLabel"
              name="contactPrimaryLabel"
              defaultValue={initialValues.contactPrimaryLabel}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactSecondaryLabel">Secondary CTA label</Label>
            <Input
              id="contactSecondaryLabel"
              name="contactSecondaryLabel"
              defaultValue={initialValues.contactSecondaryLabel}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Brand assets</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <ImageUploadField label="Company logo" name="logoUrl" value={logoUrl} onChange={setLogoUrl} />
          <ImageUploadField
            label="Favicon"
            name="faviconUrl"
            value={faviconUrl}
            onChange={setFaviconUrl}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO defaults</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="seoTitle">SEO title</Label>
            <Input id="seoTitle" name="seoTitle" defaultValue={initialValues.seoTitle || ""} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="seoDescription">SEO description</Label>
            <Textarea
              id="seoDescription"
              name="seoDescription"
              defaultValue={initialValues.seoDescription || ""}
              rows={3}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="seoKeywords">SEO keywords</Label>
            <Input id="seoKeywords" name="seoKeywords" defaultValue={initialValues.seoKeywords || ""} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="footerContent">Footer content</Label>
            <Textarea
              id="footerContent"
              name="footerContent"
              defaultValue={initialValues.footerContent || ""}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <SubmitButton />
    </form>
  );
}
