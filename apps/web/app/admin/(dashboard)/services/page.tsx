"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import MediaPickerModal, { type MediaItem } from "@/components/admin/MediaPickerModal";
import JoditWysiwyg, { type JoditWysiwygHandle } from "@/components/editor/JoditWysiwyg";
import { adminFetch } from "@/lib/adminApi";
import SeoPanel from "@/components/seo/SeoPanel";
import {
  createDefaultSeoConfig,
  mergeSeoConfig,
  type SeoConfig,
  type SeoLang,
  type SeoPanelValue,
} from "@/lib/seo/types";

export interface ServiceItem {
  id?: number;
  slug: string;
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  tagFa: string;
  tagEn: string;
  headlineFa: string;
  headlineEn: string;
  detailedNarrativeFa: string;
  detailedNarrativeEn: string;
  businessValueTitleFa: string;
  businessValueTitleEn: string;
  businessValueFa: string;
  businessValueEn: string;
  imageUrl: string | null;
  imageAlt: string | null;
  coverImage: string | null;
  badgeAccentFa: string;
  badgeAccentEn: string;
  ctaLabelFa: string;
  ctaLabelEn: string;
  subservices: Array<{ nameFa: string; nameEn?: string; descFa?: string }>;
  deliverablesFa: string[];
  deliverablesEn: string[];
  metrics: Array<{ valueFa: string; labelFa: string; descFa?: string }>;
  metaTitleFa: string;
  metaTitleEn?: string;
  metaDescFa: string;
  metaDescEn?: string;
  keywords: string;
  canonicalUrl?: string;
  ogImage?: string;
  focusKeyword?: string;
  secondaryKeywords?: string[];
  isPillar?: boolean;
  seoConfig?: SeoConfig;
  position: number;
  isPublished: boolean;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}

const EMPTY_SERVICE: ServiceItem = {
  slug: "",
  title: "",
  titleEn: "",
  subtitle: "",
  subtitleEn: "",
  tagFa: "خدمات دیجیتال",
  tagEn: "Digital Services",
  headlineFa: "",
  headlineEn: "",
  detailedNarrativeFa: "",
  detailedNarrativeEn: "",
  businessValueTitleFa: "ارزش تجاری و مزیت رقابتی",
  businessValueTitleEn: "Business Value & ROI",
  businessValueFa: "",
  businessValueEn: "",
  imageUrl: null,
  imageAlt: "",
  coverImage: null,
  badgeAccentFa: "راهکار سازمانی",
  badgeAccentEn: "Enterprise Solution",
  ctaLabelFa: "درخواست مشاوره تخصصی این خدمت",
  ctaLabelEn: "Request Service Consultation",
  subservices: [],
  deliverablesFa: [],
  deliverablesEn: [],
  metrics: [],
  metaTitleFa: "",
  metaTitleEn: "",
  metaDescFa: "",
  metaDescEn: "",
  keywords: "",
  canonicalUrl: "",
  ogImage: "",
  focusKeyword: "",
  secondaryKeywords: [],
  isPillar: false,
  seoConfig: createDefaultSeoConfig("service"),
  position: 0,
  isPublished: true,
  status: "PUBLISHED",
};

export default function ServicesAdminPage() {
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ServiceItem>(EMPTY_SERVICE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"general" | "narrative" | "media" | "deliverables" | "seo">("general");
  const [seoLang, setSeoLang] = useState<SeoLang>("fa");
  const [saving, setSaving] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<"imageUrl" | "coverImage" | "narrativeFa" | null>(null);
  const narrativeEditorRef = useRef<JoditWysiwygHandle>(null);
  const [deliverablesInput, setDeliverablesInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
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
      const res = await adminFetch("/api/v1/services/all", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setItems(data.sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0)));
      } else {
        notify("err", "خطا در دریافت لیست خدمات");
      }
    } catch {
      notify("err", "خطای ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      ...EMPTY_SERVICE,
      position: items.length,
    });
    setSeoLang("fa");
    setDeliverablesInput("");
    setModalTab("general");
    setIsModalOpen(true);
  };

  const openEditModal = (service: ServiceItem) => {
    setEditingId(service.id || null);
    setForm({
      ...EMPTY_SERVICE,
      ...service,
      subservices: Array.isArray(service.subservices) ? service.subservices : [],
      deliverablesFa: Array.isArray(service.deliverablesFa) ? service.deliverablesFa : [],
      metrics: Array.isArray(service.metrics) ? service.metrics : [],
      secondaryKeywords: Array.isArray(service.secondaryKeywords) ? service.secondaryKeywords : [],
      seoConfig: mergeSeoConfig(service.seoConfig, "service"),
    });
    setSeoLang("fa");
    setDeliverablesInput(
      Array.isArray(service.deliverablesFa) ? service.deliverablesFa.join("\n") : ""
    );
    setModalTab("general");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_SERVICE);
  };

  const handleMediaSelect = (media: MediaItem) => {
    if (pickerTarget === "imageUrl") {
      setForm((prev) => ({ ...prev, imageUrl: media.url, imageAlt: media.alt || prev.imageAlt }));
    } else if (pickerTarget === "coverImage") {
      setForm((prev) => ({ ...prev, coverImage: media.url }));
    } else if (pickerTarget === "narrativeFa") {
      narrativeEditorRef.current?.insertImage(media.url, media.alt || form.title || "تصویر خدمت");
    }
    setPickerTarget(null);
  };

  const handleTogglePublish = async (service: ServiceItem) => {
    if (!service.id) return;
    const nextStatus = !service.isPublished;
    try {
      const res = await adminFetch(`/api/v1/services/${service.id}`, {
        method: "PUT",
        body: JSON.stringify({
          isPublished: nextStatus,
          status: nextStatus ? "PUBLISHED" : "DRAFT",
        }),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((s) =>
            s.id === service.id
              ? { ...s, isPublished: nextStatus, status: nextStatus ? "PUBLISHED" : "DRAFT" }
              : s
          )
        );
        notify("ok", `وضعیت انتشار ${service.title} تغییر یافت.`);
      } else {
        notify("err", "تغییر وضعیت ناموفق بود.");
      }
    } catch {
      notify("err", "خطای شبکه");
    }
  };

  const handleDelete = async (service: ServiceItem) => {
    if (!service.id) return;
    if (!confirm(`خدمت "${service.title}" حذف شود؟`)) return;

    try {
      const res = await adminFetch(`/api/v1/services/${service.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setItems((prev) => prev.filter((s) => s.id !== service.id));
        notify("ok", `خدمت "${service.title}" با موفقیت حذف شد.`);
      } else {
        notify("err", "حذف خدمت ناموفق بود.");
      }
    } catch {
      notify("err", "خطای ارتباط با سرور");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() && !form.titleEn.trim()) {
      notify("err", "عنوان خدمت به فارسی یا انگلیسی الزامی است.");
      return;
    }

    setSaving(true);
    const isEdit = !!editingId;
    const endpoint = isEdit ? `/api/v1/services/${editingId}` : "/api/v1/services";
    const method = isEdit ? "PUT" : "POST";

    const parsedDeliverables = deliverablesInput
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const slug = form.slug.trim()
      ? form.slug.trim().toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
      : (form.titleEn || form.title)
          .toLowerCase()
          .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
          .replace(/^-+|-+$/g, "");

    const payload = {
      ...form,
      slug,
      deliverablesFa: parsedDeliverables,
      position: Number(form.position) || 0,
    };

    try {
      const res = await adminFetch(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "خطا در ذخیره خدمت");
      }

      notify("ok", isEdit ? "تغییرات خدمت ذخیره شد." : "خدمت جدید با موفقیت اضافه شد.");
      closeModal();
      loadItems();
    } catch (err: any) {
      notify("err", err.message || "خطا در برقراری ارتباط");
    } finally {
      setSaving(false);
    }
  };

  // Subservice items management inside modal
  const addSubservice = () => {
    setForm((prev) => ({
      ...prev,
      subservices: [...prev.subservices, { nameFa: "", descFa: "" }],
    }));
  };

  const updateSubservice = (idx: number, key: "nameFa" | "descFa", val: string) => {
    setForm((prev) => ({
      ...prev,
      subservices: prev.subservices.map((sub, i) => (i === idx ? { ...sub, [key]: val } : sub)),
    }));
  };

  const removeSubservice = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      subservices: prev.subservices.filter((_, i) => i !== idx),
    }));
  };

  // Metric items management inside modal
  const addMetric = () => {
    setForm((prev) => ({
      ...prev,
      metrics: [...prev.metrics, { valueFa: "", labelFa: "" }],
    }));
  };

  const updateMetric = (idx: number, key: "valueFa" | "labelFa", val: string) => {
    setForm((prev) => ({
      ...prev,
      metrics: prev.metrics.map((m, i) => (i === idx ? { ...m, [key]: val } : m)),
    }));
  };

  const removeMetric = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      metrics: prev.metrics.filter((_, i) => i !== idx),
    }));
  };

  const filteredItems = items.filter((s) =>
    (s.title + s.titleEn + s.slug + s.tagFa).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-primary/15 text-mint border border-primary/25">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </span>
            مدیریت خدمات و سرویس‌ها (Services CMS)
          </h1>
          <p className="text-sm text-muted mt-1">
            مدیریت کامل کارت‌های خدمات صفحه اصلی، صفحات اختصاصی هر سرویس (`/services/[slug]`)، دستاوردها و ارزش‌های تجاری
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 rounded-xl bg-lime text-ink font-bold hover:opacity-90 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            افزودن خدمت جدید
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {message && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between border ${
            message.type === "ok"
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40"
              : "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/40"
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-xs opacity-70 hover:opacity-100">
            بستن
          </button>
        </div>
      )}

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-panel border border-border p-4 rounded-2xl shadow-xs">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجوی عنوان، اسلاگ یا تگ..."
            className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder-muted focus:outline-none focus:border-primary transition-colors"
          />
          <svg className="w-4 h-4 text-muted absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="text-xs text-muted flex items-center gap-4">
          <span>تعداد کل: <strong className="text-foreground">{items.length}</strong></span>
          <span className="text-border">|</span>
          <span>منتشر شده: <strong className="text-emerald-600 dark:text-emerald-400">{items.filter((s) => s.isPublished).length}</strong></span>
          <span className="text-border">|</span>
          <span>پیش‌نویس: <strong className="text-amber-600 dark:text-amber-400">{items.filter((s) => !s.isPublished).length}</strong></span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-panel border border-border rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center text-muted">
            <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
            <p>در حال بارگذاری اطلاعات خدمات...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center text-muted">
            هیچ خدمتی یافت نشد. دکمه «افزودن خدمت جدید» را بزنید.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-raised text-muted text-xs border-b border-border">
                <tr>
                  <th className="py-3.5 px-4 font-medium">ردیف</th>
                  <th className="py-3.5 px-4 font-medium">تصویر</th>
                  <th className="py-3.5 px-4 font-medium">عنوان خدمت</th>
                  <th className="py-3.5 px-4 font-medium">دسته‌بندی / تگ</th>
                  <th className="py-3.5 px-4 font-medium">اسلاگ URL</th>
                  <th className="py-3.5 px-4 font-medium">وضعیت</th>
                  <th className="py-3.5 px-4 font-medium text-left">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredItems.map((service, idx) => (
                  <tr key={service.id || idx} className="hover:bg-raised/60 transition-colors">
                    <td className="py-4 px-4 font-mono text-xs text-muted">{service.position ?? idx}</td>
                    <td className="py-4 px-4">
                      {service.imageUrl || service.coverImage ? (
                        <div className="w-12 h-12 rounded-xl overflow-hidden relative border border-border bg-raised">
                          <Image
                            src={service.imageUrl || service.coverImage || ""}
                            alt={service.title}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-xs text-mint font-bold">
                          {service.title.slice(0, 2)}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-foreground">{service.title}</div>
                      <div className="text-xs text-muted font-mono mt-0.5">{service.titleEn}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-md text-xs bg-raised text-foreground border border-border">
                        {service.tagFa || "خدمات دیجیتال"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <a
                        href={`/services/${service.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-mono text-mint hover:underline"
                      >
                        /services/{service.slug}
                      </a>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleTogglePublish(service)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                          service.isPublished
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25"
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40 hover:bg-amber-500/25"
                        }`}
                      >
                        {service.isPublished ? "منتشر شده" : "پیش‌نویس"}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-left">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(service)}
                          className="px-3 py-1.5 rounded-lg bg-raised text-foreground text-xs hover:bg-primary/15 hover:text-mint border border-border transition-colors cursor-pointer"
                        >
                          ویرایش کامل
                        </button>
                        <button
                          onClick={() => handleDelete(service)}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/15 text-rose-700 dark:text-rose-300 text-xs hover:bg-rose-500/25 border border-rose-500/40 transition-colors cursor-pointer"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Comprehensive Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-panel border border-border rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                {editingId ? `ویرایش خدمت: ${form.title}` : "ایجاد خدمت جدید"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-muted hover:text-foreground text-sm p-1.5 rounded-lg bg-raised hover:bg-subtle cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Subtabs */}
            <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto text-xs">
              <button
                type="button"
                onClick={() => setModalTab("general")}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  modalTab === "general"
                    ? "bg-lime text-ink font-bold shadow-xs"
                    : "text-muted hover:text-foreground"
                }`}
              >
                ۱. عناوین و مشخصات پایه
              </button>
              <button
                type="button"
                onClick={() => setModalTab("narrative")}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  modalTab === "narrative"
                    ? "bg-lime text-ink font-bold shadow-xs"
                    : "text-muted hover:text-foreground"
                }`}
              >
                ۲. روایت و ارزش تجاری
              </button>
              <button
                type="button"
                onClick={() => setModalTab("media")}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  modalTab === "media"
                    ? "bg-lime text-ink font-bold shadow-xs"
                    : "text-muted hover:text-foreground"
                }`}
              >
                ۳. تصاویر و بنرها
              </button>
              <button
                type="button"
                onClick={() => setModalTab("deliverables")}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  modalTab === "deliverables"
                    ? "bg-lime text-ink font-bold shadow-xs"
                    : "text-muted hover:text-foreground"
                }`}
              >
                ۴. خروجی‌ها و زیرخدمات ({form.subservices.length})
              </button>
              <button
                type="button"
                onClick={() => setModalTab("seo")}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  modalTab === "seo"
                    ? "bg-lime text-ink font-bold shadow-xs"
                    : "text-muted hover:text-foreground"
                }`}
              >
                ۵. سئو و بهینه‌سازی
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              {/* TAB 1: GENERAL */}
              {modalTab === "general" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1.5">
                        عنوان خدمت (فارسی) *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="مثال: طراحی و مهندسی وب‌سایت‌های سازمانی"
                        className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1.5">
                        Service Title (English)
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={form.titleEn}
                        onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                        placeholder="Enterprise Web & Software Engineering"
                        className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1.5">
                        اسلاگ یکتای URL (Slug)
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        placeholder="web-design یا خالی بگذارید تا خودکار ایجاد شود"
                        className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground font-mono focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1.5">
                        برچسب دسته‌بندی (Tag Fa)
                      </label>
                      <input
                        type="text"
                        value={form.tagFa}
                        onChange={(e) => setForm({ ...form, tagFa: e.target.value })}
                        placeholder="توسعه وب / سئو / برندینگ"
                        className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1.5">
                        زیرعنوان خلاصه (Subtitle Fa)
                      </label>
                      <textarea
                        rows={2}
                        value={form.subtitle}
                        onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                        placeholder="توضیح کوتاه کارت صفحه اصلی..."
                        className="w-full bg-raised border border-border rounded-xl px-4 py-2 text-sm text-foreground resize-none focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1.5">
                        Subtitle (English)
                      </label>
                      <textarea
                        rows={2}
                        dir="ltr"
                        value={form.subtitleEn}
                        onChange={(e) => setForm({ ...form, subtitleEn: e.target.value })}
                        placeholder="Short card description for homepage..."
                        className="w-full bg-raised border border-border rounded-xl px-4 py-2 text-sm text-foreground resize-none focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border">
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1.5">ترتیب نمایش (Position)</label>
                      <input
                        type="number"
                        value={form.position}
                        onChange={(e) => setForm({ ...form, position: parseInt(e.target.value, 10) || 0 })}
                        className="w-full bg-raised border border-border rounded-xl px-4 py-2 text-sm text-foreground"
                      />
                    </div>
                    <div className="flex items-center gap-3 pt-6">
                      <input
                        type="checkbox"
                        id="srvPublished"
                        checked={form.isPublished}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            isPublished: e.target.checked,
                            status: e.target.checked ? "PUBLISHED" : "DRAFT",
                          })
                        }
                        className="w-5 h-5 rounded bg-raised border-border text-primary"
                      />
                      <label htmlFor="srvPublished" className="text-sm font-medium text-foreground cursor-pointer">
                        انتشار در وب‌سایت (قابل مشاهده برای کاربران عمومی)
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: NARRATIVE */}
              {modalTab === "narrative" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">
                      هدلاین استراتژیک صفحه اختصاصی (Headline Fa)
                    </label>
                    <input
                      type="text"
                      value={form.headlineFa}
                      onChange={(e) => setForm({ ...form, headlineFa: e.target.value })}
                      placeholder="مهندسی عملکردی، امنیت نفوذناپذیر و تجربه کاربری بی‌نقص"
                      className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div data-testid="service-narrative-editor">
                    <label className="block text-xs font-medium text-foreground mb-1.5">
                      شرح جامع و روایت عمیق خدمت (Detailed Narrative Fa)
                    </label>
                    <JoditWysiwyg
                      ref={narrativeEditorRef}
                      value={form.detailedNarrativeFa}
                      onChange={(newContent) =>
                        setForm((prev) => ({ ...prev, detailedNarrativeFa: newContent }))
                      }
                      placeholder="روایت کامل فرآیند، استانداردهای فنی و رویکرد آن‌ساپ در ارائه این خدمت..."
                      direction="rtl"
                      minHeight={340}
                      onOpenMediaPicker={() => {
                        narrativeEditorRef.current?.saveSelection();
                        setPickerTarget("narrativeFa");
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-border">
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1.5">
                        عنوان کارت ارزش تجاری (Business Value Title Fa)
                      </label>
                      <input
                        type="text"
                        value={form.businessValueTitleFa}
                        onChange={(e) => setForm({ ...form, businessValueTitleFa: e.target.value })}
                        placeholder="مزیت رقابتی و بازگشت سرمایه"
                        className="w-full bg-raised border border-border rounded-xl px-4 py-2 text-sm text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1.5">
                        متن دکمه مشاوره (CTA Label Fa)
                      </label>
                      <input
                        type="text"
                        value={form.ctaLabelFa}
                        onChange={(e) => setForm({ ...form, ctaLabelFa: e.target.value })}
                        placeholder="درخواست مشاوره تخصصی این خدمت"
                        className="w-full bg-raised border border-border rounded-xl px-4 py-2 text-sm text-foreground"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">
                      شرح ارزش تجاری (Business Value Fa)
                    </label>
                    <textarea
                      rows={3}
                      value={form.businessValueFa}
                      onChange={(e) => setForm({ ...form, businessValueFa: e.target.value })}
                      placeholder="این خدمت چگونه نرخ تبدیل، سئو و رشد درآمدی سازمان مشتری را تسریع می‌کند..."
                      className="w-full bg-raised border border-border rounded-xl px-4 py-2 text-sm text-foreground resize-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: MEDIA */}
              {modalTab === "media" && (
                <div className="space-y-6">
                  {/* Thumbnail / Image */}
                  <div className="p-4 rounded-2xl bg-raised border border-border space-y-3">
                    <label className="block text-xs font-semibold text-foreground">
                      تصویر آیکون / پیش‌نمایش کارت (Thumbnail Image)
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {form.imageUrl ? (
                        <div className="w-20 h-20 rounded-xl overflow-hidden relative border border-primary/40 bg-panel shrink-0">
                          <Image src={form.imageUrl} alt={form.imageAlt || "Thumbnail"} fill className="object-cover" sizes="80px" />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-xl border border-dashed border-border bg-panel flex items-center justify-center text-xs text-muted shrink-0">
                          بدون تصویر
                        </div>
                      )}
                      <div className="flex-1 space-y-2 w-full">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            dir="ltr"
                            value={form.imageUrl || ""}
                            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                            placeholder="مسیر فایل یا انتخاب از کتابخانه..."
                            className="flex-1 bg-panel border border-border rounded-xl px-3 py-2 text-xs text-foreground font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setPickerTarget("imageUrl")}
                            className="px-4 py-2 rounded-xl bg-primary/15 text-mint border border-primary/30 text-xs font-bold hover:bg-primary/25 cursor-pointer"
                          >
                            انتخاب رسانه
                          </button>
                        </div>
                        <input
                          type="text"
                          value={form.imageAlt || ""}
                          onChange={(e) => setForm({ ...form, imageAlt: e.target.value })}
                          placeholder="متن جایگزین (Alt)..."
                          className="w-full bg-panel border border-border rounded-xl px-3 py-1.5 text-xs text-foreground"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Cover Banner */}
                  <div className="p-4 rounded-2xl bg-raised border border-border space-y-3">
                    <label className="block text-xs font-semibold text-foreground">
                      تصویر کاور هیرو اختصاصی (Cover Banner)
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {form.coverImage ? (
                        <div className="w-32 h-20 rounded-xl overflow-hidden relative border border-primary/40 bg-panel shrink-0">
                          <Image src={form.coverImage} alt="Cover Banner" fill className="object-cover" sizes="128px" />
                        </div>
                      ) : (
                        <div className="w-32 h-20 rounded-xl border border-dashed border-border bg-panel flex items-center justify-center text-xs text-muted shrink-0">
                          بدون کاور
                        </div>
                      )}
                      <div className="flex-1 space-y-2 w-full">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            dir="ltr"
                            value={form.coverImage || ""}
                            onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                            placeholder="مسیر بنر عریض..."
                            className="flex-1 bg-panel border border-border rounded-xl px-3 py-2 text-xs text-foreground font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setPickerTarget("coverImage")}
                            className="px-4 py-2 rounded-xl bg-primary/15 text-mint border border-primary/30 text-xs font-bold hover:bg-primary/25 cursor-pointer"
                          >
                            انتخاب رسانه
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: DELIVERABLES & SUBSERVICES */}
              {modalTab === "deliverables" && (
                <div className="space-y-6">
                  {/* Deliverables */}
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">
                      خروجی‌ها و تحویل‌دادنی‌های اصلی خدمت (هر مورد در یک خط)
                    </label>
                    <textarea
                      rows={4}
                      value={deliverablesInput}
                      onChange={(e) => setDeliverablesInput(e.target.value)}
                      placeholder={"معماری سیستم و دیتابیس توزیع‌شده\nکدنویسی تمیز با TypeScript و تست کامل\nپنل مدیریت اختصاصی و سفارشی‌سازی‌شده"}
                      className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground font-mono focus:outline-none focus:border-primary resize-none"
                    />
                  </div>

                  {/* Subservices list */}
                  <div className="space-y-3 pt-3 border-t border-border">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-medium text-foreground">
                        زیرمجموعه‌ها و شاخه‌های تخصصی (Subservices)
                      </label>
                      <button
                        type="button"
                        onClick={addSubservice}
                        className="text-xs text-mint hover:underline font-bold cursor-pointer"
                      >
                        + افزودن زیرسرویس
                      </button>
                    </div>

                    <div className="space-y-2">
                      {form.subservices.map((sub, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={sub.nameFa}
                            onChange={(e) => updateSubservice(idx, "nameFa", e.target.value)}
                            placeholder="عنوان زیرسرویس (مثال: طراحی رابط کاربری UI/UX)"
                            className="w-1/3 bg-raised border border-border rounded-xl px-3 py-2 text-xs text-foreground"
                          />
                          <input
                            type="text"
                            value={sub.descFa || ""}
                            onChange={(e) => updateSubservice(idx, "descFa", e.target.value)}
                            placeholder="توضیح کوتاه شاخه..."
                            className="flex-1 bg-raised border border-border rounded-xl px-3 py-2 text-xs text-foreground"
                          />
                          <button
                            type="button"
                            onClick={() => removeSubservice(idx)}
                            className="p-2 text-burgundy hover:bg-rose-500/15 rounded-xl text-xs cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Metrics KPI */}
                  <div className="space-y-3 pt-3 border-t border-border">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-medium text-foreground">
                        شاخص‌های کلیدی عملکرد (KPI Metrics)
                      </label>
                      <button
                        type="button"
                        onClick={addMetric}
                        className="text-xs text-mint hover:underline font-bold cursor-pointer"
                      >
                        + افزودن متریک
                      </button>
                    </div>

                    <div className="space-y-2">
                      {form.metrics.map((met, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={met.valueFa}
                            onChange={(e) => updateMetric(idx, "valueFa", e.target.value)}
                            placeholder="مقدار (مثال: +۴۰٪ یا ۹۹.۹٪)"
                            className="w-1/4 bg-raised border border-border rounded-xl px-3 py-2 text-xs text-foreground"
                          />
                          <input
                            type="text"
                            value={met.labelFa}
                            onChange={(e) => updateMetric(idx, "labelFa", e.target.value)}
                            placeholder="عنوان شاخص (مثال: افزایش نرخ تبدیل یا Uptime)"
                            className="flex-1 bg-raised border border-border rounded-xl px-3 py-2 text-xs text-foreground"
                          />
                          <button
                            type="button"
                            onClick={() => removeMetric(idx)}
                            className="p-2 text-burgundy hover:bg-rose-500/15 rounded-xl text-xs cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: SEO */}
              {modalTab === "seo" && (() => {
                const currentConfig = mergeSeoConfig(form.seoConfig, "service");
                const faLocale = currentConfig.locales?.fa;
                const enLocale = currentConfig.locales?.en;

                const seoValue: SeoPanelValue =
                  seoLang === "en"
                    ? {
                        focusKeyword: enLocale?.focusKeyword || "",
                        secondaryKeywords: Array.isArray(enLocale?.secondaryKeywords)
                          ? enLocale.secondaryKeywords
                          : [],
                        metaTitle: form.metaTitleEn || enLocale?.metaTitle || "",
                        metaDesc: form.metaDescEn || enLocale?.metaDesc || "",
                        slug: form.slug || "",
                        canonicalUrl: enLocale?.canonicalUrl || "",
                        ogImage: form.ogImage || form.coverImage || form.imageUrl || "",
                        isPillar: Boolean(enLocale?.isPillar),
                        seoConfig: {
                          ...currentConfig,
                          robots: {
                            ...currentConfig.robots,
                            ...(enLocale?.robots || {}),
                          },
                        },
                      }
                    : {
                        focusKeyword: form.focusKeyword || faLocale?.focusKeyword || "",
                        secondaryKeywords:
                          Array.isArray(form.secondaryKeywords) && form.secondaryKeywords.length > 0
                            ? form.secondaryKeywords
                            : Array.isArray(faLocale?.secondaryKeywords)
                            ? faLocale.secondaryKeywords
                            : [],
                        metaTitle: form.metaTitleFa || "",
                        metaDesc: form.metaDescFa || "",
                        slug: form.slug || "",
                        canonicalUrl: form.canonicalUrl || faLocale?.canonicalUrl || "",
                        ogImage: form.ogImage || form.coverImage || form.imageUrl || "",
                        isPillar: Boolean(form.isPillar),
                        seoConfig: {
                          ...currentConfig,
                          robots: {
                            ...currentConfig.robots,
                            ...(faLocale?.robots || {}),
                          },
                        },
                      };

                const handleSeoChange = (next: SeoPanelValue) => {
                  setForm((prev) => {
                    const prevCfg = mergeSeoConfig(prev.seoConfig, "service");
                    if (seoLang === "en") {
                      return {
                        ...prev,
                        slug: next.slug,
                        metaTitleEn: next.metaTitle,
                        metaDescEn: next.metaDesc,
                        ogImage: next.ogImage,
                        seoConfig: {
                          ...next.seoConfig,
                          robots: prevCfg.robots,
                          locales: {
                            ...prevCfg.locales,
                            en: {
                              focusKeyword: next.focusKeyword,
                              secondaryKeywords: next.secondaryKeywords,
                              metaTitle: next.metaTitle,
                              metaDesc: next.metaDesc,
                              canonicalUrl: next.canonicalUrl,
                              isPillar: next.isPillar,
                              robots: {
                                index: next.seoConfig.robots.index,
                                follow: next.seoConfig.robots.follow,
                              },
                            },
                          },
                        },
                      };
                    }

                    return {
                      ...prev,
                      slug: next.slug,
                      focusKeyword: next.focusKeyword,
                      secondaryKeywords: next.secondaryKeywords,
                      keywords:
                        next.secondaryKeywords.length > 0
                          ? [next.focusKeyword, ...next.secondaryKeywords].filter(Boolean).join(", ")
                          : prev.keywords,
                      metaTitleFa: next.metaTitle,
                      metaDescFa: next.metaDesc,
                      canonicalUrl: next.canonicalUrl,
                      ogImage: next.ogImage,
                      isPillar: next.isPillar,
                      seoConfig: {
                        ...next.seoConfig,
                        locales: {
                          ...prevCfg.locales,
                          fa: {
                            focusKeyword: next.focusKeyword,
                            secondaryKeywords: next.secondaryKeywords,
                            metaTitle: next.metaTitle,
                            metaDesc: next.metaDesc,
                            canonicalUrl: next.canonicalUrl,
                            isPillar: next.isPillar,
                            robots: {
                              index: next.seoConfig.robots.index,
                              follow: next.seoConfig.robots.follow,
                            },
                          },
                        },
                      },
                    };
                  });
                };

                return (
                  <SeoPanel
                    entityType="service"
                    activeLanguage={seoLang}
                    allowLanguageSwitch={true}
                    onLanguageChange={setSeoLang}
                    value={seoValue}
                    onChange={handleSeoChange}
                    contentContext={{
                      title: seoLang === "en" ? form.titleEn || form.title : form.title,
                      excerpt: seoLang === "en" ? form.subtitleEn || form.subtitle : form.subtitle,
                      contentHtml:
                        seoLang === "en"
                          ? [form.headlineEn, form.detailedNarrativeEn, form.businessValueEn]
                              .filter(Boolean)
                              .join("\n")
                          : [form.headlineFa, form.detailedNarrativeFa, form.businessValueFa]
                              .filter(Boolean)
                              .join("\n"),
                      coverImageUrl: form.coverImage || form.imageUrl,
                      coverImageAlt: form.imageAlt || form.title,
                      siteName: seoLang === "en" ? "OnSupp" : "آن‌ساپ",
                      siteUrl: "https://onsupp.ir",
                    }}
                  />
                );
              })()}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-raised text-foreground border border-border text-sm font-medium hover:bg-subtle transition-colors cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-lime text-ink text-sm font-bold hover:opacity-90 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  {saving && (
                    <div className="w-4 h-4 border-2 border-ink border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {editingId ? "ذخیره تغییرات خدمت" : "ایجاد خدمت"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      {pickerTarget && (
        <MediaPickerModal
          open={true}
          onSelect={handleMediaSelect}
          onClose={() => setPickerTarget(null)}
        />
      )}
    </div>
  );
}
