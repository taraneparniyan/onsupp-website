"use client";

import React, { useState, useEffect, useCallback } from "react";
import { adminFetch } from "@/lib/adminApi";
import type {
  PortfolioCategory,
  PortfolioAttributeTemplate,
  AttributeType,
} from "./DynamicAttributesForm";

export type AdminCategoryWithCount = PortfolioCategory & {
  descriptionFa?: string;
  descriptionEn?: string;
  icon?: string;
  position: number;
  isActive: boolean;
  attributes: PortfolioAttributeTemplate[];
  _count?: {
    caseStudies: number;
    attributes: number;
  };
};

const EMPTY_CAT_FORM: {
  id?: number;
  slug: string;
  titleFa: string;
  titleEn: string;
  descriptionFa: string;
  descriptionEn: string;
  icon: string;
  color: string;
  position: number;
  isActive: boolean;
} = {
  slug: "",
  titleFa: "",
  titleEn: "",
  descriptionFa: "",
  descriptionEn: "",
  icon: "folder",
  color: "#38534A",
  position: 0,
  isActive: true,
};

const EMPTY_ATTR_FORM: {
  id?: number;
  categoryId: number;
  key: string;
  titleFa: string;
  titleEn: string;
  descriptionFa: string;
  descriptionEn: string;
  type: AttributeType;
  isRequired: boolean;
  unit: string;
  showInFrontend: boolean;
  position: number;
  isActive: boolean;
  options?: any;
} = {
  categoryId: 0,
  key: "",
  titleFa: "",
  titleEn: "",
  descriptionFa: "",
  descriptionEn: "",
  type: "TEXT",
  isRequired: false,
  unit: "",
  showInFrontend: true,
  position: 0,
  isActive: true,
  options: { choices: [] },
};

const ATTRIBUTE_TYPE_COLORS: Record<AttributeType, string> = {
  TEXT: "bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/30",
  NUMBER: "bg-primary/15 text-primary border-primary/30",
  PERCENTAGE: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30",
  IMAGE: "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30",
  LINK: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border-cyan-500/30",
  BEFORE_AFTER: "bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30",
  TEXTAREA: "bg-teal-500/15 text-teal-600 dark:text-teal-300 border-teal-500/30",
  SELECT: "bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30",
  MULTI_SELECT: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border-indigo-500/30",
  BOOLEAN: "bg-lime/20 text-lime-800 dark:text-lime-300 border-lime/40",
};

const PRESET_COLORS = [
  "#38534A", // OnSupp Brand Green
  "#4F0001", // OnSupp Burgundy
  "#1F1F1E", // OnSupp Charcoal
  "#2f6f58", // Forest Sage
  "#0f766e", // Deep Teal
  "#b45309", // Warm Amber
  "#1d4ed8", // Slate Blue
  "#be123c", // Crimson Rose
];

interface CategoryTemplateManagerProps {
  onCategoriesUpdated?: () => void;
}

export default function CategoryTemplateManager({
  onCategoriesUpdated,
}: CategoryTemplateManagerProps) {
  const [categories, setCategories] = useState<AdminCategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCatId, setExpandedCatId] = useState<number | null>(null);
  const [showPreviewForId, setShowPreviewForId] = useState<number | null>(null);

  // Category Modal State
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [catFormData, setCatFormData] = useState(EMPTY_CAT_FORM);
  const [catSaving, setCatSaving] = useState(false);

  // Attribute Modal State
  const [attrModalOpen, setAttrModalOpen] = useState(false);
  const [attrFormData, setAttrFormData] = useState(EMPTY_ATTR_FORM);
  const [attrSaving, setAttrSaving] = useState(false);

  // Messages
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const notify = useCallback((type: "ok" | "err", text: string) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage((cur) => (cur?.text === text ? null : cur));
    }, 4500);
  }, []);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/v1/portfolio/categories/admin", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
        if (onCategoriesUpdated) onCategoriesUpdated();
      } else {
        notify("err", "خطا در دریافت لیست دسته‌بندی‌ها");
      }
    } catch {
      notify("err", "خطای ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  }, [notify, onCategoriesUpdated]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // ── Category Handlers ──
  const openCreateCategory = () => {
    setCatFormData({
      ...EMPTY_CAT_FORM,
      position: categories.length,
    });
    setCatModalOpen(true);
  };

  const openEditCategory = (cat: AdminCategoryWithCount) => {
    setCatFormData({
      id: cat.id,
      slug: cat.slug,
      titleFa: cat.titleFa,
      titleEn: cat.titleEn,
      descriptionFa: cat.descriptionFa || "",
      descriptionEn: cat.descriptionEn || "",
      icon: cat.icon || "folder",
      color: cat.color || "#38534A",
      position: cat.position,
      isActive: cat.isActive,
    });
    setCatModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catFormData.titleFa.trim()) {
      notify("err", "عنوان دسته‌بندی الزامی است");
      return;
    }

    setCatSaving(true);
    const isEdit = !!catFormData.id;
    const url = isEdit
      ? `/api/v1/portfolio/categories/${catFormData.id}`
      : "/api/v1/portfolio/categories";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await adminFetch(url, {
        method,
        body: JSON.stringify(catFormData),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "ذخیره دسته‌بندی ناموفق بود");
      }

      notify("ok", isEdit ? "تغییرات دسته‌بندی ذخیره شد" : "دسته‌بندی جدید با موفقیت ایجاد شد");
      setCatModalOpen(false);
      loadCategories();
    } catch (err: any) {
      notify("err", err.message || "خطا در برقراری ارتباط");
    } finally {
      setCatSaving(false);
    }
  };

  const handleToggleCategoryActive = async (cat: AdminCategoryWithCount) => {
    try {
      const res = await adminFetch(`/api/v1/portfolio/categories/${cat.id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !cat.isActive }),
      });
      if (res.ok) {
        setCategories((prev) =>
          prev.map((c) => (c.id === cat.id ? { ...c, isActive: !cat.isActive } : c))
        );
        notify("ok", `وضعیت ${cat.titleFa} بروزرسانی شد`);
      }
    } catch {
      notify("err", "خطا در تغییر وضعیت دسته‌بندی");
    }
  };

  const handleDeleteCategory = async (cat: AdminCategoryWithCount) => {
    const projectCount = cat._count?.caseStudies ?? 0;
    const warnMsg =
      projectCount > 0
        ? `این دسته‌بندی به ${projectCount} نمونه‌کار متصل است. در صورت حذف، ارتباط دسته‌بندی با این پروژه‌ها قطع می‌شود اما پروژه‌ها حذف نخواهند شد. آیا اطمینان دارید؟`
        : `آیا از حذف دسته‌بندی «${cat.titleFa}» اطمینان دارید؟`;

    if (!confirm(warnMsg)) return;

    try {
      const res = await adminFetch(`/api/v1/portfolio/categories/${cat.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== cat.id));
        if (expandedCatId === cat.id) setExpandedCatId(null);
        notify("ok", `دسته‌بندی «${cat.titleFa}» حذف شد`);
      } else {
        const err = await res.json().catch(() => ({}));
        notify("err", err.error || "حذف دسته‌بندی ناموفق بود");
      }
    } catch {
      notify("err", "خطای شبکه");
    }
  };

  // ── Attribute Template Handlers ──
  const openCreateAttribute = (categoryId: number) => {
    const cat = categories.find((c) => c.id === categoryId);
    setAttrFormData({
      ...EMPTY_ATTR_FORM,
      categoryId,
      position: cat?.attributes?.length || 0,
    });
    setAttrModalOpen(true);
  };

  const openEditAttribute = (attr: PortfolioAttributeTemplate) => {
    setAttrFormData({
      id: attr.id,
      categoryId: attr.categoryId,
      key: attr.key,
      titleFa: attr.titleFa,
      titleEn: attr.titleEn,
      descriptionFa: attr.descriptionFa || "",
      descriptionEn: attr.descriptionEn || "",
      type: attr.type,
      isRequired: attr.isRequired,
      unit: attr.unit || "",
      showInFrontend: attr.showInFrontend,
      position: attr.position,
      isActive: attr.isActive,
      options: attr.options || { choices: [] },
    });
    setAttrModalOpen(true);
  };

  const handleSaveAttribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attrFormData.key.trim() || !attrFormData.titleFa.trim()) {
      notify("err", "کلید شناسه (Key) و عنوان ویژگی الزامی هستند");
      return;
    }

    setAttrSaving(true);
    const isEdit = !!attrFormData.id;
    const url = isEdit
      ? `/api/v1/portfolio/categories/attributes/${attrFormData.id}`
      : `/api/v1/portfolio/categories/${attrFormData.categoryId}/attributes`;
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await adminFetch(url, {
        method,
        body: JSON.stringify(attrFormData),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "ذخیره ویژگی ناموفق بود");
      }

      notify("ok", isEdit ? "ویژگی بروزرسانی شد" : "ویژگی جدید به دسته‌بندی اضافه شد");
      setAttrModalOpen(false);
      loadCategories();
    } catch (err: any) {
      notify("err", err.message || "خطا در ذخیره ویژگی");
    } finally {
      setAttrSaving(false);
    }
  };

  const handleDeleteAttribute = async (attr: PortfolioAttributeTemplate) => {
    if (!confirm(`آیا از حذف ویژگی «${attr.titleFa}» (${attr.key}) اطمینان دارید؟`)) return;

    try {
      const res = await adminFetch(`/api/v1/portfolio/categories/attributes/${attr.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        notify("ok", `ویژگی «${attr.titleFa}» حذف شد`);
        loadCategories();
      } else {
        notify("err", "حذف ویژگی ناموفق بود");
      }
    } catch {
      notify("err", "خطای شبکه");
    }
  };

  const handleReorderAttribute = async (categoryId: number, attrId: number, direction: "up" | "down") => {
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat || !cat.attributes || cat.attributes.length < 2) return;

    const list = [...cat.attributes].sort((a, b) => a.position - b.position);
    const currentIndex = list.findIndex((a) => a.id === attrId);
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    // Swap positions
    const [moved] = list.splice(currentIndex, 1);
    list.splice(targetIndex, 0, moved);

    const orderedIds = list.map((a) => a.id);

    try {
      const res = await adminFetch(`/api/v1/portfolio/categories/${categoryId}/attributes/reorder`, {
        method: "PUT",
        body: JSON.stringify({ orderedIds }),
      });
      if (res.ok) {
        loadCategories();
      }
    } catch {
      notify("err", "تغییر ترتیب ناموفق بود");
    }
  };

  return (
    <div className="space-y-8" dir="rtl">
      {/* Subheader */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-panel border border-border p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            دسته‌بندی‌های نمونه‌کار و قالب‌های ویژگی داینامیک
          </h2>
          <p className="text-xs text-muted mt-1">
            هر دسته‌بندی دارای مجموعه‌ای از ویژگی‌های اختصاصی (فیلدهای متنی، عددی، درصدی، قبل/بعد و...) است که فرم مدیریت پروژه‌ها را به صورت داینامیک می‌سازد.
          </p>
        </div>

        <button
          onClick={openCreateCategory}
          className="px-4 py-2.5 rounded-xl bg-lime text-ink hover:opacity-90 text-xs font-semibold flex items-center gap-2 transition-all shadow-md cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <span>➕</span>
          <span>ایجاد دسته‌بندی جدید</span>
        </button>
      </div>

      {/* Notification */}
      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-medium flex items-center justify-between border ${
            message.type === "ok"
              ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/80"
              : "bg-rose-950/60 text-rose-300 border-rose-800/80"
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="opacity-70 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* Categories List */}
      {loading ? (
        <div className="py-16 text-center text-muted">
          <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs">در حال بارگذاری دسته‌بندی‌ها و ویژگی‌ها...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="p-12 text-center bg-panel border border-border rounded-2xl text-muted shadow-xs">
          دسته‌بندی‌ای یافت نشد. دکمه «ایجاد دسته‌بندی جدید» را بزنید.
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((cat) => {
            const isExpanded = expandedCatId === cat.id;
            const isPreviewOpen = showPreviewForId === cat.id;
            const attrCount = cat.attributes?.length || 0;
            const projectCount = cat._count?.caseStudies || 0;

            return (
              <div
                key={cat.id}
                className="bg-panel border border-border rounded-2xl overflow-hidden transition-all hover:border-primary/40 shadow-xs"
              >
                {/* Category Card Header */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <span
                      className="w-4 h-4 rounded-full shadow-sm"
                      style={{ backgroundColor: cat.color || "#38534A" }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-foreground">
                          {cat.titleFa}
                        </h3>
                        <span className="text-xs text-muted font-medium">
                          ({cat.titleEn})
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-raised text-muted border border-border">
                          {cat.slug}
                        </span>
                      </div>
                      {cat.descriptionFa && (
                        <p className="text-xs text-muted mt-0.5">
                          {cat.descriptionFa}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Badges & Actions */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-raised text-foreground border border-border font-mono">
                      {projectCount} پروژه
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-primary/15 text-primary border border-primary/30 font-mono">
                      {attrCount} ویژگی
                    </span>

                    <button
                      onClick={() => handleToggleCategoryActive(cat)}
                      className={`text-xs px-3 py-1 rounded-lg border font-medium transition-colors cursor-pointer ${
                        cat.isActive
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30"
                          : "bg-raised text-muted border-border"
                      }`}
                    >
                      {cat.isActive ? "فعال ✓" : "غیرفعال"}
                    </button>

                    <button
                      onClick={() => setExpandedCatId(isExpanded ? null : cat.id)}
                      className={`text-xs px-3.5 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isExpanded
                          ? "bg-lime text-ink border-transparent shadow-md"
                          : "bg-raised text-foreground border-border hover:bg-raised/80"
                      }`}
                    >
                      <span>⚙️</span>
                      <span>مدیریت ویژگی‌ها ({attrCount})</span>
                      <span className="text-[10px]">{isExpanded ? "▲" : "▼"}</span>
                    </button>

                    <button
                      onClick={() => openEditCategory(cat)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-raised text-foreground hover:text-mint hover:bg-subtle border border-border transition-colors cursor-pointer"
                    >
                      ویرایش
                    </button>

                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-rose-500/15 text-rose-700 dark:text-rose-300 hover:bg-rose-500/25 border border-rose-500/40 transition-colors cursor-pointer"
                    >
                      حذف
                    </button>
                  </div>
                </div>

                {/* Expanded Attributes Panel */}
                {isExpanded && (
                  <div className="border-t border-border bg-raised/60 p-5 sm:p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                      <div>
                        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                          <span>لیست ویژگی‌های اختصاصی:</span>
                          <span className="text-mint">{cat.titleFa}</span>
                        </h4>
                        <p className="text-[11px] text-muted mt-0.5">
                          این فیلدها هنگام ایجاد یا ویرایش پروژه در این دسته‌بندی نمایش داده می‌شوند.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowPreviewForId(isPreviewOpen ? null : cat.id)}
                          className="px-3 py-1.5 rounded-xl bg-panel text-foreground hover:bg-subtle text-xs border border-border transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>👁️</span>
                          <span>{isPreviewOpen ? "بستن پیش‌نمایش" : "پیش‌نمایش فرم"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => openCreateAttribute(cat.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-lime text-ink hover:opacity-90 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>➕</span>
                          <span>افزودن ویژگی جدید</span>
                        </button>
                      </div>
                    </div>

                    {/* Interactive Form Preview */}
                    {isPreviewOpen && (
                      <div className="p-5 rounded-2xl bg-panel border border-primary/30 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-mint flex items-center gap-2">
                            <span>👁️ پیش‌نمایش فرم برای ادیتور</span>
                            <span className="text-[10px] text-muted">(نمونه تعاملی)</span>
                          </span>
                          <span className="text-[11px] text-muted">
                            دسته‌بندی: {cat.titleFa}
                          </span>
                        </div>

                        {cat.attributes?.length === 0 ? (
                          <p className="text-xs text-muted text-center py-4">
                            ویژگی‌ای برای پیش‌نمایش وجود ندارد.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {cat.attributes.map((a) => (
                              <div
                                key={a.id}
                                className={`p-3.5 rounded-xl bg-raised border border-border space-y-2 ${
                                  a.type === "BEFORE_AFTER" || a.type === "TEXTAREA"
                                    ? "md:col-span-2"
                                    : ""
                                }`}
                              >
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-semibold text-foreground">
                                    {a.titleFa} {a.isRequired && <span className="text-burgundy">*</span>}
                                  </span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-panel text-muted border border-border font-mono">
                                    {a.type}
                                  </span>
                                </div>
                                <input
                                  disabled
                                  placeholder={a.descriptionFa || `نمونه ورودی ${a.titleFa}...`}
                                  className="w-full bg-panel border border-border rounded-lg px-3 py-1.5 text-xs text-muted cursor-not-allowed opacity-75"
                                />
                                {a.unit && (
                                  <span className="text-[10px] text-muted font-mono block">
                                    واحد: {a.unit}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Attributes Table */}
                    {cat.attributes?.length === 0 ? (
                      <div className="p-8 text-center bg-panel border border-border rounded-xl text-muted text-xs">
                        هیچ ویژگی‌ای برای این دسته‌بندی تعریف نشده است. با دکمه «افزودن ویژگی جدید» فیلدهای پویا بسازید.
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-border bg-panel">
                        <table className="w-full text-right text-xs">
                          <thead className="bg-raised text-muted border-b border-border">
                            <tr>
                              <th className="py-3 px-3 w-16 text-center">ترتیب</th>
                              <th className="py-3 px-3">عنوان ویژگی (فارسی / انگلیسی)</th>
                              <th className="py-3 px-3">کلید سیستم (Key)</th>
                              <th className="py-3 px-3">نوع داده</th>
                              <th className="py-3 px-3">واحد</th>
                              <th className="py-3 px-3">الزامی</th>
                              <th className="py-3 px-3">نمایش سایت</th>
                              <th className="py-3 px-3 text-left">عملیات</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {cat.attributes
                              .sort((a, b) => a.position - b.position)
                              .map((attr, idx) => (
                                <tr
                                  key={attr.id}
                                  className="hover:bg-raised/60 transition-colors"
                                >
                                  {/* Reorder Buttons */}
                                  <td className="py-3 px-2 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      <button
                                        disabled={idx === 0}
                                        onClick={() =>
                                          handleReorderAttribute(cat.id, attr.id, "up")
                                        }
                                        className="p-1 rounded text-muted hover:text-foreground disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                                        title="انتقال به بالا"
                                      >
                                        ▲
                                      </button>
                                      <button
                                        disabled={idx === cat.attributes.length - 1}
                                        onClick={() =>
                                          handleReorderAttribute(cat.id, attr.id, "down")
                                        }
                                        className="p-1 rounded text-muted hover:text-foreground disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                                        title="انتقال به پایین"
                                      >
                                        ▼
                                      </button>
                                    </div>
                                  </td>

                                  <td className="py-3 px-3">
                                    <div className="font-semibold text-foreground">
                                      {attr.titleFa}
                                    </div>
                                    <div className="text-[11px] text-muted font-mono">
                                      {attr.titleEn}
                                    </div>
                                  </td>

                                  <td className="py-3 px-3 font-mono text-[11px] text-mint">
                                    {attr.key}
                                  </td>

                                  <td className="py-3 px-3">
                                    <span
                                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono border ${
                                        ATTRIBUTE_TYPE_COLORS[attr.type] || "bg-raised text-foreground"
                                      }`}
                                    >
                                      {attr.type}
                                    </span>
                                  </td>

                                  <td className="py-3 px-3 font-mono text-muted">
                                    {attr.unit || "—"}
                                  </td>

                                  <td className="py-3 px-3">
                                    {attr.isRequired ? (
                                      <span className="text-burgundy font-bold">بله</span>
                                    ) : (
                                      <span className="text-muted">خیر</span>
                                    )}
                                  </td>

                                  <td className="py-3 px-3">
                                    {attr.showInFrontend ? (
                                      <span className="text-emerald-600 dark:text-emerald-400">نمایش ✓</span>
                                    ) : (
                                      <span className="text-muted">پنهان</span>
                                    )}
                                  </td>

                                  <td className="py-3 px-3 text-left">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        onClick={() => openEditAttribute(attr)}
                                        className="px-2.5 py-1 rounded-md bg-raised text-foreground hover:text-mint text-[11px] border border-border transition-colors cursor-pointer"
                                      >
                                        ویرایش
                                      </button>
                                      <button
                                        onClick={() => handleDeleteAttribute(attr)}
                                        className="px-2.5 py-1 rounded-md bg-rose-500/15 text-rose-700 dark:text-rose-300 hover:bg-rose-500/25 text-[11px] border border-rose-500/40 transition-colors cursor-pointer"
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
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Category Modal ── */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-panel border border-border rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                {catFormData.id ? "ویرایش دسته‌بندی" : "ایجاد دسته‌بندی جدید"}
              </h3>
              <button
                onClick={() => setCatModalOpen(false)}
                className="text-muted hover:text-foreground text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    نام دسته‌بندی (فارسی) *
                  </label>
                  <input
                    type="text"
                    required
                    value={catFormData.titleFa}
                    onChange={(e) =>
                      setCatFormData({ ...catFormData, titleFa: e.target.value })
                    }
                    placeholder="مثال: سئو و رشد ارگانیک"
                    className="w-full bg-raised border border-border rounded-xl px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Category Title (English) *
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    required
                    value={catFormData.titleEn}
                    onChange={(e) =>
                      setCatFormData({ ...catFormData, titleEn: e.target.value })
                    }
                    placeholder="e.g. SEO & Organic Growth"
                    className="w-full bg-raised border border-border rounded-xl px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  شناسه URL (Slug) *
                </label>
                <input
                  type="text"
                  dir="ltr"
                  required
                  value={catFormData.slug}
                  onChange={(e) =>
                    setCatFormData({
                      ...catFormData,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
                    })
                  }
                  placeholder="e.g. seo-growth"
                  className="w-full bg-raised border border-border rounded-xl px-3.5 py-2 text-sm text-foreground font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  توضیح کوتاه (فارسی)
                </label>
                <textarea
                  rows={2}
                  value={catFormData.descriptionFa}
                  onChange={(e) =>
                    setCatFormData({ ...catFormData, descriptionFa: e.target.value })
                  }
                  placeholder="توضیح مختصر در خصوص خدمات این دسته..."
                  className="w-full bg-raised border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Color Presets */}
              <div>
                <label className="block text-xs font-medium text-foreground mb-2">
                  رنگ نشانگر دسته‌بندی
                </label>
                <div className="flex items-center gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCatFormData({ ...catFormData, color: c })}
                      className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                        catFormData.color === c
                          ? "border-foreground scale-110 shadow-lg"
                          : "border-transparent opacity-80 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <input
                    type="text"
                    dir="ltr"
                    value={catFormData.color}
                    onChange={(e) =>
                      setCatFormData({ ...catFormData, color: e.target.value })
                    }
                    className="w-24 bg-raised border border-border rounded-lg px-2 py-1 text-xs text-foreground font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={catFormData.isActive}
                    onChange={(e) =>
                      setCatFormData({ ...catFormData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 rounded bg-raised border-border text-primary"
                  />
                  دسته‌بندی فعال باشد
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-raised text-foreground border border-border text-xs hover:bg-subtle"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={catSaving}
                  className="px-5 py-2 rounded-xl bg-lime hover:opacity-90 text-ink text-xs font-bold flex items-center gap-2"
                >
                  {catSaving && (
                    <div className="w-3.5 h-3.5 border-2 border-ink border-t-transparent rounded-full animate-spin" />
                  )}
                  {catFormData.id ? "ذخیره تغییرات" : "ایجاد دسته‌بندی"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Attribute Template Modal ── */}
      {attrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-panel border border-border rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                {attrFormData.id ? "ویرایش قالب ویژگی" : "افزودن ویژگی جدید به دسته‌بندی"}
              </h3>
              <button
                onClick={() => setAttrModalOpen(false)}
                className="text-muted hover:text-foreground text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAttribute} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    عنوان ویژگی (فارسی) *
                  </label>
                  <input
                    type="text"
                    required
                    value={attrFormData.titleFa}
                    onChange={(e) =>
                      setAttrFormData({ ...attrFormData, titleFa: e.target.value })
                    }
                    placeholder="مثال: کلمات کلیدی رتبه ۱"
                    className="w-full bg-raised border border-border rounded-xl px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Attribute Title (English) *
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    required
                    value={attrFormData.titleEn}
                    onChange={(e) =>
                      setAttrFormData({ ...attrFormData, titleEn: e.target.value })
                    }
                    placeholder="e.g. Top 1 Keywords"
                    className="w-full bg-raised border border-border rounded-xl px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    کلید سیستمی (Key) *
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    required
                    disabled={!!attrFormData.id}
                    value={attrFormData.key}
                    onChange={(e) =>
                      setAttrFormData({
                        ...attrFormData,
                        key: e.target.value.toLowerCase().replace(/[^a-z0-9_]+/g, "_"),
                      })
                    }
                    placeholder="e.g. top1_keywords"
                    className="w-full bg-raised border border-border rounded-xl px-3.5 py-2 text-sm text-foreground font-mono focus:outline-none focus:border-primary disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    نوع داده (Data Type) *
                  </label>
                  <select
                    value={attrFormData.type}
                    onChange={(e) =>
                      setAttrFormData({
                        ...attrFormData,
                        type: e.target.value as AttributeType,
                      })
                    }
                    className="w-full bg-raised border border-border rounded-xl px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="TEXT">متن کوتاه (TEXT)</option>
                    <option value="TEXTAREA">متن چندخطی و مشخصات (TEXTAREA)</option>
                    <option value="NUMBER">عدد و شاخص KPI (NUMBER)</option>
                    <option value="PERCENTAGE">درصد و پیشرفت (PERCENTAGE)</option>
                    <option value="SELECT">انتخاب از فهرست (SELECT)</option>
                    <option value="MULTI_SELECT">انتخاب چندگانه (MULTI_SELECT)</option>
                    <option value="BOOLEAN">بله / خیر (BOOLEAN)</option>
                    <option value="IMAGE">تصویر از رسانه (IMAGE)</option>
                    <option value="LINK">لینک خارجی / دمو (LINK)</option>
                    <option value="BEFORE_AFTER">مقایسه قبل و بعد (BEFORE_AFTER)</option>
                  </select>
                </div>
              </div>

              {(attrFormData.type === "SELECT" || attrFormData.type === "MULTI_SELECT") && (
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    گزینه‌های قابل انتخاب (جداشده با کاما یا خط جدید) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={
                      Array.isArray(attrFormData.options?.choices)
                        ? attrFormData.options.choices.join("\n")
                        : typeof attrFormData.options?.choices === "string"
                        ? attrFormData.options.choices
                        : ""
                    }
                    onChange={(e) => {
                      const list = e.target.value
                        .split(/[\n,]+/)
                        .map((s) => s.trim())
                        .filter(Boolean);
                      setAttrFormData({
                        ...attrFormData,
                        options: { ...attrFormData.options, choices: list },
                      });
                    }}
                    placeholder={"گزینه اول\nگزینه دوم\nگزینه سوم"}
                    className="w-full bg-raised border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-primary resize-none"
                  />
                  <p className="text-[10px] text-muted mt-1">
                    هر گزینه را در یک خط جداگانه یا جداشده با ویرگول وارد کنید.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  واحد نمایش (اختیاری)
                </label>
                <input
                  type="text"
                  value={attrFormData.unit}
                  onChange={(e) =>
                    setAttrFormData({ ...attrFormData, unit: e.target.value })
                  }
                  placeholder="مثال: کلیک/ماه، رتبه، درصد، ثانیه"
                  className="w-full bg-raised border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  راهنمای فیلد برای ادیتور (Description)
                </label>
                <input
                  type="text"
                  value={attrFormData.descriptionFa}
                  onChange={(e) =>
                    setAttrFormData({ ...attrFormData, descriptionFa: e.target.value })
                  }
                  placeholder="توضیح نحوه پر کردن این ویژگی..."
                  className="w-full bg-raised border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={attrFormData.isRequired}
                    onChange={(e) =>
                      setAttrFormData({ ...attrFormData, isRequired: e.target.checked })
                    }
                    className="w-4 h-4 rounded bg-raised border-border text-rose-600"
                  />
                  فیلد الزامی باشد (*)
                </label>

                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={attrFormData.showInFrontend}
                    onChange={(e) =>
                      setAttrFormData({
                        ...attrFormData,
                        showInFrontend: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded bg-raised border-border text-emerald-600"
                  />
                  نمایش در صفحه عمومی پروژه
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setAttrModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-raised text-foreground border border-border text-xs hover:bg-subtle"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={attrSaving}
                  className="px-5 py-2 rounded-xl bg-lime hover:opacity-90 text-ink text-xs font-bold flex items-center gap-2"
                >
                  {attrSaving && (
                    <div className="w-3.5 h-3.5 border-2 border-ink border-t-transparent rounded-full animate-spin" />
                  )}
                  {attrFormData.id ? "بروزرسانی ویژگی" : "افزودن ویژگی"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
