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
  image?: string;
  secondaryImage?: string;
  projectType?: string;
  liveUrl?: string;
  featured?: boolean;
  position?: number;
  year?: string;
  challengeFa?: string;
  challengeEn?: string;
  solutionFa?: string;
  solutionEn?: string;
  deliverablesFa?: string[];
  deliverablesEn?: string[];
};

export const SHOWCASE_PROJECTS: CaseStudyItem[] = [
  {
    id: "miresmaeli",
    slug: "dr-miresmaeli-clinic",
    client: "کلینیک تخصصی دکتر علیرضا میراسماعیلی",
    clientEn: "Dr. Alireza Miresmaili Clinic",
    titleFa: "برندینگ دیجیتال، پرتال نوبت‌دهی و هویت شبکه‌های اجتماعی",
    titleEn: "Digital Branding, Booking Portal & Social Identity",
    taglineFa: "تدوین هویت بصری منسجم، طراحی وب‌سایت پرفورمنس‌محور و سناریونویسی و تولید محتوای تخصصی اینستاگرام",
    taglineEn: "Comprehensive medical practice rebranding, high-performance web booking portal, and social growth strategy",
    categoryFa: "هویت دیجیتال و توسعه وب",
    categoryEn: "Digital Identity & Web",
    servicesFa: ["طراحی وب‌سایت و پرتال رزرو", "هویت برند و هویت بصری", "تولید محتوا و مدیریت اینستاگرام"],
    servicesEn: ["Web Portal & Booking System", "Medical Visual Identity", "Content Production & Instagram"],
    metricsFa: [
      { value: "+۱۸۰٪", label: "افزایش جذب مراجعین آنلاین" },
      { value: "۱۰۰٪", label: "نوبت‌دهی خودکار بدون تماس" },
      { value: "۴K", label: "کیفیت محتوای استودیویی" },
    ],
    metricsEn: [
      { value: "+180%", label: "Online Patient Inquiries" },
      { value: "100%", label: "Automated Self-Booking" },
      { value: "4K", label: "Studio Production Grade" },
    ],
    colorGradient: "from-[#1a1315] via-[#241a1e] to-[#100b0d]",
    accentColor: "#D4A5A8",
    glowColor: "rgba(212, 165, 168, 0.2)",
    previewType: "web",
    image: "/images/portfolio/dr-miresmaeli-clinic-hero.webp",
    secondaryImage: "/images/portfolio/dr-miresmaeli-clinic-full.webp",
    liveUrl: "https://drmiresmaeli.com/",
    featured: true,
    position: 1,
    year: "۲۰۲۴",
    challengeFa: "ناهماهنگی در هویت بصری، هدررفت زمان پرسنل مطب در پاسخگویی تلفنی به مراجعین و عدم وجود پرتال رسمی برای معرفی خدمات زیبایی تخصصی.",
    challengeEn: "Disjointed clinic visual branding and heavy phone consultation load preventing streamlined patient intake.",
    solutionFa: "طراحی پرتال مدرن با سرعت بارگذاری فوق‌العاده و اتصال مستقیم سیستم نوبت‌دهی پیامکی در کنار سناریونویسی و تصویربرداری حرفه‌ای استودیویی.",
    solutionEn: "Delivered a refined clinical editorial web presence with integrated automated SMS booking and cinema-grade studio social reels.",
    deliverablesFa: ["پرتال اینترنتی رزرو و گالری قبل و بعد", "هویت بصری لوکس و پالت رنگی پزشکی", "پکیج ویدیوهای آموزشی و هایلایت‌های اینستاگرام"],
    deliverablesEn: ["Web Booking & Case Gallery Portal", "Medical Visual Identity Kit", "4K Studio Video Production & Instagram Grid"],
  },
  {
    id: "canza",
    slug: "canza-construction",
    client: "شرکت ساختمانی کنزا",
    clientEn: "Canza Construction Ltd.",
    titleFa: "پرتال جامع خدمات ساختمانی و بازسازی لوکس کانادا",
    titleEn: "High-End Architectural & Construction Portal (Canada)",
    taglineFa: "طراحی وب‌سایت مدرن با معماری ریسپانسیو، سیستم برآورد آنلاین بودجه و گالری تعاملی پروژه‌های لوکس ونکوور",
    taglineEn: "Modern architectural engineering portfolio, online budget estimator, and high-performance showcase in Canada",
    categoryFa: "طراحی سایت و پرتال ساختمانی",
    categoryEn: "Web Design & Architecture",
    servicesFa: ["طراحی وب‌سایت اختصاصی و سئو بین‌المللی", "سیستم محاسبه آنلاین برآورد هزینه", "هویت برند و هویت بصری لوکس"],
    servicesEn: ["Bespoke Web Design & North America SEO", "Online Cost Estimator Architecture", "Luxury Architectural Visual Identity"],
    metricsFa: [
      { value: "+۱۴۰٪", label: "افزایش لیدهای دریافتی کانادا" },
      { value: "۰.۳s", label: "لود بهینه در آمریکای شمالی" },
      { value: "۱۰۰٪", label: "ریسپانسیو و محاسبه‌گر برخط" },
    ],
    metricsEn: [
      { value: "+140%", label: "North American Inquiries" },
      { value: "0.3s", label: "Global Edge Load Time" },
      { value: "100%", label: "Online Estimate Tool" },
    ],
    colorGradient: "from-[#1c180e] via-[#2a2211] to-[#0e0c06]",
    accentColor: "#C59B27",
    glowColor: "rgba(197, 155, 39, 0.22)",
    previewType: "web",
    image: "/images/portfolio/canza-construction-hero.webp",
    secondaryImage: "/images/portfolio/canza-construction-full.webp",
    liveUrl: "https://canzaconstruction.ca/",
    featured: true,
    position: 2,
    year: "۲۰۲۵",
    challengeFa: "چالش اصلی شرکت ساختمانی کنزا، نیاز به معرفی پروژه‌های بازسازی و ساختمانی لوکس در بازار رقابتی ونکوور کانادا و فراهم‌سازی ابزاری شفاف برای محاسبه آنلاین هزینه بازسازی توسط مشتریان بود.",
    challengeEn: "The challenge was presenting luxury renovation craftsmanship in Vancouver's high-standard market with a transparent real-time estimate calculator.",
    solutionFa: "طراحی پرتال بسیار سریع بر بستر کلود با گالری عکاسی باکیفیت پروژه‌ها، فرم هوشمند مرحله‌به‌مرحله تخمین بودجه ساخت و سئوی ساختاریافته برای بازار آمریکای شمالی.",
    solutionEn: "Engineered a rapid Cloudflare-backed web presence featuring an interactive cost estimation funnel and localized SEO architecture for Canadian homeowners.",
    deliverablesFa: ["پرتال اینترنتی با معماری واکنش‌گرا و سریع", "ماژول محاسبه‌گر آنلاین هزینه بازسازی", "بهینه‌سازی Core Web Vitals و سئو در آمریکای شمالی"],
    deliverablesEn: ["Responsive Architectural Web Platform", "Multi-Step Online Renovation Estimator", "North American SEO & Core Web Vitals Optimization"],
  },
  {
    id: "dr-hatam",
    slug: "dr-hatam-clinic",
    client: "کلینیک تخصصی دکتر سپنتا حاتم",
    clientEn: "Dr. Sepanta Hatam Clinic",
    titleFa: "پرتال جامع طب فیزیکی، توان‌بخشی و نوبت‌دهی آنلاین",
    titleEn: "Physical Medicine & Rehabilitation Clinical Portal",
    taglineFa: "طراحی وب‌سایت پزشکی و پرتال نوبت‌دهی، معرفی متدهای درمانی ستون فقرات و استراتژی رشد سئو بالینی",
    taglineEn: "High-performance clinical portal, automated patient booking, and physical therapy SEO architecture",
    categoryFa: "پرتال پزشکی و نوبت‌دهی آنلاین",
    categoryEn: "Medical Portal & Booking",
    servicesFa: ["طراحی پرتال پزشکی و رزرو آنلاین", "سئو تکنیکال و رتبه‌بندی مقالات درمان", "هویت بصری و برندینگ بالینی"],
    servicesEn: ["Medical Web Portal & Patient Booking", "Clinical Technical SEO & Growth", "Healthcare Visual Branding"],
    metricsFa: [
      { value: "+۲۱۰٪", label: "رشد ترافیک ارگانیک گوگل" },
      { value: "آنلاین", label: "سیستم رزرواسیون بیماران" },
      { value: "۹۹٪", label: "رضایت مراجعین از سهولت پرتال" },
    ],
    metricsEn: [
      { value: "+210%", label: "Organic Search Growth" },
      { value: "Live", label: "Automated Patient Booking" },
      { value: "99%", label: "Patient User Satisfaction" },
    ],
    colorGradient: "from-[#1b1417] via-[#261a20] to-[#0e0a0c]",
    accentColor: "#E07A8B",
    glowColor: "rgba(224, 122, 139, 0.2)",
    previewType: "web",
    image: "/images/portfolio/dr-hatam-clinic-hero.webp",
    secondaryImage: "/images/portfolio/dr-hatam-clinic-full.webp",
    liveUrl: "https://dr-hatam.com/",
    featured: true,
    position: 3,
    year: "۲۰۲۵",
    challengeFa: "نیاز مراجعین به دسترسی سریع به رزرو ویزیت، توضیح دقیق درمان‌های غیرجراحی دیسک و ستون فقرات، و ترافیک بالای تماس‌های تلفنی مطب طب فیزیکی.",
    challengeEn: "High patient intake call volumes and the necessity of clearly educating visitors on non-surgical spine and rehabilitation procedures.",
    solutionFa: "توسعه پرتال بالینی با ناوبری ساده، نوبت‌دهی مکانیزه، پایگاه دانش جامع درمان‌های توان‌بخشی و بهینه‌سازی کلمات کلیدی پزشکی در گوگل.",
    solutionEn: "Delivered an accessible medical portal with automated appointment self-scheduling and an extensive rehabilitation clinical knowledge base.",
    deliverablesFa: ["پرتال جامع معرفی خدمات طب فیزیکی و توان‌بخشی", "سیستم رزرو آنلاین نوبت و پرونده الکترونیک", "استراتژی سئو محتوایی برای کلمات کلیدی درد و درمان"],
    deliverablesEn: ["Rehabilitation & Physical Medicine Web Portal", "Automated Online Consultation Scheduler", "Clinical Content Strategy & High-Ranking Medical SEO"],
  },
  {
    id: "shin",
    slug: "shin-beauty-center",
    client: "مرکز زیبایی و لیزر شین",
    clientEn: "Shin Beauty Center",
    titleFa: "پلتفرم اختصاصی خدمات پوست، مو، زیبایی و رزرواسیون هوشمند",
    titleEn: "Luxury Aesthetic Clinic & Smart Booking Portal",
    taglineFa: "طراحی وب‌سایت کلینیکال با هویت بصری پریمیوم، معرفی تعرفه‌ها و سیستم رزرواسیون و مشاوره رایگان",
    taglineEn: "Premium aesthetic clinic platform, real-time consultation booking, and beauty service catalogue",
    categoryFa: "طراحی وب و هویت بصری کلینیک",
    categoryEn: "Aesthetic & Clinic Web",
    servicesFa: ["طراحی پرتال خدمات زیبایی و لیزر", "یکپارچه‌سازی درگاه و رزرواسیون مشاوره", "هویت بصری و تولید محتوای دیجیتال"],
    servicesEn: ["Aesthetic & Laser Service Web Portal", "Automated Booking & Consultation Funnel", "Visual Identity & Social Digital Content"],
    metricsFa: [
      { value: "+۱۶۵٪", label: "افزایش ثبت رزروهای برخط" },
      { value: "۴ شعبه", label: "مدیریت یکپارچه خدمات و تعرفه‌ها" },
      { value: "۱۰۰٪", label: "یکپارچگی پرداخت و رزرواسیون" },
    ],
    metricsEn: [
      { value: "+165%", label: "Online Appointment Surge" },
      { value: "Multi-Clinic", label: "Branch Services Management" },
      { value: "100%", label: "Booking & Payment Flow" },
    ],
    colorGradient: "from-[#1d1912] via-[#292318] to-[#100d08]",
    accentColor: "#E5A93C",
    glowColor: "rgba(229, 169, 60, 0.2)",
    previewType: "web",
    image: "/images/portfolio/shin-beauty-center-hero.webp",
    secondaryImage: "/images/portfolio/shin-beauty-center-full.webp",
    liveUrl: "https://shinbeautycenter.com/",
    featured: true,
    position: 4,
    year: "۲۰۲۴",
    challengeFa: "تراکم بالای خدمات متنوع پوستی، لیزر و زیبایی و نیاز به ایجاد یک بستر دیجیتال لوکس با قابلیت مشاهده شفاف تعرفه‌ها و انتخاب پزشک توسط زیباجویان.",
    challengeEn: "Navigating diverse aesthetic treatments with transparent pricing and direct practitioner scheduling in a luxury branded experience.",
    solutionFa: "طراحی پرتال مدرن با پالت رنگی گرم و طلایی، ناوبری شناور شیشه‌ای، کاتالوگ تعاملی پکیج‌های درمانی و سامانه ثبت نوبت مشاوره رایگان.",
    solutionEn: "Crafted an elegant editorial web application with floating glass navigation, interactive treatment catalogs, and direct inquiry automation.",
    deliverablesFa: ["پرتال اختصاصی مرکز زیبایی با طراحی مینیمال و شیک", "کاتالوگ آنلاین تعرفه‌ها، خدمات پوست و لیزر", "فرم رزرو نوبت هوشمند با اتصال به پشتیبانی"],
    deliverablesEn: ["Aesthetic Clinic Brand Portal with Modern UI", "Interactive Pricing & Treatment Catalogue", "Smart Consultation Intake & Booking Funnel"],
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
    servicesFa: ["معماری Next.js و React 19", "طراحی UI/UX داده‌محور", "گزارش‌گیری و مصورسازی داده"],
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
    image: "/case_study_2.jpg",
    secondaryImage: "/images/services/custom-software.webp",
    liveUrl: "/portfolio/finalytix-wealth",
    featured: true,
    position: 5,
    year: "۲۰۲۵",
    challengeFa: "پردازش هم‌زمان هزاران ردیف تراکنش بانکی و سرمایه‌گذاری با حجم بالای دیتا بدون کندی رندر صفحات مرورگر مدیران مالی.",
    challengeEn: "Handling heavy multi-currency financial records without client-side render stalls or query performance degradation.",
    solutionFa: "طراحی کامپوننت‌های رندر بهینه‌شده سمت سرور با Next.js و نمودارهای Canvas سخت‌افزاری که زمان بارگذاری گزارش‌ها را به زیر ۰.۴ ثانیه رساند.",
    solutionEn: "Developed server-driven streaming components with GPU-accelerated canvas charts achieving instant sub-second report generation.",
    deliverablesFa: ["داشبورد تحلیل دارایی‌های چندارزی", "سیستم خروجی گزارش‌های تحلیلی PDF/Excel", "پنل مدیریت دسترسی‌های چندسطحی"],
    deliverablesEn: ["Multi-Asset Treasury Dashboard", "Instant Analytical Report Exporter", "Multi-Tenant RBAC Security Module"],
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
    image: "/images/services/crm-automation.webp",
    secondaryImage: "/case_study_1.jpg",
    liveUrl: "/portfolio/nova-mobility",
    featured: true,
    position: 6,
    year: "۲۰۲۴",
    challengeFa: "پیگیری دستی هزاران درخواست سرویس دوره‌ای در روز و خطاهای انسانی در ثبت فاکتورهای خدمات سیار و زمان‌بندی نامناسب تکنسین‌ها.",
    challengeEn: "Manual coordination friction between customer call centers and field service technicians across metropolitan coverage areas.",
    solutionFa: "ایجاد سیستم اتوماسیون جامع ثبت سفارش برخط با تخصیص خودکار نزدیک‌ترین تکنسین بر اساس نقشه شهری و پیگیری آنلاین توسط مشتری.",
    solutionEn: "Architected a geo-intelligent dispatcher routing tickets directly to field engineers with live SMS customer tracking.",
    deliverablesFa: ["سامانه تحت وب ثبت و رهگیری درخواست مشتری", "اپلیکیشن اختصاصی تکنسین‌های میدانی", "داشبورد مرکزی کنترل عملیات ناوگان"],
    deliverablesEn: ["Customer Web Dispatching & Tracking", "Technician Mobile Companion App", "Operations Control Center Console"],
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
    image: "/images/services/custom-software.webp",
    secondaryImage: "/case_study_2.jpg",
    liveUrl: "/portfolio/arvand-edge-mesh",
    featured: true,
    position: 7,
    year: "۲۰۲۴",
    challengeFa: "پیچیدگی بالای کانفیگ سرورها و ماشین‌های مجازی ابری برای تیم‌های فنی و کمبود رابط کاربری یکپارچه برای مانیتورینگ بلادرنگ منابع.",
    challengeEn: "Complex multi-cloud topology requiring a clean unified single-pane-of-glass console for server provisioning.",
    solutionFa: "طراحی داشبورد مهندسی با تایپوگرافی مونو، نمایش گرافیکی کانتینرها، نمودارهای نرخ مصرف پردازنده و لاگ‌های سرور بلادرنگ.",
    solutionEn: "Built a reactive dark console featuring low-latency cluster graphs, container lifecycle controls, and live audit telemetry.",
    deliverablesFa: ["کنسول ابری مدیریت ماشین‌های مجازی", "ماژول هشداردهی وضعیت بار پردازشی", "معماری احراز هویت سازمانی OAuth2/SAML"],
    deliverablesEn: ["Virtual Machine Cloud Console", "Cluster Load Telemetry Engine", "Enterprise OAuth2/SAML Security Broker"],
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
    image: "/images/services/animation-motion.webp",
    secondaryImage: "/case_study_1.jpg",
    liveUrl: "/portfolio/karan-voice-engine",
    featured: true,
    position: 8,
    year: "۲۰۲۵",
    challengeFa: "دقت پایین سیستم‌های تبدیل صوت به متن متداول روی مکالمات عامیانه و نویز بالای تماس‌های تلفنی مراکز ارتباط مشتریان.",
    challengeEn: "High word error rates on colloquial Persian audio under telephone network noise conditions.",
    solutionFa: "طراحی استودیو وب تعاملی برای ویرایش، بازشنوایی و تصحیح هوشمند هم‌گام با صوت، به همراه API مقیاس‌پذیر برای استخراج کلمات کلیدی مکالمه.",
    solutionEn: "Engineered an interactive audio studio interface with synchronized word timeline highlighting and automated keyword transcription.",
    deliverablesFa: ["استودیو تحت وب پایش مکالمات صوتی", "موتور استخراج احساسات و کلیدواژه‌های تماس", "API اتصال به مراکز تلفن VoIP"],
    deliverablesEn: ["Web Audio Transcription Studio", "Call Sentiment & Keyword Analyzer", "VoIP PBX Webhook Integration Engine"],
  },
];

export const MAX_HOMEPAGE_FEATURED_PROJECTS = 6;

/**
 * Returns projects designated for the homepage showcase strip.
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

/**
 * Finds a project by its slug.
 */
export function getCaseStudyBySlug(slug: string, projects: CaseStudyItem[] = SHOWCASE_PROJECTS): CaseStudyItem | undefined {
  return projects.find((p) => p.slug === slug || p.id === slug);
}
