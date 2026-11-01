"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import ScrollReveal from "@/components/ui/ScrollReveal";

type ContactContent = {
  eyebrowFa: string;
  eyebrowEn: string;
  titleFa: string;
  titleEn: string;
  descriptionFa: string;
  descriptionEn: string;
  phone: string;
  phoneLabelFa: string;
  phoneLabelEn: string;
  email: string;
  emailLabelFa: string;
  emailLabelEn: string;
  responseTimeFa: string;
  responseTimeEn: string;
};

const DEFAULT_CONTENT: ContactContent = {
  eyebrowFa: "شروع همکاری و مشاوره اختصاصی",
  eyebrowEn: "LET'S WORK TOGETHER",
  titleFa: "آماده‌اید مسیر رشد دیجیتال برند خود را آغاز کنید؟",
  titleEn: "Ready to build a sustainable digital growth path?",
  descriptionFa: "فرم زیر را تکمیل کنید تا کارشناسان آن‌ساپ نیاز پروژه شما را بررسی کرده و راهکار و نمونه‌کارهای مرتبط را ارائه دهند.",
  descriptionEn: "Fill out the form so our team can review your project needs and share relevant case studies and tailored solutions.",
  phone: "021 - 9100 0000",
  phoneLabelFa: "تماس مستقیم",
  phoneLabelEn: "Direct Call",
  email: "info@onsupp.ir",
  emailLabelFa: "ایمیل مشاوره",
  emailLabelEn: "Consultation Email",
  responseTimeFa: "پاسخگویی و هماهنگی مشاوره در ساعات کاری",
  responseTimeEn: "Prompt consultation response during business hours",
};

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export default function ContactCTA() {
  const { lang } = useLanguage();
  const isRtl = lang === "fa";
  const prefersReducedMotion = useReducedMotion();
  const [content, setContent] = useState<ContactContent>(DEFAULT_CONTENT);
  const [scheduleDemoCall, setScheduleDemoCall] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    service: "seo",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/v1/contact/content`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setContent((prev) => ({ ...prev, ...data }));
      })
      .catch(() => {
        /* keep defaults */
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    const payload = {
      ...formData,
      message: scheduleDemoCall
        ? `${formData.message ? formData.message + "\n\n" : ""}[درخواست جلسه آنلاین تصویری Google Meet]`.trim()
        : formData.message,
    };

    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/contact/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", phone: "", email: "", service: "seo", message: "" });
        setScheduleDemoCall(false);
      } else {
        setStatus("error");
      }
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <section className="w-full px-2 sm:px-[10px] mt-2 sm:mt-[10px] mb-2 sm:mb-[10px]" id="contact">
      {/* ══════════════════════════════════════════════════════════════════════
          MOBILE FORM VIEW (< 1024px: lg:hidden)
          Combination of Image 1 (Pill input architecture, split phone/code,
          rounded notes, full-width pill button) + Image 2 (Deep dark horizon,
          ambient glow arc, contact badge, elevated card, demo call switch)
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="lg:hidden w-full max-w-md mx-auto px-2 xs:px-3 py-6 relative" dir={isRtl ? "rtl" : "ltr"}>
        {/* Ambient Top Horizon Glow Arc (from Image 2) */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[340px] xs:w-[400px] h-[170px] bg-gradient-to-b from-lime/15 via-mint/10 to-transparent rounded-[100%] blur-[48px] pointer-events-none" />
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-lime/60 to-transparent pointer-events-none" />

        {/* Section Header (Image 2 style) */}
        <div className="text-center relative z-10 mb-5">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-lime/10 border border-lime/30 text-lime font-bold text-xs uppercase tracking-widest shadow-[0_0_12px_rgba(178,248,0,0.2)] mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse shadow-[0_0_6px_#b2f800]" />
            <span>{isRtl ? "ارتباط با ما" : "CONTACT"}</span>
          </span>

          <h2 className="font-display text-2xl xs:text-[27px] font-extrabold text-white tracking-tight leading-[1.3] mb-2">
            {isRtl ? "درخواست مشاوره و استراتژی رایگان" : "Get in Touch with Us"}
          </h2>

          <p className="text-xs xs:text-sm text-foreground/75 leading-relaxed max-w-[320px] xs:max-w-xs mx-auto">
            {isRtl
              ? "فرم زیر را تکمیل کنید تا کارشناسان ما راهکارهای اختصاصی و نمونه‌کارهای مرتبط را برای شما ارسال کنند."
              : "Our team will contact you promptly to review your project needs and share tailored solutions."}
          </p>

          {/* Quick Contact Pills (Direct Phone & Email from Image 1) */}
          <div className="flex items-center justify-center gap-2 mt-3.5 pt-1">
            <a
              href={`tel:${content.phone}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-semibold text-white/85 hover:border-lime/40 hover:text-lime transition-all active:scale-95"
            >
              <svg className="w-3.5 h-3.5 text-lime shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span dir="ltr">
                {isRtl
                  ? content.phone.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d, 10)])
                  : content.phone}
              </span>
            </a>

            <a
              href={`mailto:${content.email}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-semibold text-white/85 hover:border-lime/40 hover:text-lime transition-all active:scale-95"
            >
              <svg className="w-3.5 h-3.5 text-lime shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{content.email}</span>
            </a>
          </div>
        </div>

        {/* Elevated Form Card Container (Image 2 style) */}
        <div className="relative rounded-[26px] xs:rounded-[30px] bg-[#111518]/95 backdrop-blur-2xl border border-white/10 p-4 xs:p-5 sm:p-6 shadow-[0_24px_65px_rgba(0,0,0,0.85)]">
          {/* Subtle Top Card Accent Line */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-lime/50 to-transparent" />

          {status === "success" ? (
            <div className="py-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-lime/15 text-lime flex items-center justify-center mx-auto border border-lime/30 shadow-[0_0_20px_rgba(178,248,0,0.25)]">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-white">
                {isRtl ? "درخواست شما با موفقیت ثبت شد!" : "Request Submitted Successfully!"}
              </h4>
              <p className="text-xs text-foreground/75 leading-relaxed max-w-xs mx-auto">
                {isRtl
                  ? "کارشناسان آن‌ساپ در سریع‌ترین زمان برای هماهنگی جلسه مشاوره با شما تماس خواهند گرفت."
                  : "Our team will reach out promptly to coordinate your consultation."}
              </p>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="mt-4 px-6 py-2.5 rounded-full bg-lime text-ink font-bold text-xs shadow-md active:scale-95 transition-transform"
              >
                {isRtl ? "ارسال درخواست جدید" : "Submit Another Request"}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Field 1: Full Name (Complete Name from Image 1) */}
              <div>
                <label className="block text-xs font-bold text-white/85 mb-1.5 text-start">
                  {isRtl ? "نام و نام خانوادگی *" : "Full Name *"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={isRtl ? "مثلاً: علی محمدی" : "e.g. John Doe"}
                    className="w-full h-12 xs:h-13 rounded-full border border-white/10 bg-[#090c0f] px-4 xs:px-5 text-sm text-white placeholder-white/30 focus:border-lime/60 focus:bg-[#0c0f12] focus:outline-none focus:ring-2 focus:ring-lime/20 transition-all shadow-inner"
                  />
                  {/* Subtle profile icon inside input */}
                  <span className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'left-4' : 'right-4'} text-white/30 pointer-events-none`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Field 2: Phone Number (Prefix Pill + Number Pill from Image 1) */}
              <div>
                <label className="block text-xs font-bold text-white/85 mb-1.5 text-start">
                  {isRtl ? "شماره تماس همراه *" : "Phone Number *"}
                </label>
                <div className="flex items-center gap-2" dir="ltr">
                  {/* Country Prefix Pill (Image 1 style) */}
                  <div className="h-12 xs:h-13 px-3.5 rounded-full border border-white/10 bg-[#090c0f] flex items-center justify-center text-xs font-mono font-bold text-lime/90 shrink-0 shadow-inner select-none">
                    {isRtl ? "+۹۸" : "+98"}
                  </div>

                  {/* Phone Input Pill */}
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder={isRtl ? "۰۹۱۲ ۱۲۳ ۴۵۶۷" : "+98 912 123 4567"}
                    className="flex-1 h-12 xs:h-13 rounded-full border border-white/10 bg-[#090c0f] px-4 text-sm text-white placeholder-white/30 focus:border-lime/60 focus:bg-[#0c0f12] focus:outline-none focus:ring-2 focus:ring-lime/20 transition-all shadow-inner text-left font-mono"
                  />
                </div>
              </div>

              {/* Field 3: Work Email (Contact email from Image 1) */}
              <div>
                <label className="block text-xs font-bold text-white/85 mb-1.5 text-start">
                  {isRtl ? "ایمیل کاری (اختیاری)" : "Work Email (Optional)"}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@company.com"
                    dir="ltr"
                    className="w-full h-12 xs:h-13 rounded-full border border-white/10 bg-[#090c0f] px-4 xs:px-5 text-sm text-white placeholder-white/30 focus:border-lime/60 focus:bg-[#0c0f12] focus:outline-none focus:ring-2 focus:ring-lime/20 transition-all text-left shadow-inner"
                  />
                  <span className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'left-4' : 'right-4'} text-white/30 pointer-events-none`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Field 4: Interested Service (Dropdown with Chevron from Image 2) */}
              <div>
                <label className="block text-xs font-bold text-white/85 mb-1.5 text-start">
                  {isRtl ? "خدمت مورد نظر *" : "Interested Service *"}
                </label>
                <div className="relative">
                  <select
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="w-full h-12 xs:h-13 rounded-full border border-white/10 bg-[#090c0f] px-4 xs:px-5 text-xs xs:text-sm text-white focus:border-lime/60 focus:bg-[#0c0f12] focus:outline-none focus:ring-2 focus:ring-lime/20 transition-all shadow-inner appearance-none cursor-pointer"
                  >
                    <option value="social-identity">{isRtl ? "مدیریت و هویت‌سازی فضای مجازی" : "Social Media & Brand Identity"}</option>
                    <option value="studio-production">{isRtl ? "تصویربرداری و استودیو" : "Studio Production & Videography"}</option>
                    <option value="animation-motion">{isRtl ? "انیمیشن و موشن گرافیک" : "Animation & Motion Graphics"}</option>
                    <option value="web-design">{isRtl ? "طراحی سایت و وب‌اپلیکیشن" : "Custom Web Design & Apps"}</option>
                    <option value="seo">{isRtl ? "سئو تکنیکال و رشد ارگانیک" : "Technical SEO & Organic Growth"}</option>
                    <option value="crm">{isRtl ? "استقرار CRM و اتوماسیون فروش" : "CRM & Sales Automation"}</option>
                    <option value="programming">{isRtl ? "برنامه‌نویسی و سامانه‌های اختصاصی" : "Custom Software Development"}</option>
                    <option value="other">{isRtl ? "مشاوره جامع / سایر خدمات" : "General Consultation / Other"}</option>
                  </select>
                  {/* Chevron Icon (like Image 2 select dropdown) */}
                  <span className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'left-4' : 'right-4'} text-white/50 pointer-events-none`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Field 5: Schedule a Demo Call Toggle (Directly from Image 2) */}
              <div
                onClick={() => setScheduleDemoCall(!scheduleDemoCall)}
                className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-lime/30 transition-all cursor-pointer select-none"
              >
                <div className="flex flex-col text-start pe-1">
                  <span className="text-xs font-bold text-white">
                    {isRtl ? "هماهنگی جلسه آنلاین (Google Meet)" : "Schedule a Video Call"}
                  </span>
                  <span className="text-[10px] text-foreground/60 mt-0.5">
                    {isRtl ? "جلسه تصویری مستقیم با مدیر فنی و استراتژیست" : "Direct video session with senior strategists"}
                  </span>
                </div>

                {/* Switch Toggle (Image 2 style) */}
                <div
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out shrink-0 flex items-center ${
                    scheduleDemoCall ? "bg-lime justify-end" : "bg-white/15 justify-start"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full shadow-md transition-transform duration-200 ${
                      scheduleDemoCall ? "bg-[#111417]" : "bg-white"
                    }`}
                  />
                </div>
              </div>

              {/* Field 6: Project Notes / Message (Notes from Image 1) */}
              <div>
                <label className="block text-xs font-bold text-white/85 mb-1.5 text-start">
                  {isRtl ? "توضیحات یا خلاصه نیاز پروژه" : "Project Details & Message"}
                </label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={
                    isRtl
                      ? "خلاصه‌ای از هدف، بودجه یا سوالات مورد نظر شما..."
                      : "Brief summary of your project, goals or budget..."
                  }
                  className="w-full rounded-2xl border border-white/10 bg-[#090c0f] p-3.5 xs:p-4 text-xs xs:text-sm text-white placeholder-white/30 focus:border-lime/60 focus:bg-[#0c0f12] focus:outline-none focus:ring-2 focus:ring-lime/20 transition-all shadow-inner resize-none"
                />
              </div>

              {status === "error" && (
                <div className="text-xs text-rose-400 font-bold bg-rose-500/10 p-3 rounded-xl border border-rose-500/30 text-center">
                  {isRtl ? "خطا در ثبت درخواست. لطفاً دوباره تلاش کنید." : "Failed to submit. Please try again."}
                </div>
              )}

              {/* Submit Button (Pill shape from Image 1 + High contrast from Image 2) */}
              <motion.button
                type="submit"
                disabled={status === "submitting"}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                className="w-full h-12 xs:h-13 rounded-full bg-lime text-ink font-extrabold text-sm xs:text-base shadow-[0_0_24px_rgba(178,248,0,0.32)] hover:bg-[#a6e600] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>
                  {status === "submitting"
                    ? isRtl ? "در حال ثبت درخواست..." : "Submitting..."
                    : isRtl ? "ثبت درخواست مشاوره رایگان" : "Submit Request Now"}
                </span>
                <svg
                  className={`w-4 h-4 xs:w-5 xs:h-5 ${isRtl ? "rotate-180" : "rotate-0"} transition-transform`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </motion.button>

              {/* Privacy Disclaimer (from Image 2) */}
              <p className="text-[10.5px] text-white/40 text-center leading-relaxed pt-1">
                {isRtl
                  ? "با ثبت درخواست، اطلاعات شما با رعایت اصول کامل محرمانگی بررسی می‌شود."
                  : "By submitting this form, you agree to our Terms and Privacy Policy."}
              </p>
            </form>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          DESKTOP VIEW (>= 1024px: hidden lg:block) - STRICTLY PRESERVED
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:block w-full">
        <div
          dir={isRtl ? "rtl" : "ltr"}
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
            e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
          }}
          className="w-full rounded-lg sm:rounded-xl bg-gradient-to-br from-panel via-panel to-background border border-primary/30 px-4 py-12 sm:px-8 sm:py-20 lg:px-16 lg:py-28 relative overflow-hidden shadow-[0_25px_90px_rgba(30,80,60,0.4)] group"
        >
          {/* Interactive Mouse Tracking Radial Spotlight */}
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(450px circle at var(--mx, -100px) var(--my, -100px), rgba(138, 179, 160, 0.18), transparent 80%)",
            }}
          />

          {/* Ambient High Contrast Glows */}
          <div className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-mint/20 rounded-full blur-[150px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-[500px] h-[500px] bg-primary/25 rounded-full blur-[130px] pointer-events-none" />

          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center relative z-10">
              {/* Left Column: Bold Editorial Awwwards Pitch */}
              <div className="lg:col-span-6 space-y-8 sm:space-y-10">
                <div className="space-y-6">
                  <span className="inline-flex items-center gap-3 text-sm font-semibold tracking-widest text-mint">
                    <span className="h-px w-8 bg-mint" />
                    {isRtl ? content.eyebrowFa : content.eyebrowEn}
                  </span>

                  <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black leading-[1.12] tracking-tight text-white drop-shadow-md">
                    {isRtl ? (
                      <>
                        آماده‌اید مسیر رشد دیجیتال <span className="text-mint block mt-3">برند خود را آغاز کنید؟</span>
                      </>
                    ) : (
                      <>
                        Ready to build a sustainable <span className="text-mint block mt-3">digital growth path?</span>
                      </>
                    )}
                  </h2>

                  <p className="text-base sm:text-lg sm:leading-9 text-mint max-w-xl font-medium">
                    {isRtl ? content.descriptionFa : content.descriptionEn}
                  </p>
                </div>

                {/* Awwwards Style Interactive Contact Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                  <div className="group/card flex items-center gap-4 rounded-xl border border-primary/30 bg-panel p-4 sm:p-5 shadow-md transition-all duration-300 hover:border-mint/60 hover:-translate-y-1 min-w-0">
                    <span className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-leaf to-primary text-ink font-black shadow-lg shadow-leaf/30 group-hover/card:scale-110 transition-transform">
                      <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-semibold text-mint block truncate">
                        {isRtl ? content.phoneLabelFa : content.phoneLabelEn}
                      </span>
                      <a href={`tel:${content.phone}`} className="text-base sm:text-lg font-black text-white hover:text-mint transition-colors dir-ltr block tracking-wide truncate" dir="ltr">
                        {isRtl
                          ? content.phone.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d, 10)])
                          : content.phone}
                      </a>
                    </div>
                  </div>

                  <div className="group/card flex items-center gap-4 rounded-xl border border-primary/30 bg-panel p-4 sm:p-5 shadow-md transition-all duration-300 hover:border-mint/60 hover:-translate-y-1 min-w-0">
                    <span className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-leaf to-primary text-ink font-black shadow-lg shadow-leaf/30 group-hover/card:scale-110 transition-transform">
                      <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-semibold text-mint block truncate">
                        {isRtl ? content.emailLabelFa : content.emailLabelEn}
                      </span>
                      <a href={`mailto:${content.email}`} className="text-sm sm:text-base font-black text-white hover:text-mint transition-colors block tracking-wide truncate" dir="ltr">
                        {content.email}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 pt-2 text-xs sm:text-sm font-bold text-mint">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-leaf"></span>
                  </span>
                  <span>{isRtl ? content.responseTimeFa : content.responseTimeEn}</span>
                </div>
              </div>

              {/* Right Column: Premium High-Contrast Form Box */}
              <div className="lg:col-span-6">
                <div className="rounded-lg sm:rounded-xl border border-primary/40 bg-panel/95 p-5 sm:p-8 lg:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative">
                  <h3 className="text-2xl sm:text-3xl font-black text-white mb-8 tracking-tight">
                    {isRtl ? "درخواست مشاوره و استراتژی رایگان" : "Request Free Audit & Strategy"}
                  </h3>

                  {status === "success" ? (
                    <div className="py-14 text-center space-y-5">
                      <div className="w-20 h-20 rounded-full bg-mint/20 text-mint flex items-center justify-center mx-auto border border-leaf/40 shadow-md shadow-leaf/20">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h4 className="text-2xl font-black text-white">
                        {isRtl ? "درخواست شما با موفقیت ثبت شد!" : "Request Submitted Successfully!"}
                      </h4>
                      <p className="text-base text-mint max-w-md mx-auto leading-7">
                        {isRtl
                          ? "کارشناسان ارشد ما در سریع‌ترین زمان جهت تنظیم جلسه مشاوره با شما تماس خواهند گرفت."
                          : "Our senior strategy team will reach out to schedule your consultation."}
                      </p>
                      <button
                        onClick={() => setStatus("idle")}
                        className="mt-6 px-8 py-3.5 rounded-lg bg-lime text-ink shadow-[0_0_20px_rgba(183,255,0,0.3)] hover:scale-105"
                      >
                        {isRtl ? "ارسال درخواست جدید" : "Submit Another Request"}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-mint mb-2.5">
                            {isRtl ? "نام و نام خانوادگی *" : "Full Name *"}
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder={isRtl ? "مثلا: علی محمدی" : "e.g. John Doe"}
                            className="w-full rounded-lg border border-primary/20 bg-background px-4 py-4 text-sm text-white placeholder-mint/50 focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/30 transition-all shadow-inner"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-mint mb-2.5">
                            {isRtl ? "شماره تماس *" : "Phone Number *"}
                          </label>
                          <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder={isRtl ? "۰۹۱۲ ۱۲۳ ۴۵۶۷" : "+98 912 123 4567"}
                            dir="ltr"
                            className="w-full rounded-lg border border-primary/20 bg-background px-4 py-4 text-sm text-white placeholder-mint/50 focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/30 transition-all text-left shadow-inner font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-mint mb-2.5">
                            {isRtl ? "ایمیل کاری (اختیاری)" : "Work Email (Optional)"}
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="name@company.com"
                            dir="ltr"
                            className="w-full rounded-lg border border-primary/20 bg-background px-4 py-4 text-sm text-white placeholder-mint/50 focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/30 transition-all text-left shadow-inner"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-mint mb-2.5">
                            {isRtl ? "خدمت مورد نظر" : "Interested Service"}
                          </label>
                          <select
                            value={formData.service}
                            onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                            className="w-full rounded-lg border border-primary/20 bg-background px-4 py-4 text-sm text-white focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/30 transition-all shadow-inner"
                          >
                            <option value="social-identity">{isRtl ? "مدیریت و هویت‌سازی فضای مجازی" : "Social Media & Brand Identity"}</option>
                            <option value="studio-production">{isRtl ? "تصویربرداری و استودیو" : "Studio Production & Videography"}</option>
                            <option value="animation-motion">{isRtl ? "انیمیشن و موشن گرافیک" : "Animation & Motion Graphics"}</option>
                            <option value="web-design">{isRtl ? "طراحی سایت و وب‌اپلیکیشن" : "Custom Web Design & Apps"}</option>
                            <option value="seo">{isRtl ? "سئو تکنیکال و رشد ارگانیک" : "Technical SEO & Organic Growth"}</option>
                            <option value="crm">{isRtl ? "استقرار CRM و اتوماسیون فروش" : "CRM & Sales Automation"}</option>
                            <option value="programming">{isRtl ? "برنامه‌نویسی و سامانه‌های اختصاصی" : "Custom Software Development"}</option>
                            <option value="other">{isRtl ? "مشاوره جامع / سایر خدمات" : "General Consultation / Other"}</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-mint mb-2.5">
                          {isRtl ? "توضیحات یا نیاز پروژه" : "Project Details & Message"}
                        </label>
                        <textarea
                          rows={4}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder={
                            isRtl
                              ? "خلاصه‌ای از هدف کسب‌وکار، بودجه مد نظر یا حوزه کاری شما..."
                              : "Brief summary of your business goals, target budget..."
                          }
                          className="w-full rounded-lg border border-primary/20 bg-background px-4 py-4 text-sm text-white placeholder-mint/50 focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/30 transition-all shadow-inner"
                        />
                      </div>

                      {status === "error" && (
                        <div className="text-xs text-rose-400 font-bold bg-rose-500/10 p-3.5 rounded-lg border border-rose-500/30">
                          {isRtl ? "خطا در ثبت درخواست. لطفاً دوباره تلاش کنید." : "Failed to submit. Please try again."}
                        </div>
                      )}

                      <motion.button
                        type="submit"
                        disabled={status === "submitting"}
                        whileHover={prefersReducedMotion ? undefined : { scale: 1.015 }}
                        whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                        className="w-full rounded-lg bg-lime text-ink shadow-[0_0_20px_rgba(183,255,0,0.3)] transition-all duration-200 hover:brightness-110 shadow-[0_12px_40px_rgba(63,107,89,0.35)] flex items-center justify-center gap-2 group cursor-pointer py-4 font-bold text-sm"
                      >
                        <span>
                          {status === "submitting"
                            ? isRtl ? "در حال ثبت درخواست..." : "Submitting..."
                            : isRtl ? "ثبت درخواست مشاوره رایگان" : "Submit Request Now"}
                        </span>
                        <svg
                          className={`h-4 w-4 transform ${
                            isRtl
                              ? "group-hover:-translate-x-1.5"
                              : "rotate-180 group-hover:translate-x-1.5"
                          } transition-transform duration-300`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                        </svg>
                      </motion.button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
