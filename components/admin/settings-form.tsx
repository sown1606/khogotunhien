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
  companyDescriptionEn: string | null;
  address: string | null;
  addressEn: string | null;
  phoneNumber: string | null;
  email: string | null;
  zaloLink: string | null;
  facebookLink: string | null;
  tiktokLink: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  seoTitle: string | null;
  seoTitleEn: string | null;
  seoDescription: string | null;
  seoDescriptionEn: string | null;
  seoKeywords: string | null;
  footerContent: string | null;
  footerContentEn: string | null;
  openingHours: string | null;
  openingHoursEn: string | null;
  contactPrimaryLabel: string;
  contactPrimaryLabelEn: string | null;
  contactSecondaryLabel: string;
  contactSecondaryLabelEn: string | null;
  leadPopupEnabled: boolean;
  leadPopupDelaySeconds: number;
  leadPopupTitle: string | null;
  leadPopupTitleEn: string | null;
  leadPopupDescription: string | null;
  leadPopupDescriptionEn: string | null;
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
  const fieldErrorMessages = Object.values(state.fieldErrors || {}).flat();

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
            <Label htmlFor="companyDescription">Company description (Vietnamese)</Label>
            <Textarea
              id="companyDescription"
              name="companyDescription"
              defaultValue={initialValues.companyDescription || ""}
              rows={4}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="companyDescriptionEn">Company description (English)</Label>
            <Textarea
              id="companyDescriptionEn"
              name="companyDescriptionEn"
              defaultValue={initialValues.companyDescriptionEn || ""}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone number</Label>
            <Input id="phoneNumber" name="phoneNumber" defaultValue={initialValues.phoneNumber || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={initialValues.email || ""} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Address (Vietnamese)</Label>
            <Input id="address" name="address" defaultValue={initialValues.address || ""} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="addressEn">Address (English)</Label>
            <Input id="addressEn" name="addressEn" defaultValue={initialValues.addressEn || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="openingHours">Opening hours (Vietnamese)</Label>
            <Input
              id="openingHours"
              name="openingHours"
              defaultValue={initialValues.openingHours || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="openingHoursEn">Opening hours (English)</Label>
            <Input
              id="openingHoursEn"
              name="openingHoursEn"
              defaultValue={initialValues.openingHoursEn || ""}
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
            <Input id="zaloLink" name="zaloLink" type="url" defaultValue={initialValues.zaloLink || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="facebookLink">Facebook link</Label>
            <Input
              id="facebookLink"
              name="facebookLink"
              type="url"
              defaultValue={initialValues.facebookLink || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tiktokLink">TikTok link</Label>
            <Input id="tiktokLink" name="tiktokLink" type="url" defaultValue={initialValues.tiktokLink || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPrimaryLabel">Primary CTA label (Vietnamese)</Label>
            <Input
              id="contactPrimaryLabel"
              name="contactPrimaryLabel"
              defaultValue={initialValues.contactPrimaryLabel}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPrimaryLabelEn">Primary CTA label (English)</Label>
            <Input
              id="contactPrimaryLabelEn"
              name="contactPrimaryLabelEn"
              defaultValue={initialValues.contactPrimaryLabelEn || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactSecondaryLabel">Secondary CTA label (Vietnamese)</Label>
            <Input
              id="contactSecondaryLabel"
              name="contactSecondaryLabel"
              defaultValue={initialValues.contactSecondaryLabel}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactSecondaryLabelEn">Secondary CTA label (English)</Label>
            <Input
              id="contactSecondaryLabelEn"
              name="contactSecondaryLabelEn"
              defaultValue={initialValues.contactSecondaryLabelEn || ""}
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
          <CardTitle>Lead popup</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <label className="inline-flex items-center gap-2 text-sm font-medium text-stone-800 md:col-span-2">
            <input
              type="checkbox"
              name="leadPopupEnabled"
              defaultChecked={initialValues.leadPopupEnabled}
              className="size-4 rounded border-stone-300"
            />
            Enable popup for phone/email capture
          </label>
          <div className="space-y-2">
            <Label htmlFor="leadPopupDelaySeconds">Popup delay (seconds)</Label>
            <Input
              id="leadPopupDelaySeconds"
              name="leadPopupDelaySeconds"
              type="number"
              min={5}
              max={300}
              defaultValue={initialValues.leadPopupDelaySeconds || 25}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="leadPopupTitle">Popup title (Vietnamese)</Label>
            <Input
              id="leadPopupTitle"
              name="leadPopupTitle"
              defaultValue={initialValues.leadPopupTitle || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="leadPopupTitleEn">Popup title (English)</Label>
            <Input
              id="leadPopupTitleEn"
              name="leadPopupTitleEn"
              defaultValue={initialValues.leadPopupTitleEn || ""}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="leadPopupDescription">Popup description (Vietnamese)</Label>
            <Textarea
              id="leadPopupDescription"
              name="leadPopupDescription"
              rows={3}
              defaultValue={initialValues.leadPopupDescription || ""}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="leadPopupDescriptionEn">Popup description (English)</Label>
            <Textarea
              id="leadPopupDescriptionEn"
              name="leadPopupDescriptionEn"
              rows={3}
              defaultValue={initialValues.leadPopupDescriptionEn || ""}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO defaults</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="seoTitle">SEO title (Vietnamese)</Label>
            <Input id="seoTitle" name="seoTitle" defaultValue={initialValues.seoTitle || ""} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="seoTitleEn">SEO title (English)</Label>
            <Input id="seoTitleEn" name="seoTitleEn" defaultValue={initialValues.seoTitleEn || ""} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="seoDescription">SEO description (Vietnamese)</Label>
            <Textarea
              id="seoDescription"
              name="seoDescription"
              defaultValue={initialValues.seoDescription || ""}
              rows={3}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="seoDescriptionEn">SEO description (English)</Label>
            <Textarea
              id="seoDescriptionEn"
              name="seoDescriptionEn"
              defaultValue={initialValues.seoDescriptionEn || ""}
              rows={3}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="seoKeywords">SEO keywords</Label>
            <Input id="seoKeywords" name="seoKeywords" defaultValue={initialValues.seoKeywords || ""} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="footerContent">Footer content (Vietnamese)</Label>
            <Textarea
              id="footerContent"
              name="footerContent"
              defaultValue={initialValues.footerContent || ""}
              rows={3}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="footerContentEn">Footer content (English)</Label>
            <Textarea
              id="footerContentEn"
              name="footerContentEn"
              defaultValue={initialValues.footerContentEn || ""}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <SubmitButton />
    </form>
  );
}
