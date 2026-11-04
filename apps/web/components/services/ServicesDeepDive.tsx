"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { DETAILED_SERVICES_DATA, type ServiceDetailItem } from "./services-data";
import { CategoryIcon } from "./CategoryIcon";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { scrollToSection } from "@/lib/scroll";

export default function ServicesDeepDive({
  isRtl,
  services = DETAILED_SERVICES_DATA,
  onConsultationRequest,
}: {
  isRtl: boolean;
  services?: ServiceDetailItem[];
  onConsultationRequest?: (serviceId: string) => void;
}) {
  const prefersReducedMotion = useReducedMotion();

  const handleRequestConsultation = (serviceId: string) => {
    if (onConsultationRequest) {
      onConsultationRequest(serviceId);
    }
    // Smooth scroll to the contact CTA section
    scrollToSection("services-cta");
  };

  return (
    <section
      id="services-deep-dive"
      aria-label={isRtl ? "جزئیات جامع خدمات و دپارتمان‌ها" : "Comprehensive Service Dossiers"}
      className="relative w-full py-16 sm:py-28 bg-background border-b border-black/[0.06] dark:border-white/[0.08]"
    >
      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-14">
        {/* ─── Section Header ─── */}
        <ScrollReveal once viewportMargin="0px">
          <div className="max-w-3xl mb-16 sm:mb-24">
            {/* Eyebrow - Matching About Us Section Pattern */}
            <div className="inline-flex items-center gap-3 text-xs sm:text-sm font-bold tracking-widest text-[#38534A] dark:text-[#8AB3A0] uppercase mb-4">
              <span className="h-px w-10 bg-[#38534A]/50 dark:bg-[#8AB3A0]/50" />
              <span>{isRtl ? "بخش دوم: بررسی تخصصی دپارتمان‌ها" : "SECTION 03 • IN-DEPTH DOSSIERS"}</span>
            </div>

            <h2
              className={`text-2xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-[1.25] mb-4 ${
                isRtl
                  ? "font-[family-name:var(--font-vazirmatn)]"
                  : "font-[family-name:var(--font-gendy)]"
              }`}
            >
              {isRtl
                ? "ارزش استراتژیک، قابلیت‌ها و خروجی‌های تخصصی هر خدمت"
                : "Strategic Value, Deliverables & Architectural Depth"}
            </h2>

            <p className="text-sm sm:text-base text-foreground/75 leading-relaxed">
              {isRtl
                ? "هر دپارتمان به گونه‌ای طراحی شده که نقش یک موتور پیشران مستقل و در عین حال هم‌افزا با کل اکوسیستم برند شما را ایفا کند. در ادامه، ترکیب دقیق خروجی‌ها و ارزش هر خدمت را مرور کنید."
                : "Each department operates as a dedicated growth engine that integrates seamlessly across your entire brand ecosystem. Review the precise deliverables and strategic return on investment below."}
            </p>
          </div>
        </ScrollReveal>

        {/* ─── 7 Varied Editorial Service Dossiers ─── */}
        <div className="space-y-24 sm:space-y-36">
          {services.map((service, idx) => {
            // Alternate layout patterns:
            // 0: Asymmetric Split (Image Left in RTL)
            // 1: Cinematic Inverted Split (Image Right in RTL)
            // 2: Multi-Tier Horizon Layout
            // 3: Engineering Device Frame Split
            // 4: Analytical Authority Split
            // 5: Pipeline & Revenue Operations Layout
            // 6: Full-Width Architectural Flagship Dossier
            const layoutStyle = idx % 7;

            return (
              <article
                key={service.id}
                id={service.id}
                className="scroll-mt-28 relative"
              >
                {/* ─────────────────────────────────────────────────────────────
                    COMPOSITION 0: Flagship Brand Identity (Asymmetric Split)
                    ───────────────────────────────────────────────────────────── */}
                {layoutStyle === 0 && (
                  <div className="rounded-[28px] sm:rounded-[36px] bg-white/60 dark:bg-[#1A1D20]/60 border border-black/[0.08] dark:border-white/10 p-6 sm:p-10 lg:p-12 backdrop-blur-xl shadow-[0_12px_45px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
                      {/* Visual Side (5 cols) */}
                      <div className="lg:col-span-5 order-2 lg:order-1">
                        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[4/5] sm:aspect-square lg:aspect-[4/5] bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/10 shadow-lg group">
                          <Image
                            src={service.image}
                            alt={isRtl ? service.titleFa : service.titleEn}
                            fill
                            sizes="(max-width: 1024px) 100vw, 40vw"
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                          {/* Floating Glass Metric Badge */}
                          <div className="absolute bottom-5 inset-x-5 p-4 rounded-xl bg-black/60 dark:bg-black/75 backdrop-blur-md border border-white/15 text-white">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-[#B7FF00] block">
                                  {isRtl ? "شاخص اثربخشی" : "Performance Benchmark"}
                                </span>
                                <span className="text-xs font-medium text-white/80">
                                  {isRtl ? service.metrics[0].labelFa : service.metrics[0].labelEn}
                                </span>
                              </div>
                              <span className="text-2xl font-black font-mono text-[#B7FF00]">
                                {isRtl ? service.metrics[0].valueFa : service.metrics[0].valueEn}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Content Side (7 cols) */}
                      <div className="lg:col-span-7 order-1 lg:order-2">
                        {/* Eyebrow & Index */}
                        <div className="flex items-center gap-3 mb-4">
                          <span className="font-mono text-sm font-black px-3 py-1 rounded-lg bg-[#38534A]/10 dark:bg-[#38534A]/25 text-[#38534A] dark:text-[#8AB3A0] border border-[#38534A]/20">
                            {isRtl ? service.numStrFa : service.numStrEn}
                          </span>
                          <span className="text-xs font-bold uppercase tracking-wider text-[#38534A] dark:text-[#8AB3A0]">
                            {isRtl ? service.tagFa : service.tagEn}
                          </span>
                        </div>

                        {/* Title */}
                        <h3
                          className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight leading-snug mb-4 ${
                            isRtl
                              ? "font-[family-name:var(--font-vazirmatn)]"
                              : "font-[family-name:var(--font-gendy)]"
                          }`}
                        >
                          {isRtl ? service.titleFa : service.titleEn}
                        </h3>

                        {/* Editorial Sub-headline */}
                        <h4 className="text-base sm:text-lg font-semibold text-mint dark:text-[#8AB3A0] mb-5 leading-normal">
                          {isRtl ? service.headlineFa : service.headlineEn}
                        </h4>

                        {/* Deep Narrative */}
                        <p className="text-sm sm:text-base text-foreground/80 leading-relaxed sm:leading-[1.85] mb-7">
                          {isRtl ? service.detailedNarrativeFa : service.detailedNarrativeEn}
                        </p>

                        {/* Business Value Highlight Box */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-[#38534A]/[0.06] dark:bg-[#38534A]/15 border border-[#38534A]/20 dark:border-[#8AB3A0]/25 mb-8">
                          <div className="flex items-start gap-3">
                            <span className="flex h-6 w-6 rounded-full bg-[#38534A] dark:bg-[#8AB3A0] text-white dark:text-[#17221E] items-center justify-center shrink-0 mt-0.5">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </span>
                            <div>
                              <h5 className="text-xs sm:text-sm font-bold text-foreground mb-1">
                                {isRtl ? service.businessValueTitleFa : service.businessValueTitleEn}
                              </h5>
                              <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                                {isRtl ? service.businessValueFa : service.businessValueEn}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* 3 Deliverables Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
                          {service.subservices.map((sub, sIdx) => (
                            <div
                              key={sIdx}
                              className="p-4 rounded-xl bg-white/70 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] backdrop-blur-sm"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#38534A] dark:bg-[#8AB3A0]" />
                                <h6 className="text-xs font-bold text-foreground leading-snug">
                                  {isRtl ? sub.nameFa : sub.nameEn}
                                </h6>
                              </div>
                              <p className="text-[11px] text-foreground/70 leading-relaxed">
                                {isRtl ? sub.descFa : sub.descEn}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Action Row */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-black/[0.06] dark:border-white/[0.08]">
                          <div className="flex flex-wrap items-center gap-2">
                            {service.relatedLinks.map((link, lIdx) => (
                              <Link
                                key={lIdx}
                                href={link.href}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] hover:bg-[#38534A]/10 text-xs font-semibold text-foreground/80 hover:text-[#38534A] dark:hover:text-[#8AB3A0] border border-black/[0.06] dark:border-white/[0.08] transition-all"
                              >
                                <span>{isRtl ? link.titleFa : link.titleEn}</span>
                                <svg className={`w-3 h-3 ${isRtl ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                              </Link>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRequestConsultation(service.id)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#38534A] dark:bg-[#8AB3A0] hover:bg-[#2B4039] dark:hover:bg-[#A2C5B7] text-white dark:text-[#17221E] text-xs font-bold shadow-md hover:shadow-lg transition-all"
                          >
                            <span>{isRtl ? service.ctaLabelFa : service.ctaLabelEn}</span>
                            <svg className={`w-3.5 h-3.5 ${isRtl ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─────────────────────────────────────────────────────────────
                    COMPOSITION 1: Studio Production (Cinematic Inverted Split)
                    ───────────────────────────────────────────────────────────── */}
                {layoutStyle === 1 && (
                  <div className="rounded-[28px] sm:rounded-[36px] bg-white/60 dark:bg-[#1A1D20]/60 border border-black/[0.08] dark:border-white/10 p-6 sm:p-10 lg:p-12 backdrop-blur-xl shadow-[0_12px_45px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
                      {/* Content Side (7 cols) - Left in RTL */}
                      <div className="lg:col-span-7">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="font-mono text-sm font-black px-3 py-1 rounded-lg bg-[#38534A]/10 dark:bg-[#38534A]/25 text-[#38534A] dark:text-[#8AB3A0] border border-[#38534A]/20">
                            {isRtl ? service.numStrFa : service.numStrEn}
                          </span>
                          <span className="text-xs font-bold uppercase tracking-wider text-[#38534A] dark:text-[#8AB3A0]">
                            {isRtl ? service.tagFa : service.tagEn}
                          </span>
                        </div>

                        <h3
                          className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight leading-snug mb-4 ${
                            isRtl
                              ? "font-[family-name:var(--font-vazirmatn)]"
                              : "font-[family-name:var(--font-gendy)]"
                          }`}
                        >
                          {isRtl ? service.titleFa : service.titleEn}
                        </h3>

                        <h4 className="text-base sm:text-lg font-semibold text-mint dark:text-[#8AB3A0] mb-5 leading-normal">
                          {isRtl ? service.headlineFa : service.headlineEn}
                        </h4>

                        <p className="text-sm sm:text-base text-foreground/80 leading-relaxed sm:leading-[1.85] mb-7">
                          {isRtl ? service.detailedNarrativeFa : service.detailedNarrativeEn}
                        </p>

                        {/* Business Value Highlight Box */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-[#38534A]/[0.06] dark:bg-[#38534A]/15 border border-[#38534A]/20 dark:border-[#8AB3A0]/25 mb-8">
                          <div className="flex items-start gap-3">
                            <span className="flex h-6 w-6 rounded-full bg-[#38534A] dark:bg-[#8AB3A0] text-white dark:text-[#17221E] items-center justify-center shrink-0 mt-0.5">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </span>
                            <div>
                              <h5 className="text-xs sm:text-sm font-bold text-foreground mb-1">
                                {isRtl ? service.businessValueTitleFa : service.businessValueTitleEn}
                              </h5>
                              <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                                {isRtl ? service.businessValueFa : service.businessValueEn}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* 3 Deliverables Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
                          {service.subservices.map((sub, sIdx) => (
                            <div
                              key={sIdx}
                              className="p-4 rounded-xl bg-white/70 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] backdrop-blur-sm"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#38534A] dark:bg-[#8AB3A0]" />
                                <h6 className="text-xs font-bold text-foreground leading-snug">
                                  {isRtl ? sub.nameFa : sub.nameEn}
                                </h6>
                              </div>
                              <p className="text-[11px] text-foreground/70 leading-relaxed">
                                {isRtl ? sub.descFa : sub.descEn}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Action Row */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-black/[0.06] dark:border-white/[0.08]">
                          <div className="flex flex-wrap items-center gap-2">
                            {service.relatedLinks.map((link, lIdx) => (
                              <Link
                                key={lIdx}
                                href={link.href}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] hover:bg-[#38534A]/10 text-xs font-semibold text-foreground/80 hover:text-[#38534A] dark:hover:text-[#8AB3A0] border border-black/[0.06] dark:border-white/[0.08] transition-all"
                              >
                                <span>{isRtl ? link.titleFa : link.titleEn}</span>
                                <svg className={`w-3 h-3 ${isRtl ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                              </Link>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRequestConsultation(service.id)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#38534A] dark:bg-[#8AB3A0] hover:bg-[#2B4039] dark:hover:bg-[#A2C5B7] text-white dark:text-[#17221E] text-xs font-bold shadow-md hover:shadow-lg transition-all"
                          >
                            <span>{isRtl ? service.ctaLabelFa : service.ctaLabelEn}</span>
                            <svg className={`w-3.5 h-3.5 ${isRtl ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Visual Side (5 cols) - 16:9 Cinema Viewfinder Overlay */}
                      <div className="lg:col-span-5">
                        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[4/5] sm:aspect-[16/10] lg:aspect-[4/5] bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/10 shadow-lg group">
                          <Image
                            src={service.image}
                            alt={isRtl ? service.titleFa : service.titleEn}
                            fill
                            sizes="(max-width: 1024px) 100vw, 40vw"
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

                          {/* Top Camera HUD UI */}
                          <div className="absolute top-4 inset-x-4 flex items-center justify-between text-white text-[11px] font-mono select-none">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/60 backdrop-blur-md border border-white/20">
                              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                              <span>REC 4K</span>
                            </span>
                            <span className="px-2 py-1 rounded bg-black/60 backdrop-blur-md border border-white/20">
                              10-BIT PRORES
                            </span>
                          </div>

                          {/* Floating Glass Metric Badge */}
                          <div className="absolute bottom-5 inset-x-5 p-4 rounded-xl bg-black/60 dark:bg-black/75 backdrop-blur-md border border-white/15 text-white">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-[#B7FF00] block">
                                  {isRtl ? "استاندارد استودیویی" : "Studio Gear Standard"}
                                </span>
                                <span className="text-xs font-medium text-white/80">
                                  {isRtl ? service.metrics[1].labelFa : service.metrics[1].labelEn}
                                </span>
                              </div>
                              <span className="text-2xl font-black font-mono text-[#B7FF00]">
                                {isRtl ? service.metrics[1].valueFa : service.metrics[1].valueEn}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─────────────────────────────────────────────────────────────
                    COMPOSITION 2: Animation & Motion (Dynamic Horizon Layout)
                    ───────────────────────────────────────────────────────────── */}
                {layoutStyle === 2 && (
                  <div className="rounded-[28px] sm:rounded-[36px] bg-white/60 dark:bg-[#1A1D20]/60 border border-black/[0.08] dark:border-white/10 p-6 sm:p-10 lg:p-12 backdrop-blur-xl shadow-[0_12px_45px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
                    {/* Header Banner */}
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-black/[0.06] dark:border-white/[0.08] mb-10">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="font-mono text-sm font-black px-3 py-1 rounded-lg bg-[#38534A]/10 dark:bg-[#38534A]/25 text-[#38534A] dark:text-[#8AB3A0] border border-[#38534A]/20">
                            {isRtl ? service.numStrFa : service.numStrEn}
                          </span>
                          <span className="text-xs font-bold uppercase tracking-wider text-[#38534A] dark:text-[#8AB3A0]">
                            {isRtl ? service.tagFa : service.tagEn}
                          </span>
                        </div>

                        <h3
                          className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight leading-snug mb-2 ${
                            isRtl
                              ? "font-[family-name:var(--font-vazirmatn)]"
                              : "font-[family-name:var(--font-gendy)]"
                          }`}
                        >
                          {isRtl ? service.titleFa : service.titleEn}
                        </h3>

                        <h4 className="text-base sm:text-lg font-semibold text-mint dark:text-[#8AB3A0]">
                          {isRtl ? service.headlineFa : service.headlineEn}
                        </h4>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleRequestConsultation(service.id)}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#38534A] dark:bg-[#8AB3A0] hover:bg-[#2B4039] dark:hover:bg-[#A2C5B7] text-white dark:text-[#17221E] text-xs font-bold shadow-md hover:shadow-lg transition-all"
                        >
                          <span>{isRtl ? service.ctaLabelFa : service.ctaLabelEn}</span>
                          <svg className={`w-3.5 h-3.5 ${isRtl ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Middle Section: Narrative + Visual Card */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-10">
                      <div className="lg:col-span-7">
                        <p className="text-sm sm:text-base text-foreground/80 leading-relaxed sm:leading-[1.85] mb-6">
                          {isRtl ? service.detailedNarrativeFa : service.detailedNarrativeEn}
                        </p>

                        <div className="p-4 sm:p-5 rounded-2xl bg-[#38534A]/[0.06] dark:bg-[#38534A]/15 border border-[#38534A]/20 dark:border-[#8AB3A0]/25">
                          <h5 className="text-xs sm:text-sm font-bold text-foreground mb-1">
                            {isRtl ? service.businessValueTitleFa : service.businessValueTitleEn}
                          </h5>
                          <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                            {isRtl ? service.businessValueFa : service.businessValueEn}
                          </p>
                        </div>
                      </div>

                      <div className="lg:col-span-5">
                        <div className="relative rounded-2xl overflow-hidden aspect-[16/9] sm:aspect-[16/10] bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/10 shadow-lg group">
                          <Image
                            src={service.image}
                            alt={isRtl ? service.titleFa : service.titleEn}
                            fill
                            sizes="(max-width: 1024px) 100vw, 40vw"
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                          {/* 3D Engine tag badge */}
                          <div className="absolute bottom-3 start-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[11px] font-mono border border-white/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#B7FF00]" />
                              <span>2D / 3D / CGI VFX Engine</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3 Interactive Capability Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-black/[0.06] dark:border-white/[0.08]">
                      {service.subservices.map((sub, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-5 rounded-2xl bg-white/70 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] backdrop-blur-sm hover:border-[#38534A]/40 dark:hover:border-[#8AB3A0]/40 transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-2.5">
                            <span className="font-mono text-xs font-bold text-[#38534A] dark:text-[#8AB3A0]">
                              0{sIdx + 1}
                            </span>
                            <h6 className="text-sm font-bold text-foreground">
                              {isRtl ? sub.nameFa : sub.nameEn}
                            </h6>
                          </div>
                          <p className="text-xs text-foreground/75 leading-relaxed">
                            {isRtl ? sub.descFa : sub.descEn}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ─────────────────────────────────────────────────────────────
                    COMPOSITION 3: Web Engineering (Performance Device Split)
                    ───────────────────────────────────────────────────────────── */}
                {layoutStyle === 3 && (
                  <div className="rounded-[28px] sm:rounded-[36px] bg-white/60 dark:bg-[#1A1D20]/60 border border-black/[0.08] dark:border-white/10 p-6 sm:p-10 lg:p-12 backdrop-blur-xl shadow-[0_12px_45px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
                      {/* Visual Side (5 cols) - Device Mockup Frame with Telemetry */}
                      <div className="lg:col-span-5 order-2 lg:order-1">
                        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[4/5] sm:aspect-square lg:aspect-[4/5] bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/10 shadow-lg group">
                          <Image
                            src={service.image}
                            alt={isRtl ? service.titleFa : service.titleEn}
                            fill
                            sizes="(max-width: 1024px) 100vw, 40vw"
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/40 pointer-events-none" />

                          {/* Top Tech Stack Tags */}
                          <div className="absolute top-4 inset-x-4 flex items-center justify-between text-white text-[10px] font-mono select-none">
                            <span className="px-2.5 py-1 rounded bg-black/60 backdrop-blur-md border border-white/20">
                              Next.js 16 App Router
                            </span>
                            <span className="px-2.5 py-1 rounded bg-black/60 backdrop-blur-md border border-white/20 text-[#B7FF00]">
                              TypeScript + Tailwind v4
                            </span>
                          </div>

                          {/* Telemetry Floating Capsule */}
                          <div className="absolute bottom-5 inset-x-5 p-4 rounded-xl bg-black/60 dark:bg-black/75 backdrop-blur-md border border-white/15 text-white">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-[#B7FF00] block">
                                  Core Web Vitals
                                </span>
                                <span className="text-xs font-medium text-white/80">
                                  {isRtl ? "امتیاز کامل عملکرد و سرعت" : "Lighthouse Performance Score"}
                                </span>
                              </div>
                              <span className="text-2xl font-black font-mono text-[#B7FF00]">
                                99/100
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Content Side (7 cols) */}
                      <div className="lg:col-span-7 order-1 lg:order-2">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="font-mono text-sm font-black px-3 py-1 rounded-lg bg-[#38534A]/10 dark:bg-[#38534A]/25 text-[#38534A] dark:text-[#8AB3A0] border border-[#38534A]/20">
                            {isRtl ? service.numStrFa : service.numStrEn}
                          </span>
                          <span className="text-xs font-bold uppercase tracking-wider text-[#38534A] dark:text-[#8AB3A0]">
                            {isRtl ? service.tagFa : service.tagEn}
                          </span>
                        </div>

                        <h3
                          className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight leading-snug mb-4 ${
                            isRtl
                              ? "font-[family-name:var(--font-vazirmatn)]"
                              : "font-[family-name:var(--font-gendy)]"
                          }`}
                        >
                          {isRtl ? service.titleFa : service.titleEn}
                        </h3>

                        <h4 className="text-base sm:text-lg font-semibold text-mint dark:text-[#8AB3A0] mb-5 leading-normal">
                          {isRtl ? service.headlineFa : service.headlineEn}
                        </h4>

                        <p className="text-sm sm:text-base text-foreground/80 leading-relaxed sm:leading-[1.85] mb-7">
                          {isRtl ? service.detailedNarrativeFa : service.detailedNarrativeEn}
                        </p>

                        <div className="p-4 sm:p-5 rounded-2xl bg-[#38534A]/[0.06] dark:bg-[#38534A]/15 border border-[#38534A]/20 dark:border-[#8AB3A0]/25 mb-8">
                          <div className="flex items-start gap-3">
                            <span className="flex h-6 w-6 rounded-full bg-[#38534A] dark:bg-[#8AB3A0] text-white dark:text-[#17221E] items-center justify-center shrink-0 mt-0.5">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                              </svg>
                            </span>
                            <div>
                              <h5 className="text-xs sm:text-sm font-bold text-foreground mb-1">
                                {isRtl ? service.businessValueTitleFa : service.businessValueTitleEn}
                              </h5>
                              <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                                {isRtl ? service.businessValueFa : service.businessValueEn}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
                          {service.subservices.map((sub, sIdx) => (
                            <div
                              key={sIdx}
                              className="p-4 rounded-xl bg-white/70 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] backdrop-blur-sm"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#38534A] dark:bg-[#8AB3A0]" />
                                <h6 className="text-xs font-bold text-foreground leading-snug">
                                  {isRtl ? sub.nameFa : sub.nameEn}
                                </h6>
                              </div>
                              <p className="text-[11px] text-foreground/70 leading-relaxed">
                                {isRtl ? sub.descFa : sub.descEn}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-black/[0.06] dark:border-white/[0.08]">
                          <div className="flex flex-wrap items-center gap-2">
                            {service.relatedLinks.map((link, lIdx) => (
                              <Link
                                key={lIdx}
                                href={link.href}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] hover:bg-[#38534A]/10 text-xs font-semibold text-foreground/80 hover:text-[#38534A] dark:hover:text-[#8AB3A0] border border-black/[0.06] dark:border-white/[0.08] transition-all"
                              >
                                <span>{isRtl ? link.titleFa : link.titleEn}</span>
                                <svg className={`w-3 h-3 ${isRtl ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                              </Link>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRequestConsultation(service.id)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#38534A] dark:bg-[#8AB3A0] hover:bg-[#2B4039] dark:hover:bg-[#A2C5B7] text-white dark:text-[#17221E] text-xs font-bold shadow-md hover:shadow-lg transition-all"
                          >
                            <span>{isRtl ? service.ctaLabelFa : service.ctaLabelEn}</span>
                            <svg className={`w-3.5 h-3.5 ${isRtl ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─────────────────────────────────────────────────────────────
                    COMPOSITION 4: Technical SEO (Analytical Authority Split)
                    ───────────────────────────────────────────────────────────── */}
                {layoutStyle === 4 && (
                  <div className="rounded-[28px] sm:rounded-[36px] bg-white/60 dark:bg-[#1A1D20]/60 border border-black/[0.08] dark:border-white/10 p-6 sm:p-10 lg:p-12 backdrop-blur-xl shadow-[0_12px_45px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
                      {/* Content Side (7 cols) */}
                      <div className="lg:col-span-7">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="font-mono text-sm font-black px-3 py-1 rounded-lg bg-[#38534A]/10 dark:bg-[#38534A]/25 text-[#38534A] dark:text-[#8AB3A0] border border-[#38534A]/20">
                            {isRtl ? service.numStrFa : service.numStrEn}
                          </span>
                          <span className="text-xs font-bold uppercase tracking-wider text-[#38534A] dark:text-[#8AB3A0]">
                            {isRtl ? service.tagFa : service.tagEn}
                          </span>
                        </div>

                        <h3
                          className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight leading-snug mb-4 ${
                            isRtl
                              ? "font-[family-name:var(--font-vazirmatn)]"
                              : "font-[family-name:var(--font-gendy)]"
                          }`}
                        >
                          {isRtl ? service.titleFa : service.titleEn}
                        </h3>

                        <h4 className="text-base sm:text-lg font-semibold text-mint dark:text-[#8AB3A0] mb-5 leading-normal">
                          {isRtl ? service.headlineFa : service.headlineEn}
                        </h4>

                        <p className="text-sm sm:text-base text-foreground/80 leading-relaxed sm:leading-[1.85] mb-7">
                          {isRtl ? service.detailedNarrativeFa : service.detailedNarrativeEn}
                        </p>

                        <div className="p-4 sm:p-5 rounded-2xl bg-[#38534A]/[0.06] dark:bg-[#38534A]/15 border border-[#38534A]/20 dark:border-[#8AB3A0]/25 mb-8">
                          <div className="flex items-start gap-3">
                            <span className="flex h-6 w-6 rounded-full bg-[#38534A] dark:bg-[#8AB3A0] text-white dark:text-[#17221E] items-center justify-center shrink-0 mt-0.5">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                              </svg>
                            </span>
                            <div>
                              <h5 className="text-xs sm:text-sm font-bold text-foreground mb-1">
                                {isRtl ? service.businessValueTitleFa : service.businessValueTitleEn}
                              </h5>
                              <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                                {isRtl ? service.businessValueFa : service.businessValueEn}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
                          {service.subservices.map((sub, sIdx) => (
                            <div
                              key={sIdx}
                              className="p-4 rounded-xl bg-white/70 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] backdrop-blur-sm"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#38534A] dark:bg-[#8AB3A0]" />
                                <h6 className="text-xs font-bold text-foreground leading-snug">
                                  {isRtl ? sub.nameFa : sub.nameEn}
                                </h6>
                              </div>
                              <p className="text-[11px] text-foreground/70 leading-relaxed">
                                {isRtl ? sub.descFa : sub.descEn}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-black/[0.06] dark:border-white/[0.08]">
                          <div className="flex flex-wrap items-center gap-2">
                            {service.relatedLinks.map((link, lIdx) => (
                              <Link
                                key={lIdx}
                                href={link.href}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] hover:bg-[#38534A]/10 text-xs font-semibold text-foreground/80 hover:text-[#38534A] dark:hover:text-[#8AB3A0] border border-black/[0.06] dark:border-white/[0.08] transition-all"
                              >
                                <span>{isRtl ? link.titleFa : link.titleEn}</span>
                                <svg className={`w-3 h-3 ${isRtl ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                              </Link>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRequestConsultation(service.id)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#38534A] dark:bg-[#8AB3A0] hover:bg-[#2B4039] dark:hover:bg-[#A2C5B7] text-white dark:text-[#17221E] text-xs font-bold shadow-md hover:shadow-lg transition-all"
                          >
                            <span>{isRtl ? service.ctaLabelFa : service.ctaLabelEn}</span>
                            <svg className={`w-3.5 h-3.5 ${isRtl ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Visual Side (5 cols) */}
                      <div className="lg:col-span-5">
                        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[4/5] sm:aspect-[16/10] lg:aspect-[4/5] bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/10 shadow-lg group">
                          <Image
                            src={service.image}
                            alt={isRtl ? service.titleFa : service.titleEn}
                            fill
                            sizes="(max-width: 1024px) 100vw, 40vw"
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

                          {/* SEO Checklist overlay */}
                          <div className="absolute top-4 inset-x-4 p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 text-white text-[11px] font-mono space-y-1.5">
                            <div className="flex items-center justify-between text-[#B7FF00]">
                              <span>✓ Crawlability & Index Status</span>
                              <span>100% PASS</span>
                            </div>
                            <div className="flex items-center justify-between text-white/80">
                              <span>✓ Schema Structured Data</span>
                              <span>JSON-LD ACTIVE</span>
                            </div>
                          </div>

                          {/* Floating Glass Metric Badge */}
                          <div className="absolute bottom-5 inset-x-5 p-4 rounded-xl bg-black/60 dark:bg-black/75 backdrop-blur-md border border-white/15 text-white">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-[#B7FF00] block">
                                  {isRtl ? "رشد ارگانیک پایدار" : "Compounding Search Lift"}
                                </span>
                                <span className="text-xs font-medium text-white/80">
                                  {isRtl ? service.metrics[0].labelFa : service.metrics[0].labelEn}
                                </span>
                              </div>
                              <span className="text-2xl font-black font-mono text-[#B7FF00]">
                                {isRtl ? service.metrics[0].valueFa : service.metrics[0].valueEn}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─────────────────────────────────────────────────────────────
                    COMPOSITION 5: CRM & Automation (Pipeline Operations Split)
                    ───────────────────────────────────────────────────────────── */}
                {layoutStyle === 5 && (
                  <div className="rounded-[28px] sm:rounded-[36px] bg-white/60 dark:bg-[#1A1D20]/60 border border-black/[0.08] dark:border-white/10 p-6 sm:p-10 lg:p-12 backdrop-blur-xl shadow-[0_12px_45px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
                      {/* Visual Side (5 cols) - Ingestion & Pipeline Matrix */}
                      <div className="lg:col-span-5 order-2 lg:order-1">
                        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[4/5] sm:aspect-square lg:aspect-[4/5] bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/10 shadow-lg group">
                          <Image
                            src={service.image}
                            alt={isRtl ? service.titleFa : service.titleEn}
                            fill
                            sizes="(max-width: 1024px) 100vw, 40vw"
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/40 pointer-events-none" />

                          {/* Pipeline Flow Stages Overlay */}
                          <div className="absolute top-4 inset-x-4 p-3 rounded-xl bg-black/65 backdrop-blur-md border border-white/15 text-white text-[11px] font-mono">
                            <span className="text-[10px] text-[#B7FF00] font-bold block mb-1">
                              LEAD VELOCITY PIPELINE
                            </span>
                            <div className="flex items-center justify-between text-[10px] text-white/80">
                              <span>Capture</span>
                              <span>→</span>
                              <span>Qualify</span>
                              <span>→</span>
                              <span className="text-[#B7FF00]">Deal Closed</span>
                            </div>
                          </div>

                          {/* Floating Glass Metric Badge */}
                          <div className="absolute bottom-5 inset-x-5 p-4 rounded-xl bg-black/60 dark:bg-black/75 backdrop-blur-md border border-white/15 text-white">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-[#B7FF00] block">
                                  {isRtl ? "سرعت چرخه فروش" : "Sales Cycle Velocity"}
                                </span>
                                <span className="text-xs font-medium text-white/80">
                                  {isRtl ? service.metrics[0].labelFa : service.metrics[0].labelEn}
                                </span>
                              </div>
                              <span className="text-2xl font-black font-mono text-[#B7FF00]">
                                {isRtl ? service.metrics[0].valueFa : service.metrics[0].valueEn}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Content Side (7 cols) */}
                      <div className="lg:col-span-7 order-1 lg:order-2">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="font-mono text-sm font-black px-3 py-1 rounded-lg bg-[#38534A]/10 dark:bg-[#38534A]/25 text-[#38534A] dark:text-[#8AB3A0] border border-[#38534A]/20">
                            {isRtl ? service.numStrFa : service.numStrEn}
                          </span>
                          <span className="text-xs font-bold uppercase tracking-wider text-[#38534A] dark:text-[#8AB3A0]">
                            {isRtl ? service.tagFa : service.tagEn}
                          </span>
                        </div>

                        <h3
                          className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight leading-snug mb-4 ${
                            isRtl
                              ? "font-[family-name:var(--font-vazirmatn)]"
                              : "font-[family-name:var(--font-gendy)]"
                          }`}
                        >
                          {isRtl ? service.titleFa : service.titleEn}
                        </h3>

                        <h4 className="text-base sm:text-lg font-semibold text-mint dark:text-[#8AB3A0] mb-5 leading-normal">
                          {isRtl ? service.headlineFa : service.headlineEn}
                        </h4>

                        <p className="text-sm sm:text-base text-foreground/80 leading-relaxed sm:leading-[1.85] mb-7">
                          {isRtl ? service.detailedNarrativeFa : service.detailedNarrativeEn}
                        </p>

                        <div className="p-4 sm:p-5 rounded-2xl bg-[#38534A]/[0.06] dark:bg-[#38534A]/15 border border-[#38534A]/20 dark:border-[#8AB3A0]/25 mb-8">
                          <div className="flex items-start gap-3">
                            <span className="flex h-6 w-6 rounded-full bg-[#38534A] dark:bg-[#8AB3A0] text-white dark:text-[#17221E] items-center justify-center shrink-0 mt-0.5">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </span>
                            <div>
                              <h5 className="text-xs sm:text-sm font-bold text-foreground mb-1">
                                {isRtl ? service.businessValueTitleFa : service.businessValueTitleEn}
                              </h5>
                              <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                                {isRtl ? service.businessValueFa : service.businessValueEn}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
                          {service.subservices.map((sub, sIdx) => (
                            <div
                              key={sIdx}
                              className="p-4 rounded-xl bg-white/70 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] backdrop-blur-sm"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#38534A] dark:bg-[#8AB3A0]" />
                                <h6 className="text-xs font-bold text-foreground leading-snug">
                                  {isRtl ? sub.nameFa : sub.nameEn}
                                </h6>
                              </div>
                              <p className="text-[11px] text-foreground/70 leading-relaxed">
                                {isRtl ? sub.descFa : sub.descEn}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-black/[0.06] dark:border-white/[0.08]">
                          <div className="flex flex-wrap items-center gap-2">
                            {service.relatedLinks.map((link, lIdx) => (
                              <Link
                                key={lIdx}
                                href={link.href}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] hover:bg-[#38534A]/10 text-xs font-semibold text-foreground/80 hover:text-[#38534A] dark:hover:text-[#8AB3A0] border border-black/[0.06] dark:border-white/[0.08] transition-all"
                              >
                                <span>{isRtl ? link.titleFa : link.titleEn}</span>
                                <svg className={`w-3 h-3 ${isRtl ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                              </Link>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRequestConsultation(service.id)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#38534A] dark:bg-[#8AB3A0] hover:bg-[#2B4039] dark:hover:bg-[#A2C5B7] text-white dark:text-[#17221E] text-xs font-bold shadow-md hover:shadow-lg transition-all"
                          >
                            <span>{isRtl ? service.ctaLabelFa : service.ctaLabelEn}</span>
                            <svg className={`w-3.5 h-3.5 ${isRtl ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─────────────────────────────────────────────────────────────
                    COMPOSITION 6: Custom Software (Full-Width Architectural Flagship)
                    ───────────────────────────────────────────────────────────── */}
                {layoutStyle === 6 && (
                  <div className="rounded-[28px] sm:rounded-[36px] bg-white/60 dark:bg-[#1A1D20]/60 border border-black/[0.08] dark:border-white/10 p-6 sm:p-10 lg:p-12 backdrop-blur-xl shadow-[0_12px_45px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="font-mono text-sm font-black px-3 py-1 rounded-lg bg-[#38534A]/10 dark:bg-[#38534A]/25 text-[#38534A] dark:text-[#8AB3A0] border border-[#38534A]/20">
                        {isRtl ? service.numStrFa : service.numStrEn}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#38534A] dark:text-[#8AB3A0]">
                        {isRtl ? service.tagFa : service.tagEn}
                      </span>
                    </div>

                    <h3
                      className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight leading-snug mb-3 ${
                        isRtl
                          ? "font-[family-name:var(--font-vazirmatn)]"
                          : "font-[family-name:var(--font-gendy)]"
                      }`}
                    >
                      {isRtl ? service.titleFa : service.titleEn}
                    </h3>

                    <h4 className="text-base sm:text-lg font-semibold text-mint dark:text-[#8AB3A0] mb-6">
                      {isRtl ? service.headlineFa : service.headlineEn}
                    </h4>

                    {/* Dual Box: Narrative + Architectural Specs */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10 items-center">
                      <div className="lg:col-span-7">
                        <p className="text-sm sm:text-base text-foreground/80 leading-relaxed sm:leading-[1.85] mb-6">
                          {isRtl ? service.detailedNarrativeFa : service.detailedNarrativeEn}
                        </p>

                        <div className="p-4 sm:p-5 rounded-2xl bg-[#38534A]/[0.06] dark:bg-[#38534A]/15 border border-[#38534A]/20 dark:border-[#8AB3A0]/25">
                          <h5 className="text-xs sm:text-sm font-bold text-foreground mb-1">
                            {isRtl ? service.businessValueTitleFa : service.businessValueTitleEn}
                          </h5>
                          <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                            {isRtl ? service.businessValueFa : service.businessValueEn}
                          </p>
                        </div>
                      </div>

                      <div className="lg:col-span-5">
                        <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/10 shadow-lg group">
                          <Image
                            src={service.image}
                            alt={isRtl ? service.titleFa : service.titleEn}
                            fill
                            sizes="(max-width: 1024px) 100vw, 40vw"
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

                          <div className="absolute bottom-4 inset-x-4 flex items-center justify-between text-white text-xs font-mono">
                            <span className="px-2.5 py-1 rounded bg-black/70 backdrop-blur-md border border-white/20 text-[#B7FF00]">
                              PostgreSQL + Prisma
                            </span>
                            <span className="px-2.5 py-1 rounded bg-black/70 backdrop-blur-md border border-white/20">
                              REST / GraphQL API
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3 Full Deliverable Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      {service.subservices.map((sub, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-5 rounded-2xl bg-white/70 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] backdrop-blur-sm"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#38534A] dark:bg-[#8AB3A0]" />
                            <h6 className="text-sm font-bold text-foreground">
                              {isRtl ? sub.nameFa : sub.nameEn}
                            </h6>
                          </div>
                          <p className="text-xs text-foreground/75 leading-relaxed">
                            {isRtl ? sub.descFa : sub.descEn}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Action Row */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-black/[0.06] dark:border-white/[0.08]">
                      <div className="flex flex-wrap items-center gap-2">
                        {service.relatedLinks.map((link, lIdx) => (
                          <Link
                            key={lIdx}
                            href={link.href}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] hover:bg-[#38534A]/10 text-xs font-semibold text-foreground/80 hover:text-[#38534A] dark:hover:text-[#8AB3A0] border border-black/[0.06] dark:border-white/[0.08] transition-all"
                          >
                            <span>{isRtl ? link.titleFa : link.titleEn}</span>
                            <svg className={`w-3 h-3 ${isRtl ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRequestConsultation(service.id)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#38534A] dark:bg-[#8AB3A0] hover:bg-[#2B4039] dark:hover:bg-[#A2C5B7] text-white dark:text-[#17221E] text-xs font-bold shadow-md hover:shadow-lg transition-all"
                      >
                        <span>{isRtl ? service.ctaLabelFa : service.ctaLabelEn}</span>
                        <svg className={`w-3.5 h-3.5 ${isRtl ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
