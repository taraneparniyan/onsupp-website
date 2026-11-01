"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { scrollToSection, scrollToTop as smoothScrollToTop } from "@/lib/scroll";

type ContactInfo = {
  phone: string;
  phoneLabelFa: string;
  phoneLabelEn: string;
  email: string;
  emailLabelFa: string;
  emailLabelEn: string;
  responseTimeFa: string;
  responseTimeEn: string;
};

const DEFAULT_CONTACT: ContactInfo = {
  phone: "021 - 9100 0000",
  phoneLabelFa: "تماس مستقیم",
  phoneLabelEn: "Direct Call",
  email: "info@onsupp.ir",
  emailLabelFa: "ایمیل رسمی",
  emailLabelEn: "Official Email",
  responseTimeFa: "پاسخگویی و هماهنگی مشاوره در ساعات کاری",
  responseTimeEn: "Consultation response during business hours",
};

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

const QUICK_LINKS = [
  { nameFa: "صفحه اصلی", nameEn: "Home", href: "/" },
  { nameFa: "خدمات تخصصی", nameEn: "Our Services", href: "/services" },
  { nameFa: "نمونه‌کارها", nameEn: "Portfolio", href: "/portfolio" },
  { nameFa: "پلن‌ها و تعرفه‌ها", nameEn: "Pricing Plans", href: "/pricing" },
  { nameFa: "مقالات", nameEn: "Articles", href: "/blog" },
  { nameFa: "درباره آن‌ساپ", nameEn: "About Us", href: "/#about" },
  { nameFa: "تماس و مشاوره", nameEn: "Contact Us", href: "/#contact" },
];

const CORE_SERVICES = [
  {
    nameFa: "مدیریت و هویت‌سازی فضای مجازی",
    nameEn: "Social Media & Brand Identity",
    href: "/services?category=social-identity",
  },
  {
    nameFa: "تصویربرداری و استودیو",
    nameEn: "Studio Production & Videography",
    href: "/services?category=studio-production",
  },
  {
    nameFa: "انیمیشن و موشن گرافیک",
    nameEn: "Animation & Motion Graphics",
    href: "/services?category=animation-motion",
  },
  {
    nameFa: "طراحی سایت و وب‌اپلیکیشن",
    nameEn: "Custom Web Design & Apps",
    href: "/services?category=web-development",
  },
  {
    nameFa: "سئو تکنیکال و رتبه‌بندی گوگل",
    nameEn: "Technical SEO & Search Growth",
    href: "/services?category=technical-seo",
  },
  {
    nameFa: "استقرار CRM و اتوماسیون فروش",
    nameEn: "CRM & Sales Automation",
    href: "/services?category=crm-automation",
  },
  {
    nameFa: "برنامه‌نویسی و سامانه‌های اختصاصی",
    nameEn: "Custom Software Engineering",
    href: "/services?category=custom-software",
  },
];

const SOCIAL_LINKS = [
  {
    id: "instagram",
    labelFa: "اینستاگرام آن‌ساپ",
    labelEn: "OnSupp Instagram",
    href: "/#contact",
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
  {
    id: "linkedin",
    labelFa: "لینکدین آن‌ساپ",
    labelEn: "OnSupp LinkedIn",
    href: "/#contact",
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    id: "telegram",
    labelFa: "تلگرام آن‌ساپ",
    labelEn: "OnSupp Telegram",
    href: "/#contact",
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <path d="m22 2-7 20-4-9-9-4Z" />
        <path d="M22 2 11 13" />
      </svg>
    ),
  },
  {
    id: "email",
    labelFa: "ارسال ایمیل به آن‌ساپ",
    labelEn: "Email OnSupp",
    href: "mailto:info@onsupp.ir",
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  },
];

export default function Footer() {
  const { lang } = useLanguage();
  const isRtl = lang === "fa";
  const pathname = usePathname();
  const [contact, setContact] = useState<ContactInfo>(DEFAULT_CONTACT);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/v1/contact/content`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setContact((prev) => ({
            ...prev,
            phone: data.phone || prev.phone,
            phoneLabelFa: data.phoneLabelFa || prev.phoneLabelFa,
            phoneLabelEn: data.phoneLabelEn || prev.phoneLabelEn,
            email: data.email || prev.email,
            emailLabelFa: data.emailLabelFa || prev.emailLabelFa,
            emailLabelEn: data.emailLabelEn || prev.emailLabelEn,
            responseTimeFa: data.responseTimeFa || prev.responseTimeFa,
            responseTimeEn: data.responseTimeEn || prev.responseTimeEn,
          }));
        }
      })
      .catch(() => {
        /* retain default verified contact details */
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

  const scrollToTop = () => {
    smoothScrollToTop({ clearHash: true });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer
      dir={isRtl ? "rtl" : "ltr"}
      className="mt-auto w-full border-t border-white/[0.07] bg-[#121517] text-foreground relative overflow-hidden"
    >
      {/* Subtle Top Border Accent Line */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-mint/25 to-transparent"
        aria-hidden="true"
      />

      {/* Restrained Ambient Olive/Neutral Glow */}
      <div
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-[640px] rounded-full bg-primary/8 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-6 sm:px-12 lg:px-24 pt-14 sm:pt-18 lg:pt-20 pb-8 sm:pb-10">
        {/* ── Main 4-Column Footer Grid ─────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-12 sm:pb-16 border-b border-white/[0.07]">
          {/* Column 1: Brand Identity, Short Bio & Social Links (4 cols on lg) */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Brand Logo */}
              <Link
                href="/"
                className="inline-flex items-center gap-3 group focus:outline-none"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-mint/25 bg-[#1b2220] text-mint font-display font-bold text-lg shadow-inner transition-colors duration-300 group-hover:border-mint/50 group-hover:bg-primary/40">
                  O
                </span>
                <span className="text-2xl font-display font-bold text-white tracking-wide transition-opacity group-hover:opacity-90">
                  Onsupp
                </span>
              </Link>

              {/* Short Company Description */}
              <p className="text-sm leading-7 text-foreground/65 max-w-sm">
                {isRtl
                  ? "آژانس خلاقیت، مهندسی نرم‌افزار و دیجیتال مارکتینگ آن‌ساپ؛ ما استراتژی داده‌محور، فناوری مدرن و طراحی هدفمند را ترکیب می‌کنیم تا برند شما در فضای دیجیتال رشد پایداری را تجربه کند."
                  : "OnSupp Digital Marketing & Software Engineering Agency. We combine data-driven strategy, modern web architecture, and purposeful design to scale forward-thinking brands."}
              </p>
            </div>

            {/* Social Media Links */}
            <div className="space-y-3 pt-1">
              <span className="block text-xs font-semibold tracking-wider text-foreground/45 uppercase">
                {isRtl ? "شبکه‌های اجتماعی و ارتباطی" : "Connect With Us"}
              </span>
              <div className="flex items-center gap-2.5">
                {SOCIAL_LINKS.map((item) => {
                  const href =
                    item.id === "email" ? `mailto:${contact.email}` : item.href;
                  return (
                    <Link
                      key={item.id}
                      href={href}
                      onClick={(e) => handleAnchorClick(e, href)}
                      aria-label={isRtl ? item.labelFa : item.labelEn}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-[#181c1e] text-foreground/65 transition-all duration-300 hover:-translate-y-0.5 hover:border-mint/35 hover:bg-[#212826] hover:text-mint"
                    >
                      {item.icon}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links / Important Pages (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold tracking-wide text-white flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-mint/80" />
              <span>{isRtl ? "صفحات مهم" : "Quick Links"}</span>
            </h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href + link.nameEn}>
                  <Link
                    href={link.href}
                    onClick={(e) => handleAnchorClick(e, link.href)}
                    className="group inline-flex items-center gap-2 text-sm text-foreground/65 transition-colors duration-200 hover:text-mint py-0.5"
                  >
                    <span className="h-px w-0 bg-mint transition-all duration-200 group-hover:w-2.5" />
                    <span>{isRtl ? link.nameFa : link.nameEn}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Core Services (3 cols on lg) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-sm font-bold tracking-wide text-white flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-mint/80" />
              <span>{isRtl ? "خدمات اصلی" : "Core Services"}</span>
            </h3>
            <ul className="space-y-2.5">
              {CORE_SERVICES.map((service) => (
                <li key={service.nameEn}>
                  <Link
                    href={service.href}
                    onClick={(e) => handleAnchorClick(e, service.href)}
                    className="group inline-flex items-center gap-2 text-sm text-foreground/65 transition-colors duration-200 hover:text-mint py-0.5"
                  >
                    <span className="h-px w-0 bg-mint transition-all duration-200 group-hover:w-2.5" />
                    <span>{isRtl ? service.nameFa : service.nameEn}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Channels & Consultation CTA (3 cols on lg) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-sm font-bold tracking-wide text-white flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-mint/80" />
              <span>{isRtl ? "راه‌های ارتباطی" : "Contact Channels"}</span>
            </h3>

            <div className="space-y-3">
              {/* Direct Phone */}
              <a
                href={`tel:${contact.phone.replace(/\s+/g, "")}`}
                className="group flex items-center gap-3.5 rounded-2xl border border-white/[0.07] bg-[#171b1d] p-3.5 transition-all duration-300 hover:border-mint/30 hover:bg-[#1c2123]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-[#202726] text-mint transition-colors group-hover:bg-primary/40">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </span>
                <div className="min-w-0">
                  <span className="block text-[11px] font-medium text-foreground/50">
                    {isRtl ? contact.phoneLabelFa : contact.phoneLabelEn}
                  </span>
                  <span
                    dir="ltr"
                    className="block truncate text-sm font-bold text-white transition-colors group-hover:text-mint"
                  >
                    {isRtl
                      ? contact.phone.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d, 10)])
                      : contact.phone}
                  </span>
                </div>
              </a>

              {/* Official Email */}
              <a
                href={`mailto:${contact.email}`}
                className="group flex items-center gap-3.5 rounded-2xl border border-white/[0.07] bg-[#171b1d] p-3.5 transition-all duration-300 hover:border-mint/30 hover:bg-[#1c2123]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-[#202726] text-mint transition-colors group-hover:bg-primary/40">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </span>
                <div className="min-w-0">
                  <span className="block text-[11px] font-medium text-foreground/50">
                    {isRtl ? contact.emailLabelFa : contact.emailLabelEn}
                  </span>
                  <span
                    dir="ltr"
                    className="block truncate text-sm font-bold text-white transition-colors group-hover:text-mint"
                  >
                    {contact.email}
                  </span>
                </div>
              </a>

              {/* Response Time & Consultation Link */}
              <div className="pt-1 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs text-foreground/55">
                  <span className="h-2 w-2 rounded-full bg-mint/80 shrink-0" />
                  <span>
                    {isRtl ? contact.responseTimeFa : contact.responseTimeEn}
                  </span>
                </div>

                <Link
                  href="/#contact"
                  onClick={(e) => handleAnchorClick(e, "/#contact")}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-mint/25 bg-[#1e2623] px-4 py-3 text-xs sm:text-sm font-bold text-mint transition-all duration-300 hover:bg-mint hover:text-ink"
                >
                  <span>
                    {isRtl
                      ? "درخواست مشاوره و شروع همکاری"
                      : "Request Free Consultation"}
                  </span>
                  <svg
                    className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Bar: Copyright & Scroll to Top ──────────────────────── */}
        <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-foreground/45">
          <p className="text-center sm:text-start">
            {isRtl
              ? `© ${String(currentYear).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d, 10)])} آژانس دیجیتال مارکتینگ آن‌ساپ (OnSupp). تمامی حقوق محفوظ است.`
              : `© ${currentYear} OnSupp Digital Marketing Agency. All rights reserved.`}
          </p>

          <button
            type="button"
            onClick={scrollToTop}
            aria-label={isRtl ? "بازگشت به بالای صفحه" : "Back to top"}
            className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#171b1d] px-3.5 py-1.5 text-xs font-medium text-foreground/65 transition-all duration-300 hover:border-mint/30 hover:text-mint cursor-pointer"
          >
            <span>{isRtl ? "بازگشت به بالا" : "Back to top"}</span>
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 15l7-7 7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}
