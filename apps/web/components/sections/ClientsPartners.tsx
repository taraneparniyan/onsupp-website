"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { EASE_PREMIUM } from "@/lib/motion";
import { CLIENT_PARTNERS, type ClientPartnerItem } from "@/config/clients-partners";
import { BACKEND_URL } from "@/config/api";

const toFaDigits = (val: string | number): string =>
  String(val).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d, 10)]);

const LOGO_BY_ORDER: Record<string, string> = {
  "01": "/images/client-logos/cropped-داخل-مقاله-سایز-جدید-1-scaled-1.webp",
  "02": "/images/client-logos/1784025437971-220284966.png",
  "07": "/images/client-logos/dont-bg-logo-Edited.png",
  "10": "/images/client-logos/cropped-دکتر-سینا-پارسی-پورDesign-tool.png",
  "11": "/images/client-logos/1786532435122-428601052.png",
  "13": "/images/client-logos/d0e6674d-5672-4f41-94dd-2e3242594040.png",
  "15": "/images/client-logos/cropped-Image-11.png",
  "17": "/images/client-logos/night-sky-logo-Fav-Icon.webp",
};

export default function ClientsPartners({ initialPartners }: { initialPartners?: any[] }) {
  const { lang } = useLanguage();
  const isRtl = lang === "fa";
  const prefersReducedMotion = useReducedMotion();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const selectorRef = useRef<HTMLDivElement>(null);
  const [clientsList, setClientsList] = useState<ClientPartnerItem[]>(() => {
    if (Array.isArray(initialPartners) && initialPartners.length > 0) {
      return initialPartners.map((item: any, idx: number) => {
        const orderNum = item.orderNumber || String(idx + 1).padStart(2, "0");
        return {
          id: String(item.id || item.orderNumber || idx),
          orderNumber: orderNum,
          nameFa: item.nameFa || "",
          nameEn: item.nameEn || item.nameFa || "",
          titleFa: item.titleFa || item.categoryFa || "",
          titleEn: item.titleEn || item.categoryEn || item.titleFa || "",
          industryFa: item.industryFa || item.categoryFa || "",
          industryEn: item.industryEn || item.categoryEn || "",
          introFa: item.introFa || "",
          introEn: item.introEn || "",
          quoteFa: item.quoteFa || "",
          quoteEn: item.quoteEn || "",
          servicesFa: Array.isArray(item.servicesFa) ? item.servicesFa : [],
          servicesEn: Array.isArray(item.servicesEn) ? item.servicesEn : [],
          yearFa: item.yearFa || "۱۴۰۳",
          yearEn: item.yearEn || "2024",
          monogram: item.monogram || item.nameFa?.slice(0, 2) || "OS",
          logoImage: LOGO_BY_ORDER[orderNum] || item.logoUrl || item.logoImage || "",
          portraitImage: item.portraitUrl || "",
          portraitBadgeFa: item.portraitBadgeFa || "همکار استراتژیک آن‌ساپ",
          portraitBadgeEn: item.portraitBadgeEn || "OnSupp Strategic Partner",
          websites: Array.isArray(item.websites) ? item.websites : (item.websiteUrl ? [{ url: item.websiteUrl, label: item.websiteUrl }] : []),
          instagrams: Array.isArray(item.instagrams) ? item.instagrams : [],
        };
      });
    }
    return CLIENT_PARTNERS;
  });

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/v1/client-partners`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: ClientPartnerItem[] = data.map((item: any, idx: number) => {
            const orderNum = item.orderNumber || String(idx + 1).padStart(2, "0");
            return {
              id: String(item.id || item.orderNumber || idx),
              orderNumber: orderNum,
              nameFa: item.nameFa || "",
              nameEn: item.nameEn || item.nameFa || "",
              titleFa: item.titleFa || "",
              titleEn: item.titleEn || item.titleFa || "",
              industryFa: item.industryFa || "",
              industryEn: item.industryEn || "",
              introFa: item.introFa || "",
              introEn: item.introEn || "",
              quoteFa: item.quoteFa || "",
              quoteEn: item.quoteEn || "",
              servicesFa: Array.isArray(item.servicesFa) ? item.servicesFa : [],
              servicesEn: Array.isArray(item.servicesEn) ? item.servicesEn : [],
              yearFa: item.yearFa || "۱۴۰۳",
              yearEn: item.yearEn || "2024",
              monogram: item.monogram || item.nameFa?.slice(0, 2) || "OS",
              logoImage: LOGO_BY_ORDER[orderNum] || item.logoImage || "",
              portraitImage: "",
              portraitBadgeFa: item.portraitBadgeFa || "همکار استراتژیک آن‌ساپ",
              portraitBadgeEn: item.portraitBadgeEn || "OnSupp Strategic Partner",
              websites: Array.isArray(item.websites) ? item.websites : [],
              instagrams: Array.isArray(item.instagrams) ? item.instagrams : [],
            };
          });
          setClientsList(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const totalClients = clientsList.length;
  const currentClient = clientsList[currentIndex] || clientsList[0];

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % totalClients);
  }, [totalClients]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + totalClients) % totalClients);
  }, [totalClients]);

  const handleLeftNav = useCallback(() => {
    if (isRtl) handleNext();
    else handlePrev();
  }, [isRtl, handleNext, handlePrev]);

  const handleRightNav = useCallback(() => {
    if (isRtl) handlePrev();
    else handleNext();
  }, [isRtl, handlePrev, handleNext]);

  const handleSelect = useCallback(
    (index: number) => {
      setDirection(index > currentIndex ? 1 : -1);
      setCurrentIndex(index);
    },
    [currentIndex]
  );

  // Auto-scroll active selector chip into view
  useEffect(() => {
    if (!selectorRef.current) return;
    const activeChip = selectorRef.current.querySelector<HTMLButtonElement>(
      `[data-chip-index="${currentIndex}"]`
    );
    if (activeChip) {
      activeChip.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [currentIndex]);

  // Keyboard navigation when section is focused
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (isRtl) handleNext();
      else handlePrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      if (isRtl) handlePrev();
      else handleNext();
    }
  };

  // Drag swipe handling
  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number }; velocity: { x: number } }
  ) => {
    const swipeThreshold = 50;
    const swipePower = info.offset.x;

    if (swipePower < -swipeThreshold) {
      if (isRtl) handlePrev();
      else handleNext();
    } else if (swipePower > swipeThreshold) {
      if (isRtl) handleNext();
      else handlePrev();
    }
  };

  // Slide transition animation variants
  const slideVariants: Variants = {
    enter: (dir: number) => ({
      x: prefersReducedMotion ? 0 : dir > 0 ? (isRtl ? -35 : 35) : (isRtl ? 35 : -35),
      opacity: 0,
      scale: prefersReducedMotion ? 1 : 0.99,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.45,
        ease: EASE_PREMIUM,
      },
    },
    exit: (dir: number) => ({
      x: prefersReducedMotion ? 0 : dir > 0 ? (isRtl ? 35 : -35) : (isRtl ? -35 : 35),
      opacity: 0,
      scale: prefersReducedMotion ? 1 : 0.99,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.25,
        ease: EASE_PREMIUM,
      },
    }),
  };

  return (
    <section
      id="clients"
      aria-label={isRtl ? "همکاران تجاری و مراجعین آن‌ساپ" : "OnSupp Clients & Partners Showcase"}
      className="relative w-full scroll-mt-20 py-14 sm:py-16 lg:py-20 bg-[#38534A] dark:bg-[#17221E] text-white border-b border-white/10 overflow-hidden select-none transition-colors duration-500"
      dir={isRtl ? "rtl" : "ltr"}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* ── Background Subtle Ambient Volumetric Glow ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-10 start-1/4 w-[650px] h-[650px] rounded-full bg-white/[0.04] blur-[150px]" />
        <div className="absolute -bottom-40 end-1/4 w-[600px] h-[600px] rounded-full bg-black/20 blur-[140px]" />
      </div>

      {/* ── Subtle Floating Side Navigation Arrows (Desktop) ── */}
      <button
        type="button"
        onClick={handleLeftNav}
        aria-label={isRtl ? "اسلاید بعدی (پیشروی)" : "Previous client slide"}
        className="hidden xl:flex absolute left-3 sm:left-6 top-[48%] -translate-y-1/2 z-30 group h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-none border border-white/20 bg-black/30 hover:bg-white/15 text-white backdrop-blur-md shadow-lg transition-all duration-300 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/40"
      >
        <svg
          className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        type="button"
        onClick={handleRightNav}
        aria-label={isRtl ? "اسلاید قبلی (بازگشت)" : "Next client slide"}
        className="hidden xl:flex absolute right-3 sm:right-6 top-[48%] -translate-y-1/2 z-30 group h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-none border border-white/20 bg-black/30 hover:bg-white/15 text-white backdrop-blur-md shadow-lg transition-all duration-300 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/40"
      >
        <svg
          className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="relative mx-auto w-full max-w-[1500px] px-5 sm:px-10 lg:px-14 xl:px-20 z-10">
        {/* ─── Part A: Section Header ─────────────────────────────────────────── */}
        <ScrollReveal once>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 sm:gap-6 mb-8 sm:mb-10">
            <div className="max-w-2xl">
              {/* Category Eyebrow - Matching About Us Section Pattern */}
              <div className="inline-flex items-center gap-3 text-xs sm:text-sm font-bold tracking-widest text-[#A2C5B7] uppercase">
                <span className="h-px w-10 bg-[#A2C5B7]/60" />
                <span>{isRtl ? "همکاری تجاری و کارفرمایان" : "Client Partners & Strategic Roster"}</span>
              </div>

              {/* Editorial Section Heading */}
              <h2
                className={`mt-3 sm:mt-4 pb-1 sm:pb-1.5 text-2xl sm:text-3xl lg:text-[34px] font-bold leading-[1.38] tracking-tight text-white ${
                  isRtl ? "font-[family-name:var(--font-vazirmatn)]" : "font-[family-name:var(--font-gendy)]"
                }`}
              >
                {isRtl ? (
                  <>
                    روایتی مستند از تحول دیجیتال{" "}
                    <span className="text-[#F8F9FA] underline decoration-[#80181E] decoration-2 underline-offset-[12px] sm:underline-offset-[14px] lg:underline-offset-[15px] [text-decoration-skip-ink:none]">
                      برندهای پیشرو
                    </span>
                  </>
                ) : (
                  <>
                    Strategic Impact with{" "}
                    <span className="text-[#F8F9FA] underline decoration-[#80181E] decoration-2 underline-offset-8">
                      Visionary Brands
                    </span>
                  </>
                )}
              </h2>
            </div>

            {/* Slider Navigation Controls (Header Counter & Arrows) */}
            <div className="flex items-center gap-4 sm:gap-5 self-start lg:self-end shrink-0">
              {/* Slide Counter: 01 / 15 */}
              <div className="flex items-baseline gap-1 text-xs sm:text-sm font-semibold tracking-widest text-white/70 tabular-nums">
                <span className="text-xl sm:text-2xl font-bold text-white">
                  {isRtl ? toFaDigits(currentClient.orderNumber) : currentClient.orderNumber}
                </span>
                <span className="mx-1 text-white/40 font-light text-base">/</span>
                <span className="text-white/60">
                  {isRtl
                    ? toFaDigits(totalClients < 10 ? `0${totalClients}` : totalClients)
                    : totalClients < 10
                    ? `0${totalClients}`
                    : totalClients}
                </span>
              </div>

              {/* Arrow Control Buttons */}
              <div className="flex items-center gap-2">
                <motion.button
                  type="button"
                  onClick={handlePrev}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.92 }}
                  aria-label={isRtl ? "اسلاید قبلی کارفرما" : "Previous client slide"}
                  className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-none border border-white/20 bg-white/10 text-white transition-all duration-200 hover:border-white/50 hover:bg-white/20 cursor-pointer shadow-md"
                >
                  <svg
                    className={`h-4 w-4 ${isRtl ? "" : "rotate-180"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>

                <motion.button
                  type="button"
                  onClick={handleNext}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.92 }}
                  aria-label={isRtl ? "اسلاید بعدی کارفرما" : "Next client slide"}
                  className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-none border border-white/20 bg-white/10 text-white transition-all duration-200 hover:border-white/50 hover:bg-white/20 cursor-pointer shadow-md"
                >
                  <svg
                    className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ─── Part B: Balanced Two-Column Composition ─── */}
        <div className="relative w-full">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={currentClient.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.16}
              onDragEnd={handleDragEnd}
              className="w-full cursor-grab active:cursor-grabbing"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 xl:gap-16 items-center">
                {/* ── CLIENT VISUAL / PORTRAIT AREA (Right on desktop in RTL) ── */}
                <motion.div
                  initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.96 }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: EASE_PREMIUM }}
                  className={`lg:col-span-5 xl:col-span-5 flex justify-center order-1 ${
                    isRtl ? "lg:order-1 lg:justify-end" : "lg:order-2 lg:justify-end"
                  }`}
                >
                  {(() => {
                    const clientLogo = currentClient.logoImage || LOGO_BY_ORDER[currentClient.orderNumber];
                    return (
                      <div className="relative w-full max-w-[340px] sm:max-w-[380px] lg:max-w-[420px] xl:max-w-[440px] aspect-[453/475] rounded-none overflow-hidden border border-white/20 bg-[#16231E] shadow-2xl group shrink-0 flex flex-col justify-between">
                        {clientLogo ? (
                          <div className="relative w-full h-full flex flex-col items-center justify-between p-6 sm:p-8 bg-gradient-to-br from-white/[0.06] via-transparent to-black/40">
                            {/* Decorative background grid */}
                            <div
                              className="absolute inset-0 opacity-[0.05] pointer-events-none"
                              style={{
                                backgroundImage:
                                  "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
                                backgroundSize: "20px 20px",
                              }}
                            />

                            {/* Top Status */}
                            <div className="w-full flex items-center justify-between text-white/60 text-[11px] font-mono tracking-widest uppercase z-10">
                              <span>{isRtl ? "نشان رسمی برند" : "Official Brand Logo"}</span>
                              <span className="font-bold text-white/80">{currentClient.orderNumber} / {totalClients}</span>
                            </div>

                            {/* Center Logo Showcase Frame - Zero rounded corners, original authentic colors */}
                            <div className="relative flex flex-col items-center justify-center text-center my-auto w-full z-10">
                              <div className="relative w-44 h-28 sm:w-52 sm:h-32 flex items-center justify-center p-4 bg-white/10 border border-white/20 shadow-xl backdrop-blur-sm transition-transform duration-300 group-hover:scale-[1.02]">
                                <Image
                                  src={clientLogo}
                                  alt={isRtl ? currentClient.nameFa : currentClient.nameEn}
                                  width={180}
                                  height={110}
                                  priority
                                  className="max-h-full max-w-full object-contain filter-none"
                                />
                              </div>
                              <span className="mt-4 text-base sm:text-lg font-bold text-white tracking-wide">
                                {isRtl ? currentClient.nameFa : currentClient.nameEn}
                              </span>
                              <span className="text-xs text-white/70 mt-1 max-w-[280px] truncate">
                                {isRtl ? currentClient.titleFa : currentClient.titleEn}
                              </span>
                            </div>

                            {/* Bottom Badge */}
                            <div className="w-full flex flex-col items-center gap-1.5 text-center z-10">
                              <span className="px-3.5 py-1 bg-white/10 border border-white/20 text-xs text-white/90 font-medium tracking-wide shadow-sm">
                                {isRtl ? currentClient.portraitBadgeFa || "کارفرمای معتبر آن‌ساپ" : currentClient.portraitBadgeEn || "Verified Client Partner"}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="relative w-full h-full flex flex-col items-center justify-between p-6 sm:p-8 bg-gradient-to-br from-white/[0.06] via-transparent to-black/40">
                            {/* Decorative background grid */}
                            <div
                              className="absolute inset-0 opacity-[0.05] pointer-events-none"
                              style={{
                                backgroundImage:
                                  "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
                                backgroundSize: "20px 20px",
                              }}
                            />

                            {/* Top Monogram Label */}
                            <div className="w-full flex items-center justify-between text-white/60 text-[11px] font-mono tracking-widest uppercase z-10">
                              <span>{isRtl ? "همکاری رسمی" : "Official Roster"}</span>
                              <span className="font-bold text-white/80">{currentClient.orderNumber} / {totalClients}</span>
                            </div>

                            {/* Center Monogram Emblem */}
                            <div className="relative flex flex-col items-center justify-center text-center my-auto w-full z-10">
                              <div className="relative w-24 h-24 sm:w-28 sm:h-28 border border-white/25 bg-white/10 backdrop-blur-md flex items-center justify-center shadow-xl transition-transform duration-300 group-hover:scale-[1.02]">
                                <span className="text-3xl sm:text-4xl font-extrabold tracking-wider text-white font-mono">
                                  {currentClient.monogram || currentClient.nameEn.slice(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <span className="mt-4 text-base sm:text-lg font-bold text-white tracking-wide">
                                {isRtl ? currentClient.nameFa : currentClient.nameEn}
                              </span>
                              <span className="text-xs text-white/70 mt-1 max-w-[280px] truncate">
                                {isRtl ? currentClient.titleFa : currentClient.titleEn}
                              </span>
                            </div>

                            {/* Bottom Badge */}
                            <div className="w-full flex flex-col items-center gap-1.5 text-center z-10">
                              <span className="px-3.5 py-1 bg-white/10 border border-white/20 text-xs text-white/90 font-medium tracking-wide shadow-sm">
                                {isRtl ? currentClient.portraitBadgeFa || "کارفرمای معتبر آن‌ساپ" : currentClient.portraitBadgeEn || "Verified Client Partner"}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </motion.div>

                {/* ── TEXT & LINKS CONTENT (Left on desktop in RTL) ── */}
                <motion.div
                  initial={prefersReducedMotion ? undefined : { opacity: 0, y: 14 }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.08, ease: EASE_PREMIUM }}
                  className={`lg:col-span-7 xl:col-span-7 flex flex-col justify-center space-y-4 sm:space-y-5 order-2 ${
                    isRtl ? "lg:order-2 lg:ps-4 xl:ps-6" : "lg:order-1 lg:pe-4 xl:pe-6"
                  }`}
                >
                  {/* Client Identification & Meta */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-white/70">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#80181E] dark:bg-[#D9757A]" />
                      <span>{isRtl ? currentClient.industryFa : currentClient.industryEn}</span>
                      <span className="opacity-40">•</span>
                      <span>{isRtl ? currentClient.yearFa : currentClient.yearEn}</span>
                    </div>

                    <h3
                      className={`text-2xl sm:text-3xl lg:text-[34px] font-bold text-white tracking-tight leading-snug ${
                        isRtl
                          ? "font-[family-name:var(--font-vazirmatn)]"
                          : "font-[family-name:var(--font-gendy)]"
                      }`}
                    >
                      {isRtl ? currentClient.nameFa : currentClient.nameEn}
                    </h3>

                    <p className="text-xs sm:text-sm font-medium text-white/80">
                      {isRtl ? currentClient.titleFa : currentClient.titleEn}
                    </p>
                  </div>

                  {/* Editorial Statement & Storytelling Quote */}
                  <div className="p-5 sm:p-6 rounded-none bg-[#1F1F1E]/40 border border-white/12 space-y-2.5 backdrop-blur-sm shadow-md">
                    <h4 className="text-xs sm:text-[13px] font-bold text-white leading-snug">
                      {isRtl ? currentClient.introFa : currentClient.introEn}
                    </h4>
                    {currentClient.quoteFa && (
                      <p className="text-[12px] sm:text-[13px] text-white/85 leading-relaxed italic line-clamp-5">
                        {isRtl ? currentClient.quoteFa : currentClient.quoteEn}
                      </p>
                    )}
                  </div>

                  {/* Concise Collaboration Scope (Service Tags if present) */}
                  {((isRtl ? currentClient.servicesFa : currentClient.servicesEn) || []).length > 0 && (
                    <div className="pt-1 border-t border-white/10">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-white/90 font-medium">
                        {(isRtl ? currentClient.servicesFa : currentClient.servicesEn)?.map((service, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none bg-white/[0.08] border border-white/15 text-[11px] sm:text-xs text-white/90"
                          >
                            <span className="w-1 h-1 rounded-full bg-white/60" />
                            <span>{service}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ─── Communication & Digital Presence Links (Websites & Instagram) ─── */}
                  <div className="pt-2 space-y-3.5 border-t border-white/10">
                    {/* Websites Group */}
                    {currentClient.websites && currentClient.websites.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-white/80">
                          <svg
                            className="w-4 h-4 text-emerald-300 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                            />
                          </svg>
                          <span>{isRtl ? "وب‌سایت‌های رسمی:" : "Official Websites:"}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {currentClient.websites.map((site, sIdx) => (
                            <motion.a
                              key={sIdx}
                              href={site.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
                              whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-none bg-white text-[#17221E] hover:bg-[#F8F9FA] hover:text-[#80181E] font-medium text-xs sm:text-[13px] shadow-md transition-all duration-200 border border-white/20 group cursor-pointer"
                            >
                              <span dir="ltr" className="font-mono text-xs font-bold">
                                {site.label || site.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                              </span>
                              <svg
                                className="w-3.5 h-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2.2"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </motion.a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Instagram Profiles Group */}
                    {currentClient.instagrams && currentClient.instagrams.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-white/80">
                          <svg className="w-4 h-4 text-pink-300 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                          <span>{isRtl ? "صفحات اینستاگرام:" : "Official Instagram:"}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {currentClient.instagrams.map((insta, iIdx) => (
                            <motion.a
                              key={iIdx}
                              href={insta.profileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
                              whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-none bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-xs sm:text-[13px] backdrop-blur-sm transition-all duration-200 group cursor-pointer"
                            >
                              {insta.name && (
                                <span className="text-white/80 text-xs font-normal border-e border-white/20 pe-2">
                                  {insta.name}
                                </span>
                              )}
                              <span
                                dir="ltr"
                                className="font-mono text-xs font-bold text-pink-200 group-hover:text-white transition-colors"
                              >
                                {insta.handle}
                              </span>
                              <svg
                                className="w-3.5 h-3.5 shrink-0 text-white/60 group-hover:text-white transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2.2"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </motion.a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* ─── Part C: Interactive Quick-Jump Client Selector Roster ─── */}
          <div className="mt-10 sm:mt-12 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between gap-3 mb-3 text-xs text-white/70">
              <span className="font-semibold">
                {isRtl ? "فهرست کارفرمایان و شرکای استراتژیک آن‌ساپ:" : "Explore All Strategic Client Partners:"}
              </span>
              <span className="text-[11px] text-white/50 hidden sm:inline">
                {isRtl ? "برای مشاهده هر کارفرما کلیک کنید" : "Click any client to view details"}
              </span>
            </div>

            <div
              ref={selectorRef}
              className="flex items-center gap-2 overflow-x-auto pb-2 scroll-smooth no-scrollbar"
              style={{ scrollbarWidth: "none" }}
            >
              {clientsList.map((client, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={client.id}
                    data-chip-index={idx}
                    type="button"
                    onClick={() => handleSelect(idx)}
                    aria-label={
                      isRtl
                        ? `مشاهده جزئیات ${client.nameFa}`
                        : `View ${client.nameEn} details`
                    }
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs whitespace-nowrap transition-all duration-300 cursor-pointer shrink-0 border ${
                      isActive
                        ? "bg-white text-[#17221E] font-bold shadow-lg border-white scale-[1.02]"
                        : "bg-white/[0.08] hover:bg-white/[0.16] text-white/80 hover:text-white border-white/15"
                    }`}
                  >
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isActive ? "bg-black/10 text-[#17221E]" : "bg-white/10 text-white/60"
                      }`}
                    >
                      {isRtl ? toFaDigits(client.orderNumber) : client.orderNumber}
                    </span>
                    <span>{isRtl ? client.nameFa : client.nameEn}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
