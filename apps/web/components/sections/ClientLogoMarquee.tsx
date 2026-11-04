"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { BACKEND_URL } from "@/config/api";
import ScrollReveal from "@/components/ui/ScrollReveal";

export interface ClientLogo {
  id: string | number;
  filename?: string;
  imageUrl?: string;
  nameFa: string;
  nameEn?: string;
  websiteUrl?: string | null;
  width?: number;
  height?: number;
}

export const CLIENT_LOGOS: ClientLogo[] = [
  {
    id: "sina-parsipour",
    filename: "cropped-دکتر-سینا-پارسی-پورDesign-tool.png",
    nameFa: "کلینیک دکتر سینا پارسی‌پور",
    nameEn: "Dr. Sina Parsi Pour Clinic",
    width: 522,
    height: 522,
  },
  {
    id: "night-sky",
    filename: "night-sky-logo-Fav-Icon.webp",
    nameFa: "آسمان شب",
    nameEn: "Night Sky",
    width: 350,
    height: 100,
  },
  {
    id: "logo-article-banner",
    filename: "cropped-داخل-مقاله-سایز-جدید-1-scaled-1.webp",
    nameFa: "برند تخصصی همکار",
    nameEn: "Partner Healthcare Brand",
    width: 2558,
    height: 1004,
  },
  {
    id: "logo-brand-crest",
    filename: "1784025437971-220284966.png",
    nameFa: "برند بین‌المللی همکار",
    nameEn: "Global Partner Brand",
    width: 3479,
    height: 2561,
  },
  {
    id: "logo-fav-crest",
    filename: "cropped-fav-icon-180x180-1.png",
    nameFa: "نشان تجاری مشتریان",
    nameEn: "Client Crest Identity",
    width: 180,
    height: 180,
  },
  {
    id: "logo-medical-shield",
    filename: "1786532435122-428601052.png",
    nameFa: "مرکز تخصصی همکار",
    nameEn: "Specialized Partner Center",
    width: 934,
    height: 880,
  },
  {
    id: "logo-image-11",
    filename: "cropped-Image-11.png",
    nameFa: "نشان برند مشتری",
    nameEn: "Partner Identity",
    width: 1254,
    height: 1254,
  },
  {
    id: "logo-dont-bg",
    filename: "dont-bg-logo-Edited.png",
    nameFa: "برند تجاری همراه",
    nameEn: "Enterprise Client",
    width: 1020,
    height: 643,
  },
  {
    id: "logo-d0e6674d",
    filename: "d0e6674d-5672-4f41-94dd-2e3242594040.png",
    nameFa: "نشان همراهان آن‌ساپ",
    nameEn: "OnSupp Client Partner",
    width: 2480,
    height: 2643,
  },
];

export default function ClientLogoMarquee() {
  const { lang } = useLanguage();
  const isRtl = lang === "fa";
  const [logos, setLogos] = useState<ClientLogo[]>(CLIENT_LOGOS);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/v1/client-logos`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: ClientLogo[] = data.map((item: any) => {
            let img = item.imageUrl || "";
            if (img.startsWith("/images/clients/")) {
              img = img.replace("/images/clients/", "/images/client-logos/");
            }
            return {
              id: item.id,
              imageUrl: img,
              nameFa: item.nameFa || item.altFa || "",
              nameEn: item.nameEn || item.altEn || item.nameFa || "",
              websiteUrl: item.websiteUrl || null,
              width: item.width || 180,
              height: item.height || 60,
            };
          });
          setLogos(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const renderLogoItem = (logo: ClientLogo, key: string) => {
    const rawSrc = logo.imageUrl
      ? logo.imageUrl
      : `/images/client-logos/${encodeURIComponent(logo.filename || "")}`;
    const altText = (isRtl ? logo.nameFa : logo.nameEn) || logo.nameFa;

    const imgElement = (
      <img
        src={rawSrc}
        alt={altText}
        loading="eager"
        decoding="async"
        className="h-9 sm:h-11 md:h-12 w-auto max-w-[130px] sm:max-w-[160px] md:max-w-[180px] object-contain drop-shadow-[0_1px_3px_rgba(0,0,0,0.12)] dark:drop-shadow-[0_1px_8px_rgba(255,255,255,0.22)]"
      />
    );

    return (
      <div
        key={key}
        className="shrink-0 flex items-center justify-center h-14 sm:h-16 md:h-18 px-2 sm:px-3 select-none transition-transform duration-300 hover:scale-105"
        title={altText}
      >
        {logo.websiteUrl ? (
          <a
            href={logo.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center"
          >
            {imgElement}
          </a>
        ) : (
          imgElement
        )}
      </div>
    );
  };

  

  return (
    <section
      id="client-logos-marquee"
      aria-label={isRtl ? "برندهایی که به ما اعتماد کرده‌اند" : "Brands That Trust OnSupp"}
      className="relative w-full py-10 sm:py-14 md:py-16 overflow-hidden bg-white dark:bg-[#151918] border-y border-foreground/[0.06] dark:border-white/[0.08] transition-colors duration-500"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* ── Section Header (Understated & Compact) ── */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-6 sm:mb-8">
        <ScrollReveal once>
          <div className="inline-flex items-center gap-3 mb-2 text-xs sm:text-sm font-bold tracking-widest text-[#38534A] dark:text-[#8AB3A0] uppercase">
            <span className="h-px w-10 bg-[#38534A]/50 dark:bg-[#8AB3A0]/50" />
            <span>{isRtl ? "مشتریان و همکاران" : "CLIENTS & PARTNERS"}</span>
          </div>

          <h2
            className={`text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground ${
              isRtl
                ? "font-[family-name:var(--font-vazirmatn)]"
                : "font-[family-name:var(--font-gendy)]"
            }`}
          >
            {isRtl ? "برندهایی که به ما اعتماد کرده‌اند" : "Brands That Trust OnSupp"}
          </h2>
        </ScrollReveal>
      </div>

      {/* ── Continuous Infinite Logo Marquee ── */}
      <div
        dir="ltr"
        className="group relative w-full overflow-hidden py-3 sm:py-4 select-none"
      >
        {/* Left edge blur / fade */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-28 md:w-40 bg-gradient-to-r from-white dark:from-[#151918] to-transparent z-10"
        />

        {/* Right edge blur / fade */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-28 md:w-40 bg-gradient-to-l from-white dark:from-[#151918] to-transparent z-10"
        />

        {/* 
          Marquee Track Wrapper:
          4 synchronized duplicate tracks guarantee that the row extends well beyond 
          the viewport on any resolution. As each track reaches -100%, the next seamlessly 
          takes over, creating a truly continuous, infinite wrap-around stream where logos 
          re-enter seamlessly as soon as they exit.
        */}
        <div className="flex w-max items-center">
          {[0, 1, 2, 3].map((trackIndex) => (
            <div
              key={`track-${trackIndex}`}
              aria-hidden={trackIndex > 0}
              className="animate-marquee-glide flex shrink-0 items-center gap-10 sm:gap-14 lg:gap-18 pe-10 sm:pe-14 lg:pe-18"
            >
              {logos.map((logo, logoIndex) =>
                renderLogoItem(logo, `track-${trackIndex}-${logo.id}-${logoIndex}`)
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
