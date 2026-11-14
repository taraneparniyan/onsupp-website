"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { scrollToSection } from "@/lib/scroll";

export default function PortfolioHero({ isRtl }: { isRtl: boolean }) {
  const prefersReducedMotion = useReducedMotion();

  const handleScrollToShowcase = () => {
    scrollToSection("showcase");
  };

  return (
    <section
      id="portfolio-hero"
      aria-label={isRtl ? "ویترین نمونه‌کارها و پروژه‌های آن‌ساپ" : "OnSupp Portfolio & Case Studies Showcase"}
      className="relative w-full pt-28 sm:pt-36 lg:pt-40 pb-16 sm:pb-20 lg:pb-24 overflow-hidden border-b border-black/[0.06] dark:border-white/[0.08] bg-[#F8F9FA] dark:bg-[#111416] transition-colors"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Subtle Atmospheric Brand Glows & Architectural Grid (No Neon, Strict OnSupp Identity) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden select-none"
      >
        <div className="absolute -top-32 start-1/2 -translate-x-1/2 w-[700px] sm:w-[950px] h-[380px] bg-[#38534A]/[0.06] dark:bg-[#38534A]/[0.15] rounded-full blur-[110px]" />
        <div className="absolute top-1/3 -start-24 w-[360px] h-[360px] bg-[#4F0001]/[0.04] dark:bg-[#4F0001]/[0.12] rounded-full blur-[90px]" />
        
        {/* Architectural Grid Hairlines */}
        <div
          className="absolute inset-0 opacity-[0.035] dark:opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-14">
        {/* ── Breadcrumb Navigation ── */}
        <motion.nav
          aria-label={isRtl ? "مسیر دسترسی" : "Breadcrumbs"}
          initial={prefersReducedMotion ? false : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-2 text-xs font-mono text-foreground/50 mb-6 sm:mb-8 select-none"
        >
          <Link href="/" className="hover:text-foreground transition-colors">
            {isRtl ? "خانه" : "Home"}
          </Link>
          <span className="opacity-40">/</span>
          <span className="text-foreground/90 font-medium">
            {isRtl ? "نمونه‌کارها و پروژه‌ها" : "Portfolio & Case Studies"}
          </span>
        </motion.nav>

        {/* ── Main Hero Editorial Content ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Main Narrative Column (8 Cols) */}
          <div className="lg:col-span-8 text-start space-y-5 sm:space-y-6">
            {/* Eyebrow Label with Architectural Rule */}
            <div className="inline-flex items-center gap-3 text-xs sm:text-sm font-bold tracking-widest text-[#38534A] dark:text-[#8AB3A0] uppercase">
              <span className="h-px w-10 bg-[#38534A]/50 dark:bg-[#8AB3A0]/50 shrink-0" />
              <span>
                {isRtl
                  ? "ویترین پروژه‌ها و مطالعات موردی • ARCHITECTURE & SHOWCASE"
                  : "PROVEN MILESTONES & CASE STUDIES"}
              </span>
            </div>

            {/* Primary H1 Heading */}
            <h1
              className={`text-2xl sm:text-4xl md:text-5xl lg:text-[44px] xl:text-[50px] font-black text-foreground tracking-tight leading-[1.25] ${
                isRtl
                  ? "font-[family-name:var(--font-vazirmatn)]"
                  : "font-[family-name:var(--font-gendy)]"
              }`}
            >
              {isRtl ? (
                <>
                  خلق تمایز دیجیتال از طریق{" "}
                  <span className="text-[#38534A] dark:text-[#8AB3A0] underline decoration-[#4F0001] decoration-2 underline-offset-[10px]">
                    طراحی و مهندسی دقیق
                  </span>
                </>
              ) : (
                <>
                  Engineering Sustainable Growth Through{" "}
                  <span className="text-[#38534A] dark:text-[#8AB3A0] underline decoration-[#4F0001] decoration-2 underline-offset-[10px]">
                    Tailored Digital Platforms
                  </span>
                </>
              )}
            </h1>

            {/* Concise Supporting Description */}
            <p className="text-sm sm:text-base md:text-lg text-foreground/75 max-w-2xl leading-[1.85] font-normal">
              {isRtl
                ? "مرور منتخبی از پروژه‌های تحول دیجیتال، سئو تکنیکال، توسعه سامانه‌های اختصاصی و تولیدات استودیو آن‌ساپ که با رویکردی داده‌محور و استانداردهای کیفی بالا به ثمر نشسته‌اند."
                : "Explore our verified milestones across scalable web platforms, technical SEO, cinema studio productions, and bespoke enterprise systems engineered for measurable market leadership."}
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={handleScrollToShowcase}
                className={`group inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-[#38534A] hover:bg-[#2B4039] text-[#F8F9FA] border border-[#8AB3A0]/40 font-semibold text-xs sm:text-sm tracking-wide transition-all duration-300 shadow-md cursor-pointer ${
                  isRtl
                    ? "font-[family-name:var(--font-vazirmatn)]"
                    : "font-[family-name:var(--font-gendy)]"
                }`}
              >
                <span>{isRtl ? "مشاهده و فیلتر پروژه‌ها" : "Explore Case Studies"}</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${
                    isRtl ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <Link
                href="/#contact"
                className={`inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-full bg-raised hover:bg-panel border border-foreground/15 text-foreground font-medium text-xs sm:text-sm tracking-wide transition-all duration-300 cursor-pointer ${
                  isRtl
                    ? "font-[family-name:var(--font-vazirmatn)]"
                    : "font-[family-name:var(--font-gendy)]"
                }`}
              >
                <span>{isRtl ? "مشاوره برای پروژه مشابه" : "Request Project Consultation"}</span>
              </Link>
            </div>
          </div>

          {/* Metrics & Architecture Status Panel (4 Cols) */}
          <div className="lg:col-span-4 flex lg:justify-end">
            <div className="w-full lg:max-w-[360px] rounded-card-lg bg-panel/85 border border-foreground/10 p-6 sm:p-7 space-y-5 shadow-lg backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
                <span className="text-xs font-semibold tracking-wider text-[#38534A] dark:text-[#8AB3A0] uppercase">
                  {isRtl ? "شاخص‌های عملکرد پروژه‌ها" : "DELIVERY BENCHMARKS"}
                </span>
                <span className="inline-block w-2 h-2 rounded-full bg-[#38534A] dark:bg-[#8AB3A0]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border-e border-foreground/10 pe-4">
                  <div className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                    {isRtl ? "۳۵+" : "35+"}
                  </div>
                  <div className="text-xs text-foreground/65 mt-1">
                    {isRtl ? "پروژه تحویل‌شده" : "Completed Projects"}
                  </div>
                </div>

                <div className="ps-2">
                  <div className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                    {isRtl ? "۱۰۰٪" : "100%"}
                  </div>
                  <div className="text-xs text-foreground/65 mt-1">
                    {isRtl ? "کدنویسی اختصاصی" : "Custom Built Code"}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-foreground/10">
                <div className="flex items-center justify-between text-xs text-foreground/75 py-1">
                  <span>{isRtl ? "میانگین بهبود Core Web Vitals" : "Avg. Web Vitals Boost"}</span>
                  <span className="font-mono font-bold text-[#38534A] dark:text-[#8AB3A0]">90%+</span>
                </div>
                <div className="flex items-center justify-between text-xs text-foreground/75 py-1">
                  <span>{isRtl ? "حوزه‌های تخصصی تحت پوشش" : "Specialized Industries"}</span>
                  <span className="font-mono font-bold text-[#38534A] dark:text-[#8AB3A0]">
                    {isRtl ? "۸ حوزه" : "8 Sectors"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
