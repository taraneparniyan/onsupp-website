"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/context/LanguageContext";
import {
  type PricingCategory,
  CANONICAL_PRICING_CATEGORIES,
  BACKEND_URL,
} from "@/lib/pricing";

function PricingContent() {
  const { lang } = useLanguage();
  const searchParams = useSearchParams();
  const isRtl = lang === "fa";

  const [categories, setCategories] = useState<PricingCategory[]>(
    CANONICAL_PRICING_CATEGORIES
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(
    CANONICAL_PRICING_CATEGORIES[0]?.id ?? 1
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Sync category from URL parameter (?category=seo or ?category=website)
  useEffect(() => {
    const catParam = searchParams.get("category");
    if (catParam && categories.length > 0) {
      const matched = categories.find((c) => c.slug === catParam);
      if (matched) {
        setSelectedCategoryId(matched.id);
      }
    }
  }, [searchParams, categories]);

  // Fetch live pricing categories from backend API
  const fetchPricingFromApi = () => {
    setLoading(true);
    setApiError(null);

    fetch(`${BACKEND_URL}/api/v1/pricing/categories`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`خطای وب‌سرویس: کد وضعیت ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
          setSelectedCategoryId(data[0].id);
          setApiError(null);
        } else if (Array.isArray(data) && data.length === 0) {
          setCategories([]);
          setApiError(null);
        }
      })
      .catch((err) => {
        const errMsg =
          err instanceof Error
            ? err.message
            : "عدم برقراری ارتباط با وب‌سرویس بک‌اند";
        setApiError(errMsg);
        // Fallback to verified canonical seed data so skeleton is testable
        setCategories(CANONICAL_PRICING_CATEGORIES);
        setSelectedCategoryId(CANONICAL_PRICING_CATEGORIES[0]?.id ?? 1);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPricingFromApi();
  }, []);

  const currentCategory =
    categories.find((c) => c.id === selectedCategoryId) || categories[0];

  const handleSelectCategory = (cat: PricingCategory) => {
    setSelectedCategoryId(cat.id);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("category", cat.slug);
      window.history.replaceState({}, "", url.toString());
    }
  };

  return (
    <div
      className="min-h-screen bg-background text-foreground flex flex-col font-sans"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <Header />

      <main className="flex-1 pt-28 sm:pt-36 pb-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ── 1. Page Header: Title & Short Introduction ─────────────── */}
          <section className="text-center mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-panel border border-white/10 text-xs font-bold tracking-widest text-mint uppercase mb-4 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
              <span>{isRtl ? "اسکلت اولیه پلن‌ها و تعرفه‌ها" : "Pricing Skeleton"}</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
              {isRtl ? "پلن‌ها و تعرفه‌های خدمات آن‌ساپ" : "OnSupp Pricing & Packages"}
            </h1>

            <p className="text-sm sm:text-base text-foreground/70 max-w-2xl mx-auto leading-relaxed">
              {isRtl
                ? "تعرفه‌های شفاف، مدون و منعطف برای خدمات تخصصی سئو، طراحی وب‌سایت و راهکارهای جامع دیجیتال. در این مرحله اسکلت اولیه صفحه تعرفه‌ها، تب‌های انتخاب دسته‌بندی و اطلاعات دقیق پلن‌ها پیاده‌سازی شده است."
                : "Transparent, scalable investment tiers engineered for startups, growth-stage brands, and enterprise digital operations."}
            </p>
          </section>

          {/* ── Backend API Status & Transparent Notice ────────────────── */}
          {apiError && (
            <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-amber-300 mb-1">
                    {isRtl
                      ? "اطلاعیه اتصال وب‌سرویس تعرفه‌ها (API)"
                      : "Pricing API Connection Notice"}
                  </h4>
                  <p className="text-xs text-amber-200/80 leading-relaxed">
                    {isRtl
                      ? `ارتباط زنده با بک‌اند (${BACKEND_URL}/api/v1/pricing/categories) برقرار نشد (${apiError}). در حال حاضر داده‌های پایه و مستندشده اولیه نمایش داده می‌شوند و با فعال‌سازی وب‌سرویس، پلن‌ها به‌صورت خودکار با پایگاه داده همگام خواهند شد.`
                      : `Backend service at ${BACKEND_URL} is currently offline (${apiError}). Displaying verified canonical pricing packages.`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={fetchPricingFromApi}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-amber-500 text-ink text-xs font-bold hover:bg-amber-400 active:scale-95 transition-all shrink-0 cursor-pointer disabled:opacity-50"
              >
                {loading
                  ? isRtl ? "در حال اتصال..." : "Connecting..."
                  : isRtl ? "تلاش مجدد اتصال" : "Retry Connection"}
              </button>
            </div>
          )}

          {/* ── 2. Service Category Selector Tabs ──────────────────────── */}
          {categories.length > 0 && (
            <section className="mb-10 sm:mb-14">
              <div
                role="tablist"
                aria-label={isRtl ? "دسته‌بندی تعرفه‌ها" : "Pricing Categories"}
                className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 p-3 rounded-2xl bg-panel/70 border border-white/10 backdrop-blur-md"
              >
                {categories.map((cat) => {
                  const isActive = cat.id === selectedCategoryId;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => handleSelectCategory(cat)}
                      className={`min-h-[42px] px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer select-none inline-flex items-center gap-2 ${
                        isActive
                          ? "bg-lime text-ink shadow-[0_0_18px_rgba(178,248,0,0.3)] font-bold scale-[1.02]"
                          : "bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/5"
                      }`}
                    >
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-ink shrink-0" />
                      )}
                      <span>{isRtl ? cat.titleFa : cat.titleEn}</span>
                      {cat.plans && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                            isActive
                              ? "bg-black/20 text-black font-bold"
                              : "bg-white/10 text-white/50"
                          }`}
                        >
                          {cat.plans.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── 3. Dynamic Pricing Cards Grid ──────────────────────────── */}
          {currentCategory ? (
            <section id="pricing-grid">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
                {currentCategory.plans.map((plan) => {
                  const isContact = plan.priceType === "contact";
                  const hasDiscount = Boolean(
                    isRtl ? plan.discountPriceFa : plan.discountPriceEn
                  );

                  return (
                    <article
                      key={plan.id}
                      className={`relative overflow-hidden rounded-2xl p-6 sm:p-8 border flex flex-col justify-between transition-all duration-300 ${
                        plan.popular
                          ? "border-mint/60 bg-gradient-to-b from-panel via-raised to-panel shadow-[0_16px_36px_rgba(0,0,0,0.4)] lg:scale-[1.02] z-10"
                          : "border-white/10 bg-panel hover:border-mint/30"
                      }`}
                    >
                      {/* Popular / Special Badge */}
                      {(isRtl ? plan.badgeFa : plan.badgeEn) && (
                        <div
                          className={`absolute top-5 ${
                            isRtl ? "left-5" : "right-5"
                          }`}
                        >
                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                              plan.popular
                                ? "bg-lime text-ink shadow-[0_0_12px_rgba(178,248,0,0.3)]"
                                : "bg-mint/20 border border-mint/40 text-mint"
                            }`}
                          >
                            {isRtl ? plan.badgeFa : plan.badgeEn}
                          </span>
                        </div>
                      )}

                      <div className="space-y-6">
                        {/* Title & Description */}
                        <div>
                          <h3
                            className={`text-xl sm:text-2xl font-bold tracking-tight text-white ${
                              plan.badgeFa
                                ? isRtl
                                  ? "pl-24"
                                  : "pr-24"
                                : ""
                            }`}
                          >
                            {isRtl ? plan.nameFa : plan.nameEn}
                          </h3>
                          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-foreground/60 min-h-[44px]">
                            {isRtl ? plan.descriptionFa : plan.descriptionEn}
                          </p>
                        </div>

                        {/* Price Box */}
                        <div className="py-4 border-y border-white/10 space-y-1">
                          {isContact ? (
                            <div className="py-1">
                              <span className="text-2xl sm:text-3xl font-black text-mint block">
                                {isRtl ? "تماس بگیرید" : "Contact Us"}
                              </span>
                              <span className="text-xs font-semibold text-foreground/50 mt-1 block">
                                {isRtl
                                  ? plan.periodFa || "مشاوره و قیمت سفارشی"
                                  : plan.periodEn || "Custom Quote"}
                              </span>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-baseline gap-2 flex-wrap">
                                {hasDiscount && (
                                  <span className="text-base sm:text-lg line-through text-foreground/40 font-semibold font-mono">
                                    {isRtl ? plan.priceFa : plan.priceEn}
                                  </span>
                                )}
                                <span className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white font-mono">
                                  {hasDiscount
                                    ? isRtl
                                      ? plan.discountPriceFa
                                      : plan.discountPriceEn
                                    : isRtl
                                    ? plan.priceFa
                                    : plan.priceEn}
                                </span>
                              </div>
                              <span className="text-xs font-semibold text-foreground/50 block">
                                {isRtl ? plan.periodFa : plan.periodEn}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Features Checklist */}
                        <div className="space-y-3 pt-1">
                          <span className="text-[11px] font-bold tracking-wider text-mint uppercase block">
                            {isRtl ? "امکانات و خدمات شامل:" : "WHAT'S INCLUDED:"}
                          </span>
                          <ul className="space-y-2.5">
                            {(isRtl ? plan.featuresFa : plan.featuresEn).map(
                              (feat, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/80 leading-relaxed"
                                >
                                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mint/15 text-mint mt-0.5">
                                    <svg
                                      className="h-3.5 w-3.5"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                      strokeWidth="2.5"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  </span>
                                  <span>{feat}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-6 sm:pt-8 mt-6 border-t border-white/5">
                        <Link
                          href={plan.ctaLink || "/#contact"}
                          className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 px-5 text-xs sm:text-sm font-bold transition-all min-h-[44px] ${
                            plan.popular
                              ? "bg-lime text-ink shadow-[0_0_20px_rgba(178,248,0,0.25)] hover:scale-[1.02] active:scale-95"
                              : "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-mint/30"
                          }`}
                        >
                          <span>
                            {isContact
                              ? isRtl
                                ? "تماس و مشاوره رایگان"
                                : "Contact Sales"
                              : isRtl
                              ? plan.ctaFa || "سفارش پلن"
                              : plan.ctaEn || "Select Plan"}
                          </span>
                          <svg
                            className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M14 5l7 7m0 0l-7 7m7-7H3"
                            />
                          </svg>
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : (
            <div className="py-16 text-center rounded-2xl bg-panel border border-white/10">
              <p className="text-sm text-foreground/50">
                {isRtl
                  ? "پلنی برای نمایش وجود ندارد."
                  : "No pricing plans found."}
              </p>
            </div>
          )}

          {/* ── 4. Bottom Custom Consultation Callout ──────────────────── */}
          <section className="mt-16 sm:mt-20 p-8 sm:p-10 rounded-3xl bg-panel border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-start">
            <div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-2">
                {isRtl
                  ? "نیاز به پلن سفارشی یا مشاوره تلفنی دارید؟"
                  : "Need a Custom Strategy or Enterprise Quote?"}
              </h3>
              <p className="text-xs sm:text-sm text-foreground/60 max-w-xl">
                {isRtl
                  ? "اگر پروژه شما نیازمندی‌های اختصاصی فراتر از پلن‌های استاندارد دارد، کارشناسان آن‌ساپ آماده تدوین بسته شخصی‌سازی‌شده برای شما هستند."
                  : "Contact our growth specialists to configure a tailored package aligned with your specific KPI roadmap."}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/services"
                className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs sm:text-sm font-semibold text-white hover:text-mint transition-all"
              >
                {isRtl ? "بررسی همه خدمات" : "All Services"}
              </Link>
              <Link
                href="/#contact"
                className="px-6 py-3 rounded-xl bg-lime text-ink text-xs sm:text-sm font-bold shadow-[0_0_24px_rgba(178,248,0,0.25)] hover:scale-105 active:scale-95 transition-all"
              >
                {isRtl ? "درخواست جلسه مشاوره" : "Start Consultation"}
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <PricingContent />
    </Suspense>
  );
}
