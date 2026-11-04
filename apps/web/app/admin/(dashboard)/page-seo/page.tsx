"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { adminFetch } from "@/lib/adminApi";
import MediaPickerModal, { type MediaItem } from "@/components/admin/MediaPickerModal";

export type PageSeoItem = {
  id: number;
  routePath: string;
  titleFa: string;
  titleEn: string;
  descriptionFa: string;
  descriptionEn: string;
  keywords: string[];
  canonicalUrl?: string | null;
  ogImageUrl?: string | null;
  ogType: string;
  noIndex: boolean;
};

const EMPTY_FORM: Omit<PageSeoItem, "id"> = {
  routePath: "",
  titleFa: "",
  titleEn: "",
  descriptionFa: "",
  descriptionEn: "",
  keywords: [],
  canonicalUrl: "",
  ogImageUrl: "",
  ogType: "website",
  noIndex: false,
};

const STANDARD_ROUTES = [
  { path: "/", label: "صفحه اصلی (Home)" },
  { path: "/about", label: "درباره ما (About Us)" },
  { path: "/services", label: "خدمات تخصصی (Services)" },
  { path: "/portfolio", label: "نمونه‌کارها (Portfolio)" },
  { path: "/articles", label: "مقالات و وبلاگ (Articles)" },
  { path: "/contact", label: "تماس با ما (Contact)" },
  { path: "/pricing", label: "تعرفه‌ها و پلن‌ها (Pricing)" },
];

export default function PageSeoAdminPage() {
  const [items, setItems] = useState<PageSeoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [keywordInput, setKeywordInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const fetchItems = () => {
    adminFetch("/api/v1/page-seo", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setItems(data);
        }
      })
      .catch(() => setMessage({ type: "err", text: "خطا در دریافت لیست متادیتای سئو" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setKeywordInput("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: PageSeoItem) => {
    setEditingId(item.id);
    setFormData({
      routePath: item.routePath || "",
      titleFa: item.titleFa || "",
      titleEn: item.titleEn || "",
      descriptionFa: item.descriptionFa || "",
      descriptionEn: item.descriptionEn || "",
      keywords: Array.isArray(item.keywords) ? item.keywords : [],
      canonicalUrl: item.canonicalUrl || "",
      ogImageUrl: item.ogImageUrl || "",
      ogType: item.ogType || "website",
      noIndex: Boolean(item.noIndex),
    });
    setKeywordInput("");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.routePath || !formData.titleFa || !formData.descriptionFa) {
      setMessage({ type: "err", text: "مسیر صفحه، عنوان فارسی و توضیحات متا الزامی هستند." });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const url = editingId ? `/api/v1/page-seo/${editingId}` : "/api/v1/page-seo";
      const method = editingId ? "PUT" : "POST";

      const res = await adminFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage({
          type: "ok",
          text: editingId ? "متادیتای سئوی صفحه با موفقیت به‌روزرسانی شد." : "سئوی صفحه جدید ایجاد شد.",
        });
        setIsModalOpen(false);
        fetchItems();
      } else {
        const err = await res.json().catch(() => null);
        setMessage({ type: "err", text: err?.error || "خطا در ذخیره‌سازی سئو." });
      }
    } catch {
      setMessage({ type: "err", text: "خطا در اتصال به سرور." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("آیا از حذف تنظیمات سئوی این صفحه اطمینان دارید؟")) return;

    try {
      const res = await adminFetch(`/api/v1/page-seo/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage({ type: "ok", text: "تنظیمات سئو حذف شد." });
        fetchItems();
      } else {
        setMessage({ type: "err", text: "خطا در حذف سئو." });
      }
    } catch {
      setMessage({ type: "err", text: "خطا در اتصال به سرور." });
    }
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData({ ...formData, keywords: [...formData.keywords, keywordInput.trim()] });
      setKeywordInput("");
    }
  };

  const removeKeyword = (idx: number) => {
    setFormData({ ...formData, keywords: formData.keywords.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-8" dir="rtl">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#232c27] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">مدیریت سئو و متادیتای صفحات (Page SEO Management)</h1>
          <p className="text-sm text-[#8fa397]">
            تنظیم عناوین مرورگر، متادیسکریپشن، کلیدواژه‌ها، پروتکل OpenGraph و تگ‌های ربات‌ها برای تمام صفحات
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-primary to-primary-hover text-white shadow-lg hover:shadow-primary/20 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>پیکربندی سئوی صفحه جدید</span>
        </button>
      </div>

      {/* ── Notification Banner ── */}
      {message && (
        <div
          className={`p-4 rounded-xl text-sm font-medium border flex items-center justify-between transition-all ${
            message.type === "ok"
              ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-200"
              : "bg-red-950/50 border-red-500/40 text-red-200"
          }`}
        >
          <span>{message.text}</span>
          <button type="button" onClick={() => setMessage(null)} className="text-xs opacity-70 hover:opacity-100">
            بستن
          </button>
        </div>
      )}

      {/* ── SEO Pages Table ── */}
      <div className="bg-[#131615] border border-[#1f2623] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-[#181d1a] text-[#8fa397] text-xs font-semibold uppercase border-b border-[#232c27]">
              <tr>
                <th className="px-6 py-4">مسیر URL</th>
                <th className="px-6 py-4">عنوان صفحه (Meta Title)</th>
                <th className="px-6 py-4">تعداد کلمات کلیدی</th>
                <th className="px-6 py-4">ایندکس ربات‌ها</th>
                <th className="px-6 py-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2623]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-[#8fa397]">
                    در حال بارگذاری متادیتای سئو...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-[#8fa397]">
                    هیچ تنظیمی ثبت نشده است. از دکمه بالا برای افزودن سئوی صفحه استفاده کنید.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-bold text-emerald-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg" dir="ltr">
                        {item.routePath}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-white max-w-xs truncate">
                      <div>{item.titleFa}</div>
                      <div className="text-xs text-[#8fa397] truncate mt-0.5" dir="ltr">
                        {item.titleEn}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-[#8fa397]">
                      {Array.isArray(item.keywords) ? item.keywords.length : 0} کلیدواژه
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          item.noIndex
                            ? "bg-red-950/70 text-red-300 border border-red-500/30"
                            : "bg-emerald-950/70 text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        {item.noIndex ? "noindex (مسدود)" : "index, follow (مجاز)"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1a221e] hover:bg-[#232f29] text-emerald-400 border border-[#2a3831] transition-colors"
                        >
                          ویرایش
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-950/30 hover:bg-red-950/60 text-red-400 border border-red-500/20 transition-colors"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#131615] border border-[#232c27] rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#232c27] pb-4">
              <h2 className="text-xl font-bold text-white">
                {editingId ? `ویرایش متادیتای سئو: ${formData.routePath}` : "پیکربندی سئوی صفحه جدید"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              {/* Route Path */}
              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">مسیر صفحه (Route Path) *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.routePath}
                    onChange={(e) => setFormData({ ...formData, routePath: e.target.value })}
                    className="flex-1 bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-primary focus:outline-none font-mono"
                    dir="ltr"
                    placeholder="/portfolio یا /services"
                  />
                  <select
                    onChange={(e) => {
                      if (e.target.value) setFormData({ ...formData, routePath: e.target.value });
                    }}
                    className="bg-[#1a221e] border border-[#2a3530] text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none"
                  >
                    <option value="">انتخاب مسیر پیش‌فرض...</option>
                    {STANDARD_ROUTES.map((r) => (
                      <option key={r.path} value={r.path}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-[#8fa397]">عنوان متای فارسی (Meta Title) *</label>
                    <span className="text-[11px] font-mono text-gray-500">
                      طول پیشنهادی: ۵۰ تا ۶۵ نویسه (فعلی: {formData.titleFa.length})
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.titleFa}
                    onChange={(e) => setFormData({ ...formData, titleFa: e.target.value })}
                    className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-primary focus:outline-none"
                    placeholder="مثال: خدمات تخصصی طراحی سایت و سئو تکنیکال | OnSupp"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-[#8fa397]">توضیحات متای فارسی (Meta Description) *</label>
                    <span className="text-[11px] font-mono text-gray-500">
                      طول پیشنهادی: ۱۲۰ تا ۱۶۰ نویسه (فعلی: {formData.descriptionFa.length})
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    required
                    value={formData.descriptionFa}
                    onChange={(e) => setFormData({ ...formData, descriptionFa: e.target.value })}
                    className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-primary focus:outline-none"
                    placeholder="شرح جامع و جذاب محتوای صفحه برای ترغیب کلیک در نتایج جستجوی گوگل..."
                  />
                </div>
              </div>

              {/* SERP Live Preview */}
              <div className="p-4 rounded-xl bg-[#101413] border border-[#232c27] space-y-2">
                <span className="text-xs font-mono font-bold text-emerald-400 block mb-2">
                  پیش‌نمایش زنده در نتایج جستجوی گوگل (Google SERP Snippet Preview)
                </span>
                <div className="bg-[#202124] p-4 rounded-lg border border-white/5 font-sans space-y-1">
                  <div className="flex items-center gap-2 text-xs text-[#bdc1c6]" dir="ltr">
                    <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[10px]">🌐</div>
                    <span>https://onsupp.com{formData.routePath}</span>
                  </div>
                  <h3 className="text-base text-[#8ab4f8] hover:underline font-medium cursor-pointer leading-snug">
                    {formData.titleFa || "عنوان متای صفحه..."}
                  </h3>
                  <p className="text-xs text-[#bdc1c6] leading-relaxed line-clamp-2">
                    {formData.descriptionFa || "توضیحات متای صفحه در این بخش به عنوان اسنیپت جستجو نمایش داده خواهد شد..."}
                  </p>
                </div>
              </div>

              {/* Keywords Tag Manager */}
              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">کلیدواژه‌های هدف (Meta Keywords)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addKeyword();
                      }
                    }}
                    placeholder="کلیدواژه موردنظر را بنویسید و اینتر بزنید..."
                    className="flex-1 bg-[#101413] border border-[#232c27] text-white text-xs rounded-xl px-3.5 py-2"
                  />
                  <button
                    type="button"
                    onClick={addKeyword}
                    className="px-4 py-2 bg-[#1f2623] text-emerald-400 text-xs font-bold rounded-xl"
                  >
                    افزودن
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {formData.keywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-white"
                    >
                      <span>{kw}</span>
                      <button
                        type="button"
                        onClick={() => removeKeyword(idx)}
                        className="text-red-400 hover:text-red-300"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* OG Image & Canonical */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">تصویر اشتراک‌گذاری (OG Image)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.ogImageUrl || ""}
                      onChange={(e) => setFormData({ ...formData, ogImageUrl: e.target.value })}
                      className="w-full bg-[#101413] border border-[#232c27] text-white text-xs rounded-lg px-2.5 py-2 focus:border-primary focus:outline-none"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setPickerOpen(true)}
                      className="px-2.5 py-2 rounded-lg bg-[#1f2623] text-xs text-emerald-400 shrink-0"
                    >
                      انتخاب
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">آدرس کانونیکال (Canonical URL)</label>
                  <input
                    type="url"
                    value={formData.canonicalUrl || ""}
                    onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                    className="w-full bg-[#101413] border border-[#232c27] text-white text-xs rounded-lg px-3 py-2 focus:border-primary focus:outline-none"
                    dir="ltr"
                    placeholder="https://onsupp.com/..."
                  />
                </div>
              </div>

              {/* Robots NoIndex Toggle */}
              <div className="flex items-center gap-3 pt-2 border-t border-[#232c27]">
                <input
                  type="checkbox"
                  id="noindex-check"
                  checked={formData.noIndex}
                  onChange={(e) => setFormData({ ...formData, noIndex: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-600 text-red-500 focus:ring-red-500"
                />
                <label htmlFor="noindex-check" className="text-xs font-semibold text-white">
                  مسدودسازی از موتورهای جستجو (noindex, nofollow) — این صفحه در گوگل ایندکس نشود.
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#232c27]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1f2623] text-gray-300 hover:text-white"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-primary to-primary-hover text-white shadow-lg disabled:opacity-50"
                >
                  {saving ? "در حال ذخیره..." : "ذخیره تنظیمات سئو"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker */}
      {pickerOpen && (
        <MediaPickerModal
          open={true}
          onClose={() => setPickerOpen(false)}
          onSelect={(item: MediaItem) => {
            setFormData((prev) => ({ ...prev, ogImageUrl: item.url }));
            setPickerOpen(false);
          }}
          
        />
      )}
    </div>
  );
}
