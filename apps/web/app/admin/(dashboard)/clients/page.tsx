"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { adminFetch } from "@/lib/adminApi";
import MediaPickerModal, { type MediaItem } from "@/components/admin/MediaPickerModal";

export interface ClientPartnerItem {
  id?: number;
  slug: string;
  nameFa: string;
  nameEn: string;
  titleFa: string;
  titleEn: string;
  industryFa: string;
  industryEn: string;
  introFa: string;
  introEn: string;
  quoteFa: string;
  quoteEn: string;
  servicesFa: string[];
  servicesEn: string[];
  yearFa: string;
  yearEn: string;
  portraitImage: string | null;
  portraitBadgeFa: string;
  portraitBadgeEn: string;
  monogram: string;
  websites: Array<{ url: string; label?: string }>;
  instagrams: Array<{ handle: string; profileUrl: string; name?: string }>;
  position: number;
  isFeatured: boolean;
  isPublished: boolean;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}

const EMPTY_PARTNER: ClientPartnerItem = {
  slug: "",
  nameFa: "",
  nameEn: "",
  titleFa: "",
  titleEn: "",
  industryFa: "",
  industryEn: "",
  introFa: "",
  introEn: "",
  quoteFa: "",
  quoteEn: "",
  servicesFa: [],
  servicesEn: [],
  yearFa: "۱۴۰۲ - تاکنون",
  yearEn: "2023 - Present",
  portraitImage: null,
  portraitBadgeFa: "کارفرمای منتخب آن‌ساپ",
  portraitBadgeEn: "OnSupp Verified Partner",
  monogram: "",
  websites: [{ url: "", label: "" }],
  instagrams: [{ handle: "", profileUrl: "" }],
  position: 0,
  isFeatured: true,
  isPublished: true,
  status: "PUBLISHED",
};

export default function ClientPartnersAdminPage() {
  const [items, setItems] = useState<ClientPartnerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ClientPartnerItem>(EMPTY_PARTNER);
  const [saving, setSaving] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [serviceTagsInput, setServiceTagsInput] = useState("");
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const notify = useCallback((type: "ok" | "err", text: string) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage((cur) => (cur?.text === text ? null : cur));
    }, 4500);
  }, []);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/v1/clients/all", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setItems(data.sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0)));
      } else {
        notify("err", "خطا در دریافت لیست کارفرمایان");
      }
    } catch {
      notify("err", "خطای شبکه هنگام ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleEdit = (partner: ClientPartnerItem) => {
    setEditingId(partner.id ?? null);
    setForm({
      ...partner,
      quoteFa: partner.quoteFa || "",
      quoteEn: partner.quoteEn || "",
      websites: partner.websites?.length ? partner.websites : [{ url: "", label: "" }],
      instagrams: partner.instagrams?.length ? partner.instagrams : [{ handle: "", profileUrl: "" }],
    });
    setServiceTagsInput((partner.servicesFa || []).join(", "));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(EMPTY_PARTNER);
    setServiceTagsInput("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nameFa.trim()) {
      notify("err", "نام کارفرما به فارسی الزامی است");
      return;
    }

    setSaving(true);
    const servicesFa = serviceTagsInput
      .split(/[,،]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      ...form,
      servicesFa,
      websites: form.websites.filter((w) => w.url.trim()),
      instagrams: form.instagrams.filter((i) => i.handle.trim() || i.profileUrl.trim()),
    };

    try {
      const endpoint = editingId ? `/api/v1/clients/${editingId}` : "/api/v1/clients";
      const method = editingId ? "PUT" : "POST";
      const res = await adminFetch(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        notify("ok", `کارفرما "${form.nameFa}" با موفقیت ذخیره شد`);
        handleCancel();
        loadItems();
      } else {
        const err = await res.json();
        notify("err", err.error || "خطا در ذخیره کارفرما");
      }
    } catch {
      notify("err", "خطای شبکه هنگام ذخیره اطلاعات");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id || !confirm("آیا از حذف این کارفرما اطمینان دارید؟")) return;
    try {
      const res = await adminFetch(`/api/v1/clients/${id}`, { method: "DELETE" });
      if (res.ok) {
        notify("ok", "کارفرما حذف شد");
        loadItems();
      } else {
        notify("err", "خطا در حذف کارفرما");
      }
    } catch {
      notify("err", "خطای ارتباط با سرور");
    }
  };

  const addWebsiteRow = () => {
    setForm((prev) => ({
      ...prev,
      websites: [...prev.websites, { url: "", label: "" }],
    }));
  };

  const removeWebsiteRow = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      websites: prev.websites.filter((_, i) => i !== idx),
    }));
  };

  const updateWebsite = (idx: number, field: "url" | "label", val: string) => {
    setForm((prev) => {
      const arr = [...prev.websites];
      arr[idx] = { ...arr[idx], [field]: val };
      return { ...prev, websites: arr };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16" dir="rtl">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            مدیریت کارفرمایان و شرکای استراتژیک (Clients & Partners)
          </h1>
          <p className="text-sm text-muted mt-1">
            پروفایل کارفرمایان ویژه بخش دوم صفحه اصلی، آدرس وب‌سایت‌ها، پیج‌های اینستاگرام و نشان مونوگرام.
          </p>
        </div>
      </div>

      {/* ── Notification Banner ── */}
      {message && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center justify-between transition-all ${
            message.type === "ok"
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
              : "bg-rose-500/15 border-rose-500/40 text-rose-700 dark:text-rose-300"
          }`}
        >
          <span>{message.text}</span>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            بستن
          </button>
        </div>
      )}

      {/* ── Form Card ── */}
      <div className="bg-panel border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-lg font-bold text-foreground">
            {editingId ? "ویرایش کارفرما" : "افزودن کارفرمای جدید"}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              className="text-xs text-muted hover:text-foreground"
            >
              انصراف و لغو ویرایش
            </button>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">نام کارفرما / برند (فارسی) *</label>
              <input
                type="text"
                required
                value={form.nameFa}
                onChange={(e) => setForm({ ...form, nameFa: e.target.value })}
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                placeholder="نجما توکلیان"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">نام کارفرما (انگلیسی)</label>
              <input
                type="text"
                dir="ltr"
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                placeholder="Najma Tavakolian"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">نامک پیوند (Slug)</label>
              <input
                type="text"
                dir="ltr"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none font-mono"
                placeholder="najma-tavakolian"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-foreground">عنوان و حوزه فعالیت (فارسی)</label>
              <input
                type="text"
                value={form.titleFa}
                onChange={(e) => setForm({ ...form, titleFa: e.target.value })}
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                placeholder="موسسه بین‌المللی مهاجرتی و حقوقی نجما توکلیان"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">صنعت و طبقه‌بندی (فارسی)</label>
              <input
                type="text"
                value={form.industryFa}
                onChange={(e) => setForm({ ...form, industryFa: e.target.value })}
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                placeholder="حقوقی و مهاجرت بین‌المللی"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-foreground">توضیح کوتاه معرفی (Intro Fa)</label>
              <textarea
                rows={2}
                value={form.introFa}
                onChange={(e) => setForm({ ...form, introFa: e.target.value })}
                className="w-full bg-raised border border-border rounded-xl p-4 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">نشان مونوگرام (Monogram)</label>
              <input
                type="text"
                dir="ltr"
                value={form.monogram}
                onChange={(e) => setForm({ ...form, monogram: e.target.value })}
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none font-mono"
                placeholder="NT"
              />
            </div>

            <div className="md:col-span-3 space-y-2">
              <label className="text-xs font-bold text-foreground">نقل قول یا بیانیه رضایت (Quote Fa)</label>
              <textarea
                rows={2}
                value={form.quoteFa}
                onChange={(e) => setForm({ ...form, quoteFa: e.target.value })}
                className="w-full bg-raised border border-border rounded-xl p-4 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div className="md:col-span-3 space-y-2">
              <label className="text-xs font-bold text-foreground">خدمات ارائه‌شده (با کاما جدا کنید)</label>
              <input
                type="text"
                value={serviceTagsInput}
                onChange={(e) => setServiceTagsInput(e.target.value)}
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                placeholder="طراحی وب‌سایت، سئو تکنیکال، تولید محتوای استودیویی"
              />
            </div>
          </div>

          {/* Websites List */}
          <div className="space-y-3 bg-raised p-4 rounded-xl border border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">آدرس وب‌سایت‌های کارفرما</span>
              <button
                type="button"
                onClick={addWebsiteRow}
                className="text-xs text-mint hover:underline font-bold"
              >
                + افزودن وب‌سایت
              </button>
            </div>
            {form.websites.map((w, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input
                  type="url"
                  dir="ltr"
                  value={w.url}
                  onChange={(e) => updateWebsite(idx, "url", e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 bg-panel border border-border rounded-xl px-3 py-2 text-xs text-foreground"
                />
                <input
                  type="text"
                  value={w.label || ""}
                  onChange={(e) => updateWebsite(idx, "label", e.target.value)}
                  placeholder="عنوان / دامنه"
                  className="w-40 bg-panel border border-border rounded-xl px-3 py-2 text-xs text-foreground"
                />
                {form.websites.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeWebsiteRow(idx)}
                    className="text-burgundy hover:opacity-80 text-xs px-2 py-1"
                  >
                    حذف
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Image & Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="space-y-2">
              <span className="text-xs font-bold text-foreground block">تصویر پرتره کارفرما</span>
              <div
                onClick={() => setMediaPickerOpen(true)}
                className="relative h-24 border-2 border-dashed border-border hover:border-primary/50 rounded-xl flex items-center justify-center cursor-pointer bg-raised"
              >
                {form.portraitImage ? (
                  <Image src={form.portraitImage} alt="Portrait" fill className="object-contain p-2" />
                ) : (
                  <span className="text-xs text-muted">کلیک برای انتخاب تصویر</span>
                )}
              </div>
              {form.portraitImage && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, portraitImage: null })}
                  className="text-[11px] text-burgundy hover:underline"
                >
                  حذف تصویر
                </button>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">وضعیت انتشار</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value as any,
                    isPublished: e.target.value === "PUBLISHED",
                  })
                }
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                <option value="PUBLISHED">منتشرشده (عمومی)</option>
                <option value="DRAFT">پیش‌نویس (پنهان)</option>
                <option value="ARCHIVED">بایگانی</option>
              </select>
            </div>

            <div className="flex items-center gap-4 pt-6">
              <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-0"
                />
                <span>کارفرمای منتخب (Featured)</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-2.5 rounded-xl border border-border text-foreground text-sm hover:bg-raised"
              >
                لغو
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-lime text-ink font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {saving ? "در حال ذخیره..." : editingId ? "ثبت ویرایش" : "ایجاد کارفرمای جدید"}
            </button>
          </div>
        </form>
      </div>

      {/* ── Partners List ── */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground">فهرست کارفرمایان ثبت‌شده ({items.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((partner) => (
            <div
              key={partner.id}
              className="bg-panel border border-border rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-xs"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-raised text-mint font-bold border border-border">
                    {partner.monogram || "OP"}
                  </span>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                      partner.isPublished
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                        : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {partner.isPublished ? "منتشرشده" : "پیش‌نویس"}
                  </span>
                </div>

                <h4 className="font-bold text-base text-foreground">{partner.nameFa}</h4>
                <p className="text-xs text-muted font-light leading-relaxed line-clamp-2">
                  {partner.titleFa || partner.introFa}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border text-xs">
                <button
                  type="button"
                  onClick={() => handleEdit(partner)}
                  className="text-mint hover:underline font-bold"
                >
                  ویرایش
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(partner.id)}
                  className="text-burgundy hover:underline"
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <MediaPickerModal
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(media) => {
          const url = media.url.startsWith("http") || media.url.startsWith("/") ? media.url : `/${media.url}`;
          setForm((prev) => ({ ...prev, portraitImage: url }));
          setMediaPickerOpen(false);
        }}
      />
    </div>
  );
}
