"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, A11y } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";

import { CaseStudyItem } from "@/lib/case-studies";
import { useReducedMotion } from "framer-motion";
import ScrollableProjectFrame from "./ScrollableProjectFrame";

export default function PortfolioAsymmetricSwiper({
  isRtl,
  projects,
}: {
  isRtl: boolean;
  projects: CaseStudyItem[];
}) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  if (!projects || projects.length === 0) {
    return (
      <div className="py-20 text-center text-foreground/60">
        {isRtl ? "پروژه‌ای در این دسته‌بندی یافت نشد." : "No projects found in this category."}
      </div>
    );
  }

  const total = projects.length;

  return (
    <div className="relative w-full select-none" dir={isRtl ? "rtl" : "ltr"}>
      {/* ─── Top Control Bar: Eyebrow + Minimalist Sharp Navigation Controls (Strictly No Numbers) ─── */}
      <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-3 text-xs sm:text-sm font-bold tracking-widest text-[#38534A] dark:text-[#8AB3A0] uppercase">
          <span className="h-px w-10 bg-[#38534A]/50 dark:bg-[#8AB3A0]/50 shrink-0" />
          <span>{isRtl ? "ویترین نامتقارن پروژه‌ها" : "ASYMMETRICAL PROJECT STAGE"}</span>
        </div>

        {/* Minimalist Sharp Navigation Buttons (No Numbers, Sharp Corners) */}
        <div className="flex items-center gap-2">
          {/* Previous Button */}
          <button
            type="button"
            aria-label={isRtl ? "پروژه قبلی" : "Previous Project"}
            onClick={() => swiperRef.current?.slidePrev()}
            className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-none border border-[#1F1F1E]/20 dark:border-white/20 text-foreground bg-[#EAEBE7] dark:bg-[#1A1D1C] hover:bg-[#1F1F1E] hover:text-white dark:hover:bg-white dark:hover:text-[#1F1F1E] active:scale-95 transition-all duration-200 cursor-pointer shadow-sm"
          >
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${isRtl ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Next Button */}
          <button
            type="button"
            aria-label={isRtl ? "پروژه بعدی" : "Next Project"}
            onClick={() => swiperRef.current?.slideNext()}
            className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-none border border-[#1F1F1E]/20 dark:border-white/20 text-foreground bg-[#EAEBE7] dark:bg-[#1A1D1C] hover:bg-[#1F1F1E] hover:text-white dark:hover:bg-white dark:hover:text-[#1F1F1E] active:scale-95 transition-all duration-200 cursor-pointer shadow-sm"
          >
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${isRtl ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* ─── Swiper Engine with Asymmetrical Three-Project Stage ─── */}
      <Swiper
        modules={[Navigation, Autoplay, A11y]}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={(swiper) => {
          setActiveIndex(swiper.realIndex);
        }}
        slidesPerView={1}
        spaceBetween={24}
        loop={total >= 3}
        autoplay={
          prefersReducedMotion
            ? false
            : {
                delay: 7500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
        }
        speed={650}
        grabCursor={false}
        className="w-full !overflow-visible"
      >
        {projects.map((project, idx) => {
          // Identify the 2 supporting projects in rotation
          const supp1 = projects[(idx + 1) % total];
          const supp2 = projects[(idx + 2) % total];

          const primaryImage = project.secondaryImage || project.image || "/case_study_1.jpg";
          const supp1Image = supp1.secondaryImage || supp1.image || "/case_study_1.jpg";
          const supp2Image = supp2.secondaryImage || supp2.image || "/case_study_2.jpg";

          return (
            <SwiperSlide key={project.slug || project.id || `slide-${idx}`} className="w-full">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">
                {/* ═════════════════════════════════════════════════════════════
                    PRIMARY SPOTLIGHT CARD (Lg: 7 Columns in Grid ~ 58%)
                    ═════════════════════════════════════════════════════════════ */}
                <article className="lg:col-span-7 flex flex-col justify-between rounded-none overflow-hidden bg-[#EAEBE7] dark:bg-[#1A1D1C] border border-[#1F1F1E]/12 dark:border-white/10 p-6 sm:p-8 lg:p-9 shadow-sm hover:border-[#38534A]/50 dark:hover:border-[#8AB3A0]/50 transition-colors">
                  <div>
                    {/* Media Frame with Hover Scroll */}
                    <div className="mb-6">
                      <ScrollableProjectFrame
                        src={primaryImage}
                        alt={isRtl ? project.titleFa : project.titleEn}
                        isRtl={isRtl}
                        className="h-[320px] sm:h-[400px] lg:h-[430px]"
                        priority={idx === 0}
                        previewType={project.previewType}
                        liveUrl={project.liveUrl}
                      />
                    </div>

                    {/* Metadata Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#38534A] dark:text-[#8AB3A0]">
                          {isRtl ? project.categoryFa : project.categoryEn}
                        </span>
                        <span className="text-[#1F1F1E]/30 dark:text-white/30">•</span>
                        <span className="font-mono text-xs text-foreground/60">
                          {project.year || "۲۰۲۵"}
                        </span>
                      </div>

                      {project.metricsFa && project.metricsFa[0] && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none bg-black/[0.04] dark:bg-white/[0.06] border border-[#1F1F1E]/10 dark:border-white/10 text-xs">
                          <span className="font-bold text-[#38534A] dark:text-[#8AB3A0] font-mono">
                            {isRtl ? project.metricsFa[0].value : project.metricsEn?.[0]?.value || project.metricsFa[0].value}
                          </span>
                          <span className="text-[11px] text-foreground/70">
                            {isRtl ? project.metricsFa[0].label : project.metricsEn?.[0]?.label || project.metricsFa[0].label}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Client & Title */}
                    <span className="text-xs sm:text-sm font-semibold text-foreground/60 block mb-1.5">
                      {isRtl ? project.client : project.clientEn}
                    </span>
                    <h3
                      className={`text-xl sm:text-2xl lg:text-3xl font-black text-foreground mb-3 leading-snug ${
                        isRtl
                          ? "font-[family-name:var(--font-vazirmatn)]"
                          : "font-[family-name:var(--font-gendy)]"
                      }`}
                    >
                      {isRtl ? project.titleFa : project.titleEn}
                    </h3>

                    {/* Editorial Tagline */}
                    <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed line-clamp-3 mb-6">
                      {isRtl ? project.taglineFa : project.taglineEn}
                    </p>
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="pt-5 border-t border-[#1F1F1E]/10 dark:border-white/10 flex items-center justify-between">
                    <Link
                      href={`/portfolio/${project.slug}`}
                      className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-none bg-[#38534A] text-white hover:bg-[#2B4039] dark:bg-[#8AB3A0] dark:text-[#121413] dark:hover:bg-[#A3C7B5] text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm group/btn"
                    >
                      <span>{isRtl ? "مطالعه مطالعه موردی کامل" : "Read Full Case Study"}</span>
                      <svg
                        className={`w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1 rtl:group-hover/btn:-translate-x-1 ${
                          isRtl ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>

                    {project.liveUrl && project.liveUrl !== "#" && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/70 hover:text-[#38534A] dark:hover:text-[#8AB3A0] transition-colors"
                      >
                        <span>{isRtl ? "مشاهده وب‌سایت زنده" : "Live Website"}</span>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                </article>

                {/* ═════════════════════════════════════════════════════════════
                    SECONDARY STACKED PAIR (Lg: 5 Columns in Grid ~ 42%)
                    ═════════════════════════════════════════════════════════════ */}
                <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
                  {/* Supporting Card 1 */}
                  {supp1 && (
                    <article className="flex-1 flex flex-col justify-between p-6 rounded-none bg-[#EAEBE7] dark:bg-[#1A1D1C] border border-[#1F1F1E]/12 dark:border-white/10 hover:border-[#38534A]/50 dark:hover:border-[#8AB3A0]/50 transition-colors shadow-sm">
                      <div>
                        {/* Mini Image Frame with Hover Scroll */}
                        <div className="mb-4">
                          <ScrollableProjectFrame
                            src={supp1Image}
                            alt={isRtl ? supp1.titleFa : supp1.titleEn}
                            isRtl={isRtl}
                            className="h-[180px] sm:h-[200px]"
                            previewType={supp1.previewType}
                          />
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#38534A] dark:text-[#8AB3A0]">
                            {isRtl ? supp1.categoryFa : supp1.categoryEn}
                          </span>
                          <span className="text-[#1F1F1E]/30 dark:text-white/30">•</span>
                          <span className="font-mono text-[11px] text-foreground/50">
                            {supp1.year || "۲۰۲۵"}
                          </span>
                        </div>

                        <span className="text-xs font-semibold text-foreground/60 block mb-1">
                          {isRtl ? supp1.client : supp1.clientEn}
                        </span>
                        <h4 className="text-base sm:text-lg font-bold text-foreground leading-snug line-clamp-2 mb-2">
                          {isRtl ? supp1.titleFa : supp1.titleEn}
                        </h4>
                      </div>

                      <div className="pt-3 border-t border-[#1F1F1E]/10 dark:border-white/10 flex items-center justify-between">
                        <Link
                          href={`/portfolio/${supp1.slug}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#38534A] dark:text-[#8AB3A0] hover:underline"
                        >
                          <span>{isRtl ? "جزئیات پروژه" : "View Details"}</span>
                          <svg
                            className={`w-3.5 h-3.5 ${isRtl ? "rotate-180" : ""}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </Link>
                      </div>
                    </article>
                  )}

                  {/* Supporting Card 2 */}
                  {supp2 && (
                    <article className="flex-1 flex flex-col justify-between p-6 rounded-none bg-[#EAEBE7] dark:bg-[#1A1D1C] border border-[#1F1F1E]/12 dark:border-white/10 hover:border-[#38534A]/50 dark:hover:border-[#8AB3A0]/50 transition-colors shadow-sm">
                      <div>
                        {/* Mini Image Frame with Hover Scroll */}
                        <div className="mb-4">
                          <ScrollableProjectFrame
                            src={supp2Image}
                            alt={isRtl ? supp2.titleFa : supp2.titleEn}
                            isRtl={isRtl}
                            className="h-[180px] sm:h-[200px]"
                            previewType={supp2.previewType}
                          />
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#38534A] dark:text-[#8AB3A0]">
                            {isRtl ? supp2.categoryFa : supp2.categoryEn}
                          </span>
                          <span className="text-[#1F1F1E]/30 dark:text-white/30">•</span>
                          <span className="font-mono text-[11px] text-foreground/50">
                            {supp2.year || "۲۰۲۵"}
                          </span>
                        </div>

                        <span className="text-xs font-semibold text-foreground/60 block mb-1">
                          {isRtl ? supp2.client : supp2.clientEn}
                        </span>
                        <h4 className="text-base sm:text-lg font-bold text-foreground leading-snug line-clamp-2 mb-2">
                          {isRtl ? supp2.titleFa : supp2.titleEn}
                        </h4>
                      </div>

                      <div className="pt-3 border-t border-[#1F1F1E]/10 dark:border-white/10 flex items-center justify-between">
                        <Link
                          href={`/portfolio/${supp2.slug}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#38534A] dark:text-[#8AB3A0] hover:underline"
                        >
                          <span>{isRtl ? "جزئیات پروژه" : "View Details"}</span>
                          <svg
                            className={`w-3.5 h-3.5 ${isRtl ? "rotate-180" : ""}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </Link>
                      </div>
                    </article>
                  )}
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
