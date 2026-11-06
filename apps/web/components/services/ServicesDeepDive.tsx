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
  services,
  onConsultationRequest,
}: {
  isRtl: boolean;
  services?: ServiceDetailItem[];
  onConsultationRequest?: (serviceId: string) => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  const displayedServices = services && services.length > 0 ? services : DETAILED_SERVICES_DATA;

  const handleRequestConsultation = (serviceId: string) => {
    if (onConsultationRequest) {
      onConsultationRequest(serviceId);
    }
    scrollToSection("services-cta");
  };

  return (
    <section
      id="services-deep-dive"
      aria-label={isRtl ? "معرفی تفصیلی خدمات تخصصی" : "Comprehensive Service Dossiers"}
      className="relative w-full py-16 sm:py-24 bg-background transition-colors duration-500"
    >
      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-12 xl:px-14">
        
        {/* ─── Centered Section Header ─── */}
        <ScrollReveal once viewportMargin="0px">
          <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20 space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-mint uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-mint" />
              <span>{isRtl ? "دپارتمان‌های کلیدی" : "CORE DEPARTMENTS"}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-mint" />
            </div>

            <h2
              className={`text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground ${
                isRtl
                  ? "font-[family-name:var(--font-vazirmatn)]"
                  : "font-[family-name:var(--font-gendy)]"
              }`}
            >
              {isRtl ? "معرفی دپارتمان‌ها و خدمات تخصصی" : "Specialized Department Dossiers"}
            </h2>

            <div className="w-12 h-1 bg-burgundy dark:bg-[#d9757a] mx-auto rounded-full mt-2" />

            <p className="text-sm sm:text-base text-muted pt-2 leading-relaxed">
              {isRtl
                ? "بررسی عمیق رویکرد اجرایی، خروجی‌ها و استانداردهای کیفی هر دپارتمان در قالب کارت‌های تصویری اختصاصی"
                : "In-depth overview of execution frameworks, core deliverables, and qualitative benchmarks"}
            </p>
          </div>
        </ScrollReveal>

        {/* 
          Alternating Feature Rows: Inspired by Reference Cards
          Row 1: Image Left, Text Right (in RTL)
          Row 2: Image Right, Text Left (in RTL)
          And on mobile, stacked cleanly with image first, text second.
        */}
        <div className="space-y-16 sm:space-y-24">
          {displayedServices.map((service, idx) => {
            const isEven = idx % 2 === 0;

            return (
              <motion.article
                key={service.id}
                id={service.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: 0.05 }}
                className="scroll-mt-28 rounded-[28px] sm:rounded-[36px] bg-panel/70 dark:bg-panel/40 backdrop-blur-md border border-border/80 p-6 sm:p-10 lg:p-12 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.07)] dark:hover:shadow-[0_16px_40px_rgba(0,0,0,0.4)] transition-all"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                  
                  {/* ── Image Column (Alternates based on isEven in desktop, consistent on mobile) ── */}
                  <div
                    className={`lg:col-span-6 w-full ${
                      isEven ? "lg:order-1" : "lg:order-2"
                    }`}
                  >
                    <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl sm:rounded-[24px] overflow-hidden border border-border/80 bg-raised group">
                      <Image
                        src={service.image}
                        alt={isRtl ? service.titleFa : service.titleEn}
                        fill
                        sizes="(max-width: 1024px) 100vw, 600px"
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

                      {/* Number Tag in Image Corner */}
                      <div className="absolute top-4 start-4 z-10 px-3.5 py-1.5 rounded-xl bg-panel/80 backdrop-blur-md border border-border text-xs font-mono font-bold text-foreground">
                        {isRtl ? service.numStrFa : service.numStrEn}
                      </div>
                    </div>
                  </div>

                  {/* ── Text Content Column ── */}
                  <div
                    className={`lg:col-span-6 w-full space-y-5 text-start ${
                      isEven ? "lg:order-2" : "lg:order-1"
                    }`}
                  >
                    {/* Category Tag with Icon */}
                    <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-mint/10 text-mint border border-mint/20 text-xs font-medium">
                      <CategoryIcon type={service.iconType} className="w-4 h-4 text-mint" />
                      <span>{isRtl ? service.tagFa : service.tagEn}</span>
                    </div>

                    {/* Service Main Title */}
                    <h3
                      className={`text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight ${
                        isRtl
                          ? "font-[family-name:var(--font-vazirmatn)]"
                          : "font-[family-name:var(--font-gendy)]"
                      }`}
                    >
                      {isRtl ? service.titleFa : service.titleEn}
                    </h3>

                    {/* Headline */}
                    <p className="text-xs sm:text-sm font-semibold text-burgundy dark:text-[#d9757a]">
                      {isRtl ? service.headlineFa : service.headlineEn}
                    </p>

                    {/* Detailed Narrative */}
                    <p className="text-xs sm:text-sm sm:text-base text-muted leading-relaxed">
                      {isRtl ? service.detailedNarrativeFa : service.detailedNarrativeEn}
                    </p>

                    {/* Key Subservices / Deliverables Pills */}
                    {service.subservices && service.subservices.length > 0 && (
                      <div className="pt-2">
                        <h4 className="text-xs font-bold text-foreground mb-2.5">
                          {isRtl ? "محورهای کلیدی دپارتمان:" : "Core Focus Areas:"}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {service.subservices.map((sub, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-3 py-1 rounded-lg bg-raised text-foreground border border-border text-xs font-medium"
                            >
                              {isRtl ? sub.nameFa : sub.nameEn}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action CTA Button */}
                    <div className="pt-3">
                      <button
                        type="button"
                        onClick={() => handleRequestConsultation(service.id)}
                        className="px-6 py-3 rounded-full bg-lime text-ink font-semibold text-xs sm:text-sm hover:opacity-95 active:scale-95 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                      >
                        <span>{isRtl ? service.ctaLabelFa : service.ctaLabelEn}</span>
                        <svg
                          className={`w-3.5 h-3.5 transition-transform ${isRtl ? "rotate-180" : ""}`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </button>
                    </div>

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
