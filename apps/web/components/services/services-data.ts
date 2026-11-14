import type { ServiceData } from "@/lib/publicApi";

export type ServiceCategoryKey =
  | "web-development"
  | "technical-seo"
  | "social-identity"
  | "studio-production"
  | "animation-motion"
  | "crm-automation"
  | "custom-software";

export interface SubserviceDetail {
  nameFa: string;
  nameEn: string;
  descFa: string;
  descEn: string;
  deliverablesFa?: string[];
  deliverablesEn?: string[];
}

export interface ServiceMetric {
  valueFa: string;
  valueEn: string;
  labelFa: string;
  labelEn: string;
}

export interface ServiceRelatedPathway {
  titleFa: string;
  titleEn: string;
  href: string;
  type: "portfolio" | "service" | "pricing" | "blog";
}

export interface ServiceDetailItem {
  id: string;
  index: number;
  numStrFa: string;
  numStrEn: string;
  iconType: "web" | "seo" | "social" | "studio" | "motion" | "crm" | "software" | string;
  tagFa: string;
  tagEn: string;
  titleFa: string;
  titleEn: string;
  headlineFa: string;
  headlineEn: string;
  descriptionFa: string;
  descriptionEn: string;
  detailedNarrativeFa: string;
  detailedNarrativeEn: string;
  businessValueTitleFa: string;
  businessValueTitleEn: string;
  businessValueFa: string;
  businessValueEn: string;
  image: string;
  subservices: SubserviceDetail[];
  metrics: ServiceMetric[];
  relatedLinks: ServiceRelatedPathway[];
  ctaLabelFa: string;
  ctaLabelEn: string;
  badgeAccentFa?: string;
  badgeAccentEn?: string;
  isFromDatabase?: boolean;
}

export const DETAILED_SERVICES_DATA: ServiceDetailItem[] = [
  {
    id: "web-development",
    index: 1,
    numStrFa: "۰۱",
    numStrEn: "01",
    iconType: "web",
    tagFa: "طراحی وب",
    tagEn: "Web Design",
    titleFa: "طراحی سایت و وب‌اپلیکیشن",
    titleEn: "Custom Web Design & Apps",
    headlineFa: "مهندسی رابط‌های کاربری لوکس با بالاترین استانداردهای سرعت و مقیاس",
    headlineEn: "Engineering Bespoke Digital Experiences Built for Speed, Scale & Elegance",
    descriptionFa:
      "طراحی سیستم‌های دیزاین اختصاصی، رابط‌های کاربری چشم‌نواز و پیاده‌سازی مدرن فرانت‌اند و فول‌استک با Next.js و React منطبق با استانداردهای جهانی سرعت.",
    descriptionEn:
      "Bespoke design systems, engaging UI/UX experiences, and robust Next.js engineering built for top-tier performance, speed, and cross-device precision.",
    detailedNarrativeFa:
      "وب‌سایت سازمان شما، دفتر مرکزی هویت دیجیتال شماست. ما با فاصله گرفتن از قالب‌های آماده و کدهای سنگین تجاری، دیزاین سیستم‌های اختصاصی و کدهای مدرن را بر پایه Next.js، React و استانداردهای Core Web Vitals پیاده‌سازی می‌کنیم؛ محصولی که نه تنها از نظر زیبایی بصری مجذوب‌کننده است، بلکه در کسری از ثانیه لود شده و بالاترین نرخ تبدیل را رقم می‌زند.",
    detailedNarrativeEn:
      "Your website is the foundational flagship of your digital presence. Rejecting cookie-cutter templates, OnSupp architects bespoke Figma design systems and modern Next.js/React codebases that achieve flawless Core Web Vitals, ultra-responsive cross-device fidelity, and elite conversion benchmarks.",
    businessValueTitleFa: "ارزش استراتژیک برای کسب‌وکار شما",
    businessValueTitleEn: "Strategic Business Value",
    businessValueFa:
      "بارگذاری آنی صفحات زیر ۱ ثانیه، صفر شدن ریسک افت سئو ناشی از کدهای نامرغوب، امنیت حداکثری و مالکیت ۱۰۰٪ کد منبع بدون وابستگی به لایسنس‌های جانبی.",
    businessValueEn:
      "Sub-second page speeds, zero template bloat, complete source code ownership, enterprise security, and seamless compliance with Google's Core Web Vitals.",
    image: "/images/services/web-development.webp",
    subservices: [
      {
        nameFa: "طراحی رابط کاربری اختصاصی UI/UX",
        nameEn: "Bespoke UI/UX Design Systems",
        descFa:
          "طراحی سیستم‌های دیزاین اختصاصی در فیگما، تایپوگرافی مهندسی‌شده فارسی و انگلیسی، وایرفریمینگ تعاملی و تست دقیق کاربردپذیری (Usability Testing).",
        descEn:
          "Component design systems in Figma, bilingual typographic rhythm (Vazirmatn & Gendy), interactive wireframes, and rigorous usability testing.",
        deliverablesFa: ["سیستم دیزاین کامل در Figma", "پروتوتایپ تعاملی پیش از کدنویسی", "معماری تجربه کاربری (UX)"],
        deliverablesEn: ["Complete Figma Design System", "High-Fidelity Interactive Prototype", "UX Information Architecture"],
      },
      {
        nameFa: "کدنویسی استاندارد با Next.js و React",
        nameEn: "Modern Next.js & React Engineering",
        descFa:
          "پیاده‌سازی فرانت‌اند با Next.js App Router، تایپ‌اسکریپت و Tailwind CSS مدرن، بدون کتابخانه‌های حجیم و منطبق بر رندرینگ سمت سرور (SSR) و استاتیک (SSG).",
        descEn:
          "Engineered with Next.js App Router, TypeScript, and Tailwind CSS 4 for seamless Server Components, streaming hydration, and responsive performance.",
        deliverablesFa: ["کد منبع تمیز و ماژولار", "سازگاری کامل موبایل و دسکتاپ", "پشتیبانی دوزبانه و تم تیره/روشن"],
        deliverablesEn: ["Clean Modular TypeScript Codebase", "Mobile-First Fluid Layouts", "Bilingual RTL/LTR & Theme Engine"],
      },
      {
        nameFa: "بهینه‌سازی سرعت و Core Web Vitals",
        nameEn: "Speed & Core Web Vitals Optimization",
        descFa:
          "کاهش حداکثری زمان لود اولیه (LCP)، ثبات بصری طرح‌بندی (CLS صفر) و پاسخ‌دهی آنی به تعاملات کاربر (INP عالی) بر اساس متدهای پیشرفته بهینه‌سازی.",
        descEn:
          "Minimizing Largest Contentful Paint (LCP), zero Cumulative Layout Shift (CLS), and instantaneous Interaction to Next Paint (INP).",
        deliverablesFa: ["نمره بالای ۹۰ در Google Lighthouse", "لود بهینه فونت‌ها و تصاویر نسل جدید", "کشینگ و CDN حرفه‌ای"],
        deliverablesEn: ["Lighthouse Performance Score 95+", "Next-Gen Asset Compression", "Edge Caching & CDN Deployment"],
      },
    ],
    metrics: [
      { valueFa: "۹۸+", valueEn: "98+", labelFa: "امتیاز عملکرد Google Lighthouse", labelEn: "Google Lighthouse Performance Score" },
      { valueFa: "< ۰.۹s", valueEn: "< 0.9s", labelFa: "میانگین زمان بارگذاری اولیه (LCP)", labelEn: "Average First Contentful Paint" },
      { valueFa: "۱۰۰٪", valueEn: "100%", labelFa: "ریسپانسیو روی تمامی اندازه‌های نمایشگر", labelEn: "Pixel-Perfect Responsive Integrity" },
    ],
    relatedLinks: [
      { titleFa: "مشاهده نمونه‌های طراحی وب", titleEn: "Web Portfolio", href: "/portfolio?category=web-design", type: "portfolio" },
      { titleFa: "سئو تکنیکال و رتبه‌بندی", titleEn: "Technical SEO", href: "#technical-seo", type: "service" },
      { titleFa: "برنامه‌نویسی و سامانه‌های اختصاصی", titleEn: "Custom Software", href: "#custom-software", type: "service" },
    ],
    ctaLabelFa: "درخواست مشاوره پروژه وب",
    ctaLabelEn: "Schedule Web Project Discovery",
    badgeAccentFa: "وب‌سایت و اپلیکیشن",
    badgeAccentEn: "Web & Digital Apps",
  },
  {
    id: "technical-seo",
    index: 2,
    numStrFa: "۰۲",
    numStrEn: "02",
    iconType: "seo",
    tagFa: "سئو",
    tagEn: "SEO",
    titleFa: "سئو تکنیکال و رشد ارگانیک",
    titleEn: "Technical SEO & Organic Growth",
    headlineFa: "تسلط بر موتورهای جستجو با تکیه بر معماری داده و اعتبار ساختاری",
    headlineEn: "Securing Market Dominance Through Search Architecture & Compounding Traffic",
    descriptionFa:
      "آدیت عمیق معماری سایت، تصحیح خطاهای ایندکس، تحقیق هوشمندانه کلمات کلیدی و استراتژی ساختاریافته محتوا برای تثبیت رتبه‌های برتر در موتورهای جستجو.",
    descriptionEn:
      "Comprehensive architectural audits, Core Web Vitals optimization, semantic keyword research, and high-authority content strategies for compounding search growth.",
    detailedNarrativeFa:
      "سئو موثر دیگر به افزودن کلمات کلیدی تصادفی محدود نمی‌شود. تیم سئو آن‌ساپ بر پایه مهندسی داده، ساختارهای اسکیما، رفع خطاهای تکنیکال ایندکسینگ و تدوین کلاسترهای محتوایی، رتبه‌بندی پایدار سایت شما را در رقابتی‌ترین کلمات کلیدی تضمین می‌کند تا جریان پیوسته‌ای از لیدهای باکیفیت به سوی کسب‌وکار شما هدایت شود.",
    detailedNarrativeEn:
      "Modern search authority requires architectural precision. OnSupp's SEO practice audits technical crawlers, deploys semantic JSON-LD schema, maps searcher intent clusters, and builds high-authority content pillars that secure top search positions without reliance on ongoing ad spend.",
    businessValueTitleFa: "ارزش استراتژیک برای کسب‌وکار شما",
    businessValueTitleEn: "Strategic Business Value",
    businessValueFa:
      "جایگزینی ترافیک پایدار و رایگان ارگانیک به جای هزینه‌های گزاف تبلیغات کلیکی، جذب مخاطبان با نیت خرید بالا و ایجاد دارایی ماندگار دیجیتال برای برند شما.",
    businessValueEn:
      "Builds an appreciating digital asset that replaces spiraling Pay-Per-Click ad spend with reliable, high-intent inbound organic leads.",
    image: "/images/services/technical-seo.webp",
    subservices: [
      {
        nameFa: "آدیت فنی و اصلاح ساختار سایت",
        nameEn: "Technical SEO Audits & Architecture",
        descFa:
          "بررسی کامل کدهای سایت، حل خطاهای بودجه خزش (Crawl Budget)، اصلاح ریدایرکت‌ها، پیاده‌سازی متاتگ‌های پیشرفته و داده‌های ساختاریافته Schema.org.",
        descEn:
          "Comprehensive crawler simulation, crawl budget optimization, canonical URL fixes, and rich snippet Schema.org structured data deployment.",
        deliverablesFa: ["سند جامع آدیت فنی سئو", "پیاده‌سازی استانداردهای Schema", "اصلاح خطاهای Search Console"],
        deliverablesEn: ["Comprehensive Technical Audit Report", "Rich Schema.org Integration", "Google Search Console Remediation"],
      },
      {
        nameFa: "پژوهش کلمات کلیدی و تحلیل رقبا",
        nameEn: "Keyword Research & Competitor Analysis",
        descFa:
          "شناسایی دقیق عبارت‌های کلیدی پرجستجو با نیت خرید، استخراج شکاف‌های محتوایی رقبا (Content Gap) و اولویت‌بندی کلمات بر اساس پتانسیل درآمدزایی.",
        descEn:
          "Commercial intent mapping, keyword gap analysis against primary market competitors, and prioritized keyword opportunity matrices.",
        deliverablesFa: ["ماتریس کلمات کلیدی هدف", "تحلیل عمیق ۵ رقیب اصلی", "نقشه سفر مشتری بر اساس کلمات"],
        deliverablesEn: ["High-Intent Keyword Map", "In-Depth Competitor Gap Matrix", "Search Intent Journey Alignment"],
      },
      {
        nameFa: "تدوین استراتژی محتوا و رتبه‌بندی",
        nameEn: "Content Strategy & Search Authority",
        descFa:
          "طراحی کلاسترهای محتوایی (Topic Clusters)، راهنمایی نگارش متون تخصصی سئوشده، بهینه‌سازی لینک‌سازی داخلی و نظارت مستمر بر تثبیت رتبه‌های صفحه اول گوگل.",
        descEn:
          "Topic cluster architecture, SEO copywriting frameworks, contextual internal linking strategies, and weekly rank tracking.",
        deliverablesFa: ["تقویم پیلار و کلاستر محتوایی", "دستورالعمل سئو برای نویسندگان", "گزارش‌های هفتگی پایش رتبه"],
        deliverablesEn: ["Pillar & Topic Cluster Blueprint", "Editorial SEO Guidelines", "Weekly SERP Rank Tracking Dashboards"],
      },
    ],
    metrics: [
      { valueFa: "+۲۲۰٪", valueEn: "+220%", labelFa: "میانگین رشد ترافیک ارگانیک در ۶ ماه", labelEn: "Average Organic Search Traffic Growth" },
      { valueFa: "صفحه اول", valueEn: "Page 1", labelFa: "تثبیت رتبه‌بندی در کلمات رقابتی", labelEn: "Top 3 Competitive SERP Dominance" },
      { valueFa: "۱۰۰٪", valueEn: "100%", labelFa: "مطابقت با دستورالعمل‌های رسمی گوگل", labelEn: "Google Search Essentials Compliance" },
    ],
    relatedLinks: [
      { titleFa: "مقالات و وبلاگ سئو", titleEn: "SEO Blog & Insights", href: "/blog", type: "blog" },
      { titleFa: "طراحی وب‌سایت بهینه", titleEn: "Web Engineering", href: "#web-development", type: "service" },
      { titleFa: "مشاوره استراتژی رشد", titleEn: "Growth Consultation", href: "#contact", type: "service" },
    ],
    ctaLabelFa: "درخواست آدیت سئو وب‌سایت",
    ctaLabelEn: "Request Free Website SEO Audit",
    badgeAccentFa: "سئو و رتبه‌بندی ارگانیک",
    badgeAccentEn: "Technical SEO",
  },
  {
    id: "social-identity",
    index: 3,
    numStrFa: "۰۳",
    numStrEn: "03",
    iconType: "social",
    tagFa: "اینستاگرام",
    tagEn: "Instagram Marketing",
    titleFa: "مدیریت اینستاگرام و هویت فضای مجازی",
    titleEn: "Instagram Marketing & Brand Identity",
    headlineFa: "خلق هویتی یکپارچه و تمایزی ماندگار در ذهن مخاطب",
    headlineEn: "Architecting Cohesive Visual Identity & High-Engagement Brand Presence",
    descriptionFa:
      "طراحی هویت بصری منسجم، تدوین استراتژی برندینگ و مدیریت تعاملات شبکه‌های اجتماعی برای ارتقای تمایز و ماندگاری برند در ذهن مخاطب.",
    descriptionEn:
      "Cohesive visual identity, brand strategy design, and active social media management to maximize brand recall and organic audience engagement.",
    detailedNarrativeFa:
      "در بازار پرتراکم امروز، شبکه‌های اجتماعی نخستین و پیوسته‌ترین نقطه تماس مخاطب با برند شما هستند. دپارتمان فضای مجازی آن‌ساپ با تکیه بر تحلیل رفتار مخاطبان هدف و استانداردهای طراحی برندینگ، زبان بصری و روایی اختصاصی کسب‌وکار شما را تدوین می‌کند؛ رویکردی که صرفاً به ارسال پست خلاصه نمی‌شود، بلکه پایه‌گذار اعتماد عمیق و هویت متمایز برند در اکوسیستم دیجیتال است.",
    detailedNarrativeEn:
      "In crowded modern markets, digital channels serve as the primary brand touchpoint. OnSupp architects bespoke visual guidelines, audience-centric content cadences, and authoritative tone of voice that convert casual viewers into long-term brand advocates.",
    businessValueTitleFa: "ارزش استراتژیک برای کسب‌وکار شما",
    businessValueTitleEn: "Strategic Business Value",
    businessValueFa:
      "کاهش محسوس هزینه جذب مشتری (CAC) از طریق رشد تعامل ارگانیک، تثبیت هویت بصری یکدست در تمامی کانال‌ها و افزایش ضریب ماندگاری پیام برند در حافظه مخاطبان تصمیم‌گیرنده.",
    businessValueEn:
      "Significantly lowers Customer Acquisition Cost (CAC) through compounded organic engagement while instilling enduring premium authority across all customer touchpoints.",
    image: "/images/services/social-identity.webp",
    subservices: [
      {
        nameFa: "طراحی برند و مدیریت استراتژی",
        nameEn: "Brand Design & Strategy Management",
        descFa:
          "تدوین دفترچه راهنمای هویت بصری (Brand Book)، تعیین لحن پیام، تدوین پرسونای مخاطب و تقویم محتوایی مبتنی بر اهداف فروش و آگاهی‌بخشی.",
        descEn:
          "Comprehensive brand guidelines, tone of voice formulation, persona targeting, and objective-driven editorial calendars.",
        deliverablesFa: ["کتابچه هویت بصری (Brand Book)", "استراتژی لحن و روایت", "تقویم محتوایی ماهانه"],
        deliverablesEn: ["Complete Brand Style Guide", "Voice & Messaging Framework", "Monthly Content Calendar"],
      },
      {
        nameFa: "طراحی محتوای گرافیکی و سینمایی پویا",
        nameEn: "Dynamic Graphic & Cinematic Content",
        descFa:
          "تولید اسلایدهای تعاملی، پوسترهای مفهومی، استوری‌های موشن‌دار و گرافیک‌های اختصاصی با بالاترین استانداردهای بصری و کپی‌رایتینگ متقاعدکننده.",
        descEn:
          "Interactive multi-slide carousels, conceptual graphic layouts, motion stories, and persuasive copywriting designed for maximum retention.",
        deliverablesFa: ["پست‌های کاروسل تحلیلی", "طراحی هویت استوری‌ها", "کپی‌رایتینگ تخصصی"],
        deliverablesEn: ["High-Impact Carousel Decks", "Motion Story Templates", "Strategic Copywriting"],
      },
      {
        nameFa: "مدیریت و کنترل صفحه مجازی",
        nameEn: "Social Page Management & Monitoring",
        descFa:
          "مدیریت تعاملات و دایرکت‌ها، مانیتورینگ الگوریتم‌ها، نظارت بر سلامت اکانت و ارائه گزارش‌های دقیق رشد، نرخ تعامل و تحلیل رفتار مخاطبان.",
        descEn:
          "Community moderation, algorithmic optimization, account health auditing, and monthly analytical growth reports.",
        deliverablesFa: ["مدیریت منظم تعاملات", "آنالیز هفتگی و ماهانه", "بهینه‌سازی الگوریتمی"],
        deliverablesEn: ["Active Community Moderation", "KPI & Engagement Reporting", "Algorithmic Growth Calibration"],
      },
    ],
    metrics: [
      { valueFa: "+۱۴۰٪", valueEn: "+140%", labelFa: "میانگین رشد نرخ تعامل ارگانیک", labelEn: "Average Organic Engagement Lift" },
      { valueFa: "۳.۲x", valueEn: "3.2x", labelFa: "افزایش ماندگاری بصری برند", labelEn: "Brand Recall Multiplier" },
      { valueFa: "۱۰۰٪", valueEn: "100%", labelFa: "هماهنگی با استانداردهای هویت بصری", labelEn: "Brand Guideline Cohesion" },
    ],
    relatedLinks: [
      { titleFa: "مشاهده نمونه‌های برندینگ", titleEn: "Branding Portfolio", href: "/portfolio?category=instagram", type: "portfolio" },
      { titleFa: "استودیو و تولید ویدیو", titleEn: "Studio Production", href: "#studio-production", type: "service" },
      { titleFa: "انیمیشن و موشن گرافیک", titleEn: "Animation & Motion", href: "#animation-motion", type: "service" },
    ],
    ctaLabelFa: "درخواست مشاوره هویت برند",
    ctaLabelEn: "Request Brand Identity Consultation",
    badgeAccentFa: "هویت و شبکه‌های اجتماعی",
    badgeAccentEn: "Social & Identity",
  },
  {
    id: "studio-production",
    index: 4,
    numStrFa: "۰۴",
    numStrEn: "04",
    iconType: "studio",
    tagFa: "فیلم‌برداری",
    tagEn: "Videography",
    titleFa: "فیلم‌برداری و تولیدات استودیو",
    titleEn: "Studio Production & Videography",
    headlineFa: "روایت سینمایی داستان برند با تجهیزات فوق‌حرفه‌ای",
    headlineEn: "Cinematic Visual Storytelling Powered by Cinema-Grade Technology",
    descriptionFa:
      "تولید تیزرهای تبلیغاتی، مستندهای صنعتی، استودیو پادکست و محتوای تعاملی با تجهیزات حرفه‌ای سینمایی و بالاترین استاندارد نورپردازی و صدا.",
    descriptionEn:
      "Cinematic commercial films, industrial documentaries, podcast recording, and interactive multimedia engineered with professional cinema-grade gear.",
    detailedNarrativeFa:
      "یک قاب تصویربرداری حرفه‌ای قادر است در چند ثانیه حسی از اعتبار و کیفیت را منتقل کند که هزاران واژه از بیان آن ناتوانند. در استودیو آن‌ساپ، با بهره‌گیری از دوربین‌های سینمایی، سیستم‌های پیشرفته نورپردازی و اتاق‌های مجهز ضبط صدا و پادکست، ایده و ارزش‌های سازمان شما را به محتوایی فاخر و تأثیرگذار برای کمپین‌های تجاری و رسانه‌ای بدل می‌کنیم.",
    detailedNarrativeEn:
      "A single cinematic shot communicates credibility and prestige that thousands of words cannot match. OnSupp leverages cinema-grade cameras, broadcast lighting grids, and acoustic studio spaces to transform your enterprise vision into captivating commercial assets.",
    businessValueTitleFa: "ارزش استراتژیک برای کسب‌وکار شما",
    businessValueTitleEn: "Strategic Business Value",
    businessValueFa:
      "افزایش چشمگیر نرخ تبدیل در تبلیغات ویدیویی، تثبیت اعتبار رسمی سازمان در نگاه مشتریان سازمانی (B2B) و تولید دارایی‌های ویدیویی با ماندگاری طولانی برای تمامی کمپین‌ها.",
    businessValueEn:
      "Drastically increases conversion rates across video marketing funnels, secures B2B enterprise trust, and produces evergreen visual brand collateral.",
    image: "/images/services/studio-production.webp",
    subservices: [
      {
        nameFa: "تصویربرداری صنعتی و تبلیغاتی",
        nameEn: "Industrial & Commercial Cinematography",
        descFa:
          "ساخت تیزرهای تلویزیونی و دیجیتال، فیلم‌برداری از خطوط تولید کارخانجات، پروژه‌های معماری و معرفی محصولات در لوکیشن اختصاصی یا کارفرما.",
        descEn:
          "Broadcast commercials, high-end industrial plant documentaries, architectural features, and product cinematography on location or in-studio.",
        deliverablesFa: ["تیزر تجاری سینمایی", "مستند صنعتی و خط تولید", "عکاسی صنعتی اختصاصی"],
        deliverablesEn: ["Commercial Broadcast Spots", "Industrial Facility Documentaries", "Studio Product Photography"],
      },
      {
        nameFa: "ساخت پادکست و محتوای بلند تعاملی",
        nameEn: "Podcasts & Long-Form Interactive Media",
        descFa:
          "تجهیز و هدایت استودیو پادکست، تصویربرداری چنددوربینه، ضبط صدای کالیبره‌شده، مصاحبه‌های سازمانی و تولید قسمت‌های پادکست تصویری (Vodcast).",
        descEn:
          "Multi-camera podcast engineering, acoustic sound capture, corporate talk shows, and vodcast series ready for multi-channel syndication.",
        deliverablesFa: ["ویدیوپادکست با کیفیت 4K", "میکسینگ و مسترینگ صدا", "کات‌های ویروسی شبکه‌های اجتماعی"],
        deliverablesEn: ["4K Multi-Cam Vodcast Episodes", "Acoustic Audio Mastering", "Short-Form Social Clips"],
      },
      {
        nameFa: "تدوین و پست‌تولید",
        nameEn: "Editing & Post-Production",
        descFa:
          "تدوین ریتمیک، اصلاح رنگ سینمایی (Color Grading)، طراحی باند صوتی و جلوه‌های صوتی سه‌بعدی برای خلق نهایت گیرایی و کیفیت حسی در بیننده.",
        descEn:
          "Rhythmic narrative editing, cinema color grading (DaVinci Resolve), custom sound design, and audio post-mastering.",
        deliverablesFa: ["اصلاح رنگ حرفه‌ای (Log/LUT)", "طراحی و مهندسی صدا", "نسخه‌های عمودی و افقی متناسب کانال‌ها"],
        deliverablesEn: ["Pro Color Grading (Log/LUT)", "Custom Foley & Sound Design", "Multi-Platform Export Formats"],
      },
    ],
    metrics: [
      { valueFa: "4K 10-Bit", valueEn: "4K 10-Bit", labelFa: "استاندارد تصویربرداری سینمایی", labelEn: "Cinema Capture Standard" },
      { valueFa: "+۶۵٪", valueEn: "+65%", labelFa: "افزایش نرخ تماشای کامل ویدیوها", labelEn: "Average Watch Time Retention" },
      { valueFa: "۱۰۰٪", valueEn: "100%", labelFa: "تجهیزات مدرن نور و صدای استودیویی", labelEn: "Broadcast Acoustic Fidelity" },
    ],
    relatedLinks: [
      { titleFa: "مشاهده نمونه‌های ویدیویی", titleEn: "Video Portfolio", href: "/portfolio?category=video", type: "portfolio" },
      { titleFa: "انیمیشن و موشن گرافیک", titleEn: "Animation & Motion", href: "#animation-motion", type: "service" },
      { titleFa: "مدیریت و هویت بصری", titleEn: "Social Identity", href: "#social-identity", type: "service" },
    ],
    ctaLabelFa: "هماهنگی استودیو و تولید ویدیو",
    ctaLabelEn: "Schedule Studio Production Consultation",
    badgeAccentFa: "استودیو و تولید سینمایی",
    badgeAccentEn: "Cinema Production",
  },
  {
    id: "animation-motion",
    index: 5,
    numStrFa: "۰۵",
    numStrEn: "05",
    iconType: "motion",
    tagFa: "انیمیشن",
    tagEn: "Animation",
    titleFa: "انیمیشن و موشن گرافیک",
    titleEn: "Animation & Motion Graphics",
    headlineFa: "تفهیم جذاب و سریع پیچیده‌ترین مفاهیم با هنر حرکت",
    headlineEn: "Simplifying Complex Ideas into Captivating Kinetic Narratives",
    descriptionFa:
      "خلق انیمیشن‌های دوبعدی و سه‌بعدی، جلوه‌های بصری سینمایی (VFX) و موشن‌گرافیک‌های تعاملی برای تفهیم سریع، خلاقانه و اثرگذار پیام کسب‌وکار.",
    descriptionEn:
      "2D & 3D animation, cutting-edge cinematic VFX, and interactive motion graphics designed to transform complex concepts into captivating visual stories.",
    detailedNarrativeFa:
      "مفاهیم پیچیده تجاری، مکانیزم‌های عملکردی محصولات مدرن و فناوری‌های نوین زمانی به موفقیت دست می‌یابند که مخاطب بتواند در چند ثانیه ارزش محوری آن‌ها را درک کند. تیم انیمیشن و موشن‌گرافیک آن‌ساپ با تلفیق هنر کارگردانی هنری، فیزیک سه‌بعدی و جلوه‌های ویژه بصری، مفاهیم انتزاعی را به داستان‌هایی پرکشش، آموزنده و انگیزشی تبدیل می‌کند.",
    detailedNarrativeEn:
      "Complex technologies and abstract services only convert when prospects grasp their core value within seconds. OnSupp blends art direction, 3D physics, and kinetic animation to distill sophisticated concepts into visual narratives that command engagement.",
    businessValueTitleFa: "ارزش استراتژیک برای کسب‌وکار شما",
    businessValueTitleEn: "Strategic Business Value",
    businessValueFa:
      "افزایش درک محصول در جلسات B2B، کاهش نرخ خروج کاربران در صفحات فرود و ارتقای شگرف جذابیت ارائه‌ها و تیزرهای معرفی خدمات به سرمایه‌گذاران.",
    businessValueEn:
      "Accelerates product comprehension in enterprise B2B sales cycles, drastically reduces landing page bounce rates, and delivers investor-ready visual clarity.",
    image: "/images/services/animation-motion.webp",
    subservices: [
      {
        nameFa: "انیمیشن دوبعدی و سه‌بعدی",
        nameEn: "2D & 3D Animation",
        descFa:
          "طراحی کاراکتر، مدلسازی سه‌بعدی محصولات، انیمیت روان و فضاسازی‌های داستانی متناسب با شخصیت برند برای کمپین‌ها و پلتفرم‌های تعاملی.",
        descEn:
          "Custom character design, realistic 3D product modeling, organic rigging, and bespoke environments crafted to mirror your brand persona.",
        deliverablesFa: ["مدلسازی ۳D با رندر فوتورئال", "انیمیشن دو بعدی داستانی", "شبیه‌سازی مکانیزم محصول"],
        deliverablesEn: ["Photorealistic 3D Modeling", "Character & Narrative 2D", "Product Mechanical Simulation"],
      },
      {
        nameFa: "جلوه‌های ویژه سینمایی",
        nameEn: "Cinematic Visual Effects (VFX)",
        descFa:
          "تلفیق ویدیوهای رئال با عناصر سه‌بعدی کامپیوتری، شبیه‌سازی ذرات، نورپردازی دینامیک و کامپوزیت سینمایی برای تولید آگهی‌های متمایز و فراتر از واقعیت.",
        descEn:
          "Seamless CGI live-action integration, particle simulations, dynamic lighting, and cinematic compositing for hyper-realistic visual ads.",
        deliverablesFa: ["کامپوزیت CGI و رئال", "شبیه‌سازی فیزیک ذرات و سیالات", "رتوش و اصلاح دیجیتال صحنه"],
        deliverablesEn: ["Live-Action CGI Compositing", "Fluid & Particle Simulation", "Digital Scene Augmentation"],
      },
      {
        nameFa: "موشن گرافیک صنعتی، آموزشی و تعاملی",
        nameEn: "Industrial, Educational & Interactive Motion",
        descFa:
          "خلق ویدیوهای توضیح‌دهنده (Explainer Videos)، موشن‌گرافیک‌های معرفی نرم‌افزار، گزارش‌های آماری پویا و گرافیک‌های رابط کاربری تعاملی.",
        descEn:
          "Dynamic product explainers, SaaS interface walkthroughs, kinetic data visualizations, and interactive UI micro-animations.",
        deliverablesFa: ["ویدیو توضیح‌دهنده محصول (Explainer)", "موشن‌گرافیک دیتامحور و آماری", "انیمیشن‌های رابط کاربری UI Motion"],
        deliverablesEn: ["SaaS Explainer Videos", "Data & Metric Visualizations", "UI Micro-Interactions & Lottie"],
      },
    ],
    metrics: [
      { valueFa: "۳ برابر", valueEn: "3x", labelFa: "افزایش یادآوری پیام در مقایسه با متن", labelEn: "Message Recall vs Plain Text" },
      { valueFa: "+۸۰٪", valueEn: "+80%", labelFa: "بهبود نرخ تبدیل صفحات فرود", labelEn: "Landing Page Conversion Uplift" },
      { valueFa: "60 FPS", valueEn: "60 FPS", labelFa: "روانی و استانداردهای کیفی انیمیت", labelEn: "Ultra-Fluid Kinetic Animation" },
    ],
    relatedLinks: [
      { titleFa: "مشاهده نمونه‌های انیمیشن", titleEn: "Animation Portfolio", href: "/portfolio?category=animation", type: "portfolio" },
      { titleFa: "طراحی سایت و موشن وب", titleEn: "Web Engineering", href: "#web-development", type: "service" },
      { titleFa: "استودیو و تیزر صنعتی", titleEn: "Studio Production", href: "#studio-production", type: "service" },
    ],
    ctaLabelFa: "درخواست مشاوره پروژه موشن",
    ctaLabelEn: "Request Motion & VFX Consultation",
    badgeAccentFa: "موشن گرافیک و انیمیشن",
    badgeAccentEn: "Motion & Animation",
  },
  {
    id: "crm-automation",
    index: 6,
    numStrFa: "۰۶",
    numStrEn: "06",
    iconType: "crm",
    tagFa: "CRM",
    tagEn: "CRM",
    titleFa: "استقرار CRM و اتوماسیون فروش",
    titleEn: "CRM Implementation & Automation",
    headlineFa: "تسریع فرآیندهای فروش و شفافیت کامل چرخه‌های مشتریان",
    headlineEn: "Accelerating Sales Velocity Through Intelligent Pipeline Automation",
    descriptionFa:
      "طراحی و سفارشی‌سازی پایپ‌لاین‌های فروش، اتوماسیون ثبت سرنخ‌ها و گزارش‌گیری تحلیلی برای افزایش بهره‌وری تیم‌های فروش و کاهش چرخه‌های بسته شدن قراردادها.",
    descriptionEn:
      "Tailored CRM configuration, multi-channel lead automation pipelines, and executive dashboards that accelerate sales velocity and customer retention.",
    detailedNarrativeFa:
      "لیدهای ورودی از وب‌سایت، شبکه‌های اجتماعی و کمپین‌های تبلیغاتی در صورت عدم پیگیری سریع و هوشمندانه، ارزش خود را از دست می‌دهند. راهکارهای استقرار CRM و اتوماسیون آن‌ساپ فرآیند جذب تا بستن قرارداد را مکانیزه می‌کنند تا هیچ مشتری بالقوه‌ای فراموش نشود و مدیران در هر لحظه تصویری شفاف از عملکرد و درآمد آتی تیم فروش داشته باشند.",
    detailedNarrativeEn:
      "Inbound leads from campaigns and digital channels rapidly decay without immediate structured follow-ups. OnSupp designs tailored CRM architectures and multi-channel notification webhooks to automate lead routing, shorten sales cycles, and empower leadership with real-time revenue intelligence.",
    businessValueTitleFa: "ارزش استراتژیک برای کسب‌وکار شما",
    businessValueTitleEn: "Strategic Business Value",
    businessValueFa:
      "کاهش ۳۵ درصدی زمان پیگیری لیدها، جلوگیری ۱۰۰ درصدی از اتلاف سرنخ‌های ورودی و دسترسی مدیران ارشد به داشبوردهای شفاف پیش‌بینی فروش و درآمد.",
    businessValueEn:
      "Reduces lead response times by 35%, eliminates lost opportunities across multi-channel funnels, and equips executives with actionable revenue forecasting.",
    image: "/images/services/crm-automation.webp",
    subservices: [
      {
        nameFa: "راه‌اندازی و سفارشی‌سازی اختصاصی CRM",
        nameEn: "Tailored CRM Setup & Configuration",
        descFa:
          "تنظیم مراحل قیف فروش، تعریف فیلدهای اختصاصی هر صنعت، سطوح دسترسی کارشناسان و هماهنگ‌سازی سیستم با فرآیندهای واقعی سازمان.",
        descEn:
          "Custom pipeline staging, enterprise field architectures, permission schemas, and workflow calibration aligned with your sales operations.",
        deliverablesFa: ["طراحی مراحل قیف فروش (Pipelines)", "تعریف نقش‌ها و دسترسی‌های پرسنل", "مهاجرت داده‌های قدیمی به CRM"],
        deliverablesEn: ["Custom Sales Pipeline Design", "Role-Based Access Control", "Clean Historical Data Migration"],
      },
      {
        nameFa: "اتوماسیون ثبت و پیگیری سرنخ‌ها",
        nameEn: "Automated Lead Pipelines & Workflows",
        descFa:
          "اتصال خودکار فرم‌های وب‌سایت، چت‌بات‌ها و پیام‌رسان‌ها به CRM، ارسال پیامک و ایمیل‌های پیگیری خودکار و تخصیص هوشمند لید به کارشناسان مربوطه.",
        descEn:
          "Instant webhook capture from web forms and chat channels, automated SMS/email sequences, and round-robin lead distribution.",
        deliverablesFa: ["اتصال بدون وقفه فرم‌های وب به CRM", "سناریوهای پیگیری خودکار پیامکی و ایمیلی", "یادآورهای هوشمند برای کارشناسان"],
        deliverablesEn: ["Real-Time Lead Webhook Ingestion", "Automated Nurturing Workflows", "Smart Task & Follow-up Reminders"],
      },
      {
        nameFa: "داشبوردهای شفاف گزارش‌گیری فروش",
        nameEn: "Sales Pipeline & Performance Dashboards",
        descFa:
          "طراحی گزارش‌های لحظه‌ای از عملکرد کارشناسان، نرخ تبدیل هر مرحله از قیف، میزان فروش تحقق‌یافته و تحلیل دلایل از دست رفتن معاملات.",
        descEn:
          "Real-time visibility into rep productivity, conversion bottlenecks, deal velocity, and win/loss analytics for strategic leadership.",
        deliverablesFa: ["داشبورد جامع مدیریت فروش", "گزارش‌های نرخ تبدیل مراحل قیف", "سیستم هشدار معاملات راکد"],
        deliverablesEn: ["Executive Revenue Dashboard", "Funnel Stage Conversion Analytics", "Stale Deal Alert Triggers"],
      },
    ],
    metrics: [
      { valueFa: "-۳۵٪", valueEn: "-35%", labelFa: "کاهش چرخه تبدیل لید به مشتری", labelEn: "Shorter Sales Cycle Duration" },
      { valueFa: "۰ لید", valueEn: "Zero", labelFa: "سرنخ‌های فراموش‌شده یا از دست‌رفته", labelEn: "Zero Dropped Inbound Leads" },
      { valueFa: "۱۰۰٪", valueEn: "100%", labelFa: "شفافیت گزارش‌های فروش برای مدیریت", labelEn: "Executive Pipeline Visibility" },
    ],
    relatedLinks: [
      { titleFa: "مشاهده تعرفه‌ها و پلن‌های راه‌اندازی", titleEn: "Pricing & Plans", href: "/pricing", type: "pricing" },
      { titleFa: "برنامه‌نویسی سامانه‌های اختصاصی", titleEn: "Custom Software", href: "#custom-software", type: "service" },
      { titleFa: "طراحی وب و اتصال فرم‌ها", titleEn: "Web Development", href: "#web-development", type: "service" },
    ],
    ctaLabelFa: "درخواست مشاوره استقرار CRM",
    ctaLabelEn: "Schedule CRM Implementation Demo",
    badgeAccentFa: "اتوماسیون و عملیات فروش",
    badgeAccentEn: "CRM & Automations",
  },
  {
    id: "custom-software",
    index: 7,
    numStrFa: "۰۷",
    numStrEn: "07",
    iconType: "software",
    tagFa: "برنامه‌نویسی",
    tagEn: "Programming",
    titleFa: "برنامه‌نویسی و سامانه‌های اختصاصی",
    titleEn: "Custom Software & Web Systems",
    headlineFa: "توسعه سامانه‌های تحت وب مقیاس‌پذیر و زیرساخت‌های پایدار سازمانی",
    headlineEn: "Engineering Mission-Critical Enterprise Platforms & Scalable Cloud Systems",
    descriptionFa:
      "طراحی و توسعه سامانه‌های تحت وب مقیاس‌پذیر، پرتال‌های مدیریتی، دیتابیس‌های ابری و معماری API اختصاصی متناسب با فرآیندهای منحصربه‌فرد هر کسب‌وکار.",
    descriptionEn:
      "Scalable web applications, internal enterprise portals, secure PostgreSQL architectures, and custom API microservices tailored to mission-critical operations.",
    detailedNarrativeFa:
      "هنگامی که کسب‌وکار شما دارای فرآیندهای منحصربه‌فردی است که نرم‌افزارهای آماده تجاری توان پاسخگویی به آن را ندارند، راه‌حل نهایی توسعه نرم‌افزار اختصاصی است. تیم فنی آن‌ساپ با بهره‌گیری از معماری‌های مدرن میکروسرویس، پایگاه‌های داده مقیاس‌پذیر PostgreSQL و استانداردهای سختگیرانه امنیت سایبری، سامانه‌های یکپارچه‌ای خلق می‌کند که ستون فقرات عملیات دیجیتال سازمان شما خواهند بود.",
    detailedNarrativeEn:
      "When enterprise operations outgrow off-the-shelf SaaS, custom software engineering becomes the definitive competitive advantage. OnSupp crafts resilient web applications, custom management portals, secure PostgreSQL architectures, and REST/GraphQL microservices built to withstand high concurrency and mission-critical workloads.",
    businessValueTitleFa: "ارزش استراتژیک برای کسب‌وکار شما",
    businessValueTitleEn: "Strategic Business Value",
    businessValueFa:
      "مالکیت انحصاری دارایی فکری (IP)، حذف کامل هزینه‌های مکرر دلاری نرم‌افزارهای خارجی، انطباق ۱۰۰ درصدی با الزامات قانونی و سازمانی و قابلیت ارتقای نامحدود.",
    businessValueEn:
      "100% intellectual property ownership, zero recurring vendor lock-in fees, total compliance with data privacy protocols, and infinite scalability as your enterprise grows.",
    image: "/images/services/custom-software.webp",
    subservices: [
      {
        nameFa: "توسعه فول‌استک اختصاصی و مقیاس‌پذیر",
        nameEn: "Scalable Full-Stack Web Systems",
        descFa:
          "برنامه‌نویسی سامانه‌های پیچیده تحت وب با فریم‌ورک‌های مدرن، پردازش‌های ناهمگام، صف‌بندی کارها (Task Queues) و معماری‌های پاسخگو به ترافیک بالا.",
        descEn:
          "End-to-end full-stack engineering, asynchronous background workers, high-concurrency event queues, and multi-tenant architectures.",
        deliverablesFa: ["معماری ماژولار و مقیاس‌پذیر", "کدنویسی منطبق بر اصول Clean Code", "مستندات کامل فنی نرم‌افزار"],
        deliverablesEn: ["Scalable Modular Architecture", "Strict Clean Code Standards", "Comprehensive Technical Documentation"],
      },
      {
        nameFa: "طراحی ساختار دیتابیس و پنل مدیریتی",
        nameEn: "Database & Admin Portal Architecture",
        descFa:
          "طراحی ساختار داده‌های رابطه‌ای و غیررابطه‌ای با بهینه‌سازی کوئری‌ها، ایجاد پنل‌های مدیریتی پیشرفته با گزارش‌گیری لحظه‌ای و مدیریت کاربران چندسطحی.",
        descEn:
          "Normalized relational database schemas (PostgreSQL/Prisma), query indexing, granular user privilege layers, and bespoke management admin portals.",
        deliverablesFa: ["طراحی بهینه دیتابیس PostgreSQL", "پنل مدیریت اختصاصی ادمین", "سیستم جامع ثبت رخدادها (Audit Logs)"],
        deliverablesEn: ["Optimized Database Schemas", "Custom Admin Dashboard Portal", "Comprehensive Security Audit Logs"],
      },
      {
        nameFa: "اتصال امن به APIها و سرویس‌های بیرونی",
        nameEn: "Secure Third-Party API Integrations",
        descFa:
          "پیاده‌سازی درگاه‌های پرداخت، وب‌سرویس‌های پیامکی، اتصال به نرم‌افزارهای حسابداری و ERP و ارائه APIهای استاندارد برای ارتباط با سامانه‌های شخص ثالث.",
        descEn:
          "Secure microservice interfaces, payment gateways, ERP and accounting middleware, and versioned REST/GraphQL developer APIs.",
        deliverablesFa: ["وب‌سرویس‌های امن REST و GraphQL", "اتصال به سیستم‌های مالی و بانکی", "مستندات استاندارد OpenAPI/Swagger"],
        deliverablesEn: ["Secure REST & GraphQL APIs", "Financial & Banking Gateway Integrations", "Standard OpenAPI / Swagger Specs"],
      },
    ],
    metrics: [
      { valueFa: "۹۹.۹٪", valueEn: "99.9%", labelFa: "پایداری عملکرد و آپ‌تایم سامانه‌ها", labelEn: "Platform Architecture Uptime" },
      { valueFa: "۱۰۰٪", valueEn: "100%", labelFa: "مالکیت کد و حریم خصوصی داده‌ها", labelEn: "Proprietary IP & Data Privacy" },
      { valueFa: "مقیاس‌پذیر", valueEn: "Scalable", labelFa: "قابلیت پشتیبانی از میلیون‌ها تراکنش", labelEn: "Engineered for Massive Concurrency" },
    ],
    relatedLinks: [
      { titleFa: "مشاهده سامانه‌های طراحی‌شده", titleEn: "Software Portfolio", href: "/portfolio?category=coding", type: "portfolio" },
      { titleFa: "طراحی سایت و وب‌اپلیکیشن", titleEn: "Web Engineering", href: "#web-development", type: "service" },
      { titleFa: "اتوماسیون فرآیندها و CRM", titleEn: "CRM & Systems", href: "#crm-automation", type: "service" },
    ],
    ctaLabelFa: "مشاوره فنی پروژه نرم‌افزاری",
    ctaLabelEn: "Schedule Technical Architecture Scoping",
    badgeAccentFa: "سامانه‌های سفارشی سازمانی",
    badgeAccentEn: "Enterprise Systems",
  },
];

const SLUG_ALIASES: Record<string, string> = {
  "web-design": "web-development",
  "web_design": "web-development",
  "web-development": "web-development",
  "web_development": "web-development",
  "website": "web-development",
  "seo-optimization": "technical-seo",
  "seo_optimization": "technical-seo",
  "seo": "technical-seo",
  "technical-seo": "technical-seo",
  "social-media": "social-identity",
  "social_media": "social-identity",
  "social-identity": "social-identity",
  "instagram": "social-identity",
  "studio-production": "studio-production",
  "videography": "studio-production",
  "video-production": "studio-production",
  "motion-design": "animation-motion",
  "motion_design": "animation-motion",
  "animation-motion": "animation-motion",
  "animation": "animation-motion",
  "crm": "crm-automation",
  "crm-automation": "crm-automation",
  "custom-software": "custom-software",
  "programming": "custom-software",
  "software-development": "custom-software",
};

/**
 * Merges published database services from the CMS API with presentation metadata.
 * Ensures:
 * 1. Database content strictly takes precedence over fallback text.
 * 2. Visual layout styles, icons, and compositions are preserved seamlessly.
 * 3. Graceful fallback occurs if the API fails or returns no published records.
 * 4. Fallback vs. live CMS status is clearly distinguished via isFromDatabase and isLiveCMS.
 * 5. Exactly the 7 approved core services are returned in canonical order.
 */
export function mergeServicesWithDatabase(dbServices: ServiceData[] | null | undefined): {
  services: ServiceDetailItem[];
  isLiveCMS: boolean;
} {
  const published = Array.isArray(dbServices)
    ? dbServices.filter((s) => s.isPublished !== false && s.status !== "DRAFT" && s.status !== "ARCHIVED")
    : [];

  if (published.length === 0) {
    // Graceful fallback to static presentation metadata when API is unreachable or empty
    return {
      services: DETAILED_SERVICES_DATA.map((item) => ({ ...item, isFromDatabase: false })),
      isLiveCMS: false,
    };
  }

  let hasAnyDbMatch = false;

  // Map canonical services with DB overrides strictly taking precedence
  const mergedCanonical: ServiceDetailItem[] = DETAILED_SERVICES_DATA.map((fallback) => {
    const match = published.find((s) => {
      if (!s.slug) return false;
      const clean = s.slug.trim().toLowerCase();
      const mapped = SLUG_ALIASES[clean] || clean;
      return (
        mapped === fallback.id ||
        clean === fallback.id.toLowerCase() ||
        clean === fallback.id.replace(/-/g, "_").toLowerCase()
      );
    });

    if (!match) {
      return { ...fallback, isFromDatabase: false };
    }

    hasAnyDbMatch = true;

    // Subservices mapping from database
    let mappedSubservices = fallback.subservices;
    if (match.subservices && Array.isArray(match.subservices) && match.subservices.length > 0) {
      mappedSubservices = match.subservices.map((sub: any) => ({
        nameFa: sub.nameFa || sub.titleFa || "",
        nameEn: sub.nameEn || sub.titleEn || "",
        descFa: sub.descFa || sub.descriptionFa || "",
        descEn: sub.descEn || sub.descriptionEn || "",
        deliverablesFa: Array.isArray(sub.deliverablesFa) ? sub.deliverablesFa : [],
        deliverablesEn: Array.isArray(sub.deliverablesEn) ? sub.deliverablesEn : [],
      }));
    }

    // Metrics mapping from database
    let mappedMetrics = fallback.metrics;
    if (match.metrics && Array.isArray(match.metrics) && match.metrics.length > 0) {
      mappedMetrics = match.metrics.map((m: any) => ({
        valueFa: m.valueFa || "",
        valueEn: m.valueEn || "",
        labelFa: m.labelFa || "",
        labelEn: m.labelEn || "",
      }));
    } else if (match.kpiMetrics && Array.isArray(match.kpiMetrics) && match.kpiMetrics.length > 0) {
      mappedMetrics = match.kpiMetrics.map((m: any) => ({
        valueFa: m.valueFa || "",
        valueEn: m.valueEn || "",
        labelFa: m.labelFa || "",
        labelEn: m.labelEn || "",
      }));
    }

    return {
      id: fallback.id,
      index: fallback.index,
      numStrFa: fallback.numStrFa,
      numStrEn: fallback.numStrEn,
      iconType: (match.iconType as any) || fallback.iconType,
      tagFa: match.tagFa || fallback.tagFa,
      tagEn: match.tagEn || fallback.tagEn,
      titleFa: match.title || fallback.titleFa,
      titleEn: match.titleEn || fallback.titleEn,
      headlineFa: match.headlineFa || fallback.headlineFa,
      headlineEn: match.headlineEn || fallback.headlineEn,
      descriptionFa: match.subtitle || match.detailedNarrativeFa || fallback.descriptionFa,
      descriptionEn: match.subtitleEn || match.detailedNarrativeEn || fallback.descriptionEn,
      detailedNarrativeFa: match.detailedNarrativeFa || fallback.detailedNarrativeFa,
      detailedNarrativeEn: match.detailedNarrativeEn || fallback.detailedNarrativeEn,
      businessValueTitleFa: match.businessValueTitleFa || fallback.businessValueTitleFa,
      businessValueTitleEn: match.businessValueTitleEn || fallback.businessValueTitleEn,
      businessValueFa: match.businessValueFa || fallback.businessValueFa,
      businessValueEn: match.businessValueEn || fallback.businessValueEn,
      image: match.coverImage || match.imageUrl || fallback.image,
      subservices: mappedSubservices,
      metrics: mappedMetrics,
      relatedLinks:
        Array.isArray(match.relatedLinks) && match.relatedLinks.length > 0
          ? match.relatedLinks
          : fallback.relatedLinks,
      ctaLabelFa: match.ctaLabelFa || fallback.ctaLabelFa,
      ctaLabelEn: match.ctaLabelEn || fallback.ctaLabelEn,
      badgeAccentFa: match.badgeAccentFa || fallback.badgeAccentFa,
      badgeAccentEn: match.badgeAccentEn || fallback.badgeAccentEn,
      isFromDatabase: true,
    };
  });

  return {
    services: mergedCanonical,
    isLiveCMS: hasAnyDbMatch,
  };
}
