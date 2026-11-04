/**
 * Centralized Site & SEO Configuration for OnSupp
 *
 * Defines the canonical production URL, default metadata, and social profiles.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://onsupp.ir";

export const siteConfig = {
  name: "آن‌ساپ | OnSupp",
  shortName: "آن‌ساپ",
  englishName: "OnSupp Digital Agency",
  url: SITE_URL,
  description:
    "آژانس دیجیتال مارکتینگ و توسعه نرم‌افزار آن‌ساپ؛ ارائه‌دهنده راهکارهای هوشمند طراحی وب‌سایت‌های سازمانی، سئو تکنیکال، توسعه نرم‌افزار مقیاس‌پذیر، برندینگ و تولید محتوای رسانه‌ای.",
  keywords: [
    "دیجیتال مارکتینگ",
    "آژانس دیجیتال مارکتینگ",
    "طراحی سایت اختصاصی",
    "سئو تکنیکال",
    "توسعه وب‌اپلیکیشن",
    "هویت بصری و برندینگ",
    "تولید محتوا و تیزر",
    "آن‌ساپ",
    "OnSupp",
    "Digital Marketing Agency",
  ],
  authors: [
    {
      name: "تیم تخصصی آن‌ساپ",
      url: SITE_URL,
    },
  ],
  creator: "OnSupp Agency",
  publisher: "OnSupp",
  ogImage: `${SITE_URL}/images/logo/logo-Crimson.webp`,
  email: "info@onsupp.ir",
  themeColor: "#38534A",
  backgroundColor: "#1f1f1e",
  links: {
    instagram: "https://instagram.com/onsupp_web",
    linkedin: "https://linkedin.com/company/onsupp",
    telegram: "https://t.me/onsupp_web",
  },
  locale: "fa_IR",
};

export default siteConfig;
