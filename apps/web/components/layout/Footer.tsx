"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { scrollToSection, scrollToTop as smoothScrollToTop } from "@/lib/scroll";
import { BACKEND_URL } from "@/config/api";
import { DEFAULT_SITE_SETTINGS, type SiteSettingsData } from "@/lib/siteSettings";

const toFaDigits = (val: string | number): string =>
  String(val).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d, 10)]);

// Column 1: Quick Links
const QUICK_LINKS = [
  { nameFa: "صفحه اصلی", nameEn: "Home", href: "/" },
  { nameFa: "گالری تصاویر و نمونه‌کارها", nameEn: "Portfolio & Gallery", href: "/portfolio" },
  { nameFa: "خدمات تخصصی", nameEn: "Our Services", href: "/services" },
  { nameFa: "مقالات و اخبار", nameEn: "Articles & News", href: "/blog" },
  { nameFa: "درباره ما", nameEn: "About Us", href: "/about" },
  { nameFa: "تماس با ما", nameEn: "Contact Us", href: "/#contact" },
];

export default function Footer() {
  const { lang } = useLanguage();
  const isRtl = lang === "fa";
  const pathname = usePathname();
  const [settings, setSettings] = useState<SiteSettingsData>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/v1/site-settings`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      })
      .catch(() => {
        /* retain defaults */
      });
  }, []);

  const handleAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (href === "/" && (pathname === "/" || pathname === "")) {
      if (window.scrollY > 0 || window.location.hash) {
        e.preventDefault();
        smoothScrollToTop({ clearHash: true });
      }
      return;
    }

    if (href.includes("#") && (pathname === "/" || pathname === "")) {
      if (scrollToSection(href)) {
        e.preventDefault();
      }
    }
  };

  const handleConsultationClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/" || pathname === "") {
      e.preventDefault();
      scrollToSection("#contact");
    }
  };

  const managerChannel = settings.channels?.find((c) => c.id === "manager" || c.icon === "phone");
  const managerPhone = managerChannel?.value || "۰۹۱۰ ۲۶۲ ۶۱۱۳";
  const managerTel = managerChannel?.link || managerChannel?.href || "tel:09102626113";

  return (
    <>
      <footer
        dir={isRtl ? "rtl" : "ltr"}
        className="mt-auto w-full bg-[#38534A] dark:bg-[#17221E] text-white relative overflow-hidden select-none border-t border-white/10 transition-colors duration-500"
      >
        {/* Subtle Top Border Highlight Accent */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto w-full max-w-[1550px] px-6 sm:px-10 lg:px-16 pt-14 sm:pt-16 lg:pt-20 pb-8 sm:pb-10">
          {/* ── Top Centered Brand Identity ── */}
          <div className="flex flex-col items-center justify-center text-center mb-12 sm:mb-16">
            <Link
              href="/"
              onClick={(e) => handleAnchorClick(e, "/")}
              className="group inline-flex flex-col items-center focus:outline-none"
              aria-label={isRtl ? settings.siteNameFa : settings.siteNameEn}
            >
              {/* Sleek Brand Typography */}
              <div className="flex items-center gap-3">
                <span className="text-xl sm:text-2xl lg:text-[26px] font-bold tracking-[0.22em] text-white uppercase font-serif transition-colors group-hover:text-white/90">
                  {settings.siteNameEn || "ONSUPP AGENCY"}
                </span>
              </div>
              {/* Elegant script/italic subtitle */}
              <span className="mt-1 text-xs sm:text-sm text-white/75 font-serif italic tracking-widest transition-colors group-hover:text-white">
                {isRtl ? settings.siteDescriptionFa : settings.siteDescriptionEn}
              </span>
            </Link>
          </div>

          {/* ── Main 4-Column Grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-8 pb-12 sm:pb-16 border-b border-white/12">
            {/* Column 1 (Far Right in RTL): دسترسی سریع (Quick Links) */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                {isRtl ? "دسترسی سریع" : "Quick Links"}
              </h3>
              <ul className="space-y-2.5">
                {QUICK_LINKS.map((link) => (
                  <li key={link.href + link.nameEn}>
                    <Link
                      href={link.href}
                      onClick={(e) => handleAnchorClick(e, link.href)}
                      className="block text-xs sm:text-[13px] text-white/80 hover:text-white transition-colors duration-200 py-0.5 leading-relaxed"
                    >
                      {isRtl ? link.nameFa : link.nameEn}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: آدرس و نشانی دفتر مرکزی */}
            <div className="lg:col-span-3 space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                {isRtl ? (settings.addressTitleFa || "آدرس و نشانی") : (settings.addressTitleEn || "Office Address")}
              </h3>
              <div className="space-y-3.5 text-xs sm:text-[13px] leading-relaxed">
                <div className="space-y-1">
                  <span className="font-bold text-white block">
                    {isRtl ? "دفتر مرکزی:" : "Headquarters:"}
                  </span>
                  <p className="text-white/85 font-light leading-relaxed">
                    {isRtl ? settings.streetFa : settings.streetEn}
                  </p>
                </div>
                <div className="space-y-1 pt-0.5">
                  <p className="text-white/70 font-light">
                    {isRtl ? settings.cityFa : settings.cityEn}
                  </p>
                </div>
              </div>
            </div>

            {/* Column 3: ساعات کاری، تلفن و تلگرام */}
            <div className="lg:col-span-3 space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                {isRtl ? "ساعات کاری و ارتباط" : "Hours & Contact"}
              </h3>
              <div className="space-y-3 text-xs sm:text-[13px] leading-relaxed">
                <div className="space-y-1">
                  <span className="font-bold text-white block">
                    {isRtl ? "ساعات کاری:" : "Working Hours:"}
                  </span>
                  <p className="text-white/85 font-light">
                    {isRtl ? settings.workingHoursFa : settings.workingHoursEn}
                  </p>
                </div>

                {/* شماره تماس‌های رسمی آن‌ساپ بر اساس SiteSetting */}
                <div className="space-y-2 pt-1 border-t border-white/10">
                  {settings.channels && settings.channels.length > 0 ? (
                    settings.channels.slice(0, 3).map((ch, idx) => (
                      <div key={ch.id || idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                        <span className="text-white/70">
                          {isRtl ? (ch.titleFa || ch.labelFa || "تماس:") : (ch.titleEn || ch.labelEn || "Line:")}
                        </span>
                        <a
                          href={ch.link || ch.href || `tel:${ch.value.replace(/[^0-9+]/g, "")}`}
                          className="text-white font-semibold hover:text-white/80 transition-colors font-mono dir-ltr text-start sm:text-end"
                          dir="ltr"
                        >
                          {isRtl ? toFaDigits(ch.value) : ch.value}
                        </a>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                      <span className="text-white/70">{isRtl ? "آنساپ منیجر:" : "OnSupp Manager:"}</span>
                      <a href={managerTel} className="text-white font-semibold font-mono dir-ltr" dir="ltr">
                        {isRtl ? toFaDigits(managerPhone) : managerPhone}
                      </a>
                    </div>
                  )}
                </div>

                {/* تلگرام */}
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">
                    {isRtl ? "تلگرام:" : "Telegram:"}
                  </span>
                  <a
                    href={settings.telegramUrl || "https://t.me/onsupp_web"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/95 hover:text-white underline underline-offset-4 dir-ltr font-mono text-xs transition-colors"
                  >
                    @{settings.telegramHandle || "onsupp_web"}
                  </a>
                </div>
              </div>

              {/* آیکون‌های گرد ارتباطی مطابق رفرنس فوتر */}
              <div className="pt-2 flex items-center gap-2.5">
                {/* Telegram */}
                <a
                  href={settings.telegramUrl || "https://t.me/onsupp_web"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram"
                  title={`تلگرام: @${settings.telegramHandle || "onsupp_web"}`}
                  className="w-8 h-8 rounded-full border border-white/20 bg-white/5 hover:bg-white/20 hover:scale-105 active:scale-95 flex items-center justify-center text-white transition-all duration-200"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m22 2-7 20-4-9-9-4Z" />
                    <path d="M22 2 11 13" />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href={settings.instagramUrl || "https://instagram.com/onsupp_web"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  title="اینستاگرام آن‌ساپ"
                  className="w-8 h-8 rounded-full border border-white/20 bg-white/5 hover:bg-white/20 hover:scale-105 active:scale-95 flex items-center justify-center text-white transition-all duration-200"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>

                {/* Email */}
                <a
                  href={`mailto:${settings.consultEmail || "info@onsupp.ir"}`}
                  aria-label="Email"
                  title="ایمیل رسمی آن‌ساپ"
                  className="w-8 h-8 rounded-full border border-white/20 bg-white/5 hover:bg-white/20 hover:scale-105 active:scale-95 flex items-center justify-center text-white transition-all duration-200"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </a>

                {/* Direct Call to OnSupp Manager */}
                <a
                  href={managerTel}
                  aria-label="Phone"
                  title={isRtl ? `تماس مستقیم: ${managerPhone}` : `Call: ${managerPhone}`}
                  className="w-8 h-8 rounded-full border border-white/20 bg-white/5 hover:bg-white/20 hover:scale-105 active:scale-95 flex items-center justify-center text-white transition-all duration-200"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 4 (Far Left in RTL): همراه راهبردی تحول دیجیتال / بیانیه برند + دو دکمه اکشن */}
            <div className="lg:col-span-4 space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                {isRtl ? ("همراه راهبردی تحول دیجیتال") : ("Strategic Digital Transformation")}
              </h3>
              <p className="text-xs sm:text-[13px] text-white/90 leading-relaxed font-light">
                {isRtl ? settings.footerTextFa : settings.footerTextEn}
              </p>

              {/* Stacked Action Buttons */}
              <div className="pt-2 flex flex-col gap-2.5 max-w-[280px]">
                <Link
                  href={settings.headerCtaLink || "/#contact"}
                  onClick={handleConsultationClick}
                  className="w-full inline-flex items-center justify-center py-2.5 px-5 rounded-md font-bold text-xs sm:text-[13px] tracking-wide text-[#17221E] bg-white hover:bg-[#F8F9FA] hover:text-[#2B4039] active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-lg text-center cursor-pointer"
                >
                  <span>{isRtl ? settings.headerCtaTextFa : settings.headerCtaTextEn}</span>
                </Link>

                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(settings.streetFa || "عظیمیه میدان کوهنورد گلستان ۲۱")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center py-2.5 px-5 rounded-md font-medium text-xs sm:text-[13px] tracking-wide text-white bg-white/[0.08] hover:bg-white/[0.18] border border-white/25 hover:border-white/50 active:scale-[0.98] transition-all duration-200 text-center cursor-pointer"
                >
                  <span>{isRtl ? "مسیریابی در گوگل مپ" : "Navigate via Google Maps"}</span>
                </a>
              </div>
            </div>
          </div>

          {/* ── Bottom Bar: Horizontal Line & Centered Copyright ── */}
          <div className="pt-6 sm:pt-8 flex items-center justify-center text-center">
            <p className="text-[11px] sm:text-xs text-white/65 tracking-wider">
              {isRtl ? settings.copyrightTextFa : settings.copyrightTextEn}
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
