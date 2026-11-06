"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, MotionConfig } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/context/LanguageContext";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { EASE_PREMIUM, buttonHover, tapFeedback } from "@/lib/motion";
import { BACKEND_URL } from "@/config/api";
import type { SiteSettingsData, ContactContentData } from "@/lib/publicApi";

const toFaDigits = (val: string | number): string =>
  String(val).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d, 10)]);

interface ContactPageViewProps {
  initialSettings?: SiteSettingsData | null;
  initialContactContent?: ContactContentData | null;
}

const SERVICE_OPTIONS = [
  {
    value: "web-design",
    labelFa: "طراحی سایت و وب‌اپلیکیشن اختصاصی",
    labelEn: "Custom Web Design & Web Applications",
  },
  {
    value: "seo",
    labelFa: "سئو تکنیکال و رشد ارگانیک گوگل",
    labelEn: "Technical SEO & Organic Search Dominance",
  },
  {
    value: "social-identity",
    labelFa: "مدیریت و هویت‌سازی فضای مجازی",
    labelEn: "Social Media Management & Brand Identity",
  },
  {
    value: "studio-production",
    labelFa: "تصویربرداری صنعتی، تیزر و استودیو",
    labelEn: "Commercial Cinematography & Studio Production",
  },
  {
    value: "animation-motion",
    labelFa: "انیمیشن سه‌بعدی و موشن گرافیک",
    labelEn: "3D Animation & Dynamic Motion Graphics",
  },
  {
    value: "crm",
    labelFa: "استقرار CRM و اتوماسیون هوشمند فروش",
    labelEn: "CRM Implementation & Sales Automation",
  },
  {
    value: "programming",
    labelFa: "توسعه نرم‌افزار و سامانه‌های اختصاصی",
    labelEn: "Bespoke Enterprise Software Engineering",
  },
  {
    value: "other",
    labelFa: "مشاوره جامع استراتژی دیجیتال / سایر خدمات",
    labelEn: "Comprehensive Digital Strategy Consultation / Other",
  },
];

export default function ContactPageView({
  initialSettings,
  initialContactContent,
}: ContactPageViewProps) {
  const { lang } = useLanguage();
  const isRtl = lang === "fa";
  const prefersReducedMotion = useReducedMotion();

  // Verified CMS & official project data (No fabricated data)
  const mainPhone = "09102626113";
  const instagramSupportPhone = "09367373510";
  const email = initialSettings?.email || initialContactContent?.email || "info@onsupp.ir";
  const addressFa = "عظیمیه";
  const addressEn = "Azimiyeh";
  const workingHours = isRtl
    ? initialSettings?.workingHoursFa || "شنبه تا چهارشنبه ۹:۰۰ تا ۱۸:۰۰"
    : initialSettings?.workingHoursEn || "Sat - Wed: 09:00 - 18:00";
  const responseTime = isRtl
    ? initialSettings?.responseTimeFa ||
      initialContactContent?.responseTimeFa ||
      "پاسخگویی سریع کمتر از ۲ ساعت کاری"
    : initialSettings?.responseTimeEn ||
      initialContactContent?.responseTimeEn ||
      "Prompt consultation response during business hours";

  const telegramWebHandle = "onsupp_web";
  const telegramWebUrl = "https://t.me/onsupp_web";
  const telegramSocialHandle = "onsupp_socialmedia";
  const telegramSocialUrl = "https://t.me/onsupp_socialmedia";
  const instagramHandle = "onsupp.ir";
  const instagramUrl = "https://instagram.com/onsupp.ir";
  const googleMapsUrl =
    initialSettings?.googleMapsUrl && initialSettings.googleMapsUrl.trim()
      ? initialSettings.googleMapsUrl
      : "https://maps.google.com/?q=عظیمیه";

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    service: "web-design",
    message: "",
    website_hp: "", // Honeypot anti-spam field
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [lastSubmitAt, setLastSubmitAt] = useState<number>(0);

  // Client-side Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const trimmedName = formData.name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      newErrors.name = isRtl
        ? "لطفاً نام و نام خانوادگی خود را وارد کنید (حداقل ۲ حرف)."
        : "Please enter your full name (at least 2 characters).";
    }

    const normalizedPhone = formData.phone
      .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
      .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
      .replace(/\D/g, "");

    if (!normalizedPhone || normalizedPhone.length < 10 || normalizedPhone.length > 15) {
      newErrors.phone = isRtl
        ? "لطفاً یک شماره تماس معتبر (۱۰ تا ۱۱ رقم) وارد کنید."
        : "Please enter a valid phone number (10–15 digits).";
    }

    const trimmedEmail = formData.email.trim();
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = isRtl
        ? "فرمت آدرس ایمیل وارد شده معتبر نیست."
        : "Please enter a valid email address format.";
    }

    const trimmedSubject = formData.subject.trim();
    if (!trimmedSubject || trimmedSubject.length < 2) {
      newErrors.subject = isRtl
        ? "لطفاً موضوع درخواست خود را مشخص کنید."
        : "Please enter the subject of your inquiry.";
    }

    if (!formData.service) {
      newErrors.service = isRtl
        ? "لطفاً نوع خدمت موردنظر را انتخاب کنید."
        : "Please select the desired service.";
    }

    const trimmedMessage = formData.message.trim();
    if (!trimmedMessage || trimmedMessage.length < 10) {
      newErrors.message = isRtl
        ? "لطفاً شرح کوتاهی از درخواست یا پروژه خود بنویسید (حداقل ۱۰ کاراکتر)."
        : "Please provide a brief description of your project (at least 10 characters).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (status === "submitting") return;

    // Anti-spam client cooldown (15 seconds)
    const now = Date.now();
    if (lastSubmitAt > 0 && now - lastSubmitAt < 15_000) {
      setServerError(
        isRtl
          ? "درخواست قبلی شما ثبت شده است. لطفاً چند لحظه صبر کنید."
          : "Your previous request was just sent. Please wait a few seconds."
      );
      return;
    }

    if (!validateForm()) return;

    setStatus("submitting");

    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/contact/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim() || undefined,
          subject: formData.subject.trim(),
          service: formData.service,
          message: formData.message.trim(),
          website_hp: formData.website_hp,
        }),
      });

      if (res.ok) {
        setStatus("success");
        setLastSubmitAt(Date.now());
        setFormData({
          name: "",
          phone: "",
          email: "",
          subject: "",
          service: "web-design",
          message: "",
          website_hp: "",
        });
        setErrors({});
      } else {
        const errData = await res.json().catch(() => null);
        const msg = isRtl
          ? errData?.error || "خطایی در ثبت درخواست رخ داد. لطفاً دوباره تلاش کنید."
          : errData?.errorEn || errData?.error || "Failed to submit your request. Please try again.";
        setServerError(msg);
        setStatus("error");
      }
    } catch {
      setServerError(
        isRtl
          ? "خطا در برقراری ارتباط با سرور. لطفاً اتصال اینترنت خود را بررسی کنید."
          : "Network error while connecting to the server. Please check your connection."
      );
      setStatus("error");
    }
  };

  const clearFieldError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="flex min-h-screen flex-col w-full bg-[#F8F9FA] dark:bg-[#121413] text-[#1F1F1E] dark:text-[#F8F9FA] transition-colors duration-500"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <Header />

        <main className="flex-1 w-full">
          {/* ══════════════════════════════════════════════════════════════════════
              1. HERO SECTION — «با ما در ارتباط باشید»
             ══════════════════════════════════════════════════════════════════════ */}
          <section
            aria-label={isRtl ? "با ما در ارتباط باشید" : "Get in Touch with OnSupp"}
            className="relative w-full pt-28 sm:pt-36 pb-14 sm:pb-20 overflow-hidden border-b border-[#1F1F1E]/[0.07] dark:border-white/[0.08]"
          >
            {/* Subtle Atmospheric Brand Mesh (Official Palette: #38534a & #4f0001) */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none overflow-hidden select-none"
            >
              <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[680px] sm:w-[920px] h-[420px] bg-[#38534A]/[0.07] dark:bg-[#38534A]/[0.18] rounded-full blur-[110px]" />
              <div className="absolute top-1/4 -start-24 w-[380px] h-[380px] bg-[#4F0001]/[0.05] dark:bg-[#4F0001]/[0.14] rounded-full blur-[95px]" />
            </div>

            <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-16">
              {/* Breadcrumb Navigation */}
              <motion.nav
                aria-label={isRtl ? "مسیر دسترسی" : "Breadcrumbs"}
                initial={prefersReducedMotion ? false : { opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: EASE_PREMIUM }}
                className="flex items-center gap-2 text-xs text-[#1F1F1E]/60 dark:text-[#F8F9FA]/60 mb-6 font-medium select-none"
              >
                <Link
                  href="/"
                  className="hover:text-[#38534A] dark:hover:text-[#8AB3A0] transition-colors"
                >
                  {isRtl ? "صفحه اصلی" : "Home"}
                </Link>
                <span className="opacity-35">/</span>
                <span className="text-[#1F1F1E] dark:text-[#F8F9FA] font-semibold">
                  {isRtl ? "تماس با ما" : "Contact Us"}
                </span>
              </motion.nav>

              <div className="max-w-4xl">
                {/* Eyebrow Badge */}
                <motion.div
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, ease: EASE_PREMIUM, delay: 0.08 }}
                  className="inline-flex items-center gap-3 text-xs sm:text-sm font-bold tracking-widest text-[#38534A] dark:text-[#8AB3A0] uppercase mb-4"
                >
                  <span className="h-px w-10 bg-[#38534A]/50 dark:bg-[#8AB3A0]/50" />
                  <span>
                    {isRtl
                      ? "ارتباط مستقیم و مشاوره راهبردی • ONSUPP AGENCY"
                      : "DIRECT COMMUNICATION & STRATEGIC CONSULTATION"}
                  </span>
                </motion.div>

                {/* Main Heading: «با ما در ارتباط باشید» */}
                <motion.h1
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, ease: EASE_PREMIUM, delay: 0.15 }}
                  className={`text-3xl sm:text-5xl lg:text-6xl font-black text-[#1F1F1E] dark:text-[#F8F9FA] tracking-tight leading-[1.22] mb-6 ${
                    isRtl
                      ? "font-[family-name:var(--font-vazirmatn)]"
                      : "font-[family-name:var(--font-gendy)]"
                  }`}
                >
                  {isRtl ? "با ما در ارتباط باشید" : "Get in Touch with Us"}
                </motion.h1>

                {/* Professional Lead Invitation */}
                <motion.p
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, ease: EASE_PREMIUM, delay: 0.22 }}
                  className="text-base sm:text-lg lg:text-xl text-[#1F1F1E]/75 dark:text-[#F8F9FA]/75 leading-[1.85] max-w-3xl mb-8"
                >
                  {isRtl
                    ? "چه در آغاز طراحی یک پلتفرم نرم‌افزاری باشید، چه به دنبال ارتقای جایگاه ارگانیک در گوگل یا خلق هویت بصری و رسانه‌ای متمایز؛ تیم متخصصان آن‌ساپ آماده شنیدن دغدغه‌ها، تحلیل دقیق نیازها و ترسیم نقشه راه اختصاصی برند شماست."
                    : "Whether you are launching a custom web platform, scaling organic search dominance, or crafting a distinctive brand identity, OnSupp’s senior specialists are ready to listen, analyze your goals, and architect your tailored growth roadmap."}
                </motion.p>

                {/* Subtle Status Pills */}
                <motion.div
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, ease: EASE_PREMIUM, delay: 0.3 }}
                  className="flex flex-wrap items-center gap-3 text-xs font-semibold"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-[#1F1F1E]/80 border border-[#1F1F1E]/[0.08] dark:border-white/[0.1] backdrop-blur-md shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-[#38534A] dark:bg-[#8AB3A0]" />
                    <span>{responseTime}</span>
                  </div>

                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-[#1F1F1E]/80 border border-[#1F1F1E]/[0.08] dark:border-white/[0.1] backdrop-blur-md shadow-sm">
                    <span className="text-[#4F0001] dark:text-[#D9757A] font-bold">●</span>
                    <span>{workingHours}</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════════════
              2. CONTACT INFORMATION & 3. CONTACT FORM (ASYMMETRIC EDITORIAL LAYOUT)
             ══════════════════════════════════════════════════════════════════════ */}
          <section
            aria-label={isRtl ? "اطلاعات تماس و فرم درخواست مشاوره" : "Contact Information & Inquiry Form"}
            className="relative w-full py-14 sm:py-20 lg:py-24"
          >
            <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-16">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-start">
                {/* ─── COLUMN A (5 Cols): بخش دوم — اطلاعات تماس شرکت ─── */}
                <div className="lg:col-span-5 space-y-6">
                  <ScrollReveal once animation="slideUp" duration={0.55}>
                    <div className="rounded-[28px] bg-[#38534A] dark:bg-[#17221E] text-[#F8F9FA] p-6 sm:p-8 lg:p-9 border border-white/10 shadow-xl relative overflow-hidden">
                      {/* Subtle Ambient Highlight */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-24 -end-24 w-64 h-64 rounded-full bg-white/[0.05] blur-[70px]"
                      />

                      <div className="relative z-10 space-y-7">
                        <div>
                          <span className="inline-block text-xs font-bold tracking-widest uppercase text-[#F8F9FA]/75 mb-2">
                            {isRtl ? "راه‌های ارتباطی مستقیم" : "DIRECT CHANNELS"}
                          </span>
                          <h2
                            className={`text-xl sm:text-2xl font-bold text-white leading-snug ${
                              isRtl
                                ? "font-[family-name:var(--font-vazirmatn)]"
                                : "font-[family-name:var(--font-gendy)]"
                            }`}
                          >
                            {isRtl ? "اطلاعات تماس آن‌ساپ" : "OnSupp Contact Details"}
                          </h2>
                          <p className="mt-2 text-xs sm:text-sm text-[#F8F9FA]/80 leading-relaxed">
                            {isRtl
                              ? "از طریق شماره‌های مستقیم، ایمیل رسمی یا پیام‌رسان‌های تخصصی دپارتمان‌ها با ما در گفتگو باشید."
                              : "Reach out directly via phone, official email, or our department Telegram and Instagram channels."}
                          </p>
                        </div>

                        <div className="space-y-4 pt-2 border-t border-white/12">
                          {/* ۱. شماره‌های تماس */}
                          <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-sm">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#4F0001] text-[#F8F9FA] shadow-sm">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.9">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0 space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs text-[#F8F9FA]/75 font-medium">
                                  {isRtl ? "شماره تماس مستقیم:" : "Direct Phone:"}
                                </span>
                                <a
                                  href={`tel:${mainPhone}`}
                                  dir="ltr"
                                  className="text-sm font-bold font-mono text-white hover:underline tracking-wide"
                                >
                                  {isRtl ? toFaDigits(mainPhone) : mainPhone}
                                </a>
                              </div>
                              <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-white/10">
                                <span className="text-xs text-[#F8F9FA]/75 font-medium">
                                  {isRtl ? "پشتیبانی اینستاگرام:" : "Instagram Support:"}
                                </span>
                                <a
                                  href={`tel:${instagramSupportPhone}`}
                                  dir="ltr"
                                  className="text-sm font-bold font-mono text-white hover:underline tracking-wide"
                                >
                                  {isRtl ? toFaDigits(instagramSupportPhone) : instagramSupportPhone}
                                </a>
                              </div>
                            </div>
                          </div>

                          {/* ۲. ایمیل رسمی */}
                          <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-sm">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/12 text-[#F8F9FA]">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.9">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="block text-xs text-[#F8F9FA]/75 font-medium mb-0.5">
                                {isRtl ? "پست الکترونیک رسمی" : "Official Email"}
                              </span>
                              <a
                                href={`mailto:${email}`}
                                dir="ltr"
                                className="text-sm font-bold font-mono text-white hover:underline truncate block"
                              >
                                {email}
                              </a>
                            </div>
                          </div>

                          {/* ۳. آدرس دفتر */}
                          <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-sm">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/12 text-[#F8F9FA]">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.9">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="block text-xs text-[#F8F9FA]/75 font-medium mb-0.5">
                                {isRtl ? "آدرس دفتر مرکزی" : "Headquarters Address"}
                              </span>
                              <p className="text-sm font-bold text-white leading-snug">
                                {isRtl ? addressFa : addressEn}
                              </p>
                            </div>
                          </div>

                          {/* ۴. ساعات پاسخگویی */}
                          <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-sm">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/12 text-[#F8F9FA]">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.9">
                                <circle cx="12" cy="12" r="9" />
                                <polyline points="12 7 12 12 15 15" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="block text-xs text-[#F8F9FA]/75 font-medium mb-0.5">
                                {isRtl ? "ساعات کاری و پاسخگویی" : "Working Hours"}
                              </span>
                              <p className="text-sm font-bold text-white">
                                {workingHours}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* ۵. لینک شبکه‌های اجتماعی */}
                        <div className="pt-4 border-t border-white/12 space-y-3">
                          <span className="block text-xs font-bold tracking-wider uppercase text-[#F8F9FA]/80">
                            {isRtl ? "شبکه‌های اجتماعی و کانال‌های ارتباطی" : "OFFICIAL SOCIAL CHANNELS"}
                          </span>

                          <div className="grid grid-cols-1 gap-2.5">
                            {/* تلگرام طراحی وب */}
                            <a
                              href={telegramWebUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 hover:border-white/25 transition-all group"
                            >
                              <div className="flex items-center gap-3">
                                <svg className="w-4 h-4 text-[#F8F9FA]" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                                </svg>
                                <span className="text-xs sm:text-sm font-medium text-white">
                                  {isRtl ? "تلگرام دپارتمان طراحی وب" : "Web Design Telegram"}
                                </span>
                              </div>
                              <span dir="ltr" className="text-xs font-mono font-bold text-[#F8F9FA]/90 group-hover:text-white">
                                @{telegramWebHandle}
                              </span>
                            </a>

                            {/* تلگرام شبکه‌های اجتماعی */}
                            <a
                              href={telegramSocialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 hover:border-white/25 transition-all group"
                            >
                              <div className="flex items-center gap-3">
                                <svg className="w-4 h-4 text-[#F8F9FA]" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                                </svg>
                                <span className="text-xs sm:text-sm font-medium text-white">
                                  {isRtl ? "تلگرام شبکه‌های اجتماعی" : "Social Media Telegram"}
                                </span>
                              </div>
                              <span dir="ltr" className="text-xs font-mono font-bold text-[#F8F9FA]/90 group-hover:text-white">
                                @{telegramSocialHandle}
                              </span>
                            </a>

                            {/* اینستاگرام رسمی */}
                            <a
                              href={instagramUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 hover:border-white/25 transition-all group"
                            >
                              <div className="flex items-center gap-3">
                                <svg className="w-4 h-4 text-[#F8F9FA]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                                </svg>
                                <span className="text-xs sm:text-sm font-medium text-white">
                                  {isRtl ? "صفحه رسمی اینستاگرام" : "Official Instagram"}
                                </span>
                              </div>
                              <span dir="ltr" className="text-xs font-mono font-bold text-[#F8F9FA]/90 group-hover:text-white">
                                @{instagramHandle}
                              </span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                </div>

                {/* ─── COLUMN B (7 Cols): بخش سوم — فرم تماس ─── */}
                <div className="lg:col-span-7">
                  <ScrollReveal once animation="slideUp" delay={0.1} duration={0.6}>
                    <div
                      id="contact-form"
                      className="rounded-[28px] bg-white dark:bg-[#1A1D1C] border border-[#1F1F1E]/[0.08] dark:border-white/10 p-6 sm:p-8 lg:p-10 shadow-[0_16px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
                    >
                      <div className="mb-7 pb-5 border-b border-[#1F1F1E]/[0.07] dark:border-white/[0.08]">
                        <div className="inline-flex items-center gap-2.5 text-xs font-bold tracking-widest text-[#38534A] dark:text-[#8AB3A0] uppercase mb-2">
                          <span className="h-px w-8 bg-[#38534A]/50 dark:bg-[#8AB3A0]/50" />
                          <span>{isRtl ? "فرم ثبت درخواست و مشاوره" : "PROJECT & INQUIRY FORM"}</span>
                        </div>
                        <h2
                          className={`text-2xl sm:text-3xl font-bold text-[#1F1F1E] dark:text-[#F8F9FA] tracking-tight ${
                            isRtl
                              ? "font-[family-name:var(--font-vazirmatn)]"
                              : "font-[family-name:var(--font-gendy)]"
                          }`}
                        >
                          {isRtl ? "ارسال پیام و درخواست مشاوره" : "Send Us a Message"}
                        </h2>
                        <p className="mt-2 text-xs sm:text-sm text-[#1F1F1E]/70 dark:text-[#F8F9FA]/70 leading-relaxed">
                          {isRtl
                            ? "مشخصات و شرح کوتاه نیاز خود را وارد کنید؛ درخواست شما مستقیماً در سامانه ارتباط با مشتریان ثبت و توسط مدیر دپارتمان مربوطه بررسی می‌شود."
                            : "Complete the fields below. Your inquiry is directly logged for review by the relevant department lead."}
                        </p>
                      </div>

                      {status === "success" ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.97 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="py-12 px-6 text-center space-y-5 rounded-2xl bg-[#38534A]/[0.06] dark:bg-[#38534A]/[0.15] border border-[#38534A]/25"
                        >
                          <div className="w-16 h-16 rounded-full bg-[#38534A] text-[#F8F9FA] flex items-center justify-center mx-auto shadow-lg">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div className="space-y-2 max-w-md mx-auto">
                            <h3 className="text-xl sm:text-2xl font-bold text-[#1F1F1E] dark:text-[#F8F9FA]">
                              {isRtl
                                ? "درخواست شما با موفقیت ثبت شد"
                                : "Your Inquiry Has Been Recorded"}
                            </h3>
                            <p className="text-xs sm:text-sm text-[#1F1F1E]/75 dark:text-[#F8F9FA]/75 leading-relaxed">
                              {isRtl
                                ? "اطلاعات شما در سیستم ثبت گردید. کارشناسان آن‌ساپ پس از بررسی اولیه، در سریع‌ترین زمان ممکن با شما تماس خواهند گرفت."
                                : "Your request has been saved in our system. Our specialists will contact you shortly."}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setStatus("idle")}
                            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#4F0001] hover:bg-[#3A0001] text-[#F8F9FA] text-xs sm:text-sm font-bold transition-all shadow-md cursor-pointer active:scale-95"
                          >
                            {isRtl ? "ثبت یک درخواست دیگر" : "Submit Another Inquiry"}
                          </button>
                        </motion.div>
                      ) : (
                        <form onSubmit={handleSubmit} noValidate className="space-y-5">
                          {/* Honeypot field (hidden from real users) */}
                          <div className="hidden" aria-hidden="true">
                            <label htmlFor="website_hp">Website</label>
                            <input
                              id="website_hp"
                              type="text"
                              tabIndex={-1}
                              autoComplete="off"
                              value={formData.website_hp}
                              onChange={(e) =>
                                setFormData({ ...formData, website_hp: e.target.value })
                              }
                            />
                          </div>

                          {/* Server Error Banner */}
                          {serverError && (
                            <div
                              role="alert"
                              className="p-4 rounded-2xl bg-[#4F0001]/10 dark:bg-[#4F0001]/25 border border-[#4F0001]/30 text-[#4F0001] dark:text-[#F8F9FA] text-xs sm:text-sm font-medium flex items-center justify-between gap-3"
                            >
                              <span>{serverError}</span>
                              <button
                                type="button"
                                onClick={() => setServerError(null)}
                                className="text-xs underline opacity-75 hover:opacity-100 shrink-0"
                              >
                                {isRtl ? "بستن" : "Dismiss"}
                              </button>
                            </div>
                          )}

                          {/* Row 1: Full Name & Phone Number */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* ۱. نام و نام خانوادگی */}
                            <div>
                              <label
                                htmlFor="contact-name"
                                className="block text-xs sm:text-sm font-bold text-[#1F1F1E]/90 dark:text-[#F8F9FA]/90 mb-2"
                              >
                                {isRtl ? "نام و نام خانوادگی *" : "Full Name *"}
                              </label>
                              <input
                                id="contact-name"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => {
                                  setFormData({ ...formData, name: e.target.value });
                                  clearFieldError("name");
                                }}
                                placeholder={isRtl ? "مثلاً: علی محمدی" : "e.g. Ali Mohammadi"}
                                className={`w-full h-12 rounded-2xl border px-4 text-sm bg-[#F8F9FA] dark:bg-[#121413] text-[#1F1F1E] dark:text-[#F8F9FA] placeholder-[#1F1F1E]/40 dark:placeholder-[#F8F9FA]/35 focus:outline-none focus:ring-2 transition-all ${
                                  errors.name
                                    ? "border-[#4F0001] focus:ring-[#4F0001]/25"
                                    : "border-[#1F1F1E]/12 dark:border-white/12 focus:border-[#38534A] dark:focus:border-[#8AB3A0] focus:ring-[#38534A]/15"
                                }`}
                              />
                              {errors.name && (
                                <p className="mt-1.5 text-xs text-[#4F0001] dark:text-[#E5858A] font-medium">
                                  {errors.name}
                                </p>
                              )}
                            </div>

                            {/* ۲. شماره تماس */}
                            <div>
                              <label
                                htmlFor="contact-phone"
                                className="block text-xs sm:text-sm font-bold text-[#1F1F1E]/90 dark:text-[#F8F9FA]/90 mb-2"
                              >
                                {isRtl ? "شماره تماس *" : "Phone Number *"}
                              </label>
                              <input
                                id="contact-phone"
                                name="phone"
                                type="tel"
                                dir="ltr"
                                required
                                value={formData.phone}
                                onChange={(e) => {
                                  setFormData({ ...formData, phone: e.target.value });
                                  clearFieldError("phone");
                                }}
                                placeholder={isRtl ? "0912 123 4567" : "+98 912 123 4567"}
                                className={`w-full h-12 rounded-2xl border px-4 text-sm font-mono text-left bg-[#F8F9FA] dark:bg-[#121413] text-[#1F1F1E] dark:text-[#F8F9FA] placeholder-[#1F1F1E]/40 dark:placeholder-[#F8F9FA]/35 focus:outline-none focus:ring-2 transition-all ${
                                  errors.phone
                                    ? "border-[#4F0001] focus:ring-[#4F0001]/25"
                                    : "border-[#1F1F1E]/12 dark:border-white/12 focus:border-[#38534A] dark:focus:border-[#8AB3A0] focus:ring-[#38534A]/15"
                                }`}
                              />
                              {errors.phone && (
                                <p className="mt-1.5 text-xs text-[#4F0001] dark:text-[#E5858A] font-medium">
                                  {errors.phone}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Row 2: Email (Optional) & Subject */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* ۳. ایمیل (اختیاری) */}
                            <div>
                              <label
                                htmlFor="contact-email"
                                className="block text-xs sm:text-sm font-bold text-[#1F1F1E]/90 dark:text-[#F8F9FA]/90 mb-2"
                              >
                                {isRtl ? "ایمیل (اختیاری)" : "Email Address (Optional)"}
                              </label>
                              <input
                                id="contact-email"
                                name="email"
                                type="email"
                                dir="ltr"
                                value={formData.email}
                                onChange={(e) => {
                                  setFormData({ ...formData, email: e.target.value });
                                  clearFieldError("email");
                                }}
                                placeholder="name@company.com"
                                className={`w-full h-12 rounded-2xl border px-4 text-sm font-mono text-left bg-[#F8F9FA] dark:bg-[#121413] text-[#1F1F1E] dark:text-[#F8F9FA] placeholder-[#1F1F1E]/40 dark:placeholder-[#F8F9FA]/35 focus:outline-none focus:ring-2 transition-all ${
                                  errors.email
                                    ? "border-[#4F0001] focus:ring-[#4F0001]/25"
                                    : "border-[#1F1F1E]/12 dark:border-white/12 focus:border-[#38534A] dark:focus:border-[#8AB3A0] focus:ring-[#38534A]/15"
                                }`}
                              />
                              {errors.email && (
                                <p className="mt-1.5 text-xs text-[#4F0001] dark:text-[#E5858A] font-medium">
                                  {errors.email}
                                </p>
                              )}
                            </div>

                            {/* ۴. موضوع درخواست */}
                            <div>
                              <label
                                htmlFor="contact-subject"
                                className="block text-xs sm:text-sm font-bold text-[#1F1F1E]/90 dark:text-[#F8F9FA]/90 mb-2"
                              >
                                {isRtl ? "موضوع درخواست *" : "Subject *"}
                              </label>
                              <input
                                id="contact-subject"
                                name="subject"
                                type="text"
                                required
                                value={formData.subject}
                                onChange={(e) => {
                                  setFormData({ ...formData, subject: e.target.value });
                                  clearFieldError("subject");
                                }}
                                placeholder={
                                  isRtl
                                    ? "مثلاً: طراحی پرتال کلینیک / سئو سایت"
                                    : "e.g. Clinic Web Portal / SEO Audit"
                                }
                                className={`w-full h-12 rounded-2xl border px-4 text-sm bg-[#F8F9FA] dark:bg-[#121413] text-[#1F1F1E] dark:text-[#F8F9FA] placeholder-[#1F1F1E]/40 dark:placeholder-[#F8F9FA]/35 focus:outline-none focus:ring-2 transition-all ${
                                  errors.subject
                                    ? "border-[#4F0001] focus:ring-[#4F0001]/25"
                                    : "border-[#1F1F1E]/12 dark:border-white/12 focus:border-[#38534A] dark:focus:border-[#8AB3A0] focus:ring-[#38534A]/15"
                                }`}
                              />
                              {errors.subject && (
                                <p className="mt-1.5 text-xs text-[#4F0001] dark:text-[#E5858A] font-medium">
                                  {errors.subject}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Row 3: ۵. نوع خدمت موردنظر */}
                          <div>
                            <label
                              htmlFor="contact-service"
                              className="block text-xs sm:text-sm font-bold text-[#1F1F1E]/90 dark:text-[#F8F9FA]/90 mb-2"
                            >
                              {isRtl ? "نوع خدمت موردنظر *" : "Desired Service *"}
                            </label>
                            <div className="relative">
                              <select
                                id="contact-service"
                                name="service"
                                value={formData.service}
                                onChange={(e) => {
                                  setFormData({ ...formData, service: e.target.value });
                                  clearFieldError("service");
                                }}
                                className="w-full h-12 rounded-2xl border border-[#1F1F1E]/12 dark:border-white/12 bg-[#F8F9FA] dark:bg-[#121413] px-4 text-sm text-[#1F1F1E] dark:text-[#F8F9FA] focus:border-[#38534A] dark:focus:border-[#8AB3A0] focus:outline-none focus:ring-2 focus:ring-[#38534A]/15 appearance-none cursor-pointer transition-all"
                              >
                                {SERVICE_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {isRtl ? opt.labelFa : opt.labelEn}
                                  </option>
                                ))}
                              </select>
                              <span
                                className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${
                                  isRtl ? "left-4" : "right-4"
                                } text-[#1F1F1E]/50 dark:text-[#F8F9FA]/50`}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                              </span>
                            </div>
                            {errors.service && (
                              <p className="mt-1.5 text-xs text-[#4F0001] dark:text-[#E5858A] font-medium">
                                {errors.service}
                              </p>
                            )}
                          </div>

                          {/* Row 4: ۶. توضیحات و شرح درخواست */}
                          <div>
                            <label
                              htmlFor="contact-message"
                              className="block text-xs sm:text-sm font-bold text-[#1F1F1E]/90 dark:text-[#F8F9FA]/90 mb-2"
                            >
                              {isRtl ? "توضیحات و شرح درخواست *" : "Project Details & Message *"}
                            </label>
                            <textarea
                              id="contact-message"
                              name="message"
                              rows={4}
                              required
                              value={formData.message}
                              onChange={(e) => {
                                setFormData({ ...formData, message: e.target.value });
                                clearFieldError("message");
                              }}
                              placeholder={
                                isRtl
                                  ? "لطفاً اهداف پروژه، وضعیت فعلی وب‌سایت یا پیج و انتظارات خود را شرح دهید..."
                                  : "Describe your project goals, current website or social status, and timeline expectations..."
                              }
                              className={`w-full rounded-2xl border p-4 text-sm bg-[#F8F9FA] dark:bg-[#121413] text-[#1F1F1E] dark:text-[#F8F9FA] placeholder-[#1F1F1E]/40 dark:placeholder-[#F8F9FA]/35 focus:outline-none focus:ring-2 transition-all leading-relaxed ${
                                errors.message
                                  ? "border-[#4F0001] focus:ring-[#4F0001]/25"
                                  : "border-[#1F1F1E]/12 dark:border-white/12 focus:border-[#38534A] dark:focus:border-[#8AB3A0] focus:ring-[#38534A]/15"
                              }`}
                            />
                            {errors.message && (
                              <p className="mt-1.5 text-xs text-[#4F0001] dark:text-[#E5858A] font-medium">
                                {errors.message}
                              </p>
                            )}
                          </div>

                          {/* Submit Button */}
                          <div className="pt-2">
                            <motion.button
                              type="submit"
                              disabled={status === "submitting"}
                              whileHover={prefersReducedMotion ? undefined : buttonHover}
                              whileTap={prefersReducedMotion ? undefined : tapFeedback}
                              className="w-full h-13 sm:h-14 rounded-full bg-[#38534A] hover:bg-[#2C423B] text-[#F8F9FA] font-bold text-sm sm:text-base shadow-[0_8px_24px_rgba(56,83,74,0.28)] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
                            >
                              {status === "submitting" ? (
                                <span>{isRtl ? "در حال ثبت درخواست..." : "Submitting Inquiry..."}</span>
                              ) : (
                                <>
                                  <span>{isRtl ? "ثبت و ارسال درخواست" : "Submit Inquiry"}</span>
                                  <svg
                                    className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2.2"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                  </svg>
                                </>
                              )}
                            </motion.button>
                          </div>
                        </form>
                      )}
                    </div>
                  </ScrollReveal>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════════════
              4. LOCATION & MAP SECTION — موقعیت مکانی دفتر آن‌ساپ
             ══════════════════════════════════════════════════════════════════════ */}
          <section
            aria-label={isRtl ? "موقعیت مکانی دفتر آن‌ساپ" : "OnSupp Office Location"}
            className="w-full py-12 sm:py-16 lg:py-20 border-t border-[#1F1F1E]/[0.07] dark:border-white/[0.08]"
          >
            <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-16">
              <ScrollReveal once animation="slideUp" duration={0.6}>
                <div className="rounded-[28px] overflow-hidden bg-white dark:bg-[#1A1D1C] border border-[#1F1F1E]/[0.08] dark:border-white/10 shadow-xl grid grid-cols-1 lg:grid-cols-12">
                  {/* Location Details Column */}
                  <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2.5 text-xs font-bold tracking-widest text-[#38534A] dark:text-[#8AB3A0] uppercase">
                        <span className="h-px w-8 bg-[#38534A]/50 dark:bg-[#8AB3A0]/50" />
                        <span>{isRtl ? "موقعیت مکانی" : "OFFICE LOCATION"}</span>
                      </div>

                      <h2
                        className={`text-2xl sm:text-3xl font-bold text-[#1F1F1E] dark:text-[#F8F9FA] leading-snug ${
                          isRtl
                            ? "font-[family-name:var(--font-vazirmatn)]"
                            : "font-[family-name:var(--font-gendy)]"
                        }`}
                      >
                        {isRtl ? "دفتر مرکزی آن‌ساپ" : "OnSupp Headquarters"}
                      </h2>

                      <p className="text-xs sm:text-sm text-[#1F1F1E]/75 dark:text-[#F8F9FA]/75 leading-relaxed">
                        {isRtl
                          ? "جهت برگزاری جلسات حضوری مشاوره و بررسی پروژه‌ها، پس از هماهنگی تلفنی یا ثبت درخواست، مشتاق میزبانی از شما در دفتر عظیمیه هستیم."
                          : "For in-person strategy sessions and project consultations, we welcome you at our Azimiyeh office by prior appointment."}
                      </p>

                      <div className="pt-3 space-y-3 text-xs sm:text-sm">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-[#38534A] dark:text-[#8AB3A0]">
                            {isRtl ? "نشانی:" : "Location:"}
                          </span>
                          <span className="font-semibold text-[#1F1F1E] dark:text-[#F8F9FA]">
                            {isRtl ? addressFa : addressEn}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-[#38534A] dark:text-[#8AB3A0]">
                            {isRtl ? "ساعات مراجعه:" : "Visiting Hours:"}
                          </span>
                          <span className="text-[#1F1F1E]/85 dark:text-[#F8F9FA]/85">
                            {workingHours}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-[#1F1F1E] dark:bg-[#F8F9FA] text-[#F8F9FA] dark:text-[#1F1F1E] hover:bg-[#38534A] dark:hover:bg-[#38534A] dark:hover:text-[#F8F9FA] text-xs sm:text-sm font-bold transition-all shadow-md"
                      >
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{isRtl ? "مسیریابی در گوگل مپ" : "Open in Google Maps"}</span>
                      </a>
                    </div>
                  </div>

                  {/* Interactive Map Embed Column */}
                  <div className="lg:col-span-7 min-h-[320px] sm:min-h-[380px] relative bg-[#1F1F1E]/5 dark:bg-white/5">
                    <iframe
                      title={isRtl ? "نقشه موقعیت دفتر آن‌ساپ — عظیمیه" : "OnSupp Office Location Map — Azimiyeh"}
                      src="https://maps.google.com/maps?q=35.8340,51.0110&hl=fa&z=15&output=embed"
                      className="w-full h-full min-h-[320px] sm:min-h-[380px] border-0 filter contrast-[1.02] dark:invert-[0.88] dark:hue-rotate-180 dark:contrast-[0.95]"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════════════
              5. COLLABORATION CTA SECTION — دعوت به همکاری
             ══════════════════════════════════════════════════════════════════════ */}
          <section
            aria-label={isRtl ? "دعوت به شروع همکاری با آن‌ساپ" : "Start Collaborating with OnSupp"}
            className="w-full py-14 sm:py-20"
          >
            <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-16">
              <ScrollReveal once animation="scaleUp" duration={0.6}>
                <div className="relative rounded-[28px] overflow-hidden bg-[#1F1F1E] text-[#F8F9FA] p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl">
                  {/* Subtle Brand Ambient Accents */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 overflow-hidden"
                  >
                    <div className="absolute -top-24 -end-24 w-96 h-96 rounded-full bg-[#38534A]/35 blur-[110px]" />
                    <div className="absolute -bottom-24 -start-24 w-80 h-80 rounded-full bg-[#4F0001]/35 blur-[100px]" />
                  </div>

                  <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="max-w-2xl space-y-4">
                      <div className="inline-flex items-center gap-3 text-xs font-bold tracking-widest text-[#8AB3A0] uppercase">
                        <span className="h-px w-8 bg-[#8AB3A0]/60" />
                        <span>{isRtl ? "آغاز یک همکاری ماندگار" : "PARTNER WITH ONSUPP"}</span>
                      </div>

                      <h2
                        className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-[1.3] ${
                          isRtl
                            ? "font-[family-name:var(--font-vazirmatn)]"
                            : "font-[family-name:var(--font-gendy)]"
                        }`}
                      >
                        {isRtl
                          ? "آماده‌اید فصل جدیدی از رشد دیجیتال برندتان را رقم بزنید؟"
                          : "Ready to Author the Next Chapter of Your Brand’s Digital Growth?"}
                      </h2>

                      <p className="text-xs sm:text-sm lg:text-base text-[#F8F9FA]/80 leading-relaxed">
                        {isRtl
                          ? "از ایده‌پردازی و مهندسی نرم‌افزار تا تولید محتوای استودیویی و سئو تکنیکال، ما در تمام مراحل کنار شما هستیم. نمونه‌کارها و خدمات تخصصی ما را مرور کنید."
                          : "From software architecture and technical SEO to studio production, we partner with you at every stage. Explore our portfolio and specialized services."}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 shrink-0">
                      <Link
                        href="/portfolio"
                        className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-[#F8F9FA] hover:bg-[#38534A] text-[#1F1F1E] hover:text-[#F8F9FA] text-xs sm:text-sm font-bold transition-all shadow-md"
                      >
                        <span>{isRtl ? "مشاهده نمونه‌کارها" : "Explore Portfolio"}</span>
                      </Link>

                      <Link
                        href="/services"
                        className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-white/[0.08] hover:bg-[#4F0001] text-[#F8F9FA] border border-white/20 hover:border-transparent text-xs sm:text-sm font-bold transition-all"
                      >
                        <span>{isRtl ? "بررسی خدمات تخصصی" : "Our Services"}</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </section>
        </main>

        <Footer initialSettings={initialSettings} />
      </div>
    </MotionConfig>
  );
}
