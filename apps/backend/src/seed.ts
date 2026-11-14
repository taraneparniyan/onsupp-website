import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import bcrypt from 'bcryptjs';
import { PrismaClient, PublicationStatus } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Strict fail-closed safety guard to ensure seed execution only runs against
 * the explicitly approved local development database (onsupp_dev on port 5434).
 */
export function assertDevelopmentOnly(customUrl?: string): void {
  // 1. Strict block on production environment
  if (process.env.NODE_ENV === 'production') {
    const errorMsg = '[seed FATAL] Seeding is strictly forbidden in production (NODE_ENV=production). Execution halted.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  // 2. Fetch and trim URL
  const rawUrl = (customUrl ?? process.env.DATABASE_URL)?.trim();
  if (!rawUrl) {
    const errorMsg = '[seed FATAL] DATABASE_URL environment variable is missing or empty.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  // 3. Parse strictly with new URL()
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    const errorMsg = `[seed FATAL] DATABASE_URL is malformed or invalid: "${rawUrl}"`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  // 4. Validate protocol
  const protocol = parsedUrl.protocol;
  if (protocol !== 'postgresql:' && protocol !== 'postgres:') {
    const errorMsg = `[seed FATAL] Invalid database protocol "${protocol}". Only postgresql: or postgres: is permitted.`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  // 5. Validate hostname strictly (localhost or 127.0.0.1 only)
  const hostname = parsedUrl.hostname.toLowerCase();
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    const errorMsg = `[seed FATAL] Database host "${hostname}" is not an approved local development host. Only "localhost" or "127.0.0.1" is permitted.`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  // 6. Validate port (local ports e.g. 5432, 5433, 5434 or default)
  const port = parsedUrl.port;
  if (port && !['5432', '5433', '5434', '5435'].includes(port)) {
    const errorMsg = `[seed FATAL] Database port "${port}" is not an approved local PostgreSQL development port (5432-5435).`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  // 7. Validate database name strictly (local development databases)
  const dbName = parsedUrl.pathname.replace(/^\/+/, '').split('/')[0].trim();
  if (dbName === 'onsupp_migration_test') {
    const errorMsg = '[seed FATAL] Target database "onsupp_migration_test" is restricted to migration testing and cannot be seeded.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
  const ALLOWED_DB_NAMES = ['onsupp', 'onsupp_dev', 'onsupp_redesign', 'onsupp_db', 'onsupp_sandbox_check'];
  if (!ALLOWED_DB_NAMES.includes(dbName)) {
    const errorMsg = `[seed FATAL] Target database "${dbName}" is not an approved local development database. Permitted names: ${ALLOWED_DB_NAMES.join(', ')}.`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
}

export async function seedAdmin(db: PrismaClient = prisma): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('[seed FATAL] Seeding admin is strictly disabled in production.');
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim() || 'admin@onsupp.ir';

  // 1. Check if a user with this email already exists
  const existingUserByEmail = await db.user.findFirst({
    where: { email: adminEmail },
  });

  if (existingUserByEmail) {
    if (existingUserByEmail.role === 'ADMIN') {
      console.log(
        `[seed] Admin user (${existingUserByEmail.email}) already exists. Existing credentials preserved; password will NOT be modified.`
      );
      return;
    }

    // Role is NOT ADMIN (e.g. USER) - fail closed, do not overwrite or modify
    const conflictError = `[seed FATAL] User with email "${adminEmail}" already exists with role "${existingUserByEmail.role}". Cannot overwrite or convert existing user to ADMIN.`;
    console.error(conflictError);
    throw new Error(conflictError);
  }

  // 2. Check if another admin already exists with a different email
  const existingOtherAdmin = await db.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (existingOtherAdmin) {
    console.log(
      `[seed] An admin user (${existingOtherAdmin.email}) already exists. Preserving existing admin; no duplicate admin account will be created.`
    );
    return;
  }

  // 3. If no admin exists, require secure ADMIN_PASSWORD or ADMIN_INITIAL_PASSWORD from environment
  const initialPassword = process.env.ADMIN_PASSWORD || process.env.ADMIN_INITIAL_PASSWORD;

  if (!initialPassword || initialPassword.trim() === '') {
    const errorMsg = '[seed FATAL] ADMIN_PASSWORD (or ADMIN_INITIAL_PASSWORD) environment variable is required to create the initial admin user. Default passwords are not permitted.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  const trimmedPassword = initialPassword.trim();
  const INSECURE_PASSWORDS = ['admin123', 'admin', 'password', '12345678', '123456', 'changeme'];

  if (trimmedPassword.length < 8) {
    const errorMsg = `[seed FATAL] ADMIN_INITIAL_PASSWORD / ADMIN_PASSWORD is too short (${trimmedPassword.length} characters). Minimum required length is 8 characters.`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  if (INSECURE_PASSWORDS.includes(trimmedPassword.toLowerCase())) {
    const errorMsg = '[seed FATAL] ADMIN_INITIAL_PASSWORD / ADMIN_PASSWORD cannot be a known weak or default password (e.g. "admin123").';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  // 4. Securely hash initial password and create the admin
  const passwordHash = await bcrypt.hash(trimmedPassword, 10);

  const admin = await db.user.create({
    data: {
      email: adminEmail,
      name: 'Admin',
      password: passwordHash,
      role: 'ADMIN',
    },
  });

  console.log('[seed] Initial admin user created successfully:', {
    id: admin.id,
    email: admin.email,
    role: admin.role,
  });
}

async function main() {
  assertDevelopmentOnly();
  await seedAdmin(prisma);

  const existing = await prisma.heroSlide.count();
  if (existing === 0) {
    const defaultSlides = [
      {
        title: 'تولید رسانه‌ای، سینمایی و استودیو اختصاصی',
        titleEn: 'Cinematic Production & Bespoke Studio Media',
        subtitle:
          'روایت بصری فاخر، تصویربرداری صنعتی، پادکست و تیزرهای تبلیغاتی با پیشرفته‌ترین تجهیزات سینمایی',
        subtitleEn:
          'Elevating brand storytelling through cinema-grade cinematography, podcast studio recording, and high-impact commercial media.',
        ctaText: 'مشاهده خدمات',
        ctaTextEn: 'Explore Services',
        ctaLink: '/services',
        ctaText2: 'درباره ما',
        ctaText2En: 'About Us',
        ctaLink2: '/about',
        imageUrl: '/images/hero/hero-media-studio.webp',
        imageAlt: 'استودیو تخصصی تصویربرداری، تولید تیزر سینمایی و پادکست آن‌ساپ',
        position: 0,
      },
      {
        title: 'مهندسی نرم‌افزار، پلتفرم‌های وب و اتوماسیون داده‌محور',
        titleEn: 'Enterprise Web Engineering & Intelligent Data Systems',
        subtitle:
          'معماری سیستم‌های مدرن با Next.js، سئو تکنیکال، اتوماسیون CRM و سامانه‌های ابری مقیاس‌پذیر',
        subtitleEn:
          'Architecting high-performance Next.js platforms, technical SEO dominance, and mission-critical enterprise CRM workflows.',
        ctaText: 'مشاهده خدمات',
        ctaTextEn: 'Explore Services',
        ctaLink: '/services',
        ctaText2: 'درباره ما',
        ctaText2En: 'About Us',
        ctaLink2: '/about',
        imageUrl: '/images/hero/hero-tech-engineering.webp',
        imageAlt: 'مهندسی نرم‌افزار، توسعه وب‌سایت‌های سازمانی، سئو تکنیکال و CRM آن‌ساپ',
        position: 1,
      },
    ];
    for (const slide of defaultSlides) {
      await prisma.heroSlide.create({ data: slide });
    }
    console.log('[seed] Default hero slides created:', defaultSlides.length);
  }

  const existingServices = await prisma.service.count();
  if (existingServices === 0) {
    const defaultServices = [
      {
        slug: 'web-development',
        position: 1,
        title: 'طراحی سایت و وب‌اپلیکیشن',
        titleEn: 'Custom Web Design & Apps',
        subtitle: 'طراحی سیستم‌های دیزاین اختصاصی و پیاده‌سازی مدرن فرانت‌اند و فول‌استک',
        subtitleEn: 'Bespoke design systems, engaging UI/UX experiences, and robust Next.js engineering',
        tagFa: 'تکنولوژی و وب',
        tagEn: 'Web Engineering',
        headlineFa: 'مهندسی رابط‌های کاربری لوکس با بالاترین استانداردهای سرعت و مقیاس',
        headlineEn: 'Engineering Bespoke Digital Experiences Built for Speed, Scale & Elegance',
        detailedNarrativeFa: 'وب‌سایت سازمان شما، دفتر مرکزی هویت دیجیتال شماست. ما با فاصله گرفتن از قالب‌های آماده و کدهای سنگین تجاری، دیزاین سیستم‌های اختصاصی و کدهای مدرن را بر پایه Next.js، React و استانداردهای Core Web Vitals پیاده‌سازی می‌کنیم؛ محصولی که نه تنها از نظر زیبایی بصری مجذوب‌کننده است، بلکه در کسری از ثانیه لود شده و بالاترین نرخ تبدیل را رقم می‌زند.',
        detailedNarrativeEn: 'Your website is the foundational flagship of your digital presence. Rejecting cookie-cutter templates, OnSupp architects bespoke Figma design systems and modern Next.js/React codebases that achieve flawless Core Web Vitals, ultra-responsive cross-device fidelity, and elite conversion benchmarks.',
        businessValueTitleFa: 'ارزش استراتژیک برای کسب‌وکار شما',
        businessValueTitleEn: 'Strategic Business Value',
        businessValueFa: 'بارگذاری آنی صفحات زیر ۱ ثانیه، صفر شدن ریسک افت سئو ناشی از کدهای نامرغوب، امنیت حداکثری و مالکیت ۱۰۰٪ کد منبع بدون وابستگی به لایسنس‌های جانبی.',
        businessValueEn: 'Sub-second page speeds, zero template bloat, complete source code ownership, enterprise security, and seamless compliance with Google\'s Core Web Vitals.',
        coverImage: '/images/services/web-development.webp',
        imageUrl: '/images/services/web-development.webp',
        imageAlt: 'طراحی سایت و وب‌اپلیکیشن OnSupp',
        iconType: 'web',
        badgeAccentFa: 'وب‌سایت و اپلیکیشن',
        badgeAccentEn: 'Web & Digital Apps',
        ctaLabelFa: 'درخواست مشاوره پروژه وب',
        ctaLabelEn: 'Schedule Web Project Discovery',
        subservices: [
          {
            nameFa: 'طراحی رابط کاربری اختصاصی UI/UX',
            nameEn: 'Bespoke UI/UX Design Systems',
            descFa: 'طراحی سیستم‌های دیزاین اختصاصی در فیگما، تایپوگرافی مهندسی‌شده فارسی و انگلیسی، وایرفریمینگ تعاملی و تست دقیق کاربردپذیری (Usability Testing).',
            descEn: 'Component design systems in Figma, bilingual typographic rhythm (Vazirmatn & Gendy), interactive wireframes, and rigorous usability testing.',
            deliverablesFa: ['سیستم دیزاین کامل در Figma', 'پروتوتایپ تعاملی پیش از کدنویسی', 'معماری تجربه کاربری (UX)'],
            deliverablesEn: ['Complete Figma Design System', 'High-Fidelity Interactive Prototype', 'UX Information Architecture']
          },
          {
            nameFa: 'کدنویسی استاندارد با Next.js و React',
            nameEn: 'Modern Next.js & React Engineering',
            descFa: 'پیاده‌سازی فرانت‌اند با Next.js App Router، تایپ‌اسکریپت و Tailwind CSS مدرن، بدون کتابخانه‌های حجیم و منطبق بر رندرینگ سمت سرور (SSR) و استاتیک (SSG).',
            descEn: 'Engineered with Next.js App Router, TypeScript, and Tailwind CSS 4 for seamless Server Components, streaming hydration, and responsive performance.',
            deliverablesFa: ['کد منبع تمیز و ماژولار', 'سازگاری کامل موبایل و دسکتاپ', 'پشتیبانی دوزبانه و تم تیره/روشن'],
            deliverablesEn: ['Clean Modular TypeScript Codebase', 'Mobile-First Fluid Layouts', 'Bilingual RTL/LTR & Theme Engine']
          },
          {
            nameFa: 'بهینه‌سازی سرعت و Core Web Vitals',
            nameEn: 'Speed & Core Web Vitals Optimization',
            descFa: 'کاهش حداکثری زمان لود اولیه (LCP)، ثبات بصری طرح‌بندی (CLS صفر) و پاسخ‌دهی آنی به تعاملات کاربر (INP عالی) بر اساس متدهای پیشرفته بهینه‌سازی.',
            descEn: 'Minimizing Largest Contentful Paint (LCP), zero Cumulative Layout Shift (CLS), and instantaneous Interaction to Next Paint (INP).',
            deliverablesFa: ['نمره بالای ۹۰ در Google Lighthouse', 'لود بهینه فونت‌ها و تصاویر نسل جدید', 'کشینگ و CDN حرفه‌ای'],
            deliverablesEn: ['Lighthouse Performance Score 95+', 'Next-Gen Asset Compression', 'Edge Caching & CDN Deployment']
          }
        ],
        metrics: [
          { valueFa: '۹۸+', valueEn: '98+', labelFa: 'امتیاز عملکرد Google Lighthouse', labelEn: 'Google Lighthouse Performance Score' },
          { valueFa: '< ۰.۹s', valueEn: '< 0.9s', labelFa: 'میانگین زمان بارگذاری اولیه (LCP)', labelEn: 'Average First Contentful Paint' },
          { valueFa: '۱۰۰٪', valueEn: '100%', labelFa: 'ریسپانسیو روی تمامی اندازه‌های نمایشگر', labelEn: 'Pixel-Perfect Responsive Integrity' }
        ],
        isPublished: true,
        status: PublicationStatus.PUBLISHED,
      },
      {
        slug: 'technical-seo',
        position: 2,
        title: 'سئو تکنیکال و رشد ارگانیک',
        titleEn: 'Technical SEO & Organic Growth',
        subtitle: 'آدیت عمیق معماری سایت، تصحیح خطاهای ایندکس و استراتژی ساختاریافته محتوا',
        subtitleEn: 'Comprehensive architectural audits, Core Web Vitals optimization, and high-authority content',
        tagFa: 'سئو و رشد ارگانیک',
        tagEn: 'SEO Growth',
        headlineFa: 'تسلط بر موتورهای جستجو با تکیه بر معماری داده و اعتبار ساختاری',
        headlineEn: 'Securing Market Dominance Through Search Architecture & Compounding Traffic',
        detailedNarrativeFa: 'سئو موثر دیگر به افزودن کلمات کلیدی تصادفی محدود نمی‌شود. تیم سئو آن‌ساپ بر پایه مهندسی داده، ساختارهای اسکیما، رفع خطاهای تکنیکال ایندکسینگ و تدوین کلاسترهای محتوایی، رتبه‌بندی پایدار سایت شما را در رقابتی‌ترین کلمات کلیدی تضمین می‌کند تا جریان پیوسته‌ای از لیدهای باکیفیت به سوی کسب‌وکار شما هدایت شود.',
        detailedNarrativeEn: 'Modern search authority requires architectural precision. OnSupp\'s SEO practice audits technical crawlers, deploys semantic JSON-LD schema, maps searcher intent clusters, and builds high-authority content pillars that secure top search positions without reliance on ongoing ad spend.',
        businessValueTitleFa: 'ارزش استراتژیک برای کسب‌وکار شما',
        businessValueTitleEn: 'Strategic Business Value',
        businessValueFa: 'جایگزینی ترافیک پایدار و رایگان ارگانیک به جای هزینه‌های گزاف تبلیغات کلیکی، جذب مخاطبان با نیت خرید بالا و ایجاد دارایی ماندگار دیجیتال برای برند شما.',
        businessValueEn: 'Builds an appreciating digital asset that replaces spiraling Pay-Per-Click ad spend with reliable, high-intent inbound organic leads.',
        coverImage: '/images/services/technical-seo.webp',
        imageUrl: '/images/services/technical-seo.webp',
        imageAlt: 'سئو تکنیکال OnSupp',
        iconType: 'seo',
        badgeAccentFa: 'سئو و رتبه‌بندی ارگانیک',
        badgeAccentEn: 'Technical SEO',
        ctaLabelFa: 'درخواست آدیت سئو وب‌سایت',
        ctaLabelEn: 'Request Free Website SEO Audit',
        subservices: [
          {
            nameFa: 'آدیت فنی و اصلاح ساختار سایت',
            nameEn: 'Technical SEO Audits & Architecture',
            descFa: 'بررسی کامل کدهای سایت، حل خطاهای بودجه خزش (Crawl Budget)، اصلاح ریدایرکت‌ها، پیاده‌سازی متاتگ‌های پیشرفته و داده‌های ساختاریافته Schema.org.',
            descEn: 'Comprehensive crawler simulation, crawl budget optimization, canonical URL fixes, and rich snippet Schema.org structured data deployment.',
            deliverablesFa: ['سند جامع آدیت فنی سئو', 'پیاده‌سازی استانداردهای Schema', 'اصلاح خطاهای Search Console'],
            deliverablesEn: ['Comprehensive Technical Audit Report', 'Rich Schema.org Integration', 'Google Search Console Remediation']
          },
          {
            nameFa: 'پژوهش کلمات کلیدی و تحلیل رقبا',
            nameEn: 'Keyword Research & Competitor Analysis',
            descFa: 'شناسایی دقیق عبارت‌های کلیدی پرجستجو با نیت خرید، استخراج شکاف‌های محتوایی رقبا (Content Gap) و اولویت‌بندی کلمات بر اساس پتانسیل درآمدزایی.',
            descEn: 'Commercial intent mapping, keyword gap analysis against primary market competitors, and prioritized keyword opportunity matrices.',
            deliverablesFa: ['ماتریس کلمات کلیدی هدف', 'تحلیل عمیق ۵ رقیب اصلی', 'نقشه سفر مشتری بر اساس کلمات'],
            deliverablesEn: ['High-Intent Keyword Map', 'In-Depth Competitor Gap Matrix', 'Search Intent Journey Alignment']
          },
          {
            nameFa: 'تدوین استراتژی محتوا و رتبه‌بندی',
            nameEn: 'Content Strategy & Search Authority',
            descFa: 'طراحی کلاسترهای محتوایی (Topic Clusters)، راهنمایی نگارش متون تخصصی سئوشده، بهینه‌سازی لینک‌سازی داخلی و نظارت مستمر بر تثبیت رتبه‌های صفحه اول گوگل.',
            descEn: 'Topic cluster architecture, SEO copywriting frameworks, contextual internal linking strategies, and weekly rank tracking.',
            deliverablesFa: ['تقویم پیلار و کلاستر محتوایی', 'دستورالعمل سئو برای نویسندگان', 'گزارش‌های هفتگی پایش رتبه'],
            deliverablesEn: ['Pillar & Topic Cluster Blueprint', 'Editorial SEO Guidelines', 'Weekly SERP Rank Tracking Dashboards']
          }
        ],
        metrics: [
          { valueFa: '+۲۲۰٪', valueEn: '+220%', labelFa: 'میانگین رشد ترافیک ارگانیک در ۶ ماه', labelEn: 'Average Organic Search Traffic Growth' },
          { valueFa: 'صفحه اول', valueEn: 'Page 1', labelFa: 'تثبیت رتبه‌بندی در کلمات رقابتی', labelEn: 'Top 3 Competitive SERP Dominance' },
          { valueFa: '۱۰۰٪', valueEn: '100%', labelFa: 'مطابقت با دستورالعمل‌های رسمی گوگل', labelEn: 'Google Search Essentials Compliance' }
        ],
        isPublished: true,
        status: PublicationStatus.PUBLISHED,
      },
      {
        slug: 'social-identity',
        position: 3,
        title: 'مدیریت اینستاگرام و هویت فضای مجازی',
        titleEn: 'Instagram Marketing & Brand Identity',
        subtitle: 'طراحی هویت بصری منسجم، تدوین استراتژی برندینگ و مدیریت تعاملات شبکه‌های اجتماعی',
        subtitleEn: 'Cohesive visual identity, brand strategy design, and active social media management',
        tagFa: 'فضای مجازی و هویت',
        tagEn: 'Social & Identity',
        headlineFa: 'خلق هویتی یکپارچه و تمایزی ماندگار در ذهن مخاطب',
        headlineEn: 'Architecting Cohesive Visual Identity & High-Engagement Brand Presence',
        detailedNarrativeFa: 'در بازار پرتراکم امروز، شبکه‌های اجتماعی نخستین و پیوسته‌ترین نقطه تماس مخاطب با برند شما هستند. دپارتمان فضای مجازی آن‌ساپ با تکیه بر تحلیل رفتار مخاطبان هدف و استانداردهای طراحی برندینگ، زبان بصری و روایی اختصاصی کسب‌وکار شما را تدوین می‌کند؛ رویکردی که صرفاً به ارسال پست خلاصه نمی‌شود، بلکه پایه‌گذار اعتماد عمیق و هویت متمایز برند در اکوسیستم دیجیتال است.',
        detailedNarrativeEn: 'In crowded modern markets, digital channels serve as the primary brand touchpoint. OnSupp architects bespoke visual guidelines, audience-centric content cadences, and authoritative tone of voice that convert casual viewers into long-term brand advocates.',
        businessValueTitleFa: 'ارزش استراتژیک برای کسب‌وکار شما',
        businessValueTitleEn: 'Strategic Business Value',
        businessValueFa: 'کاهش محسوس هزینه جذب مشتری (CAC) از طریق رشد تعامل ارگانیک، تثبیت هویت بصری یکدست در تمامی کانال‌ها و افزایش ضریب ماندگاری پیام برند در حافظه مخاطبان تصمیم‌گیرنده.',
        businessValueEn: 'Significantly lowers Customer Acquisition Cost (CAC) through compounded organic engagement while instilling enduring premium authority across all customer touchpoints.',
        coverImage: '/images/services/social-identity.webp',
        imageUrl: '/images/services/social-identity.webp',
        imageAlt: 'اینستاگرام و مدیریت فضای مجازی OnSupp',
        iconType: 'social',
        badgeAccentFa: 'هویت و شبکه‌های اجتماعی',
        badgeAccentEn: 'Social & Identity',
        ctaLabelFa: 'درخواست مشاوره اینستاگرام و هویت برند',
        ctaLabelEn: 'Request Brand Identity Consultation',
        subservices: [
          {
            nameFa: 'طراحی برند و مدیریت استراتژی',
            nameEn: 'Brand Design & Strategy Management',
            descFa: 'تدوین دفترچه راهنمای هویت بصری (Brand Book)، تعیین لحن پیام، تدوین پرسونای مخاطب و تقویم محتوایی مبتنی بر اهداف فروش و آگاهی‌بخشی.',
            descEn: 'Comprehensive brand guidelines, tone of voice formulation, persona targeting, and objective-driven editorial calendars.',
            deliverablesFa: ['کتابچه هویت بصری (Brand Book)', 'استراتژی لحن و روایت', 'تقویم محتوایی ماهانه'],
            deliverablesEn: ['Complete Brand Style Guide', 'Voice & Messaging Framework', 'Monthly Content Calendar']
          },
          {
            nameFa: 'طراحی محتوای گرافیکی و سینمایی پویا',
            nameEn: 'Dynamic Graphic & Cinematic Content',
            descFa: 'تولید اسلایدهای تعاملی، پوسترهای مفهومی، استوری‌های موشن‌دار و گرافیک‌های اختصاصی با بالاترین استانداردهای بصری و کپی‌رایتینگ متقاعدکننده.',
            descEn: 'Interactive multi-slide carousels, conceptual graphic layouts, motion stories, and persuasive copywriting designed for maximum retention.',
            deliverablesFa: ['پست‌های کاروسل تحلیلی', 'طراحی هویت استوری‌ها', 'کپی‌رایتینگ تخصصی'],
            deliverablesEn: ['High-Impact Carousel Decks', 'Motion Story Templates', 'Strategic Copywriting']
          },
          {
            nameFa: 'مدیریت و کنترل صفحه مجازی',
            nameEn: 'Social Page Management & Monitoring',
            descFa: 'مدیریت تعاملات و دایرکت‌ها، مانیتورینگ الگوریتم‌ها، نظارت بر سلامت اکانت و ارائه گزارش‌های دقیق رشد، نرخ تعامل و تحلیل رفتار مخاطبان.',
            descEn: 'Community moderation, algorithmic optimization, account health auditing, and monthly analytical growth reports.',
            deliverablesFa: ['مدیریت منظم تعاملات', 'آنالیز هفتگی و ماهانه', 'بهینه‌سازی الگوریتمی'],
            deliverablesEn: ['Active Community Moderation', 'KPI & Engagement Reporting', 'Algorithmic Growth Calibration']
          }
        ],
        metrics: [
          { valueFa: '+۱۴۰٪', valueEn: '+140%', labelFa: 'میانگین رشد نرخ تعامل ارگانیک', labelEn: 'Average Organic Engagement Lift' },
          { valueFa: '۳.۲x', valueEn: '3.2x', labelFa: 'افزایش ماندگاری بصری برند', labelEn: 'Brand Recall Multiplier' },
          { valueFa: '۱۰۰٪', valueEn: '100%', labelFa: 'هماهنگی با استانداردهای هویت بصری', labelEn: 'Brand Guideline Cohesion' }
        ],
        isPublished: true,
        status: PublicationStatus.PUBLISHED,
      },
      {
        slug: 'studio-production',
        position: 4,
        title: 'فیلم‌برداری و تولیدات استودیو',
        titleEn: 'Studio Production & Videography',
        subtitle: 'تولید تیزرهای تبلیغاتی، مستندهای صنعتی و استودیو پادکست با تجهیزات حرفه‌ای سینمایی',
        subtitleEn: 'Cinematic commercial films, industrial documentaries, podcast recording, and interactive multimedia',
        tagFa: 'استودیو و تیزر',
        tagEn: 'Studio & Film',
        headlineFa: 'روایت سینمایی داستان برند با تجهیزات فوق‌حرفه‌ای',
        headlineEn: 'Cinematic Visual Storytelling Powered by Cinema-Grade Technology',
        detailedNarrativeFa: 'یک قاب تصویربرداری حرفه‌ای قادر است در چند ثانیه حسی از اعتبار و کیفیت را منتقل کند که هزاران واژه از بیان آن ناتوانند. در استودیو آن‌ساپ، با بهره‌گیری از دوربین‌های سینمایی، سیستم‌های پیشرفته نورپردازی و اتاق‌های مجهز ضبط صدا و پادکست، ایده و ارزش‌های سازمان شما را به محتوایی فاخر و تأثیرگذار برای کمپین‌های تجاری و رسانه‌ای بدل می‌کنیم.',
        detailedNarrativeEn: 'A single cinematic shot communicates credibility and prestige that thousands of words cannot match. OnSupp leverages cinema-grade cameras, broadcast lighting grids, and acoustic studio spaces to transform your enterprise vision into captivating commercial assets.',
        businessValueTitleFa: 'ارزش استراتژیک برای کسب‌وکار شما',
        businessValueTitleEn: 'Strategic Business Value',
        businessValueFa: 'افزایش چشمگیر نرخ تبدیل در تبلیغات ویدیویی، تثبیت اعتبار رسمی سازمان در نگاه مشتریان سازمانی (B2B) و تولید دارایی‌های ویدیویی با ماندگاری طولانی برای تمامی کمپین‌ها.',
        businessValueEn: 'Drastically increases conversion rates across video marketing funnels, secures B2B enterprise trust, and produces evergreen visual brand collateral.',
        coverImage: '/images/services/studio-production.webp',
        imageUrl: '/images/services/studio-production.webp',
        imageAlt: 'فیلم‌برداری و استودیو OnSupp',
        iconType: 'studio',
        badgeAccentFa: 'استودیو و تولید سینمایی',
        badgeAccentEn: 'Cinema Production',
        ctaLabelFa: 'هماهنگی استودیو و تولید ویدیو',
        ctaLabelEn: 'Schedule Studio Production Consultation',
        subservices: [
          {
            nameFa: 'تصویربرداری صنعتی و تبلیغاتی',
            nameEn: 'Industrial & Commercial Cinematography',
            descFa: 'ساخت تیزرهای تلویزیونی و دیجیتال، فیلم‌برداری از خطوط تولید کارخانجات، پروژه‌های معماری و معرفی محصولات در لوکیشن اختصاصی یا کارفرما.',
            descEn: 'Broadcast commercials, high-end industrial plant documentaries, architectural features, and product cinematography on location or in-studio.',
            deliverablesFa: ['تیزر تجاری سینمایی', 'مستند صنعتی و خط تولید', 'عکاسی صنعتی اختصاصی'],
            deliverablesEn: ['Commercial Broadcast Spots', 'Industrial Facility Documentaries', 'Studio Product Photography']
          },
          {
            nameFa: 'ساخت پادکست و محتوای بلند تعاملی',
            nameEn: 'Podcasts & Long-Form Interactive Media',
            descFa: 'تجهیز و هدایت استودیو پادکست، تصویربرداری چنددوربینه، ضبط صدای کالیبره‌شده، مصاحبه‌های سازمانی و تولید قسمت‌های پادکست تصویری (Vodcast).',
            descEn: 'Multi-camera podcast engineering, acoustic sound capture, corporate talk shows, and vodcast series ready for multi-channel syndication.',
            deliverablesFa: ['ویدیوپادکست با کیفیت 4K', 'میکسینگ و مسترینگ صدا', 'کات‌های ویروسی شبکه‌های اجتماعی'],
            deliverablesEn: ['4K Multi-Cam Vodcast Episodes', 'Acoustic Audio Mastering', 'Short-Form Social Clips']
          },
          {
            nameFa: 'تدوین و پست‌تولید',
            nameEn: 'Editing & Post-Production',
            descFa: 'تدوین ریتمیک، اصلاح رنگ سینمایی (Color Grading)، طراحی باند صوتی و جلوه‌های صوتی سه‌بعدی برای خلق نهایت گیرایی و کیفیت حسی در بیننده.',
            descEn: 'Rhythmic narrative editing, cinema color grading (DaVinci Resolve), custom sound design, and audio post-mastering.',
            deliverablesFa: ['اصلاح رنگ حرفه‌ای (Log/LUT)', 'طراحی و مهندسی صدا', 'نسخه‌های عمودی و افقی متناسب کانال‌ها'],
            deliverablesEn: ['Pro Color Grading (Log/LUT)', 'Custom Foley & Sound Design', 'Multi-Platform Export Formats']
          }
        ],
        metrics: [
          { valueFa: '4K 10-Bit', valueEn: '4K 10-Bit', labelFa: 'استاندارد تصویربرداری سینمایی', labelEn: 'Cinema Capture Standard' },
          { valueFa: '+۶۵٪', valueEn: '+65%', labelFa: 'افزایش نرخ تماشای کامل ویدیوها', labelEn: 'Average Watch Time Retention' },
          { valueFa: '۱۰۰٪', valueEn: '100%', labelFa: 'تجهیزات مدرن نور و صدای استودیویی', labelEn: 'Broadcast Acoustic Fidelity' }
        ],
        isPublished: true,
        status: PublicationStatus.PUBLISHED,
      },
      {
        slug: 'animation-motion',
        position: 5,
        title: 'انیمیشن و موشن گرافیک',
        titleEn: 'Animation & Motion Graphics',
        subtitle: 'خلق انیمیشن‌های دوبعدی و سه‌بعدی، جلوه‌های بصری سینمایی (VFX) و موشن‌گرافیک‌های تعاملی',
        subtitleEn: '2D & 3D animation, cutting-edge cinematic VFX, and interactive motion graphics',
        tagFa: 'انیمیشن و موشن',
        tagEn: 'Motion & VFX',
        headlineFa: 'تفهیم جذاب و سریع پیچیده‌ترین مفاهیم با هنر حرکت',
        headlineEn: 'Simplifying Complex Ideas into Captivating Kinetic Narratives',
        detailedNarrativeFa: 'مفاهیم پیچیده تجاری، مکانیزم‌های عملکردی محصولات مدرن و فناوری‌های نوین زمانی به موفقیت دست می‌یابند که مخاطب بتواند در چند ثانیه ارزش محوری آن‌ها را درک کند. تیم انیمیشن و موشن‌گرافیک آن‌ساپ با تلفیق هنر کارگردانی هنری، فیزیک سه‌بعدی و جلوه‌های ویژه بصری، مفاهیم انتزاعی را به داستان‌هایی پرکشش، آموزنده و انگیزشی تبدیل می‌کند.',
        detailedNarrativeEn: 'Complex technologies and abstract services only convert when prospects grasp their core value within seconds. OnSupp blends art direction, 3D physics, and kinetic animation to distill sophisticated concepts into visual narratives that command engagement.',
        businessValueTitleFa: 'ارزش استراتژیک برای کسب‌وکار شما',
        businessValueTitleEn: 'Strategic Business Value',
        businessValueFa: 'افزایش درک محصول در جلسات B2B، کاهش نرخ خروج کاربران در صفحات فرود و ارتقای شگرف جذابیت ارائه‌ها و تیزرهای معرفی خدمات به سرمایه‌گذاران.',
        businessValueEn: 'Accelerates product comprehension in enterprise B2B sales cycles, drastically reduces landing page bounce rates, and delivers investor-ready visual clarity.',
        coverImage: '/images/services/animation-motion.webp',
        imageUrl: '/images/services/animation-motion.webp',
        imageAlt: 'انیمیشن و موشن گرافیک OnSupp',
        iconType: 'motion',
        badgeAccentFa: 'موشن گرافیک و انیمیشن',
        badgeAccentEn: 'Motion & Animation',
        ctaLabelFa: 'درخواست مشاوره پروژه موشن',
        ctaLabelEn: 'Request Motion & VFX Consultation',
        subservices: [
          {
            nameFa: 'انیمیشن دوبعدی و سه‌بعدی',
            nameEn: '2D & 3D Animation',
            descFa: 'طراحی کاراکتر، مدلسازی سه‌بعدی محصولات، انیمیت روان و فضاسازی‌های داستانی متناسب با شخصیت برند برای کمپین‌ها و پلتفرم‌های تعاملی.',
            descEn: 'Custom character design, realistic 3D product modeling, organic rigging, and bespoke environments crafted to mirror your brand persona.',
            deliverablesFa: ['مدلسازی ۳D با رندر فوتورئال', 'انیمیشن دو بعدی داستانی', 'شبیه‌سازی مکانیزم محصول'],
            deliverablesEn: ['Photorealistic 3D Modeling', 'Character & Narrative 2D', 'Product Mechanical Simulation']
          },
          {
            nameFa: 'جلوه‌های ویژه سینمایی',
            nameEn: 'Cinematic Visual Effects (VFX)',
            descFa: 'تلفیق ویدیوهای رئال با عناصر سه‌بعدی کامپیوتری، شبیه‌سازی ذرات، نورپردازی دینامیک و کامپوزیت سینمایی برای تولید آگهی‌های متمایز و فراتر از واقعیت.',
            descEn: 'Seamless CGI live-action integration, particle simulations, dynamic lighting, and cinematic compositing for hyper-realistic visual ads.',
            deliverablesFa: ['کامپوزیت CGI و رئال', 'شبیه‌سازی فیزیک ذرات و سیالات', 'رتوش و اصلاح دیجیتال صحنه'],
            deliverablesEn: ['Live-Action CGI Compositing', 'Fluid & Particle Simulation', 'Digital Scene Augmentation']
          },
          {
            nameFa: 'موشن گرافیک صنعتی، آموزشی و تعاملی',
            nameEn: 'Industrial, Educational & Interactive Motion',
            descFa: 'خلق ویدیوهای توضیح‌دهنده (Explainer Videos)، موشن‌گرافیک‌های معرفی نرم‌افزار، گزارش‌های آماری پویا و گرافیک‌های رابط کاربری تعاملی.',
            descEn: 'Dynamic product explainers, SaaS interface walkthroughs, kinetic data visualizations, and interactive UI micro-animations.',
            deliverablesFa: ['ویدیو توضیح‌دهنده محصول (Explainer)', 'موشن‌گرافیک دیتامحور و آماری', 'انیمیشن‌های رابط کاربری UI Motion'],
            deliverablesEn: ['SaaS Explainer Videos', 'Data & Metric Visualizations', 'UI Micro-Interactions & Lottie']
          }
        ],
        metrics: [
          { valueFa: '۳ برابر', valueEn: '3x', labelFa: 'افزایش یادآوری پیام در مقایسه با متن', labelEn: 'Message Recall vs Plain Text' },
          { valueFa: '+۸۰٪', valueEn: '+80%', labelFa: 'بهبود نرخ تبدیل صفحات فرود', labelEn: 'Landing Page Conversion Uplift' },
          { valueFa: '60 FPS', valueEn: '60 FPS', labelFa: 'روانی و استانداردهای کیفی انیمیت', labelEn: 'Ultra-Fluid Kinetic Animation' }
        ],
        isPublished: true,
        status: PublicationStatus.PUBLISHED,
      },
      {
        slug: 'crm-automation',
        position: 6,
        title: 'استقرار CRM و اتوماسیون فروش',
        titleEn: 'CRM Implementation & Automation',
        subtitle: 'طراحی و سفارشی‌سازی پایپ‌لاین‌های فروش، اتوماسیون ثبت سرنخ‌ها و گزارش‌گیری تحلیلی',
        subtitleEn: 'Tailored CRM configuration, multi-channel lead automation pipelines, and executive dashboards',
        tagFa: 'اتوماسیون و فروش',
        tagEn: 'CRM & Systems',
        headlineFa: 'تسریع فرآیندهای فروش و شفافیت کامل چرخه‌های مشتریان',
        headlineEn: 'Accelerating Sales Velocity Through Intelligent Pipeline Automation',
        detailedNarrativeFa: 'لیدهای ورودی از وب‌سایت، شبکه‌های اجتماعی و کمپین‌های تبلیغاتی در صورت عدم پیگیری سریع و هوشمندانه، ارزش خود را از دست می‌دهند. راهکارهای استقرار CRM و اتوماسیون آن‌ساپ فرآیند جذب تا بستن قرارداد را مکانیزه می‌کنند تا هیچ مشتری بالقوه‌ای فراموش نشود و مدیران در هر لحظه تصویری شفاف از عملکرد و درآمد آتی تیم فروش داشته باشند.',
        detailedNarrativeEn: 'Inbound leads from campaigns and digital channels rapidly decay without immediate structured follow-ups. OnSupp designs tailored CRM architectures and multi-channel notification webhooks to automate lead routing, shorten sales cycles, and empower leadership with real-time revenue intelligence.',
        businessValueTitleFa: 'ارزش استراتژیک برای کسب‌وکار شما',
        businessValueTitleEn: 'Strategic Business Value',
        businessValueFa: 'کاهش ۳۵ درصدی زمان پیگیری لیدها، جلوگیری ۱۰۰ درصدی از اتلاف سرنخ‌های ورودی و دسترسی مدیران ارشد به داشبوردهای شفاف پیش‌بینی فروش و درآمد.',
        businessValueEn: 'Reduces lead response times by 35%, eliminates lost opportunities across multi-channel funnels, and equips executives with actionable revenue forecasting.',
        coverImage: '/images/services/crm-automation.webp',
        imageUrl: '/images/services/crm-automation.webp',
        imageAlt: 'استقرار CRM و اتوماسیون فروش OnSupp',
        iconType: 'crm',
        badgeAccentFa: 'اتوماسیون و عملیات فروش',
        badgeAccentEn: 'CRM & Automations',
        ctaLabelFa: 'درخواست مشاوره استقرار CRM',
        ctaLabelEn: 'Schedule CRM Implementation Demo',
        subservices: [
          {
            nameFa: 'راه‌اندازی و سفارشی‌سازی اختصاصی CRM',
            nameEn: 'Tailored CRM Setup & Configuration',
            descFa: 'تنظیم مراحل قیف فروش، تعریف فیلدهای اختصاصی هر صنعت، سطوح دسترسی کارشناسان و هماهنگ‌سازی سیستم با فرآیندهای واقعی سازمان.',
            descEn: 'Custom pipeline staging, enterprise field architectures, permission schemas, and workflow calibration aligned with your sales operations.',
            deliverablesFa: ['طراحی مراحل قیف فروش (Pipelines)', 'تعریف نقش‌ها و دسترسی‌های پرسنل', 'مهاجرت داده‌های قدیمی به CRM'],
            deliverablesEn: ['Custom Sales Pipeline Design', 'Role-Based Access Control', 'Clean Historical Data Migration']
          },
          {
            nameFa: 'اتوماسیون ثبت و پیگیری سرنخ‌ها',
            nameEn: 'Automated Lead Pipelines & Workflows',
            descFa: 'اتصال خودکار فرم‌های وب‌سایت، چت‌بات‌ها و پیام‌رسان‌ها به CRM، ارسال پیامک و ایمیل‌های پیگیری خودکار و تخصیص هوشمند لید به کارشناسان مربوطه.',
            descEn: 'Instant webhook capture from web forms and chat channels, automated SMS/email sequences, and round-robin lead distribution.',
            deliverablesFa: ['اتصال بدون وقفه فرم‌های وب به CRM', 'سناریوهای پیگیری خودکار پیامکی و ایمیلی', 'یادآورهای هوشمند برای کارشناسان'],
            deliverablesEn: ['Real-Time Lead Webhook Ingestion', 'Automated Nurturing Workflows', 'Smart Task & Follow-up Reminders']
          },
          {
            nameFa: 'داشبوردهای شفاف گزارش‌گیری فروش',
            nameEn: 'Sales Pipeline & Performance Dashboards',
            descFa: 'طراحی گزارش‌های لحظه‌ای از عملکرد کارشناسان، نرخ تبدیل هر مرحله از قیف، میزان فروش تحقق‌یافته و تحلیل دلایل از دست رفتن معاملات.',
            descEn: 'Real-time visibility into rep productivity, conversion bottlenecks, deal velocity, and win/loss analytics for strategic leadership.',
            deliverablesFa: ['داشبورد جامع مدیریت فروش', 'گزارش‌های نرخ تبدیل مراحل قیف', 'سیستم هشدار معاملات راکد'],
            deliverablesEn: ['Executive Revenue Dashboard', 'Funnel Stage Conversion Analytics', 'Stale Deal Alert Triggers']
          }
        ],
        metrics: [
          { valueFa: '-۳۵٪', valueEn: '-35%', labelFa: 'کاهش چرخه تبدیل لید به مشتری', labelEn: 'Shorter Sales Cycle Duration' },
          { valueFa: '۰ لید', valueEn: 'Zero', labelFa: 'سرنخ‌های فراموش‌شده یا از دست‌رفته', labelEn: 'Zero Dropped Inbound Leads' },
          { valueFa: '۱۰۰٪', valueEn: '100%', labelFa: 'شفافیت گزارش‌های فروش برای مدیریت', labelEn: 'Executive Pipeline Visibility' }
        ],
        isPublished: true,
        status: PublicationStatus.PUBLISHED,
      },
      {
        slug: 'custom-software',
        position: 7,
        title: 'برنامه‌نویسی و سامانه‌های اختصاصی',
        titleEn: 'Custom Software & Web Systems',
        subtitle: 'طراحی و توسعه سامانه‌های تحت وب مقیاس‌پذیر، پرتال‌های مدیریتی و معماری API اختصاصی',
        subtitleEn: 'Scalable web applications, internal enterprise portals, secure PostgreSQL architectures, and custom API',
        tagFa: 'برنامه‌نویسی و سامانه',
        tagEn: 'Custom Software',
        headlineFa: 'توسعه سامانه‌های تحت وب مقیاس‌پذیر و زیرساخت‌های پایدار سازمانی',
        headlineEn: 'Engineering Mission-Critical Enterprise Platforms & Scalable Cloud Systems',
        detailedNarrativeFa: 'هنگامی که کسب‌وکار شما دارای فرآیندهای منحصربه‌فردی است که نرم‌افزارهای آماده تجاری توان پاسخگویی به آن را ندارند، راه‌حل نهایی توسعه نرم‌افزار اختصاصی است. تیم فنی آن‌ساپ با بهره‌گیری از معماری‌های مدرن میکروسرویس، پایگاه‌های داده مقیاس‌پذیر PostgreSQL و استانداردهای سختگیرانه امنیت سایبری، سامانه‌های یکپارچه‌ای خلق می‌کند که ستون فقرات عملیات دیجیتال سازمان شما خواهند بود.',
        detailedNarrativeEn: 'When enterprise operations outgrow off-the-shelf SaaS, custom software engineering becomes the definitive competitive advantage. OnSupp crafts resilient web applications, custom management portals, secure PostgreSQL architectures, and REST/GraphQL microservices built to withstand high concurrency and mission-critical workloads.',
        businessValueTitleFa: 'ارزش استراتژیک برای کسب‌وکار شما',
        businessValueTitleEn: 'Strategic Business Value',
        businessValueFa: 'مالکیت انحصاری دارایی فکری (IP)، حذف کامل هزینه‌های مکرر دلاری نرم‌افزارهای خارجی، انطباق ۱۰۰ درصدی با الزامات قانونی و سازمانی و قابلیت ارتقای نامحدود.',
        businessValueEn: '100% intellectual property ownership, zero recurring vendor lock-in fees, total compliance with data privacy protocols, and infinite scalability as your enterprise grows.',
        coverImage: '/images/services/custom-software.webp',
        imageUrl: '/images/services/custom-software.webp',
        imageAlt: 'برنامه‌نویسی و سامانه اختصاصی OnSupp',
        iconType: 'software',
        badgeAccentFa: 'سامانه‌های سفارشی سازمانی',
        badgeAccentEn: 'Enterprise Systems',
        ctaLabelFa: 'مشاوره فنی پروژه نرم‌افزاری',
        ctaLabelEn: 'Schedule Technical Architecture Scoping',
        subservices: [
          {
            nameFa: 'توسعه فول‌استک اختصاصی و مقیاس‌پذیر',
            nameEn: 'Scalable Full-Stack Web Systems',
            descFa: 'برنامه‌نویسی سامانه‌های پیچیده تحت وب با فریم‌ورک‌های مدرن، پردازش‌های ناهمگام، صف‌بندی کارها (Task Queues) و معماری‌های پاسخگو به ترافیک بالا.',
            descEn: 'End-to-end full-stack engineering, asynchronous background workers, high-concurrency event queues, and multi-tenant architectures.',
            deliverablesFa: ['معماری ماژولار و مقیاس‌پذیر', 'کدنویسی منطبق بر اصول Clean Code', 'مستندات کامل فنی نرم‌افزار'],
            deliverablesEn: ['Scalable Modular Architecture', 'Strict Clean Code Standards', 'Comprehensive Technical Documentation']
          },
          {
            nameFa: 'طراحی ساختار دیتابیس و پنل مدیریتی',
            nameEn: 'Database & Admin Portal Architecture',
            descFa: 'طراحی ساختار داده‌های رابطه‌ای و غیررابطه‌ای با بهینه‌سازی کوئری‌ها، ایجاد پنل‌های مدیریتی پیشرفته با گزارش‌گیری لحظه‌ای و مدیریت کاربران چندسطحی.',
            descEn: 'Normalized relational database schemas (PostgreSQL/Prisma), query indexing, granular user privilege layers, and bespoke management admin portals.',
            deliverablesFa: ['طراحی بهینه دیتابیس PostgreSQL', 'پنل مدیریت اختصاصی ادمین', 'سیستم جامع ثبت رخدادها (Audit Logs)'],
            deliverablesEn: ['Optimized Database Schemas', 'Custom Admin Dashboard Portal', 'Comprehensive Security Audit Logs']
          },
          {
            nameFa: 'اتصال امن به APIها و سرویس‌های بیرونی',
            nameEn: 'Secure Third-Party API Integrations',
            descFa: 'پیاده‌سازی درگاه‌های پرداخت، وب‌سرویس‌های پیامکی، اتصال به نرم‌افزارهای حسابداری و ERP و ارائه APIهای استاندارد برای ارتباط با سامانه‌های شخص ثالث.',
            descEn: 'Secure microservice interfaces, payment gateways, ERP and accounting middleware, and versioned REST/GraphQL developer APIs.',
            deliverablesFa: ['وب‌سرویس‌های امن REST و GraphQL', 'اتصال به سیستم‌های مالی و بانکی', 'مستندات استاندارد OpenAPI/Swagger'],
            deliverablesEn: ['Secure REST & GraphQL APIs', 'Financial & Banking Gateway Integrations', 'Standard OpenAPI / Swagger Specs']
          }
        ],
        metrics: [
          { valueFa: '۹۹.۹٪', valueEn: '99.9%', labelFa: 'پایداری عملکرد و آپ‌تایم سامانه‌ها', labelEn: 'Platform Architecture Uptime' },
          { valueFa: '۱۰۰٪', valueEn: '100%', labelFa: 'مالکیت کد و حریم خصوصی داده‌ها', labelEn: 'Proprietary IP & Data Privacy' },
          { valueFa: 'مقیاس‌پذیر', valueEn: 'Scalable', labelFa: 'قابلیت پشتیبانی از میلیون‌ها تراکنش', labelEn: 'Engineered for Massive Concurrency' }
        ],
        isPublished: true,
        status: PublicationStatus.PUBLISHED,
      },
    ];
    for (const service of defaultServices) {
      await prisma.service.create({ data: service });
    }
    console.log('[seed] Default services created:', defaultServices.length);
  }
const existingStats = await prisma.stat.count();
  if (existingStats === 0) {
    const defaultStats = [
      {
        kind: 'number',
        valueFa: '۳.۲×',
        valueEn: '3.2×',
        labelFa: 'بازگشت سرمایه',
        labelEn: 'Return on investment',
        descFa: 'میانگین بازگشت سرمایه پروژه‌های ما',
        descEn: 'Average ROI across our projects',
        position: 0,
      },
      {
        kind: 'number',
        valueFa: '+۸',
        valueEn: '8+',
        labelFa: 'سال تجربه',
        labelEn: 'Years of experience',
        descFa: 'تجربه عمیق در صنایع متنوع',
        descEn: 'Deep expertise across industries',
        position: 1,
      },
      {
        kind: 'number',
        valueFa: '+۲۰۰',
        valueEn: '200+',
        labelFa: 'پروژه موفق',
        labelEn: 'Successful projects',
        descFa: 'پروژه‌های موفقی که به نتیجه رسیدند',
        descEn: 'Delivered successfully end to end',
        position: 2,
      },
      {
        kind: 'number',
        valueFa: '٪۹۸',
        valueEn: '98%',
        labelFa: 'رضایت مشتری',
        labelEn: 'Client satisfaction',
        descFa: 'رضایت مشتریان از نتایج همکاری',
        descEn: 'Clients delighted with our work',
        position: 3,
      },
      {
        kind: 'number',
        valueFa: '+۱۲۰',
        valueEn: '120+',
        labelFa: 'مشتری فعال',
        labelEn: 'Active clients',
        descFa: 'مشتریان فعال که با ما همکاری درازمدت دارند',
        descEn: 'Clients engaged in long-term work',
        position: 4,
      },
      {
        kind: 'number',
        valueFa: '۲۴/۷',
        valueEn: '24/7',
        labelFa: 'پشتیبانی',
        labelEn: 'Support',
        descFa: 'پشتیبانی همه‌وقته و همیشه در دسترس',
        descEn: 'Always-on, always available',
        position: 5,
      },
      {
        kind: 'number',
        valueFa: '۱۲',
        valueEn: '12',
        labelFa: 'صنعت',
        labelEn: 'Industries',
        descFa: 'صنایع متفاوتی که تجربه کردیم',
        descEn: 'Industries where we deliver',
        position: 6,
      },
      {
        kind: 'medical',
        valueFa: 'دقت',
        valueEn: 'Medical',
        labelFa: 'حوزه پزشکی',
        labelEn: 'Healthcare',
        descFa: 'راهکارهای دیجیتال ویژه مراکز درمانی و بهداشت',
        descEn: 'Digital solutions for clinics & healthcare',
        position: 7,
      },
    ];
    for (const stat of defaultStats) {
      await prisma.stat.create({ data: stat });
    }
    console.log('[seed] Default stats created:', defaultStats.length);
  }

  const existingContent = await prisma.aboutContent.count();
  if (existingContent === 0) {
    await prisma.aboutContent.create({
      data: {
        id: 1,
        eyebrowFa: 'درباره ما',
        eyebrowEn: 'About Us',
        titleFa: 'ما با داده و خلاقیت، برندها را رشد می‌دهیم',
        titleEn: 'We grow brands with data & creativity',
        ctaFa: 'شروع همکاری',
        ctaEn: 'Get Started',
        ctaLink: '#contact',
        imageUrl:
          'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1400&q=80&auto=format&fit=crop',
        imageAlt: 'تیم ما',
        subTitleFa: 'شریک راهبردی شما',
        subTitleEn: 'Your strategic partner',
        paragraphFa:
          'تیمی از متخصصان دیجیتال مارکتینگ که استراتژی، فناوری و خلاقیت را ترکیب می‌کنیم تا برند شما در دنیای دیجیتال بدرخشد.',
        paragraphEn:
          'A team of digital marketing specialists who combine strategy, technology, and creativity to make your brand shine online.',
      },
    });
    console.log('[seed] About content created');
  }

  const existingFeatures = await prisma.feature.count();
  if (existingFeatures === 0) {
    const defaultFeatures = [
      { titleFa: 'تیم متخصص', titleEn: 'Expert team', icon: 'team', position: 0 },
      { titleFa: 'استراتژی داده', titleEn: 'Data-driven', icon: 'data', position: 1 },
      { titleFa: 'پشتیبانی مستمر', titleEn: 'Full support', icon: 'support', position: 2 },
      { titleFa: 'نتایج ملموس', titleEn: 'Measurable results', icon: 'results', position: 3 },
    ];
    for (const feature of defaultFeatures) {
      await prisma.feature.create({ data: feature });
    }
    console.log('[seed] Default features created:', defaultFeatures.length);
  }

  // ─── Case Studies (Verified Canonical Projects) ──────────────────────────
  const existingCaseStudies = await prisma.caseStudy.findMany();

  // Safety Backup: export current database state before modifying
  if (existingCaseStudies.length > 0) {
    try {
      const backupDir = path.resolve(process.cwd(), 'backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      const backupPath = path.join(backupDir, `case_studies_backup_${Date.now()}.json`);
      fs.writeFileSync(backupPath, JSON.stringify(existingCaseStudies, null, 2), 'utf-8');
      console.log(`[seed] Safety backup of ${existingCaseStudies.length} case studies saved: ${backupPath}`);
    } catch (bErr) {
      console.warn('[seed] Could not write safety backup file:', bErr);
    }
  }

  const canonicalCaseStudies = [
    {
      slug: 'dr-miresmaeli-clinic',
      client: 'کلینیک تخصصی دکتر علیرضا میراسماعیلی',
      clientEn: 'Dr. Alireza Miresmaili Clinic',
      titleFa: 'برندینگ دیجیتال، پرتال نوبت‌دهی و هویت شبکه‌های اجتماعی',
      titleEn: 'Digital Branding, Booking Portal & Social Identity',
      taglineFa: 'تدوین هویت بصری منسجم، طراحی وب‌سایت پرفورمنس‌محور و سناریونویسی و تولید محتوای تخصصی اینستاگرام',
      taglineEn: 'Comprehensive medical practice rebranding, high-performance web booking portal, and social growth strategy',
      categoryFa: 'هویت دیجیتال و توسعه وب',
      categoryEn: 'Digital Identity & Web',
      projectType: 'website',
      descriptionFa: 'طراحی پرتال مدرن با سرعت بارگذاری فوق‌العاده و اتصال مستقیم سیستم نوبت‌دهی پیامکی در کنار سناریونویسی و تصویربرداری حرفه‌ای استودیویی.',
      descriptionEn: 'Delivered a refined clinical editorial web presence with integrated automated SMS booking and cinema-grade studio social reels.',
      imageUrl: '/images/portfolio/dr-miresmaeli-clinic-hero.webp',
      secondaryImage: '/images/portfolio/dr-miresmaeli-clinic-full.webp',
      liveUrl: 'https://drmiresmaeli.com/',
      featured: true,
      position: 0,
      year: '۲۰۲۴',
    },
    {
      slug: 'canza-construction',
      client: 'شرکت ساختمانی کنزا',
      clientEn: 'Canza Construction Ltd.',
      titleFa: 'پرتال جامع خدمات ساختمانی و بازسازی لوکس کانادا',
      titleEn: 'High-End Architectural & Construction Portal (Canada)',
      taglineFa: 'طراحی وب‌سایت مدرن با معماری ریسپانسیو، سیستم برآورد آنلاین بودجه و گالری تعاملی پروژه‌های لوکس ونکوور',
      taglineEn: 'Modern architectural engineering portfolio, online budget estimator, and high-performance showcase in Canada',
      categoryFa: 'طراحی سایت و پرتال ساختمانی',
      categoryEn: 'Web Design & Architecture',
      projectType: 'website',
      descriptionFa: 'طراحی پرتال بسیار سریع بر بستر کلود با گالری عکاسی باکیفیت پروژه‌ها، فرم هوشمند مرحله‌به‌مرحله تخمین بودجه ساخت و سئوی ساختاریافته برای بازار آمریکای شمالی.',
      descriptionEn: 'Engineered a rapid Cloudflare-backed web presence featuring an interactive cost estimation funnel and localized SEO architecture for Canadian homeowners.',
      imageUrl: '/images/portfolio/canza-construction-hero.webp',
      secondaryImage: '/images/portfolio/canza-construction-full.webp',
      liveUrl: 'https://canzaconstruction.ca/',
      featured: true,
      position: 1,
      year: '۲۰۲۵',
    },
    {
      slug: 'dr-hatam-clinic',
      client: 'کلینیک تخصصی دکتر سپنتا حاتم',
      clientEn: 'Dr. Sepanta Hatam Clinic',
      titleFa: 'پرتال جامع طب فیزیکی، توان‌بخشی و نوبت‌دهی آنلاین',
      titleEn: 'Physical Medicine & Rehabilitation Clinical Portal',
      taglineFa: 'طراحی وب‌سایت پزشکی و پرتال نوبت‌دهی، معرفی متدهای درمانی ستون فقرات و استراتژی رشد سئو بالینی',
      taglineEn: 'High-performance clinical portal, automated patient booking, and physical therapy SEO architecture',
      categoryFa: 'پرتال پزشکی و نوبت‌دهی آنلاین',
      categoryEn: 'Medical Portal & Booking',
      projectType: 'website',
      descriptionFa: 'توسعه پرتال بالینی با ناوبری ساده، نوبت‌دهی مکانیزه، پایگاه دانش جامع درمان‌های توان‌بخشی و بهینه‌سازی کلمات کلیدی پزشکی در گوگل.',
      descriptionEn: 'Delivered an accessible medical portal with automated appointment self-scheduling and an extensive rehabilitation clinical knowledge base.',
      imageUrl: '/images/portfolio/dr-hatam-clinic-hero.webp',
      secondaryImage: '/images/portfolio/dr-hatam-clinic-full.webp',
      liveUrl: 'https://dr-hatam.com/',
      featured: true,
      position: 2,
      year: '۲۰۲۵',
    },
    {
      slug: 'shin-beauty-center',
      client: 'مرکز زیبایی و لیزر شین',
      clientEn: 'Shin Beauty Center',
      titleFa: 'پلتفرم اختصاصی خدمات پوست، مو، زیبایی و رزرواسیون هوشمند',
      titleEn: 'Luxury Aesthetic Clinic & Smart Booking Portal',
      taglineFa: 'طراحی وب‌سایت کلینیکال با هویت بصری پریمیوم، معرفی تعرفه‌ها و سیستم رزرواسیون و مشاوره رایگان',
      taglineEn: 'Premium aesthetic clinic platform, real-time consultation booking, and beauty service catalogue',
      categoryFa: 'طراحی وب و هویت بصری کلینیک',
      categoryEn: 'Aesthetic & Clinic Web',
      projectType: 'website',
      descriptionFa: 'طراحی پرتال مدرن با پالت رنگی گرم و طلایی، ناوبری شناور شیشه‌ای، کاتالوگ تعاملی پکیج‌های درمانی و سامانه ثبت نوبت مشاوره رایگان.',
      descriptionEn: 'Crafted an elegant editorial web application with floating glass navigation, interactive treatment catalogs, and direct inquiry automation.',
      imageUrl: '/images/portfolio/shin-beauty-center-hero.webp',
      secondaryImage: '/images/portfolio/shin-beauty-center-full.webp',
      liveUrl: 'https://shinbeautycenter.com/',
      featured: true,
      position: 3,
      year: '۲۰۲۴',
    },
    {
      slug: 'finalytix-wealth',
      client: 'فاینالیتیکس اینترپرایز',
      clientEn: 'Finalytix Enterprise',
      titleFa: 'پلتفرم تحلیلی هوش مالی و مدیریت پورتفوی سازمانی',
      titleEn: 'Financial Analytics & Portfolio Management Platform',
      taglineFa: 'طراحی و پیاده‌سازی داشبورد مالی و گزارش‌گیری تحلیلی برای پایش یکپارچه دارایی‌ها با معماری Next.js',
      taglineEn: 'Designing and engineering a multi-asset financial analytics dashboard and reporting suite with Next.js',
      categoryFa: 'فین‌تک و داشبورد تحلیلی',
      categoryEn: 'FinTech & Analytics',
      projectType: 'app',
      descriptionFa: 'طراحی کامپوننت‌های رندر بهینه‌شده سمت سرور با Next.js و نمودارهای Canvas سخت‌افزاری که زمان بارگذاری گزارش‌ها را به زیر ۰.۴ ثانیه رساند.',
      descriptionEn: 'Developed server-driven streaming components with GPU-accelerated canvas charts achieving instant sub-second report generation.',
      imageUrl: '/case_study_2.jpg',
      secondaryImage: '/images/services/custom-software.webp',
      liveUrl: '/portfolio/finalytix-wealth',
      featured: true,
      position: 4,
      year: '۲۰۲۵',
    },
    {
      slug: 'nova-mobility',
      client: 'اکوسیستم نوا سرویس',
      clientEn: 'Nova Ecosystem',
      titleFa: 'اتوماسیون خدمات پس از فروش و مدیریت اعزام تکنسین',
      titleEn: 'After-Sales Service Automation & Field Dispatch System',
      taglineFa: 'یکپارچه‌سازی فرآیند ثبت درخواست مشتری، تخصیص هوشمند تکنسین و پیگیری وضعیت سفارش در لحظه',
      taglineEn: 'Streamlining customer service requests, technician dispatch, and live order status tracking',
      categoryFa: 'لجستیک و اتوماسیون خدمات',
      categoryEn: 'Logistics & Field Service',
      projectType: 'app',
      descriptionFa: 'ایجاد سیستم اتوماسیون جامع ثبت سفارش برخط با تخصیص خودکار نزدیک‌ترین تکنسین بر اساس نقشه شهری و پیگیری آنلاین توسط مشتری.',
      descriptionEn: 'Architected a geo-intelligent dispatcher routing tickets directly to field engineers with live SMS customer tracking.',
      imageUrl: '/images/services/crm-automation.webp',
      secondaryImage: '/case_study_1.jpg',
      liveUrl: '/portfolio/nova-mobility',
      featured: true,
      position: 5,
      year: '۲۰۲۴',
    },
    {
      slug: 'arvand-edge-mesh',
      client: 'زیرساخت ابری اروند',
      clientEn: 'Arvand Cloud',
      titleFa: 'پنل مدیریت زیرساخت ابری و مانیتورینگ سرویس‌ها',
      titleEn: 'Cloud Infrastructure Management & Telemetry Portal',
      taglineFa: 'طراحی کنسول مدیریت منابع ابری و پایش سلامت سرویس‌ها با معماری میکروسرویس و بهینه‌سازی مصرف منابع',
      taglineEn: 'Engineering a cloud resource console and service health telemetry portal with microservice architecture',
      categoryFa: 'کلود و زیرساخت نرم‌افزاری',
      categoryEn: 'Cloud & Infrastructure',
      projectType: 'website',
      descriptionFa: 'طراحی داشبورد مهندسی با تایپوگرافی مونو، نمایش گرافیکی کانتینرها، نمودارهای نرخ مصرف پردازنده و لاگ‌های سرور بلادرنگ.',
      descriptionEn: 'Built a reactive dark console featuring low-latency cluster graphs, container lifecycle controls, and live audit telemetry.',
      imageUrl: '/images/services/custom-software.webp',
      secondaryImage: '/case_study_2.jpg',
      liveUrl: '/portfolio/arvand-edge-mesh',
      featured: true,
      position: 6,
      year: '۲۰۲۴',
    },
    {
      slug: 'karan-voice-engine',
      client: 'هوش صوتی کاران',
      clientEn: 'Karan Neural Voice',
      titleFa: 'دستیار صوتی هوشمند و تبدیل گفتار به متن فارسی',
      titleEn: 'Persian Speech-to-Text & Conversational Voice Assistant',
      taglineFa: 'توسعه رابط کاربری و وب‌سرویس پردازش گفتار به متن برای مستندسازی تماس‌ها و دستیار مراکز ارتباطی',
      taglineEn: 'Developing a speech-to-text web service and interface for call documentation and support centers',
      categoryFa: 'هوش مصنوعی و پردازش زبان',
      categoryEn: 'AI & Speech Processing',
      projectType: 'instagram',
      descriptionFa: 'طراحی استودیو وب تعاملی برای ویرایش، بازشنوایی و تصحیح هوشمند هم‌گام با صوت، به همراه API مقیاس‌پذیر برای استخراج کلمات کلیدی مکالمه.',
      descriptionEn: 'Engineered an interactive audio studio interface with synchronized word timeline highlighting and automated keyword transcription.',
      imageUrl: '/images/services/animation-motion.webp',
      secondaryImage: '/case_study_1.jpg',
      liveUrl: '/portfolio/karan-voice-engine',
      featured: true,
      position: 7,
      year: '۲۰۲۵',
    },
  ];

  // Idempotent upsert: match by slug or titleFa, avoiding duplicates and preserving existing IDs
  let createdCount = 0;
  let updatedCount = 0;

  for (const cs of canonicalCaseStudies) {
    const existing = existingCaseStudies.find(
      (e) => (e.slug && e.slug === cs.slug) || e.titleFa === cs.titleFa || e.titleEn === cs.titleEn
    );

    if (existing) {
      await prisma.caseStudy.update({
        where: { id: existing.id },
        data: cs,
      });
      updatedCount++;
    } else {
      await prisma.caseStudy.create({
        data: cs,
      });
      createdCount++;
    }
  }

  // Gracefully upgrade old mock records (MedLink, old Finalytix, OnSupp Instagram) if they still exist
  const mockOldTitles = ['سامانه پایش سلامت MedLink', 'پلتفرم تحلیل مالی Finalytix', 'پیج اینستاگرام و استراتژی محتوای OnSupp'];
  for (const mockTitle of mockOldTitles) {
    const leftoverMock = await prisma.caseStudy.findFirst({
      where: { titleFa: mockTitle },
    });
    if (leftoverMock) {
      // Safely archive or flag as non-featured to prevent pollution while preserving historical ID
      await prisma.caseStudy.update({
        where: { id: leftoverMock.id },
        data: {
          featured: false,
          position: 999,
        },
      });
    }
  }

  console.log(`[seed] Canonical case studies synced (created: ${createdCount}, updated: ${updatedCount})`);

  const existingCategories = await prisma.pricingCategory.count();
  if (existingCategories === 0) {
    const seoCat = await prisma.pricingCategory.create({
      data: {
        titleFa: 'سئو و بهینه‌سازی موتورهای جستجو',
        titleEn: 'SEO & Search Engine Optimization',
        slug: 'seo',
        position: 0,
        plans: {
          create: [
            {
              nameFa: 'پلن پایه (استارت)',
              nameEn: 'Basic Starter',
              priceType: 'numeric',
              priceFa: '۱۵,۰۰۰,۰۰۰',
              priceEn: '15,000,000',
              periodFa: 'تومان / ماهانه',
              periodEn: 'TOMAN / Monthly',
              descriptionFa: 'مناسب برای کسب‌وکارهای نوپا و محلی جهت دیده شدن در رتبه‌های اول اولیه.',
              descriptionEn: 'Ideal for startups and local businesses aiming for initial search visibility.',
              featuresFa: [
                'آنالیز کلمات کلیدی پایه (تا ۲۰ کلمه)',
                'بهینه‌سازی فنی اولیه (Technical SEO)',
                'تولید و انتشار ۴ مقاله سئو شده',
                'گزارش‌گیری ماهانه عملکرد',
              ],
              featuresEn: [
                'Basic keyword analysis (Up to 20 keywords)',
                'Initial Technical SEO optimization',
                '4 SEO-optimized articles monthly',
                'Monthly analytics reporting',
              ],
              position: 0,
            },
            {
              nameFa: 'پلن حرفه‌ای (رشد)',
              nameEn: 'Professional Growth',
              badgeFa: 'پیشنهاد ویژه',
              badgeEn: 'POPULAR',
              priceType: 'numeric',
              priceFa: '۲۸,۰۰۰,۰۰۰',
              priceEn: '28,000,000',
              discountPriceFa: '۲۲,۰۰۰,۰۰۰',
              discountPriceEn: '22,000,000',
              periodFa: 'تومان / ماهانه',
              periodEn: 'TOMAN / Monthly',
              descriptionFa: 'مناسب برندهای در حال رشد جهت تسخیر کلمات رقابتی و افزایش ورود خریدار.',
              descriptionEn: 'Perfect for growing brands targeting competitive terms and conversion boosts.',
              featuresFa: [
                'تحقیق کامل کلمات کلیدی رقابتی (تا ۵۰ کلمه)',
                'سئوی کامل داخلی و ساختار لندینگ‌ها',
                'کمپین لینک‌سازی و بک‌لینک دائمی',
                'تولید ۸ مقاله تخصصی + بهبود صفحات محصول',
                'پشتیبانی ۲۴/۷ اولویت‌دار',
              ],
              featuresEn: [
                'Competitive keyword research (Up to 50 keywords)',
                'Full On-Page & Landing SEO architecture',
                'Permanent link-building campaigns',
                '8 expert articles + product page optimization',
                'Priority 24/7 support',
              ],
              popular: true,
              position: 1,
            },
            {
              nameFa: 'پلن سازمانی (Enterprise)',
              nameEn: 'Enterprise Leader',
              badgeFa: 'تخفیف ویژه',
              badgeEn: 'SPECIAL OFFER',
              priceType: 'contact',
              priceFa: 'تماس بگیرید',
              priceEn: 'Contact Us',
              periodFa: 'مشاوره و قیمت سفارشی',
              periodEn: 'Custom Quote',
              descriptionFa: 'راهکار جامع سئو پرچمدار برای فروشگاه‌های بزرگ و سازمان‌های پیشرو.',
              descriptionEn: 'Flagship SEO enterprise package tailored for massive e-commerce & portals.',
              featuresFa: [
                'کلمات کلیدی نامحدود و آنالیز عمیق رقبا',
                'معماری جامع سئو سازمانی و Schema',
                'تولید محتوای نامحدود و کپشن‌نویسی تخصصی',
                'مدیر پروژه اختصاصی و جلسات حضوری/آنلاین',
              ],
              featuresEn: [
                'Unlimited keywords & deep competitor audit',
                'Enterprise architecture & custom Schemas',
                'Unlimited specialized content creation',
                'Dedicated SEO manager & face-to-face syncs',
              ],
              position: 2,
            },
          ],
        },
      },
    });

    const webCat = await prisma.pricingCategory.create({
      data: {
        titleFa: 'طراحی وب‌سایت و فروشگاه آنلاین',
        titleEn: 'Website & E-Commerce Design',
        slug: 'website',
        position: 1,
        plans: {
          create: [
            {
              nameFa: 'وب‌سایت شرکتی پایه',
              nameEn: 'Corporate Basic',
              priceType: 'numeric',
              priceFa: '۱۸,۰۰۰,۰۰۰',
              priceEn: '18,000,000',
              periodFa: 'تومان / یکبار پرداخت',
              periodEn: 'TOMAN / One-time',
              descriptionFa: 'طراحی وب‌سایت معرفی شرکتی با دیزاین مدرن و واکنش‌گرا.',
              descriptionEn: 'Modern responsive corporate presentation website.',
              featuresFa: [
                'طراحی اختصاصی تا ۵ صفحه اصلی',
                'ریسپانسیو کامل روی موبایل و تبلت',
                'فرم تماس و پنل مدیریت فارسی',
              ],
              featuresEn: [
                'Up to 5 custom pages',
                'Fully responsive mobile & tablet design',
                'Contact form & Farsi admin panel',
              ],
              position: 0,
            },
            {
              nameFa: 'فروشگاه اینترنتی پیشرفته',
              nameEn: 'Advanced E-Commerce',
              badgeFa: 'پیشنهاد ویژه',
              badgeEn: 'BEST SELLER',
              priceType: 'numeric',
              priceFa: '۳۵,۰۰۰,۰۰۰',
              priceEn: '35,000,000',
              discountPriceFa: '۲۹,۰۰۰,۰۰۰',
              discountPriceEn: '29,000,000',
              periodFa: 'تومان / یکبار پرداخت',
              periodEn: 'TOMAN / One-time',
              descriptionFa: 'سیستم کامل فروشگاهی با درگاه پرداخت آنلاین و مدیریت انبار.',
              descriptionEn: 'Full e-commerce platform with online payment gateways.',
              featuresFa: [
                'اتصال به درگاه‌های پرداخت شتابی',
                'سیستم تخفیف‌دهی و انبارداری آنلاین',
                'سرعت فوق‌العاده و گواهی SSL رایگان',
              ],
              featuresEn: [
                'Integration with all payment gateways',
                'Discounts & inventory management',
                'High speed & free SSL certificate',
              ],
              popular: true,
              position: 1,
            },
            {
              nameFa: 'پلتفرم اختصاصی سفارشی',
              nameEn: 'Custom Platform',
              priceType: 'contact',
              priceFa: 'تماس بگیرید',
              priceEn: 'Contact Us',
              periodFa: 'سنجش نیاز و برآورد زمان',
              periodEn: 'Custom Assessment',
              descriptionFa: 'توسعه اختصاصی سامانه‌ها و وب‌اپلیکیشن‌های پیچیده سازمانی.',
              descriptionEn: 'Bespoke web application development for enterprise platforms.',
              featuresFa: [
                'طراحی UI/UX اختصاصی از صفر',
                'معماری مقیاس‌پذیر با Next.js و Node.js',
                'پشتیبانی فنی یک‌ساله تضمین‌شده',
              ],
              featuresEn: [
                'Bespoke UI/UX design from scratch',
                'Scalable Next.js & Node.js architecture',
                '1-year guaranteed technical SLA',
              ],
              position: 2,
            },
          ],
        },
      },
    });

    console.log('[seed] Default pricing categories & plans created:', 2);
  }

  // 8. Seed Contact Content Singleton
  const existingContact = await prisma.contactContent.count();
  if (existingContact === 0) {
    await prisma.contactContent.create({
      data: {
        id: 1,
      },
    });
    console.log('[seed] Default contact content singleton created');
  }

  // 9. Seed / Sync Articles with Upsert (Strictly ensures the 3 canonical articles exist)
  console.log('[seed] Syncing official articles (Upsert)...');
  const officialArticlesData = [
  {
    "id": 1,
    "titleFa": "راهنمای جامع سئو تکنیکال (Technical SEO) در سال ۲۰۲۶؛ چک‌لیست معماری وب و فاکتورهای حیاتی گوگل",
    "titleEn": "The Ultimate Guide to Technical SEO in 2026: Modern Web Architecture & Google Vitals",
    "slug": "technical-seo-modern-web-architecture",
    "categoryFa": "سئو و رشد ارگانیک",
    "categoryEn": "Technical SEO & Growth",
    "excerptFa": "راهنمای گام‌به‌گام و تخصصی بهینه‌سازی فنی وب‌سایت‌ها برای خزنده‌های نوین گوگل در سال ۲۰۲۶؛ بررسی عمیق معماری Next.js، شاخص‌های Core Web Vitals (INP, LCP, CLS)، بهینه‌سازی بودجه خزش و اسکیماهای معنایی ساختاریافته.",
    "excerptEn": "A comprehensive technical blueprint for optimizing modern web platforms for Google crawlers: SSR/SSG rendering, Core Web Vitals (INP, LCP, CLS), crawl budget, and semantic schema architecture.",
    "contentFa": "\n<section id=\"intro\">\n  <h2>۱. سئو تکنیکال در عصر هوش مصنوعی؛ چرا زیرساخت فنی پادشاه جدید است؟</h2>\n  <p>در سال ۲۰۲۶ با گسترش موتورهای جستجوی مبتنی بر هوش مصنوعی (Google SGE و پردازش چندوجهی Gemini)، نحوه بررسی و ارزیابی صفحات وب توسط ربات‌های خزنده‌گر متحول شده است. امروزه دیگر تولید محتوای متنی صرف بدون داشتن یک <strong>زیرساخت فنی بی‌نقص و پرسرعت</strong>، هیچ شانسی برای تثبیت رتبه در صفحه اول نتایج جستجو ندارد.</p>\n  \n  <blockquote>\n    سئو تکنیکال (Technical SEO) هنر و مهندسی آماده‌سازی پلتفرم وب شماست به گونه‌ای که خزنده‌های گوگل بتوانند در کمترین زمان ممکن، بدون خطاهای رندرینگ و با کمترین مصرف منابع پردازشی، محتوای صفحات را درک و ایندکس کنند.\n  </blockquote>\n\n  <p>اگر کدهای سایت شما بهینه نباشند یا سرعت پاسخگویی سرور (TTFB) بالا باشد، حتی برترین مقالات نیز در صف طولانی خزش گوگل باقی مانده و ترافیک ارگانیک ارزشمندی از دست خواهد رفت. در این راهنما، فاکتورهای تعیین‌کننده سئو تکنیکال در سال ۲۰۲۶ را بررسی می‌کنیم.</p>\n</section>\n\n<section id=\"section-1\">\n  <h2 id=\"section-1\">۲. شاخص‌های حیاتی وب (Core Web Vitals ۲۰۲۶) و ارتقای پرفورمنس</h2>\n  <p>گوگل استانداردهای سخت‌گیرانه‌تری را برای تجربه کاربری (Page Experience) اعمال کرده است. سه شاخص بنیادین زیر معیار سنجش اعتبار فنی هر دامنه هستند:</p>\n\n  <h3>شاخص تعامل تا رنگ بعدی (INP - Interaction to Next Paint)</h3>\n  <p>شاخص <code>INP</code> رسماً جایگزین <code>FID</code> شده و تمام تعاملات کاربر در طول صفحه (کلیک‌ها، اسکرول‌ها و باز کردن منوها) را زیر ذره‌بین قرار می‌دهد. مقدار ایده‌آل INP باید <strong>کمتر از ۲۰۰ میلی‌ثانیه</strong> باشد. برای رسیدن به این بنچمارک در پلتفرم‌های مدرن، شکستن وظایف طولانی جاوااسکریپت (Long Tasks) و استفاده از Web Workers ضروری است.</p>\n\n  <h3>بزرگ‌ترین المان محتوایی (LCP - Largest Contentful Paint)</h3>\n  <p>شاخص <code>LCP</code> زمان رندر شدن تصویر یا بلوک متنی اصلی صفحه را اندازه می‌گیرد و باید <strong>زیر ۲.۵ ثانیه (و ترجیحاً زیر ۱.۲ ثانیه در دستگاه‌های همراه)</strong> ثبت شود. تبدیل تصاویر به فرمت‌های فوق‌فشرده WebP و AVIF، تعریف ویژگی <code>fetchpriority=\"high\"</code> برای بنر هیرو و استفاده از CDNهای جهانی لبه (Edge CDN) مهم‌ترین راهکارهای بهبود LCP هستند.</p>\n\n  <h3>تغییر چیدمان تجمعی (CLS - Cumulative Layout Shift)</h3>\n  <p>پرش ناگهانی المان‌ها در هنگام لود باعث تجربه کاربری ناخوشایند می‌شود. با اختصاص ابعاد مشخص <code>width</code> و <code>height</code> برای تمام تصاویر و بنرهای تبلیغاتی و استفاده از استراتژی بارگذاری فونت <code>font-display: swap</code>، عدد CLS باید همواره <strong>کمتر از ۰.۱</strong> نگه داشته شود.</p>\n\n  <div class=\"table-responsive\">\n    <table>\n      <thead>\n        <tr>\n          <th>شاخص فنی (Metric)</th>\n          <th>هدف استاندارد گوگل</th>\n          <th>تاثیر مستقیم بر سئو</th>\n          <th>راهکار پیشنهادی آن‌ساپ</th>\n        </tr>\n      </thead>\n      <tbody>\n        <tr>\n          <td><strong>INP</strong></td>\n          <td>&lt; 200 ms</td>\n          <td>حفظ تعامل‌پذیری و کاهش بانس‌ریت</td>\n          <td>کاهش بار پردازشی جاوااسکریپت و بهینه‌سازی Event Handlers</td>\n        </tr>\n        <tr>\n          <td><strong>LCP</strong></td>\n          <td>&lt; 1.5 s</td>\n          <td>ایندکس سریع‌تر در نتایج موبایل</td>\n          <td>استفاده از Next.js Image Optimization و کش هوشمند لبه</td>\n        </tr>\n        <tr>\n          <td><strong>CLS</strong></td>\n          <td>&lt; 0.05</td>\n          <td>اعتبار تجربه کاربری (UX Signal)</td>\n          <td>رزرو فضای اختصاصی برای عناصر پویا و فونت‌های سفارشی</td>\n        </tr>\n      </tbody>\n    </table>\n  </div>\n</section>\n\n<section id=\"section-2\">\n  <h2 id=\"section-2\">۳. معماری رندرینگ Next.js، بودجه خزش و داده‌های ساختاریافته (Schema Markup)</h2>\n  <p>برای وب‌سایت‌های سازمانی، اتکا به فریم‌ورک‌های کاملاً سمت کلاینت (Pure SPA) مانند ری‌اکت سنتی، خزنده‌های گوگل را با تاخیر مواجه می‌کند. در آژانس دیجیتال مارکتینگ آن‌ساپ، معماری وب‌سایت‌ها بر پایه رندرینگ هیبریدی طراحی می‌شود:</p>\n\n  <ul>\n    <li><strong>Server-Side Rendering (SSR):</strong> محتوای صفحات داینامیک مستقیماً روی سرور به HTML کامل تبدیل شده و تحویل موتور جستجو می‌شود.</li>\n    <li><strong>Static Site Generation (SSG) &amp; ISR:</strong> مقالات و صفحات لندینگ از قبل بیلد شده و در کسری از ثانیه با بالاترین سرعت از کش CDN بارگذاری می‌شوند.</li>\n    <li><strong>بهینه‌سازی بودجه خزش (Crawl Budget):</strong> مسدود کردن صفحات بی‌ارزش ادمین، پارامترهای تکراری فیلترها در <code>robots.txt</code> و پاکسازی ریدایرکت‌های زنجیره‌ای (Redirect Chains) تا ربات‌های گوگل منابع خود را فقط صرف صفحات ارزشمند شما کنند.</li>\n  </ul>\n\n  <h3>پیاده‌سازی داده‌های معنایی با اسکیما JSON-LD</h3>\n  <p>داده‌های ساختاریافته به خزنده‌های هوش مصنوعی کمک می‌کنند ماهیت واقعی برند، مقالات، خدمات و پرسش‌وپاسخ‌های شما را متوجه شوند. نمونه کد استاندارد برای فعال‌سازی ریچ اسنیپت مقاله:</p>\n\n  <pre><code>{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"TechArticle\",\n  \"headline\": \"معماری سئوی تکنیکال در وب‌اپلیکیشن‌های مقیاس‌پذیر\",\n  \"author\": {\n    \"@type\": \"Organization\",\n    \"name\": \"آژانس دیجیتال مارکتینگ آن‌ساپ\"\n  },\n  \"publisher\": {\n    \"@type\": \"Organization\",\n    \"name\": \"OnSupp\",\n    \"url\": \"https://onsupp.ir\"\n  }\n}</code></pre>\n</section>\n\n<section id=\"conclusion\">\n  <h2 id=\"conclusion\">۴. چک‌لیست نهایی ممیزی سئو تکنیکال و جمع‌بندی</h2>\n  <p>سئوی تکنیکال فرآیندی یک‌باره نیست، بلکه نیازمند ممیزی‌های دوره‌ای (Technical Audits) است. برای حفظ سلطه بر نتایج جستجو، موارد زیر را به‌طور پیوسته رصد کنید:</p>\n  <ol>\n    <li>بررسی خطاهای کراول در پنل <strong>Google Search Console</strong> و رفع کدهای خطای ۴۰۴ و ۵۰۰.</li>\n    <li>اطمینان از وجود تگ‌های کانونیکال خودارجاع (Self-referencing Canonical Tags) در تمام صفحات.</li>\n    <li>تست سلامت نقشه سایت XML و آپدیت خودکار فیلد <code>lastmod</code> پس از تغییر محتوا.</li>\n    <li>فعال بودن پروتکل امنیتی HTTP/2 یا HTTP/3 و گواهینامه SSL با پیکربندی امن HSTS.</li>\n  </ol>\n  <p>تیم مهندسی و متخصصان سئوی تکنیکال <strong>آن‌ساپ (OnSupp)</strong> با آنالیز اختصاصی کدها، سرورها و ساختار داده‌های کسب‌وکار شما، مسیر رسیدن به جایگاه پایدار لینک یک گوگل را هموار می‌کنند.</p>\n</section>\n",
    "contentEn": "\n<section id=\"intro\">\n  <h2>1. Technical SEO in the AI Era: Why Infrastructure is the Real King</h2>\n  <p>In 2026, search engine crawlers powered by advanced AI and multimodal evaluation models expect instantaneous, semantically rich responses. Traditional keyword stuffing without robust architectural hygiene guarantees ranking decay.</p>\n  <blockquote>Technical SEO is the foundational engineering discipline that ensures search engines discover, crawl, render, and understand your content without computational friction.</blockquote>\n</section>\n\n<section id=\"section-1\">\n  <h2 id=\"section-1\">2. Core Web Vitals 2026: INP, LCP & Layout Stability</h2>\n  <p>Interaction to Next Paint (INP) requires interactive responsiveness under 200 milliseconds. Largest Contentful Paint (LCP) must land beneath 1.5 seconds via modern asset compression (AVIF/WebP) and Edge CDN routing.</p>\n</section>\n\n<section id=\"section-2\">\n  <h2 id=\"section-2\">3. Next.js Server Architecture & Semantic JSON-LD</h2>\n  <p>Combining Server-Side Rendering (SSR) with Incremental Static Regeneration (ISR) ensures crawlers receive full static HTML without client-side rendering bottlenecks while maintaining optimal crawl budget.</p>\n</section>\n\n<section id=\"conclusion\">\n  <h2 id=\"conclusion\">4. Comprehensive Technical Audit Checklist</h2>\n  <p>OnSupp's senior technical SEO engineers deploy systematic log file auditing, canonical validation, and server architecture optimization to secure enduring enterprise organic dominance.</p>\n</section>\n",
    "readTimeFa": "۷ دقیقه مطالعه",
    "readTimeEn": "7 min read",
    "imageUrl": "/images/services/technical-seo.webp",
    "author": "دپارتمان سئو و معماری نرم‌افزار آن‌ساپ",
    "createdAt": "2026-10-25T09:00:00.000Z",
    "featured": true,
    "metaTitleFa": "راهنمای جامع سئو تکنیکال ۲۰۲۶ | چک‌لیست معماری وب و افزایش رتبه گوگل | آن‌ساپ",
    "metaTitleEn": "Complete Technical SEO Guide 2026: Core Web Vitals & Web Architecture | OnSupp",
    "metaDescFa": "راهنمای عملی سئو تکنیکال (Technical SEO) برای وب‌اپلیکیشن‌های مدرن. بهینه‌سازی سرعت LCP و INP، معماری Next.js، بودجه خزش و استانداردهای گوگل ۲۰۲۶ با متخصصان آن‌ساپ.",
    "metaDescEn": "Master Technical SEO in 2026: Next.js rendering, Core Web Vitals benchmarks, crawl budget management, and schema architecture for enterprise growth.",
    "keywordsFa": "سئو تکنیکال, Technical SEO, چک لیست سئو تکنیکال, Core Web Vitals, سئو Next.js, بهینه سازی بودجه خزش, ایندکس گوگل, اسکیما مارک آپ",
    "keywordsEn": "Technical SEO, Core Web Vitals, Next.js SEO, Crawl Budget, Structured Data, Schema Markup",
    "canonicalUrl": "https://onsupp.ir/blog/technical-seo-modern-web-architecture",
    "ogImage": "/images/services/technical-seo.webp",
    "faqs": [
      {
        "id": 1,
        "question": "سئو تکنیکال (Technical SEO) دقیقاً چیست و چه فرقی با سئوی محتوایی دارد؟",
        "answer": "سئو تکنیکال بر زیرساخت‌های مهندسی وب‌سایت مانند سرعت بارگذاری، سازگاری کدها با خزنده‌های موتور جستجو، ساختار امنیتی، کانونیکال‌ها، بهینه‌سازی Core Web Vitals و دیتای اسکیما تمرکز دارد؛ در حالی که سئوی محتوایی به کلمات کلیدی، کیفیت متون و نگارش مقالات می‌پردازد.",
        "order": 1
      },
      {
        "id": 2,
        "question": "شاخص INP در Core Web Vitals چیست و چرا جایگزین FID شد؟",
        "answer": "شاخص Interaction to Next Paint (INP) سرعت پاسخگویی و لگ بصری تمام کلیک‌ها و لمس‌های کاربر در کل صفحه را اندازه‌گیری می‌کند؛ برخلاف FID که فقط اولین تاخیر ورودی را می‌سنجید. مقدار استاندارد آن باید زیر ۲۰۰ میلی‌ثانیه باشد.",
        "order": 2
      },
      {
        "id": 3,
        "question": "آیا استفاده از فریم‌ورک‌های مدرن جاوااسکریپت مثل Next.js به سئو کمک می‌کند؟",
        "answer": "بله، به شرطی که از رندرینگ سرور (SSR) یا تولید ایستا (SSG) استفاده شود. Next.js به خزنده‌های گوگل HTML رندر شده کامل تحویل می‌دهد و برخلاف تک‌صفحه‌ای‌های کلاینت (SPA)، هیچ تاخیری در ایندکس شدن ایجاد نمی‌کند.",
        "order": 3
      },
      {
        "id": 4,
        "question": "چگونه بودجه خزش (Crawl Budget) وب‌سایت خود را بهینه‌سازی کنیم؟",
        "answer": "با مسدودسازی صفحات بی‌اثر در robots.txt، حذف ریدایرکت‌های زنجیره‌ای، رفع خطاهای ۴۰۴، بهینه‌سازی ساختار لینک‌سازی داخلی و افزایش سرعت پاسخگویی سرور، ربات‌های گوگل زمان بیشتری را به خزش صفحات تجاری ارزشمند شما اختصاص می‌دهند.",
        "order": 4
      }
    ]
  },
  {
    "id": 2,
    "titleFa": "طراحی سایت اختصاصی یا وردپرس؟ تحلیل فنی، امنیت، سرعت و نرخ بازگشت سرمایه (ROI)",
    "titleEn": "Custom Web Engineering vs WordPress CMS: Performance, Security & Conversion Rates",
    "slug": "editorial-ui-design-conversion-rate",
    "categoryFa": "طراحی وب و تکنولوژی",
    "categoryEn": "Web Engineering & Design",
    "excerptFa": "بررسی بی‌طرفانه و موشکافانه تفاوت‌های معماری وب‌سایت‌های اختصاصی (کدنویسی شده با Next.js و TypeScript) در برابر قالب‌های آماده وردپرس؛ کدام پلتفرم بهترین سرعت لود، امنیت پایدار و نرخ تبدیل تجاری را ارائه می‌دهد؟",
    "excerptEn": "An in-depth architectural breakdown comparing custom bespoke platforms (Next.js & TypeScript) with off-the-shelf WordPress themes: speed, security audits, and enterprise ROI.",
    "contentFa": "\n<section id=\"intro\">\n  <h2>۱. چالش بزرگ کسب‌وکارهای در حال رشد؛ توسعه اختصاصی یا سیستم‌های مدیریت محتوای آماده؟</h2>\n  <p>هنگامی که یک کسب‌وکار از فاز آزمایش اولیه عبور می‌کند و وارد مرحله مقیاس‌پذیری و جذب مشتریان عمده می‌شود، زیرساخت وب‌سایت به یکی از حیاتی‌ترین دارایی‌های نامشهود برند تبدیل می‌گردد. در این نقطه، سوال پرتکرار مدیران این است: <strong>آیا باید سایت را روی سیستم‌های آماده مانند وردپرس توسعه دهیم یا به سمت طراحی اختصاصی برویم؟</strong></p>\n\n  <blockquote>\n    قالب‌های آماده برای شروع‌های سریع و بودجه‌های محدود ایده‌آل هستند؛ اما برای سازمان‌هایی که سرعت لود زیر ۱ ثانیه، هویت برند سفارشی، نرخ تبدیل بالا و امنیت غیرقابل نفوذ می‌خواهند، توسعه اختصاصی یک سرمایه‌گذاری ضروری و راهبردی است.\n  </blockquote>\n\n  <p>در ادامه، این دو رویکرد را از زوایای فنی، پرفورمنس، امنیت داده‌ها و هزینه کل مالکیت مقایسه می‌کنیم.</p>\n</section>\n\n<section id=\"section-1\">\n  <h2 id=\"section-1\">۲. کالبدشکافی عملکرد و سرعت؛ تاثیر زمان بارگذاری زیر ۱ ثانیه بر نرخ تبدیل (CRO)</h2>\n  <p>سرعت سایت صرفاً یک معیار فنی نیست؛ بلکه مستقیماً بر درآمد تجاری تاثیر دارد. طبق آخرین تحقیقات گوگل، به ازای هر <strong>یک ثانیه تاخیر</strong> در بارگذاری صفحه موبایل، نرخ تبدیل (Conversion Rate) تا <strong>۷ درصد</strong> کاهش می‌یابد.</p>\n\n  <h3>مشکل انباشت کدهای اضافی (Code Bloat) در وردپرس</h3>\n  <p>در قالب‌های آماده وردپرس، برای ارائه قابلیت‌های عمومی صدها فایل CSS و اسکریپت جاوااسکریپت به همراه کتابخانه‌های حجیم بارگذاری می‌شوند که ۹۰٪ آن‌ها در صفحه مورد استفاده قرار نمی‌گیرند. این موضوع باعث افزایش زمان TTFB و کندی پردازش مرورگر می‌شود.</p>\n\n  <h3>معماری تمیز در کدنویسی اختصاصی با Next.js و Tailwind</h3>\n  <p>در وب‌سایت‌های اختصاصی توسعه‌یافته در <strong>آن‌ساپ</strong>، هر خط کد با مهندسی دقیق و برای یک نیاز مشخص نوشته می‌شود. کدهای بدون استفاده به‌طور خودکار (Tree Shaking) حذف شده و منابع در قالب بسته‌های بسیار کم‌حجم توزیع می‌شوند؛ نتیجه این امر لود صفحات در کمتر از <strong>۸۰۰ میلی‌ثانیه</strong> است.</p>\n\n  <div class=\"table-responsive\">\n    <table>\n      <thead>\n        <tr>\n          <th>معیار مقایسه</th>\n          <th>قالب‌های آماده وردپرس</th>\n          <th>طراحی اختصاصی (آن‌ساپ)</th>\n        </tr>\n      </thead>\n      <tbody>\n        <tr>\n          <td><strong>سرعت بارگذاری متوسط</strong></td>\n          <td>۳.۵ الی ۶ ثانیه</td>\n          <td><strong>زیر ۱ ثانیه (Ultra Fast)</strong></td>\n        </tr>\n        <tr>\n          <td><strong>انعطاف در پیاده‌سازی UI/UX</strong></td>\n          <td>محدود به ساختار قالب و ویجت‌ها</td>\n          <td><strong>طراحی ۱۰۰٪ اختصاصی بر اساس هویت برند</strong></td>\n        </tr>\n        <tr>\n          <td><strong>امتیاز PageSpeed Insights</strong></td>\n          <td>معمولاً بین ۴۰ تا ۶۵</td>\n          <td><strong>۹۵ الی ۱۰۰ (حداکثر استاندارد سبز)</strong></td>\n        </tr>\n        <tr>\n          <td><strong>وابستگی به افزونه‌های متعدد</strong></td>\n          <td>۳۰ الی ۶۰ پلاگین شخص ثالث</td>\n          <td><strong>صفر؛ هسته یکپارچه بدون پلاگین ناپایدار</strong></td>\n        </tr>\n      </tbody>\n    </table>\n  </div>\n</section>\n\n<section id=\"section-2\">\n  <h2 id=\"section-2\">۳. ارزیابی امنیت داده‌ها، آسیب‌پذیری افزونه‌ها و هزینه‌های پنهان نگهداری</h2>\n  <p>بیش از ۹۵ درصد از حملات هکری و نفوذهای امنیتی در وب‌سایت‌های مبتنی بر CMS سنتی، از طریق <strong>آسیب‌پذیری پلاگین‌های نصب‌شده</strong> اتفاق می‌افتد. با انتشار هر آپدیت هسته، احتمال تداخل میان افزونه‌ها و به هم ریختن چیدمان صفحات بالا می‌رود.</p>\n\n  <h3>امنیت ذاتی در معماری هدلس (Headless &amp; API-Driven)</h3>\n  <p>در وب‌سایت‌های اختصاصی، لایه نمایش (Front-end) کاملاً از پایگاه داده و پنل ادمین (Back-end) ایزوله است. هیچ خروجی مستقیمی از پایگاه داده به مرورگر متصل نیست و ارتباطات با استانداردهای رمزنگاری مدرن (JWT Tokens و سخت‌گیرانه‌ترین لایه‌های CORS و CSP) هدایت می‌شوند؛ بدین ترتیب خطر حملات رایج تزریق SQL و XSS عملاً خنثی می‌گردد.</p>\n\n  <h3>هزینه‌های پنهان نگهداری (Total Cost of Ownership)</h3>\n  <p>اگرچه راه‌اندازی اولیه وردپرس ارزان‌تر به نظر می‌رسد، اما هزینه‌های تمدید لایسنس سالانه افزونه‌ها، هاستینگ‌های گران‌قیمت با منابع بالا برای تحمل فشار وردپرس، و استخدام مداوم پشتیبان برای رفع خطاهای آپدیت، هزینه کل مالکیت آن را در افق ۲ ساله فراتر از سیستم‌های اختصاصی می‌برد.</p>\n</section>\n\n<section id=\"conclusion\">\n  <h2 id=\"conclusion\">۴. ماتریس تصمیم‌گیری هوشمند و استراتژی رشد دیجیتال با آن‌ساپ</h2>\n  <p>اگر کسب‌وکار شما در آغاز راه است یا بودجه اولیه‌ای کمتر از چند میلیون تومان دارد، قالب‌های وردپرسی پاسخی منطقی هستند. اما اگر یک برند شرکتی، پلتفرم خدماتی، فروشگاه با تراکنش بالا یا یک سازمان پیشرو هستید که به ارزش زمان مشتریان خود اهمیت می‌دهد، <strong>طراحی وب‌سایت اختصاصی تنها راهکاری است که شما را یک سر و گردن بالاتر از رقبا قرار می‌دهد</strong>.</p>\n  \n  <p>دپارتمان مهندسی نرم‌افزار <strong>آن‌ساپ (OnSupp)</strong> وب‌سایت‌های اختصاصی را با مدرن‌ترین پشته نرم‌افزاری جهان (Next.js، TypeScript و رابط‌های کاربری چشم‌نواز Tailwind) خلق می‌کند تا بالاترین نرخ تبدیل و امنیت بی‌چون‌وچرا را به کسب‌وکار شما هدیه دهد.</p>\n</section>\n",
    "contentEn": "\n<section id=\"intro\">\n  <h2>1. The Enterprise Dilemma: Bespoke Architecture or CMS Templates?</h2>\n  <p>When an ambitious organization scales beyond initial product-market fit, off-the-shelf templates frequently become a bottleneck. We analyze speed, security, and enterprise ROI.</p>\n</section>\n\n<section id=\"section-1\">\n  <h2 id=\"section-1\">2. Performance Breakdown: Sub-Second Load Times and Conversion Impact</h2>\n  <p>Studies reveal that every 1-second delay in page load diminishes user conversions by up to 7%. Bespoke Next.js platforms eliminate code bloat, reliably delivering sub-second interaction speeds.</p>\n</section>\n\n<section id=\"section-2\">\n  <h2 id=\"section-2\">3. Security Defenses and Total Cost of Ownership</h2>\n  <p>Over 90% of web intrusions exploit third-party plugins. By decoupling the presentation layer from the database through Headless API architecture, custom systems provide military-grade resilience.</p>\n</section>\n\n<section id=\"conclusion\">\n  <h2 id=\"conclusion\">4. Strategic Decision Matrix & OnSupp Engineering</h2>\n  <p>OnSupp engineers high-performance custom web applications designed to outperform competitive benchmarks and multiply customer conversion funnels.</p>\n</section>\n",
    "readTimeFa": "۶ دقیقه مطالعه",
    "readTimeEn": "6 min read",
    "imageUrl": "/images/services/web-development.webp",
    "author": "دپارتمان مهندسی نرم‌افزار آن‌ساپ",
    "createdAt": "2026-10-28T14:30:00.000Z",
    "featured": false,
    "metaTitleFa": "طراحی سایت اختصاصی یا وردپرس؟ مقایسه فنی، امنیت و سرعت | آن‌ساپ",
    "metaTitleEn": "Custom Web Development vs WordPress Templates: Complete Guide | OnSupp",
    "metaDescFa": "مقایسه تخصصی طراحی وب‌سایت اختصاصی با قالب‌های آماده CMS از نظر سرعت لود، امنیت نفوذناپذیر، سئو تکنیکال و تجربه کاربری. راهنمای مدیران سازمان برای انتخاب آگاهانه.",
    "metaDescEn": "Compare custom web engineering versus WordPress CMS: deep dive into load speeds, vulnerability risks, scalable architecture, and conversion optimization.",
    "keywordsFa": "طراحی سایت اختصاصی, مقایسه وردپرس و سایت اختصاصی, طراحی وب Next.js, امنیت سایت, افزایش نرخ تبدیل, توسعه نرم افزار تحت وب",
    "keywordsEn": "Custom Web Development, Next.js Web Design, WordPress vs Custom, Web Performance, Conversion Rate Optimization",
    "canonicalUrl": "https://onsupp.ir/blog/editorial-ui-design-conversion-rate",
    "ogImage": "/images/services/web-development.webp",
    "faqs": [
      {
        "id": 1,
        "question": "چه زمانی یک کسب‌وکار باید حتماً به سراغ طراحی وب‌سایت اختصاصی برود؟",
        "answer": "زمانی که نیاز به معماری منحصربه‌فرد، سرعت بارگذاری زیر ۱ ثانیه، امنیت داده‌های حساس، قابلیت اتصال به نرم‌افزارهای داخلی سازمانی (مانند ERP یا CRM) و ترافیک بالای روزانه دارید، قالب‌های آماده جوابگوی شما نخواهند بود و طراحی اختصاصی ضروری است.",
        "order": 1
      },
      {
        "id": 2,
        "question": "آیا سئوی وب‌سایت‌های اختصاصی واقعاً بهتر از سایت‌های وردپرسی است؟",
        "answer": "بله، به دلیل کدهای بسیار سبک‌تر و بهینه‌سازی دقیق Core Web Vitals، امتیاز عملکردی سایت اختصاصی در تست‌های گوگل بالاتر بوده و ربات‌های خزنده با بودجه خزش کمتر می‌توانند صفحات بیشتری را ایندکس کنند.",
        "order": 2
      },
      {
        "id": 3,
        "question": "آیا در سایت اختصاصی هم امکان مدیریت آسان محتوا و وبلاگ وجود دارد؟",
        "answer": "کاملاً؛ در پروژه‌های آن‌ساپ یک پنل مدیریت محتوای اختصاصی و بسیار سریع طراحی می‌شود که مدیران سایت بدون نیاز به دانش کدنویسی می‌توانند مقالات، محصولات و تصاویر را به راحتی ویرایش و منتشر نمایند.",
        "order": 3
      },
      {
        "id": 4,
        "question": "تفاوت امنیت سایت اختصاصی با قالب‌های آماده چیست؟",
        "answer": "در سایت‌های اختصاصی هیچ افزونه شخص ثالث و کدهای ناشناخته استفاده نمی‌شود و با تفکیک فرانت‌اند و دیتابیس، امکان حملات تزریق کد و آسیب‌پذیری‌های متداول وردپرس به صفر میل می‌کند.",
        "order": 4
      }
    ]
  },
  {
    "id": 3,
    "titleFa": "ویدیو مارکتینگ و تولید محتوای استودیویی؛ راز ماندگاری برند و انفجار نرخ تبدیل در سال ۲۰۲۶",
    "titleEn": "Video Marketing & Cinematic Studio Media: The Engine of Retention and Conversions",
    "slug": "data-driven-growth-marketing-funnel",
    "categoryFa": "استودیو و تولید رسانه",
    "categoryEn": "Studio & Media Production",
    "excerptFa": "چرا بیش از ۸۲٪ ترافیک وب به محتوای ویدیویی تعلق دارد؟ راهنمای کاربردی تولید تیزرهای تبلیغاتی، پادکست‌های صنعتی و ویدیوهای سینمایی در استودیو تخصصی آن‌ساپ، همراه با تکنیک‌های افزایش زمان ماندگاری کاربر (Dwell Time) و اعتمادسازی عمیق برند.",
    "excerptEn": "How cinematic corporate video production, bespoke podcast recording, and visual storytelling elevate brand authority, boost dwell time, and maximize marketing conversions.",
    "contentFa": "\n<section id=\"intro\">\n  <h2>۱. انقلاب محتوای چندرسانه‌ای؛ چرا بدون ویدیو در بازار مدرن نادیده گرفته می‌شوید؟</h2>\n  <p>طبق آمارهای رسمی سیسکو و گزارش‌های رفتار مصرف‌کننده در سال ۲۰۲۶، بیش از <strong>۸۲ درصد از کل ترافیک اینترنت در سراسر جهان</strong> به تماشای ویدیو اختصاص پیدا کرده است. دوره اکتفا به مقالات صرفاً متنی یا تصاویر استوک به پایان رسیده است؛ کاربران امروزی انتظار دارند در کمتر از ۶۰ ثانیه، چهره، اصالت و قدرت خدمات یک برند را با بالاترین کیفیت بصری لمس کنند.</p>\n\n  <blockquote>\n    مخاطب تنها ۱۰٪ از پیامی را که در قالب متن خوانده به خاطر می‌سپارد، در حالی که ۹۵٪ از پیامی که در قالب یک ویدیوی سینمایی و جذاب دیده است را در ذهن نگاه می‌دارد.\n  </blockquote>\n\n  <p>ویدیو مارکتینگ قدرتمندترین ابزار برای ایجاد پیوند عاطفی و جلب اعتماد فوری خریداران در بازارهای فوق رقابتی امروزی است.</p>\n</section>\n\n<section id=\"section-1\">\n  <h2 id=\"section-1\">۲. تاثیر استراتژیک ویدیو و پادکست بر فاکتورهای سئو و زمان ماندگاری کاربر (Dwell Time)</h2>\n  <p>یکی از مهم‌ترین سیگنال‌های رتبه‌بندی الگوریتم‌های گوگل، مدت زمانی است که کاربر پس از ورود از نتایج جستجو در صفحه شما سپری می‌کند که به آن <strong>Dwell Time</strong> می‌گویند:</p>\n\n  <ul>\n    <li><strong>افزایش ۲.۶ برابری زمان حضور:</strong> صفحاتی که حاوی یک ویدیوی باکیفیت و اختصاصی هستند، ماندگاری مخاطب را تا بیش از ۱۵۰ درصد نسبت به صفحات متنی افزایش می‌دهند.</li>\n    <li><strong>کاهش محسوس نرخ پرش (Bounce Rate):</strong> هنگامی که کاربر در ثانیه‌های نخست با یک کاور جذاب و تیزر حرفه‌ای مواجه می‌شود، به جای بازگشت به نتایج گوگل، به تماشای ادامه ویدیو می‌پردازد.</li>\n    <li><strong>سئوی تخصصی ویدیو (Video SEO):</strong> با بارگذاری ویدیوها در پلتفرم‌های پخش و تنظیم تگ‌های اسکیما <code>VideoObject</code>، گوگل پیش‌نمایش ویدیوی سایت شما را در تب ویدیوی نتایج و اسنیپت‌های غنی نمایش می‌دهد.</li>\n  </ul>\n</section>\n\n<section id=\"section-2\">\n  <h2 id=\"section-2\">۳. استانداردها و امکانات فنی استودیو مدرن آن‌ساپ؛ از تصویربرداری ۴K تا صدابرداری تخصصی</h2>\n  <p>کیفیت ویدیوی شما نماینده مستقیم پرستیژ و تعهد کاری برند شماست. یک ویدیوی تار، با نور نامناسب یا صدای دارای نویز، بیش از آنکه سودمند باشد به اعتبار برند آسیب می‌زند. در <strong>استودیو رسانه و فیلم‌سازی آن‌ساپ</strong>، استانداردهای زیر در تمام پروژه‌ها پیاده‌سازی می‌شوند:</p>\n\n  <div class=\"table-responsive\">\n    <table>\n      <thead>\n        <tr>\n          <th>فرمت محتوایی</th>\n          <th>تجهیزات و متدولوژی فنی</th>\n          <th>هدف اصلی بازاریابی</th>\n        </tr>\n      </thead>\n      <tbody>\n        <tr>\n          <td><strong>تیزر تبلیغاتی سینمایی</strong></td>\n          <td>دوربین‌های سینمایی 4K/6K، نورپردازی ۳ نقطه‌ای، گیمبال و رنگ‌آمیزی حرفه‌ای (Color Grading)</td>\n          <td>برندسازی لوکس، اعتمادسازی و جذب مشتریان بزرگ</td>\n        </tr>\n        <tr>\n          <td><strong>پادکست سازمانی تخصصی</strong></td>\n          <td>اتاق آکوستیک بدون اکو، میکروفون‌های استودیویی Broadcast و ضبط چندکاناله صدا</td>\n          <td>خلق رهبری اندیشه (Thought Leadership) در صنعت</td>\n        </tr>\n        <tr>\n          <td><strong>محتوای کوتاه و ویروسی (Reels/Shorts)</strong></td>\n          <td>تدوین سریع و ریتمیک، موشن گرافیک تعاملی و زیرنویس اختصاصی فارسی</td>\n          <td>جذب انبوه مخاطب جدید در اینستاگرام و لینکدین</td>\n        </tr>\n      </tbody>\n    </table>\n  </div>\n</section>\n\n<section id=\"conclusion\">\n  <h2 id=\"conclusion\">۴. فرمول ۴ مرحله‌ای راه‌اندازی کمپین ویدیویی با بالاترین نرخ بازگشت سرمایه</h2>\n  <p>برای دستیابی به حداکثر بازگشت سرمایه (ROI) از ویدیو مارکتینگ، استراتژی تولید باید ساختارمند باشد:</p>\n  <ol>\n    <li><strong>ایده‌پردازی و سناریونویسی دقیق:</strong> نگارش متنی متناسب با پرسونای مخاطب، تعیین هوک (قلاب ۳ ثانیه اول) و پیام اصلی.</li>\n    <li><strong>تولید و تصویربرداری حرفه‌ای:</strong> ضبط در استودیوی مجهز یا لوکیشن صنعتی با سناریوی کارگردانی‌شده.</li>\n    <li><strong>پس‌تولید و تدوین سینمایی:</strong> انتخاب موسیقی ارجینال، جلوه‌های صوتی (Foley)، تصحیح رنگ و موشن گرافیک‌های داینامیک.</li>\n    <li><strong>توزیع هدفمند و سئو:</strong> بارگذاری با تایتل‌های بهینه‌شده، تامبنیل اختصاصی با کنتراست بالا و انتشار چندکاناله در وب‌سایت و رسانه‌های اجتماعی.</li>\n  </ol>\n  <p>استودیو تخصصی <strong>آن‌ساپ (OnSupp)</strong> با در اختیار داشتن کامل‌ترین تجهیزات تصویربرداری و صدا، همراه همیشگی شما در خلق تیزرهای سینمایی و پادکست‌های تاثیرگذار برای تصاحب سهم بازار است.</p>\n</section>\n",
    "contentEn": "\n<section id=\"intro\">\n  <h2>1. The Multimedia Revolution: Why Brands Without Video Are Invisible</h2>\n  <p>Over 82% of all internet consumer traffic is video. In modern competitive landscapes, high-production visual media is the single most potent trust accelerator for prospective buyers.</p>\n</section>\n\n<section id=\"section-1\">\n  <h2 id=\"section-1\">2. Organic Search Impact: Dwell Time & Video SEO</h2>\n  <p>Embedding dedicated, high-value videos extends page dwell time by over 150%, driving powerful behavioral engagement signals directly to search ranking algorithms.</p>\n</section>\n\n<section id=\"section-2\">\n  <h2 id=\"section-2\">3. Studio Production Standards: 4K Cinematography & Studio Acoustics</h2>\n  <p>From industrial commercial film to multi-track broadcast corporate podcasts, OnSupp's production studio merges cinema cameras with acoustic precision.</p>\n</section>\n\n<section id=\"conclusion\">\n  <h2 id=\"conclusion\">4. Four-Step Framework for Maximum Video ROI</h2>\n  <p>Conceptual scripting, high-definition production, rhythmic sound design, and targeted distribution ensure your brand narrative resonates powerfully.</p>\n</section>\n",
    "readTimeFa": "۸ دقیقه مطالعه",
    "readTimeEn": "8 min read",
    "imageUrl": "/images/services/studio-production.webp",
    "author": "استودیو فیلم‌سازی و رسانه آن‌ساپ",
    "createdAt": "2026-11-01T11:20:00.000Z",
    "featured": false,
    "metaTitleFa": "راهنمای ویدیو مارکتینگ و تولید محتوای استودیویی ۲۰۲۶ | آن‌ساپ",
    "metaTitleEn": "Corporate Video Marketing & Studio Production Strategy Guide | OnSupp",
    "metaDescFa": "استراتژی‌های مدرن ویدیو مارکتینگ، تولید تیزرهای سینمایی و پادکست حرفه‌ای سازمانی. یاد بگیرید چگونه با تولید محتوای استودیویی نرخ تعامل و فروش برند خود را چندین برابر کنید.",
    "metaDescEn": "Comprehensive video marketing and studio media guide: cinematic videography, corporate podcasting, YouTube SEO, and high-impact visual narratives.",
    "keywordsFa": "ویدیو مارکتینگ, استودیو تولید محتوا, تیزر تبلیغاتی صنعتی, پادکست سازمانی, سئو ویدیو, dwell time, استودیو آن‌ساپ",
    "keywordsEn": "Video Marketing, Corporate Podcasting, Cinematic Commercial, Video SEO, Dwell Time Optimization",
    "canonicalUrl": "https://onsupp.ir/blog/data-driven-growth-marketing-funnel",
    "ogImage": "/images/services/studio-production.webp",
    "faqs": [
      {
        "id": 1,
        "question": "ویدیو مارکتینگ چگونه باعث بهبود رتبه سئو سایت در گوگل می‌شود؟",
        "answer": "وجود ویدیو در صفحات سایت باعث افزایش چشمگیر میانگین زمان حضور کاربر (Dwell Time) و کاهش نرخ پرش (Bounce Rate) می‌شود. علاوه بر این، استفاده از اسکیماهای VideoObject شانس نمایش مستقیم ویدیو در صفحه اول نتایج جستجو را ایجاد می‌کند.",
        "order": 1
      },
      {
        "id": 2,
        "question": "یک استودیوی استاندارد تولید محتوای رسانه‌ای چه ویژگی‌هایی دارد؟",
        "answer": "یک استودیوی استاندارد نیازمند اتاق آکوستیک با عایق‌بندی صوتی کامل، سیستم نورپردازی حرفه‌ای ۳ نقطه‌ای قابل تنظیم، دوربین‌های سینمایی با عمق میدان واقعی، میکروفون‌های کاندنسر استودیویی و پس‌زمینه‌های متنوع دکوراتیو است.",
        "order": 2
      },
      {
        "id": 3,
        "question": "آیا تولید تیزر و ویدیوی تبلیغاتی فقط برای برندهای بزرگ مناسب است؟",
        "answer": "خیر؛ امروزه حتی استارتاپ‌ها و کسب‌وکارهای محلی نیز برای جلب اعتماد سریع مخاطب و متمایز شدن از رقبا، به ویدیوهای معرفی خدمات و ویدیوهای تعاملی در شبکه‌های اجتماعی نیاز مبرم دارند.",
        "order": 3
      },
      {
        "id": 4,
        "question": "بهترین فرمت و زمان ویدیو برای وب‌سایت چیست؟",
        "answer": "برای صفحات اصلی و معرفی خدمات، ویدیوهای ۶۰ تا ۹۰ ثانیه‌ای با فرمت MP4 و کدک بهینه‌شده H.264/H.265 و وضوح 1080p بیشترین اثربخشی را بدون افت سرعت لود سایت به همراه دارند.",
        "order": 4
      }
    ]
  }
];
  const officialSlugs = officialArticlesData.map(a => a.slug);

  for (const a of officialArticlesData) {
    const articlePayload = {
      titleFa: a.titleFa || '',
      titleEn: a.titleEn || '',
      language: (a as any).language || 'fa',
      categoryFa: a.categoryFa || 'آموزش سئو',
      categoryEn: a.categoryEn || 'SEO Tutorial',
      excerptFa: a.excerptFa || '',
      excerptEn: a.excerptEn || '',
      contentFa: a.contentFa || '',
      contentEn: a.contentEn || '',
      readTimeFa: a.readTimeFa || '۵ دقیقه مطالعه',
      readTimeEn: a.readTimeEn || '5 min read',
      imageUrl: a.imageUrl || '',
      author: a.author || 'آن‌ساپ',
      published: true,
      metaTitleFa: a.metaTitleFa || '',
      metaTitleEn: a.metaTitleEn || '',
      metaDescFa: a.metaDescFa || '',
      metaDescEn: a.metaDescEn || '',
      keywordsFa: a.keywordsFa || '',
      keywordsEn: a.keywordsEn || '',
      canonicalUrl: a.canonicalUrl || '',
      ogImage: a.ogImage || a.imageUrl || '',
      createdAt: new Date(a.createdAt),
    };

    const upserted = await prisma.article.upsert({
      where: { slug: a.slug },
      update: articlePayload,
      create: {
        slug: a.slug,
        ...articlePayload,
      },
    });

    if (a.faqs && a.faqs.length > 0) {
      await prisma.articleFaq.deleteMany({ where: { articleId: upserted.id } });
      await prisma.articleFaq.createMany({
        data: a.faqs.map((faq, idx) => ({
          articleId: upserted.id,
          question: faq.question,
          answer: faq.answer,
          order: faq.order || idx + 1,
        })),
      });
    }
  }

  // Safely clean up any obsolete legacy/test articles
  const obsoleteArticles = await prisma.article.findMany({
    where: { slug: { notIn: officialSlugs } },
    select: { id: true, slug: true },
  });
  if (obsoleteArticles.length > 0) {
    for (const oa of obsoleteArticles) {
      await prisma.comment.deleteMany({ where: { articleId: oa.id } });
      await prisma.articleFaq.deleteMany({ where: { articleId: oa.id } });
      await prisma.article.delete({ where: { id: oa.id } });
    }
    console.log('[seed] Cleaned up obsolete test articles count:', obsoleteArticles.length);
  }
  console.log('[seed] Official articles upsert completed successfully.');

  // 10. Seed default Testimonials
  const testimonialsCount = await prisma.testimonial.count();
  if (testimonialsCount === 0) {
    await prisma.testimonial.createMany({
      data: [
        {
          quoteFa:
            'بازطراحی معماری فنی و استراتژی سئوی سایت ما با همراهی تیم آن‌ساپ باعث شد سرعت بارگذاری صفحات به شکل محسوسی بهبود پیدا کند و ورودی ارگانیک هدفمند در کمتر از چهار ماه رشد پایداری را تجربه کند.',
          quoteEn:
            'Redesigning our technical architecture and SEO strategy with the OnSupp team significantly improved page speed and delivered sustainable organic traffic growth within four months.',
          authorFa: 'مهندس علیرضا رضایی',
          authorEn: 'Alireza Rezaei',
          roleFa: 'مدیر ارشد محصول',
          roleEn: 'VP of Product',
          companyFa: 'پلتفرم خدمات مالی',
          companyEn: 'Fintech Platform',
          serviceTagFa: 'سئو و مهندسی وب',
          serviceTagEn: 'SEO & Web Engineering',
          highlightFa: 'رشد مستمر ترافیک ارگانیک',
          highlightEn: 'Consistent Organic Growth',
          isActive: true,
          position: 0,
        },
        {
          quoteFa:
            'آنچه همکاری با آن‌ساپ را متمایز می‌کند، نگاه داده‌محور در کنار درک عمیق از هویت بصری برند است. خروجی نهایی رابط کاربری دقیقاً هم‌راستا با استانداردهای سازمانی ما و نیاز واقعی کاربران شکل گرفت.',
          quoteEn:
            'What sets OnSupp apart is their data-driven mindset paired with a deep understanding of brand identity. The final UI aligned seamlessly with our enterprise standards and user needs.',
          authorFa: 'دکتر سارا احمدی',
          authorEn: 'Dr. Sara Ahmadi',
          roleFa: 'مدیر بازاریابی و برند',
          roleEn: 'Brand & Marketing Director',
          companyFa: 'مجموعه تجارت الکترونیک',
          companyEn: 'E-Commerce Group',
          serviceTagFa: 'طراحی محصول و برندینگ',
          serviceTagEn: 'Product Design & Branding',
          highlightFa: 'ارتقای نرخ تعامل کاربران',
          highlightEn: 'Higher User Engagement',
          isActive: true,
          position: 1,
        },
        {
          quoteFa:
            'گزارش‌دهی شفاف، زمان‌بندی دقیق در تحویل اسپرینت‌ها و پشتیبانی فنی مستمر باعث شد فرآیند توسعه سامانه اختصاصی ما بدون چالش پیش برود و تیم داخلی ما با اطمینان کامل محصول را مقیاس دهد.',
          quoteEn:
            'Transparent reporting, punctual sprint deliveries, and continuous technical support allowed our custom platform development to proceed smoothly and scale with confidence.',
          authorFa: 'مهندس پویا شمس',
          authorEn: 'Pouya Shams',
          roleFa: 'هم‌بنیان‌گذار و مدیر فنی',
          roleEn: 'Co-Founder & CTO',
          companyFa: 'استارتاپ فناوری سلامت',
          companyEn: 'HealthTech Startup',
          serviceTagFa: 'توسعه نرم‌افزار اختصاصی',
          serviceTagEn: 'Custom Software Dev',
          highlightFa: 'پایداری و مقیاس‌پذیری بالا',
          highlightEn: 'High System Scalability',
          isActive: true,
          position: 2,
        },
      ],
    });
    console.log('[seed] Default testimonials created: 3');
  } else {
    console.log('[seed] Testimonials already exist. Skipping creation.');
  }

  // ─── Seed Portfolio Categories & Attribute Templates (PHASE 4) ────────────
  await seedPortfolioCategoriesAndTemplates(prisma);

  console.log('Seeding completed successfully!');
}

async function seedPortfolioCategoriesAndTemplates(p: PrismaClient) {
  console.log('[seed] Syncing dynamic portfolio categories & templates...');

  const categories = [
    {
      slug: 'website-design',
      titleFa: 'طراحی سایت و وب‌اپلیکیشن',
      titleEn: 'Website Design & Web Apps',
      descriptionFa: 'طراحی و مهندسی پلتفرم‌های مدرن وب با سرعت بارگذاری فوق‌العاده و سیستم دیزاین اختصاصی',
      descriptionEn: 'High-performance bespoke web architectures, Next.js platforms, and headless CMS portals.',
      icon: 'code',
      color: '#8AB3A0',
      position: 0,
      attributes: [
        {
          key: 'website_type',
          titleFa: 'نوع وب‌سایت',
          titleEn: 'Website Type',
          type: 'TEXT' as const,
          isRequired: true,
          unit: '',
          position: 0,
          showInFrontend: true,
        },
        {
          key: 'tech_stack',
          titleFa: 'تکنولوژی‌های استفاده‌شده',
          titleEn: 'Tech Stack',
          type: 'TEXT' as const,
          isRequired: false,
          unit: '',
          position: 1,
          showInFrontend: true,
        },
        {
          key: 'page_count',
          titleFa: 'تعداد صفحات و ماژول‌ها',
          titleEn: 'Pages & Modules',
          type: 'NUMBER' as const,
          isRequired: false,
          unit: 'صفحه',
          position: 2,
          showInFrontend: true,
        },
        {
          key: 'custom_features',
          titleFa: 'امکانات اختصاصی پیاده‌شده',
          titleEn: 'Custom Features',
          type: 'TEXTAREA' as const,
          isRequired: false,
          unit: '',
          position: 3,
          showInFrontend: true,
        },
        {
          key: 'speed_score',
          titleFa: 'امتیاز سرعت و عملکرد (Lighthouse)',
          titleEn: 'Performance Score',
          type: 'NUMBER' as const,
          isRequired: false,
          unit: 'از ۱۰۰',
          position: 4,
          showInFrontend: true,
        },
        {
          key: 'ux_improvement',
          titleFa: 'بهبود تجربه کاربری و تعامل',
          titleEn: 'UX & Engagement Improvement',
          type: 'PERCENTAGE' as const,
          isRequired: false,
          unit: '٪',
          position: 5,
          showInFrontend: true,
        },
      ],
    },
    {
      slug: 'seo',
      titleFa: 'سئو تکنیکال و رشد ارگانیک',
      titleEn: 'Technical SEO & Organic Growth',
      descriptionFa: 'بهینه‌سازی عمیق ساختار فنی سایت برای خزنده‌های گوگل، افزایش ورودی ارگانیک و تثبیت در صفحه اول',
      descriptionEn: 'Technical crawl budget optimization, Core Web Vitals, and sustainable top-page organic rankings.',
      icon: 'trending-up',
      color: '#C59B27',
      position: 1,
      attributes: [
        {
          key: 'project_duration',
          titleFa: 'بازه زمانی پروژه',
          titleEn: 'Project Duration',
          type: 'TEXT' as const,
          isRequired: false,
          unit: 'ماه',
          position: 0,
          showInFrontend: true,
        },
        {
          key: 'organic_clicks',
          titleFa: 'کلیک ارگانیک ماهانه',
          titleEn: 'Monthly Organic Clicks',
          type: 'NUMBER' as const,
          isRequired: false,
          unit: 'کلیک',
          position: 1,
          showInFrontend: true,
        },
        {
          key: 'impressions',
          titleFa: 'ایمپرشن سرچ کنسول',
          titleEn: 'Search Impressions',
          type: 'NUMBER' as const,
          isRequired: false,
          unit: 'نمایش',
          position: 2,
          showInFrontend: true,
        },
        {
          key: 'ctr',
          titleFa: 'نرخ کلیک (CTR)',
          titleEn: 'Click-Through Rate (CTR)',
          type: 'PERCENTAGE' as const,
          isRequired: false,
          unit: '٪',
          position: 3,
          showInFrontend: true,
        },
        {
          key: 'avg_position',
          titleFa: 'میانگین رتبه در نتایج گوگل',
          titleEn: 'Average Position',
          type: 'NUMBER' as const,
          isRequired: false,
          unit: 'رتبه',
          position: 4,
          showInFrontend: true,
        },
        {
          key: 'page_one_keywords',
          titleFa: 'تعداد کلمات کلیدی صفحه اول',
          titleEn: 'Page-One Keywords',
          type: 'NUMBER' as const,
          isRequired: false,
          unit: 'کلمه کلیدی',
          position: 5,
          showInFrontend: true,
        },
        {
          key: 'traffic_growth',
          titleFa: 'افزایش ورودی ارگانیک',
          titleEn: 'Organic Traffic Growth',
          type: 'PERCENTAGE' as const,
          isRequired: false,
          unit: '٪',
          position: 6,
          showInFrontend: true,
        },
        {
          key: 'before_after_seo',
          titleFa: 'مقایسه عملکرد سئو (قبل / بعد)',
          titleEn: 'Before / After SEO Benchmark',
          type: 'BEFORE_AFTER' as const,
          isRequired: false,
          unit: '',
          position: 7,
          showInFrontend: true,
        },
      ],
    },
    {
      slug: 'instagram-management',
      titleFa: 'مدیریت اینستاگرام و شبکه‌های اجتماعی',
      titleEn: 'Instagram & Social Media Management',
      descriptionFa: 'سناریونویسی، تولید محتوای استودیویی فاخر، مدیریت تعاملات و کمپین‌های تبلیغاتی اثربخش',
      descriptionEn: 'Studio-grade reel production, narrative scripting, community growth, and high-conversion social campaigns.',
      icon: 'instagram',
      color: '#D4A5A8',
      position: 2,
      attributes: [
        {
          key: 'management_duration',
          titleFa: 'بازه زمانی مدیریت',
          titleEn: 'Management Duration',
          type: 'TEXT' as const,
          isRequired: false,
          unit: 'ماه',
          position: 0,
          showInFrontend: true,
        },
        {
          key: 'followers_count',
          titleFa: 'رشد فالوور هدفمند',
          titleEn: 'Followers Growth',
          type: 'NUMBER' as const,
          isRequired: false,
          unit: 'فالوور',
          position: 1,
          showInFrontend: true,
        },
        {
          key: 'reach',
          titleFa: 'ریچ ماهانه (Reach)',
          titleEn: 'Monthly Reach',
          type: 'NUMBER' as const,
          isRequired: false,
          unit: 'اکانت',
          position: 2,
          showInFrontend: true,
        },
        {
          key: 'impressions',
          titleFa: 'ایمپرشن کل (Impressions)',
          titleEn: 'Total Impressions',
          type: 'NUMBER' as const,
          isRequired: false,
          unit: 'ویو',
          position: 3,
          showInFrontend: true,
        },
        {
          key: 'engagement_rate',
          titleFa: 'نرخ تعامل (Engagement Rate)',
          titleEn: 'Engagement Rate',
          type: 'PERCENTAGE' as const,
          isRequired: false,
          unit: '٪',
          position: 4,
          showInFrontend: true,
        },
        {
          key: 'profile_visits',
          titleFa: 'بازدید پروفایل',
          titleEn: 'Profile Visits',
          type: 'NUMBER' as const,
          isRequired: false,
          unit: 'بازدید',
          position: 5,
          showInFrontend: true,
        },
        {
          key: 'content_count',
          titleFa: 'تعداد محتوای تولیدشده',
          titleEn: 'Produced Content Count',
          type: 'NUMBER' as const,
          isRequired: false,
          unit: 'پست و ریلز',
          position: 6,
          showInFrontend: true,
        },
        {
          key: 'generated_leads',
          titleFa: 'سرنخ‌ها و دایرکت‌های جذب‌شده',
          titleEn: 'Generated Direct Leads',
          type: 'NUMBER' as const,
          isRequired: false,
          unit: 'لید مستقیم',
          position: 7,
          showInFrontend: true,
        },
      ],
    },
    {
      slug: 'branding',
      titleFa: 'برندینگ و هویت بصری',
      titleEn: 'Branding & Visual Identity',
      descriptionFa: 'خلق هویت پایدار برند، استراتژی لحن و روایت، دیزاین کتابچه هویت (Brand Book) و اقلام لوکس',
      descriptionEn: 'Strategic brand identity, narrative guidelines, brand book design, and premium collateral materials.',
      icon: 'sparkles',
      color: '#E07A8B',
      position: 3,
      attributes: [
        {
          key: 'branding_project_type',
          titleFa: 'نوع پروژه برندینگ',
          titleEn: 'Branding Project Type',
          type: 'TEXT' as const,
          isRequired: false,
          unit: '',
          position: 0,
          showInFrontend: true,
        },
        {
          key: 'designed_items',
          titleFa: 'اقلام و المان‌های طراحی‌شده',
          titleEn: 'Designed Collateral Items',
          type: 'TEXTAREA' as const,
          isRequired: false,
          unit: '',
          position: 1,
          showInFrontend: true,
        },
        {
          key: 'brand_strategy',
          titleFa: 'استراتژی و هویت برند',
          titleEn: 'Brand Strategy & Persona',
          type: 'TEXTAREA' as const,
          isRequired: false,
          unit: '',
          position: 2,
          showInFrontend: true,
        },
        {
          key: 'deliverables',
          titleFa: 'خروجی‌های نهایی پروژه',
          titleEn: 'Deliverables & Brand Book',
          type: 'TEXTAREA' as const,
          isRequired: false,
          unit: '',
          position: 3,
          showInFrontend: true,
        },
        {
          key: 'provided_services',
          titleFa: 'خدمات ارائه‌شده',
          titleEn: 'Provided Services',
          type: 'TEXT' as const,
          isRequired: false,
          unit: '',
          position: 4,
          showInFrontend: true,
        },
      ],
    },
    {
      slug: 'other',
      titleFa: 'سایر خدمات و سامانه‌های اختصاصی',
      titleEn: 'Other Bespoke Solutions',
      descriptionFa: 'توسعه نرم‌افزارهای سفارشی، اتوماسیون سازمانی، سامانه‌های کلود و خدمات جامع مقیاس‌پذیر',
      descriptionEn: 'Custom software architecture, CRM workflows, cloud automation, and integrated business systems.',
      icon: 'grid',
      color: '#94A3B8',
      position: 4,
      attributes: [
        {
          key: 'service_scope',
          titleFa: 'محدوده و شرح خدمات پروژه',
          titleEn: 'Project Scope & Requirements',
          type: 'TEXTAREA' as const,
          isRequired: false,
          unit: '',
          position: 0,
          showInFrontend: true,
        },
        {
          key: 'kpi_metric',
          titleFa: 'شاخص کلیدی موفقیت (KPI)',
          titleEn: 'Primary KPI Achievement',
          type: 'PERCENTAGE' as const,
          isRequired: false,
          unit: '٪',
          position: 1,
          showInFrontend: true,
        },
        {
          key: 'project_link',
          titleFa: 'لینک دسترسی یا مستندات سیستم',
          titleEn: 'System Access or Live URL',
          type: 'LINK' as const,
          isRequired: false,
          unit: '',
          position: 2,
          showInFrontend: true,
        },
      ],
    },
  ];

  const categoryIdMap: Record<string, number> = {};

  for (const cat of categories) {
    const upsertedCat = await p.portfolioCategory.upsert({
      where: { slug: cat.slug },
      update: {
        titleFa: cat.titleFa,
        titleEn: cat.titleEn,
        descriptionFa: cat.descriptionFa,
        descriptionEn: cat.descriptionEn,
        icon: cat.icon,
        color: cat.color,
        position: cat.position,
        isActive: true,
      },
      create: {
        slug: cat.slug,
        titleFa: cat.titleFa,
        titleEn: cat.titleEn,
        descriptionFa: cat.descriptionFa,
        descriptionEn: cat.descriptionEn,
        icon: cat.icon,
        color: cat.color,
        position: cat.position,
        isActive: true,
      },
    });

    categoryIdMap[cat.slug] = upsertedCat.id;

    for (const attr of cat.attributes) {
      await p.portfolioAttributeTemplate.upsert({
        where: {
          categoryId_key: {
            categoryId: upsertedCat.id,
            key: attr.key,
          },
        },
        update: {
          titleFa: attr.titleFa,
          titleEn: attr.titleEn,
          type: attr.type as any,
          isRequired: attr.isRequired,
          unit: attr.unit,
          position: attr.position,
          showInFrontend: attr.showInFrontend,
          isActive: true,
        },
        create: {
          categoryId: upsertedCat.id,
          key: attr.key,
          titleFa: attr.titleFa,
          titleEn: attr.titleEn,
          type: attr.type as any,
          isRequired: attr.isRequired,
          unit: attr.unit,
          position: attr.position,
          showInFrontend: attr.showInFrontend,
          isActive: true,
        },
      });
    }
  }

  // Link canonical case studies to appropriate categories and populate sample dynamic values
  const webDesignId = categoryIdMap['website-design'];
  const brandingId = categoryIdMap['branding'];

  if (webDesignId) {
    const webProjects = [
      'dr-miresmaeli-clinic',
      'canza-construction',
      'dr-hatam-clinic',
      'dr-akhavan-dental',
      'shams-dentistry',
      'shayan-dental',
    ];

    for (const slug of webProjects) {
      const cs = await p.caseStudy.findFirst({ where: { slug } });
      if (cs) {
        await p.caseStudy.update({
          where: { id: cs.id },
          data: { categoryId: webDesignId },
        });

        // Seed dynamic attribute values
        await p.portfolioAttributeValue.upsert({
          where: { caseStudyId_attributeKey: { caseStudyId: cs.id, attributeKey: 'website_type' } },
          update: { valueText: cs.taglineFa || 'پرتال اختصاصی و وب‌سایت پرفورمنس‌محور' },
          create: { caseStudyId: cs.id, attributeKey: 'website_type', type: 'TEXT' as any, valueText: cs.taglineFa || 'پرتال اختصاصی و وب‌سایت پرفورمنس‌محور' },
        });

        await p.portfolioAttributeValue.upsert({
          where: { caseStudyId_attributeKey: { caseStudyId: cs.id, attributeKey: 'tech_stack' } },
          update: { valueText: 'Next.js 16, TypeScript, Tailwind CSS, PostgreSQL, Cloudflare Edge' },
          create: { caseStudyId: cs.id, attributeKey: 'tech_stack', type: 'TEXT' as any, valueText: 'Next.js 16, TypeScript, Tailwind CSS, PostgreSQL, Cloudflare Edge' },
        });

        await p.portfolioAttributeValue.upsert({
          where: { caseStudyId_attributeKey: { caseStudyId: cs.id, attributeKey: 'speed_score' } },
          update: { valueNumber: 99, valueText: '۹۹' },
          create: { caseStudyId: cs.id, attributeKey: 'speed_score', type: 'NUMBER' as any, valueNumber: 99, valueText: '۹۹' },
        });

        await p.portfolioAttributeValue.upsert({
          where: { caseStudyId_attributeKey: { caseStudyId: cs.id, attributeKey: 'ux_improvement' } },
          update: { valueNumber: 160, valueText: '+۱۶۰٪' },
          create: { caseStudyId: cs.id, attributeKey: 'ux_improvement', type: 'PERCENTAGE' as any, valueNumber: 160, valueText: '+۱۶۰٪' },
        });
      }
    }
  }

  if (brandingId) {
    const brandingProjects = ['pendar-art'];
    for (const slug of brandingProjects) {
      const cs = await p.caseStudy.findFirst({ where: { slug } });
      if (cs) {
        await p.caseStudy.update({
          where: { id: cs.id },
          data: { categoryId: brandingId },
        });

        await p.portfolioAttributeValue.upsert({
          where: { caseStudyId_attributeKey: { caseStudyId: cs.id, attributeKey: 'branding_project_type' } },
          update: { valueText: 'هویت بصری جامع برند و طراحی کالکشن بین‌المللی' },
          create: { caseStudyId: cs.id, attributeKey: 'branding_project_type', type: 'TEXT' as any, valueText: 'هویت بصری جامع برند و طراحی کالکشن بین‌المللی' },
        });
      }
    }
  }

  console.log('[seed] Dynamic portfolio categories & templates synced successfully.');
}

const isDirectExecution = process.argv[1] && (
  process.argv[1].endsWith('seed.ts') ||
  process.argv[1].endsWith('seed.js')
);

if (isDirectExecution) {
  main()
    .catch((e) => {
      console.error('[seed] Error:', e.message || e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
