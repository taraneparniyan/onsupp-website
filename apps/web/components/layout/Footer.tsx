"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { scrollToSection, scrollToTop as smoothScrollToTop } from "@/lib/scroll";
import { BACKEND_URL } from "@/config/api";
import type { SiteSettingsData } from "@/lib/publicApi";
import { resolveActiveSocialLinks, SocialNetworkIcon } from "@/lib/socialIcons";

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

  // Office address sourced from SiteSettings CMS (addressFa / addressEn)
  const address = isRtl
    ? settings?.addressFa?.trim() || "البرز، کرج، منطقه عظیمیه، میدان کوهنورد، گلستان ۲۱"
    : settings?.addressEn?.trim() || "Golestan 21, Kouhnavard Sq, Azimiyeh, Karaj, Iran";
  const workingHours = isRtl
    ? "شنبه تا پنجشنبه، ساعت ۸ تا ۱۸"
    : "Sat - Thu: 08:00 - 18:00";

  const mainPhone = "09102626113";
  const instagramSupportPhone = "09367373510";
  const websiteSupportPhone = "09383087068";
  const socialLinks = resolveActiveSocialLinks(settings);
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

            </div>

          {/* ── Mobile-Only Primary Contact Strip (High Visibility Priority on Mobile) ── */}
          <div className="block lg:hidden mb-10 p-5 rounded-card bg-white/10 border border-white/15 backdrop-blur-sm space-y-3.5">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#8bb3a4]" />
              <span>{isRtl ? "ارتباط مستقیم و پشتیبانی فوری" : "Direct & Fast Support"}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <a
                href={`tel:${mainPhone}`}
                className="flex items-center justify-between px-4 py-3 rounded-card-sm bg-white text-[#17221E] font-bold text-xs sm:text-sm shadow-sm active:scale-98 transition-transform"
              >
                <span>{isRtl ? "شماره تماس اصلی:" : "Main Phone:"}</span>
                <span className="font-mono font-bold" style={{ direction: "ltr", unicodeBidi: "isolate" }}>{isRtl ? toFaDigits("0910 262 6113") : "0910 262 6113"}</span>
              </a>

              <a
                href={`tel:${instagramSupportPhone}`}
                className="flex items-center justify-between px-4 py-3 rounded-card-sm bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm border border-white/20 active:scale-98 transition-all"
              >
                <span>{isRtl ? "پشتیبانی اینستاگرام:" : "Instagram Support:"}</span>
                <span className="font-mono font-bold" style={{ direction: "ltr", unicodeBidi: "isolate" }}>{isRtl ? toFaDigits("0936 737 3510") : "0936 737 3510"}</span>
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

            {/* Column 3: ساعات کاری، شماره‌های تماس و شبکه‌های اجتماعی */}
            <div className="lg:col-span-3 space-y-5">
              {/* ۱. ساعت کاری */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#8AB3A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth="1.8" />
                    <polyline points="12 6 12 12 16 14" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                    {isRtl ? "ساعات کاری" : "Working Hours"}
                  </h3>
                </div>
                <p className="text-xs sm:text-[13px] text-white/90 font-medium pr-6 leading-relaxed">
                  {workingHours}
                </p>
              </div>

              {/* ۲. شماره‌های تماس (دقیقاً زیر ساعت کاری با لینک مستقیم tel:) */}
              <div className="space-y-2 pt-1 border-t border-white/10">
                <span className="text-xs font-bold text-white/80 block uppercase tracking-wider">
                  {isRtl ? "شماره‌های تماس:" : "Contact Numbers:"}
                </span>
                <div className="space-y-1.5 text-xs sm:text-[13px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-white/70">{isRtl ? "شماره تماس اصلی:" : "Main Phone:"}</span>
                    <a
                      href={`tel:${mainPhone}`}
                      className="text-white font-mono font-bold hover:text-[#8AB3A0] transition-colors" style={{ direction: "ltr", unicodeBidi: "isolate" }}
                    >
                      {isRtl ? toFaDigits("0910 262 6113") : "0910 262 6113"}
                    </a>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-white/70">{isRtl ? "پشتیبانی اینستاگرام:" : "Instagram Support:"}</span>
                    <a
                      href={`tel:${instagramSupportPhone}`}
                      className="text-white font-mono font-bold hover:text-[#8AB3A0] transition-colors" style={{ direction: "ltr", unicodeBidi: "isolate" }}
                    >
                      {isRtl ? toFaDigits("0936 737 3510") : "0936 737 3510"}
                    </a>
                  </div>
                  {websiteSupportPhone && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-white/70">{isRtl ? "پشتیبانی وب‌سایت:" : "Website Support:"}</span>
                      <a
                        href={`tel:${websiteSupportPhone}`}
                        className="text-white font-mono font-bold hover:text-[#8AB3A0] transition-colors" style={{ direction: "ltr", unicodeBidi: "isolate" }}
                      >
                        {isRtl ? toFaDigits("0938 308 7068") : "0938 308 7068"}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* ۳. شبکه‌های اجتماعی (دقیقاً زیر شماره تماس‌ها) */}
              {socialLinks.length > 0 && (
                <div className="space-y-2 pt-1 border-t border-white/10">
                  <span className="text-xs font-bold text-white/80 block uppercase tracking-wider">
                    {isRtl ? "شبکه‌های اجتماعی رسمی:" : "Official Channels:"}
                  </span>
                  <div className="flex flex-wrap items-center gap-2.5 pt-0.5" data-testid="footer-social-links">
                    {socialLinks.map((social) => (
                      <a
                        key={social.id}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.name}
                        title={social.name}
                        className="w-8 h-8 rounded-control border border-white/20 bg-white/10 hover:bg-[#8AB3A0] hover:text-[#17221E] text-white flex items-center justify-center transition-all duration-200 active:scale-95 shadow-sm"
                      >
                        <SocialNetworkIcon icon={social.icon} className="w-4 h-4" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
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
                  className="w-full inline-flex items-center justify-center py-2.5 px-5 rounded-control font-bold text-xs sm:text-[13px] tracking-wide text-[#17221E] bg-white hover:bg-[#F8F9FA] hover:text-[#2B4039] active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-lg text-center cursor-pointer"
                >
                  <span>{isRtl ? "رزرو وقت مشاوره" : "Book Consultation"}</span>
                </Link>

                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center py-2.5 px-5 rounded-control font-medium text-xs sm:text-[13px] tracking-wide text-white bg-white/[0.08] hover:bg-white/[0.18] border border-white/25 hover:border-white/50 active:scale-[0.98] transition-all duration-200 text-center cursor-pointer"
                >
                  <span>{isRtl ? "مسیریابی در گوگل مپ" : "Navigate via Google Maps"}</span>
                </a>
              </div>
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
