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

  return (
    <section
      aria-label={isRtl ? "خدمات تخصصی آن‌ساپ" : "OnSupp Core Services"}
      className="relative w-full pt-6 pb-16 sm:py-20 lg:py-28 overflow-hidden bg-background text-foreground"
    >
      <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-12 xl:px-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* ── Left / Side A in RTL: Visual Artwork & Feature Highlight (Inspired by Reference Composition) ── */}
          <div className="lg:col-span-6 order-2 lg:order-1 flex justify-center lg:justify-start">
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-[540px] aspect-[4/3] sm:aspect-[16/11] rounded-[28px] sm:rounded-[36px] overflow-hidden border border-border/80 shadow-[0_12px_44px_rgba(0,0,0,0.06)] dark:shadow-[0_16px_50px_rgba(0,0,0,0.4)] group bg-panel"
            >
              <Image
                src="/images/hero/hero-media-studio.webp"
                alt={isRtl ? "استودیو و خدمات تخصصی آن‌ساپ" : "OnSupp Studio & Specialized Services"}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 540px"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Subtle ambient light gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-80" />

              {/* Floating Pill Tag (Inspired by reference aesthetic) */}
              <div className="absolute bottom-5 start-5 sm:bottom-6 sm:start-6 z-10 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-panel/90 backdrop-blur-md border border-border shadow-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-mint animate-pulse" />
                <span className="text-xs sm:text-sm font-medium text-foreground">
                  {isRtl ? "۷ دپارتمان تخصصی برای رشد برند" : "7 Departments for Brand Growth"}
                </span>
              </div>
            </motion.div>
          </div>

          {/* ── Right / Side B in RTL: Editorial Typography & Call to Action ── */}
          <div className="lg:col-span-6 order-1 lg:order-2 text-start">
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              {/* Eyebrow Label with decorative rule */}
              <div className="inline-flex items-center gap-3 text-xs sm:text-sm font-bold tracking-widest text-mint uppercase">
                <span className="h-0.5 w-8 bg-mint" />
                <span>{isRtl ? "خدمات ما" : "OUR SERVICES"}</span>
              </div>

              {/* Primary Headline with Brand Burgundy Contrast */}
              <h1
                className={`text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-black text-foreground tracking-tight leading-[1.3] lg:leading-[1.25] ${
                  isRtl ? "font-[family-name:var(--font-vazirmatn)]" : "font-[family-name:var(--font-gendy)]"
                }`}
              >
                {isRtl ? (
                  <>
                    ارائه خدمات <span className="text-burgundy dark:text-[#d9757a]">تخصصی</span>
                    <br className="hidden sm:inline" /> در بالاترین سطح کیفیت
                  </>
                ) : (
                  <>
                    Delivering <span className="text-burgundy dark:text-[#d9757a]">Specialized</span>
                    <br className="hidden sm:inline" /> Digital Services at the Highest Standard
                  </>
                )}
              </h1>

              {/* Descriptive Paragraph */}
              <p className="text-sm sm:text-base md:text-lg text-muted max-w-xl leading-relaxed">
                {isRtl
                  ? "با بهره‌گیری از جدیدترین فناوری‌های دیجیتال، تولید محتوای سینمایی، مهندسی پلتفرم و اتوماسیون پیشرفته، تمایز و رشد پایدار برند شما اولویت ماست."
                  : "Leveraging cutting-edge digital technologies, cinematic production, modern platform engineering, and intelligent automation to maximize your brand authority."}
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={handleScrollToServices}
                  className="px-7 py-3.5 rounded-full bg-lime text-ink font-semibold text-sm hover:opacity-95 active:scale-95 transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>{isRtl ? "مشاهده همه خدمات" : "Explore All Services"}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${isRtl ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`}
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

                <button
                  type="button"
                  onClick={() => scrollToSection("services-cta")}
                  className="px-6 py-3.5 rounded-full bg-panel text-foreground border border-border font-medium text-sm hover:bg-raised transition-colors cursor-pointer"
                >
                  {isRtl ? "دریافت مشاوره رایگان" : "Request Free Consultation"}
                </button>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
