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

      <main className="flex-1 pb-20 sm:pb-28">
        {/* ── 1. Dedicated Pricing Hero Section ── */}
        <section
          id="pricing-hero"
          aria-label={isRtl ? "پلن‌ها و تعرفه‌های خدمات آن‌ساپ" : "OnSupp Service Packages & Pricing"}
          className="relative w-full pt-28 sm:pt-36 pb-14 sm:pb-20 overflow-hidden border-b border-black/[0.06] dark:border-white/[0.08] bg-[#F8F9FA] dark:bg-[#111416] mb-12 sm:mb-16 transition-colors"
        >
          {/* Subtle Ambient Brand Glows */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden select-none"
          >
            <div className="absolute -top-28 start-1/3 w-[640px] h-[340px] bg-[#38534A]/[0.06] dark:bg-[#38534A]/[0.14] rounded-full blur-[100px]" />
            <div className="absolute top-1/2 -start-20 w-[320px] h-[320px] bg-[#4F0001]/[0.04] dark:bg-[#4F0001]/[0.10] rounded-full blur-[80px]" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb Navigation */}
            <nav
              aria-label={isRtl ? "مسیر دسترسی" : "Breadcrumbs"}
              className="flex items-center gap-2 text-xs font-mono text-foreground/50 mb-6 sm:mb-8 select-none"
            >
              <Link href="/" className="hover:text-foreground transition-colors">
                {isRtl ? "خانه" : "Home"}
              </Link>
              <span className="opacity-40">/</span>
              <span className="text-foreground/90 font-medium">
                {isRtl ? "پلن‌ها و تعرفه‌ها" : "Pricing & Packages"}
              </span>
            </nav>

            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-3 text-xs sm:text-sm font-bold tracking-widest text-[#38534A] dark:text-[#8AB3A0] uppercase">
                <span className="h-px w-10 bg-[#38534A]/50 dark:bg-[#8AB3A0]/50 shrink-0" />
                <span>
                  {isRtl
                    ? "تعرفه‌ها و سطوح سرمایه‌گذاری • TRANSPARENT PRICING"
                    : "SERVICE PACKAGES & INVESTMENT TIERS"}
                </span>
              </div>

              <h1
                className={`text-2xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight leading-[1.25] ${
                  isRtl
                    ? "font-[family-name:var(--font-vazirmatn)]"
                    : "font-[family-name:var(--font-gendy)]"
                }`}
              >
                {isRtl ? (
                  <>
                    سرمایه‌گذاری شفاف و متناسب با{" "}
                    <span className="text-[#38534A] dark:text-[#8AB3A0] underline decoration-[#4F0001] decoration-2 underline-offset-[10px]">
                      مقیاس رشد سازمان
                    </span>
                  </>
                ) : (
                  <>
                    Transparent Investment Models Engineered for{" "}
                    <span className="text-[#38534A] dark:text-[#8AB3A0] underline decoration-[#4F0001] decoration-2 underline-offset-[10px]">
                      Enterprise Scale
                    </span>
                  </>
                )}
              </h1>

              <p className="text-sm sm:text-base md:text-lg text-foreground/75 leading-relaxed font-normal">
                {isRtl
                  ? "بسته‌های ساختاریافته، شفاف و منعطف در حوزه‌های مهندسی وب، سئو تکنیکال، تولید محتوا و هویت دیجیتال با تضمین بالاترین استاندارد اجرایی."
                  : "Structured, transparent, and modular service packages across web engineering, technical SEO, media production, and digital identity with guaranteed execution rigor."}
              </p>

              {/* Trust & Transparency Value Chips */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#38534A]/10 dark:bg-[#8AB3A0]/15 border border-[#38534A]/20 dark:border-[#8AB3A0]/25 text-xs font-semibold text-[#38534A] dark:text-[#8AB3A0]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38534A] dark:bg-[#8AB3A0]" />
                  <span>{isRtl ? "شفافیت ۱۰۰٪ هزینه‌ها بدون هزینه پنهان" : "100% Transparent Scopes"}</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-raised border border-foreground/10 text-xs font-semibold text-foreground/75">
                  <span>{isRtl ? "پشتیبانی فنی و گزارش‌دهی دوره‌ای" : "Dedicated Support & Reporting"}</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-raised border border-foreground/10 text-xs font-semibold text-foreground/75">
                  <span>{isRtl ? "امکان سفارشی‌سازی کامل بر اساس نیاز" : "Custom Tailored SOWs"}</span>
                </div>
              </div>

              {/* CTA Action */}
              <div className="pt-3">
                <Link
                  href="/#contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#38534A] hover:bg-[#2B4039] text-white font-semibold text-xs sm:text-sm tracking-wide transition-all shadow-md active:scale-95"
                >
                  <span>{isRtl ? "درخواست پیش‌فاکتور و مشاوره اختصاصی" : "Request Custom Proposal"}</span>
                  <svg className={`w-3.5 h-3.5 ${isRtl ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ── Backend API Status & Transparent Notice ────────────────── */}
          {apiError && (
            <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </span>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-amber-800 dark:text-amber-300 mb-1">
                    {isRtl
                      ? "اطلاعیه اتصال وب‌سرویس تعرفه‌ها (API)"
                      : "Pricing API Connection Notice"}
                  </p>
                  <p className="text-xs text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
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
                className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 p-3 rounded-2xl bg-panel/70 border border-foreground/10 backdrop-blur-md"
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
                          : "bg-raised text-foreground/70 hover:text-foreground hover:bg-panel border border-foreground/10"
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
                              : "bg-foreground/10 text-foreground/60"
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
                          ? "border-mint/60 bg-gradient-to-b from-panel via-raised to-panel shadow-[0_16px_36px_rgba(0,0,0,0.1)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.4)] lg:scale-[1.02] z-10"
                          : "border-foreground/10 bg-panel hover:border-mint/30"
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
                          <h2
                            className={`text-xl sm:text-[22px] lg:whitespace-nowrap font-bold tracking-tight text-foreground ${
                              plan.badgeFa
                                ? isRtl
                                  ? "pl-24"
                                  : "pr-24"
                                : ""
                            }`}
                          >
                            {isRtl ? plan.nameFa : plan.nameEn}
                          </h2>
                          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-foreground/60 min-h-[44px]">
                            {isRtl ? plan.descriptionFa : plan.descriptionEn}
                          </p>
                        </div>

                        {/* Features Checklist */}
                        <div className="space-y-3 pt-3 border-t border-foreground/10">
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
                      <div className="pt-6 sm:pt-8 mt-6 border-t border-foreground/10">
                        <Link
                          href={plan.ctaLink || "/#contact"}
                          className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 px-5 text-xs sm:text-sm font-bold transition-all min-h-[44px] ${
                            plan.popular
                              ? "bg-lime text-ink shadow-[0_0_20px_rgba(178,248,0,0.25)] hover:scale-[1.02] active:scale-95"
                              : "bg-raised border border-foreground/10 text-foreground hover:bg-panel hover:border-mint/30"
                          }`}
                        >
                          <span>
                            {isRtl ? "درخواست مشاوره و استعلام" : "Request Consultation"}
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
            <div className="py-16 text-center rounded-2xl bg-panel border border-foreground/10">
              <p className="text-sm text-foreground/50">
                {isRtl
                  ? "پلنی برای نمایش وجود ندارد."
                  : "No pricing plans found."}
              </p>
            </div>
          )}

          {/* ── 4. Bottom Custom Consultation Callout ──────────────────── */}
          <section className="mt-16 sm:mt-20 p-8 sm:p-10 rounded-3xl bg-panel border border-foreground/10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-start">
            <div>
              <h2 className="font-display text-xl sm:text-2xl lg:whitespace-nowrap font-bold text-foreground mb-2">
                {isRtl
                  ? "نیاز به پلن سفارشی یا مشاوره تلفنی دارید؟"
                  : "Need a Custom Strategy or Enterprise Quote?"}
              </h2>
              <p className="text-xs sm:text-sm text-foreground/60 max-w-xl">
                {isRtl
                  ? "اگر پروژه شما نیازمندی‌های اختصاصی فراتر از پلن‌های استاندارد دارد، کارشناسان آن‌ساپ آماده تدوین بسته شخصی‌سازی‌شده برای شما هستند."
                  : "Contact our growth specialists to configure a tailored package aligned with your specific KPI roadmap."}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/services"
                className="px-5 py-3 rounded-xl bg-raised hover:bg-panel border border-foreground/10 text-xs sm:text-sm font-semibold text-foreground hover:text-mint transition-all"
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
