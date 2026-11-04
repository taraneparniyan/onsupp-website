"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { adminFetch } from "@/lib/adminApi";
import MediaPickerModal, { type MediaItem } from "@/components/admin/MediaPickerModal";

export type AdminService = {
  id: number;
  title: string;
  titleEn: string;
  slug?: string | null;
  iconType?: string | null;
  headlineFa?: string | null;
  headlineEn?: string | null;
  subtitle: string;
  subtitleEn: string;
  descriptionFa?: string | null;
  descriptionEn?: string | null;
  detailedNarrativeFa?: string | null;
  detailedNarrativeEn?: string | null;
  businessValueTitleFa?: string | null;
  businessValueFa?: string | null;
  subservices?: Array<{ nameFa: string; nameEn?: string; descFa: string; descEn?: string }> | null;
  metrics?: Array<{ valueFa: string; valueEn?: string; labelFa: string; labelEn?: string }> | null;
  imageUrl: string | null;
  imageAlt: string | null;
  position: number;
  published: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

interface ServiceFormData {
  title: string;
  titleEn: string;
  slug: string;
  iconType: string;
  headlineFa: string;
  headlineEn: string;
  subtitle: string;
  subtitleEn: string;
  descriptionFa: string;
  descriptionEn: string;
  detailedNarrativeFa: string;
  businessValueTitleFa: string;
  businessValueFa: string;
  subservices: Array<{ nameFa: string; descFa: string }>;
  metrics: Array<{ valueFa: string; labelFa: string }>;
  imageUrl: string;
  imageAlt: string;
  position: number;
  published: boolean;
  seoTitle: string;
  seoDescription: string;
}

const EMPTY_FORM: ServiceFormData = {
  title: "",
  titleEn: "",
  slug: "",
  iconType: "web",
  headlineFa: "",
  headlineEn: "",
  subtitle: "",
  subtitleEn: "",
  descriptionFa: "",
  descriptionEn: "",
  detailedNarrativeFa: "",
  businessValueTitleFa: "ارزش تجاری و مزیت رقابتی",
  businessValueFa: "",
  subservices: [],
  metrics: [],
  imageUrl: "",
  imageAlt: "",
  position: 0,
  published: true,
  seoTitle: "",
  seoDescription: "",
};

export default function ServicesAdminPage() {
  const [items, setItems] = useState<AdminService[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>(EMPTY_FORM);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const fetchItems = () => {
    adminFetch("/api/v1/services", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setItems(data.sort((a, b) => (a.position ?? 0) - (b.position ?? 0)));
        }
      })
      .catch(() => setMessage({ type: "err", text: "خطا در دریافت لیست خدمات" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ ...EMPTY_FORM, position: items.length });
    setIsModalOpen(true);
  };

  const openEditModal = (s: AdminService) => {
    setEditingId(s.id);
    setFormData({
      title: s.title || "",
      titleEn: s.titleEn || "",
      slug: s.slug || "",
      iconType: s.iconType || "web",
      headlineFa: s.headlineFa || "",
      headlineEn: s.headlineEn || "",
      subtitle: s.subtitle || "",
      subtitleEn: s.subtitleEn || "",
      descriptionFa: s.descriptionFa || s.subtitle || "",
      descriptionEn: s.descriptionEn || s.subtitleEn || "",
      detailedNarrativeFa: s.detailedNarrativeFa || "",
      businessValueTitleFa: s.businessValueTitleFa || "ارزش تجاری و مزیت رقابتی",
      businessValueFa: s.businessValueFa || "",
      subservices: Array.isArray(s.subservices) ? s.subservices : [],
      metrics: Array.isArray(s.metrics) ? s.metrics : [],
      imageUrl: s.imageUrl || "",
      imageAlt: s.imageAlt || s.title || "",
      position: s.position ?? 0,
      published: s.published !== false,
      seoTitle: s.seoTitle || "",
      seoDescription: s.seoDescription || "",
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() && !formData.titleEn.trim()) {
      setMessage({ type: "err", text: "عنوان خدمت الزامی است." });
      return;
    }

    setSaving(true);
    setMessage(null);

    const payload = {
      title: formData.title,
      titleEn: formData.titleEn,
      slug: formData.slug || formData.titleEn.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      iconType: formData.iconType,
      headlineFa: formData.headlineFa,
      headlineEn: formData.headlineEn,
      subtitle: formData.subtitle || formData.descriptionFa,
      subtitleEn: formData.subtitleEn || formData.descriptionEn,
      descriptionFa: formData.descriptionFa || formData.subtitle,
      descriptionEn: formData.descriptionEn || formData.subtitleEn,
      detailedNarrativeFa: formData.detailedNarrativeFa,
      businessValueTitleFa: formData.businessValueTitleFa,
      businessValueFa: formData.businessValueFa,
      subservices: formData.subservices,
      metrics: formData.metrics,
      imageUrl: formData.imageUrl || null,
      imageAlt: formData.imageAlt || formData.title,
      position: formData.position,
      published: formData.published,
      seoTitle: formData.seoTitle,
      seoDescription: formData.seoDescription,
    };

    try {
      const url = editingId ? `/api/v1/services/${editingId}` : "/api/v1/services";
      const method = editingId ? "PUT" : "POST";

      const res = await adminFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage({ type: "ok", text: editingId ? "خدمت با موفقیت ویرایش شد." : "خدمت جدید افزوده شد." });
        setIsModalOpen(false);
        fetchItems();
      } else {
        const err = await res.json().catch(() => null);
        setMessage({ type: "err", text: err?.error || "خطا در ذخیره خدمت." });
      }
    } catch {
      setMessage({ type: "err", text: "خطا در اتصال به سرور." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("آیا از حذف این خدمت اطمینان دارید؟")) return;

    try {
      const res = await adminFetch(`/api/v1/services/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage({ type: "ok", text: "خدمت حذف شد." });
        fetchItems();
      } else {
        setMessage({ type: "err", text: "خطا در حذف خدمت." });
      }
    } catch {
      setMessage({ type: "err", text: "خطا در اتصال به سرور." });
    }
  };

  const addSubservice = () => {
    setFormData((prev) => ({
      ...prev,
      subservices: [...prev.subservices, { nameFa: "", descFa: "" }],
    }));
  };

  const removeSubservice = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      subservices: prev.subservices.filter((_, i) => i !== idx),
    }));
  };

  const updateSubservice = (idx: number, field: "nameFa" | "descFa", val: string) => {
    setFormData((prev) => {
      const copy = [...prev.subservices];
      copy[idx] = { ...copy[idx], [field]: val };
      return { ...prev, subservices: copy };
    });
  };

  const addMetric = () => {
    setFormData((prev) => ({
      ...prev,
      metrics: [...prev.metrics, { valueFa: "", labelFa: "" }],
    }));
  };

  const removeMetric = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      metrics: prev.metrics.filter((_, i) => i !== idx),
    }));
  };

  const updateMetric = (idx: number, field: "valueFa" | "labelFa", val: string) => {
    setFormData((prev) => {
      const copy = [...prev.metrics];
      copy[idx] = { ...copy[idx], [field]: val };
      return { ...prev, metrics: copy };
    });
  };

  return (
    <div className="space-y-8" dir="rtl">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#232c27] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">مدیریت دپارتمان‌ها و خدمات تخصصی (Services CMS)</h1>
          <p className="text-sm text-[#8fa397]">
            مدیریت کامل خدمات OnSupp، زیرخدمات، متریک‌های عملکردی، داستان ارزش تجاری و سئو در صفحات اصلی و اختصاصی
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
          <span>افزودن خدمت جدید</span>
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

      {/* ── Services Table ── */}
      <div className="bg-[#131615] border border-[#1f2623] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-[#181d1a] text-[#8fa397] text-xs font-semibold uppercase border-b border-[#232c27]">
              <tr>
                <th className="px-6 py-4">ترتیب</th>
                <th className="px-6 py-4">تصویر / آیکون</th>
                <th className="px-6 py-4">عنوان خدمت</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">دسته‌بندی آیکون</th>
                <th className="px-6 py-4">وضعیت</th>
                <th className="px-6 py-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2623]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#8fa397]">
                    در حال بارگذاری لیست خدمات...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#8fa397]">
                    هیچ خدمتی ثبت نشده است. از دکمه بالا برای افزودن خدمت جدید استفاده کنید.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-mono text-[#8fa397]">{item.position}</td>
                    <td className="px-6 py-4">
                      <div className="relative w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                        {item.imageUrl ? (
                          <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                        ) : (
                          <span className="text-xs text-emerald-400 font-mono">
                            {item.iconType || "web"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">
                      <div>{item.title}</div>
                      <div className="text-xs text-[#8fa397] font-mono mt-0.5" dir="ltr">
                        {item.titleEn}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-emerald-400" dir="ltr">
                      {item.slug || "—"}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-[#8fa397]" dir="ltr">
                      {item.iconType || "web"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          item.published !== false
                            ? "bg-emerald-950/70 text-emerald-300 border border-emerald-500/30"
                            : "bg-amber-950/70 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {item.published !== false ? "منتشر شده" : "پیش‌نویس"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1a221e] hover:bg-[#232f29] text-emerald-400 border border-[#2a3831] transition-colors"
                        >
                          ویرایش کامل
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
                {editingId ? `ویرایش خدمت: ${formData.title}` : "افزودن خدمت جدید"}
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
              {/* Row 1: Titles & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">عنوان خدمت (فارسی) *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-primary focus:outline-none"
                    placeholder="مثال: طراحی وب‌سایت و پرتال سازمانی"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">Service Title (English)</label>
                  <input
                    type="text"
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-primary focus:outline-none"
                    dir="ltr"
                    placeholder="Web & Enterprise Portal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">Slug (شناسه یکتا)</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-primary focus:outline-none font-mono text-emerald-400"
                    dir="ltr"
                    placeholder="web-development"
                  />
                </div>
              </div>

              {/* Row 2: Icon Type, Position, Published */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">نوع آیکون خدمت</label>
                  <select
                    value={formData.iconType}
                    onChange={(e) => setFormData({ ...formData, iconType: e.target.value })}
                    className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3 py-2.5 focus:border-primary focus:outline-none"
                  >
                    <option value="web">طراحی وب و پرتال (web)</option>
                    <option value="seo">سئو تکنیکال (seo)</option>
                    <option value="social">فضای مجازی و اینستاگرام (social)</option>
                    <option value="studio">استودیو و تیزر (studio)</option>
                    <option value="motion">انیمیشن و موشن (motion)</option>
                    <option value="crm">اتوماسیون و CRM (crm)</option>
                    <option value="software">نرم‌افزار اختصاصی (software)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">ترتیب نمایش</label>
                  <input
                    type="number"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-primary focus:outline-none font-mono"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">وضعیت انتشار</label>
                  <select
                    value={formData.published ? "true" : "false"}
                    onChange={(e) => setFormData({ ...formData, published: e.target.value === "true" })}
                    className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3 py-2.5 focus:border-primary focus:outline-none"
                  >
                    <option value="true">منتشر شده (Published)</option>
                    <option value="false">پیش‌نویس (Draft)</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Headline & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">تیتر برجسته خدمت (Headline Fa)</label>
                  <input
                    type="text"
                    value={formData.headlineFa}
                    onChange={(e) => setFormData({ ...formData, headlineFa: e.target.value })}
                    className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-primary focus:outline-none"
                    placeholder="معماری فرانت‌اند پرفورمنس‌محور و سیستم‌های ابری"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">توضیح کوتاه کارت (Subtitle Fa)</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-primary focus:outline-none"
                    placeholder="توضیح مختصر برای کارت خدمات در صفحه اصلی..."
                  />
                </div>
              </div>

              {/* Row 4: Detailed Narrative */}
              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">روایت تفصیلی خدمت (Detailed Narrative)</label>
                <textarea
                  rows={3}
                  value={formData.detailedNarrativeFa}
                  onChange={(e) => setFormData({ ...formData, detailedNarrativeFa: e.target.value })}
                  className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-primary focus:outline-none"
                  placeholder="شرح کامل رویکرد مهندسی و ارزش‌آفرینی این دپارتمان در صفحه خدمات..."
                />
              </div>

              {/* Row 5: Business Value */}
              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">ارزش تجاری و مزیت رقابتی برای کارفرما</label>
                <textarea
                  rows={2}
                  value={formData.businessValueFa}
                  onChange={(e) => setFormData({ ...formData, businessValueFa: e.target.value })}
                  className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-primary focus:outline-none"
                  placeholder="چرا این خدمت به افزایش درآمد و بهره‌وری کارفرما منجر می‌شود..."
                />
              </div>

              {/* Image Picker */}
              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">تصویر شاخص خدمت</label>
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {formData.imageUrl ? (
                      <Image src={formData.imageUrl} alt="Service" fill className="object-cover" />
                    ) : (
                      <span className="text-xs text-gray-500">بدون تصویر</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full bg-[#101413] border border-[#232c27] text-white text-xs rounded-lg px-3 py-2 focus:border-primary focus:outline-none"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setPickerOpen(true)}
                      className="text-xs text-emerald-400 hover:underline"
                    >
                      انتخاب از رسانه‌ها...
                    </button>
                  </div>
                </div>
              </div>

              {/* Subservices Manager */}
              <div className="p-4 rounded-xl bg-[#101413] border border-[#232c27] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">زیرخدمات و شاخه‌های تخصصی (Subservices)</span>
                  <button
                    type="button"
                    onClick={addSubservice}
                    className="text-xs text-emerald-400 hover:underline"
                  >
                    + افزودن زیرخدمت
                  </button>
                </div>
                {formData.subservices.map((sub, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={sub.nameFa}
                      onChange={(e) => updateSubservice(idx, "nameFa", e.target.value)}
                      placeholder="عنوان زیرخدمت"
                      className="w-1/3 bg-[#181d1b] border border-[#2a3530] text-white text-xs rounded-lg px-2.5 py-1.5"
                    />
                    <input
                      type="text"
                      value={sub.descFa}
                      onChange={(e) => updateSubservice(idx, "descFa", e.target.value)}
                      placeholder="توضیح کوتاه زیرخدمت"
                      className="flex-1 bg-[#181d1b] border border-[#2a3530] text-white text-xs rounded-lg px-2.5 py-1.5"
                    />
                    <button
                      type="button"
                      onClick={() => removeSubservice(idx)}
                      className="text-red-400 hover:text-red-300 text-xs px-1.5"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Metrics Manager */}
              <div className="p-4 rounded-xl bg-[#101413] border border-[#232c27] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">شاخص‌های کلیدی عملکرد (Metrics & Results)</span>
                  <button
                    type="button"
                    onClick={addMetric}
                    className="text-xs text-emerald-400 hover:underline"
                  >
                    + افزودن شاخص
                  </button>
                </div>
                {formData.metrics.map((m, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={m.valueFa}
                      onChange={(e) => updateMetric(idx, "valueFa", e.target.value)}
                      placeholder="مقدار شاخص (مثال: +۲۴۰٪)"
                      className="w-1/3 bg-[#181d1b] border border-[#2a3530] text-white text-xs rounded-lg px-2.5 py-1.5"
                    />
                    <input
                      type="text"
                      value={m.labelFa}
                      onChange={(e) => updateMetric(idx, "labelFa", e.target.value)}
                      placeholder="عنوان شاخص (مثال: رشد نرخ تبدیل)"
                      className="flex-1 bg-[#181d1b] border border-[#2a3530] text-white text-xs rounded-lg px-2.5 py-1.5"
                    />
                    <button
                      type="button"
                      onClick={() => removeMetric(idx)}
                      className="text-red-400 hover:text-red-300 text-xs px-1.5"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* SEO Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#232c27]">
                <div>
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">عنوان سئو (SEO Title)</label>
                  <input
                    type="text"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                    className="w-full bg-[#101413] border border-[#232c27] text-white text-xs rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">توضیحات سئو (SEO Description)</label>
                  <input
                    type="text"
                    value={formData.seoDescription}
                    onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                    className="w-full bg-[#101413] border border-[#232c27] text-white text-xs rounded-lg px-3 py-2"
                  />
                </div>
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
                  {saving ? "در حال ذخیره..." : "ذخیره خدمت"}
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
            setFormData((prev) => ({
              ...prev,
              imageUrl: item.url,
              imageAlt: prev.imageAlt || item.alt || prev.title,
            }));
            setPickerOpen(false);
          }}
          
        />
      )}
    </div>
  );
}
