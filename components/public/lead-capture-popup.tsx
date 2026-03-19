"use client";

import { startTransition, useEffect, useState } from "react";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { type Locale, t } from "@/lib/i18n";

type LeadCapturePopupProps = {
  enabled: boolean;
  delaySeconds: number;
  title?: string | null;
  description?: string | null;
  locale: Locale;
};

const DISMISS_KEY = "lead-popup-dismissed-at";
const DISMISS_DURATION_MS = 1000 * 60 * 60 * 12;

export function LeadCapturePopup({
  enabled,
  delaySeconds,
  title,
  description,
  locale,
}: LeadCapturePopupProps) {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  useEffect(() => {
    if (!enabled) return;
    const dismissedAtRaw = localStorage.getItem(DISMISS_KEY);
    const dismissedAt = dismissedAtRaw ? Number(dismissedAtRaw) : 0;

    if (dismissedAt && Date.now() - dismissedAt < DISMISS_DURATION_MS) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setOpen(true);
    }, Math.max(5, delaySeconds) * 1000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [delaySeconds, enabled]);

  const onClose = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setOpen(false);
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.phone.trim() && !formData.email.trim()) {
      toast.error(
        t(
          locale,
          "Vui lòng nhập số điện thoại hoặc email.",
          "Please provide phone number or email.",
        ),
      );
      return;
    }

    setSubmitting(true);
    startTransition(() => {
      void fetch("/api/public/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          sourcePath: pathname,
          locale,
        }),
      })
        .then(() => {
          toast.success(
            t(
              locale,
              "Đã nhận thông tin, đội ngũ sẽ liên hệ sớm.",
              "Thanks, our team will contact you shortly.",
            ),
          );
          onClose();
        })
        .catch(() => {
          toast.error(
            t(locale, "Không gửi được thông tin, vui lòng thử lại.", "Could not submit right now."),
          );
        })
        .finally(() => {
          setSubmitting(false);
        });
    });
  };

  if (!enabled || !open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/35 p-3 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-4 shadow-2xl">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl text-stone-900">
              {title || t(locale, "Cần hỗ trợ nhanh?", "Need quick support?")}
            </h3>
            <p className="mt-1 text-sm text-stone-600">
              {description ||
                t(
                  locale,
                  "Để lại số điện thoại hoặc email để nhận tư vấn sản phẩm phù hợp.",
                  "Leave your phone or email for quick product consultation.",
                )}
            </p>
          </div>
          <button
            type="button"
            className="rounded-full p-1 text-stone-500 hover:bg-stone-100 hover:text-stone-800"
            onClick={onClose}
            aria-label={t(locale, "Đóng", "Close")}
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-2.5">
          <Input
            value={formData.name}
            onChange={(event) => setFormData((previous) => ({ ...previous, name: event.target.value }))}
            placeholder={t(locale, "Tên của bạn (không bắt buộc)", "Your name (optional)")}
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              value={formData.phone}
              onChange={(event) =>
                setFormData((previous) => ({ ...previous, phone: event.target.value }))
              }
              placeholder={t(locale, "Số điện thoại", "Phone number")}
            />
            <Input
              value={formData.email}
              onChange={(event) =>
                setFormData((previous) => ({ ...previous, email: event.target.value }))
              }
              type="email"
              placeholder="Email"
            />
          </div>
          <Textarea
            value={formData.message}
            onChange={(event) => setFormData((previous) => ({ ...previous, message: event.target.value }))}
            rows={3}
            placeholder={t(
              locale,
              "Nhu cầu của bạn (ví dụ: bàn ăn gỗ 2m)...",
              "Your request (e.g. 2m dining table)...",
            )}
          />

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose}>
              {t(locale, "Để sau", "Later")}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? t(locale, "Đang gửi...", "Submitting...") : t(locale, "Gửi liên hệ", "Submit")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
