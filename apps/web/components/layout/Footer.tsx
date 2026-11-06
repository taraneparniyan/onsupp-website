"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { scrollToSection, scrollToTop as smoothScrollToTop } from "@/lib/scroll";
import { BACKEND_URL } from "@/config/api";
import type { SiteSettingsData } from "@/lib/publicApi";

const toFaDigits = (val: string | number): string =>
  String(val).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d, 10)]);

// Quick Links
const QUICK_LINKS = [
  { nameFa: "صفحه اصلی", nameEn: "Home", href: "/" },
  { nameFa: "گالری تصاویر و نمونه‌کارها", nameEn: "Portfolio & Gallery", href: "/portfolio" },
  { nameFa: "خدمات تخصصی", nameEn: "Our Services", href: "/services" },
  { nameFa: "مقالات و اخبار", nameEn: "Articles & News", href: "/blog" },
  { nameFa: "درباره ما", nameEn: "About Us", href: "/about" },
  { nameFa: "تماس با ما", nameEn: "Contact Us", href: "/#contact" },
];

export default function Footer({ initialSettings }: { initialSettings?: SiteSettingsData | null }) {
  const { lang } = useLanguage();
  const isRtl = lang === "fa";
  const pathname = usePathname();
  const [settings, setSettings] = useState<SiteSettingsData | null>(initialSettings || null);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/v1/settings`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setSettings(data);
        }
      })
      .catch(() => {
        /* retain fallback */
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

  const quickLinks =
    settings?.footerLinks && Array.isArray(settings.footerLinks) && settings.footerLinks.length > 0
      ? settings.footerLinks
      : QUICK_LINKS;

  // Contact details strictly per user specification
  const address = isRtl ? "عظیمیه" : "Azimiyeh";
  const workingHours = isRtl
    ? settings?.workingHoursFa || "شنبه تا چهارشنبه ۹:۰۰ تا ۱۸:۰۰"
    : settings?.workingHoursEn || "Sat - Wed: 09:00 - 18:00";

  const mainPhone = "09102626113";
  const instagramSupportPhone = "09367373510";
  const websiteSupportPhone = ""; // فعلاً شماره‌ای نمایش داده نشود. امکان اضافه کردن شماره در آینده حفظ شده است.
  const telegramWebHandle = "onsupp_web";
  const telegramWebUrl = "https://t.me/onsupp_web";
  const telegramSocialHandle = "onsupp_socialmedia";
  const telegramSocialUrl = "https://t.me/onsupp_socialmedia";
  const instagramHandle = "onsupp.ir";
  const instagramUrl = "https://instagram.com/onsupp.ir";
  const mapsUrl = settings?.googleMapsUrl || "https://maps.google.com/?q=عظیمیه";

  const brandDescription = isRtl
    ? "ما باور داریم تمایز و درخشش در فضای دیجیتال یک اتفاق تصادفی نیست، بلکه انتخابی آگاهانه و استراتژیک است. با تلفیق هنر، فناوری و دانش داده‌محور، اصالت و هویت برند شما را به بالاترین سطح ممکن ارتقا می‌دهیم."
    : "We believe true distinction in the digital sphere is never accidental, but a conscious strategic choice. By harmonizing creative art, engineering, and data-driven insight, we elevate your brand to unprecedented heights.";

  const copyrightText = isRtl
    ? "© ۲۰۲۶ تمام حقوق برای OnSupp محفوظ است | آژانس دیجیتال مارکتینگ و مهندسی نرم‌افزار آن‌ساپ"
    : "© 2026 OnSupp. All Rights Reserved | Digital Marketing & Software Engineering Agency";

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
          {/* ── Top Centered Brand Identity & Social Icons ── */}
          <div className="flex flex-col items-center justify-center text-center mb-10 sm:mb-14">
            <Link
              href="/"
              onClick={(e) => handleAnchorClick(e, "/")}
              className="group inline-flex flex-col items-center focus:outline-none"
              aria-label="OnSupp Agency"
            >
              {/* Sleek Brand Typography */}
              <div className="flex items-center gap-3">
                <span className="text-xl sm:text-2xl lg:text-[26px] font-bold tracking-[0.22em] text-white uppercase font-serif transition-colors group-hover:text-white/90">
                  ONSUPP AGENCY
                </span>
              </div>
              {/* Elegant script/italic subtitle */}
              <span className="mt-1 text-xs sm:text-sm text-white/75 font-serif italic tracking-widest transition-colors group-hover:text-white">
                Creative Digital Marketing & Software Engineering
              </span>
            </Link>

            {/* Official Social Media Channels (Icon Links with aria-labels) */}
            <div className="mt-4 flex items-center justify-center gap-3">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={isRtl ? "صفحه اینستاگرام آن‌ساپ" : "OnSupp Instagram Page"}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>

              <a
                href={telegramSocialUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={isRtl ? "کانال و پشتیبانی تلگرام آن‌ساپ" : "OnSupp Telegram Channel"}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 4L3 11l6 2 2 6 3-4 5 4 2-15z" />
                  <path d="M9 13l8-6" />
                </svg>
              </a>
            </div>
          </div>

          {/* ── Mobile-Only Primary Contact Strip (High Visibility Priority on Mobile) ── */}
          <div className="block lg:hidden mb-10 p-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm space-y-3.5">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#8bb3a4]" />
              <span>{isRtl ? "ارتباط مستقیم و پشتیبانی فوری" : "Direct & Fast Support"}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <a
                href={`tel:${mainPhone}`}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-white text-[#17221E] font-bold text-xs sm:text-sm shadow-sm active:scale-98 transition-transform"
              >
                <span>{isRtl ? "شماره تماس اصلی:" : "Main Phone:"}</span>
                <span className="font-mono dir-ltr">{isRtl ? toFaDigits(mainPhone) : mainPhone}</span>
              </a>

              <a
                href={`tel:${instagramSupportPhone}`}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm border border-white/20 active:scale-98 transition-all"
              >
                <span>{isRtl ? "پشتیبانی اینستاگرام:" : "Instagram Support:"}</span>
                <span className="font-mono dir-ltr">{isRtl ? toFaDigits(instagramSupportPhone) : instagramSupportPhone}</span>
              </a>
            </div>
          </div>

          {/* ── Main 4-Column Grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-8 pb-12 sm:pb-16 border-b border-white/12">
            {/* Column 1 (Far Right in RTL): دسترسی سریع (Quick Links) */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                {isRtl ? "دسترسی سریع" : "Quick Links"}
              </h3>
              <ul className="space-y-2.5">
                {quickLinks.map((link) => (
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

            {/* Column 2: آدرس و نشانی */}
            <div className="lg:col-span-3 space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                {isRtl ? "آدرس و نشانی" : "Office Address"}
              </h3>
              <div className="space-y-3.5 text-xs sm:text-[13px] leading-relaxed">
                <div className="space-y-1">
                  <span className="font-bold text-white block">
                    {isRtl ? "دفتر مرکزی:" : "Headquarters:"}
                  </span>
                  <p className="text-white/85 font-light leading-relaxed">
                    {address}
                  </p>
                </div>
              </div>
            </div>

            {/* Column 3: ساعات کاری */}
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
                    {workingHours}
                  </p>
                </div>
              </div>
            </div>

            {/* Column 4 (Far Left in RTL): اسلوگان / بیانیه برند + دو دکمه اکشن */}
            <div className="lg:col-span-4 space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                {isRtl ? "همراه شما در مسیر رشد و توسعه دیجیتال" : "Empowering Your Digital Growth & Development"}
              </h3>
              <p className="text-xs sm:text-[13px] text-white/90 leading-relaxed font-light">
                {brandDescription}
              </p>

              {/* Stacked Action Buttons (Centered on mobile, left/aligned on desktop) */}
              <div className="pt-2 flex flex-col gap-2.5 w-full max-w-[280px] mx-auto md:mx-0">
                <Link
                  href="/#contact"
                  onClick={handleConsultationClick}
                  className="w-full inline-flex items-center justify-center py-2.5 px-5 rounded-md font-bold text-xs sm:text-[13px] tracking-wide text-[#17221E] bg-white hover:bg-[#F8F9FA] hover:text-[#2B4039] active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-lg text-center cursor-pointer"
                >
                  <span>{isRtl ? "رزرو وقت مشاوره" : "Book Consultation"}</span>
                </Link>

                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center py-2.5 px-5 rounded-md font-medium text-xs sm:text-[13px] tracking-wide text-white bg-white/[0.08] hover:bg-white/[0.18] border border-white/25 hover:border-white/50 active:scale-[0.98] transition-all duration-200 text-center cursor-pointer"
                >
                  <span>{isRtl ? "مسیریابی در گوگل مپ" : "Navigate via Google Maps"}</span>
                </a>
              </div>
            </div>
          </div>

          {/* ── Values Section: نمایش شماره‌های تماس در دسکتاپ به‌صورت افقی و هماهنگ ── */}
          <div className="py-6 sm:py-8 border-b border-white/12 w-full">
            <div className="flex flex-col sm:flex-row flex-wrap lg:flex-nowrap items-center justify-center lg:justify-between gap-4 lg:gap-8 w-full text-xs sm:text-[13px]">
              {/* شماره تماس */}
              <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
                <span className="font-bold text-white">
                  {isRtl ? "شماره تماس اصلی:" : "Phone:"}
                </span>
                <a
                  href={`tel:${mainPhone}`}
                  className="text-white/90 hover:text-white dir-ltr font-mono text-xs transition-colors"
                >
                  {isRtl ? toFaDigits(mainPhone) : mainPhone}
                </a>
              </div>

              {/* پشتیبانی اینستاگرام */}
              <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
                <span className="font-bold text-white">
                  {isRtl ? "پشتیبانی اینستاگرام:" : "Instagram Support:"}
                </span>
                <a
                  href={`tel:${instagramSupportPhone}`}
                  className="text-white/90 hover:text-white dir-ltr font-mono text-xs transition-colors"
                >
                  {isRtl ? toFaDigits(instagramSupportPhone) : instagramSupportPhone}
                </a>
              </div>

              {/* پشتیبانی وبسایت (در صورت تعریف شماره در آینده فعال می‌شود) */}
              {websiteSupportPhone ? (
                <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
                  <span className="font-bold text-white">
                    {isRtl ? "پشتیبانی وبسایت:" : "Website Support:"}
                  </span>
                  <a
                    href={`tel:${websiteSupportPhone}`}
                    className="text-white/90 hover:text-white dir-ltr font-mono text-xs transition-colors"
                  >
                    {isRtl ? toFaDigits(websiteSupportPhone) : websiteSupportPhone}
                  </a>
                </div>
              ) : null}
            </div>
          </div>

          {/* ── Bottom Bar: Copyright ── */}
          <div className="pt-6 sm:pt-8 flex items-center justify-center text-center">
            <p className="text-[11px] sm:text-xs text-white/65 tracking-wider">
              {copyrightText}
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
