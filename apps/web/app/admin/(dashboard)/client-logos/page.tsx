"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { adminFetch } from "@/lib/adminApi";
import MediaPickerModal, { type MediaItem } from "@/components/admin/MediaPickerModal";

export interface ClientLogoItem {
  id?: number;
  key: string;
  nameFa: string;
  nameEn: string;
  logoUrl: string;
  darkLogoUrl?: string | null;
  altFa: string;
  altEn: string;
  width: number;
  height: number;
  linkUrl?: string | null;
  position: number;
  isPublished: boolean;
  status: "DRAFT" | "PUBLISHED";
}

const EMPTY_LOGO: ClientLogoItem = {
  key: "",
  nameFa: "",
  nameEn: "",
  logoUrl: "",
  darkLogoUrl: null,
  altFa: "",
  altEn: "",
  width: 300,
  height: 120,
  linkUrl: "#",
  position: 0,
  isPublished: true,
  status: "PUBLISHED",
};

export default function ClientLogosAdminPage() {
  const [items, setItems] = useState<ClientLogoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ClientLogoItem>(EMPTY_LOGO);
  const [saving, setSaving] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<"logo" | "darkLogo" | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const notify = useCallback((type: "ok" | "err", text: string) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage((cur) => (cur?.text === text ? null : cur));
    }, 4500);
  }, []);

  const loadLogos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/v1/client-logos/all", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setItems(data.sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0)));
      } else {
        notify("err", "خطا در دریافت لوگوهای مشتریان");
      }
    } catch {
      notify("err", "خطای شبکه هنگام ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadLogos();
  }, [loadLogos]);

  const handleEdit = (logo: ClientLogoItem) => {
    setEditingId(logo.id ?? null);
    setForm({ ...logo });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(EMPTY_LOGO);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nameFa.trim()) {
      notify("err", "نام برند/لوگو الزامی است");
      return;
    }
    if (!form.logoUrl.trim()) {
      notify("err", "تصویر لوگو الزامی است");
      return;
    }

    setSaving(true);
    const key = form.key.trim() || form.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "-") || `logo-${Date.now()}`;
    const payload = {
      ...form,
      key,
      altFa: form.altFa.trim() || `لوگوی ${form.nameFa}`,
      altEn: form.altEn.trim() || `${form.nameEn || form.nameFa} Logo`,
    };

    try {
      const endpoint = editingId ? `/api/v1/client-logos/${editingId}` : "/api/v1/client-logos";
      const method = editingId ? "PUT" : "POST";
      const res = await adminFetch(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        notify("ok", `لوگو "${form.nameFa}" با موفقیت ذخیره شد`);
        handleCancel();
        loadLogos();
      } else {
        const err = await res.json();
        notify("err", err.error || "خطا در ذخیره لوگو");
      }
    } catch {
      notify("err", "خطای ارتباط با سرور");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id || !confirm("آیا از حذف این لوگو اطمینان دارید؟")) return;
    try {
      const res = await adminFetch(`/api/v1/client-logos/${id}`, { method: "DELETE" });
      if (res.ok) {
        notify("ok", "لوگو حذف شد");
        loadLogos();
      } else {
        notify("err", "خطا در حذف لوگو");
      }
    } catch {
      notify("err", "خطای ارتباط با سرور");
    }
  };

  const resolveImgSrc = (url?: string | null) => {
    if (!url) return "";
    const normalized = url.startsWith("/images/logos/")
      ? url.replace("/images/logos/", "/images/client-logos/")
      : url;
    if (normalized.startsWith("http")) return normalized;
    if (normalized.startsWith("/")) {
      return normalized
        .split("/")
        .map((seg, i) => (i === 0 ? "" : encodeURIComponent(decodeURIComponent(seg))))
        .join("/");
    }
    if (normalized.startsWith("uploads/")) return `/${normalized}`;
    return `/images/client-logos/${encodeURIComponent(decodeURIComponent(normalized))}`;
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
            لوگوهای مشتریان (Client Logo Marquee)
          </h1>
          <p className="text-sm text-muted mt-1">
            مدیریت لوگوهای نوار متحرک بی‌نهایت برندهایی که به آن‌ساپ اعتماد کرده‌اند.
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
            {editingId ? "ویرایش لوگو" : "افزودن لوگوی جدید به نوار متحرک"}
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
              <label className="text-xs font-bold text-foreground">نام برند یا کلینیک (فارسی) *</label>
              <input
                type="text"
                required
                value={form.nameFa}
                onChange={(e) => setForm({ ...form, nameFa: e.target.value })}
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                placeholder="کلینیک دکتر سینا پارسی‌پور"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">نام برند (انگلیسی)</label>
              <input
                type="text"
                dir="ltr"
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                placeholder="Dr. Sina Parsi Pour Clinic"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">شناسه اختصاصی (Key)</label>
              <input
                type="text"
                dir="ltr"
                value={form.key}
                onChange={(e) => setForm({ ...form, key: e.target.value })}
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none font-mono"
                placeholder="sina-parsipour"
              />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-foreground block">فایل لوگو (پیش‌فرض) *</span>
              <div
                onClick={() => setMediaTarget("logo")}
                className="relative h-24 border-2 border-dashed border-border hover:border-primary/50 rounded-xl flex items-center justify-center cursor-pointer bg-raised"
              >
                {form.logoUrl ? (
                  <img
                    src={resolveImgSrc(form.logoUrl)}
                    alt="Logo preview"
                    className="h-16 w-auto max-w-[90%] object-contain p-2"
                  />
                ) : (
                  <span className="text-xs text-muted">کلیک برای انتخاب فایل لوگو</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-foreground block">لوگوی تم تاریک (اختیاری)</span>
              <div
                onClick={() => setMediaTarget("darkLogo")}
                className="relative h-24 border-2 border-dashed border-border hover:border-primary/50 rounded-xl flex items-center justify-center cursor-pointer bg-raised"
              >
                {form.darkLogoUrl ? (
                  <img
                    src={resolveImgSrc(form.darkLogoUrl)}
                    alt="Dark logo preview"
                    className="h-16 w-auto max-w-[90%] object-contain p-2"
                  />
                ) : (
                  <span className="text-xs text-muted">انتخاب نسخه سفید/تم تاریک</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">وضعیت نمایش در مارکی</label>
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
                <option value="PUBLISHED">فعال در مارکی</option>
                <option value="DRAFT">غیرفعال (مخفی)</option>
              </select>
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
              {saving ? "در حال ذخیره..." : editingId ? "ثبت ویرایش لوگو" : "افزودن لوگو به مارکی"}
            </button>
          </div>
        </form>
      </div>

      {/* ── Logos Grid ── */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground">لوگوهای فعال در نوار متحرک ({items.length})</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((logo) => (
            <div
              key={logo.id}
              className="bg-panel border border-border rounded-2xl p-4 flex flex-col items-center justify-between gap-3 text-center shadow-xs"
            >
              <div className="h-20 w-full flex items-center justify-center p-2 bg-raised rounded-xl border border-border">
                <img
                  src={resolveImgSrc(logo.logoUrl)}
                  alt={logo.nameFa}
                  className="max-h-14 max-w-full object-contain"
                />
              </div>

              <div className="space-y-1 w-full">
                <h4 className="font-bold text-xs text-foreground truncate" title={logo.nameFa}>
                  {logo.nameFa}
                </h4>
                <span className="font-mono text-[10px] text-muted block truncate">
                  {logo.key}
                </span>
              </div>

              <div className="flex items-center justify-between w-full pt-2 border-t border-border text-xs">
                <button
                  type="button"
                  onClick={() => handleEdit(logo)}
                  className="text-mint hover:underline font-bold"
                >
                  ویرایش
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(logo.id)}
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
        open={mediaTarget !== null}
        onClose={() => setMediaTarget(null)}
        onSelect={(media) => {
          const url = media.url.startsWith("http") || media.url.startsWith("/") ? media.url : `/${media.url}`;
          if (mediaTarget === "logo") setForm((prev) => ({ ...prev, logoUrl: url }));
          if (mediaTarget === "darkLogo") setForm((prev) => ({ ...prev, darkLogoUrl: url }));
          setMediaTarget(null);
        }}
      />
    </div>
  );
}
