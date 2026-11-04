"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { adminFetch } from "@/lib/adminApi";
import MediaPickerModal, { type MediaItem } from "@/components/admin/MediaPickerModal";

export type AdminCaseStudy = {
  id: number;
  slug: string;
  client: string;
  clientEn: string;
  titleFa: string;
  titleEn: string;
  taglineFa: string;
  taglineEn: string;
  categoryFa: string;
  categoryEn: string;
  projectType: "website" | "instagram" | "app";
  descriptionFa: string;
  descriptionEn: string;
  imageUrl: string | null;
  secondaryImage: string | null;
  liveUrl: string;
  featured: boolean;
  position: number;
  year: string;
};

const EMPTY_FORM: Omit<AdminCaseStudy, "id"> = {
  slug: "",
  client: "",
  clientEn: "",
  titleFa: "",
  titleEn: "",
  taglineFa: "",
  taglineEn: "",
  categoryFa: "",
  categoryEn: "",
  projectType: "website",
  descriptionFa: "",
  descriptionEn: "",
  imageUrl: "",
  secondaryImage: "",
  liveUrl: "",
  featured: true,
  position: 0,
  year: "۲۰۲۵",
};

export default function AdminCaseStudiesPage() {
  const [items, setItems] = useState<AdminCaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<"image" | "secondary" | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const notify = (type: "ok" | "err", text: string) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage((cur) => (cur?.text === text ? null : cur));
    }, 4500);
  };

  const loadData = () => {
    setLoading(true);
    adminFetch("/api/v1/casestudies")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
      })
      .catch(() => notify("err", "خطا در دریافت لیست نمونه‌کارها"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (item: AdminCaseStudy) => {
    setEditingId(item.id);
    setFormData({
      slug: item.slug || "",
      client: item.client || "",
      clientEn: item.clientEn || "",
      titleFa: item.titleFa || "",
      titleEn: item.titleEn || "",
      taglineFa: item.taglineFa || "",
      taglineEn: item.taglineEn || "",
      categoryFa: item.categoryFa || "",
      categoryEn: item.categoryEn || "",
      projectType: item.projectType || "website",
      descriptionFa: item.descriptionFa || "",
      descriptionEn: item.descriptionEn || "",
      imageUrl: item.imageUrl || "",
      secondaryImage: item.secondaryImage || "",
      liveUrl: item.liveUrl || "",
      featured: item.featured !== false,
      position: item.position ?? 0,
      year: item.year || "۲۰۲۵",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setEditingId(null);
    setFormData({
      ...EMPTY_FORM,
      position: items.length,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titleFa.trim()) {
      notify("err", "عنوان فارسی الزامی است.");
      return;
    }

    const endpoint = editingId
      ? `/api/v1/casestudies/${editingId}`
      : "/api/v1/casestudies";
    const method = editingId ? "PUT" : "POST";

    const payload = {
      ...formData,
      slug: formData.slug.trim() || formData.titleEn.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      imageUrl: formData.imageUrl?.trim() || null,
      secondaryImage: formData.secondaryImage?.trim() || null,
      position: Number(formData.position) || 0,
    };

    try {
      const res = await adminFetch(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "خطا در ذخیره نمونه‌کار");
      }

      notify("ok", editingId ? "تغییرات با موفقیت ذخیره شد." : "نمونه‌کار جدید با موفقیت اضافه شد.");
      handleReset();
      loadData();
    } catch (err: any) {
      notify("err", err.message || "خطا در ثبت اطلاعات");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("آیا از حذف این نمونه‌کار مطمئن هستید؟")) return;
    try {
      const res = await adminFetch(`/api/v1/casestudies/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("حذف ناموفق بود");
      notify("ok", "نمونه‌کار با موفقیت حذف گردید.");
      loadData();
    } catch (err: any) {
      notify("err", err.message || "خطا در حذف نمونه‌کار");
    }
  };

  const handleSelectMedia = (media: MediaItem) => {
    if (mediaPickerTarget === "image") {
      setFormData((prev) => ({ ...prev, imageUrl: media.url }));
    } else if (mediaPickerTarget === "secondary") {
      setFormData((prev) => ({ ...prev, secondaryImage: media.url }));
    }
    setMediaPickerTarget(null);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12" dir="rtl">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#262625] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-lg">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8BB3A4]/10 border border-[#8BB3A4]/20 text-[#8BB3A4] text-xs font-bold">
            📁 مدیریت نمونه‌کارها و کیس‌استادی‌های آن‌ساپ
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">مدیریت کیس‌استادی‌ها و پورتفولیو</h1>
          <p className="text-sm text-neutral-400">
            مدیریت یکپارچه نمونه‌کارهای رسمی، پیوندهای زنده، تصاویر کاور، دسته‌بندی‌ها و متادیتا برای وب‌سایت اصلی.
          </p>
        </div>
      </div>

      {/* Notification Toast */}
      {message && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
            message.type === "ok"
              ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-200"
              : "bg-rose-950/60 border-rose-500/40 text-rose-200"
          }`}
        >
          <span>{message.text}</span>
          <button type="button" onClick={() => setMessage(null)} className="text-xs opacity-70 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Panel */}
        <div className="lg:col-span-5 bg-[#262625] border border-white/10 rounded-2xl p-6 space-y-6 shadow-md h-fit">
          <h2 className="text-lg font-bold text-white pb-3 border-b border-white/10 flex items-center justify-between">
            <span>{editingId ? "ویرایش کیس‌استادی" : "افزودن کیس‌استادی جدید"}</span>
            {editingId && (
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-rose-400 hover:underline"
              >
                انصراف و فرم جدید
              </button>
            )}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title FA */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                عنوان پروژه (فارسی) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.titleFa}
                onChange={(e) => setFormData({ ...formData, titleFa: e.target.value })}
                placeholder="مثال: برندینگ دیجیتال، پرتال نوبت‌دهی و هویت شبکه‌های اجتماعی"
                className="w-full bg-neutral-900/60 border border-white/10 text-sm text-white rounded-xl py-2 px-3 focus:outline-none focus:border-[#8BB3A4]"
              />
            </div>

            {/* Title EN */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                عنوان پروژه (انگلیسی)
              </label>
              <input
                type="text"
                dir="ltr"
                value={formData.titleEn}
                onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                placeholder="e.g. Digital Branding, Booking Portal & Social Identity"
                className="w-full bg-neutral-900/60 border border-white/10 text-sm text-white rounded-xl py-2 px-3 focus:outline-none focus:border-[#8BB3A4]"
              />
            </div>

            {/* Client FA & EN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  نام کارفرما / برند (فارسی)
                </label>
                <input
                  type="text"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  placeholder="کلینیک دکتر علیرضا میراسماعیلی"
                  className="w-full bg-neutral-900/60 border border-white/10 text-sm text-white rounded-xl py-2 px-3 focus:outline-none focus:border-[#8BB3A4]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  نام کارفرما (انگلیسی)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={formData.clientEn}
                  onChange={(e) => setFormData({ ...formData, clientEn: e.target.value })}
                  placeholder="Dr. Miresmaeli Clinic"
                  className="w-full bg-neutral-900/60 border border-white/10 text-sm text-white rounded-xl py-2 px-3 focus:outline-none focus:border-[#8BB3A4]"
                />
              </div>
            </div>

            {/* Slug & Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  شناسه URL (Slug)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="dr-miresmaeli-clinic"
                  className="w-full bg-neutral-900/60 border border-white/10 text-sm text-white rounded-xl py-2 px-3 focus:outline-none focus:border-[#8BB3A4] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  سال اجرا
                </label>
                <input
                  type="text"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="۲۰۲۴ یا ۱۴۰۳"
                  className="w-full bg-neutral-900/60 border border-white/10 text-sm text-white rounded-xl py-2 px-3 focus:outline-none focus:border-[#8BB3A4]"
                />
              </div>
            </div>

            {/* Category & Project Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  دسته‌بندی (فارسی)
                </label>
                <input
                  type="text"
                  value={formData.categoryFa}
                  onChange={(e) => setFormData({ ...formData, categoryFa: e.target.value })}
                  placeholder="طراحی وب و هویت دیجیتال"
                  className="w-full bg-neutral-900/60 border border-white/10 text-sm text-white rounded-xl py-2 px-3 focus:outline-none focus:border-[#8BB3A4]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  نوع پروژه
                </label>
                <select
                  value={formData.projectType}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value as any })}
                  className="w-full bg-neutral-900/60 border border-white/10 text-sm text-white rounded-xl py-2 px-3 focus:outline-none focus:border-[#8BB3A4]"
                >
                  <option value="website">🌐 وب‌سایت و پلتفرم</option>
                  <option value="app">📱 نرم‌افزار اختصاصی و وب‌اپ</option>
                  <option value="instagram">📸 استودیو و سوشال مدیا</option>
                </select>
              </div>
            </div>

            {/* Live URL */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                لینک زنده پروژه (Direct Live URL)
              </label>
              <input
                type="text"
                dir="ltr"
                value={formData.liveUrl}
                onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                placeholder="https://drmiresmaeli.com/ یا /portfolio/dr-miresmaeli-clinic"
                className="w-full bg-neutral-900/60 border border-white/10 text-sm text-white rounded-xl py-2 px-3 focus:outline-none focus:border-[#8BB3A4]"
              />
            </div>

            {/* Image URL & Picker */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                تصویر شاخص کاور (Cover Image)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  dir="ltr"
                  value={formData.imageUrl || ""}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="/images/portfolio/project-hero.webp"
                  className="flex-1 bg-neutral-900/60 border border-white/10 text-xs text-white rounded-xl py-2 px-3 focus:outline-none focus:border-[#8BB3A4]"
                />
                <button
                  type="button"
                  onClick={() => setMediaPickerTarget("image")}
                  className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-neutral-300 hover:bg-white/10 transition"
                >
                  انتخاب رسانه
                </button>
              </div>
              {formData.imageUrl && (
                <div className="mt-2 relative h-20 w-36 rounded-lg overflow-hidden border border-white/10">
                  <Image src={formData.imageUrl} alt="preview" fill className="object-cover" />
                </div>
              )}
            </div>

            {/* Tagline FA */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                شعار / توضیح کوتاه (Tagline)
              </label>
              <input
                type="text"
                value={formData.taglineFa}
                onChange={(e) => setFormData({ ...formData, taglineFa: e.target.value })}
                placeholder="تدوین هویت بصری منسجم و طراحی وب‌سایت پرفورمنس‌محور"
                className="w-full bg-neutral-900/60 border border-white/10 text-sm text-white rounded-xl py-2 px-3 focus:outline-none focus:border-[#8BB3A4]"
              />
            </div>

            {/* Description FA */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                شرح پروژه و راه‌حل اجرا شده (فارسی)
              </label>
              <textarea
                rows={3}
                value={formData.descriptionFa}
                onChange={(e) => setFormData({ ...formData, descriptionFa: e.target.value })}
                placeholder="توضیح خلاصه درباره چالش‌ها و نتایج همکاری..."
                className="w-full bg-neutral-900/60 border border-white/10 text-sm text-white rounded-xl py-2 px-3 focus:outline-none focus:border-[#8BB3A4]"
              />
            </div>

            {/* Featured & Position */}
            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded bg-neutral-900 border-white/20 text-[#8BB3A4] focus:ring-0"
                />
                نمایش به عنوان پروژه شاخص در صفحه اصلی
              </label>

              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">ترتیب:</span>
                <input
                  type="number"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value, 10) || 0 })}
                  className="w-16 bg-neutral-900/60 border border-white/10 text-xs text-white rounded-xl py-1 px-2 text-center"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#8BB3A4] text-neutral-950 font-bold text-sm hover:bg-[#9cc1b3] shadow-lg transition-all"
            >
              {editingId ? "ذخیره تغییرات کیس‌استادی" : "افزودن کیس‌استادی جدید"}
            </button>
          </form>
        </div>

        {/* List Items */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>لیست پروژه‌ها</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#8BB3A4]/10 text-[#8BB3A4] border border-[#8BB3A4]/20 font-mono">
                {items.length}
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12 text-neutral-400 animate-pulse">در حال بارگذاری نمونه‌کارها...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 bg-[#262625] rounded-2xl border border-white/10 text-neutral-400">
              هیچ کیس‌استادی‌ای ثبت نشده است.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#262625] border border-white/10 hover:border-[#8BB3A4]/40 p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {item.imageUrl ? (
                      <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden border border-white/10 bg-neutral-900">
                        <Image src={item.imageUrl} alt={item.titleFa} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="h-14 w-14 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs text-neutral-500 font-mono">
                        No Img
                      </div>
                    )}

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm text-white truncate max-w-[280px]">
                          {item.client ? `${item.client} — ${item.titleFa}` : item.titleFa}
                        </h3>
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[#8BB3A4] text-[10px]">
                          {item.categoryFa || item.projectType}
                        </span>
                        {item.featured && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px]">
                            شاخص هوم‌پیج
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 truncate max-w-[320px]">
                        {item.taglineFa || item.descriptionFa}
                      </p>
                      {item.liveUrl && (
                        <a
                          href={item.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-[#8BB3A4]/80 hover:text-[#8BB3A4] hover:underline inline-block truncate max-w-[280px]"
                        >
                          {item.liveUrl}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      className="p-2 rounded-xl bg-white/5 border border-white/10 text-neutral-300 hover:bg-white/10 hover:text-[#8BB3A4] transition-all"
                      title="ویرایش"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-all"
                      title="حذف"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Media Picker Modal */}
      {mediaPickerTarget !== null && (
        <MediaPickerModal
          open={true}
          onClose={() => setMediaPickerTarget(null)}
          onSelect={handleSelectMedia}
        />
      )}
    </div>
  );
}
