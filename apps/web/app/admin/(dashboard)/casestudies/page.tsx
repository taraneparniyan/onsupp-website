"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { adminFetch } from "@/lib/adminApi";
import MediaPickerModal, { type MediaItem } from "@/components/admin/MediaPickerModal";
import CategoryTemplateManager, {
  type AdminCategoryWithCount,
} from "@/components/admin/portfolio/CategoryTemplateManager";
import DynamicAttributesForm, {
  type AttributeValueItem,
} from "@/components/admin/portfolio/DynamicAttributesForm";

export type AdminCaseStudy = {
  id?: number;
  slug: string;
  client: string;
  clientEn: string;
  titleFa: string;
  titleEn: string;
  taglineFa: string;
  taglineEn: string;
  categoryId?: number | null;
  categoryIds?: number[];
  category?: AdminCategoryWithCount | null;
  categories?: AdminCategoryWithCount[];
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
  challengeFa: string;
  challengeEn: string;
  solutionFa: string;
  solutionEn: string;
  resultsFa: string;
  resultsEn: string;
  deliverablesFa: string[];
  deliverablesEn: string[];
  servicesFa: string[];
  servicesEn: string[];
  metricsFa: Array<{ value: string; label: string }>;
  attributeValues?: AttributeValueItem[];
  colorGradient: string;
  accentColor: string;
  glowColor: string;
  previewType: string;
  metaTitleFa: string;
  metaDescFa: string;
  keywords: string;
  ogImage: string;
  isPublished: boolean;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

const EMPTY_FORM: AdminCaseStudy = {
  slug: "",
  client: "",
  clientEn: "",
  titleFa: "",
  titleEn: "",
  taglineFa: "",
  taglineEn: "",
  categoryId: null,
  categoryIds: [],
  category: null,
  categories: [],
  categoryFa: "طراحی و توسعه وب",
  categoryEn: "Web Development",
  projectType: "website",
  descriptionFa: "",
  descriptionEn: "",
  imageUrl: null,
  secondaryImage: null,
  liveUrl: "https://",
  featured: true,
  position: 0,
  year: "۱۴۰۳",
  challengeFa: "",
  challengeEn: "",
  solutionFa: "",
  solutionEn: "",
  resultsFa: "",
  resultsEn: "",
  deliverablesFa: [],
  deliverablesEn: [],
  servicesFa: [],
  servicesEn: [],
  metricsFa: [],
  attributeValues: [],
  colorGradient: "from-[#1a1315] via-[#241a1e] to-[#100b0d]",
  accentColor: "#D4A5A8",
  glowColor: "rgba(212, 165, 168, 0.2)",
  previewType: "web",
  metaTitleFa: "",
  metaDescFa: "",
  keywords: "",
  ogImage: "",
  isPublished: true,
  status: "PUBLISHED",
};

export default function AdminCaseStudiesPage() {
  const [items, setItems] = useState<AdminCaseStudy[]>([]);
  const [categories, setCategories] = useState<AdminCategoryWithCount[]>([]);
  const [mainTab, setMainTab] = useState<"casestudies" | "categories">("casestudies");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<AdminCaseStudy>(EMPTY_FORM);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<
    "general" | "attributes" | "narrative" | "media" | "deliverables" | "seo"
  >("general");
  const [mediaPickerTarget, setMediaPickerTarget] = useState<"image" | "secondary" | "og" | null>(null);
  const [dynamicMediaTarget, setDynamicMediaTarget] = useState<{ key: string; subField?: "before" | "after" } | null>(null);
  const [deliverablesInput, setDeliverablesInput] = useState("");
  const [servicesInput, setServicesInput] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const notify = useCallback((type: "ok" | "err", text: string) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage((cur) => (cur?.text === text ? null : cur));
    }, 4500);
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const res = await adminFetch("/api/v1/portfolio/categories/admin", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch {
      // Ignore background category error
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [csRes, catRes] = await Promise.all([
        adminFetch("/api/v1/casestudies/all", { cache: "no-store" }),
        adminFetch("/api/v1/portfolio/categories/admin", { cache: "no-store" }),
      ]);

      if (csRes.ok) {
        const data = await csRes.json();
        setItems(data.sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0)));
      } else {
        notify("err", "خطا در دریافت لیست نمونه‌کارها");
      }

      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
      }
    } catch {
      notify("err", "خطای شبکه هنگام ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreateModal = () => {
    setEditingId(null);
    const defaultCat = categories.find((c) => c.slug === "website-design") || categories[0] || null;
    setFormData({
      ...EMPTY_FORM,
      position: items.length,
      categoryId: defaultCat ? defaultCat.id : null,
      categoryIds: defaultCat ? [defaultCat.id] : [],
      category: defaultCat,
      categories: defaultCat ? [defaultCat] : [],
      categoryFa: defaultCat ? defaultCat.titleFa : "طراحی و توسعه وب",
      categoryEn: defaultCat ? defaultCat.titleEn : "Web Development",
      attributeValues: [],
    });
    setCategorySearch("");
    setDeliverablesInput("");
    setServicesInput("");
    setModalTab("general");
    setIsModalOpen(true);
  };

  const openEditModal = (item: AdminCaseStudy) => {
    setEditingId(item.id || null);
    const rawIds = Array.isArray(item.categoryIds) && item.categoryIds.length > 0
      ? item.categoryIds
      : item.categoryId
      ? [item.categoryId]
      : [];
    const matchedCats = rawIds
      .map((id) => categories.find((c) => c.id === id) || item.categories?.find((c) => c.id === id))
      .filter((c): c is AdminCategoryWithCount => Boolean(c));
    const itemCat = matchedCats[0] || categories.find((c) => c.id === item.categoryId) || item.category || null;

    setFormData({
      ...item,
      categoryId: rawIds[0] ?? item.categoryId ?? null,
      categoryIds: rawIds,
      category: itemCat,
      categories: matchedCats,
      attributeValues: Array.isArray(item.attributeValues) ? item.attributeValues : [],
      deliverablesFa: Array.isArray(item.deliverablesFa) ? item.deliverablesFa : [],
      servicesFa: Array.isArray(item.servicesFa) ? item.servicesFa : [],
      metricsFa: Array.isArray(item.metricsFa) ? item.metricsFa : [],
    });
    setCategorySearch("");
    setDeliverablesInput(
      Array.isArray(item.deliverablesFa) ? item.deliverablesFa.join("\n") : ""
    );
    setServicesInput(
      Array.isArray(item.servicesFa) ? item.servicesFa.join("\n") : ""
    );
    setModalTab("general");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setDynamicMediaTarget(null);
  };

  const handleMediaSelect = (media: MediaItem) => {
    // 1. Dynamic Attribute Media Selection
    if (dynamicMediaTarget) {
      const { key, subField } = dynamicMediaTarget;
      const currentValues = formData.attributeValues || [];
      const existingIdx = currentValues.findIndex((v) => v.attributeKey === key);

      let nextValues = [...currentValues];
      if (subField === "before" || subField === "after") {
        const curJson = existingIdx >= 0 ? currentValues[existingIdx].valueJson || {} : {};
        const nextJson = {
          ...curJson,
          [subField === "before" ? "beforeImage" : "afterImage"]: media.url,
        };
        if (existingIdx >= 0) {
          nextValues[existingIdx] = {
            ...nextValues[existingIdx],
            valueJson: nextJson,
            valueText: "مقایسه قبل و بعد",
          };
        } else {
          nextValues.push({
            attributeKey: key,
            type: "BEFORE_AFTER",
            valueJson: nextJson,
            valueText: "مقایسه قبل و بعد",
          });
        }
      } else {
        if (existingIdx >= 0) {
          nextValues[existingIdx] = {
            ...nextValues[existingIdx],
            valueText: media.url,
          };
        } else {
          nextValues.push({
            attributeKey: key,
            type: "IMAGE",
            valueText: media.url,
          });
        }
      }

      setFormData((prev) => ({ ...prev, attributeValues: nextValues }));
      setDynamicMediaTarget(null);
      return;
    }

    // 2. Standard CaseStudy Media
    if (mediaPickerTarget === "image") {
      setFormData((prev) => ({ ...prev, imageUrl: media.url }));
    } else if (mediaPickerTarget === "secondary") {
      setFormData((prev) => ({ ...prev, secondaryImage: media.url }));
    } else if (mediaPickerTarget === "og") {
      setFormData((prev) => ({ ...prev, ogImage: media.url }));
    }
    setMediaPickerTarget(null);
  };

  const handleTogglePublish = async (item: AdminCaseStudy) => {
    if (!item.id) return;
    const nextStatus = !item.isPublished;
    try {
      const res = await adminFetch(`/api/v1/casestudies/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({
          isPublished: nextStatus,
          status: nextStatus ? "PUBLISHED" : "DRAFT",
        }),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((c) =>
            c.id === item.id
              ? { ...c, isPublished: nextStatus, status: nextStatus ? "PUBLISHED" : "DRAFT" }
              : c
          )
        );
        notify("ok", `وضعیت نمایش ${item.titleFa} تغییر یافت.`);
      } else {
        notify("err", "تغییر وضعیت ناموفق بود.");
      }
    } catch {
      notify("err", "خطای شبکه");
    }
  };

  const handleDelete = async (item: AdminCaseStudy) => {
    if (!item.id) return;
    if (!confirm(`آیا از حذف نمونه‌کار "${item.titleFa}" اطمینان دارید؟`)) return;

    try {
      const res = await adminFetch(`/api/v1/casestudies/${item.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setItems((prev) => prev.filter((c) => c.id !== item.id));
        notify("ok", `نمونه‌کار "${item.titleFa}" حذف گردید.`);
      } else {
        notify("err", "حذف ناموفق بود.");
      }
    } catch {
      notify("err", "خطای شبکه");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titleFa.trim() && !formData.titleEn.trim()) {
      notify("err", "عنوان نمونه‌کار الزامی است.");
      return;
    }

    // Validate Required Attributes across all Selected Categories
    const selectedCatIds = Array.isArray(formData.categoryIds) && formData.categoryIds.length > 0
      ? formData.categoryIds
      : formData.categoryId
      ? [formData.categoryId]
      : [];
    const activeCats = categories.filter((c) => selectedCatIds.includes(c.id));
    for (const activeCat of activeCats) {
      if (activeCat.attributes) {
        for (const attr of activeCat.attributes) {
          if (attr.isRequired && attr.isActive) {
            const val = formData.attributeValues?.find((v) => v.attributeKey === attr.key);
            const isMissing =
              !val ||
              ((val.valueText === null || val.valueText === undefined || val.valueText.trim() === "") &&
                (val.valueNumber === null || val.valueNumber === undefined) &&
                !val.valueJson);

            if (isMissing) {
              notify("err", `ویژگی الزامی «${attr.titleFa}» تکمیل نشده است.`);
              setModalTab("attributes");
              return;
            }
          }
        }
      }
    }

    setSaving(true);
    const isEdit = !!editingId;
    const endpoint = isEdit ? `/api/v1/casestudies/${editingId}` : "/api/v1/casestudies";
    const method = isEdit ? "PUT" : "POST";

    const parsedDeliverables = deliverablesInput
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedServices = servicesInput
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const slug = formData.slug.trim()
      ? formData.slug.trim().toLowerCase().replace(/[^a-z0-9\u0600-\u06FF-]+/g, "-")
      : (formData.titleEn || formData.titleFa)
          .toLowerCase()
          .replace(/[^a-z0-9\u0600-\u06FF-]+/g, "-")
          .replace(/^-+|-+$/g, "");

    const payload = {
      ...formData,
      slug,
      categoryIds: selectedCatIds,
      categoryId: selectedCatIds[0] ?? null,
      attributeValues: formData.attributeValues || [],
      deliverablesFa: parsedDeliverables,
      servicesFa: parsedServices,
      position: Number(formData.position) || 0,
      imageUrl: formData.imageUrl?.trim() || null,
      secondaryImage: formData.secondaryImage?.trim() || null,
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

      notify("ok", isEdit ? "تغییرات نمونه‌کار ذخیره شد." : "نمونه‌کار جدید با موفقیت ایجاد شد.");
      closeModal();
      loadData();
    } catch (err: any) {
      notify("err", err.message || "خطا در برقراری ارتباط");
    } finally {
      setSaving(false);
    }
  };

  // Metrics helper
  const addMetric = () => {
    setFormData((prev) => ({
      ...prev,
      metricsFa: [...prev.metricsFa, { value: "", label: "" }],
    }));
  };

  const updateMetric = (idx: number, key: "value" | "label", val: string) => {
    setFormData((prev) => ({
      ...prev,
      metricsFa: prev.metricsFa.map((m, i) => (i === idx ? { ...m, [key]: val } : m)),
    }));
  };

  const removeMetric = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      metricsFa: prev.metricsFa.filter((_, i) => i !== idx),
    }));
  };

  const filteredItems = items.filter((c) =>
    (c.titleFa + c.titleEn + c.client + c.categoryFa + c.slug)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const selectedCategoryIds = Array.isArray(formData.categoryIds)
    ? formData.categoryIds
    : formData.categoryId
    ? [formData.categoryId]
    : [];

  const selectedCategoryObjects = selectedCategoryIds
    .map((id) => categories.find((c) => c.id === id))
    .filter((c): c is AdminCategoryWithCount => Boolean(c));

  const selectedCategoryObj = selectedCategoryObjects[0]
    ? {
        ...selectedCategoryObjects[0],
        attributes: Array.from(
          new Map(
            selectedCategoryObjects
              .flatMap((c) => c.attributes || [])
              .map((attr) => [attr.key, attr])
          ).values()
        ),
      }
    : null;

  const toggleCategoryId = (catId: number) => {
    const nextIds = selectedCategoryIds.includes(catId)
      ? selectedCategoryIds.filter((id) => id !== catId)
      : [...selectedCategoryIds, catId];
    const nextCats = nextIds
      .map((id) => categories.find((c) => c.id === id))
      .filter((c): c is AdminCategoryWithCount => Boolean(c));
    setFormData((prev) => ({
      ...prev,
      categoryIds: nextIds,
      categories: nextCats,
      categoryId: nextIds[0] ?? null,
      category: nextCats[0] || null,
      categoryFa: nextCats.length > 0 ? nextCats.map((c) => c.titleFa).join("، ") : "",
      categoryEn: nextCats.length > 0 ? nextCats.map((c) => c.titleEn).join(", ") : "",
    }));
  };

  const filteredCategoryOptions = categories.filter((c) => {
    const q = categorySearch.trim().toLowerCase();
    if (!q) return true;
    return `${c.titleFa} ${c.titleEn} ${c.slug}`.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-8" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-mint/10 text-mint border border-mint/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </span>
            مدیریت نمونه‌کارها و سیستم CMS داینامیک
          </h1>
          <p className="text-sm text-muted mt-1">
            سیستم داینامیک دسته‌بندی‌محور، قالب‌های ویژگی هوشمند (KPI، قبل/بعد، مشخصات فنی)، و مستندات اختصاصی کیس‌استادی‌ها
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 rounded-xl bg-lime text-ink font-semibold hover:opacity-90 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            افزودن پروژه جدید
          </button>
        </div>
      </div>

      {/* Main Mode Tabs Switcher */}
      <div className="flex items-center gap-3 border-b border-border pb-2">
        <button
          type="button"
          onClick={() => setMainTab("casestudies")}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center gap-2.5 ${
            mainTab === "casestudies"
              ? "bg-lime text-ink shadow-sm"
              : "text-muted hover:text-foreground bg-panel border border-border hover:bg-raised"
          }`}
        >
          <span>📋</span>
          <span>لیست پروژه‌ها و کیس‌استادی‌ها</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-mono ${
              mainTab === "casestudies" ? "bg-black/15 text-ink" : "bg-raised text-muted"
            }`}
          >
            {items.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setMainTab("categories")}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center gap-2.5 ${
            mainTab === "categories"
              ? "bg-lime text-ink shadow-sm"
              : "text-muted hover:text-foreground bg-panel border border-border hover:bg-raised"
          }`}
        >
          <span>🗂️</span>
          <span>مدیریت دسته‌بندی‌ها و قالب‌های ویژگی</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-mono ${
              mainTab === "categories" ? "bg-black/15 text-ink" : "bg-raised text-muted"
            }`}
          >
            {categories.length}
          </span>
        </button>
      </div>

      {/* Notification Banner */}
      {message && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between border ${
            message.type === "ok"
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              : "bg-rose-500/10 text-rose-500 border-rose-500/20"
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-xs opacity-70 hover:opacity-100">
            بستن
          </button>
        </div>
      )}

      {/* ── TAB 1: CASE STUDIES LIST VIEW ── */}
      {mainTab === "casestudies" && (
        <div className="space-y-6">
          {/* Search & Stats Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-panel border border-border p-4 rounded-2xl">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجوی نام پروژه، کارفرما، دسته..."
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-mint transition-colors"
              />
              <svg className="w-4 h-4 text-muted absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="text-xs text-muted flex items-center gap-4">
              <span>تعداد کل: <strong className="text-foreground font-mono">{items.length}</strong></span>
              <span className="text-border">|</span>
              <span>پروژه‌های ویژه: <strong className="text-mint font-mono">{items.filter((c) => c.featured).length}</strong></span>
              <span className="text-border">|</span>
              <span>منتشر شده: <strong className="text-emerald-500 font-mono">{items.filter((c) => c.isPublished).length}</strong></span>
            </div>
          </div>

          {/* Table */}
          <div className="bg-panel border border-border rounded-2xl overflow-hidden backdrop-blur">
            {loading ? (
              <div className="py-20 text-center text-muted">
                <div className="inline-block w-8 h-8 border-2 border-mint border-t-transparent rounded-full animate-spin mb-3" />
                <p>در حال بارگذاری نمونه‌کارها...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-20 text-center text-muted">
                هیچ نمونه‌کاری یافت نشد. برای شروع «افزودن پروژه جدید» را بزنید.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="bg-raised/80 text-muted text-xs border-b border-border">
                    <tr>
                      <th className="py-3.5 px-4 font-medium">ترتیب</th>
                      <th className="py-3.5 px-4 font-medium">تصویر کاور</th>
                      <th className="py-3.5 px-4 font-medium">عنوان پروژه</th>
                      <th className="py-3.5 px-4 font-medium">کارفرما</th>
                      <th className="py-3.5 px-4 font-medium">دسته‌بندی داینامیک</th>
                      <th className="py-3.5 px-4 font-medium">فیلدهای ویژه</th>
                      <th className="py-3.5 px-4 font-medium">سال</th>
                      <th className="py-3.5 px-4 font-medium">ویژه</th>
                      <th className="py-3.5 px-4 font-medium">وضعیت</th>
                      <th className="py-3.5 px-4 font-medium text-left">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredItems.map((item, idx) => {
                      const catColor = item.category?.color || "#38534A";
                      const attrValCount = item.attributeValues?.length || 0;

                      return (
                        <tr key={item.id || idx} className="hover:bg-raised/40 transition-colors">
                          <td className="py-4 px-4 font-mono text-xs text-muted">{item.position ?? idx}</td>
                          <td className="py-4 px-4">
                            {item.imageUrl ? (
                              <div className="w-14 h-10 rounded-lg overflow-hidden relative border border-border bg-raised">
                                <Image src={item.imageUrl} alt={item.titleFa} fill className="object-cover" sizes="56px" />
                              </div>
                            ) : (
                              <div className="w-14 h-10 rounded-lg bg-raised border border-border flex items-center justify-center text-[10px] text-muted">
                                بدون عکس
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-semibold text-foreground">{item.titleFa}</div>
                            <a
                              href={`/portfolio/${item.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-mint hover:underline font-mono"
                            >
                              /portfolio/{item.slug}
                            </a>
                          </td>
                          <td className="py-4 px-4 text-muted">{item.client || "—"}</td>
                          <td className="py-4 px-4">
                            <span
                              className="px-2.5 py-1 rounded-md text-xs border inline-flex items-center gap-1.5 font-medium"
                              style={{
                                borderColor: `${catColor}50`,
                                backgroundColor: `${catColor}15`,
                                color: catColor,
                              }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catColor }} />
                              <span>{item.category?.titleFa || item.categoryFa}</span>
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-xs font-mono px-2 py-0.5 rounded bg-raised text-foreground border border-border">
                              {attrValCount} فیلد
                            </span>
                          </td>
                          <td className="py-4 px-4 font-mono text-xs text-muted">{item.year}</td>
                          <td className="py-4 px-4">
                            {item.featured ? (
                              <span className="px-2 py-0.5 rounded text-[11px] bg-amber-500/10 text-amber-500 border border-amber-500/30 font-medium">
                                ★ ویژه
                              </span>
                            ) : (
                              <span className="text-muted text-xs">—</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <button
                              onClick={() => handleTogglePublish(item)}
                              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                                item.isPublished
                                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20"
                              }`}
                            >
                              {item.isPublished ? "منتشر شده" : "پیش‌نویس"}
                            </button>
                          </td>
                          <td className="py-4 px-4 text-left">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditModal(item)}
                                className="px-3 py-1.5 rounded-lg bg-raised text-foreground text-xs hover:bg-mint/15 hover:text-mint border border-border transition-colors cursor-pointer"
                              >
                                ویرایش کامل
                              </button>
                              <button
                                onClick={() => handleDelete(item)}
                                className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-500 text-xs hover:bg-rose-500/20 border border-rose-500/20 transition-colors cursor-pointer"
                              >
                                حذف
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: CATEGORIES & TEMPLATES CMS VIEW ── */}
      {mainTab === "categories" && (
        <CategoryTemplateManager onCategoriesUpdated={loadCategories} />
      )}

      {/* ── CASE STUDY EDIT / CREATE MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-panel border border-border rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl relative">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-mint" />
                {editingId ? `ویرایش نمونه‌کار: ${formData.titleFa}` : "ایجاد نمونه‌کار جدید"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-muted hover:text-foreground text-sm p-1.5 rounded-lg bg-raised hover:opacity-80 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Subtabs */}
            <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto text-xs">
              <button
                type="button"
                onClick={() => setModalTab("general")}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  modalTab === "general"
                    ? "bg-mint/15 text-mint border border-mint/30"
                    : "text-muted hover:text-foreground"
                }`}
              >
                ۱. مشخصات کلی و دسته‌بندی
              </button>
              <button
                type="button"
                onClick={() => setModalTab("attributes")}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  modalTab === "attributes"
                    ? "bg-mint/15 text-mint border border-mint/30"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <span>۲. فیلدهای داینامیک</span>
                {selectedCategoryObj && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-mint/20 text-mint font-mono">
                    {selectedCategoryObj.attributes?.filter((a) => a.isActive).length || 0}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setModalTab("narrative")}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  modalTab === "narrative"
                    ? "bg-mint/15 text-mint border border-mint/30"
                    : "text-muted hover:text-foreground"
                }`}
              >
                ۳. چالش، راهکار و نتایج
              </button>
              <button
                type="button"
                onClick={() => setModalTab("media")}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  modalTab === "media"
                    ? "bg-mint/15 text-mint border border-mint/30"
                    : "text-muted hover:text-foreground"
                }`}
              >
                ۴. تصاویر و هویت بصری
              </button>
              <button
                type="button"
                onClick={() => setModalTab("deliverables")}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  modalTab === "deliverables"
                    ? "bg-mint/15 text-mint border border-mint/30"
                    : "text-muted hover:text-foreground"
                }`}
              >
                ۵. خروجی‌ها و شاخص‌ها ({formData.metricsFa.length})
              </button>
              <button
                type="button"
                onClick={() => setModalTab("seo")}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  modalTab === "seo"
                    ? "bg-mint/15 text-mint border border-mint/30"
                    : "text-muted hover:text-foreground"
                }`}
              >
                ۶. سئو و انتشار
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* TAB 1: GENERAL & CATEGORY */}
              {modalTab === "general" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1.5">
                        نام پروژه (فارسی) *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.titleFa}
                        onChange={(e) => setFormData({ ...formData, titleFa: e.target.value })}
                        placeholder="مثال: کلینیک دکتر میر اسماعیلی"
                        className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-mint"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1.5">
                        Project Title (English)
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={formData.titleEn}
                        onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                        placeholder="e.g. Dr. Miresmaeli Clinic"
                        className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-mint"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1.5">
                        نام کارفرما / برند (فارسی)
                      </label>
                      <input
                        type="text"
                        value={formData.client}
                        onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                        placeholder="کلینیک پوست و مو / هلدینگ کانزا"
                        className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-mint"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1.5">
                        Client Brand (English)
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={formData.clientEn}
                        onChange={(e) => setFormData({ ...formData, clientEn: e.target.value })}
                        placeholder="Dr. Miresmaeli Clinic"
                        className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-mint"
                      />
                    </div>
                  </div>

                  {/* Category Selection Dropdown */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1.5">
                        اسلاگ URL (Slug)
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="dr-miresmaeli-clinic"
                        className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground font-mono focus:outline-none focus:border-mint"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2.5" data-testid="portfolio-category-multiselect">
                      <label className="block text-xs font-medium text-muted flex items-center justify-between">
                        <span>دسته‌بندی نمونه‌کار (Portfolio Category — انتخاب چندگانه) *</span>
                        <span className="text-[10px] text-mint">
                          {selectedCategoryObjects.length} دسته‌بندی انتخاب‌شده
                        </span>
                      </label>

                      {/* Selected Category Chips with Independent Removal */}
                      {selectedCategoryObjects.length > 0 && (
                        <div className="flex flex-wrap gap-2 p-2.5 rounded-xl bg-panel border border-border">
                          {selectedCategoryObjects.map((cat) => (
                            <span
                              key={cat.id}
                              data-testid={`selected-category-chip-${cat.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-lime/20 text-foreground border border-primary/35 text-xs font-bold"
                            >
                              <span>{cat.titleFa}</span>
                              <button
                                type="button"
                                onClick={() => toggleCategoryId(cat.id)}
                                data-testid={`remove-category-${cat.id}`}
                                aria-label={`حذف دسته‌بندی ${cat.titleFa}`}
                                className="w-4 h-4 rounded-full hover:bg-rose-500/20 text-muted hover:text-rose-500 flex items-center justify-center text-[11px] leading-none cursor-pointer"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Search & Multi-Select Checkboxes */}
                      <div className="rounded-xl bg-raised border border-border p-3 space-y-2.5">
                        <input
                          type="text"
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          data-testid="portfolio-category-search"
                          placeholder="جستجوی دسته‌بندی..."
                          className="w-full bg-panel border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:border-mint"
                        />

                        <div className="max-h-44 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {filteredCategoryOptions.length === 0 ? (
                            <p className="text-xs text-muted col-span-full py-2 text-center">
                              دسته‌بندی مطابقی یافت نشد.
                            </p>
                          ) : (
                            filteredCategoryOptions.map((c) => {
                              const checked = selectedCategoryIds.includes(c.id);
                              return (
                                <label
                                  key={c.id}
                                  data-testid={`portfolio-category-option-${c.id}`}
                                  className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                                    checked
                                      ? "bg-mint/10 border-mint/40 text-foreground font-semibold"
                                      : "bg-panel border-border text-muted hover:text-foreground hover:border-primary/40"
                                  }`}
                                >
                                  <span className="flex items-center gap-2 min-w-0">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => toggleCategoryId(c.id)}
                                      className="w-4 h-4 rounded border-border accent-lime cursor-pointer shrink-0"
                                    />
                                    <span className="truncate">{c.titleFa}</span>
                                  </span>
                                  <span className="text-[10px] opacity-70 shrink-0">
                                    {c.attributes?.length || 0} فیلد
                                  </span>
                                </label>
                              );
                            })
                          )}
                        </div>
                      </div>

                      {editingId && selectedCategoryIds.length > 0 && (
                        <p className="text-[10px] text-muted">
                          فیلدهای داینامیک تمام دسته‌بندی‌های انتخاب‌شده در تب «فیلدهای داینامیک» نمایش داده می‌شوند.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1.5">
                        نوع پروژه (Project Type)
                      </label>
                      <select
                        value={formData.projectType}
                        onChange={(e) => setFormData({ ...formData, projectType: e.target.value as any })}
                        className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-mint"
                      >
                        <option value="website">وب‌سایت و پلتفرم (Website)</option>
                        <option value="app">اپلیکیشن کاربردی (App / SaaS)</option>
                        <option value="instagram">کمپین و استودیو (Creative / Social)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1.5">
                        لینک زنده پروژه (Live URL)
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={formData.liveUrl}
                        onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                        placeholder="https://..."
                        className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground font-mono focus:outline-none focus:border-mint"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1.5">
                        سال اجرا
                      </label>
                      <input
                        type="text"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        placeholder="۱۴۰۳ / ۲۰۲۴"
                        className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-mint"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border">
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1.5">
                        ترتیب نمایش (Position)
                      </label>
                      <input
                        type="number"
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value, 10) || 0 })}
                        className="w-full bg-raised border border-border rounded-xl px-4 py-2 text-sm text-foreground"
                      />
                    </div>
                    <div className="flex items-center gap-6 pt-6">
                      <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
                        <input
                          type="checkbox"
                          checked={formData.featured}
                          onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                          className="w-5 h-5 rounded bg-raised border-border accent-amber-500"
                        />
                        نمایش به عنوان پروژه ویژه (Featured)
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
                        <input
                          type="checkbox"
                          checked={formData.isPublished}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isPublished: e.target.checked,
                              status: e.target.checked ? "PUBLISHED" : "DRAFT",
                            })
                          }
                          className="w-5 h-5 rounded bg-raised border-border accent-[#38534a]"
                        />
                        منتشر شده در سایت
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: DYNAMIC ATTRIBUTES */}
              {modalTab === "attributes" && (
                <DynamicAttributesForm
                  category={selectedCategoryObj}
                  attributeValues={formData.attributeValues || []}
                  onChange={(nextValues) => setFormData({ ...formData, attributeValues: nextValues })}
                  onOpenMediaPicker={(key, subField) => {
                    setDynamicMediaTarget({ key, subField });
                  }}
                />
              )}

              {/* TAB 3: NARRATIVE */}
              {modalTab === "narrative" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1.5">
                      شعار / تگ‌لاین پروژه (Tagline Fa)
                    </label>
                    <input
                      type="text"
                      value={formData.taglineFa}
                      onChange={(e) => setFormData({ ...formData, taglineFa: e.target.value })}
                      placeholder="مهندسی مجدد هویت و پلتفرم برای نسل جدید کاربران"
                      className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-mint"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted mb-1.5">
                      خلاصه شرح پروژه (Description Fa)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.descriptionFa}
                      onChange={(e) => setFormData({ ...formData, descriptionFa: e.target.value })}
                      placeholder="مروری بر ماموریت و اهداف پروژه..."
                      className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-mint resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-border">
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1.5">
                        چالش اولیه پروژه (Challenge Fa)
                      </label>
                      <textarea
                        rows={6}
                        value={formData.challengeFa}
                        onChange={(e) => setFormData({ ...formData, challengeFa: e.target.value })}
                        placeholder="مسئله کارفرما چه بود؟ نقایص ساختاری یا افت شاخص‌ها..."
                        className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-mint resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1.5">
                        راهکار پیاده‌سازی شده (Solution Fa)
                      </label>
                      <textarea
                        rows={6}
                        value={formData.solutionFa}
                        onChange={(e) => setFormData({ ...formData, solutionFa: e.target.value })}
                        placeholder="چگونه با معماری اختصاصی و طراحی سیستم مسئله حل شد؟"
                        className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-mint resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1.5">
                        دستاوردهای نهایی (Results Fa)
                      </label>
                      <textarea
                        rows={6}
                        value={formData.resultsFa}
                        onChange={(e) => setFormData({ ...formData, resultsFa: e.target.value })}
                        placeholder="اثر نهایی پروژه بر شاخص‌ها و رشد پایدار برند..."
                        className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-mint resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: MEDIA & BRANDING */}
              {modalTab === "media" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1.5">
                        تصویر شاخص کاور (Main Cover Image)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          dir="ltr"
                          value={formData.imageUrl || ""}
                          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                          placeholder="/images/portfolio/... یا https://"
                          className="flex-1 bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground font-mono focus:outline-none focus:border-mint"
                        />
                        <button
                          type="button"
                          onClick={() => setMediaPickerTarget("image")}
                          className="px-4 py-2.5 bg-raised hover:opacity-80 text-foreground text-xs rounded-xl border border-border whitespace-nowrap cursor-pointer"
                        >
                          انتخاب رسانه
                        </button>
                      </div>
                      {formData.imageUrl && (
                        <div className="mt-3 relative w-48 h-28 rounded-xl overflow-hidden border border-border bg-black">
                          <Image src={formData.imageUrl} alt="کاور" fill className="object-cover" sizes="192px" />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted mb-1.5">
                        تصویر نمای پرتال / اسکرین‌شات بلند (Secondary / Fullpage)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          dir="ltr"
                          value={formData.secondaryImage || ""}
                          onChange={(e) => setFormData({ ...formData, secondaryImage: e.target.value })}
                          placeholder="/images/... یا https://"
                          className="flex-1 bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground font-mono focus:outline-none focus:border-mint"
                        />
                        <button
                          type="button"
                          onClick={() => setMediaPickerTarget("secondary")}
                          className="px-4 py-2.5 bg-raised hover:opacity-80 text-foreground text-xs rounded-xl border border-border whitespace-nowrap cursor-pointer"
                        >
                          انتخاب رسانه
                        </button>
                      </div>
                      {formData.secondaryImage && (
                        <div className="mt-3 relative w-48 h-28 rounded-xl overflow-hidden border border-border bg-black">
                          <Image src={formData.secondaryImage} alt="اسکرین‌شات" fill className="object-cover object-top" sizes="192px" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-border">
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1.5">
                        رنگ اکسنت (Accent Color)
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={formData.accentColor}
                        onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                        placeholder="#D4A5A8"
                        className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1.5">
                        نوع نمایشگر (Preview Type)
                      </label>
                      <select
                        value={formData.previewType}
                        onChange={(e) => setFormData({ ...formData, previewType: e.target.value })}
                        className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground"
                      >
                        <option value="web">پرتال وب (Web Browser Frame)</option>
                        <option value="mobile">موبایل / اپلیکیشن (Mobile Screen)</option>
                        <option value="platform">داشبورد و پلتفرم (Platform Console)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1.5">
                        هاله نورانی (Glow Color)
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={formData.glowColor}
                        onChange={(e) => setFormData({ ...formData, glowColor: e.target.value })}
                        placeholder="rgba(212, 165, 168, 0.2)"
                        className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: DELIVERABLES & LEGACY METRICS */}
              {modalTab === "deliverables" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1.5">
                        خروجی‌های تحویل‌شده (Deliverables Fa - هر خط یک مورد)
                      </label>
                      <textarea
                        rows={6}
                        value={deliverablesInput}
                        onChange={(e) => setDeliverablesInput(e.target.value)}
                        placeholder={`طراحی رابط کاربری دیزاین سیستم اختصاصی\nتوسعه فول‌استک Next.js 15\nپیاده‌سازی درگاه پرداخت آنلاین`}
                        className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-mint font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1.5">
                        خدمات ارائه‌شده (Services Fa - هر خط یک برچسب)
                      </label>
                      <textarea
                        rows={6}
                        value={servicesInput}
                        onChange={(e) => setServicesInput(e.target.value)}
                        placeholder={`طراحی وب‌سایت\nدیزاین سیستم\nسئو تکنیکال`}
                        className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-mint font-mono text-xs"
                      />
                    </div>
                  </div>

                  {/* Legacy Metrics */}
                  <div className="pt-4 border-t border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-foreground">
                          شاخص‌های کمی پیش‌فرض / فال‌بک (Fallback Metrics)
                        </h4>
                        <p className="text-xs text-muted">
                          این شاخص‌ها در صورتی نمایش داده می‌شوند که ویژگی‌های داینامیک در تب ۲ تعریف نشده باشند.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={addMetric}
                        className="px-3 py-1.5 rounded-lg bg-mint/15 text-mint hover:bg-mint/25 text-xs border border-mint/30 cursor-pointer"
                      >
                        + افزودن شاخص
                      </button>
                    </div>

                    <div className="space-y-2">
                      {formData.metricsFa.map((m, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <input
                            type="text"
                            value={m.value}
                            onChange={(e) => updateMetric(idx, "value", e.target.value)}
                            placeholder="مقدار (مثال: ۳.۴ برابر یا ۹۸٪)"
                            className="w-1/3 bg-raised border border-border rounded-xl px-3 py-2 text-sm text-foreground"
                          />
                          <input
                            type="text"
                            value={m.label}
                            onChange={(e) => updateMetric(idx, "label", e.target.value)}
                            placeholder="عنوان شاخص (مثال: نرخ تعامل ماهانه)"
                            className="flex-1 bg-raised border border-border rounded-xl px-3 py-2 text-sm text-foreground"
                          />
                          <button
                            type="button"
                            onClick={() => removeMetric(idx)}
                            className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg text-xs"
                          >
                            حذف
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: SEO & PUBLISHING */}
              {modalTab === "seo" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1.5">
                      عنوان متاتگ سئو (Meta Title Fa)
                    </label>
                    <input
                      type="text"
                      value={formData.metaTitleFa}
                      onChange={(e) => setFormData({ ...formData, metaTitleFa: e.target.value })}
                      placeholder="کیس‌استادی طراحی پلتفرم داریس | آژانس آن‌ساپ"
                      className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-mint"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted mb-1.5">
                      توضیحات متاتگ سئو (Meta Description Fa)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.metaDescFa}
                      onChange={(e) => setFormData({ ...formData, metaDescFa: e.target.value })}
                      placeholder="روایت مستند بازطراحی پلتفرم داریس، حل گلوگاه‌های فنی و دستیابی به رشد ۱۰۰ درصدی..."
                      className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-mint resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted mb-1.5">
                      کلمات کلیدی (Keywords - جدا شده با کاما)
                    </label>
                    <input
                      type="text"
                      value={formData.keywords}
                      onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                      placeholder="طراحی سایت، داریس، نمونه کار وب، سئو"
                      className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground"
                    />
                  </div>
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-raised border border-border text-muted hover:text-foreground text-sm font-medium transition-colors cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-lime text-ink text-sm font-semibold hover:opacity-90 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  {saving && (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  )}
                  {editingId ? "ذخیره تغییرات نمونه‌کار" : "ایجاد نمونه‌کار"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      {(mediaPickerTarget || dynamicMediaTarget) && (
        <MediaPickerModal
          open={true}
          onSelect={handleMediaSelect}
          onClose={() => {
            setMediaPickerTarget(null);
            setDynamicMediaTarget(null);
          }}
        />
      )}
    </div>
  );
}
