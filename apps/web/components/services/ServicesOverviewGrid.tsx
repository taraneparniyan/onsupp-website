"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { DETAILED_SERVICES_DATA, type ServiceDetailItem } from "./services-data";
import { CategoryIcon } from "./CategoryIcon";
import { scrollToSection } from "@/lib/scroll";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function ServicesOverviewGrid({
  isRtl,
  services,
}: {
  isRtl: boolean;
  services?: ServiceDetailItem[];
}) {
  const prefersReducedMotion = useReducedMotion();
  const displayedServices =
    services && services.length > 0 ? services : DETAILED_SERVICES_DATA;

  const handleCardClick = (serviceId: string) => {
    scrollToSection(serviceId);
  };

  return (
    <section
      id="services-overview"
      aria-label={isRtl ? "خدمات تخصصی آن‌ساپ" : "OnSupp Specialized Services"}
      className="relative w-full lg:min-h-[100vh] lg:min-h-[100svh] flex flex-col justify-center py-16 sm:py-24 lg:py-24 bg-background border-b border-border/60 transition-colors duration-500"
    >
      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-12 xl:px-14">
        {/* ─── Centered Section Header ─── */}
        <ScrollReveal once viewportMargin="0px">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
            <div className="inline-flex items-center gap-3 text-xs font-bold tracking-widest text-mint uppercase">
              <span className="w-6 h-px bg-mint" />
              <span>{isRtl ? "خدمات ما" : "OUR SERVICES"}</span>
              <span className="w-6 h-px bg-mint" />
            </div>

            <h2
              className={`text-2xl sm:text-3xl md:text-4xl lg:whitespace-nowrap font-extrabold tracking-tight text-foreground ${
                isRtl
                  ? "font-[family-name:var(--font-vazirmatn)]"
                  : "font-[family-name:var(--font-gendy)]"
              }`}
            >
              {isRtl ? "خدمات تخصصی آن‌ساپ" : "OnSupp Specialized Services"}
            </h2>

            <div className="w-12 h-1 bg-burgundy dark:bg-[#d9757a] mx-auto rounded-full mt-2" />

            <p className="text-sm sm:text-base text-muted pt-2 leading-relaxed">
              {isRtl
                ? "ارائه راهکارهای یکپارچه و تخصصی متناسب با مقیاس و نیازمندی‌های استراتژیک برند شما"
                : "Comprehensive and specialized digital solutions tailored to your enterprise strategic scale"}
            </p>
          </div>
        </ScrollReveal>

        {/* ─── Symmetrical Centered Cards Grid (Sharp Corners, Balanced Horizontal & Vertical Rhythm) ─── */}
        <div className="flex flex-wrap justify-center items-stretch gap-5 sm:gap-6 w-full mx-auto">
          {displayedServices.map((service, index) => {
            return (
              <motion.article
                key={service.id}
                id={`overview-${service.id}`}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                onClick={() => handleCardClick(service.id)}
                className="group relative flex flex-col justify-between w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] xl:w-[calc(25%-1.125rem)] min-h-[260px] p-6 sm:p-7 rounded-card sm:rounded-card-lg bg-panel/85 dark:bg-panel/55 backdrop-blur-md border border-border/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_12px_36px_rgba(0,0,0,0.4)] hover:border-mint/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div>
                  {/* Top Row: Icon Container + Department Number */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-card-sm flex items-center justify-center bg-mint/10 text-mint border border-mint/25 group-hover:bg-[#38534A] group-hover:text-white dark:group-hover:bg-[#8AB3A0] dark:group-hover:text-[#1F1F1E] transition-colors duration-300">
                      <CategoryIcon type={service.iconType} className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono font-bold text-muted/60 group-hover:text-mint transition-colors">
                      {isRtl ? service.numStrFa : service.numStrEn}
                    </span>
                  </div>

                  {/* Service Title */}
                  <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-mint transition-colors mb-2.5 leading-snug">
                    {isRtl ? service.titleFa : service.titleEn}
                  </h3>

                  {/* Short Description */}
                  <p className="text-xs sm:text-sm text-muted leading-relaxed line-clamp-3">
                    {isRtl ? service.descriptionFa : service.descriptionEn}
                  </p>
                </div>

                {/* Card Action Link with Sharp Square Button */}
                <div className="pt-5 mt-6 border-t border-border/60 flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted group-hover:text-foreground transition-colors">
                    {isRtl ? "مشاهده جزئیات" : "View Details"}
                  </span>
                  <div className="w-8 h-8 rounded-control bg-raised border border-border flex items-center justify-center text-muted group-hover:text-white group-hover:bg-[#38534A] group-hover:border-[#38534A] dark:group-hover:bg-[#8AB3A0] dark:group-hover:text-[#1F1F1E] dark:group-hover:border-[#8AB3A0] transition-all">
                    <svg
                      className={`w-3.5 h-3.5 transition-transform ${
                        isRtl
                          ? "rotate-180 group-hover:-translate-x-0.5"
                          : "group-hover:translate-x-0.5"
                      }`}
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
