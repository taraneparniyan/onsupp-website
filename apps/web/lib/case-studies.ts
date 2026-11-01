// ─── Shared Case Study Types & Canonical Data ───────────────────────────────

export type CaseStudyItem = {
  id: string;
  slug: string;
  client: string;
  clientEn: string;
  titleFa: string;
  titleEn: string;
  taglineFa: string;
  taglineEn: string;
  categoryFa: string;
  categoryEn: string;
  servicesFa: string[];
  servicesEn: string[];
  metricsFa: { value: string; label: string }[];
  metricsEn: { value: string; label: string }[];
  colorGradient: string;
  accentColor: string;
  glowColor: string;
  previewType: "mobile" | "web" | "platform";
  projectType?: string;
  liveUrl?: string;
  featured?: boolean;
  position?: number;
};

export const SHOWCASE_PROJECTS: CaseStudyItem[] = [
  {
    id: "medlink",
    slug: "medlink-telemetry",
    client: "سامانه سلامت مد‌لینک",
    clientEn: "MedLink Health",
    titleFa: "تله‌متری زنده و مدیریت هوشمند بیماران بالینی",
    titleEn: "Real-time Telemetry & Clinical Patient Monitoring",
    taglineFa: "طراحی و توسعه اپلیکیشن موبایل مانیتورینگ مراکز درمانی با پردازش داده‌های حیاتی و اعلان بلادرنگ",
    taglineEn: "Mobile platform for clinical monitoring with real-time vital sign streaming and alert notifications",
    categoryFa: "هلث‌تک و سامانه‌های حیاتی",
    categoryEn: "HealthTech & Telemetry",
    servicesFa: ["طراحی محصول و دیزاین سیستم", "توسعه React Native و iOS", "معماری سوکت و کلود بلادرنگ"],
    servicesEn: ["Product UX & Design System", "React Native & iOS Engineering", "Real-time WebSocket & Cloud"],
    metricsFa: [
      { value: "۹۹.۹٪", label: "پایداری ارتباط داده" },
      { value: "آنلاین", label: "پایش بلادرنگ علائم" },
      { value: "-۴۵٪", label: "کاهش زمان اعلام هشدار" },
    ],
    metricsEn: [
      { value: "99.9%", label: "Stream Reliability" },
      { value: "Live", label: "Real-time Monitoring" },
      { value: "-45%", label: "Alert Response Lag" },
    ],
    colorGradient: "from-[#081926] via-[#0b2438] to-[#040e17]",
    accentColor: "#38bdf8",
    glowColor: "rgba(56, 189, 248, 0.18)",
    previewType: "mobile",
    liveUrl: "/case-studies",
    featured: true,
    position: 1,
  },
  {
    id: "finalytix",
    slug: "finalytix-wealth",
    client: "فاینالیتیکس اینترپرایز",
    clientEn: "Finalytix Enterprise",
    titleFa: "پلتفرم تحلیلی هوش مالی و مدیریت پورتفوی سازمانی",
    titleEn: "Financial Analytics & Portfolio Management Platform",
    taglineFa: "طراحی و پیاده‌سازی داشبورد مالی و گزارش‌گیری تحلیلی برای پایش یکپارچه دارایی‌ها با معماری Next.js",
    taglineEn: "Designing and engineering a multi-asset financial analytics dashboard and reporting suite with Next.js",
    categoryFa: "فین‌تک و داشبورد تحلیلی",
    categoryEn: "FinTech & Analytics",
    servicesFa: ["معماری Next.js و React 19", "طراحی UI/UX داده‌محور و دارک", "گزارش‌گیری و مصورسازی داده"],
    servicesEn: ["Next.js & React 19 Stack", "Data-dense Dark UI/UX", "Interactive Data Visualization"],
    metricsFa: [
      { value: "۰.۴s", label: "سرعت بارگذاری داشبورد" },
      { value: "یکپارچه", label: "گزارش‌گیری چندمنظوره" },
      { value: "امن", label: "کنترل دسترسی سطح‌بندی‌شده" },
    ],
    metricsEn: [
      { value: "0.4s", label: "Dashboard Load Time" },
      { value: "Unified", label: "Multi-asset Reporting" },
      { value: "RBAC", label: "Role-based Access Control" },
    ],
    colorGradient: "from-[#0b1b14] via-[#0e271c] to-[#050f0b]",
    accentColor: "#b2f800",
    glowColor: "rgba(178, 248, 0, 0.18)",
    previewType: "web",
    liveUrl: "/case-studies",
    featured: true,
    position: 2,
  },
  {
    id: "novaservice",
    slug: "nova-mobility",
    client: "اکوسیستم نوا سرویس",
    clientEn: "Nova Ecosystem",
    titleFa: "اتوماسیون خدمات پس از فروش و مدیریت اعزام تکنسین",
    titleEn: "After-Sales Service Automation & Field Dispatch System",
    taglineFa: "یکپارچه‌سازی فرآیند ثبت درخواست مشتری، تخصیص هوشمند تکنسین و پیگیری وضعیت سفارش در لحظه",
    taglineEn: "Streamlining customer service requests, technician dispatch, and live order status tracking",
    categoryFa: "لجستیک و اتوماسیون خدمات",
    categoryEn: "Logistics & Field Service",
    servicesFa: ["استراتژی محصول و طراحی فرآیند", "اپلیکیشن مشتری و پنل تکنسین", "اتصال به CRM و پایپ‌لاین خدمات"],
    servicesEn: ["Product & Workflow Design", "Dual Customer & Fleet Apps", "CRM & Service Integration"],
    metricsFa: [
      { value: "هوشمند", label: "تخصیص و مسیریابی اعزام" },
      { value: "-۴۰٪", label: "کاهش زمان هماهنگی تلفنی" },
      { value: "۲۴/۷", label: "ثبت و پیگیری آنلاین درخواست" },
    ],
    metricsEn: [
      { value: "Smart", label: "Automated Dispatching" },
      { value: "-40%", label: "Manual Coordination Time" },
      { value: "24/7", label: "Online Request Tracking" },
    ],
    colorGradient: "from-[#1b0d26] via-[#231032] to-[#0d0514]",
    accentColor: "#c084fc",
    glowColor: "rgba(192, 132, 252, 0.18)",
    previewType: "platform",
    liveUrl: "/case-studies",
    featured: true,
    position: 3,
  },
  {
    id: "arvandcloud",
    slug: "arvand-edge-mesh",
    client: "زیرساخت ابری اروند",
    clientEn: "Arvand Cloud",
    titleFa: "پنل مدیریت زیرساخت ابری و مانیتورینگ سرویس‌ها",
    titleEn: "Cloud Infrastructure Management & Telemetry Portal",
    taglineFa: "طراحی کنسول مدیریت منابع ابری و پایش سلامت سرویس‌ها با معماری میکروسرویس و بهینه‌سازی مصرف منابع",
    taglineEn: "Engineering a cloud resource console and service health telemetry portal with microservice architecture",
    categoryFa: "کلود و زیرساخت نرم‌افزاری",
    categoryEn: "Cloud & Infrastructure",
    servicesFa: ["معماری کلاود و دواپس", "پنل مدیریت کانتینر و سرور", "مانیتورینگ و هشداردهی سرویس"],
    servicesEn: ["Cloud DevOps Architecture", "Resource Management Console", "Service Health Telemetry"],
    metricsFa: [
      { value: "۹۹.۹٪", label: "پایداری سرویس‌های کلاستر" },
      { value: "خودکار", label: "مقیاس‌پذیری منابع پردازشی" },
      { value: "-۳۵٪", label: "بهینه‌سازی مصرف سرور" },
    ],
    metricsEn: [
      { value: "99.9%", label: "Cluster Availability" },
      { value: "Auto", label: "Resource Autoscaling" },
      { value: "-35%", label: "Server Resource Overhead" },
    ],
    colorGradient: "from-[#061e1b] via-[#092925] to-[#041210]",
    accentColor: "#34d399",
    glowColor: "rgba(52, 211, 153, 0.18)",
    previewType: "web",
    liveUrl: "/case-studies",
    featured: true,
    position: 4,
  },
  {
    id: "karanai",
    slug: "karan-voice-engine",
    client: "هوش صوتی کاران",
    clientEn: "Karan Neural Voice",
    titleFa: "دستیار صوتی هوشمند و تبدیل گفتار به متن فارسی",
    titleEn: "Persian Speech-to-Text & Conversational Voice Assistant",
    taglineFa: "توسعه رابط کاربری و وب‌سرویس پردازش گفتار به متن برای مستندسازی تماس‌ها و دستیار مراکز ارتباطی",
    taglineEn: "Developing a speech-to-text web service and interface for call documentation and support centers",
    categoryFa: "هوش مصنوعی و پردازش زبان",
    categoryEn: "AI & Speech Processing",
    servicesFa: ["یادگیری عمیق و پردازش گفتار", "رابط کاربری استودیو صوتی", "یکپارچه‌سازی با مراکز تماس"],
    servicesEn: ["Speech Processing Models", "Voice Studio Web Interface", "Call Center API Integration"],
    metricsFa: [
      { value: "بلادرنگ", label: "تبدیل جریان صوت به متن" },
      { value: "REST/WS", label: "وب‌سرویس اتصال سازمانی" },
      { value: "فارسی", label: "پشتیبانی از محاوره و متن" },
    ],
    metricsEn: [
      { value: "Streaming", label: "Live Speech-to-Text" },
      { value: "REST/WS", label: "Enterprise API Ready" },
      { value: "Persian", label: "Colloquial & Formal NLP" },
    ],
    colorGradient: "from-[#221606] via-[#2f1f09] to-[#120b03]",
    accentColor: "#f59e0b",
    glowColor: "rgba(245, 158, 11, 0.18)",
    previewType: "platform",
    liveUrl: "/case-studies",
    featured: true,
    position: 5,
  },
];

export const MAX_HOMEPAGE_FEATURED_PROJECTS = 5;

/**
 * Returns projects designated for the homepage showcase strip,
 * strictly capped to MAX_HOMEPAGE_FEATURED_PROJECTS (5).
 */
export function getFeaturedCaseStudies(projects: CaseStudyItem[] = SHOWCASE_PROJECTS): CaseStudyItem[] {
  return projects
    .filter((p) => p.featured !== false)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .slice(0, MAX_HOMEPAGE_FEATURED_PROJECTS);
}

/**
 * Returns all portfolio projects for the archive page.
 */
export function getAllCaseStudies(projects: CaseStudyItem[] = SHOWCASE_PROJECTS): CaseStudyItem[] {
  return [...projects].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}
