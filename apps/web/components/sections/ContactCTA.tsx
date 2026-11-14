"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { BACKEND_URL } from "@/config/api";

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
  phone: "", // Keep empty until official phone number is verified
  phoneLabelFa: "تماس مستقیم",
  phoneLabelEn: "Direct Call",
  email: "info@onsupp.ir",
  emailLabelFa: "ایمیل مشاوره",
  emailLabelEn: "Consultation Email",
  responseTimeFa: "پاسخگویی و هماهنگی مشاوره در ساعات کاری",
  responseTimeEn: "Prompt consultation response during business hours",
};

export function isVerifiedPhone(p?: string): boolean {
  if (!p) return false;
  const clean = p.replace(/\D/g, "");
  if (clean.length < 8) return false;
  if (/^0*$/.test(clean)) return false;
  if (clean.includes("91000000") || clean.includes("0000000") || clean.includes("1234567")) return false;
  return true;
}



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
    <section
      className="section-viewport w-full bg-[#fbfbfa] dark:bg-[#151716] border-y border-black/[0.06] dark:border-white/10 relative overflow-hidden transition-colors"
      id="contact"
    >
      {/* ══════════════════════════════════════════════════════════════════════
          MOBILE FORM VIEW (< 1024px: lg:hidden)
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="lg:hidden w-full max-w-md mx-auto px-4 xs:px-5 py-10 relative" dir={isRtl ? "rtl" : "ltr"}>
        {/* Soft Ambient Glow */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[320px] h-[140px] bg-[#38534A]/8 dark:bg-[#38534A]/15 rounded-[100%] blur-[48px] pointer-events-none" />

        {/* Section Header */}
        <ScrollReveal animation="slideUp" duration={0.5}>
          <div className="text-center relative z-10 mb-6">
            <div className="inline-flex items-center gap-3 text-xs sm:text-sm font-bold tracking-widest text-[#38534A] dark:text-[#8AB3A0] uppercase mb-3">
              <span className="h-px w-10 bg-[#38534A]/50 dark:bg-[#8AB3A0]/50 shrink-0" />
              <span>{isRtl ? "ارتباط با ما" : "CONTACT"}</span>
            </div>

            <h2 className="font-display text-2xl xs:text-[27px] font-extrabold text-foreground tracking-tight leading-[1.3] mb-2.5">
              {isRtl ? "درخواست مشاوره و استراتژی رایگان" : "Get in Touch with Us"}
            </h2>

            <p className="text-xs xs:text-sm text-foreground/75 leading-relaxed max-w-[320px] xs:max-w-xs mx-auto">
              {isRtl
                ? "فرم زیر را تکمیل کنید تا کارشناسان ما راهکارهای اختصاصی و نمونه‌کارهای مرتبط را برای شما ارسال کنند."
                : "Our team will contact you promptly to review your project needs and share tailored solutions."}
            </p>

            {/* Quick Contact Pills */}
            <div className="flex items-center justify-center gap-2.5 mt-4 pt-1">
              {isVerifiedPhone(content.phone) ? (
                <a
                  href={`tel:${content.phone}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#1a1c1b] border border-black/[0.08] dark:border-white/10 text-[11px] font-semibold text-foreground/85 hover:border-[#38534A]/40 hover:text-[#38534A] dark:hover:text-[#8AB3A0] transition-all shadow-sm active:scale-95"
                >
                  <svg className="w-3.5 h-3.5 text-[#38534A] dark:text-[#8AB3A0] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span dir="ltr">
                    {isRtl
                      ? content.phone.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d, 10)])
                      : content.phone}
                  </span>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => setScheduleDemoCall(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#1a1c1b] border border-black/[0.08] dark:border-white/10 text-[11px] font-semibold text-foreground/85 hover:border-[#38534A]/40 hover:text-[#38534A] dark:hover:text-[#8AB3A0] transition-all shadow-sm active:scale-95"
                >
                  <svg className="w-3.5 h-3.5 text-[#38534A] dark:text-[#8AB3A0] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>{isRtl ? "جلسه آنلاین (Google Meet)" : "Video Call Meeting"}</span>
                </button>
              )}

              <a
                href={`mailto:${content.email}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#1a1c1b] border border-black/[0.08] dark:border-white/10 text-[11px] font-semibold text-foreground/85 hover:border-[#38534A]/40 hover:text-[#38534A] dark:hover:text-[#8AB3A0] transition-all shadow-sm active:scale-95"
              >
                <svg className="w-3.5 h-3.5 text-[#38534A] dark:text-[#8AB3A0] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>{content.email}</span>
              </a>
            </div>
          </div>
        </ScrollReveal>

        {/* Elevated Compact Form Card */}
        <ScrollReveal animation="scaleUp" delay={0.1} duration={0.6}>
          <div className="relative rounded-[24px] bg-white dark:bg-[#1a1c1b] border border-black/[0.08] dark:border-white/10 p-5 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            {status === "success" ? (
              <div className="py-10 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#38534A]/10 dark:bg-[#38534A]/25 text-[#38534A] dark:text-[#8AB3A0] flex items-center justify-center mx-auto border border-[#38534A]/30 shadow-md">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  {isRtl ? "درخواست شما با موفقیت ثبت شد!" : "Request Submitted Successfully!"}
                </h3>
                <p className="text-xs text-foreground/75 leading-relaxed max-w-xs mx-auto">
                  {isRtl
                    ? "کارشناسان آن‌ساپ در سریع‌ترین زمان برای هماهنگی جلسه مشاوره با شما تماس خواهند گرفت."
                    : "Our team will reach out promptly to coordinate your consultation."}
                </p>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="mt-4 px-6 py-2.5 rounded-full bg-[#4F0001] hover:bg-[#3D0001] text-white font-bold text-xs shadow-md active:scale-95 transition-transform"
                >
                  {isRtl ? "ارسال درخواست جدید" : "Submit Another Request"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Field 1: Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-foreground/85 mb-1.5 text-start">
                    {isRtl ? "نام و نام خانوادگی *" : "Full Name *"}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={isRtl ? "مثلاً: علی محمدی" : "e.g. John Doe"}
                      className="w-full h-11 xs:h-12 rounded-xl border border-black/[0.08] dark:border-white/10 bg-[#fbfbfa] dark:bg-background px-4 text-xs xs:text-sm text-foreground placeholder-foreground/40 focus:border-[#38534A] dark:focus:border-[#8AB3A0] focus:bg-white dark:focus:bg-background focus:outline-none focus:ring-2 focus:ring-[#38534A]/15 transition-all shadow-inner"
                    />
                    <span className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'left-4' : 'right-4'} text-foreground/40 pointer-events-none`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </span>
                  </div>
                </div>

                {/* Field 2: Phone Number */}
                <div>
                  <label className="block text-xs font-semibold text-foreground/85 mb-1.5 text-start">
                    {isRtl ? "شماره تماس همراه *" : "Phone Number *"}
                  </label>
                  <div className="flex items-center gap-2" dir="ltr">
                    <div className="h-11 xs:h-12 px-3 rounded-xl border border-black/[0.08] dark:border-white/10 bg-[#fbfbfa] dark:bg-background flex items-center justify-center text-xs font-mono font-bold text-[#38534A] dark:text-[#8AB3A0] shrink-0 shadow-inner select-none">
                      {isRtl ? "+۹۸" : "+98"}
                    </div>

                    <input
                      type="tel"
                      required
                      dir="ltr"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder={isRtl ? "۰۹۱۲ ۱۲۳ ۴۵۶۷" : "+98 912 123 4567"}
                      className="flex-1 h-11 xs:h-12 rounded-xl border border-black/[0.08] dark:border-white/10 bg-[#fbfbfa] dark:bg-background px-3.5 text-xs xs:text-sm text-foreground placeholder-foreground/40 focus:border-[#38534A] dark:focus:border-[#8AB3A0] focus:bg-white dark:focus:bg-background focus:outline-none focus:ring-2 focus:ring-[#38534A]/15 transition-all shadow-inner text-left font-mono"
                    />
                  </div>
                </div>

                {/* Field 3: Work Email */}
                <div>
                  <label className="block text-xs font-semibold text-foreground/85 mb-1.5 text-start">
                    {isRtl ? "ایمیل کاری (اختیاری)" : "Work Email (Optional)"}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@company.com"
                      dir="ltr"
                      className="w-full h-11 xs:h-12 rounded-xl border border-black/[0.08] dark:border-white/10 bg-[#fbfbfa] dark:bg-background px-4 text-xs xs:text-sm text-foreground placeholder-foreground/40 focus:border-[#38534A] dark:focus:border-[#8AB3A0] focus:bg-white dark:focus:bg-background focus:outline-none focus:ring-2 focus:ring-[#38534A]/15 transition-all text-left shadow-inner"
                    />
                    <span className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'left-4' : 'right-4'} text-foreground/40 pointer-events-none`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </span>
                  </div>
                </div>

                {/* Field 4: Interested Service */}
                <div>
                  <label className="block text-xs font-semibold text-foreground/85 mb-1.5 text-start">
                    {isRtl ? "خدمت مورد نظر *" : "Interested Service *"}
                  </label>
                  <div className="relative">
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full h-11 xs:h-12 rounded-xl border border-black/[0.08] dark:border-white/10 bg-[#fbfbfa] dark:bg-background px-4 text-xs xs:text-sm text-foreground focus:border-[#38534A] dark:focus:border-[#8AB3A0] focus:bg-white dark:focus:bg-background focus:outline-none focus:ring-2 focus:ring-[#38534A]/15 transition-all shadow-inner appearance-none cursor-pointer"
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
                    <span className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'left-4' : 'right-4'} text-foreground/50 pointer-events-none`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </div>
                </div>

                {/* Field 5: Schedule a Demo Call Toggle */}
                <div
                  onClick={() => setScheduleDemoCall(!scheduleDemoCall)}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#fbfbfa] dark:bg-background border border-black/[0.08] dark:border-white/10 hover:border-[#38534A]/30 transition-all cursor-pointer select-none"
                >
                  <div className="flex flex-col text-start pe-1">
                    <span className="text-xs font-semibold text-foreground">
                      {isRtl ? "هماهنگی جلسه آنلاین (Google Meet)" : "Schedule a Video Call"}
                    </span>
                    <span className="text-[10px] text-foreground/60 mt-0.5">
                      {isRtl ? "جلسه تصویری مستقیم با مدیر فنی و استراتژیست" : "Direct video session with senior strategists"}
                    </span>
                  </div>

                  <div
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out shrink-0 flex items-center ${
                      scheduleDemoCall ? "bg-[#38534A] justify-end" : "bg-foreground/15 justify-start"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200" />
                  </div>
                </div>

                {/* Field 6: Project Notes */}
                <div>
                  <label className="block text-xs font-semibold text-foreground/85 mb-1.5 text-start">
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
                    className="w-full rounded-xl border border-black/[0.08] dark:border-white/10 bg-[#fbfbfa] dark:bg-background p-3 text-xs xs:text-sm text-foreground placeholder-foreground/40 focus:border-[#38534A] dark:focus:border-[#8AB3A0] focus:bg-white dark:focus:bg-background focus:outline-none focus:ring-2 focus:ring-[#38534A]/15 transition-all shadow-inner resize-none"
                  />
                </div>

                {status === "error" && (
                  <div className="text-xs text-rose-500 font-bold bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 text-center">
                    {isRtl ? "خطا در ثبت درخواست. لطفاً دوباره تلاش کنید." : "Failed to submit. Please try again."}
                  </div>
                )}

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={status === "submitting"}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                  className="w-full h-12 rounded-full bg-[#4F0001] hover:bg-[#3D0001] active:bg-[#2F0001] text-white border border-white/15 font-bold text-xs xs:text-sm shadow-[0_4px_16px_rgba(79,0,1,0.22)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <span>
                    {status === "submitting"
                      ? isRtl ? "در حال ثبت درخواست..." : "Submitting..."
                      : isRtl ? "ثبت درخواست مشاوره رایگان" : "Submit Request Now"}
                  </span>
                  <svg
                    className={`w-4 h-4 ${isRtl ? "rotate-180" : "rotate-0"} transition-transform`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </motion.button>

                <p className="text-[10px] text-foreground/50 text-center leading-relaxed pt-1">
                  {isRtl
                    ? "اطلاعات شما با رعایت اصول کامل محرمانگی بررسی می‌شود."
                    : "By submitting this form, you agree to our Terms and Privacy Policy."}
                </p>
              </form>
            )}
          </div>
        </ScrollReveal>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          DESKTOP VIEW (>= 1024px: hidden lg:block)
          Balanced & luxury editorial layout with compact, tailored form
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:block w-full">
        <div
          dir={isRtl ? "rtl" : "ltr"}
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
            e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
          }}
          className="w-full max-w-[1280px] mx-auto px-6 sm:px-10 lg:px-12 py-16 lg:py-20 relative group"
        >
          {/* Interactive Mouse Tracking Radial Spotlight */}
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(480px circle at var(--mx, -100px) var(--my, -100px), rgba(56, 83, 74, 0.05), transparent 75%)",
            }}
          />

          {/* Soft ambient background glows */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#38534A]/5 dark:bg-[#38534A]/15 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#4F0001]/5 dark:bg-[#4F0001]/12 rounded-full blur-[100px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch relative z-10">
            {/* Editorial Pitch Column (Right in RTL, Left in LTR) */}
            <div className="lg:col-span-7 flex flex-col justify-between py-2">
              <ScrollReveal animation="slideUp" duration={0.65} className="h-full flex flex-col justify-between">
                {/* Top Editorial Group */}
                <div className="space-y-5 sm:space-y-6">
                  {/* Eyebrow */}
                  <div className="inline-flex items-center gap-3 text-xs sm:text-sm font-bold tracking-widest text-[#38534A] dark:text-[#8AB3A0] uppercase">
                    <span className="h-px w-8 bg-[#38534A]/50 dark:bg-[#8AB3A0]/50" />
                    <span>{isRtl ? content.eyebrowFa : content.eyebrowEn}</span>
                  </div>

                  {/* Headline */}
                  <h2 className="text-2xl sm:text-3xl lg:text-[26px] xl:text-[29px] lg:whitespace-nowrap font-black leading-[1.3] tracking-tight text-foreground">
                    {isRtl ? (
                      <>
                        آماده‌اید مسیر رشد دیجیتال{" "}
                        <span className="text-[#38534A] dark:text-[#8AB3A0]">
                          برند خود را آغاز کنید؟
                        </span>
                      </>
                    ) : (
                      <>
                        Ready to build a sustainable{" "}
                        <span className="text-[#38534A] dark:text-[#8AB3A0]">
                          digital growth path?
                        </span>
                      </>
                    )}
                  </h2>

                  {/* Description */}
                  <p className="text-sm sm:text-base leading-relaxed text-foreground/75 font-normal max-w-xl">
                    {isRtl ? content.descriptionFa : content.descriptionEn}
                  </p>
                </div>

                {/* Bottom Badges & Response Time Group */}
                <div className="space-y-4 pt-8">
                  {/* Refined Luxury Contact Badges */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                    {isVerifiedPhone(content.phone) ? (
                      <div className="group/card flex items-center gap-4 rounded-2xl border border-black/[0.07] dark:border-white/10 bg-white dark:bg-[#1a1c1b] p-4 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none hover:border-[#38534A]/40 dark:hover:border-[#8AB3A0]/40 hover:-translate-y-0.5 transition-all duration-300 min-w-0">
                        <span className="flex h-12 w-12 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-xl bg-[#38534A]/10 dark:bg-[#38534A]/25 text-[#38534A] dark:text-[#8AB3A0] group-hover/card:scale-105 transition-transform duration-300 shadow-sm">
                          <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className="text-[11px] sm:text-xs font-semibold text-foreground/60 block truncate mb-0.5">
                            {isRtl ? content.phoneLabelFa : content.phoneLabelEn}
                          </span>
                          <a
                            href={`tel:${content.phone}`}
                            className="text-sm sm:text-base font-bold text-foreground hover:text-[#38534A] dark:hover:text-[#8AB3A0] transition-colors block tracking-wide truncate"
                            dir="ltr"
                          >
                            {isRtl
                              ? content.phone.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d, 10)])
                              : content.phone}
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => setScheduleDemoCall(true)}
                        className="group/card flex items-center gap-4 rounded-2xl border border-black/[0.07] dark:border-white/10 bg-white dark:bg-[#1a1c1b] p-4 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none hover:border-[#38534A]/40 dark:hover:border-[#8AB3A0]/40 hover:-translate-y-0.5 transition-all duration-300 min-w-0 cursor-pointer"
                      >
                        <span className="flex h-12 w-12 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-xl bg-[#38534A]/10 dark:bg-[#38534A]/25 text-[#38534A] dark:text-[#8AB3A0] group-hover/card:scale-105 transition-transform duration-300 shadow-sm">
                          <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className="text-[11px] sm:text-xs font-semibold text-foreground/60 block truncate mb-0.5">
                            {isRtl ? "جلسه استراتژی آنلاین" : "Online Strategy Session"}
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-foreground hover:text-[#38534A] dark:hover:text-[#8AB3A0] transition-colors block tracking-wide truncate">
                            {isRtl ? "هماهنگی جلسه Google Meet" : "Schedule Google Meet"}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="group/card flex items-center gap-4 rounded-2xl border border-black/[0.07] dark:border-white/10 bg-white dark:bg-[#1a1c1b] p-4 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none hover:border-[#38534A]/40 dark:hover:border-[#8AB3A0]/40 hover:-translate-y-0.5 transition-all duration-300 min-w-0">
                      <span className="flex h-12 w-12 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-xl bg-[#38534A]/10 dark:bg-[#38534A]/25 text-[#38534A] dark:text-[#8AB3A0] group-hover/card:scale-105 transition-transform duration-300 shadow-sm">
                        <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="text-[11px] sm:text-xs font-semibold text-foreground/60 block truncate mb-0.5">
                          {isRtl ? content.emailLabelFa : content.emailLabelEn}
                        </span>
                        <a
                          href={`mailto:${content.email}`}
                          className="text-xs sm:text-sm font-bold text-foreground hover:text-[#38534A] dark:hover:text-[#8AB3A0] transition-colors block tracking-wide truncate"
                          dir="ltr"
                        >
                          {content.email}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Response Time Indicator */}
                  <div className="flex items-center gap-2.5 pt-1 text-xs sm:text-sm font-medium text-foreground/75">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38534A] dark:bg-[#8AB3A0] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#38534A] dark:bg-[#8AB3A0]"></span>
                    </span>
                    <span>{isRtl ? content.responseTimeFa : content.responseTimeEn}</span>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Compact, Tailored Luxury Form Box (Left in RTL, Right in LTR) */}
            <div className="lg:col-span-5 flex justify-center rtl:lg:justify-start ltr:lg:justify-end">
              <ScrollReveal animation="scaleUp" delay={0.15} duration={0.65} className="w-full max-w-[460px]">
                <div className="w-full rounded-2xl border border-black/[0.08] dark:border-white/10 bg-white dark:bg-[#1a1c1b] p-6 sm:p-7 shadow-[0_12px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative">
                  <h3 className="text-xl sm:text-2xl font-black text-foreground mb-4 tracking-tight">
                    {isRtl ? "درخواست مشاوره و استراتژی رایگان" : "Request Free Audit & Strategy"}
                  </h3>

                  {status === "success" ? (
                    <div className="py-10 text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-[#38534A]/10 dark:bg-[#38534A]/25 text-[#38534A] dark:text-[#8AB3A0] flex items-center justify-center mx-auto border border-[#38534A]/30 shadow-md">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h4 className="text-xl font-bold text-foreground">
                        {isRtl ? "درخواست شما با موفقیت ثبت شد!" : "Request Submitted Successfully!"}
                      </h4>
                      <p className="text-xs sm:text-sm text-foreground/75 max-w-sm mx-auto leading-relaxed">
                        {isRtl
                          ? "کارشناسان ارشد ما در سریع‌ترین زمان جهت تنظیم جلسه مشاوره با شما تماس خواهند گرفت."
                          : "Our senior strategy team will reach out to schedule your consultation."}
                      </p>
                      <button
                        type="button"
                        onClick={() => setStatus("idle")}
                        className="mt-4 px-6 py-2.5 rounded-full bg-[#4F0001] hover:bg-[#3D0001] text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                      >
                        {isRtl ? "ارسال درخواست جدید" : "Submit Another Request"}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-3.5">
                      {/* Row 1: Name & Phone */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-foreground/85 mb-1.5">
                            {isRtl ? "نام و نام خانوادگی *" : "Full Name *"}
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder={isRtl ? "مثلاً: علی محمدی" : "e.g. John Doe"}
                            className="w-full rounded-xl border border-black/[0.08] dark:border-white/10 bg-[#fbfbfa] dark:bg-background px-3 py-2.5 text-xs sm:text-sm text-foreground placeholder-foreground/40 focus:border-[#38534A] dark:focus:border-[#8AB3A0] focus:bg-white dark:focus:bg-background focus:outline-none focus:ring-2 focus:ring-[#38534A]/15 transition-all shadow-inner"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-foreground/85 mb-1.5">
                            {isRtl ? "شماره تماس *" : "Phone Number *"}
                          </label>
                          <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder={isRtl ? "۰۹۱۲ ۱۲۳ ۴۵۶۷" : "+98 912 123 4567"}
                            dir="ltr"
                            className="w-full rounded-xl border border-black/[0.08] dark:border-white/10 bg-[#fbfbfa] dark:bg-background px-3 py-2.5 text-xs sm:text-sm text-foreground placeholder-foreground/40 focus:border-[#38534A] dark:focus:border-[#8AB3A0] focus:bg-white dark:focus:bg-background focus:outline-none focus:ring-2 focus:ring-[#38534A]/15 transition-all text-left shadow-inner font-mono"
                          />
                        </div>
                      </div>

                      {/* Row 2: Email & Service */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-foreground/85 mb-1.5">
                            {isRtl ? "ایمیل کاری (اختیاری)" : "Work Email (Optional)"}
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="name@company.com"
                            dir="ltr"
                            className="w-full rounded-xl border border-black/[0.08] dark:border-white/10 bg-[#fbfbfa] dark:bg-background px-3 py-2.5 text-xs sm:text-sm text-foreground placeholder-foreground/40 focus:border-[#38534A] dark:focus:border-[#8AB3A0] focus:bg-white dark:focus:bg-background focus:outline-none focus:ring-2 focus:ring-[#38534A]/15 transition-all text-left shadow-inner"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-foreground/85 mb-1.5">
                            {isRtl ? "خدمت مورد نظر *" : "Interested Service *"}
                          </label>
                          <select
                            value={formData.service}
                            onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                            className="w-full rounded-xl border border-black/[0.08] dark:border-white/10 bg-[#fbfbfa] dark:bg-background px-3 py-2.5 text-xs sm:text-sm text-foreground focus:border-[#38534A] dark:focus:border-[#8AB3A0] focus:bg-white dark:focus:bg-background focus:outline-none focus:ring-2 focus:ring-[#38534A]/15 transition-all shadow-inner cursor-pointer"
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

                      {/* Row 3: Google Meet Demo Call Toggle */}
                      <div
                        onClick={() => setScheduleDemoCall(!scheduleDemoCall)}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#fbfbfa] dark:bg-background border border-black/[0.08] dark:border-white/10 hover:border-[#38534A]/30 transition-all cursor-pointer select-none"
                      >
                        <div className="flex flex-col text-start pe-1">
                          <span className="text-xs font-semibold text-foreground">
                            {isRtl ? "هماهنگی جلسه آنلاین (Google Meet)" : "Schedule a Video Call"}
                          </span>
                          <span className="text-[10px] text-foreground/60 mt-0.5">
                            {isRtl ? "جلسه تصویری مستقیم با مدیر فنی و استراتژیست" : "Direct video session with senior strategists"}
                          </span>
                        </div>

                        <div
                          className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out shrink-0 flex items-center ${
                            scheduleDemoCall ? "bg-[#38534A] justify-end" : "bg-foreground/15 justify-start"
                          }`}
                        >
                          <div className="w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200" />
                        </div>
                      </div>

                      {/* Row 4: Message */}
                      <div>
                        <label className="block text-xs font-semibold text-foreground/85 mb-1.5">
                          {isRtl ? "توضیحات یا نیاز پروژه" : "Project Details & Message"}
                        </label>
                        <textarea
                          rows={3}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder={
                            isRtl
                              ? "خلاصه‌ای از هدف کسب‌وکار، بودجه مد نظر یا حوزه کاری شما..."
                              : "Brief summary of your business goals, target budget..."
                          }
                          className="w-full rounded-xl border border-black/[0.08] dark:border-white/10 bg-[#fbfbfa] dark:bg-background p-3 text-xs sm:text-sm text-foreground placeholder-foreground/40 focus:border-[#38534A] dark:focus:border-[#8AB3A0] focus:bg-white dark:focus:bg-background focus:outline-none focus:ring-2 focus:ring-[#38534A]/15 transition-all shadow-inner resize-none"
                        />
                      </div>

                      {status === "error" && (
                        <div className="text-xs text-rose-500 font-bold bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 text-center">
                          {isRtl ? "خطا در ثبت درخواست. لطفاً دوباره تلاش کنید." : "Failed to submit. Please try again."}
                        </div>
                      )}

                      {/* Submit Button */}
                      <motion.button
                        type="submit"
                        disabled={status === "submitting"}
                        whileHover={prefersReducedMotion ? undefined : { scale: 1.01 }}
                        whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                        className="w-full rounded-full bg-[#4F0001] hover:bg-[#3D0001] active:bg-[#2F0001] text-white border border-white/15 shadow-[0_4px_16px_rgba(79,0,1,0.22)] hover:shadow-[0_6px_22px_rgba(79,0,1,0.32)] transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer py-3.5 px-6 font-bold text-xs sm:text-sm tracking-wide disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                      >
                        <span>
                          {status === "submitting"
                            ? isRtl ? "در حال ثبت درخواست..." : "Submitting..."
                            : isRtl ? "ثبت درخواست مشاوره رایگان" : "Submit Request Now"}
                        </span>
                        <svg
                          className={`h-4 w-4 transform ${
                            isRtl
                              ? "rotate-180 group-hover:-translate-x-1"
                              : "rotate-0 group-hover:translate-x-1"
                          } transition-transform duration-300`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </motion.button>

                      <p className="text-[10px] text-foreground/50 text-center leading-relaxed pt-1">
                        {isRtl
                          ? "اطلاعات شما با رعایت اصول کامل محرمانگی بررسی می‌شود."
                          : "By submitting this form, you agree to our Terms and Privacy Policy."}
                      </p>
                    </form>
                  )}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
