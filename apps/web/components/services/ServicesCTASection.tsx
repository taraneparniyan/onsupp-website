"use client";

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { DETAILED_SERVICES_DATA } from "./services-data";
import { BACKEND_URL } from "@/config/api";



export default function ServicesCTASection({
  isRtl,
  selectedServiceId,
}: {
  isRtl: boolean;
  selectedServiceId?: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  // Map service ID to form service option value
  const mapServiceIdToForm = (id?: string) => {
    switch (id) {
      case "social-identity":
        return "social";
      case "studio-production":
        return "video";
      case "animation-motion":
        return "animation";
      case "web-development":
        return "web";
      case "technical-seo":
        return "seo";
      case "crm-automation":
        return "crm";
      case "custom-software":
        return "software";
      default:
        return "seo";
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    service: mapServiceIdToForm(selectedServiceId),
    message: "",
  });

  const [scheduleDemoCall, setScheduleDemoCall] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  // Keep form service value synchronized if user clicks a service CTA button
  useEffect(() => {
    if (selectedServiceId) {
      setFormData((prev) => ({
        ...prev,
        service: mapServiceIdToForm(selectedServiceId),
      }));
    }
  }, [selectedServiceId]);

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
    } catch {
      setStatus("error");
    }
  };

  return (
    <section
      id="services-cta"
      aria-label={isRtl ? "درخواست مشاوره و همکاری" : "Consultation & Engagement CTA"}
      className="relative w-full py-16 sm:py-24 bg-[#F8F9FA] dark:bg-[#111416] border-t border-black/[0.06] dark:border-white/[0.08] overflow-hidden transition-colors"
    >
      {/* Soft Ambient Glow */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[360px] bg-[#38534A]/8 dark:bg-[#38534A]/18 rounded-full blur-[100px] pointer-events-none"
      />

      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Leading Side: Narrative & Contact Channels */}
          <div className="lg:col-span-6">
            <ScrollReveal once viewportMargin="0px">
              <div>
                <div className="inline-flex items-center gap-3 text-xs sm:text-sm font-bold tracking-widest text-[#38534A] dark:text-[#8AB3A0] uppercase mb-4">
                  <span className="h-px w-10 bg-[#38534A]/50 dark:bg-[#8AB3A0]/50 shrink-0" />
                  <span>{isRtl ? "شروع همکاری و مشاوره اختصاصی" : "START COLLABORATION"}</span>
                </div>

                <h2
                  className={`text-2xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-[1.25] mb-5 ${
                    isRtl
                      ? "font-[family-name:var(--font-vazirmatn)]"
                      : "font-[family-name:var(--font-gendy)]"
                  }`}
                >
                  {isRtl
                    ? "آماده‌اید مسیر رشد دیجیتال برند خود را آغاز کنید؟"
                    : "Ready to Architect Your Digital Growth Trajectory?"}
                </h2>

                <p className="text-sm sm:text-base text-foreground/75 leading-relaxed sm:leading-[1.8] mb-8 max-w-xl">
                  {isRtl
                    ? "کارشناسان ارشد آن‌ساپ بر اساس اهداف تجاری و ماهیت برند شما، دقیق‌ترین ترکیب خدمات، نقشه راه اجرایی و برآورد زمان‌بندی را در قالب یک جلسه مشاوره رایگان ارائه می‌دهند."
                    : "Our senior strategists analyze your commercial objectives to formulate the optimal mix of creative, technical, and marketing capabilities during a dedicated consultation call."}
                </p>

                {/* Direct Contact Cards */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
                  <a
                    href="#services-cta"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById("name")?.focus();
                    }}
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/80 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/10 hover:border-[#38534A]/40 dark:hover:border-[#8AB3A0]/40 transition-all shadow-sm group cursor-pointer"
                  >
                    <span className="flex h-10 w-10 rounded-xl bg-[#38534A]/10 dark:bg-[#38534A]/25 text-[#38534A] dark:text-[#8AB3A0] items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <div>
                      <span className="text-[11px] text-foreground/50 block">
                        {isRtl ? "مشاوره اختصاصی رایگان" : "Free Consultation"}
                      </span>
                      <span className="text-sm font-bold text-foreground">
                        {isRtl ? "ثبت درخواست بررسی پروژه" : "Book Project Scoping"}
                      </span>
                    </div>
                  </a>

                  <a
                    href="mailto:info@onsupp.ir"
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/80 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/10 hover:border-[#38534A]/40 dark:hover:border-[#8AB3A0]/40 transition-all shadow-sm group"
                  >
                    <span className="flex h-10 w-10 rounded-xl bg-[#38534A]/10 dark:bg-[#38534A]/25 text-[#38534A] dark:text-[#8AB3A0] items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <div>
                      <span className="text-[11px] text-foreground/50 block">
                        {isRtl ? "ایمیل رسمی سازمان" : "Official Inquiries"}
                      </span>
                      <span className="text-sm font-bold font-mono text-foreground">
                        info@onsupp.ir
                      </span>
                    </div>
                  </a>
                </div>

                <div className="flex items-center gap-2 text-xs text-foreground/60">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>
                    {isRtl
                      ? "پاسخگویی و هماهنگی جلسه در کمتر از ۴ ساعت کاری"
                      : "Prompt consultation scheduling within 4 business hours"}
                  </span>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Trailing Side: Interactive Glass Consultation Form */}
          <div className="lg:col-span-6">
            <ScrollReveal animation="scaleUp" delay={0.1} duration={0.6}>
              <div className="rounded-[28px] bg-white dark:bg-[#1A1D20] border border-black/[0.08] dark:border-white/10 p-6 sm:p-8 shadow-[0_12px_45px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                {status === "success" ? (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-[#38534A]/10 dark:bg-[#38534A]/25 text-[#38534A] dark:text-[#8AB3A0] flex items-center justify-center mx-auto border border-[#38534A]/30 shadow-md">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold text-foreground">
                      {isRtl ? "درخواست شما با موفقیت ثبت شد!" : "Request Submitted Successfully!"}
                    </h4>
                    <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed max-w-sm mx-auto">
                      {isRtl
                        ? "کارشناسان ارشد آن‌ساپ درخواست شما را بررسی کرده و جهت هماهنگی جلسه مشاوره با شما تماس خواهند گرفت."
                        : "Our team will review your specifications and contact you promptly to confirm your consultation."}
                    </p>
                    <button
                      type="button"
                      onClick={() => setStatus("idle")}
                      className="mt-4 px-6 py-2.5 rounded-full bg-[#38534A] dark:bg-[#8AB3A0] hover:bg-[#2B4039] text-white dark:text-[#17221E] font-bold text-xs shadow-md active:scale-95 transition-transform"
                    >
                      {isRtl ? "ارسال درخواست جدید" : "Submit Another Request"}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div>
                        <label className="block text-xs font-semibold text-foreground/85 mb-1.5 text-start">
                          {isRtl ? "نام و نام خانوادگی *" : "Full Name *"}
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder={isRtl ? "مثلاً: علی محمدی" : "e.g. John Doe"}
                          className="w-full px-4 py-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/10 text-xs sm:text-sm text-foreground focus:outline-none focus:border-[#38534A] dark:focus:border-[#8AB3A0] transition-colors"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-xs font-semibold text-foreground/85 mb-1.5 text-start">
                          {isRtl ? "شماره تماس *" : "Phone Number *"}
                        </label>
                        <input
                          type="tel"
                          required
                          dir="ltr"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="0912 000 0000"
                          className="w-full px-4 py-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/10 text-xs sm:text-sm text-foreground focus:outline-none focus:border-[#38534A] dark:focus:border-[#8AB3A0] transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Email */}
                      <div>
                        <label className="block text-xs font-semibold text-foreground/85 mb-1.5 text-start">
                          {isRtl ? "ایمیل کاری" : "Work Email"}
                        </label>
                        <input
                          type="email"
                          dir="ltr"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="name@company.com"
                          className="w-full px-4 py-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/10 text-xs sm:text-sm text-foreground focus:outline-none focus:border-[#38534A] dark:focus:border-[#8AB3A0] transition-colors"
                        />
                      </div>

                      {/* Service Category Select */}
                      <div>
                        <label className="block text-xs font-semibold text-foreground/85 mb-1.5 text-start">
                          {isRtl ? "دپارتمان مورد نظر *" : "Target Service *"}
                        </label>
                        <select
                          value={formData.service}
                          onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/10 text-xs sm:text-sm text-foreground focus:outline-none focus:border-[#38534A] dark:focus:border-[#8AB3A0] transition-colors"
                        >
                          <option value="social" className="dark:bg-[#1A1D20]">
                            {isRtl ? "مدیریت و هویت فضای مجازی" : "Social & Brand Identity"}
                          </option>
                          <option value="video" className="dark:bg-[#1A1D20]">
                            {isRtl ? "تصویربرداری و استودیو" : "Studio Production & Videography"}
                          </option>
                          <option value="animation" className="dark:bg-[#1A1D20]">
                            {isRtl ? "انیمیشن و موشن گرافیک" : "Animation & Motion Graphics"}
                          </option>
                          <option value="web" className="dark:bg-[#1A1D20]">
                            {isRtl ? "طراحی سایت و وب‌اپلیکیشن" : "Custom Web Design & Apps"}
                          </option>
                          <option value="seo" className="dark:bg-[#1A1D20]">
                            {isRtl ? "سئو تکنیکال و رشد ارگانیک" : "Technical SEO & Growth"}
                          </option>
                          <option value="crm" className="dark:bg-[#1A1D20]">
                            {isRtl ? "استقرار CRM و اتوماسیون" : "CRM & Automation"}
                          </option>
                          <option value="software" className="dark:bg-[#1A1D20]">
                            {isRtl ? "برنامه‌نویسی سامانه‌های اختصاصی" : "Custom Enterprise Software"}
                          </option>
                        </select>
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-xs font-semibold text-foreground/85 mb-1.5 text-start">
                        {isRtl ? "توضیحات یا نیازمندی‌های پروژه" : "Project Overview & Requirements"}
                      </label>
                      <textarea
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder={
                          isRtl
                            ? "خلاصه‌ای از اهداف، چالش‌ها یا زمان‌بندی مد نظر خود را بنویسید..."
                            : "Briefly outline your goals, timeline, and current scope..."
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/10 text-xs sm:text-sm text-foreground focus:outline-none focus:border-[#38534A] dark:focus:border-[#8AB3A0] transition-colors resize-none"
                      />
                    </div>

                    {/* Google Meet Checkbox */}
                    <div className="flex items-center gap-3 pt-1">
                      <input
                        type="checkbox"
                        id="schedule-demo-call"
                        checked={scheduleDemoCall}
                        onChange={(e) => setScheduleDemoCall(e.target.checked)}
                        className="w-4 h-4 rounded border-black/20 text-[#38534A] focus:ring-[#38534A]"
                      />
                      <label htmlFor="schedule-demo-call" className="text-xs text-foreground/80 cursor-pointer select-none">
                        {isRtl
                          ? "تمایل به برگزاری جلسه آنلاین تصویری (Google Meet) دارم"
                          : "Request an interactive online video meeting (Google Meet)"}
                      </label>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={status === "submitting"}
                      className="w-full py-3.5 rounded-xl bg-[#38534A] dark:bg-[#8AB3A0] hover:bg-[#2B4039] dark:hover:bg-[#A2C5B7] text-white dark:text-[#17221E] font-bold text-sm shadow-md hover:shadow-lg active:scale-[0.99] transition-all disabled:opacity-50"
                    >
                      {status === "submitting" ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          <span>{isRtl ? "در حال ثبت درخواست..." : "Submitting..."}</span>
                        </span>
                      ) : (
                        <span>{isRtl ? "ثبت درخواست مشاوره رایگان" : "Submit Consultation Request"}</span>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
