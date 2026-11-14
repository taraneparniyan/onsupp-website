"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { scrollToSection } from "@/lib/scroll";

export default function ServicesHero({
  isRtl,
}: {
  isRtl: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();

  const handleScrollToServices = () => {
    scrollToSection("services-overview");
  };

  const handleScrollToConsultation = () => {
    scrollToSection("services-cta");
  };

  return (
    <section
      id="services-hero"
      aria-label={isRtl ? "خدمات تخصصی آن‌ساپ" : "OnSupp Core Services"}
      className="relative w-full min-h-[88vh] min-h-[88svh] sm:min-h-[92vh] sm:min-h-[92svh] lg:min-h-[100vh] lg:min-h-[100svh] flex items-end sm:items-center pt-24 pb-16 sm:pt-28 sm:pb-20 lg:py-0 overflow-hidden bg-[#38534A] dark:bg-[#17221E] text-white border-b border-white/10 select-none"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* ─── Immersive Background Imagery (Harmonized with Main Hero Architecture) ─── */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <Image
          src="/images/hero/hero-media-studio.webp"
          alt={
            isRtl
              ? "استودیو و دپارتمان‌های تخصصی خدمات دیجیتال آن‌ساپ"
              : "OnSupp Studio & Specialized Digital Departments"
          }
          fill
          priority
          sizes="100vw"
          className="object-cover object-center w-full h-full scale-[1.01]"
          quality={90}
        />

        {/* Deep Editorial Multi-Layer Scrim for High-Contrast Legibility */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#17221E]/95 via-[#17221E]/75 to-[#17221E]/45 dark:from-[#121413]/95 dark:via-[#17221E]/80 dark:to-[#121413]/55"
        />

        {/* Directional Side Scrim for Text Column Clarity */}
        <div
          aria-hidden="true"
          className={`absolute inset-0 ${
            isRtl
              ? "bg-gradient-to-l from-[#17221E]/90 via-[#17221E]/55 to-transparent"
              : "bg-gradient-to-r from-[#17221E]/90 via-[#17221E]/55 to-transparent"
          }`}
        />

        {/* Subtle Architectural Grid Hairlines (Minimal Editorial Discipline) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.35) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />
      </div>

      {/* ─── Main Editorial Content Container ─── */}
      <div className="relative z-20 mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-end">
          {/* ── Primary Narrative & Typography Column (8 Cols on Desktop) ── */}
          <div className="lg:col-span-8 text-start">
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-5 sm:space-y-6"
            >
              {/* Breadcrumb Navigation */}
              <nav
                aria-label={isRtl ? "مسیر دسترسی" : "Breadcrumbs"}
                className="flex items-center gap-2 text-xs font-mono text-white/60 select-none"
              >
                <Link href="/" className="hover:text-white transition-colors">
                  {isRtl ? "خانه" : "Home"}
                </Link>
                <span className="opacity-40">/</span>
                <span className="text-white/90 font-medium">
                  {isRtl ? "خدمات تخصصی" : "Services"}
                </span>
              </nav>

              {/* Eyebrow Label with Architectural Rule */}
              <div className="inline-flex items-center gap-3 text-xs sm:text-sm font-bold tracking-widest text-[#8AB3A0] uppercase">
                <span className="h-px w-10 bg-[#8AB3A0]/70 shrink-0" />
                <span>
                  {isRtl
                    ? "معماری جامع خدمات • ONSUPP CAPABILITIES"
                    : "COMPREHENSIVE DIGITAL ARCHITECTURE"}
                </span>
              </div>

              {/* Single-Line Primary Page Heading (H1) */}
              <h1
                className={`text-2xl sm:text-4xl md:text-5xl lg:text-[38px] xl:text-[44px] lg:whitespace-nowrap font-black text-white tracking-tight leading-[1.28] [text-shadow:_0_2px_16px_rgba(0,0,0,0.45)] ${
                  isRtl
                    ? "font-[family-name:var(--font-vazirmatn)]"
                    : "font-[family-name:var(--font-gendy)]"
                }`}
              >
                {isRtl ? (
                  <>
                    ارائه خدمات{" "}
                    <span className="text-[#8AB3A0] underline decoration-[#4F0001] decoration-2 underline-offset-[12px]">
                      تخصصی
                    </span>{" "}
                    در بالاترین سطح کیفیت
                  </>
                ) : (
                  <>
                    Delivering{" "}
                    <span className="text-[#8AB3A0] underline decoration-[#4F0001] decoration-2 underline-offset-[12px]">
                      Specialized
                    </span>{" "}
                    Digital Services
                  </>
                )}
              </h1>

              {/* Concise Supporting Description */}
              <p className="text-sm sm:text-base md:text-lg text-white/85 max-w-2xl leading-[1.85] font-normal">
                {isRtl
                  ? "از مهندسی پلتفرم‌های مقیاس‌پذیر وب، سئو تکنیکال و اتوماسیون فروش تا تولیدات سینمایی، موشن‌گرافیک و هویت‌سازی دیجیتال؛ ۷ دپارتمان تخصصی آن‌ساپ با رویکردی داده‌محور در کنار رشد پایدار برند شماست."
                  : "From scalable web platform engineering, technical SEO, and CRM automation to cinema-grade studio production and brand identity — OnSupp’s 7 specialized departments engineer sustainable market leadership."}
              </p>

              {/* Action Buttons Harmonized with Design System Radius */}
              <div className="pt-3 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={handleScrollToServices}
                  className={`group inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-full bg-[#38534A] hover:bg-[#2B4039] text-[#F8F9FA] border border-[#8AB3A0]/40 font-semibold text-xs sm:text-sm tracking-wide transition-all duration-300 shadow-[0_10px_28px_rgba(0,0,0,0.35)] cursor-pointer ${
                    isRtl
                      ? "font-[family-name:var(--font-vazirmatn)]"
                      : "font-[family-name:var(--font-gendy)]"
                  }`}
                >
                  <span>{isRtl ? "مشاهده دپارتمان‌های تخصصی" : "Explore Specialized Departments"}</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${
                      isRtl ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={handleScrollToConsultation}
                  className={`inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-white/[0.08] hover:bg-white/[0.16] text-white border border-white/25 hover:border-white/45 backdrop-blur-md font-medium text-xs sm:text-sm tracking-wide transition-all duration-300 cursor-pointer ${
                    isRtl
                      ? "font-[family-name:var(--font-vazirmatn)]"
                      : "font-[family-name:var(--font-gendy)]"
                  }`}
                >
                  <span>{isRtl ? "دریافت مشاوره اختصاصی" : "Request Strategic Consultation"}</span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* ── Architectural Status Panel (4 Cols on Desktop, Controlled Glassmorphism, Design System Radius) ── */}
          <div className="lg:col-span-4 flex lg:justify-end">
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="w-full lg:max-w-[360px] rounded-card-lg bg-[#1F1F1E]/75 dark:bg-[#121413]/80 backdrop-blur-md border border-white/15 p-6 sm:p-7 space-y-5 shadow-[0_16px_40px_rgba(0,0,0,0.3)]"
            >
              <div className="flex items-center justify-between border-b border-white/12 pb-4">
                <span className="text-xs font-semibold tracking-wider text-[#8AB3A0] uppercase">
                  {isRtl ? "شاخص کلیدی خدمات" : "SERVICE ARCHITECTURE"}
                </span>
                <span className="inline-block w-2 h-2 rounded-full bg-[#8AB3A0]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border-e border-white/10 pe-4">
                  <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {isRtl ? "۰۷" : "07"}
                  </div>
                  <div className="text-xs text-white/70 mt-1">
                    {isRtl ? "دپارتمان تخصصی" : "Core Departments"}
                  </div>
                </div>

                <div className="ps-2">
                  <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {isRtl ? "۳۶۰°" : "360°"}
                  </div>
                  <div className="text-xs text-white/70 mt-1">
                    {isRtl ? "پوشش کامل دیجیتال" : "Full-Cycle Execution"}
                  </div>
                </div>
              </div>

              <p className="text-xs text-white/70 leading-relaxed pt-1 border-t border-white/10">
                {isRtl
                  ? "یکپارچگی کامل میان تیم‌های استراتژی، استودیو، طراحی رابط کاربری و مهندسی نرم‌افزار."
                  : "Unified execution across strategy, cinema studio, UI/UX design, and software engineering."}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
