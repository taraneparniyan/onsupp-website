"use client";

import React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { DETAILED_SERVICES_DATA, type ServiceDetailItem } from "./services-data";
import { CategoryIcon } from "./CategoryIcon";
import { scrollToSection } from "@/lib/scroll";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function ServicesOverviewGrid({
  isRtl,
  services = DETAILED_SERVICES_DATA,
}: {
  isRtl: boolean;
  services?: ServiceDetailItem[];
}) {
  const prefersReducedMotion = useReducedMotion();
  const displayedServices = services;

  const handleCardClick = (serviceId: string) => {
    scrollToSection(serviceId);
  };

  return (
    <section
      id="services-overview"
      aria-label={isRtl ? "نمای اجمالی دپارتمان‌های آن‌ساپ" : "OnSupp Services Overview"}
      className="relative w-full py-16 sm:py-24 bg-[#F8F9FA] dark:bg-[#141715] border-b border-black/[0.06] dark:border-white/[0.08] transition-colors duration-500"
    >
      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-14">
        {/* ─── Section Header (Editorial High-Contrast Style) ─── */}
        <ScrollReveal once viewportMargin="0px">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-14">
            <div>
              {/* Eyebrow - Matching About Us Section Pattern */}
              <div className="inline-flex items-center gap-3 mb-2.5 text-xs sm:text-sm font-bold tracking-widest text-[#38534A] dark:text-[#8AB3A0] uppercase">
                <span className="h-px w-10 bg-[#38534A]/50 dark:bg-[#8AB3A0]/50" />
                <span>{isRtl ? "دپارتمان‌های تخصصی آن‌ساپ" : "CORE SERVICES OVERVIEW"}</span>
              </div>

              {/* Headline */}
              <h2
                className={`text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-bold tracking-tight text-foreground ${
                  isRtl
                    ? "font-[family-name:var(--font-vazirmatn)]"
                    : "font-[family-name:var(--font-gendy)]"
                }`}
              >
                {isRtl ? "معماری دپارتمان‌ها و کارت‌های خدمات" : "Department Ecosystem & Capabilities"}
              </h2>

              <p className="text-sm sm:text-base text-foreground/70 max-w-2xl mt-3 leading-relaxed">
                {isRtl
                  ? "۷ دپارتمان اصلی آن‌ساپ در قالب کارت‌های مدرن شیشه‌ای (Glassmorphism). برای مشاهده جزئیات عمیق‌تر و خروجی‌های هر دپارتمان، روی کارت مربوطه کلیک کنید."
                  : "Explore our 7 specialized departments rendered through translucent glassmorphic surfaces. Click any card to dive deep into its detailed deliverables and business value."}
              </p>
            </div>

            {/* Total count badge */}
            <div className="flex items-center gap-3 shrink-0 self-start md:self-end">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/10 text-xs font-mono text-foreground/75 backdrop-blur-sm shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#38534A] dark:bg-[#8AB3A0]" />
                <span>{isRtl ? "۷ دپارتمان تخصصی" : "7 Specialized Departments"}</span>
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* ─── Glassmorphic Service Cards Grid ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {displayedServices.map((service, index) => {
            const isFlagship = index === 0;

            return (
              <motion.article
                key={service.id}
                id={`overview-${service.id}`}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: index * 0.06 }}
                onClick={() => handleCardClick(service.id)}
                className={`group relative flex flex-col justify-between rounded-2xl sm:rounded-[24px] overflow-hidden bg-white/75 dark:bg-[#1C201E]/65 backdrop-blur-md border border-white/90 dark:border-white/10 shadow-[0_4px_24px_rgba(44,66,59,0.06)] hover:shadow-[0_16px_40px_rgba(44,66,59,0.14)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_16px_50px_rgba(0,0,0,0.65)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer ${
                  isFlagship ? "md:col-span-2 lg:col-span-2 md:flex-row" : ""
                }`}
              >
                {/* ── Side A: Text Content & Actions ── */}
                <div
                  className={`flex flex-col justify-between p-6 sm:p-7 z-10 ${
                    isFlagship ? "md:w-1/2 flex-1" : "flex-1"
                  }`}
                >
                  <div>
                    {/* Header: Number & Tag */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] text-[#38534A] dark:text-[#8AB3A0]">
                        {isRtl ? service.numStrFa : service.numStrEn}
                      </span>

                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#38534A] dark:text-[#8AB3A0] uppercase tracking-wider">
                        <CategoryIcon type={service.iconType} className="w-3.5 h-3.5" />
                        <span>{isRtl ? service.tagFa : service.tagEn}</span>
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      className={`text-lg sm:text-xl lg:text-[22px] font-bold text-foreground leading-snug tracking-tight mb-3 group-hover:text-[#38534A] dark:group-hover:text-[#8AB3A0] transition-colors ${
                        isRtl
                          ? "font-[family-name:var(--font-vazirmatn)]"
                          : "font-[family-name:var(--font-gendy)]"
                      }`}
                    >
                      {isRtl ? service.titleFa : service.titleEn}
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed line-clamp-3 mb-5">
                      {isRtl ? service.descriptionFa : service.descriptionEn}
                    </p>

                    {/* Subservice Pills Preview */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {service.subservices.slice(0, 3).map((sub, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] text-foreground/70"
                        >
                          {isRtl ? sub.nameFa : sub.nameEn}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer Row: Action & Arrow */}
                  <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-[#38534A] dark:text-[#8AB3A0] group-hover:underline underline-offset-4 flex items-center gap-1.5">
                      <span>{isRtl ? "مشاهده جزئیات کامل و خروجی‌ها" : "View Detailed Deliverables"}</span>
                      <svg
                        className={`w-3.5 h-3.5 transition-transform duration-300 ${
                          isRtl
                            ? "-rotate-90 group-hover:translate-y-0.5"
                            : "rotate-90 group-hover:translate-y-0.5"
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>

                    {/* Circular Action Button */}
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 dark:border-white/20 text-foreground bg-white/70 dark:bg-white/[0.08] backdrop-blur-sm group-hover:bg-[#1F1F1E] group-hover:text-white group-hover:border-[#1F1F1E] dark:group-hover:bg-white dark:group-hover:text-[#1F1F1E] dark:group-hover:border-white transition-all duration-300 shadow-sm shrink-0">
                      <svg
                        className="w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d={
                            isRtl
                              ? "M17 17L7 7M7 7H17M7 7V17"
                              : "M7 17L17 7M17 7H7M17 7V17"
                          }
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* ── Side B: Dominant Visual Image Container ── */}
                <div
                  className={`relative overflow-hidden bg-black/[0.03] dark:bg-white/[0.02] ${
                    isFlagship
                      ? "md:w-1/2 min-h-[260px] md:min-h-full"
                      : "w-full h-48 sm:h-52"
                  }`}
                >
                  <Image
                    src={service.image}
                    alt={isRtl ? service.titleFa : service.titleEn}
                    fill
                    sizes={
                      isFlagship
                        ? "(max-width: 768px) 100vw, 50vw"
                        : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    }
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    loading={index < 3 ? "eager" : "lazy"}
                  />
                  {/* Subtle inner top scrim for contrast */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none"
                  />

                  {/* Active department count badge floating over image */}
                  <div className="absolute bottom-3 start-3 z-10">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-mono font-medium border border-white/15">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B7FF00]" />
                      <span>
                        {isRtl
                          ? `${service.subservices.length} زیرخدمت`
                          : `${service.subservices.length} Sub-services`}
                      </span>
                    </span>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
