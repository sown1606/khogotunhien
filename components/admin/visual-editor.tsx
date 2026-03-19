"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { WandSparkles, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import type { ActionResult } from "@/lib/actions/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type VisualEditorValues = {
  companyName: string;
  companyDescription: string;
  companyDescriptionEn: string;
  phoneNumber: string;
  email: string;
  zaloLink: string;
  logoUrl: string;
  contactPrimaryLabel: string;
  contactSecondaryLabel: string;
  leadPopupEnabled: boolean;
  leadPopupDelaySeconds: number;
  leadPopupTitle: string;
  leadPopupTitleEn: string;
  leadPopupDescription: string;
  leadPopupDescriptionEn: string;
};

type VisualEditorSection = {
  id: string;
  title: string;
  titleEn: string | null;
  type: string;
  visible: boolean;
  sortOrder: number;
};

type VisualEditorProps = {
  action: (state: ActionResult, formData: FormData) => Promise<ActionResult>;
  initialValues: VisualEditorValues;
  sections: VisualEditorSection[];
};

const editableFields = [
  { value: "companyDescription", label: "Mô tả công ty (VI)" },
  { value: "companyDescriptionEn", label: "Mô tả công ty (EN)" },
  { value: "leadPopupTitle", label: "Tiêu đề popup (VI)" },
  { value: "leadPopupTitleEn", label: "Tiêu đề popup (EN)" },
  { value: "leadPopupDescription", label: "Mô tả popup (VI)" },
  { value: "leadPopupDescriptionEn", label: "Mô tả popup (EN)" },
] as const;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save visual changes"}
    </Button>
  );
}

export function VisualEditor({ action, initialValues, sections }: VisualEditorProps) {
  const [state, formAction] = useActionState(action, {});
  const [previewLocale, setPreviewLocale] = useState<"vi" | "en">("vi");
  const [form, setForm] = useState(initialValues);
  const [aiTargetField, setAiTargetField] = useState<(typeof editableFields)[number]["value"]>(
    "companyDescription",
  );
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const fieldErrorMessages = Object.values(state.fieldErrors || {}).flat();
  const previewDescription =
    previewLocale === "vi"
      ? form.companyDescription || "Mô tả thương hiệu sẽ hiển thị tại đây."
      : form.companyDescriptionEn || form.companyDescription || "Brand description preview.";
  const previewPopupTitle =
    previewLocale === "vi"
      ? form.leadPopupTitle || "Cần hỗ trợ nhanh?"
      : form.leadPopupTitleEn || form.leadPopupTitle || "Need quick support?";
  const previewPopupDescription =
    previewLocale === "vi"
      ? form.leadPopupDescription || "Để lại số điện thoại hoặc email để đội ngũ liên hệ tư vấn."
      : form.leadPopupDescriptionEn ||
        form.leadPopupDescription ||
        "Leave your phone or email and our team will contact you shortly.";
  const visibleSectionCount = useMemo(
    () => sections.filter((section) => section.visible).length,
    [sections],
  );

  async function handleAiGenerate() {
    const targetLabel =
      editableFields.find((field) => field.value === aiTargetField)?.label || aiTargetField;

    if (!aiPrompt.trim()) {
      toast.error("Nhập prompt trước khi chạy AI.");
      return;
    }

    setIsAiLoading(true);
    try {
      const currentText = String(form[aiTargetField] || "");
      const response = await fetch("/api/admin/ai/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale: aiTargetField.endsWith("En") ? "en" : "vi",
          targetField: aiTargetField,
          prompt: aiPrompt,
          currentText,
        }),
      });

      const payload = (await response.json()) as { text?: string; error?: string };

      if (!response.ok || !payload.text) {
        toast.error(payload.error || "Không thể tạo nội dung AI.");
        return;
      }

      setForm((previous) => ({
        ...previous,
        [aiTargetField]: payload.text || "",
      }));
      toast.success(`Đã cập nhật gợi ý AI cho: ${targetLabel}`);
    } catch {
      toast.error("Không thể kết nối AI.");
    } finally {
      setIsAiLoading(false);
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
      <div className="space-y-5">
        <form action={formAction} className="space-y-5">
          {state.error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {state.error}
            </div>
          ) : null}
          {state.success ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              {state.message || "Saved."}
            </div>
          ) : null}
          {fieldErrorMessages.length ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <ul className="list-disc pl-5">
                {fieldErrorMessages.map((message, index) => (
                  <li key={`${message}-${index}`}>{message}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Visual content editor</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="companyName">Company name</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={form.companyName}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, companyName: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="companyDescription">Description (VI)</Label>
                <Textarea
                  id="companyDescription"
                  name="companyDescription"
                  rows={3}
                  value={form.companyDescription}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, companyDescription: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="companyDescriptionEn">Description (EN)</Label>
                <Textarea
                  id="companyDescriptionEn"
                  name="companyDescriptionEn"
                  rows={3}
                  value={form.companyDescriptionEn}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, companyDescriptionEn: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, phoneNumber: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, email: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zaloLink">Zalo URL</Label>
                <Input
                  id="zaloLink"
                  name="zaloLink"
                  value={form.zaloLink}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, zaloLink: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  name="logoUrl"
                  value={form.logoUrl}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, logoUrl: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPrimaryLabel">Primary CTA</Label>
                <Input
                  id="contactPrimaryLabel"
                  name="contactPrimaryLabel"
                  value={form.contactPrimaryLabel}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, contactPrimaryLabel: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactSecondaryLabel">Secondary CTA</Label>
                <Input
                  id="contactSecondaryLabel"
                  name="contactSecondaryLabel"
                  value={form.contactSecondaryLabel}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, contactSecondaryLabel: event.target.value }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lead popup editor</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <label className="inline-flex items-center gap-2 text-sm font-medium text-stone-800 md:col-span-2">
                <input
                  type="checkbox"
                  name="leadPopupEnabled"
                  checked={form.leadPopupEnabled}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, leadPopupEnabled: event.target.checked }))
                  }
                  className="size-4 rounded border-stone-300"
                />
                Enable lead popup
              </label>
              <div className="space-y-2">
                <Label htmlFor="leadPopupDelaySeconds">Popup delay (s)</Label>
                <Input
                  id="leadPopupDelaySeconds"
                  name="leadPopupDelaySeconds"
                  type="number"
                  min={5}
                  max={300}
                  value={form.leadPopupDelaySeconds}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      leadPopupDelaySeconds: Number(event.target.value) || 25,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leadPopupTitle">Popup title (VI)</Label>
                <Input
                  id="leadPopupTitle"
                  name="leadPopupTitle"
                  value={form.leadPopupTitle}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, leadPopupTitle: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leadPopupTitleEn">Popup title (EN)</Label>
                <Input
                  id="leadPopupTitleEn"
                  name="leadPopupTitleEn"
                  value={form.leadPopupTitleEn}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, leadPopupTitleEn: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="leadPopupDescription">Popup description (VI)</Label>
                <Textarea
                  id="leadPopupDescription"
                  name="leadPopupDescription"
                  rows={3}
                  value={form.leadPopupDescription}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      leadPopupDescription: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="leadPopupDescriptionEn">Popup description (EN)</Label>
                <Textarea
                  id="leadPopupDescriptionEn"
                  name="leadPopupDescriptionEn"
                  rows={3}
                  value={form.leadPopupDescriptionEn}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      leadPopupDescriptionEn: event.target.value,
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          <SubmitButton />
        </form>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WandSparkles className="size-4" />
              AI copy assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="aiTargetField">Target field</Label>
              <select
                id="aiTargetField"
                value={aiTargetField}
                onChange={(event) =>
                  setAiTargetField(event.target.value as (typeof editableFields)[number]["value"])
                }
                className="h-10 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm ring-focus"
              >
                {editableFields.map((field) => (
                  <option key={field.value} value={field.value}>
                    {field.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="aiPrompt">Prompt</Label>
              <Textarea
                id="aiPrompt"
                rows={3}
                value={aiPrompt}
                onChange={(event) => setAiPrompt(event.target.value)}
                placeholder="Ví dụ: Viết lại đoạn này theo hướng chuyên nghiệp, ngắn gọn, tập trung vào độ bền và nguồn gỗ tự nhiên."
              />
            </div>
            <Button type="button" variant="secondary" disabled={isAiLoading} onClick={handleAiGenerate}>
              {isAiLoading ? "Generating..." : "Generate with AI"}
            </Button>
            <p className="text-xs text-stone-500">
              Yêu cầu cấu hình env: <code>OPENAI_API_KEY</code> (tuỳ chọn <code>OPENAI_MODEL</code>).
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-5 xl:sticky xl:top-20 xl:self-start">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Live preview</CardTitle>
            <div className="inline-flex rounded-full border border-stone-300 bg-white p-1 text-xs">
              <button
                type="button"
                className={`rounded-full px-2.5 py-1 ${previewLocale === "vi" ? "bg-stone-900 text-white" : "text-stone-700"}`}
                onClick={() => setPreviewLocale("vi")}
              >
                VI
              </button>
              <button
                type="button"
                className={`rounded-full px-2.5 py-1 ${previewLocale === "en" ? "bg-stone-900 text-white" : "text-stone-700"}`}
                onClick={() => setPreviewLocale("en")}
              >
                EN
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-stone-200 bg-[#fffaf4] p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-stone-900">{form.companyName}</p>
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline">{form.contactPrimaryLabel || "Nhắn Zalo"}</Badge>
                  <Badge variant="outline">{form.contactSecondaryLabel || "Gọi ngay"}</Badge>
                </div>
              </div>
              <h3 className="text-2xl text-stone-900">
                {previewLocale === "vi"
                  ? `Không gian gỗ thủ công từ ${form.companyName}`
                  : `Handcrafted wood showcase by ${form.companyName}`}
              </h3>
              <p className="mt-2 text-sm text-stone-700">{previewDescription}</p>
              <p className="mt-3 text-xs text-stone-500">
                {form.phoneNumber || "No phone"} • {form.email || "No email"}
              </p>
            </div>

            {form.leadPopupEnabled ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-stone-500">Lead popup preview</p>
                <h4 className="mt-2 text-lg text-stone-900">{previewPopupTitle}</h4>
                <p className="mt-1 text-sm text-stone-600">{previewPopupDescription}</p>
                <p className="mt-2 text-xs text-stone-500">Delay: {form.leadPopupDelaySeconds}s</p>
              </div>
            ) : null}

            <Button asChild variant="outline" className="w-full">
              <Link href={previewLocale === "vi" ? "/" : "/en"} target="_blank">
                Open full website preview
                <ExternalLink className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Homepage sections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-stone-600">
              {visibleSectionCount}/{sections.length} sections are visible.
            </p>
            {sections.map((section) => (
              <div
                key={section.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-stone-200 bg-white p-2.5"
              >
                <div>
                  <p className="text-sm font-medium text-stone-800">{section.title}</p>
                  <p className="text-xs text-stone-500">
                    {section.type} • sort {section.sortOrder}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant={section.visible ? "success" : "outline"}>
                    {section.visible ? "Visible" : "Hidden"}
                  </Badge>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/homepage?edit=${section.id}`}>Edit</Link>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

