"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

import {
  type PricingCategory,
  type PricingPlan,
  CANONICAL_PRICING_CATEGORIES,
  BACKEND_URL,
} from "@/lib/pricing";

export default function PricingPlans() {
  const { lang } = useLanguage();
  const isRtl = lang === "fa";
  const [categories, setCategories] = useState<PricingCategory[]>(
    CANONICAL_PRICING_CATEGORIES
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    CANONICAL_PRICING_CATEGORIES[0]?.id ?? null
  );

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/v1/pricing/categories`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
          setSelectedCategoryId(data[0].id);
        }
      })
      .catch(() => {
        setCategories(CANONICAL_PRICING_CATEGORIES);
      });
  }, []);

  const currentCategory =
    categories.find((c) => c.id === selectedCategoryId) || categories[0];

  if (!currentCategory) return null;

  return (
    <section className="w-full px-2 sm:px-[10px] mt-2 sm:mt-[10px]" id="pricing">
      <div
        dir={isRtl ? "rtl" : "ltr"}
        className="w-full rounded-lg sm:rounded-xl border border-foreground/10 bg-panel px-4 py-10 sm:px-8 sm:py-16 lg:px-16 lg:py-24"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-12">
          <div>
            <span className="inline-flex items-center gap-3 text-xs sm:text-sm font-semibold tracking-widest text-mint">
              <span className="h-px w-8 bg-mint" />
              {isRtl ? "تعرفه‌ها و پلن‌های سرمایه‌گذاری" : "PRICING & PACKAGES"}
            </span>
            <h2 className="mt-3 sm:mt-5 text-2xl sm:text-3xl md:text-5xl font-bold leading-tight tracking-tight text-foreground">
              {isRtl
                ? "پلن‌های شفاف برای هر نوع خدمت"
                : "Transparent Pricing Tailored For Growth"}
            </h2>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg leading-7 sm:leading-8 text-foreground/60 max-w-2xl">
              {isRtl
                ? "برای هر یک از خدمات ما، پلن‌های بهینه‌سازی شده براساس بودجه و هدف کسب‌وکار شما طراحی شده است."
                : "Choose from specialized packages designed for your scale and marketing objectives."}
            </p>
          </div>
        </div>

        {/* Service Category Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-8 sm:mb-14 border-b border-foreground/10 pb-4 sm:pb-6">
          {categories.map((cat) => {
            const isActive = cat.id === selectedCategoryId;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 border min-h-[40px] flex items-center justify-center ${
                  isActive
                    ? "bg-leaf text-ink border-transparent shadow-lg shadow-leaf/20 scale-105"
                    : "bg-raised text-foreground/70 border-foreground/10 hover:text-foreground hover:bg-panel"
                }`}
              >
                {isRtl ? cat.titleFa : cat.titleEn}
              </button>
            );
          })}
        </div>

        {/* Dynamic Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {currentCategory.plans.map((plan) => {
            const isContact = plan.priceType === "contact";
            const hasDiscount = Boolean(
              isRtl ? plan.discountPriceFa : plan.discountPriceEn
            );

            return (
              <div
                key={plan.id}
                onMouseMove={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
                  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
                }}
                className={`group relative overflow-hidden rounded-lg sm:rounded-xl p-5 sm:p-7 lg:p-8  border flex flex-col justify-between transition-all duration-300 ${
                  plan.popular
                    ? "border-mint bg-gradient-to-b from-mint/15 via-mint/5 to-raised shadow-md lg:scale-[1.02] z-10"
                    : "border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/[0.02] hover:border-mint/40 hover:-translate-y-1"
                }`}
              >
                {/* Mouse Tracking Glow Effect */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(240px circle at var(--mx, -100px) var(--my, -100px), rgba(159,196,176,0.18), transparent 70%)",
                  }}
                />

                {/* Popular / Off Ribbon Badge */}
                {(isRtl ? plan.badgeFa : plan.badgeEn) && (
                  <div className={`absolute top-4 sm:top-5 ${isRtl ? "left-4 sm:left-5" : "right-4 sm:right-5"}`}>
                    <span className="rounded-full border border-mint/40 bg-mint/20 px-3 py-1 text-[11px] sm:text-xs font-bold text-mint shadow-md">
                      {isRtl ? plan.badgeFa : plan.badgeEn}
                    </span>
                  </div>
                )}

                <div className="relative z-10 space-y-5 sm:space-y-6">
                  {/* Title & Description */}
                  <div>
                    <h3 className={`text-xl sm:text-2xl font-bold tracking-tight text-foreground ${plan.badgeFa ? (isRtl ? "pl-20 sm:pl-24" : "pr-20 sm:pr-24") : ""}`}>
                      {isRtl ? plan.nameFa : plan.nameEn}
                    </h3>
                    <p className="mt-2 text-xs leading-6 text-foreground/60 min-h-[40px] sm:min-h-[48px]">
                      {isRtl ? plan.descriptionFa : plan.descriptionEn}
                    </p>
                  </div>

                  {/* Price Box */}
                  <div className="py-3.5 sm:py-4 border-y border-foreground/10 space-y-1">
                    {isContact ? (
                      <div className="py-1">
                        <span className="text-2xl sm:text-3xl font-black text-mint block">
                          {isRtl ? "تماس بگیرید" : "Contact Us"}
                        </span>
                        <span className="text-xs font-semibold text-foreground/50 mt-1 block">
                          {isRtl ? plan.periodFa || "قیمت توافقی / مشاوره" : plan.periodEn || "Custom Quote"}
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          {/* Original Price if Discounted */}
                          {hasDiscount && (
                            <span className="text-base sm:text-lg line-through text-foreground/40 font-semibold">
                              {isRtl ? plan.priceFa : plan.priceEn}
                            </span>
                          )}
                          <span className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-mint">
                            {hasDiscount
                              ? isRtl ? plan.discountPriceFa : plan.discountPriceEn
                              : isRtl ? plan.priceFa : plan.priceEn}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-foreground/50 block">
                          {isRtl ? plan.periodFa : plan.periodEn}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 pt-1 sm:pt-2">
                    <span className="text-[11px] sm:text-xs font-bold tracking-wider text-mint uppercase block">
                      {isRtl ? "امکانات و خدمات شامل:" : "WHAT'S INCLUDED:"}
                    </span>
                    <ul className="space-y-2 sm:space-y-2.5">
                      {(isRtl ? plan.featuresFa : plan.featuresEn).map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/80 leading-6">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mint/20 text-mint mt-0.5">
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Call to Action Button */}
                <div className="relative z-10 pt-6 sm:pt-8 mt-5 sm:mt-6">
                  <a
                    href={plan.ctaLink || "#contact"}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 px-5 text-xs sm:text-sm font-bold transition-all shadow-md min-h-[44px] ${
                      plan.popular
                        ? "bg-leaf text-ink hover:bg-patch scale-100 hover:scale-[1.02]"
                        : "bg-raised border border-foreground/20 text-foreground hover:bg-leaf hover:text-ink hover:border-transparent"
                    }`}
                  >
                    <span>
                      {isContact
                        ? isRtl ? "تماس و مشاوره رایگان" : "Contact Sales"
                        : isRtl ? plan.ctaFa || "سفارش پلن" : plan.ctaEn || "Select Plan"}
                    </span>
                    <svg className={`h-4 w-4 ${isRtl ? "" : "rotate-180"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
