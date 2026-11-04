"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_PREMIUM } from "@/lib/motion";

export default function PortfolioHero({ isRtl }: { isRtl: boolean }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      aria-label={isRtl ? "معرفی نمونه‌کارهای آن‌ساپ" : "OnSupp Portfolio Introduction"}
      className="relative w-full pt-28 sm:pt-36 pb-12 sm:pb-16 overflow-hidden border-b border-[#1F1F1E]/10 dark:border-white/10 bg-[#F4F5F2] dark:bg-[#121413] transition-colors"
    >
      {/* ─── Ambient Atmospheric Background Mesh (Restrained) ─── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none overflow-hidden select-none"
      >
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] sm:w-[960px] h-[400px] bg-[#38534A]/6 dark:bg-[#38534A]/15 rounded-none blur-[100px]" />
        <div className="absolute top-1/3 -right-20 w-[360px] h-[360px] bg-[#4F0001]/4 dark:bg-[#4F0001]/10 rounded-none blur-[90px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(31,31,30,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(31,31,30,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-60" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-14">
        {/* ─── Breadcrumb Navigation ─── */}
        <motion.nav
          aria-label={isRtl ? "مسیر دسترسی" : "Breadcrumbs"}
          initial={prefersReducedMotion ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_PREMIUM }}
          className="flex items-center gap-2 text-xs text-foreground/60 mb-6 font-medium select-none"
        >
          <Link
            href="/"
            className="hover:text-[#38534A] dark:hover:text-[#8AB3A0] transition-colors"
          >
            {isRtl ? "صفحه اصلی" : "Home"}
          </Link>
          <span className="text-foreground/30">/</span>
          <span className="text-foreground font-semibold">
            {isRtl ? "نمونه‌کارها" : "Portfolio"}
          </span>
        </motion.nav>

        {/* ─── Hero Headline & Lead Prose ─── */}
        <div className="max-w-4xl">
          {/* Eyebrow badge */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_PREMIUM, delay: 0.1 }}
            className="inline-flex items-center gap-3 text-xs sm:text-sm font-bold tracking-widest text-[#38534A] dark:text-[#8AB3A0] uppercase mb-5"
          >
            <span className="h-px w-10 bg-[#38534A]/60 dark:bg-[#8AB3A0]/60 shrink-0" />
            <span>
              {isRtl
                ? "ویترین پروژه‌های شاخص • رویکرد دیزاین و مهندسی"
                : "CURATED PORTFOLIO • DESIGN & ENGINEERING"}
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE_PREMIUM, delay: 0.18 }}
            className={`text-3xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-[1.2] sm:leading-[1.18] mb-6 ${
              isRtl
                ? "font-[family-name:var(--font-vazirmatn)]"
                : "font-[family-name:var(--font-gendy)]"
            }`}
          >
            {isRtl
              ? "روایت بصری پروژه‌ها، مهندسی ایده‌ها تا خلق تمایز پایدار"
              : "Visual Project Narratives: Engineering Ideas into Lasting Distinction"}
          </motion.h1>

          {/* Editorial Lead Prose */}
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE_PREMIUM, delay: 0.26 }}
            className="text-base sm:text-lg lg:text-xl text-foreground/75 leading-relaxed sm:leading-[1.8] max-w-3xl mb-8"
          >
            {isRtl
              ? "ویترینی دست‌چین‌شده از پلتفرم‌های نرم‌افزاری، هویت‌های بصری، تولیدات سینمایی و سامانه‌های ابری آن‌ساپ؛ پروژه‌هایی که با تلفیق هنر دیزاین، تفکر استراتژیک و کدنویسی دقیق برای رهبران نوآور بازار مهندسی شده‌اند."
              : "A curated showcase of OnSupp's delivered software platforms, bespoke brand identities, cinematic commercial media, and cloud systems — engineered without compromise for industry frontrunners."}
          </motion.p>

          {/* Quick Metrics Capsule - Strictly Sharp Corners */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE_PREMIUM, delay: 0.34 }}
            className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-semibold text-foreground/75"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-none bg-[#EAEBE7] dark:bg-[#1A1D1C] border border-[#1F1F1E]/12 dark:border-white/10 shadow-sm">
              <span className="font-mono text-[#38534A] dark:text-[#8AB3A0] font-bold">
                {isRtl ? "+۷۰۰" : "700+"}
              </span>
              <span>{isRtl ? "پروژه موفق وب و برندینگ" : "Successful Projects"}</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-none bg-[#EAEBE7] dark:bg-[#1A1D1C] border border-[#1F1F1E]/12 dark:border-white/10 shadow-sm">
              <span className="font-mono text-[#38534A] dark:text-[#8AB3A0] font-bold">
                {isRtl ? "۴.۹ / ۵" : "4.9 / 5"}
              </span>
              <span>{isRtl ? "رضایت مراجعین و کارفرمایان" : "Client Satisfaction Score"}</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-none bg-[#EAEBE7] dark:bg-[#1A1D1C] border border-[#1F1F1E]/12 dark:border-white/10 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-none bg-[#38534A] dark:bg-[#8AB3A0]" />
              <span>{isRtl ? "معماری و کدنویسی اختصاصی" : "Proprietary Architecture"}</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
