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
  previewType: "mobile" | "web" | "platform";
  descriptionFa: string;
  descriptionEn: string;
  challengeFa?: string | null;
  challengeEn?: string | null;
  solutionFa?: string | null;
  solutionEn?: string | null;
  servicesFa?: string[] | null;
  deliverablesFa?: string[] | null;
  metricsFa?: Array<{ value: string; label: string }> | null;
  colorGradient?: string | null;
  accentColor?: string | null;
  glowColor?: string | null;
  imageUrl: string | null;
  secondaryImage: string | null;
  gallery?: string[] | null;
  liveUrl: string;
  featured: boolean;
  position: number;
  year: string;
  published: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

interface CaseStudyFormData {
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
  previewType: "mobile" | "web" | "platform";
  descriptionFa: string;
  descriptionEn: string;
  challengeFa: string;
  challengeEn: string;
  solutionFa: string;
  solutionEn: string;
  servicesFa: string[];
  deliverablesFa: string[];
  metricsFa: Array<{ value: string; label: string }>;
  colorGradient: string;
  accentColor: string;
  glowColor: string;
  imageUrl: string;
  secondaryImage: string;
  gallery: string[];
  liveUrl: string;
  featured: boolean;
  position: number;
  year: string;
  published: boolean;
  seoTitle: string;
  seoDescription: string;
}

const EMPTY_FORM: CaseStudyFormData = {
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
  previewType: "web",
  descriptionFa: "",
  descriptionEn: "",
  challengeFa: "",
  challengeEn: "",
  solutionFa: "",
  solutionEn: "",
  servicesFa: [],
  deliverablesFa: [],
  metricsFa: [],
  colorGradient: "from-[#0d1620] via-[#112338] to-[#081018]",
  accentColor: "#38bdf8",
  glowColor: "rgba(56, 189, 248, 0.15)",
  imageUrl: "",
  secondaryImage: "",
  gallery: [],
  liveUrl: "",
  featured: true,
  position: 0,
  year: "۲۰۲۵",
  published: true,
  seoTitle: "",
  seoDescription: "",
};

export default function AdminCaseStudiesPage() {
  const [items, setItems] = useState<AdminCaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CaseStudyFormData>(EMPTY_FORM);
  const [serviceInput, setServiceInput] = useState("");
  const [deliverableInput, setDeliverableInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<"image" | "secondary" | "gallery" | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const fetchItems = () => {
    adminFetch("/api/v1/casestudies", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setItems(data.sort((a, b) => (a.position ?? 0) - (b.position ?? 0)));
        }
      })
      .catch(() => setMessage({ type: "err", text: "خطا در دریافت لیست نمونه‌کارها" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ ...EMPTY_FORM, position: items.length });
    setServiceInput("");
    setDeliverableInput("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: AdminCaseStudy) => {
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
      previewType: item.previewType || "web",
      descriptionFa: item.descriptionFa || "",
      descriptionEn: item.descriptionEn || "",
      challengeFa: item.challengeFa || "",
      challengeEn: item.challengeEn || "",
      solutionFa: item.solutionFa || "",
      solutionEn: item.solutionEn || "",
      servicesFa: Array.isArray(item.servicesFa) ? item.servicesFa : [],
      deliverablesFa: Array.isArray(item.deliverablesFa) ? item.deliverablesFa : [],
      metricsFa: Array.isArray(item.metricsFa) ? item.metricsFa : [],
      colorGradient: item.colorGradient || "from-[#0d1620] via-[#112338] to-[#081018]",
      accentColor: item.accentColor || "#38bdf8",
      glowColor: item.glowColor || "rgba(56, 189, 248, 0.15)",
      imageUrl: item.imageUrl || "",
      secondaryImage: item.secondaryImage || "",
      gallery: Array.isArray(item.gallery) ? item.gallery : [],
      liveUrl: item.liveUrl || "",
      featured: item.featured !== false,
      position: item.position ?? 0,
      year: item.year || "۲۰۲۵",
      published: item.published !== false,
      seoTitle: item.seoTitle || "",
      seoDescription: item.seoDescription || "",
    });
    setServiceInput("");
    setDeliverableInput("");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titleFa || !formData.client) {
      setMessage({ type: "err", text: "عنوان پروژه و نام کارفرما الزامی هستند." });
      return;
    }

    setSaving(true);
    setMessage(null);

    const payload = {
      ...formData,
      slug: formData.slug || formData.clientEn.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    };

    try {
      const url = editingId ? `/api/v1/casestudies/${editingId}` : "/api/v1/casestudies";
      const method = editingId ? "PUT" : "POST";

      const res = await adminFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage({
          type: "ok",
          text: editingId ? "پروژه با موفقیت ویرایش شد." : "پروژه جدید با موفقیت افزوده شد.",
        });
        setIsModalOpen(false);
        fetchItems();
      } else {
        const err = await res.json().catch(() => null);
        setMessage({ type: "err", text: err?.error || "خطا در ذخیره پروژه." });
      }
    } catch {
      setMessage({ type: "err", text: "خطا در اتصال به سرور." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("آیا از حذف این پروژه اطمینان دارید؟")) return;

    try {
      const res = await adminFetch(`/api/v1/casestudies/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage({ type: "ok", text: "پروژه با موفقیت حذف شد." });
        fetchItems();
      } else {
        setMessage({ type: "err", text: "خطا در حذف پروژه." });
      }
    } catch {
      setMessage({ type: "err", text: "خطا در اتصال به سرور." });
    }
  };

  const handleMediaSelect = (item: MediaItem) => {
    if (pickerTarget === "image") {
      setFormData((prev) => ({ ...prev, imageUrl: item.url }));
    } else if (pickerTarget === "secondary") {
      setFormData((prev) => ({ ...prev, secondaryImage: item.url }));
    } else if (pickerTarget === "gallery") {
      setFormData((prev) => ({ ...prev, gallery: [...prev.gallery, item.url] }));
    }
    setPickerTarget(null);
  };

  const addMetric = () => {
    setFormData((prev) => ({
      ...prev,
      metricsFa: [...prev.metricsFa, { value: "", label: "" }],
    }));
  };

  const removeMetric = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      metricsFa: prev.metricsFa.filter((_, i) => i !== idx),
    }));
  };

  const updateMetric = (idx: number, field: "value" | "label", val: string) => {
    setFormData((prev) => {
      const copy = [...prev.metricsFa];
      copy[idx] = { ...copy[idx], [field]: val };
      return { ...prev, metricsFa: copy };
    });
  };

  return (
    <div className="space-y-8" dir="rtl">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#232c27] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">مدیریت کیس‌استادی‌ها و پروژه‌ها (Case Studies CMS)</h1>
          <p className="text-sm text-[#8fa397]">
            مدیریت کامل ویترین پروژه‌ها، گالری‌ها، چالش و راه‌حل، شاخص‌های خروجی و صفحات اختصاصی /portfolio
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
          <span>افزودن پروژه جدید</span>
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

      {/* ── Projects Table ── */}
      <div className="bg-[#131615] border border-[#1f2623] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-[#181d1a] text-[#8fa397] text-xs font-semibold uppercase border-b border-[#232c27]">
              <tr>
                <th className="px-6 py-4">ترتیب</th>
                <th className="px-6 py-4">کاور</th>
                <th className="px-6 py-4">کارفرما / برند</th>
                <th className="px-6 py-4">عنوان پروژه</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">وضعیت</th>
                <th className="px-6 py-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2623]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#8fa397]">
                    در حال بارگذاری لیست پروژه‌ها...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#8fa397]">
                    هیچ پروژه‌ای ثبت نشده است. از دکمه بالا برای افزودن پروژه جدید استفاده کنید.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-mono text-[#8fa397]">{item.position}</td>
                    <td className="px-6 py-4">
                      <div className="relative w-16 h-10 rounded-lg bg-white/5 border border-white/10 overflow-hidden">
                        {item.imageUrl ? (
                          <Image src={item.imageUrl} alt={item.titleFa} fill className="object-cover" />
                        ) : (
                          <span className="text-[10px] text-gray-500 flex items-center justify-center h-full">بدون کاور</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">
                      <div>{item.client}</div>
                      <div className="text-xs text-[#8fa397] font-mono mt-0.5" dir="ltr">
                        {item.clientEn}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white max-w-xs truncate">
                      <div>{item.titleFa}</div>
                      <div className="text-xs text-[#8fa397] truncate" dir="ltr">
                        {item.titleEn}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-emerald-400" dir="ltr">
                      {item.slug}
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
          <div className="bg-[#131615] border border-[#232c27] rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#232c27] pb-4">
              <h2 className="text-xl font-bold text-white">
                {editingId ? `ویرایش پروژه: ${formData.client}` : "افزودن پروژه جدید"}
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
              {/* Row 1: Client & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">نام کارفرما / برند (فارسی) *</label>
                  <input
                    type="text"
                    required
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-primary focus:outline-none"
                    placeholder="مثال: کلینیک تخصصی دکتر میراسماعیلی"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">Client Name (English)</label>
                  <input
                    type="text"
                    value={formData.clientEn}
                    onChange={(e) => setFormData({ ...formData, clientEn: e.target.value })}
                    className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-primary focus:outline-none"
                    dir="ltr"
                    placeholder="Dr. Miresmaili Clinic"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">Slug (آدرس یکتا) *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-primary focus:outline-none font-mono text-emerald-400"
                    dir="ltr"
                    placeholder="dr-miresmaeli-clinic"
                  />
                </div>
              </div>

              {/* Row 2: Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">عنوان فارسی پروژه *</label>
                  <input
                    type="text"
                    required
                    value={formData.titleFa}
                    onChange={(e) => setFormData({ ...formData, titleFa: e.target.value })}
                    className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-primary focus:outline-none"
                    placeholder="برندینگ دیجیتال، پرتال نوبت‌دهی و هویت سوشال"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">Project Title (English)</label>
                  <input
                    type="text"
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-primary focus:outline-none"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">دسته‌بندی (فارسی)</label>
                  <input
                    type="text"
                    value={formData.categoryFa}
                    onChange={(e) => setFormData({ ...formData, categoryFa: e.target.value })}
                    className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-primary focus:outline-none"
                    placeholder="طراحی سایت و پرتال"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">نوع پیش‌نمایش (Preview Type)</label>
                  <select
                    value={formData.previewType}
                    onChange={(e) => setFormData({ ...formData, previewType: e.target.value as any })}
                    className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3 py-2.5 focus:border-primary focus:outline-none"
                  >
                    <option value="web">وب‌سایت و پرتال (web)</option>
                    <option value="mobile">اپلیکیشن و موبایل (mobile)</option>
                    <option value="platform">پلتفرم و شبکه اجتماعی (platform)</option>
                  </select>
                </div>
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">شعار و خلاصه یک‌خطی (Tagline Fa)</label>
                <input
                  type="text"
                  value={formData.taglineFa}
                  onChange={(e) => setFormData({ ...formData, taglineFa: e.target.value })}
                  className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-primary focus:outline-none"
                />
              </div>

              {/* Challenge & Solution */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">چالش اولیه پروژه (Challenge Fa)</label>
                  <textarea
                    rows={3}
                    value={formData.challengeFa}
                    onChange={(e) => setFormData({ ...formData, challengeFa: e.target.value })}
                    className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-primary focus:outline-none"
                    placeholder="مسئله کارفرما پیش از پیاده‌سازی پروژه..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">راه‌حل و اجرای فنی تیم (Solution Fa)</label>
                  <textarea
                    rows={3}
                    value={formData.solutionFa}
                    onChange={(e) => setFormData({ ...formData, solutionFa: e.target.value })}
                    className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-primary focus:outline-none"
                    placeholder="رویکرد تیم آن‌ساپ در حل چالش و پیاده‌سازی..."
                  />
                </div>
              </div>

              {/* Media Picker Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">تصویر اصلی هیرو (Cover Image)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full bg-[#101413] border border-[#232c27] text-white text-xs rounded-lg px-2.5 py-2 focus:border-primary focus:outline-none"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setPickerTarget("image")}
                      className="px-3 py-2 rounded-lg bg-[#1f2623] text-xs text-emerald-400 shrink-0 font-bold"
                    >
                      انتخاب
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">نمای کامل صفحه (Fullpage Secondary Image)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.secondaryImage}
                      onChange={(e) => setFormData({ ...formData, secondaryImage: e.target.value })}
                      className="w-full bg-[#101413] border border-[#232c27] text-white text-xs rounded-lg px-2.5 py-2 focus:border-primary focus:outline-none"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setPickerTarget("secondary")}
                      className="px-3 py-2 rounded-lg bg-[#1f2623] text-xs text-emerald-400 shrink-0 font-bold"
                    >
                      انتخاب
                    </button>
                  </div>
                </div>
              </div>

              {/* Metrics Array */}
              <div className="p-4 rounded-xl bg-[#101413] border border-[#232c27] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">شاخص‌های نتایج پروژه (Metrics Strip)</span>
                  <button
                    type="button"
                    onClick={addMetric}
                    className="text-xs text-emerald-400 hover:underline"
                  >
                    + افزودن شاخص
                  </button>
                </div>
                {formData.metricsFa.map((m, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={m.value}
                      onChange={(e) => updateMetric(idx, "value", e.target.value)}
                      placeholder="مقدار (مثال: +۱۸۰٪)"
                      className="w-1/3 bg-[#181d1b] border border-[#2a3530] text-white text-xs rounded-lg px-2.5 py-1.5"
                    />
                    <input
                      type="text"
                      value={m.label}
                      onChange={(e) => updateMetric(idx, "label", e.target.value)}
                      placeholder="عنوان شاخص (مثال: افزایش لید آنلاین)"
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

              {/* Services & Deliverables Lists */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Services */}
                <div className="p-4 rounded-xl bg-[#101413] border border-[#232c27] space-y-2">
                  <label className="block text-xs font-bold text-white mb-1">خدمات ارائه‌شده در این پروژه</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={serviceInput}
                      onChange={(e) => setServiceInput(e.target.value)}
                      placeholder="مثال: طراحی وب‌سایت اختصاصی"
                      className="flex-1 bg-[#181d1b] border border-[#2a3530] text-white text-xs rounded-lg px-2.5 py-1.5"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (serviceInput.trim()) {
                          setFormData({ ...formData, servicesFa: [...formData.servicesFa, serviceInput.trim()] });
                          setServiceInput("");
                        }
                      }}
                      className="px-3 py-1.5 bg-[#1f2623] text-emerald-400 text-xs font-bold rounded-lg"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {formData.servicesFa.map((s, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-xs text-white">
                        <span>{s}</span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, servicesFa: formData.servicesFa.filter((_, i) => i !== idx) })}
                          className="text-red-400 text-[10px]"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Deliverables */}
                <div className="p-4 rounded-xl bg-[#101413] border border-[#232c27] space-y-2">
                  <label className="block text-xs font-bold text-white mb-1">خروجی‌ها و دستاوردهای تحویل‌شده</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={deliverableInput}
                      onChange={(e) => setDeliverableInput(e.target.value)}
                      placeholder="مثال: پرتال رزرو آنلاین و پنل مدیریت"
                      className="flex-1 bg-[#181d1b] border border-[#2a3530] text-white text-xs rounded-lg px-2.5 py-1.5"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (deliverableInput.trim()) {
                          setFormData({ ...formData, deliverablesFa: [...formData.deliverablesFa, deliverableInput.trim()] });
                          setDeliverableInput("");
                        }
                      }}
                      className="px-3 py-1.5 bg-[#1f2623] text-emerald-400 text-xs font-bold rounded-lg"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {formData.deliverablesFa.map((d, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-xs text-white">
                        <span>{d}</span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, deliverablesFa: formData.deliverablesFa.filter((_, i) => i !== idx) })}
                          className="text-red-400 text-[10px]"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Links & Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2 border-t border-[#232c27]">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">لینک اجرای زنده (Live URL)</label>
                  <input
                    type="url"
                    value={formData.liveUrl}
                    onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                    className="w-full bg-[#101413] border border-[#232c27] text-white text-xs rounded-lg px-3 py-2"
                    dir="ltr"
                    placeholder="https://drmiresmaeli.com/"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">ترتیب نمایش</label>
                  <input
                    type="number"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-[#101413] border border-[#232c27] text-white text-xs rounded-lg px-3 py-2 font-mono"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">وضعیت انتشار</label>
                  <select
                    value={formData.published ? "true" : "false"}
                    onChange={(e) => setFormData({ ...formData, published: e.target.value === "true" })}
                    className="w-full bg-[#101413] border border-[#232c27] text-white text-xs rounded-lg px-2.5 py-2"
                  >
                    <option value="true">منتشر شده (Published)</option>
                    <option value="false">پیش‌نویس (Draft)</option>
                  </select>
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
                  {saving ? "در حال ذخیره..." : "ذخیره پروژه"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker */}
      {pickerTarget && (
        <MediaPickerModal
          open={true}
          onClose={() => setPickerTarget(null)}
          onSelect={handleMediaSelect}
          
        />
      )}
    </div>
  );
}
