"use client";

import React, { useState, useEffect } from "react";
import { BACKEND_URL } from "@/config/api";

export default function ServicesCTASection({
  isRtl,
  selectedServiceId,
}: {
  isRtl: boolean;
  selectedServiceId?: string;
}) {
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
        return "web";
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    service: mapServiceIdToForm(selectedServiceId),
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

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

    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/contact/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Submission failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section
      id="services-cta"
      aria-label={isRtl ? "دریافت مشاوره و آغاز همکاری" : "Consultation & Contact"}
      className="relative w-full lg:min-h-[100vh] lg:min-h-[100svh] flex flex-col justify-center py-16 sm:py-24 bg-background border-t border-border/60 transition-colors duration-500"
    >
      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-12 xl:px-14">
        {/* Consultation Panel with Design System Panel Radius */}
        <div className="rounded-panel sm:rounded-[32px] bg-panel border border-border p-7 sm:p-12 lg:p-14 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.4)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column / Heading & Calendar Icon */}
            <div className="lg:col-span-5 flex flex-col sm:flex-row items-start sm:items-center gap-5 text-start">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-card bg-mint/10 text-mint border border-mint/25 flex items-center justify-center shrink-0">
                <svg
                  className="w-7 h-7 sm:w-8 sm:h-8"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>

              <div>
                <h2
                  className={`text-xl sm:text-2xl lg:text-[18px] xl:text-[20px] lg:whitespace-nowrap font-extrabold text-foreground tracking-tight ${
                    isRtl
                      ? "font-[family-name:var(--font-vazirmatn)]"
                      : "font-[family-name:var(--font-gendy)]"
                  }`}
                >
                  {isRtl
                    ? "برای دریافت مشاوره تخصصی، همین حالا اقدام کنید."
                    : "Book Your Specialized Strategic Consultation Today."}
                </h2>
                <p className="text-xs sm:text-sm text-muted mt-1.5">
                  {isRtl
                    ? "رشد و تثبیت اقتدار برند شما، ماموریت ماست."
                    : "Elevating and securing your market leadership is our commitment."}
                </p>
              </div>
            </div>

            {/* Right Column / Direct Fast Form */}
            <div className="lg:col-span-7">
              {status === "success" ? (
                <div className="p-6 rounded-card bg-mint/10 border border-mint/25 text-center space-y-2">
                  <h3 className="text-base font-bold text-foreground">
                    {isRtl ? "درخواست شما با موفقیت ثبت شد!" : "Request Received!"}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted">
                    {isRtl
                      ? "کارشناسان ارشد آن‌ساپ در اسرع وقت جهت هماهنگی جلسه با شما تماس خواهند گرفت."
                      : "Our consultants will reach out shortly."}
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus("idle")}
                    className="mt-3 px-6 py-2.5 rounded-control bg-[#38534A] hover:bg-[#2B4039] text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {isRtl ? "ارسال درخواست جدید" : "Submit Another"}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={isRtl ? "نام و نام خانوادگی *" : "Full Name *"}
                      className="w-full px-4 py-3 rounded-card-sm bg-raised border border-border text-xs sm:text-sm text-foreground focus:outline-none focus:border-mint"
                    />

                    <input
                      type="tel"
                      required
                      dir="ltr"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder={isRtl ? "شماره تماس *" : "Phone *"}
                      className="w-full px-4 py-3 rounded-card-sm bg-raised border border-border text-xs sm:text-sm text-foreground focus:outline-none focus:border-mint"
                    />

                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full px-4 py-3 rounded-card-sm bg-raised border border-border text-xs sm:text-sm text-foreground focus:outline-none focus:border-mint"
                    >
                      <option value="social">
                        {isRtl ? "هویت و فضای مجازی" : "Social & Brand"}
                      </option>
                      <option value="video">
                        {isRtl ? "تصویربرداری و استودیو" : "Studio & Video"}
                      </option>
                      <option value="animation">
                        {isRtl ? "انیمیشن و موشن" : "Animation & Motion"}
                      </option>
                      <option value="web">{isRtl ? "طراحی سایت و اپ" : "Web & App"}</option>
                      <option value="seo">{isRtl ? "سئو تکنیکال" : "Technical SEO"}</option>
                      <option value="crm">{isRtl ? "استقرار CRM" : "CRM & Automation"}</option>
                      <option value="software">
                        {isRtl ? "سامانه‌های اختصاصی" : "Custom Software"}
                      </option>
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3.5">
                    <input
                      type="text"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={
                        isRtl
                          ? "توضیح کوتاه درباره پروژه یا نیازمندی شما..."
                          : "Brief project note..."
                      }
                      className="w-full sm:flex-1 px-4 py-3 rounded-card-sm bg-raised border border-border text-xs sm:text-sm text-foreground focus:outline-none focus:border-mint"
                    />

                    <button
                      type="submit"
                      disabled={status === "submitting"}
                      className="w-full sm:w-auto px-7 py-3 rounded-card-sm bg-[#38534A] hover:bg-[#2B4039] text-white border border-[#8AB3A0]/35 font-semibold text-xs sm:text-sm transition-all shadow-sm shrink-0 disabled:opacity-50 cursor-pointer"
                    >
                      {status === "submitting"
                        ? isRtl
                          ? "در حال ثبت..."
                          : "Submitting..."
                        : isRtl
                        ? "ثبت درخواست مشاوره"
                        : "Submit Request"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
