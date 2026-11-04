import { BACKEND_URL } from "@/config/api";

export interface ContactChannel {
  id: string;
  titleFa?: string;
  titleEn?: string;
  labelFa?: string;
  labelEn?: string;
  value: string;
  link?: string;
  href?: string;
  icon?: string;
  displayFa?: string;
  displayEn?: string;
}

export interface SiteSettingsData {
  id: number;
  siteNameFa: string;
  siteNameEn: string;
  siteDescriptionFa: string;
  siteDescriptionEn: string;
  headerCtaTextFa: string;
  headerCtaTextEn: string;
  headerCtaLink: string;
  addressTitleFa: string;
  addressTitleEn: string;
  streetFa: string;
  streetEn: string;
  cityFa: string;
  cityEn: string;
  workingHoursFa: string;
  workingHoursEn: string;
  channels: ContactChannel[];
  telegramUrl: string;
  telegramHandle: string;
  instagramUrl: string;
  linkedinUrl?: string | null;
  consultEmail: string;
  footerTitleFa?: string;
  footerTitleEn?: string;
  footerTextFa: string;
  footerTextEn: string;
  copyrightTextFa: string;
  copyrightTextEn: string;
  defaultMetaTitleFa: string;
  defaultMetaTitleEn: string;
  defaultMetaDescFa: string;
  defaultMetaDescEn: string;
  defaultKeywordsFa: string;
  defaultKeywordsEn: string;
  headerLogoUrl?: string | null;
  footerLogoUrl?: string | null;
  faviconUrl?: string | null;
  ogImageUrl?: string | null;
}

export const DEFAULT_SITE_SETTINGS: SiteSettingsData = {
  id: 1,
  siteNameFa: "آن‌ساپ",
  siteNameEn: "OnSupp",
  siteDescriptionFa: "آژانس خلاق دیجیتال مارکتینگ و توسعه نرم‌افزار",
  siteDescriptionEn: "Creative Digital Marketing & Software Development Agency",
  headerCtaTextFa: "شروع همکاری",
  headerCtaTextEn: "Get Started",
  headerCtaLink: "/#contact",
  addressTitleFa: "آدرس و نشانی استودیو",
  addressTitleEn: "Office Address",
  streetFa: "عظیمیه، میدان کوهنورد، گلستان ۲۱",
  streetEn: "Golestan 21, Kouhnavard Sq, Azimiyeh",
  cityFa: "البرز، کرج، منطقه عظیمیه",
  cityEn: "Alborz, Karaj, Azimiyeh District",
  workingHoursFa: "شنبه تا چهارشنبه ۹:۰۰ تا ۱۸:۰۰",
  workingHoursEn: "Sat - Wed: 09:00 - 18:00",
  channels: [
    {
      id: "manager",
      titleFa: "ارتباط مستقیم با مدیریت",
      titleEn: "Direct Executive Line",
      value: "۰۹۳۳ ۱۸۰ ۵۶۲۸",
      link: "tel:+989331805628",
      icon: "phone",
    },
    {
      id: "web",
      titleFa: "دپارتمان وب و تکنولوژی",
      titleEn: "Web & Engineering Dept",
      value: "۰۹۱۸ ۲۹۲ ۴۹۸۱",
      link: "tel:+989182924981",
      icon: "code",
    },
    {
      id: "social",
      titleFa: "تلگرام و مشاوره برخط",
      titleEn: "Telegram & Online Chat",
      value: "@onsupp_web",
      link: "https://t.me/onsupp_web",
      icon: "send",
    },
    {
      id: "email",
      titleFa: "پست الکترونیک رسمی",
      titleEn: "Official Inquiries",
      value: "info@onsupp.ir",
      link: "mailto:info@onsupp.ir",
      icon: "mail",
    },
  ],
  telegramUrl: "https://t.me/onsupp_web",
  telegramHandle: "onsupp_web",
  instagramUrl: "https://instagram.com/onsupp_web",
  linkedinUrl: "https://linkedin.com/company/onsupp",
  consultEmail: "info@onsupp.ir",
  footerTitleFa: "همراه راهبردی تحول دیجیتال",
  footerTitleEn: "Strategic Digital Transformation",
  footerTextFa: "طراحی و توسعه اختصاصی وب‌سایت، سئو تکنیکال و استراتژی‌های جامع دیجیتال مارکتینگ؛ همراهی متعهدانه برای خلق تمایز پایدار و رشد کسب‌وکار شما در دنیای دیجیتال.",
  footerTextEn: "Bespoke web development, technical SEO, and comprehensive digital marketing strategies; dedicated to engineering enduring distinction and scalable growth for your brand.",
  copyrightTextFa: "تمامی حقوق برای آن‌ساپ محفوظ است.",
  copyrightTextEn: "All rights reserved.",
  defaultMetaTitleFa: "آن‌ساپ | آژانس دیجیتال مارکتینگ و توسعه نرم‌افزار",
  defaultMetaTitleEn: "OnSupp | Digital Agency & Software Engineering",
  defaultMetaDescFa: "آژانس خلاق دیجیتال مارکتینگ آن‌ساپ، پیشرو در طراحی سایت مدرن، سئو تکنیکال، برندینگ و اتوماسیون سازمانی.",
  defaultMetaDescEn: "OnSupp Digital Agency specializes in Next.js web development, technical SEO, brand identity, and enterprise automation.",
  defaultKeywordsFa: "دیجیتال مارکتینگ, طراحی سایت, سئو تکنیکال, استودیو تولید محتوا, آن‌ساپ",
  defaultKeywordsEn: "digital marketing, web design, technical seo, content studio, onsupp",
  headerLogoUrl: "/images/hero/onsupp-logo.webp",
  footerLogoUrl: "/images/hero/onsupp-logo.webp",
  faviconUrl: "/favicon.ico",
  ogImageUrl: "/images/og/onsupp-default-og.png",
};

export async function fetchSiteSettings(): Promise<SiteSettingsData> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/site-settings`, {
      next: { tags: ["site-settings"] },
      cache: "no-store",
    });
    if (!res.ok) return DEFAULT_SITE_SETTINGS;
    const data = await res.json();
    return { ...DEFAULT_SITE_SETTINGS, ...data };
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}
