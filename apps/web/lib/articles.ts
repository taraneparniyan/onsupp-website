// ─── Shared Article Types & Canonical Data ─────────────────────────────────

export type ArticleFaqItem = {
  id?: number;
  question: string;
  answer: string;
  order?: number;
};

export type Article = {
  id: number;
  titleFa: string;
  titleEn: string;
  slug: string;
  categoryFa: string;
  categoryEn: string;
  excerptFa: string;
  excerptEn: string;
  contentFa?: string;
  contentEn?: string;
  readTimeFa?: string;
  readTimeEn?: string;
  imageUrl?: string;
  author?: string;
  published?: boolean;
  createdAt: string;
  updatedAt?: string;
  featured?: boolean;
  language?: string;
  translationId?: number | null;
  translation?: any;
  translatedFrom?: any;
  faqs?: ArticleFaqItem[];
  metaTitleFa?: string;
  metaTitleEn?: string;
  metaDescFa?: string;
  metaDescEn?: string;
  keywordsFa?: string;
  keywordsEn?: string;
  canonicalUrl?: string;
  ogImage?: string;
  relatedTranslation?: {
    id: number;
    titleFa: string;
    titleEn: string;
    slug: string;
    language: string;
  } | null;
};

import { BACKEND_URL } from "@/config/api";
export { BACKEND_URL };

/**
 * Verified real SEO-optimized articles for OnSupp (آن‌ساپ) matching database records.
 * Used across the web application (archive, single article pages, and fallbacks).
 */
export const CANONICAL_PREVIEW_ARTICLES: Article[] = [
  {
    "id": 1,
    "titleFa": "۱۰ استراتژی برتر سئو در سال ۲۰۲۶ برای رشد انفجاری کسب‌وکارها",
    "titleEn": "Top 10 SEO Strategies in 2026 for Exponential Business Growth",
    "slug": "top-seo-strategies-2026",
    "language": "fa",
    "categoryFa": "آموزش سئو",
    "categoryEn": "SEO Tutorial",
    "excerptFa": "با الگوریتم‌های جدید گوگل و هوش مصنوعی، چگونه رتبه اول گوگل را در کمتر از ۳ ماه تسخیر کنیم؟",
    "excerptEn": "With new Google AI algorithms, how to reach position #1 in under 3 months?",
    "contentFa": "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است، و برای شرایط فعلی تکنولوژی مورد نیاز، و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد.",
    "contentEn": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    "readTimeFa": "۵ دقیقه مطالعه",
    "readTimeEn": "5 min read",
    "imageUrl": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    "author": "آن‌ساپ",
    "published": true,
    "translationId": null,
    "metaTitleFa": "",
    "metaTitleEn": "",
    "metaDescFa": "",
    "metaDescEn": "",
    "keywordsFa": "",
    "keywordsEn": "",
    "canonicalUrl": "",
    "ogImage": "",
    "createdAt": "2026-10-31T14:09:57.642Z",
    "updatedAt": "2026-10-31T14:09:57.642Z",
    "faqs": [],
    "translation": null,
    "translatedFrom": null,
    "relatedTranslation": null
  },
  {
    "id": 2,
    "titleFa": "نقش طراحی سایت اختصاصی در افزایش ۳ برابری نرخ تبدیل مشتری",
    "titleEn": "The Role of Custom Web Design in Tripling Conversion Rates",
    "slug": "custom-web-design-conversion-rate",
    "language": "fa",
    "categoryFa": "طراحی وب",
    "categoryEn": "Web Design",
    "excerptFa": "بررسی اهمیت تجربه کاربری (UX)، سرعت لود زیر ۱ ثانیه و دیزاین مدرن در اعتماد مشتریان دیجیتال.",
    "excerptEn": "Exploring UX impact, sub-second load times, and modern aesthetics on customer trust.",
    "contentFa": "طراحی وب‌سایت اختصاصی نه تنها به برند شما هویت می‌بخشد، بلکه با بهینه‌سازی مسیر خرید کاربر، نرخ تبدیل خریداران را تا ۳ برابر افزایش می‌دهد.",
    "contentEn": "Custom website design gives your brand identity and optimizes conversion path by 3x.",
    "readTimeFa": "۷ دقیقه مطالعه",
    "readTimeEn": "7 min read",
    "imageUrl": "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
    "author": "تیم دیزاین آن‌ساپ",
    "published": true,
    "translationId": null,
    "metaTitleFa": "",
    "metaTitleEn": "",
    "metaDescFa": "",
    "metaDescEn": "",
    "keywordsFa": "",
    "keywordsEn": "",
    "canonicalUrl": "",
    "ogImage": "",
    "createdAt": "2026-10-31T14:09:57.642Z",
    "updatedAt": "2026-10-31T14:09:57.642Z",
    "faqs": [],
    "translation": null,
    "translatedFrom": null,
    "relatedTranslation": null
  },
  {
    "id": 3,
    "titleFa": "گزارش رشد سالانه آن‌ساپ: کسب رتبه اول سئو برای بیش از ۵۰ برند پیشرو",
    "titleEn": "OnSupp Annual Growth Report: Over 50 Leader Brands Ranked #1",
    "slug": "onsupp-annual-growth-report",
    "language": "fa",
    "categoryFa": "اخبار سازمان",
    "categoryEn": "Company News",
    "excerptFa": "دستاوردهای آژانس دیجیتال مارکتینگ آن‌ساپ و برنامه‌های توسعه همکاری با برندهای بین‌المللی.",
    "excerptEn": "OnSupp Agency milestones and international brand partnership expansion plans.",
    "contentFa": "آژانس آن‌ساپ با افتتاح دفاتر جدید بین‌المللی و همکاری با بیش از ۵۰ برند مطرح، سال مالی جدید را با موفقیت بی‌نظیری به پایان رساند.",
    "contentEn": "OnSupp agency expands international operations with over 50 leading enterprise brands.",
    "readTimeFa": "۴ دقیقه مطالعه",
    "readTimeEn": "4 min read",
    "imageUrl": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80",
    "author": "روابط عمومی آن‌ساپ",
    "published": true,
    "translationId": null,
    "metaTitleFa": "",
    "metaTitleEn": "",
    "metaDescFa": "",
    "metaDescEn": "",
    "keywordsFa": "",
    "keywordsEn": "",
    "canonicalUrl": "",
    "ogImage": "",
    "createdAt": "2026-10-31T14:09:57.642Z",
    "updatedAt": "2026-10-31T14:09:57.642Z",
    "faqs": [],
    "translation": null,
    "translatedFrom": null,
    "relatedTranslation": null
  }
];

export const PERSIAN_MONTHS = [
  "ژانویه",
  "فوریه",
  "مارس",
  "آوریل",
  "مه",
  "ژوئن",
  "ژوئیه",
  "اوت",
  "سپتامبر",
  "اکتبر",
  "نوامبر",
  "دسامبر",
];

export const toFaDigits = (n: number | string) =>
  String(n).replace(/\d/g, (x) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(x, 10)]);

export function formatArticleDate(dateString: string, isRtl: boolean): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;

    if (isRtl) {
      const day = d.getDate();
      const month = PERSIAN_MONTHS[d.getMonth()];
      const year = d.getFullYear();
      return `${toFaDigits(day)} ${month} ${toFaDigits(year)}`;
    }

    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}
