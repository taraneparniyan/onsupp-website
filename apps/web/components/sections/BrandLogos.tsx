"use client";

import React, { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { staggerContainer, staggerItem } from "@/lib/motion";

/**
 * Placeholder / Demo brand partner logos.
 * Easily replace or extend these objects with real SVGs, URLs, or image paths.
 */
export type BrandLogo = {
  id: string;
  nameFa: string;
  nameEn: string;
  categoryFa?: string;
  categoryEn?: string;
  svgIcon?: React.ReactNode;
};

const DEFAULT_BRANDS: BrandLogo[] = [
  {
    id: "ecommerce",
    nameFa: "فروشگاه‌های آنلاین",
    nameEn: "E-Commerce",
    categoryFa: "تجارت الکترونیک و فروش",
    categoryEn: "Online Retail",
    svgIcon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    id: "startups",
    nameFa: "استارتاپ‌ها",
    nameEn: "Startups",
    categoryFa: "پلتفرم‌های در حال رشد",
    categoryEn: "Scale-ups",
    svgIcon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    id: "saas-software",
    nameFa: "نرم‌افزار و اپ",
    nameEn: "SaaS & Apps",
    categoryFa: "محصولات دیجیتال",
    categoryEn: "Digital Products",
    svgIcon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
  },
  {
    id: "services-logistics",
    nameFa: "خدمات و لجستیک",
    nameEn: "Services",
    categoryFa: "اتوماسیون و عملیات",
    categoryEn: "Operations",
    svgIcon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    id: "fintech-finance",
    nameFa: "مالی و فین‌تک",
    nameEn: "FinTech",
    categoryFa: "سامانه‌های مالی",
    categoryEn: "Financial Tech",
    svgIcon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    id: "enterprise-b2b",
    nameFa: "شرکت‌های سازمانی",
    nameEn: "Enterprise B2B",
    categoryFa: "سامانه‌های اختصاصی",
    categoryEn: "Custom Systems",
    svgIcon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
        <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
        <line x1="6" y1="6" x2="6.01" y2="6" />
        <line x1="6" y1="18" x2="6.01" y2="18" />
      </svg>
    ),
  },
  {
    id: "media-education",
    nameFa: "رسانه و آموزش",
    nameEn: "Media & EdTech",
    categoryFa: "پلتفرم‌های محتوایی",
    categoryEn: "Content Platforms",
    svgIcon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    ),
  },
];

interface BrandLogosProps {
  brands?: BrandLogo[];
  className?: string;
}

export default function BrandLogos({
  brands = DEFAULT_BRANDS,
  className = "",
}: BrandLogosProps) {
  const { lang } = useLanguage();
  const isRtl = lang === "fa";
  const prefersReducedMotion = useReducedMotion();

  const [currentIndex, setCurrentIndex] = useState(0);
  const mobileScrollRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Update currentIndex on mobile swipe/scroll
  const handleScroll = () => {
    const container = mobileScrollRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    let closestIdx = 0;
    let minDistance = Infinity;

    cardRefs.current.forEach((el, idx) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const dist = isRtl
        ? Math.abs(rect.right - containerRect.right)
        : Math.abs(rect.left - containerRect.left);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = idx;
      }
    });

    setCurrentIndex(closestIdx);
  };

  const scrollToCard = (idx: number) => {
    const target = cardRefs.current[idx];
    if (target) {
      target.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "nearest",
        inline: "start",
      });
      setCurrentIndex(idx);
    }
  };

  const scrollNext = () => {
    const nextIdx = Math.min(brands.length - 1, currentIndex + 1);
    scrollToCard(nextIdx);
  };

  const scrollPrev = () => {
    const prevIdx = Math.max(0, currentIndex - 1);
    scrollToCard(prevIdx);
  };

  return (
    <section
      id="brand-partners"
      className={`w-full py-10 sm:py-16 bg-[#121517] border-b border-white/5 relative overflow-hidden ${className}`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Subtle background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[160px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-[1600px] px-4 sm:px-12 lg:px-24">
        <ScrollReveal>
          {/* Header / Micro-label & Mobile Arrows */}
          <div className="flex items-center justify-between gap-3 mb-6 sm:mb-10">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse shrink-0" />
              <span className="text-[11px] sm:text-[13px] font-semibold tracking-wider text-white/50 uppercase truncate">
                {isRtl
                  ? "حوزه‌های تخصصی همکاری و توسعه راهکارهای دیجیتال"
                  : "Industries & Digital Sectors We Serve"}
              </span>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <span className="hidden xs:inline text-[11px] font-medium text-white/35 font-mono">
                {isRtl ? "اکوسیستم کسب‌وکارها" : "Business Verticals"}
              </span>

              {/* Subtle Mobile Navigation Arrows */}
              <div className="flex sm:hidden items-center gap-1">
                <motion.button
                  type="button"
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
                  onClick={scrollPrev}
                  disabled={currentIndex <= 0}
                  aria-label={isRtl ? "برند قبلی" : "Previous brand"}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.04] border border-white/10 text-white/60 hover:text-lime hover:border-lime/30 active:scale-95 disabled:opacity-20 disabled:pointer-events-none transition-all duration-200"
                >
                  <svg
                    className={`w-3.5 h-3.5 ${isRtl ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </motion.button>

                <motion.button
                  type="button"
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
                  onClick={scrollNext}
                  disabled={currentIndex >= brands.length - 1}
                  aria-label={isRtl ? "برند بعدی" : "Next brand"}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.04] border border-white/10 text-white/60 hover:text-lime hover:border-lime/30 active:scale-95 disabled:opacity-20 disabled:pointer-events-none transition-all duration-200"
                >
                  <svg
                    className={`w-3.5 h-3.5 ${isRtl ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Desktop Grid Layout (sm and up) - EXACT original layout preserved with Staggered Motion */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="hidden sm:grid sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 items-center"
          >
            {brands.map((brand) => (
              <motion.div
                key={brand.id}
                variants={staggerItem}
                whileHover={prefersReducedMotion ? undefined : { y: -3, scale: 1.02 }}
                className="group relative flex flex-col items-center justify-center py-4 px-3 rounded-2xl bg-panel/40 border border-white/5 hover:border-white/15 hover:bg-raised/60 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-default select-none shadow-sm"
              >
                {/* Optional top accent hover glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Icon / Glyph */}
                <div className="text-white/40 group-hover:text-lime transition-colors duration-300 mb-2">
                  {brand.svgIcon}
                </div>

                {/* Brand Name */}
                <span className="text-sm font-bold text-white/70 group-hover:text-white transition-colors duration-300 tracking-tight">
                  {isRtl ? brand.nameFa : brand.nameEn}
                </span>

                {/* Subtle Tag / Category */}
                <span className="text-[10px] text-white/30 group-hover:text-white/50 transition-colors duration-300 mt-0.5">
                  {isRtl ? brand.categoryFa : brand.categoryEn}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Mobile View (sm:hidden): Compact Single Horizontal Row with Touch Swipe */}
          <div className="sm:hidden relative">
            <div
              ref={mobileScrollRef}
              onScroll={handleScroll}
              className="flex flex-row items-center gap-2.5 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-1 px-4 -mx-4 overscroll-x-contain touch-manipulation"
            >
              {brands.map((brand, idx) => (
                <div
                  key={brand.id}
                  ref={(el) => {
                    cardRefs.current[idx] = el;
                  }}
                  className="group relative flex-none w-[138px] flex flex-col items-center justify-center py-3.5 px-3 rounded-2xl bg-panel/40 border border-white/5 active:border-mint/30 active:bg-raised/60 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none snap-start shrink-0 shadow-sm"
                >
                  {/* Top accent glow */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  {/* Icon / Glyph */}
                  <div className="text-white/40 group-hover:text-lime group-active:text-lime transition-colors duration-300 mb-2">
                    {brand.svgIcon}
                  </div>

                  {/* Brand Name */}
                  <span className="text-xs font-bold text-white/75 group-hover:text-white group-active:text-white transition-colors duration-300 tracking-tight text-center">
                    {isRtl ? brand.nameFa : brand.nameEn}
                  </span>

                  {/* Subtle Tag / Category */}
                  <span className="text-[10px] text-white/35 group-hover:text-white/50 group-active:text-white/50 transition-colors duration-300 mt-0.5 text-center truncate max-w-full">
                    {isRtl ? brand.categoryFa : brand.categoryEn}
                  </span>
                </div>
              ))}
            </div>

            {/* Subtle Progress Indicator Pills on Mobile */}
            <div className="flex items-center justify-center gap-1.5 mt-3">
              {brands.map((brand, idx) => (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => scrollToCard(idx)}
                  aria-label={isRtl ? `برند ${brand.nameFa}` : `Brand ${brand.nameEn}`}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    currentIndex === idx
                      ? "w-4 bg-lime shadow-[0_0_8px_rgba(178,248,0,0.4)]"
                      : "w-1 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
