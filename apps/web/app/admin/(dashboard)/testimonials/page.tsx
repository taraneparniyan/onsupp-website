"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import MediaPickerModal, { type MediaItem } from "@/components/admin/MediaPickerModal";
import { adminFetch } from "@/lib/adminApi";

export interface TestimonialItem {
  id?: number;
  quoteFa: string;
  quoteEn: string;
  authorFa: string;
  authorEn: string;
  roleFa: string;
  roleEn: string;
  companyFa: string | null;
  companyEn: string | null;
  serviceTagFa: string | null;
  serviceTagEn: string | null;
  highlightFa: string | null;
  highlightEn: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  position: number;
}

const EMPTY_TESTIMONIAL = (position: number): TestimonialItem => ({
  quoteFa: "",
  quoteEn: "",
  authorFa: "",
  authorEn: "",
  roleFa: "",
  roleEn: "",
  companyFa: "",
  companyEn: "",
  serviceTagFa: "",
  serviceTagEn: "",
  highlightFa: "",
  highlightEn: "",
  avatarUrl: null,
  isActive: true,
  position,
});

export default function TestimonialsAdminPage() {
  const [items, setItems] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | string | null>(null);
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [filterActiveOnly, setFilterActiveOnly] = useState(false);

  const notify = useCallback((type: "ok" | "err", text: string) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage((cur) => (cur?.text === text ? null : cur));
    }, 4500);
  }, []);

  const loadTestimonials = useCallback(() => {
    setLoading(true);
    adminFetch("/api/v1/testimonials?all=true", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("خطای ارتباط با سرور"))))
      .then((data) => {
        if (Array.isArray(data)) {
          setItems(
            data.map((item, idx) => ({
              ...item,
              isActive: item.isActive !== false,
              position: item.position ?? idx,
            }))
          );
        }
      })
      .catch((err) => {
        notify("err", err.message || "خطا در دریافت لیست نظرات مشتریان");
      })
      .finally(() => setLoading(false));
  }, [notify]);

  useEffect(() => {
    loadTestimonials();
  }, [loadTestimonials]);

  const updateItem = (index: number, field: keyof TestimonialItem, value: any) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSelectAvatar = (media: MediaItem) => {
    if (pickerIndex === null) return;
    updateItem(pickerIndex, "avatarUrl", media.url);
    setPickerIndex(null);
  };

  const handleToggleActive = async (index: number) => {
    const item = items[index];
    if (!item.id) {
      // Local new item not yet saved
      updateItem(index, "isActive", !item.isActive);
      return;
    }

    try {
      const res = await adminFetch(`/api/v1/testimonials/${item.id}/toggle-active`, {
        method: "PATCH",
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "تغییر وضعیت نمایش ناموفق بود");
      }
      const updated = await res.json();
      updateItem(index, "isActive", updated.isActive);
      notify("ok", `وضعیت نمایش به «${updated.isActive ? "فعال" : "غیرفعال"}» تغییر یافت.`);
    } catch (err: any) {
      notify("err", err.message || "خطا در تغییر وضعیت");
    }
  };

  const handleSave = async (index: number) => {
    const item = items[index];
    if (!item.quoteFa.trim()) {
      notify("err", "متن نظر فارسی الزامی است.");
      return;
    }
    if (!item.authorFa.trim()) {
      notify("err", "نام نویسنده یا مدیر شرکت به فارسی الزامی است.");
      return;
    }

    const isNew = !item.id;
    const saveKey = isNew ? `new-${index}` : item.id!;
    setSavingId(saveKey);

    try {
      const method = isNew ? "POST" : "PUT";
      const endpoint = isNew ? "/api/v1/testimonials" : `/api/v1/testimonials/${item.id}`;

      const payload = {
        quoteFa: item.quoteFa.trim(),
        quoteEn: item.quoteEn.trim(),
        authorFa: item.authorFa.trim(),
        authorEn: item.authorEn.trim(),
        roleFa: item.roleFa.trim(),
        roleEn: item.roleEn.trim(),
        companyFa: item.companyFa?.trim() || null,
        companyEn: item.companyEn?.trim() || null,
        serviceTagFa: item.serviceTagFa?.trim() || null,
        serviceTagEn: item.serviceTagEn?.trim() || null,
        highlightFa: item.highlightFa?.trim() || null,
        highlightEn: item.highlightEn?.trim() || null,
        avatarUrl: item.avatarUrl?.trim() || null,
        isActive: item.isActive,
        position: Number(item.position) || 0,
      };

      const res = await adminFetch(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "خطا در ذخیره‌سازی اطلاعات");
      }

      const savedItem = await res.json();
      setItems((prev) =>
        prev.map((it, i) => (i === index ? { ...it, id: savedItem.id } : it))
      );
      notify("ok", isNew ? "نظر مشتری جدید با موفقیت اضافه شد." : "تغییرات نظر با موفقیت ذخیره شد.");
    } catch (err: any) {
      notify("err", err.message || "خطا در ذخیره‌سازی نظر");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (index: number) => {
    const item = items[index];
    if (!window.confirm("آیا از حذف این نظر مطمئن هستید؟")) return;

    if (!item.id) {
      setItems((prev) => prev.filter((_, i) => i !== index));
      notify("ok", "ردیف حذف شد.");
      return;
    }

    try {
      const res = await adminFetch(`/api/v1/testimonials/${item.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "خطا در حذف نظر");
      }
      setItems((prev) => prev.filter((_, i) => i !== index));
      notify("ok", "نظر مشتری با موفقیت حذف گردید.");
    } catch (err: any) {
      notify("err", err.message || "حذف نظر ناموفق بود");
    }
  };

  const addNewItem = () => {
    setItems((prev) => [...prev, EMPTY_TESTIMONIAL(prev.length)]);
  };

  const filteredItems = filterActiveOnly
    ? items.filter((item) => item.isActive)
    : items;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <span className="p-2 rounded-xl bg-primary/15 text-mint border border-primary/25">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </span>
            مدیریت رضایت و نظرات مشتریان (Testimonials)
          </h1>
          <p className="mt-1 text-sm text-muted">
            مدیریت دیدگاه‌ها، توصیه‌نامه‌ها و تجربیات کارفرمایان و شرکای تجاری آن‌ساپ در صفحه اصلی
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setFilterActiveOnly((v) => !v)}
            className={`px-3 py-2 text-xs rounded-xl border transition-colors flex items-center gap-2 ${
              filterActiveOnly
                ? "bg-primary/15 border-primary text-mint font-bold"
                : "bg-raised border-border text-foreground hover:bg-subtle"
            }`}
          >
            <span>{filterActiveOnly ? "نمایش همه" : "فقط فعال‌ها"}</span>
          </button>

          <button
            type="button"
            onClick={addNewItem}
            className="flex items-center gap-2 rounded-xl bg-lime px-4 py-2.5 text-sm font-bold text-ink hover:opacity-90 transition shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            افزودن نظر جدید
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {message && (
        <div
          className={`flex items-center justify-between rounded-xl p-4 border text-sm transition-all ${
            message.type === "ok"
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
              : "bg-rose-500/15 border-rose-500/40 text-rose-700 dark:text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{message.type === "ok" ? "✓" : "⚠"}</span>
            <span>{message.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-44 rounded-2xl border border-border bg-panel animate-pulse"
            />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-border bg-panel p-12 text-center shadow-xs">
          <p className="text-muted">هیچ نظری برای نمایش یافت نشد.</p>
          <button
            type="button"
            onClick={addNewItem}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-lime px-4 py-2 text-xs font-bold text-ink hover:opacity-90"
          >
            افزودن اولین نظر
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {items.map((item, index) => {
            if (filterActiveOnly && !item.isActive) return null;

            const isSaving = savingId === (item.id ?? `new-${index}`);

            return (
              <div
                key={item.id ?? `new-${index}`}
                className={`relative rounded-2xl border p-5 sm:p-6 transition-all bg-panel shadow-xs ${
                  item.isActive
                    ? "border-border hover:border-primary/40"
                    : "border-rose-500/40 bg-panel/70 opacity-80"
                }`}
              >
                {/* Top Bar inside card */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-raised border border-border text-xs font-mono font-bold text-mint">
                      {(item.position ?? index) + 1}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {item.authorFa ? item.authorFa : "نظر بدون عنوان"}
                    </span>
                    {item.companyFa && (
                      <span className="text-xs text-muted">({item.companyFa})</span>
                    )}
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                        item.isActive
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                          : "bg-raised text-muted border-border"
                      }`}
                    >
                      {item.isActive ? "فعال و در حال نمایش" : "غیرفعال (مخفی)"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(index)}
                      className={`px-3 py-1.5 text-xs rounded-xl border transition ${
                        item.isActive
                          ? "bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25"
                          : "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25"
                      }`}
                    >
                      {item.isActive ? "غیرفعال‌سازی" : "فعال‌سازی"}
                    </button>

                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => handleSave(index)}
                      className="flex items-center gap-1.5 rounded-xl bg-lime px-4 py-1.5 text-xs font-bold text-ink hover:opacity-90 transition disabled:opacity-50"
                    >
                      {isSaving ? "در حال ذخیره..." : "ذخیره تغییرات"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(index)}
                      className="rounded-xl border border-rose-500/30 bg-rose-500/15 px-3 py-1.5 text-xs text-rose-700 dark:text-rose-300 hover:bg-rose-500/25 transition"
                    >
                      حذف
                    </button>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Author FA */}
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      نام نویسنده / مدیر (فارسی) <span className="text-burgundy">*</span>
                    </label>
                    <input
                      type="text"
                      value={item.authorFa}
                      onChange={(e) => updateItem(index, "authorFa", e.target.value)}
                      placeholder="مثال: مهندس علیرضا رضایی"
                      className="w-full rounded-xl border border-border bg-raised px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Author EN */}
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      نام نویسنده (انگلیسی)
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={item.authorEn}
                      onChange={(e) => updateItem(index, "authorEn", e.target.value)}
                      placeholder="e.g. Alireza Rezaei"
                      className="w-full rounded-xl border border-border bg-raised px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Role FA */}
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      سمت سازمانی (فارسی)
                    </label>
                    <input
                      type="text"
                      value={item.roleFa}
                      onChange={(e) => updateItem(index, "roleFa", e.target.value)}
                      placeholder="مثال: مدیر ارشد محصول"
                      className="w-full rounded-xl border border-border bg-raised px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Role EN */}
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      سمت سازمانی (انگلیسی)
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={item.roleEn}
                      onChange={(e) => updateItem(index, "roleEn", e.target.value)}
                      placeholder="e.g. VP of Product"
                      className="w-full rounded-xl border border-border bg-raised px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Company FA */}
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      نام شرکت یا برند (فارسی)
                    </label>
                    <input
                      type="text"
                      value={item.companyFa || ""}
                      onChange={(e) => updateItem(index, "companyFa", e.target.value)}
                      placeholder="مثال: پلتفرم خدمات مالی"
                      className="w-full rounded-xl border border-border bg-raised px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Company EN */}
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      نام شرکت یا برند (انگلیسی)
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={item.companyEn || ""}
                      onChange={(e) => updateItem(index, "companyEn", e.target.value)}
                      placeholder="e.g. Fintech Platform"
                      className="w-full rounded-xl border border-border bg-raised px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Service Tag FA */}
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      برچسب نوع خدمت (فارسی)
                    </label>
                    <input
                      type="text"
                      value={item.serviceTagFa || ""}
                      onChange={(e) => updateItem(index, "serviceTagFa", e.target.value)}
                      placeholder="مثال: سئو و مهندسی وب"
                      className="w-full rounded-xl border border-border bg-raised px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Highlight FA */}
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      نکته برجسته / دستاورد کلیدی (فارسی)
                    </label>
                    <input
                      type="text"
                      value={item.highlightFa || ""}
                      onChange={(e) => updateItem(index, "highlightFa", e.target.value)}
                      placeholder="مثال: رشد مستمر ترافیک ارگانیک"
                      className="w-full rounded-xl border border-border bg-raised px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Quote FA */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-foreground mb-1">
                      متن کامل دیدگاه و رضایت (فارسی) <span className="text-burgundy">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={item.quoteFa}
                      onChange={(e) => updateItem(index, "quoteFa", e.target.value)}
                      placeholder="متن نظر کارفرما درباره کیفیت، سرعت و نتایج همکاری با آن‌ساپ..."
                      className="w-full rounded-xl border border-border bg-raised px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none leading-relaxed"
                    />
                  </div>

                  {/* Quote EN */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-foreground mb-1">
                      متن کامل دیدگاه (انگلیسی)
                    </label>
                    <textarea
                      rows={2}
                      dir="ltr"
                      value={item.quoteEn}
                      onChange={(e) => updateItem(index, "quoteEn", e.target.value)}
                      placeholder="Client testimonial in English..."
                      className="w-full rounded-xl border border-border bg-raised px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none leading-relaxed"
                    />
                  </div>

                  {/* Avatar & Position */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-foreground mb-1">
                        تصویر آواتار نویسنده
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          dir="ltr"
                          value={item.avatarUrl || ""}
                          onChange={(e) => updateItem(index, "avatarUrl", e.target.value)}
                          placeholder="/images/testimonials/avatar.jpg"
                          className="flex-1 rounded-xl border border-border bg-raised px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setPickerIndex(index)}
                          className="rounded-xl border border-border bg-raised px-3 py-2 text-xs text-foreground hover:bg-subtle transition"
                        >
                          انتخاب رسانه
                        </button>
                      </div>
                    </div>

                    {item.avatarUrl && (
                      <div className="relative h-12 w-12 rounded-full overflow-hidden border border-primary/40 mt-5">
                        <Image
                          src={item.avatarUrl}
                          alt={item.authorFa || "avatar"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Position ordering */}
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      ترتیب نمایش (Position)
                    </label>
                    <input
                      type="number"
                      value={item.position}
                      onChange={(e) => updateItem(index, "position", parseInt(e.target.value, 10) || 0)}
                      className="w-32 rounded-xl border border-border bg-raised px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Media Picker Modal */}
      {pickerIndex !== null && (
        <MediaPickerModal
          open={true}
          onClose={() => setPickerIndex(null)}
          onSelect={handleSelectAvatar}
        />
      )}
    </div>
  );
}
