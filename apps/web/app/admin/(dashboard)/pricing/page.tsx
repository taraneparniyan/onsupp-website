"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminApi";

type PricingPlan = {
  id: number;
  categoryId: number;
  nameFa: string;
  nameEn: string;
  badgeFa?: string;
  badgeEn?: string;
  priceType: "numeric" | "contact";
  priceFa: string;
  priceEn: string;
  discountPriceFa?: string;
  discountPriceEn?: string;
  periodFa: string;
  periodEn: string;
  descriptionFa: string;
  descriptionEn: string;
  featuresFa: string[];
  featuresEn: string[];
  popular?: boolean;
  ctaFa: string;
  ctaEn: string;
  ctaLink: string;
  position: number;
};

type PricingCategory = {
  id: number;
  titleFa: string;
  titleEn: string;
  slug: string;
  plans: PricingPlan[];
};

export default function AdminPricingPage() {
  const [categories, setCategories] = useState<PricingCategory[]>([]);
  const [activeTabCatId, setActiveTabCatId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // View Mode: "list" | "form"
  const [viewMode, setViewMode] = useState<"list" | "form">("list");

  // Category Modal State (Small inline/modal for just creating a category)
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCatId, setEditingCatId] = useState<number | null>(null);
  const [catFormData, setCatFormData] = useState({
    titleFa: "",
    titleEn: "",
    slug: "",
  });

  // Dedicated Full-Page Plan Form State
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null);
  const [planFormData, setPlanFormData] = useState({
    categoryId: 0,
    nameFa: "",
    nameEn: "",
    badgeFa: "",
    badgeEn: "",
    priceType: "numeric" as "numeric" | "contact",
    priceFa: "",
    priceEn: "",
    discountPriceFa: "",
    discountPriceEn: "",
    periodFa: "تومان / ماهانه",
    periodEn: "TOMAN / Monthly",
    descriptionFa: "",
    descriptionEn: "",
    featuresFaInput: "",
    featuresEnInput: "",
    popular: false,
    ctaFa: "سفارش پلن",
    ctaEn: "Select Plan",
    ctaLink: "#contact",
  });

  const loadData = () => {
    setLoading(true);
    adminFetch("/api/v1/pricing/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
          if (data.length > 0 && !activeTabCatId) {
            setActiveTabCatId(data[0].id);
          }
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Category Actions
  const handleOpenCatModal = (cat?: PricingCategory) => {
    if (cat) {
      setEditingCatId(cat.id);
      setCatFormData({ titleFa: cat.titleFa, titleEn: cat.titleEn, slug: cat.slug });
    } else {
      setEditingCatId(null);
      setCatFormData({ titleFa: "", titleEn: "", slug: "" });
    }
    setShowCatModal(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = editingCatId
      ? `/api/v1/pricing/categories/${editingCatId}`
      : "/api/v1/pricing/categories";
    const method = editingCatId ? "PUT" : "POST";

    const res = await adminFetch(endpoint, {
      method,
      body: JSON.stringify(catFormData),
    });

    if (res.ok) {
      setShowCatModal(false);
      loadData();
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("آیا از حذف این دسته‌بندی و تمامی پلن‌های زیرمجموعه آن اطمینان دارید؟")) return;
    const res = await adminFetch(`/api/v1/pricing/categories/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      if (activeTabCatId === id) setActiveTabCatId(null);
      loadData();
    }
  };

  // Dedicated Full-Page Plan Form Openers
  const handleOpenPlanForm = (catId: number, plan?: PricingPlan) => {
    if (plan) {
      setEditingPlanId(plan.id);
      setPlanFormData({
        categoryId: catId,
        nameFa: plan.nameFa,
        nameEn: plan.nameEn,
        badgeFa: plan.badgeFa || "",
        badgeEn: plan.badgeEn || "",
        priceType: plan.priceType || "numeric",
        priceFa: plan.priceFa,
        priceEn: plan.priceEn,
        discountPriceFa: plan.discountPriceFa || "",
        discountPriceEn: plan.discountPriceEn || "",
        periodFa: plan.periodFa || "تومان / ماهانه",
        periodEn: plan.periodEn || "TOMAN / Monthly",
        descriptionFa: plan.descriptionFa,
        descriptionEn: plan.descriptionEn,
        featuresFaInput: (plan.featuresFa || []).join("\n"),
        featuresEnInput: (plan.featuresEn || []).join("\n"),
        popular: Boolean(plan.popular),
        ctaFa: plan.ctaFa || "سفارش پلن",
        ctaEn: plan.ctaEn || "Select Plan",
        ctaLink: plan.ctaLink || "#contact",
      });
    } else {
      setEditingPlanId(null);
      setPlanFormData({
        categoryId: catId,
        nameFa: "",
        nameEn: "",
        badgeFa: "",
        badgeEn: "",
        priceType: "numeric",
        priceFa: "",
        priceEn: "",
        discountPriceFa: "",
        discountPriceEn: "",
        periodFa: "تومان / ماهانه",
        periodEn: "TOMAN / Monthly",
        descriptionFa: "",
        descriptionEn: "",
        featuresFaInput: "",
        featuresEnInput: "",
        popular: false,
        ctaFa: "سفارش پلن",
        ctaEn: "Select Plan",
        ctaLink: "#contact",
      });
    }
    setViewMode("form");
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = editingPlanId
      ? `/api/v1/pricing/plans/${editingPlanId}`
      : "/api/v1/pricing/plans";
    const method = editingPlanId ? "PUT" : "POST";

    const { featuresFaInput, featuresEnInput, ...restData } = planFormData;

    const payload = {
      ...restData,
      featuresFa: featuresFaInput.split("\n").filter((s) => s.trim() !== ""),
      featuresEn: featuresEnInput.split("\n").filter((s) => s.trim() !== ""),
    };

    const res = await adminFetch(endpoint, {
      method,
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setViewMode("list");
      loadData();
    } else {
      alert("خطا در ذخیره‌سازی اطلاعات پلن!");
    }
  };


  const handleDeletePlan = async (id: number) => {
    if (!confirm("آیا از حذف این پلن اطمینان دارید؟")) return;
    const res = await adminFetch(`/api/v1/pricing/plans/${id}`, {
      method: "DELETE",
    });
    if (res.ok) loadData();
  };

  const currentCategory = categories.find((c) => c.id === activeTabCatId) || categories[0];

  // ----------------------------------------------------
  // FULL PAGE PLAN EDIT FORM VIEW
  // ----------------------------------------------------
  if (viewMode === "form") {
    return (
      <div className="space-y-8 max-w-5xl mx-auto" dir="rtl">
        {/* Full Page Header Navigation */}
        <div className="p-6 rounded-xl bg-panel border border-foreground/10 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode("list")}
              className="p-2.5 rounded-xl bg-raised border border-primary/20 text-mint hover:text-white transition-all flex items-center gap-2 text-xs font-bold"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <span>بازگشت به لیست پلن‌ها</span>
            </button>
            <h1 className="text-xl font-bold text-white">
              {editingPlanId ? "ویرایش پلن قیمتی" : "تعریف پلن قیمتی جدید"}
            </h1>
          </div>
          <span className="text-xs text-mint bg-raised px-3 py-1.5 rounded-xl border border-foreground/10">
            دسته: {currentCategory?.titleFa}
          </span>
        </div>

        {/* Dedicated Form Container */}
        <form onSubmit={handleSavePlan} className="bg-panel border border-foreground/10 rounded-xl p-8 space-y-8 shadow-md">
          
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-mint pb-2 border-b border-foreground/10 flex items-center gap-2">
              <span>۱. نام و مشخصات اصلی پلن</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-mint mb-2">نام پلن (فارسی)</label>
                <input
                  type="text"
                  required
                  value={planFormData.nameFa}
                  onChange={(e) => setPlanFormData({ ...planFormData, nameFa: e.target.value })}
                  placeholder="مثلا: پلن حرفه‌ای رشد"
                  className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none focus:border-[#3f6b59]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-mint mb-2">نام پلن (انگلیسی)</label>
                <input
                  type="text"
                  value={planFormData.nameEn}
                  onChange={(e) => setPlanFormData({ ...planFormData, nameEn: e.target.value })}
                  placeholder="e.g. Pro Growth Plan"
                  className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none focus:border-[#3f6b59]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-mint mb-2">توضیحات کوتاه کاربرد (فارسی)</label>
                <input
                  type="text"
                  value={planFormData.descriptionFa}
                  onChange={(e) => setPlanFormData({ ...planFormData, descriptionFa: e.target.value })}
                  placeholder="توضیح کوتاه کاربرد و هدف این پلن..."
                  className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none focus:border-[#3f6b59]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-mint mb-2">توضیحات کوتاه کاربرد (انگلیسی)</label>
                <input
                  type="text"
                  value={planFormData.descriptionEn}
                  onChange={(e) => setPlanFormData({ ...planFormData, descriptionEn: e.target.value })}
                  placeholder="Short description of this plan..."
                  className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none focus:border-[#3f6b59]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Mode */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-mint pb-2 border-b border-foreground/10 flex items-center gap-2">
              <span>۲. قیمت‌گذاری و وضعیت تخفیف / تماس بگیرید</span>
            </h2>

            <div className="p-4 bg-raised rounded-lg border border-foreground/10 space-y-3">
              <label className="block text-xs font-bold text-mint">حالت قیمت‌گذاری پلن</label>
              <div className="flex items-center gap-8">
                <label className="flex items-center gap-2 text-sm font-bold text-white cursor-pointer">
                  <input
                    type="radio"
                    name="priceType"
                    value="numeric"
                    checked={planFormData.priceType === "numeric"}
                    onChange={() => setPlanFormData({ ...planFormData, priceType: "numeric" })}
                    className="w-4 h-4 text-mint"
                  />
                  <span>💰 قیمت عددی (تومان)</span>
                </label>

                <label className="flex items-center gap-2 text-sm font-bold text-white cursor-pointer">
                  <input
                    type="radio"
                    name="priceType"
                    value="contact"
                    checked={planFormData.priceType === "contact"}
                    onChange={() => setPlanFormData({ ...planFormData, priceType: "contact" })}
                    className="w-4 h-4 text-mint"
                  />
                  <span>📞 تماس بگیرید (مشاوره و قیمت سفارشی)</span>
                </label>
              </div>
            </div>

            {planFormData.priceType === "numeric" && (
              <div className="space-y-4 p-4 rounded-xl bg-raised/50 border border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-mint mb-2">قیمت اصلی (فارسی)</label>
                    <input
                      type="text"
                      value={planFormData.priceFa}
                      onChange={(e) => setPlanFormData({ ...planFormData, priceFa: e.target.value })}
                      placeholder="۲۸,۰۰۰,۰۰۰"
                      className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-mint mb-2">قیمت اصلی (انگلیسی)</label>
                    <input
                      type="text"
                      value={planFormData.priceEn}
                      onChange={(e) => setPlanFormData({ ...planFormData, priceEn: e.target.value })}
                      placeholder="28,000,000"
                      className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-rose-400 mb-2">قیمت تخفیف‌دار / آفر (فارسی - اختیاری)</label>
                    <input
                      type="text"
                      value={planFormData.discountPriceFa}
                      onChange={(e) => setPlanFormData({ ...planFormData, discountPriceFa: e.target.value })}
                      placeholder="۲۲,۰۰۰,۰۰۰"
                      className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-rose-400 mb-2">قیمت تخفیف‌دار / آفر (انگلیسی - اختیاری)</label>
                    <input
                      type="text"
                      value={planFormData.discountPriceEn}
                      onChange={(e) => setPlanFormData({ ...planFormData, discountPriceEn: e.target.value })}
                      placeholder="22,000,000"
                      className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-mint mb-2">دوره پرداخت (فارسی)</label>
                <input
                  type="text"
                  value={planFormData.periodFa}
                  onChange={(e) => setPlanFormData({ ...planFormData, periodFa: e.target.value })}
                  placeholder="تومان / ماهانه"
                  className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-mint mb-2">دوره پرداخت (انگلیسی)</label>
                <input
                  type="text"
                  value={planFormData.periodEn}
                  onChange={(e) => setPlanFormData({ ...planFormData, periodEn: e.target.value })}
                  placeholder="TOMAN / Monthly"
                  className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Badges & Popular */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-mint pb-2 border-b border-foreground/10 flex items-center gap-2">
              <span>۳. برچسب ویژه و هایلایت محبوب</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-mint mb-2">برچسب روی کارت (فارسی - اختیاری)</label>
                <input
                  type="text"
                  value={planFormData.badgeFa}
                  onChange={(e) => setPlanFormData({ ...planFormData, badgeFa: e.target.value })}
                  placeholder="مثلا: پیشنهاد ویژه / ۲۰٪ آفر"
                  className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-mint mb-2">برچسب روی کارت (انگلیسی - اختیاری)</label>
                <input
                  type="text"
                  value={planFormData.badgeEn}
                  onChange={(e) => setPlanFormData({ ...planFormData, badgeEn: e.target.value })}
                  placeholder="e.g. POPULAR / SPECIAL OFFER"
                  className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-4 bg-raised rounded-lg border border-foreground/10 flex items-center gap-3">
              <input
                type="checkbox"
                id="popularPage"
                checked={planFormData.popular}
                onChange={(e) => setPlanFormData({ ...planFormData, popular: e.target.checked })}
                className="w-5 h-5 rounded text-mint focus:ring-0"
              />
              <label htmlFor="popularPage" className="text-sm font-bold text-white cursor-pointer">
                برجسته کردن این پلن به عنوان «پیشنهاد پرتقاضا / Popular» (دارای کادر زمردی و افکت ویژه)
              </label>
            </div>
          </div>

          {/* Section 4: Features Multiline */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-mint pb-2 border-b border-foreground/10 flex items-center gap-2">
              <span>۴. لیست امکانات و تعهدات شامل شده (یک سطر = یک ویژگی)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-mint mb-2">
                  امکانات فارسی (هر سطر یک ویژگی)
                </label>
                <textarea
                  rows={6}
                  value={planFormData.featuresFaInput}
                  onChange={(e) => setPlanFormData({ ...planFormData, featuresFaInput: e.target.value })}
                  placeholder="آنالیز کلمات کلیدی&#10;سئوی کامل داخلی&#10;تولید ۸ مقاله تخصصی"
                  className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-lg p-4 focus:outline-none font-mono leading-7"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-mint mb-2">
                  امکانات انگلیسی (هر سطر یک ویژگی)
                </label>
                <textarea
                  rows={6}
                  value={planFormData.featuresEnInput}
                  onChange={(e) => setPlanFormData({ ...planFormData, featuresEnInput: e.target.value })}
                  placeholder="Keyword analysis&#10;Full On-Page SEO&#10;8 Expert articles"
                  className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-lg p-4 focus:outline-none font-mono leading-7"
                />
              </div>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="pt-6 border-t border-foreground/10 flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className="px-6 py-3 rounded-lg bg-raised border border-foreground/10 text-mint font-bold text-sm hover:text-white"
            >
              انصراف و بازگشت
            </button>
            <button
              type="submit"
              className="px-8 py-3.5 rounded-lg bg-lime text-ink font-black text-sm border border-primary/40 shadow-md hover:scale-105 transition-all cursor-pointer"
            >
              {editingPlanId ? "ذخیره تغییرات پلن" : "ایجاد پلن جدید"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ----------------------------------------------------
  // MAIN LIST VIEW
  // ----------------------------------------------------
  return (
    <div className="space-y-8 max-w-7xl mx-auto" dir="rtl">
      {/* Header Banner */}
      <div className="p-8 rounded-xl bg-gradient-to-r from-panel via-panel to-background border border-foreground/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-raised/50 border border-primary/20 text-mint text-xs font-bold">
            💎 تعرفه‌ها و پکیج‌های سرمایه‌گذاری
          </div>
          <h1 className="text-3xl font-black text-white">مدیریت دسته‌ها و پلن‌های قیمت</h1>
          <p className="text-sm text-mint">
            ایجاد دسته‌بندی خدمات (مثلا وب‌سایت، سئو، اینستاگرام) و تعریف پلن‌های قیمت عادی، تخفیف‌دار و تماس بگیرید.
          </p>
        </div>

        <button
          onClick={() => handleOpenCatModal()}
          className="px-5 py-3 rounded-lg bg-lime text-ink font-bold text-sm border border-primary/40 hover:scale-105 shadow-lg transition-all cursor-pointer"
        >
          + دسته‌بندی جدید
        </button>
      </div>

      {/* Category Tabs & Actions */}
      {loading ? (
        <div className="text-center py-16 text-mint">در حال دریافت داده‌ها...</div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 bg-panel rounded-xl border border-foreground/10 text-mint space-y-4">
          <p>هیچ دسته‌بندی قیمتی ایجاد نشده است.</p>
          <button
            onClick={() => handleOpenCatModal()}
            className="px-4 py-2 rounded-xl bg-raised text-mint font-bold text-xs border border-primary/20"
          >
            ایجاد اولین دسته‌بندی
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tabs Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-panel p-4 rounded-lg border border-foreground/10">
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => {
                const isActive = cat.id === activeTabCatId;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveTabCatId(cat.id)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-lime text-ink border border-primary/40 shadow-md"
                        : "bg-raised text-mint hover:text-foreground hover:bg-subtle"
                    }`}
                  >
                    {cat.titleFa || cat.titleEn}
                    <span className="mr-2 text-[10px] opacity-70">({cat.plans?.length || 0})</span>
                  </button>
                );
              })}
            </div>

            {currentCategory && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenCatModal(currentCategory)}
                  className="px-3 py-1.5 rounded-xl bg-raised border border-primary/20 text-xs text-mint hover:text-white"
                >
                  ویرایش دسته
                </button>
                <button
                  onClick={() => handleDeleteCategory(currentCategory.id)}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 hover:bg-rose-500/20"
                >
                  حذف دسته
                </button>
              </div>
            )}
          </div>

          {/* Current Category Plans Header */}
          {currentCategory && (
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    پلن‌های دسته «{currentCategory.titleFa}»
                  </h2>
                  <p className="text-xs text-mint mt-0.5">
                    مدیریت ۳ یا چند پلن قیمت برای این خدمت
                  </p>
                </div>

                <button
                  onClick={() => handleOpenPlanForm(currentCategory.id)}
                  className="px-5 py-3 rounded-lg bg-raised border border-primary/25 text-mint text-xs font-bold hover:bg-primary/15 transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <span>+ تعریف پلن جدید (صفحه کامل)</span>
                </button>
              </div>

              {/* Plans List Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentCategory.plans?.map((plan) => (
                  <div
                    key={plan.id}
                    className={`bg-panel rounded-lg border p-6 flex flex-col justify-between space-y-5 ${
                      plan.popular ? "border-mint/20 shadow-lg shadow-emerald-950/40" : "border-foreground/10"
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Badge & Popular */}
                      <div className="flex items-center justify-between">
                        {plan.badgeFa ? (
                          <span className="px-2.5 py-1 rounded-md bg-mint/10 text-mint text-[10px] font-bold border border-mint/20">
                            {plan.badgeFa}
                          </span>
                        ) : (
                          <span />
                        )}
                        {plan.popular && (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                            ⭐ پلن ویژه (Popular)
                          </span>
                        )}
                      </div>

                      {/* Name & Desc */}
                      <div>
                        <h3 className="text-lg font-bold text-white">{plan.nameFa}</h3>
                        <p className="text-xs text-mint mt-1 line-clamp-2">{plan.descriptionFa}</p>
                      </div>

                      {/* Price Details */}
                      <div className="py-3 border-y border-foreground/10">
                        {plan.priceType === "contact" ? (
                          <div className="text-mint font-bold text-base">📞 تماس بگیرید (توافقی)</div>
                        ) : (
                          <div>
                            {plan.discountPriceFa && (
                              <span className="text-xs line-through text-mint block">{plan.priceFa}</span>
                            )}
                            <span className="text-xl font-black text-mint">
                              {plan.discountPriceFa || plan.priceFa}
                            </span>
                            <span className="text-[11px] text-mint mr-1.5">{plan.periodFa}</span>
                          </div>
                        )}
                      </div>

                      {/* Features preview */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] text-mint font-bold block">ویژگی‌های ثبت شده:</span>
                        <ul className="space-y-1 text-xs text-foreground">
                          {plan.featuresFa?.map((f, idx) => (
                            <li key={idx} className="flex items-center gap-1.5 truncate">
                              <span className="text-mint">✓</span> {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-4 border-t border-foreground/10 flex items-center gap-2">
                      <button
                        onClick={() => handleOpenPlanForm(currentCategory.id, plan)}
                        className="flex-1 py-2.5 rounded-xl bg-raised border border-primary/20 text-mint text-xs font-bold hover:bg-primary/15 cursor-pointer"
                      >
                        ویرایش در صفحه اختصاصی
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
                        title="حذف پلن"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Small Category Creation Modal */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 bg-black/70  flex items-center justify-center p-4">
          <div className="bg-panel border border-foreground/10 rounded-xl p-6 w-full max-w-md space-y-4 shadow-md">
            <h3 className="text-lg font-bold text-white">
              {editingCatId ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی قیمت"}
            </h3>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-mint mb-1">عنوان فارسی خدمت</label>
                <input
                  type="text"
                  required
                  value={catFormData.titleFa}
                  onChange={(e) => setCatFormData({ ...catFormData, titleFa: e.target.value })}
                  placeholder="مثلا: طراحی وب‌سایت"
                  className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-2 px-3 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-mint mb-1">عنوان انگلیسی خدمت</label>
                <input
                  type="text"
                  value={catFormData.titleEn}
                  onChange={(e) => setCatFormData({ ...catFormData, titleEn: e.target.value })}
                  placeholder="e.g. Website Design"
                  className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-2 px-3 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-mint mb-1">شناسه یکتا (Slug)</label>
                <input
                  type="text"
                  required
                  value={catFormData.slug}
                  onChange={(e) => setCatFormData({ ...catFormData, slug: e.target.value })}
                  placeholder="website"
                  className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-2 px-3 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-mint hover:text-white"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-lime text-ink font-bold text-xs cursor-pointer"
                >
                  ذخیره دسته‌بندی
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
