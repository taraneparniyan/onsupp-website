"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, A11y } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";

import { CaseStudyItem } from "@/lib/case-studies";
import { useReducedMotion } from "framer-motion";

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
      {/* ─── Top Control Bar: Eyebrow + Minimalist Navigation Arrows (Strictly No Numbers) ─── */}
      <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-3 text-xs sm:text-sm font-bold tracking-widest text-[#38534A] dark:text-[#8AB3A0] uppercase">
          <span className="h-px w-10 bg-[#38534A]/50 dark:bg-[#8AB3A0]/50 shrink-0" />
          <span>{isRtl ? "ویترین نامتقارن پروژه‌ها" : "ASYMMETRICAL THREE-PROJECT STAGE"}</span>
        </div>

        {/* Minimalist Navigation Buttons (No Numbered Indicators) */}
        <div className="flex items-center gap-2.5">
          {/* Previous Button */}
          <button
            type="button"
            aria-label={isRtl ? "پروژه قبلی" : "Previous Project"}
            onClick={() => swiperRef.current?.slidePrev()}
            className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-black/15 dark:border-white/20 text-foreground bg-white/70 dark:bg-white/[0.08] backdrop-blur-sm hover:bg-[#1F1F1E] hover:text-white dark:hover:bg-white dark:hover:text-[#1F1F1E] hover:scale-105 active:scale-95 transition-all duration-300 shadow-sm cursor-pointer"
          >
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${isRtl ? "rotate-180" : ""}`}
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
            className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-black/15 dark:border-white/20 text-foreground bg-white/70 dark:bg-white/[0.08] backdrop-blur-sm hover:bg-[#1F1F1E] hover:text-white dark:hover:bg-white dark:hover:text-[#1F1F1E] hover:scale-105 active:scale-95 transition-all duration-300 shadow-sm cursor-pointer"
          >
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${isRtl ? "rotate-180" : ""}`}
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
                delay: 6000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
        }
        speed={700}
        grabCursor={true}
        className="w-full !overflow-visible"
      >
        {projects.map((project, idx) => {
          // Identify the 2 supporting projects in rotation
          const supp1 = projects[(idx + 1) % total];
          const supp2 = projects[(idx + 2) % total];

          return (
            <SwiperSlide key={project.id || idx} className="!h-auto">
              {/* ─────────────────────────────────────────────────────────────
                  DESKTOP: Three-Project Asymmetrical Composition
                  (1 Dominant Project @ ~62% + 2 Supporting Projects @ ~38%)
                  ───────────────────────────────────────────────────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
                {/* ── 1. Dominant Project Card (Col span 7 on Desktop) ── */}
                <div className="lg:col-span-7 flex flex-col">
                  <article className="group relative flex flex-col justify-between h-[520px] sm:h-[580px] lg:h-[620px] rounded-3xl sm:rounded-[32px] overflow-hidden bg-white/75 dark:bg-[#1C201E]/65 backdrop-blur-md border border-white/90 dark:border-white/10 shadow-[0_8px_30px_rgba(44,66,59,0.08)] hover:shadow-[0_16px_48px_rgba(44,66,59,0.16)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_20px_60px_rgba(0,0,0,0.7)] transition-all duration-500">
                    {/* Background Cover Image with cinematic scrim */}
                    <div className="absolute inset-0 w-full h-full overflow-hidden bg-black/40">
                      <Image
                        src={project.image || "/case_study_1.jpg"}
                        alt={isRtl ? project.titleFa : project.titleEn}
                        fill
                        priority={idx === 0}
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      {/* Dominant Dark Gradient Overlay for flawless contrast */}
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 via-45% to-black/30 pointer-events-none"
                      />
                    </div>

                    {/* Top Badges Row */}
                    <div className="relative z-10 p-6 sm:p-8 flex items-center justify-between gap-3 text-white">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs font-bold text-white/90">
                          <span>{isRtl ? project.categoryFa : project.categoryEn}</span>
                        </span>
                        {project.year && (
                          <span className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-[11px] font-mono text-white/80">
                            {project.year}
                          </span>
                        )}
                      </div>

                      {/* Featured Indicator Pill */}
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] font-bold tracking-wider uppercase text-white/90">
                        {isRtl ? "پروژه شاخص" : "FEATURED WORK"}
                      </span>
                    </div>

                    {/* Bottom Content Area */}
                    <div className="relative z-10 p-6 sm:p-8 lg:p-10 text-white">
                      {/* Client / Organization */}
                      <span className="block text-xs sm:text-sm font-semibold text-[#B7FF00] mb-2 uppercase tracking-wider">
                        {isRtl ? project.client : project.clientEn}
                      </span>

                      {/* Title */}
                      <h3
                        className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug mb-3.5 group-hover:text-white transition-colors ${
                          isRtl
                            ? "font-[family-name:var(--font-vazirmatn)]"
                            : "font-[family-name:var(--font-gendy)]"
                        }`}
                      >
                        {isRtl ? project.titleFa : project.titleEn}
                      </h3>

                      {/* Short Description */}
                      <p className="text-xs sm:text-sm lg:text-base text-white/85 leading-relaxed line-clamp-2 max-w-2xl mb-6 font-normal">
                        {isRtl ? project.taglineFa : project.taglineEn}
                      </p>

                      {/* Metrics Strip */}
                      {project.metricsFa && project.metricsFa.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mb-6 pt-4 border-t border-white/15">
                          {(isRtl ? project.metricsFa : project.metricsEn).map((m, mIdx) => (
                            <div
                              key={mIdx}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/50 backdrop-blur-md border border-white/15 text-xs text-white/90"
                            >
                              <span className="font-mono font-bold text-[#B7FF00]" dir="ltr">
                                {m.value}
                              </span>
                              <span className="text-[11px] text-white/75">{m.label}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Explore Button */}
                      <div className="flex items-center justify-between gap-4">
                        <Link
                          href={`/portfolio/${project.slug}`}
                          className="inline-flex items-center gap-2.5 px-5 sm:px-6 py-3 rounded-full bg-[#38534A] dark:bg-[#8AB3A0] hover:bg-[#2B4039] text-white dark:text-[#17221E] text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all cursor-pointer"
                        >
                          <span>{isRtl ? "مشاهده مطالعه موردی کامل" : "Explore Case Study"}</span>
                          <svg
                            className={`w-4 h-4 transition-transform duration-300 ${
                              isRtl ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2.2"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </article>
                </div>

                {/* ── 2. Two Smaller Supporting Project Cards (Col span 5 on Desktop) ── */}
                <div className="lg:col-span-5 hidden md:flex flex-col justify-between gap-6 sm:gap-7">
                  {/* Supporting Card 1 */}
                  {supp1 && (
                    <article
                      onClick={() => swiperRef.current?.slideNext()}
                      className="group relative flex flex-row items-stretch justify-between h-[245px] sm:h-[275px] lg:h-[295px] rounded-2xl sm:rounded-[26px] overflow-hidden bg-white/75 dark:bg-[#1C201E]/65 backdrop-blur-md border border-white/90 dark:border-white/10 shadow-[0_4px_24px_rgba(44,66,59,0.06)] hover:shadow-[0_12px_36px_rgba(44,66,59,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_14px_45px_rgba(0,0,0,0.6)] hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                    >
                      {/* Info Side (50%) */}
                      <div className="flex flex-col justify-between w-[52%] p-5 sm:p-6 z-10 shrink-0">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#38534A] dark:text-[#8AB3A0]">
                              {isRtl ? supp1.categoryFa : supp1.categoryEn}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-foreground/60 block mb-1">
                            {isRtl ? supp1.client : supp1.clientEn}
                          </span>
                          <h4 className="text-sm sm:text-base font-bold text-foreground leading-snug line-clamp-2 group-hover:text-[#38534A] dark:group-hover:text-[#8AB3A0] transition-colors">
                            {isRtl ? supp1.titleFa : supp1.titleEn}
                          </h4>
                        </div>

                        <div className="pt-2 flex items-center justify-between">
                          <Link
                            href={`/portfolio/${supp1.slug}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs font-bold text-[#38534A] dark:text-[#8AB3A0] hover:underline flex items-center gap-1"
                          >
                            <span>{isRtl ? "جزئیات پروژه" : "View Details"}</span>
                            <svg className={`w-3 h-3 ${isRtl ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>

                          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-black/15 dark:border-white/20 text-foreground bg-white/70 dark:bg-white/[0.08] backdrop-blur-sm group-hover:bg-[#1F1F1E] group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-[#1F1F1E] transition-all">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Image Side (48%) */}
                      <div className="relative w-[48%] h-full overflow-hidden bg-black/10">
                        <Image
                          src={supp1.image || "/case_study_1.jpg"}
                          alt={isRtl ? supp1.titleFa : supp1.titleEn}
                          fill
                          sizes="(max-width: 1024px) 50vw, 25vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                    </article>
                  )}

                  {/* Supporting Card 2 */}
                  {supp2 && (
                    <article
                      onClick={() => swiperRef.current?.slideNext()}
                      className="group relative flex flex-row items-stretch justify-between h-[245px] sm:h-[275px] lg:h-[295px] rounded-2xl sm:rounded-[26px] overflow-hidden bg-white/75 dark:bg-[#1C201E]/65 backdrop-blur-md border border-white/90 dark:border-white/10 shadow-[0_4px_24px_rgba(44,66,59,0.06)] hover:shadow-[0_12px_36px_rgba(44,66,59,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_14px_45px_rgba(0,0,0,0.6)] hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                    >
                      {/* Info Side (50%) */}
                      <div className="flex flex-col justify-between w-[52%] p-5 sm:p-6 z-10 shrink-0">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#38534A] dark:text-[#8AB3A0]">
                              {isRtl ? supp2.categoryFa : supp2.categoryEn}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-foreground/60 block mb-1">
                            {isRtl ? supp2.client : supp2.clientEn}
                          </span>
                          <h4 className="text-sm sm:text-base font-bold text-foreground leading-snug line-clamp-2 group-hover:text-[#38534A] dark:group-hover:text-[#8AB3A0] transition-colors">
                            {isRtl ? supp2.titleFa : supp2.titleEn}
                          </h4>
                        </div>

                        <div className="pt-2 flex items-center justify-between">
                          <Link
                            href={`/portfolio/${supp2.slug}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs font-bold text-[#38534A] dark:text-[#8AB3A0] hover:underline flex items-center gap-1"
                          >
                            <span>{isRtl ? "جزئیات پروژه" : "View Details"}</span>
                            <svg className={`w-3 h-3 ${isRtl ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>

                          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-black/15 dark:border-white/20 text-foreground bg-white/70 dark:bg-white/[0.08] backdrop-blur-sm group-hover:bg-[#1F1F1E] group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-[#1F1F1E] transition-all">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Image Side (48%) */}
                      <div className="relative w-[48%] h-full overflow-hidden bg-black/10">
                        <Image
                          src={supp2.image || "/case_study_2.jpg"}
                          alt={isRtl ? supp2.titleFa : supp2.titleEn}
                          fill
                          sizes="(max-width: 1024px) 50vw, 25vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
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
