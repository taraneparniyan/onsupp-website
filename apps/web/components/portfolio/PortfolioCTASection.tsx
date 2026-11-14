"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_PREMIUM } from "@/lib/motion";
import { BACKEND_URL } from "@/config/api";



export default function PortfolioCTASection({ isRtl }: { isRtl: boolean }) {
  const prefersReducedMotion = useReducedMotion();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    projectScope: "web",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    const payload = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      service: formData.projectScope,
      message: `[درخواست همکاری از صفحه نمونه‌کارها]\nحوزه پروژه: ${formData.projectScope}\n\nتوضیحات: ${formData.message}`,
    };

    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/contact/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", phone: "", email: "", projectScope: "web", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section
      id="portfolio-cta"
      aria-label={isRtl ? "درخواست جلسه مشاوره و همکاری" : "Start Collaboration & Consultation"}
      className="relative w-full py-16 sm:py-24 border-t border-black/[0.06] dark:border-white/[0.08] overflow-hidden"
    >
      {/* ── Ambient Radial Mesh ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none select-none overflow-hidden"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#38534A]/10 dark:bg-[#38534A]/20 rounded-full blur-[110px]" />
        <div className="absolute bottom-0 right-1/4 w-[320px] h-[320px] bg-[#B7FF00]/5 dark:bg-[#B7FF00]/10 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* ── Left Column: Editorial Call & Value Props ── */}
          <div className="lg:col-span-6">
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: EASE_PREMIUM }}
              className="inline-flex items-center gap-3 text-xs sm:text-sm font-bold tracking-widest text-[#38534A] dark:text-[#8AB3A0] uppercase mb-5"
            >
              <span className="h-px w-10 bg-[#38534A]/50 dark:bg-[#8AB3A0]/50" />
              <span>{isRtl ? "شروع پروژه جدید" : "COMMISSION A PROJECT"}</span>
            </motion.div>

            <motion.h2
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: EASE_PREMIUM, delay: 0.1 }}
              className={`text-2xl sm:text-3xl lg:text-[26px] xl:text-[29px] lg:whitespace-nowrap font-black text-foreground tracking-tight leading-[1.25] mb-6 ${
                isRtl
                  ? "font-[family-name:var(--font-vazirmatn)]"
                  : "font-[family-name:var(--font-gendy)]"
              }`}
            >
              {isRtl
                ? "پروژه بعدی برند شما می‌تواند شاهکار بعدی ما باشد"
                : "Your Next Milestone Deserves Uncompromising Craft"}
            </motion.h2>

            <motion.p
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: EASE_PREMIUM, delay: 0.18 }}
              className="text-sm sm:text-base text-foreground/75 leading-relaxed sm:leading-[1.8] mb-8 max-w-xl"
            >
              {isRtl
                ? "اگر به‌دنبال شریکی استراتژیک برای بازآفرینی هویت بصری، مهندسی یک پلتفرم تحت وب مقیاس‌پذیر، تولید تیزر سینمایی یا اتوماسیون داده‌محور هستید، تیم رهبری فنی آن‌ساپ آماده همراهی شماست."
                : "Whether you seek to reinvent your visual authority, architect a resilient web platform, produce cinema-grade commercial media, or automate critical CRM pipelines — our senior engineering team is ready."}
            </motion.p>

            {/* Direct Contact Cards */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
              <a
                href="mailto:info@onsupp.ir"
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/70 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/10 hover:border-[#38534A]/40 dark:hover:border-[#8AB3A0]/40 transition-all shadow-sm group cursor-pointer"
              >
                <span className="flex h-10 w-10 rounded-xl bg-[#38534A]/10 dark:bg-[#38534A]/25 text-[#38534A] dark:text-[#8AB3A0] items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <div>
                  <span className="text-[11px] text-foreground/50 block">
                    {isRtl ? "مکاتبه مستقیم استودیو" : "Direct Advisory Email"}
                  </span>
                  <span className="text-xs sm:text-sm font-bold font-mono text-foreground" dir="ltr">
                    info@onsupp.ir
                  </span>
                </div>
              </a>

              <Link
                href="/services"
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/70 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/10 hover:border-[#38534A]/40 dark:hover:border-[#8AB3A0]/40 transition-all shadow-sm group cursor-pointer"
              >
                <span className="flex h-10 w-10 rounded-xl bg-[#38534A]/10 dark:bg-[#38534A]/25 text-[#38534A] dark:text-[#8AB3A0] items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </span>
                <div>
                  <span className="text-[11px] text-foreground/50 block">
                    {isRtl ? "دپارتمان‌های آن‌ساپ" : "Explore Capabilities"}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-foreground">
                    {isRtl ? "مشاهده تمام خدمات" : "View Services"}
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* ── Right Column: Consultation Booking Card ── */}
          <div className="lg:col-span-6">
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: EASE_PREMIUM }}
              className="p-7 sm:p-9 rounded-3xl bg-white/80 dark:bg-[#1A1A19]/85 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
            >
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1">
                {isRtl ? "ثبت درخواست جلسه مشاوره اولیه" : "Request a Strategic Consultation"}
              </h3>
              <p className="text-xs text-foreground/60 mb-6">
                {isRtl
                  ? "اطلاعات کلی پروژه خود را بنویسید؛ در کمتر از ۴ ساعت کاری با شما تماس می‌گیریم."
                  : "Share a few details about your vision; our partners will respond within 4 business hours."}
              </p>

              {status === "success" ? (
                <div className="p-6 rounded-2xl bg-[#38534A]/10 border border-[#38534A]/30 text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#38534A] text-white flex items-center justify-center mb-3">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-bold text-foreground mb-1">
                    {isRtl ? "درخواست شما با موفقیت دریافت شد" : "Consultation Request Received"}
                  </h4>
                  <p className="text-xs text-foreground/70">
                    {isRtl
                      ? "مدیر پروژه مربوطه به‌زودی جهت هماهنگی جلسه با شما تماس خواهد گرفت."
                      : "Our lead partner will reach out promptly to coordinate the briefing call."}
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus("idle")}
                    className="mt-4 text-xs font-semibold text-[#38534A] dark:text-[#8AB3A0] underline cursor-pointer"
                  >
                    {isRtl ? "ارسال درخواست دیگر" : "Send another request"}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-foreground/70 mb-1.5">
                        {isRtl ? "نام و نام خانوادگی / سازمان" : "Full Name / Organization"}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={isRtl ? "مثال: دکتر میر اسماعیلی" : "e.g. Alex Vance"}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/10 text-xs text-foreground focus:outline-none focus:border-[#38534A] dark:focus:border-[#8AB3A0] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-foreground/70 mb-1.5">
                        {isRtl ? "شماره تماس همراه" : "Phone Number"}
                      </label>
                      <input
                        type="tel"
                        required
                        dir="ltr"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="0912..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/10 text-xs text-foreground focus:outline-none focus:border-[#38534A] dark:focus:border-[#8AB3A0] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-foreground/70 mb-1.5">
                        {isRtl ? "پست الکترونیک (ایمیل)" : "Email Address"}
                      </label>
                      <input
                        type="email"
                        dir="ltr"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="name@domain.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/10 text-xs text-foreground focus:outline-none focus:border-[#38534A] dark:focus:border-[#8AB3A0] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-foreground/70 mb-1.5">
                        {isRtl ? "حوزه پروژه مورد نظر" : "Project Domain"}
                      </label>
                      <select
                        value={formData.projectScope}
                        onChange={(e) => setFormData({ ...formData, projectScope: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#232322] border border-black/[0.08] dark:border-white/10 text-xs text-foreground focus:outline-none focus:border-[#38534A] dark:focus:border-[#8AB3A0] transition-colors cursor-pointer"
                      >
                        <option value="web">{isRtl ? "طراحی سایت و وب‌اپلیکیشن" : "Web Platform / App"}</option>
                        <option value="brand">{isRtl ? "هویت بصری و برندینگ" : "Visual Identity & Social"}</option>
                        <option value="software">{isRtl ? "نرم‌افزار اختصاصی و CRM" : "Custom Software & CRM"}</option>
                        <option value="video">{isRtl ? "استودیو، تیزر و سینما" : "Cinema & Studio Media"}</option>
                        <option value="seo">{isRtl ? "سئو تکنیکال و مارکتینگ" : "Technical SEO & Growth"}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-foreground/70 mb-1.5">
                      {isRtl ? "شرح کوتاه ایده، نیازمندی‌ها یا اهداف" : "Brief Description & Goals"}
                    </label>
                    <textarea
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={
                        isRtl
                          ? "درباره کسب‌وکار، مقیاس مورد نظر، چالش‌ها یا زمان‌بندی مد نظرتان بنویسید..."
                          : "Outline your project scope, target timeline, or commercial objectives..."
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/10 text-xs text-foreground focus:outline-none focus:border-[#38534A] dark:focus:border-[#8AB3A0] transition-colors resize-none"
                    />
                  </div>

                  {status === "error" && (
                    <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-[11px] text-red-500 text-center">
                      {isRtl
                        ? "خطا در برقراری ارتباط با سرور. لطفاً مستقیماً با تلفن ما تماس بگیرید."
                        : "Communication error. Please reach out to us via direct phone."}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="w-full py-3.5 px-6 rounded-2xl bg-[#38534A] text-white hover:bg-[#2A4038] dark:bg-white dark:text-[#1F1F1E] dark:hover:bg-white/90 text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl active:scale-[0.99] transition-all duration-300 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {status === "submitting" ? (
                      <span>{isRtl ? "در حال ثبت اطلاعات..." : "Submitting..."}</span>
                    ) : (
                      <>
                        <span>{isRtl ? "ثبت نهایی و رزرو جلسه مشاوره" : "Submit & Schedule Consultation"}</span>
                        <svg
                          className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
