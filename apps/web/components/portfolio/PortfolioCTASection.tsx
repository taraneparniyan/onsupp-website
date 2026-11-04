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
    service: "web",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/contact/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", phone: "", service: "web", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section
      aria-label={isRtl ? "شروع پروژه و مشاوره با آن‌ساپ" : "Start Your Project Consultation"}
      className="relative w-full py-20 sm:py-28 overflow-hidden bg-[#F4F5F2] dark:bg-[#121413] transition-colors"
    >
      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* ── Left Column: Editorial Headline & Channels ── */}
          <div className="lg:col-span-6">
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, ease: EASE_PREMIUM }}
              className="inline-flex items-center gap-3 text-xs sm:text-sm font-bold tracking-widest text-[#38534A] dark:text-[#8AB3A0] uppercase mb-4"
            >
              <span className="h-px w-10 bg-[#38534A]/50 dark:bg-[#8AB3A0]/50 shrink-0" />
              <span>{isRtl ? "آغاز همکاری استراتژیک" : "BEGIN YOUR NEXT ENGAGEMENT"}</span>
            </motion.div>

            <motion.h2
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: EASE_PREMIUM, delay: 0.1 }}
              className={`text-2xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-[1.25] mb-6 ${
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
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: EASE_PREMIUM, delay: 0.18 }}
              className="text-sm sm:text-base text-foreground/75 leading-relaxed sm:leading-[1.8] mb-8 max-w-xl"
            >
              {isRtl
                ? "اگر به‌دنبال شریکی استراتژیک برای بازآفرینی هویت بصری، مهندسی یک پلتفرم تحت وب مقیاس‌پذیر، تولید تیزر سینمایی یا اتوماسیون داده‌محور هستید، تیم رهبری فنی آن‌ساپ آماده همراهی شماست."
                : "Whether you seek to reinvent your visual authority, architect a resilient web platform, produce cinema-grade commercial media, or automate critical CRM pipelines — our senior engineering team is ready."}
            </motion.p>

            {/* Direct Contact Channels - Sharp Rectangular Architecture */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {/* Management Phone */}
              <a
                href="tel:09102626113"
                className="flex items-center gap-3 p-3.5 rounded-none bg-[#EAEBE7] dark:bg-[#1A1D1C] border border-[#1F1F1E]/12 dark:border-white/10 hover:border-[#38534A]/50 dark:hover:border-[#8AB3A0]/50 transition-all shadow-sm group cursor-pointer"
              >
                <span className="flex h-10 w-10 rounded-none bg-[#38534A]/10 dark:bg-[#38534A]/25 text-[#38534A] dark:text-[#8AB3A0] items-center justify-center shrink-0 border border-[#38534A]/20 dark:border-white/10 group-hover:bg-[#38534A] group-hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </span>
                <div>
                  <span className="text-[11px] text-foreground/50 block">
                    {isRtl ? "آنساپ منیجر (مشاوره ارشد)" : "OnSupp Manager"}
                  </span>
                  <span className="text-xs sm:text-sm font-bold font-mono text-foreground" dir="ltr">
                    ۰۹۱۰ ۲۶۲ ۶۱۱۳
                  </span>
                </div>
              </a>

              {/* Email */}
              <a
                href="mailto:info@onsupp.ir"
                className="flex items-center gap-3 p-3.5 rounded-none bg-[#EAEBE7] dark:bg-[#1A1D1C] border border-[#1F1F1E]/12 dark:border-white/10 hover:border-[#38534A]/50 dark:hover:border-[#8AB3A0]/50 transition-all shadow-sm group cursor-pointer"
              >
                <span className="flex h-10 w-10 rounded-none bg-[#38534A]/10 dark:bg-[#38534A]/25 text-[#38534A] dark:text-[#8AB3A0] items-center justify-center shrink-0 border border-[#38534A]/20 dark:border-white/10 group-hover:bg-[#38534A] group-hover:text-white transition-colors">
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
            </div>
          </div>

          {/* ── Right Column: Consultation Booking Card ── */}
          <div className="lg:col-span-6">
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.99 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: EASE_PREMIUM }}
              className="p-7 sm:p-9 rounded-none bg-[#EAEBE7] dark:bg-[#1A1D1C] border border-[#1F1F1E]/12 dark:border-white/10 shadow-sm"
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
                <div className="p-6 rounded-none bg-[#38534A]/10 border border-[#38534A]/30 text-center">
                  <div className="w-12 h-12 mx-auto rounded-none bg-[#38534A] text-white flex items-center justify-center mb-3">
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
                    {isRtl ? "ثبت درخواست جدید" : "Submit another request"}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground/80 block mb-1.5">
                      {isRtl ? "نام و نام خانوادگی یا نام برند *" : "Your Name / Brand *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={isRtl ? "مثال: علی احمدی (هلدینگ پارس)" : "e.g. Alex Morgan"}
                      className="w-full px-4 py-2.5 rounded-none bg-white/70 dark:bg-black/40 border border-[#1F1F1E]/12 dark:border-white/10 text-xs sm:text-sm text-foreground focus:outline-none focus:border-[#38534A] dark:focus:border-[#8AB3A0] transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-foreground/80 block mb-1.5">
                        {isRtl ? "شماره تماس همراه *" : "Mobile Phone *"}
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="0912 345 6789"
                        dir="ltr"
                        className="w-full px-4 py-2.5 rounded-none bg-white/70 dark:bg-black/40 border border-[#1F1F1E]/12 dark:border-white/10 text-xs sm:text-sm text-foreground focus:outline-none focus:border-[#38534A] dark:focus:border-[#8AB3A0] transition-colors font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-foreground/80 block mb-1.5">
                        {isRtl ? "حوزه پروژه مورد نظر" : "Target Service"}
                      </label>
                      <select
                        value={formData.service}
                        onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-none bg-white/70 dark:bg-black/40 border border-[#1F1F1E]/12 dark:border-white/10 text-xs sm:text-sm text-foreground focus:outline-none focus:border-[#38534A] dark:focus:border-[#8AB3A0] transition-colors"
                      >
                        <option value="web">{isRtl ? "طراحی سایت و وب‌اپلیکیشن" : "Web Platform"}</option>
                        <option value="brand">{isRtl ? "هویت بصری و اینستاگرام" : "Brand Identity"}</option>
                        <option value="software">{isRtl ? "برنامه‌نویسی اختصاصی" : "Custom Software"}</option>
                        <option value="studio">{isRtl ? "تیزر و استودیو سینمایی" : "Studio & Video"}</option>
                        <option value="seo">{isRtl ? "سئو تکنیکال و ارگانیک" : "Technical SEO"}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground/80 block mb-1.5">
                      {isRtl ? "خلاصه نیاز یا چالش پروژه" : "Brief Project Context"}
                    </label>
                    <textarea
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={
                        isRtl
                          ? "درباره اهداف، زمان‌بندی مد نظر یا بودجه احتمالی خود چند خط بنویسید..."
                          : "Tell us briefly about your goals, timelines, or requirements..."
                      }
                      className="w-full px-4 py-2.5 rounded-none bg-white/70 dark:bg-black/40 border border-[#1F1F1E]/12 dark:border-white/10 text-xs sm:text-sm text-foreground focus:outline-none focus:border-[#38534A] dark:focus:border-[#8AB3A0] transition-colors resize-none"
                    />
                  </div>

                  {status === "error" && (
                    <div className="text-xs text-[#8B0000] dark:text-[#E07A8B]">
                      {isRtl ? "خطا در برقراری ارتباط. لطفاً مجدداً تلاش کنید." : "Submission error. Please try again."}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="w-full py-3 px-6 rounded-none bg-[#4F0001] hover:bg-[#3B0001] text-white text-xs sm:text-sm font-bold tracking-wide transition-all duration-200 cursor-pointer shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {status === "submitting" ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{isRtl ? "ثبت درخواست مشاوره رایگان" : "Submit Consultation Request"}</span>
                        <svg
                          className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2.2"
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
