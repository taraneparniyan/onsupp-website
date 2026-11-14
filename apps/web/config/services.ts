export type ServiceRelatedLink = {
  titleFa: string;
  titleEn: string;
  href: string;
};

export type ServiceCategory = {
  id: string;
  tagFa: string;
  tagEn: string;
  titleFa: string;
  titleEn: string;
  href: string;
  descriptionFa: string;
  descriptionEn: string;
  subservicesFa: string[];
  subservicesEn: string[];
  relatedLinks: ServiceRelatedLink[];
  iconType: "social" | "studio" | "motion" | "web" | "seo" | "crm" | "software";
};

export const SERVICES_MENU_ITEMS: ServiceCategory[] = [
  {
    id: "web-development",
    tagFa: "وب‌سایت",
    tagEn: "Web Design",
    titleFa: "طراحی سایت و وب‌اپلیکیشن",
    titleEn: "Custom Web Design & Apps",
    href: "/services?category=web-development",
    descriptionFa:
      "طراحی سیستم‌های دیزاین اختصاصی، رابط‌های کاربری چشم‌نواز و پیاده‌سازی مدرن فرانت‌اند و فول‌استک با Next.js و React منطبق با استانداردهای جهانی سرعت.",
    descriptionEn:
      "Bespoke design systems, engaging UI/UX experiences, and robust Next.js engineering built for top-tier performance, speed, and cross-device precision.",
    subservicesFa: [
      "طراحی رابط کاربری اختصاصی UI/UX",
      "کدنویسی استاندارد با Next.js و React",
      "بهینه‌سازی سرعت و Core Web Vitals",
    ],
    subservicesEn: [
      "Bespoke UI/UX Design Systems",
      "Modern Next.js & React Engineering",
      "Speed & Core Web Vitals Optimization",
    ],
    relatedLinks: [
      { titleFa: "سئو تکنیکال و رتبه‌بندی", titleEn: "Technical SEO", href: "/services?category=technical-seo" },
      { titleFa: "سامانه‌ها و پنل‌های اختصاصی", titleEn: "Custom Software", href: "/services?category=custom-software" },
      { titleFa: "مطالعات موردی پروژه‌ها", titleEn: "Case Studies", href: "/case-studies" },
    ],
    iconType: "web",
  },
  {
    id: "technical-seo",
    tagFa: "سئو",
    tagEn: "SEO Growth",
    titleFa: "سئو تکنیکال و رشد ارگانیک",
    titleEn: "Technical SEO & Organic Growth",
    href: "/services?category=technical-seo",
    descriptionFa:
      "آدیت عمیق معماری سایت، تصحیح خطاهای ایندکس، تحقیق هوشمندانه کلمات کلیدی و استراتژی ساختاریافته محتوا برای تثبیت رتبه‌های برتر در موتورهای جستجو.",
    descriptionEn:
      "Comprehensive architectural audits, Core Web Vitals optimization, semantic keyword research, and high-authority content strategies for compounding search growth.",
    subservicesFa: [
      "آدیت فنی و اصلاح ساختار سایت",
      "پژوهش کلمات کلیدی و تحلیل رقبا",
      "تدوین استراتژی محتوا و رتبه‌بندی",
    ],
    subservicesEn: [
      "Technical SEO Audits & Architecture",
      "Keyword Research & Competitor Analysis",
      "Content Strategy & Search Authority",
    ],
    relatedLinks: [
      { titleFa: "طراحی سایت و ساختار بهینه", titleEn: "Web Engineering", href: "/services?category=web-development" },
      { titleFa: "مقالات و وبلاگ آموزشی سئو", titleEn: "SEO Insights & Blog", href: "/blog" },
      { titleFa: "درخواست مشاوره سئو", titleEn: "SEO Consultation", href: "/#contact" },
    ],
    iconType: "seo",
  },
  {
    id: "social-identity",
    tagFa: "اینستاگرام",
    tagEn: "Instagram & Social",
    titleFa: "مدیریت اینستاگرام و هویت فضای مجازی",
    titleEn: "Instagram Marketing & Brand Identity",
    href: "/services?category=social-identity",
    descriptionFa:
      "طراحی هویت بصری منسجم، تدوین استراتژی برندینگ و مدیریت تعاملات شبکه‌های اجتماعی برای ارتقای تمایز و ماندگاری برند در ذهن مخاطب.",
    descriptionEn:
      "Cohesive visual identity, brand strategy design, and active social media management to maximize brand recall and organic audience engagement.",
    subservicesFa: [
      "طراحی برند و مدیریت استراتژی",
      "طراحی محتوای گرافیکی و سینمایی پویا",
      "مدیریت و کنترل صفحه مجازی",
    ],
    subservicesEn: [
      "Brand Design & Strategy Management",
      "Dynamic Graphic & Cinematic Content",
      "Social Page Management & Monitoring",
    ],
    relatedLinks: [
      { titleFa: "انیمیشن و موشن گرافیک", titleEn: "Animation & Motion", href: "/services?category=animation-motion" },
      { titleFa: "تصویربرداری و استودیو", titleEn: "Studio Production", href: "/services?category=studio-production" },
      { titleFa: "نمونه‌کارهای برندینگ", titleEn: "Branding Portfolio", href: "/#portfolio" },
    ],
    iconType: "social",
  },
  {
    id: "studio-production",
    tagFa: "فیلم‌برداری",
    tagEn: "Videography",
    titleFa: "فیلم‌برداری و تولیدات استودیو",
    titleEn: "Studio Production & Videography",
    href: "/services?category=studio-production",
    descriptionFa:
      "تولید تیزرهای تبلیغاتی، مستندهای صنعتی، استودیو پادکست و محتوای تعاملی با تجهیزات حرفه‌ای سینمایی و بالاترین استاندارد نورپردازی و صدا.",
    descriptionEn:
      "Cinematic commercial films, industrial documentaries, podcast recording, and interactive multimedia engineered with professional cinema-grade gear.",
    subservicesFa: [
      "تصویربرداری صنعتی و تبلیغاتی",
      "ساخت پادکست و محتوای بلند تعاملی",
      "تدوین و پست‌تولید",
    ],
    subservicesEn: [
      "Industrial & Commercial Cinematography",
      "Podcasts & Long-Form Interactive Media",
      "Editing & Post-Production",
    ],
    relatedLinks: [
      { titleFa: "مدیریت هویت مجازی", titleEn: "Social Identity", href: "/services?category=social-identity" },
      { titleFa: "جلوه‌های ویژه و انیمیشن", titleEn: "Visual Effects", href: "/services?category=animation-motion" },
      { titleFa: "آرشیو پروژه‌های ویدیویی", titleEn: "Video Portfolio", href: "/#portfolio" },
    ],
    iconType: "studio",
  },
  {
    id: "animation-motion",
    tagFa: "انیمیشن",
    tagEn: "Animation & Motion",
    titleFa: "انیمیشن و موشن گرافیک",
    titleEn: "Animation & Motion Graphics",
    href: "/services?category=animation-motion",
    descriptionFa:
      "خلق انیمیشن‌های دوبعدی و سه‌بعدی، جلوه‌های بصری سینمایی (VFX) و موشن‌گرافیک‌های تعاملی برای تفهیم سریع، خلاقانه و اثرگذار پیام کسب‌وکار.",
    descriptionEn:
      "2D & 3D animation, cutting-edge cinematic VFX, and interactive motion graphics designed to transform complex concepts into captivating visual stories.",
    subservicesFa: [
      "انیمیشن دوبعدی و سه‌بعدی",
      "جلوه‌های ویژه سینمایی",
      "موشن گرافیک صنعتی، آموزشی و تعاملی",
    ],
    subservicesEn: [
      "2D & 3D Animation",
      "Cinematic Visual Effects (VFX)",
      "Industrial, Educational & Interactive Motion",
    ],
    relatedLinks: [
      { titleFa: "استودیو و تصویربرداری", titleEn: "Studio Production", href: "/services?category=studio-production" },
      { titleFa: "طراحی وب و موشن اینترفیس", titleEn: "Web & UI Motion", href: "/services?category=web-development" },
      { titleFa: "مشاهده نمونه‌های موشن", titleEn: "Motion Portfolio", href: "/#portfolio" },
    ],
    iconType: "motion",
  },
  {
    id: "crm-automation",
    tagFa: "CRM",
    tagEn: "CRM Systems",
    titleFa: "استقرار CRM و اتوماسیون فروش",
    titleEn: "CRM Implementation & Automation",
    href: "/services?category=crm-automation",
    descriptionFa:
      "طراحی و سفارشی‌سازی پایپ‌لاین‌های فروش، اتوماسیون ثبت سرنخ‌ها و گزارش‌گیری تحلیلی برای افزایش بهره‌وری تیم‌های فروش و کاهش چرخه‌های بسته شدن قراردادها.",
    descriptionEn:
      "Tailored CRM configuration, multi-channel lead automation pipelines, and executive dashboards that accelerate sales velocity and customer retention.",
    subservicesFa: [
      "راه‌اندازی و سفارشی‌سازی اختصاصی CRM",
      "اتوماسیون ثبت و پیگیری سرنخ‌ها",
      "داشبوردهای شفاف گزارش‌گیری فروش",
    ],
    subservicesEn: [
      "Tailored CRM Setup & Configuration",
      "Automated Lead Pipelines & Workflows",
      "Sales Pipeline & Performance Dashboards",
    ],
    relatedLinks: [
      { titleFa: "سامانه‌ها و برنامه‌نویسی اختصاصی", titleEn: "Custom Software", href: "/services?category=custom-software" },
      { titleFa: "تعرفه‌ها و بسته‌های خدمات", titleEn: "Pricing & Plans", href: "/pricing" },
      { titleFa: "درخواست دمو و مشاوره", titleEn: "Request CRM Demo", href: "/#contact" },
    ],
    iconType: "crm",
  },
  {
    id: "custom-software",
    tagFa: "برنامه‌نویسی",
    tagEn: "Custom Software",
    titleFa: "برنامه‌نویسی و سامانه‌های اختصاصی",
    titleEn: "Custom Software & Web Systems",
    href: "/services?category=custom-software",
    descriptionFa:
      "طراحی و توسعه سامانه‌های تحت وب مقیاس‌پذیر، پرتال‌های مدیریتی، دیتابیس‌های ابری و معماری API اختصاصی متناسب با فرآیندهای منحصربه‌فرد هر کسب‌وکار.",
    descriptionEn:
      "Scalable web applications, internal enterprise portals, secure PostgreSQL architectures, and custom API microservices tailored to mission-critical operations.",
    subservicesFa: [
      "توسعه فول‌استک اختصاصی و مقیاس‌پذیر",
      "طراحی ساختار دیتابیس و پنل مدیریتی",
      "اتصال امن به APIها و سرویس‌های بیرونی",
    ],
    subservicesEn: [
      "Scalable Full-Stack Web Systems",
      "Database & Admin Portal Architecture",
      "Secure Third-Party API Integrations",
    ],
    relatedLinks: [
      { titleFa: "طراحی سایت و وب‌اپلیکیشن", titleEn: "Web Development", href: "/services?category=web-development" },
      { titleFa: "اتوماسیون فرآیندها و CRM", titleEn: "CRM & Automations", href: "/services?category=crm-automation" },
      { titleFa: "مشاوره فنی پروژه نرم‌افزاری", titleEn: "Software Scoping Call", href: "/#contact" },
    ],
    iconType: "software",
  },
];
