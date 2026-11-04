// ─── Shared Pricing Types & Canonical Data ─────────────────────────────────

export type PricingPlan = {
  id: number;
  categoryId: number;
  nameFa: string;
  nameEn: string;
  badgeFa?: string;
  badgeEn?: string;
  priceType: "numeric" | "contact";
  priceFa: string;
  priceEn: string;
  discountPriceFa?: string;
  discountPriceEn?: string;
  periodFa: string;
  periodEn: string;
  descriptionFa: string;
  descriptionEn: string;
  featuresFa: string[];
  featuresEn: string[];
  popular?: boolean;
  ctaFa?: string;
  ctaEn?: string;
  ctaLink?: string;
  position?: number;
};

export type PricingCategory = {
  id: number;
  titleFa: string;
  titleEn: string;
  slug: string;
  position?: number;
  plans: PricingPlan[];
};

import { BACKEND_URL } from "@/config/api";
export { BACKEND_URL };

/**
 * Verified canonical pricing categories & plans created in project seed.
 * Preserves exact pricing, features, and structure without inventing fake plans.
 */
export const CANONICAL_PRICING_CATEGORIES: PricingCategory[] = [
  {
    id: 1,
    titleFa: "سئو و بهینه‌سازی موتورهای جستجو",
    titleEn: "SEO & Search Engine Optimization",
    slug: "seo",
    position: 0,
    plans: [
      {
        id: 1,
        categoryId: 1,
        nameFa: "پلن پایه (استارت)",
        nameEn: "Basic Starter",
        priceType: "numeric",
        priceFa: "۱۵,۰۰۰,۰۰۰",
        priceEn: "15,000,000",
        periodFa: "تومان / ماهانه",
        periodEn: "TOMAN / Monthly",
        descriptionFa:
          "مناسب برای کسب‌وکارهای نوپا و محلی جهت دیده شدن در رتبه‌های اول اولیه.",
        descriptionEn:
          "Ideal for startups and local businesses aiming for initial search visibility.",
        featuresFa: [
          "آنالیز کلمات کلیدی پایه (تا ۲۰ کلمه)",
          "بهینه‌سازی فنی اولیه (Technical SEO)",
          "تولید و انتشار ۴ مقاله سئو شده",
          "گزارش‌گیری ماهانه عملکرد",
        ],
        featuresEn: [
          "Basic keyword analysis (Up to 20 keywords)",
          "Initial Technical SEO optimization",
          "4 SEO-optimized articles monthly",
          "Monthly analytics reporting",
        ],
        ctaFa: "سفارش پلن",
        ctaEn: "Select Plan",
        ctaLink: "/#contact",
        position: 0,
      },
      {
        id: 2,
        categoryId: 1,
        nameFa: "پلن حرفه‌ای (رشد)",
        nameEn: "Professional Growth",
        badgeFa: "پیشنهاد ویژه",
        badgeEn: "POPULAR",
        priceType: "numeric",
        priceFa: "۲۸,۰۰۰,۰۰۰",
        priceEn: "28,000,000",
        discountPriceFa: "۲۲,۰۰۰,۰۰۰",
        discountPriceEn: "22,000,000",
        periodFa: "تومان / ماهانه",
        periodEn: "TOMAN / Monthly",
        descriptionFa:
          "مناسب برندهای در حال رشد جهت تسخیر کلمات رقابتی و افزایش ورود خریدار.",
        descriptionEn:
          "Perfect for growing brands targeting competitive terms and conversion boosts.",
        featuresFa: [
          "تحقیق کامل کلمات کلیدی رقابتی (تا ۵۰ کلمه)",
          "سئوی کامل داخلی و ساختار لندینگ‌ها",
          "کمپین لینک‌سازی و بک‌لینک دائمی",
          "تولید ۸ مقاله تخصصی + بهبود صفحات محصول",
          "پشتیبانی ۲۴/۷ اولویت‌دار",
        ],
        featuresEn: [
          "Competitive keyword research (Up to 50 keywords)",
          "Full On-Page & Landing SEO architecture",
          "Permanent link-building campaigns",
          "8 expert articles + product page optimization",
          "Priority 24/7 support",
        ],
        popular: true,
        ctaFa: "سفارش پلن",
        ctaEn: "Select Plan",
        ctaLink: "/#contact",
        position: 1,
      },
      {
        id: 3,
        categoryId: 1,
        nameFa: "پلن سازمانی (Enterprise)",
        nameEn: "Enterprise Leader",
        badgeFa: "تخفیف ویژه",
        badgeEn: "SPECIAL OFFER",
        priceType: "contact",
        priceFa: "تماس بگیرید",
        priceEn: "Contact Us",
        periodFa: "مشاوره و قیمت سفارشی",
        periodEn: "Custom Quote",
        descriptionFa:
          "راهکار جامع سئو پرچمدار برای فروشگاه‌های بزرگ و سازمان‌های پیشرو.",
        descriptionEn:
          "Flagship SEO enterprise package tailored for massive e-commerce & portals.",
        featuresFa: [
          "کلمات کلیدی نامحدود و آنالیز عمیق رقبا",
          "معماری جامع سئو سازمانی و Schema",
          "تولید محتوای نامحدود و کپشن‌نویسی تخصصی",
          "مدیر پروژه اختصاصی و جلسات حضوری/آنلاین",
        ],
        featuresEn: [
          "Unlimited keywords & deep competitor audit",
          "Enterprise architecture & custom Schemas",
          "Unlimited specialized content creation",
          "Dedicated SEO manager & face-to-face syncs",
        ],
        ctaFa: "تماس و مشاوره رایگان",
        ctaEn: "Contact Sales",
        ctaLink: "/#contact",
        position: 2,
      },
    ],
  },
  {
    id: 2,
    titleFa: "طراحی وب‌سایت و فروشگاه آنلاین",
    titleEn: "Website & E-Commerce Design",
    slug: "website",
    position: 1,
    plans: [
      {
        id: 4,
        categoryId: 2,
        nameFa: "وب‌سایت شرکتی پایه",
        nameEn: "Corporate Basic",
        priceType: "numeric",
        priceFa: "۱۸,۰۰۰,۰۰۰",
        priceEn: "18,000,000",
        periodFa: "تومان / یکبار پرداخت",
        periodEn: "TOMAN / One-time",
        descriptionFa:
          "طراحی وب‌سایت معرفی شرکتی با دیزاین مدرن و واکنش‌گرا.",
        descriptionEn: "Modern responsive corporate presentation website.",
        featuresFa: [
          "طراحی اختصاصی تا ۵ صفحه اصلی",
          "ریسپانسیو کامل روی موبایل و تبلت",
          "فرم تماس و پنل مدیریت فارسی",
        ],
        featuresEn: [
          "Up to 5 custom pages",
          "Fully responsive mobile & tablet design",
          "Contact form & Farsi admin panel",
        ],
        ctaFa: "سفارش پلن",
        ctaEn: "Select Plan",
        ctaLink: "/#contact",
        position: 0,
      },
      {
        id: 5,
        categoryId: 2,
        nameFa: "فروشگاه اینترنتی پیشرفته",
        nameEn: "Advanced E-Commerce",
        badgeFa: "پیشنهاد ویژه",
        badgeEn: "BEST SELLER",
        priceType: "numeric",
        priceFa: "۳۵,۰۰۰,۰۰۰",
        priceEn: "35,000,000",
        discountPriceFa: "۲۹,۰۰۰,۰۰۰",
        discountPriceEn: "29,000,000",
        periodFa: "تومان / یکبار پرداخت",
        periodEn: "TOMAN / One-time",
        descriptionFa:
          "سیستم کامل فروشگاهی با درگاه پرداخت آنلاین و مدیریت انبار.",
        descriptionEn:
          "Full e-commerce platform with online payment gateways.",
        featuresFa: [
          "اتصال به درگاه‌های پرداخت شتابی",
          "سیستم تخفیف‌دهی و انبارداری آنلاین",
          "سرعت فوق‌العاده و گواهی SSL رایگان",
        ],
        featuresEn: [
          "Integration with all payment gateways",
          "Discounts & inventory management",
          "High speed & free SSL certificate",
        ],
        popular: true,
        ctaFa: "سفارش پلن",
        ctaEn: "Select Plan",
        ctaLink: "/#contact",
        position: 1,
      },
      {
        id: 6,
        categoryId: 2,
        nameFa: "پلتفرم اختصاصی سفارشی",
        nameEn: "Custom Platform",
        priceType: "contact",
        priceFa: "تماس بگیرید",
        priceEn: "Contact Us",
        periodFa: "سنجش نیاز و برآورد زمان",
        periodEn: "Custom Assessment",
        descriptionFa:
          "توسعه اختصاصی سامانه‌ها و وب‌اپلیکیشن‌های پیچیده سازمانی.",
        descriptionEn:
          "Bespoke web application development for enterprise platforms.",
        featuresFa: [
          "طراحی UI/UX اختصاصی از صفر",
          "معماری مقیاس‌پذیر با Next.js و Node.js",
          "پشتیبانی فنی یک‌ساله تضمین‌شده",
        ],
        featuresEn: [
          "Bespoke UI/UX design from scratch",
          "Scalable Next.js & Node.js architecture",
          "1-year guaranteed technical SLA",
        ],
        ctaFa: "تماس و مشاوره رایگان",
        ctaEn: "Contact Sales",
        ctaLink: "/#contact",
        position: 2,
      },
    ],
  },
];
