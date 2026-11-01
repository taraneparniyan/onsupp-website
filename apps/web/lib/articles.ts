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
  createdAt: string;
  updatedAt?: string;
  featured?: boolean;
  language?: string;
  translationId?: number | null;
  faqs?: ArticleFaqItem[];
  relatedTranslation?: {
    id: number;
    titleFa: string;
    titleEn: string;
    slug: string;
    language: string;
  } | null;
};

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

/**
 * Verified canonical preview articles used for initial skeleton display
 * when backend database is in development or waiting for connection.
 */
export const CANONICAL_PREVIEW_ARTICLES: Article[] = [
  {
    id: 1,
    titleFa: "معماری سئوی تکنیکال در وب‌اپلیکیشن‌های مدرن و مقیاس‌پذیر",
    titleEn: "Technical SEO Architecture for Modern Scalable Web Applications",
    slug: "technical-seo-modern-web-architecture",
    categoryFa: "استراتژی و سئو",
    categoryEn: "SEO & Strategy",
    excerptFa:
      "چگونه ساختار رندرینگ سرور، بهینه‌سازی Core Web Vitals و معماری معنایی داده‌ها جایگاه برندهای پیشرو را در نتایج جستجو تثبیت می‌کند.",
    excerptEn:
      "How server-side rendering, Core Web Vitals optimization, and semantic data architecture secure top search rankings for leading brands.",
    contentFa: `<h2>سئوی تکنیکال؛ فراتر از کلمات کلیدی سنتی</h2>
<p>در دنیای وب‌اپلیکیشن‌های نسل جدید، موفقیت در سئو صرفاً به محتوا یا ساخت لینک محدود نمی‌شود؛ بلکه بر پایه‌ی معماری زیرساخت فنی استوار است. سرعت بارگذاری، سازگاری با موتورهای خزنده و پردازش جاوااسکریپت از مؤلفه‌های حیاتی این اکوسیستم هستند.</p>

<h3>۱. رندرینگ هیبریدی و معماری Next.js</h3>
<p>ترکیب Server-Side Rendering (SSR) و Static Site Generation (SSG) تضمین می‌کند که خزنده‌های گوگل با HTML کامل مواجه شوند و هیچ تأخیری در ایندکس شدن صفحات وب ایجاد نگردد.</p>

<h3>۲. شاخص‌های حیاتی وب (Core Web Vitals)</h3>
<p>تمرکز بر بهینه‌سازی LCP (بزرگ‌ترین المان محتوایی)، INP (تعامل‌پذیری با صفحه) و CLS (تغییر چیدمان ناگهانی) نه‌تنها امتیاز سئو را ارتقا می‌دهد، بلکه نرخ پرش کاربران را تا ۴۰٪ کاهش می‌دهد.</p>`,
    contentEn: `<h2>Technical SEO Beyond Traditional Keywords</h2>
<p>In modern web applications, search engine success is deeply anchored in technical architecture. Crawlability, server-side rendering, and performance are fundamental requirements.</p>

<h3>1. Hybrid Rendering with Modern Next.js</h3>
<p>Combining SSR and static generation ensures search crawlers receive complete semantic HTML instantly without client-side rendering delays.</p>

<h3>2. Core Web Vitals Optimization</h3>
<p>Optimizing LCP, INP, and CLS directly improves ranking visibility while simultaneously boosting end-user conversion rates.</p>`,
    readTimeFa: "۶ دقیقه مطالعه",
    readTimeEn: "6 min read",
    imageUrl:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80",
    author: "تحریریه آن‌ساپ",
    createdAt: "2026-09-24T10:00:00.000Z",
    featured: true,
  },
  {
    id: 2,
    titleFa: "اصول طراحی رابط کاربری مجله‌ای و مینیمال برای افزایش نرخ تبدیل",
    titleEn: "Editorial & Minimalist UI Design Principles for Higher Conversion",
    slug: "editorial-ui-design-conversion-rate",
    categoryFa: "طراحی محصول",
    categoryEn: "Product Design",
    excerptFa:
      "بررسی نقش تایپوگرافی دقیق، سلسله‌مراتب بصری و فضای منفی هدفمند در جلب اعتماد کاربران سازمانی و ارتقای تجربه دیجیتال.",
    excerptEn:
      "Exploring the role of refined typography, visual hierarchy, and intentional whitespace in building enterprise trust and driving conversions.",
    contentFa: `<h2>طراحی مجله‌ای؛ تلفیق زیبایی‌شناسی و کارایی تجاری</h2>
<p>رابط کاربری مدرن باید بتواند حجم بالای داده‌ها و پیام‌های بازاریابی را بدون ایجاد خستگی بصری در ذهن مخاطب بنشاند. سبک مجله‌ای (Editorial) با استفاده هوشمندانه از تایپوگرافی برجسته و گریدبندی هندسی این چالش را حل می‌کند.</p>

<h3>سلسله‌مراتب بصری هدفمند</h3>
<p>هدایت نگاه کاربر از طریق مقیاس فونت‌ها، تضاد نوری ملایم و استفاده دقیق از فضای منفی (Whitespace) باعث می‌شود که دکمه‌های اقدام (CTA) بدون مزاحمت بصری بالاترین نرخ کلیک را دریافت کنند.</p>`,
    contentEn: `<h2>Editorial Design: Balancing Aesthetics & Utility</h2>
<p>Modern UI architectures must deliver dense information clearly without visual exhaustion. Editorial discipline solves this via disciplined typographic scale and calculated whitespace.</p>`,
    readTimeFa: "۵ دقیقه مطالعه",
    readTimeEn: "5 min read",
    imageUrl:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80",
    author: "تحریریه آن‌ساپ",
    createdAt: "2026-10-02T14:30:00.000Z",
    featured: false,
  },
  {
    id: 3,
    titleFa: "تحلیل داده‌محور قیف رشد؛ از جذب ترافیک تا وفادارسازی مشتریان",
    titleEn: "Data-Driven Growth Funnels: From Acquisition to Retention",
    slug: "data-driven-growth-marketing-funnel",
    categoryFa: "دیجیتال مارکتینگ",
    categoryEn: "Growth Marketing",
    excerptFa:
      "راهنمای جامع طراحی کمپین‌های عملکردمحور و پایش شاخص‌های کلیدی رشد برای بهینه‌سازی بازگشت سرمایه در بازارهای رقابتی.",
    excerptEn:
      "A comprehensive guide to engineering performance campaigns and tracking key growth metrics to maximize ROI in competitive markets.",
    contentFa: `<h2>قیف بازاریابی داده‌محور</h2>
<p>رشد تجاری پایدار حاصل هماهنگی دقیق بین جذب مخاطب، نرخ فعال‌سازی و مکانیزم‌های نگهداشت مشتری است. پایش دائمی نرخ بازگشت هزینه تبلیغات (ROAS) و ارزش طول عمر مشتری (LTV) اساس تصمیم‌گیری‌های رشد در آن‌ساپ است.</p>`,
    contentEn: `<h2>The Modern Data-Driven Growth Engine</h2>
<p>Sustainable digital growth emerges from alignment between acquisition channels, user activation, and customer retention loops.</p>`,
    readTimeFa: "۷ دقیقه مطالعه",
    readTimeEn: "7 min read",
    imageUrl:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80",
    author: "تحریریه آن‌ساپ",
    createdAt: "2026-10-08T09:15:00.000Z",
    featured: false,
  },
];

export function toFaDigits(val: string | number): string {
  return String(val).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d, 10)]);
}

export function formatArticleDate(dateString: string, isRtl: boolean): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString(isRtl ? "fa-IR" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}
