import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

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

  // 6. Validate port strictly (must be 5434)
  const port = parsedUrl.port;
  if (port !== '5434') {
    const errorMsg = `[seed FATAL] Database port "${port}" is not approved for local development. Expected port 5434.`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  // 7. Validate database name strictly (must be exactly onsupp_dev)
  const dbName = parsedUrl.pathname.replace(/^\/+/, '').split('/')[0].trim();
  if (dbName === 'onsupp_migration_test') {
    const errorMsg = '[seed FATAL] Target database "onsupp_migration_test" is restricted to migration testing and cannot be seeded.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
  if (dbName !== 'onsupp_dev' && dbName !== 'onsupp_redesign') {
    const errorMsg = `[seed FATAL] Target database "${dbName}" is not approved for seeding. Only "onsupp_dev" or "onsupp_redesign" is permitted.`;
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
        title: 'سئو و بهینه‌سازی',
        titleEn: 'SEO & Optimization',
        subtitle: 'بهینه‌سازی برای موتورهای جستجو',
        subtitleEn: 'Visibility on search engines',
        imageUrl:
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80&auto=format&fit=crop',
        imageAlt: 'SEO & Optimization',
        position: 0,
      },
      {
        title: 'تبلیغات دیجیتال',
        titleEn: 'Digital Advertising',
        subtitle: 'کمپین‌های هدفمند و پربازده',
        subtitleEn: 'Targeted, high-ROI campaigns',
        imageUrl:
          'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80&auto=format&fit=crop',
        imageAlt: 'Digital Advertising',
        position: 1,
      },
      {
        title: 'شبکه‌های اجتماعی',
        titleEn: 'Social Media',
        subtitle: 'همراه مخاطبان در همه پلتفرم‌ها',
        subtitleEn: 'Engage across every platform',
        imageUrl:
          'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80&auto=format&fit=crop',
        imageAlt: 'Social Media',
        position: 2,
      },
      {
        title: 'طراحی وب',
        titleEn: 'Web Design',
        subtitle: 'طراحی مدرن و کاربرمحور',
        subtitleEn: 'Modern, user-centered design',
        imageUrl:
          'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&q=80&auto=format&fit=crop',
        imageAlt: 'Web Design',
        position: 3,
      },
      {
        title: 'برندینگ',
        titleEn: 'Branding',
        subtitle: 'ساخت هویت بصری ماندگار',
        subtitleEn: 'Build an enduring visual identity',
        imageUrl:
          'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80&auto=format&fit=crop',
        imageAlt: 'Branding',
        position: 4,
      },
      {
        title: 'تحلیل داده',
        titleEn: 'Data Analytics',
        subtitle: 'تصمیم‌گیری بر پایه داده',
        subtitleEn: 'Make decisions from data',
        imageUrl:
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80&auto=format&fit=crop',
        imageAlt: 'Data Analytics',
        position: 5,
      },
      {
        title: 'بازاریابی ایمیلی',
        titleEn: 'Email Marketing',
        subtitle: 'حفظ ارتباط و افزایش بازگشت',
        subtitleEn: 'Retention and repeat conversions',
        imageUrl:
          'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800&q=80&auto=format&fit=crop',
        imageAlt: 'Email Marketing',
        position: 6,
      },
      {
        title: 'طراحی موشن',
        titleEn: 'Motion Design',
        subtitle: 'محتوای ویدئویی جذاب',
        subtitleEn: 'Captivating motion content',
        imageUrl:
          'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80&auto=format&fit=crop',
        imageAlt: 'Motion Design',
        position: 7,
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
        valueFa: '+۷۰۰',
        valueEn: '700+',
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

  // 9. Seed Articles (Idempotent: only if no articles exist)
  const existingArticles = await prisma.article.count();
  if (existingArticles === 0) {
    console.log('[seed] Seeding initial articles...');

    await prisma.article.create({
      data: {
        titleFa: 'راهنمای جامع سئو تکنیکال (Technical SEO) در سال ۲۰۲۶؛ چک‌لیست معماری وب و فاکتورهای حیاتی گوگل',
        titleEn: 'The Ultimate Guide to Technical SEO in 2026: Modern Web Architecture & Google Vitals',
        slug: 'technical-seo-modern-web-architecture',
        categoryFa: 'سئو و رشد ارگانیک',
        categoryEn: 'Technical SEO & Growth',
        excerptFa: 'راهنمای گام‌به‌گام و تخصصی بهینه‌سازی فنی وب‌سایت‌ها برای خزنده‌های نوین گوگل در سال ۲۰۲۶؛ بررسی عمیق معماری Next.js، شاخص‌های Core Web Vitals (INP, LCP, CLS)، بهینه‌سازی بودجه خزش و اسکیماهای معنایی ساختاریافته.',
        excerptEn: 'A comprehensive technical blueprint for optimizing modern web platforms for Google crawlers: SSR/SSG rendering, Core Web Vitals (INP, LCP, CLS), crawl budget, and semantic schema architecture.',
        contentFa: `<section id="intro">
  <h2>۱. سئو تکنیکال در عصر هوش مصنوعی؛ چرا زیرساخت فنی پادشاه جدید است؟</h2>
  <p>در سال ۲۰۲۶ با گسترش موتورهای جستجوی مبتنی بر هوش مصنوعی (Google SGE و پردازش چندوجهی Gemini)، نحوه بررسی و ارزیابی صفحات وب توسط ربات‌های خزنده‌گر متحول شده است. امروزه دیگر تولید محتوای متنی صرف بدون داشتن یک <strong>زیرساخت فنی بی‌نقص و پرسرعت</strong>، هیچ شانسی برای تثبیت رتبه در صفحه اول نتایج جستجو ندارد.</p>
  <blockquote>سئو تکنیکال (Technical SEO) هنر و مهندسی آماده‌سازی پلتفرم وب شماست به گونه‌ای که خزنده‌های گوگل بتوانند در کمترین زمان ممکن، بدون خطاهای رندرینگ و با کمترین مصرف منابع پردازشی، محتوای صفحات را درک و ایندکس کنند.</blockquote>
</section>
<section id="section-1">
  <h2 id="section-1">۲. شاخص‌های حیاتی وب (Core Web Vitals ۲۰۲۶) و ارتقای پرفورمنس</h2>
  <p>شاخص INP باید زیر ۲۰۰ میلی‌ثانیه و LCP زیر ۱.۵ ثانیه نگه داشته شود تا نرخ پرش کاربران به حداقل برسد.</p>
</section>
<section id="section-2">
  <h2 id="section-2">۳. معماری رندرینگ Next.js، بودجه خزش و داده‌های ساختاریافته (Schema Markup)</h2>
  <p>ترکیب SSR و SSG در Next.js تضمین می‌کند که خزنده‌ها بدون تاخیر کلاینت به HTML کامل دسترسی داشته باشند.</p>
</section>
<section id="conclusion">
  <h2 id="conclusion">۴. چک‌لیست نهایی ممیزی سئو تکنیکال و جمع‌بندی</h2>
  <p>تیم مهندسی و متخصصان سئوی تکنیکال آن‌ساپ با آنالیز اختصاصی کدها و سرورها، مسیر رسیدن به لینک یک گوگل را هموار می‌کنند.</p>
</section>`,
        contentEn: `<section id="intro"><h2>1. Technical SEO in the AI Era</h2><p>Foundational engineering ensures search engines crawl and index with zero friction.</p></section>`,
        readTimeFa: '۷ دقیقه مطالعه',
        readTimeEn: '7 min read',
        imageUrl: '/images/services/technical-seo.webp',
        author: 'دپارتمان سئو و معماری نرم‌افزار آن‌ساپ',
        metaTitleFa: 'راهنمای جامع سئو تکنیکال ۲۰۲۶ | چک‌لیست معماری وب و افزایش رتبه گوگل | آن‌ساپ',
        metaTitleEn: 'Complete Technical SEO Guide 2026: Core Web Vitals & Web Architecture | OnSupp',
        metaDescFa: 'راهنمای عملی سئو تکنیکال (Technical SEO) برای وب‌اپلیکیشن‌های مدرن. بهینه‌سازی سرعت LCP و INP، معماری Next.js، بودجه خزش و استانداردهای گوگل ۲۰۲۶ با متخصصان آن‌ساپ.',
        metaDescEn: 'Master Technical SEO in 2026: Next.js rendering, Core Web Vitals benchmarks, crawl budget management, and schema architecture for enterprise growth.',
        keywordsFa: 'سئو تکنیکال, Technical SEO, چک لیست سئو تکنیکال, Core Web Vitals, سئو Next.js',
        canonicalUrl: 'https://onsupp.ir/blog/technical-seo-modern-web-architecture',
        published: true,
        faqs: {
          create: [
            {
              question: 'سئو تکنیکال (Technical SEO) دقیقاً چیست و چه فرقی با سئوی محتوایی دارد؟',
              answer: 'سئو تکنیکال بر زیرساخت‌های مهندسی وب‌سایت مانند سرعت، ساختار کدها، Core Web Vitals و دیتای اسکیما تمرکز دارد.',
              order: 1,
            },
            {
              question: 'شاخص INP در Core Web Vitals چیست و چرا جایگزین FID شد؟',
              answer: 'شاخص Interaction to Next Paint سرعت پاسخگویی و لگ بصری تمام تعاملات کاربر در طول صفحه را اندازه می‌گیرد و باید زیر ۲۰۰ میلی‌ثانیه باشد.',
              order: 2,
            },
          ],
        },
      },
    });

    await prisma.article.create({
      data: {
        titleFa: 'طراحی سایت اختصاصی یا وردپرس؟ تحلیل فنی، امنیت، سرعت و نرخ بازگشت سرمایه (ROI)',
        titleEn: 'Custom Web Engineering vs WordPress CMS: Performance, Security & Conversion Rates',
        slug: 'editorial-ui-design-conversion-rate',
        categoryFa: 'طراحی وب و تکنولوژی',
        categoryEn: 'Web Engineering & Design',
        excerptFa: 'بررسی بی‌طرفانه و موشکافانه تفاوت‌های معماری وب‌سایت‌های اختصاصی (کدنویسی شده با Next.js و TypeScript) در برابر قالب‌های آماده وردپرس؛ کدام پلتفرم بهترین سرعت لود، امنیت پایدار و نرخ تبدیل تجاری را ارائه می‌دهد؟',
        excerptEn: 'An in-depth architectural breakdown comparing custom bespoke platforms (Next.js & TypeScript) with off-the-shelf WordPress themes: speed, security audits, and enterprise ROI.',
        contentFa: `<section id="intro">
  <h2>۱. چالش بزرگ کسب‌وکارهای در حال رشد؛ توسعه اختصاصی یا سیستم‌های مدیریت محتوای آماده؟</h2>
  <p>برای سازمان‌هایی که سرعت لود زیر ۱ ثانیه، هویت برند سفارشی، نرخ تبدیل بالا و امنیت غیرقابل نفوذ می‌خواهند، توسعه اختصاصی یک سرمایه‌گذاری ضروری و راهبردی است.</p>
</section>
<section id="section-1">
  <h2 id="section-1">۲. کالبدشکافی عملکرد و سرعت؛ تاثیر زمان بارگذاری زیر ۱ ثانیه بر نرخ تبدیل (CRO)</h2>
  <p>به ازای هر ۱ ثانیه تاخیر در لود صفحه موبایل، نرخ تبدیل تا ۷ درصد افت می‌کند.</p>
</section>
<section id="section-2">
  <h2 id="section-2">۳. ارزیابی امنیت داده‌ها، آسیب‌پذیری افزونه‌ها و هزینه‌های پنهان نگهداری</h2>
  <p>معماری هدلس و تفکیک فرانت‌اند از دیتابیس خطر حملات متداول را به صفر نزدیک می‌کند.</p>
</section>
<section id="conclusion">
  <h2 id="conclusion">۴. ماتریس تصمیم‌گیری هوشمند و استراتژی رشد دیجیتال با آن‌ساپ</h2>
  <p>دپارتمان مهندسی نرم‌افزار آن‌ساپ وب‌سایت‌های اختصاصی را با Next.js و TypeScript خلق می‌کند.</p>
</section>`,
        contentEn: `<section id="intro"><h2>1. Bespoke Architecture vs CMS Templates</h2><p>Enterprise platforms require scalable performance and hardened security.</p></section>`,
        readTimeFa: '۶ دقیقه مطالعه',
        readTimeEn: '6 min read',
        imageUrl: '/images/services/web-development.webp',
        author: 'دپارتمان مهندسی نرم‌افزار آن‌ساپ',
        metaTitleFa: 'طراحی سایت اختصاصی یا وردپرس؟ مقایسه فنی، امنیت و سرعت | آن‌ساپ',
        metaTitleEn: 'Custom Web Development vs WordPress Templates: Complete Guide | OnSupp',
        metaDescFa: 'مقایسه تخصصی طراحی وب‌سایت اختصاصی با قالب‌های آماده CMS از نظر سرعت لود، امنیت نفوذناپذیر، سئو تکنیکال و تجربه کاربری.',
        metaDescEn: 'Compare custom web engineering versus WordPress CMS: speed, security, and conversion rates.',
        keywordsFa: 'طراحی سایت اختصاصی, مقایسه وردپرس و سایت اختصاصی, طراحی وب Next.js',
        canonicalUrl: 'https://onsupp.ir/blog/editorial-ui-design-conversion-rate',
        published: true,
        faqs: {
          create: [
            {
              question: 'چه زمانی یک کسب‌وکار باید حتماً به سراغ طراحی وب‌سایت اختصاصی برود؟',
              answer: 'هنگامی که نیاز به سرعت لود زیر ۱ ثانیه، امنیت داده‌های حساس، قابلیت اتصال به نرم‌افزارهای داخلی سازمانی و ترافیک بالای روزانه دارید.',
              order: 1,
            },
            {
              question: 'آیا سئوی وب‌سایت‌های اختصاصی واقعاً بهتر از سایت‌های وردپرسی است؟',
              answer: 'بله، به دلیل کدهای سبک‌تر و بهینه‌سازی دقیق Core Web Vitals، امتیاز عملکردی سایت اختصاصی در تست‌های گوگل بالاتر است.',
              order: 2,
            },
          ],
        },
      },
    });

    await prisma.article.create({
      data: {
        titleFa: 'ویدیو مارکتینگ و تولید محتوای استودیویی؛ راز ماندگاری برند و انفجار نرخ تبدیل در سال ۲۰۲۶',
        titleEn: 'Video Marketing & Cinematic Studio Media: The Engine of Retention and Conversions',
        slug: 'data-driven-growth-marketing-funnel',
        categoryFa: 'استودیو و تولید رسانه',
        categoryEn: 'Studio & Media Production',
        excerptFa: 'چرا بیش از ۸۲٪ ترافیک وب به محتوای ویدیویی تعلق دارد؟ راهنمای کاربردی تولید تیزرهای تبلیغاتی، پادکست‌های صنعتی و ویدیوهای سینمایی در استودیو تخصصی آن‌ساپ، همراه با تکنیک‌های افزایش زمان ماندگاری کاربر (Dwell Time) و اعتمادسازی عمیق برند.',
        excerptEn: 'How cinematic corporate video production, bespoke podcast recording, and visual storytelling elevate brand authority, boost dwell time, and maximize marketing conversions.',
        contentFa: `<section id="intro">
  <h2>۱. انقلاب محتوای چندرسانه‌ای؛ چرا بدون ویدیو در بازار مدرن نادیده گرفته می‌شوید؟</h2>
  <p>بیش از ۸۲ درصد از کل ترافیک اینترنت به ویدیو اختصاص دارد. کاربران انتظار دارند در کمتر از ۶۰ ثانیه کیفیت و هویت برند را لمس کنند.</p>
</section>
<section id="section-1">
  <h2 id="section-1">۲. تاثیر استراتژیک ویدیو و پادکست بر فاکتورهای سئو و زمان ماندگاری کاربر (Dwell Time)</h2>
  <p>صفحات دارای ویدیو زمان حضور کاربر را تا ۲.۶ برابر افزایش داده و سیگنال قوی به الگوریتم‌های گوگل ارسال می‌کنند.</p>
</section>
<section id="section-2">
  <h2 id="section-2">۳. استانداردها و امکانات فنی استودیو مدرن آن‌ساپ؛ از تصویربرداری ۴K تا صدابرداری تخصصی</h2>
  <p>استودیو مجهز آن‌ساپ با دوربین‌های سینمایی، اتاق آکوستیک و نورپردازی حرفه‌ای پرستیژ برند شما را متحول می‌کند.</p>
</section>
<section id="conclusion">
  <h2 id="conclusion">۴. فرمول ۴ مرحله‌ای راه‌اندازی کمپین ویدیویی با بالاترین نرخ بازگشت سرمایه</h2>
  <p>ایده‌پردازی، تولید حرفه‌ای، تدوین ریتمیک و توزیع هدفمند ارکان یک کمپین ویدیویی پربازده هستند.</p>
</section>`,
        contentEn: `<section id="intro"><h2>1. The Multimedia Revolution</h2><p>Over 82% of internet traffic is video. Cinematic storytelling accelerates brand conversion.</p></section>`,
        readTimeFa: '۸ دقیقه مطالعه',
        readTimeEn: '8 min read',
        imageUrl: '/images/services/studio-production.webp',
        author: 'استودیو فیلم‌سازی و رسانه آن‌ساپ',
        metaTitleFa: 'راهنمای ویدیو مارکتینگ و تولید محتوای استودیویی ۲۰۲۶ | آن‌ساپ',
        metaTitleEn: 'Corporate Video Marketing & Studio Production Strategy Guide | OnSupp',
        metaDescFa: 'استراتژی‌های مدرن ویدیو مارکتینگ، تولید تیزرهای سینمایی و پادکست حرفه‌ای سازمانی. یاد بگیرید چگونه با تولید محتوای استودیویی نرخ تعامل و فروش برند خود را چندین برابر کنید.',
        metaDescEn: 'Comprehensive video marketing and studio media guide: cinematic videography, corporate podcasting, and video SEO.',
        keywordsFa: 'ویدیو مارکتینگ, استودیو تولید محتوا, تیزر تبلیغاتی صنعتی, پادکست سازمانی',
        canonicalUrl: 'https://onsupp.ir/blog/data-driven-growth-marketing-funnel',
        published: true,
        faqs: {
          create: [
            {
              question: 'ویدیو مارکتینگ چگونه باعث بهبود رتبه سئو سایت در گوگل می‌شود؟',
              answer: 'با افزایش زمان حضور کاربر (Dwell Time) و کاهش نرخ پرش، همراه با استفاده از اسکیماهای ویدیویی در نتایج جستجو.',
              order: 1,
            },
            {
              question: 'یک استودیوی استاندارد تولید محتوای رسانه‌ای چه ویژگی‌هایی دارد؟',
              answer: 'اتاق آکوستیک بدون انعکاس، نورپردازی استاندارد، دوربین‌های سینمایی و میکروفون‌های استودیویی کاندنسر.',
              order: 2,
            },
          ],
        },
      },
    });

    console.log('[seed] Default articles created: 3');
  } else {
    console.log('[seed] Articles already exist. Skipping creation.');
  }

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

  await seedDynamicCms(prisma);

  console.log('Seeding completed successfully!');
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

export async function seedDynamicCms(db: PrismaClient = prisma): Promise<void> {
  console.log('[seed] Seeding Dynamic CMS modules...');

  // SiteSetting
  const siteSettingData = {
    id: 1,
    siteNameFa: 'آن‌ساپ',
    siteNameEn: 'OnSupp',
    siteDescriptionFa: 'آژانس خلاق دیجیتال مارکتینگ و توسعه نرم‌افزار',
    siteDescriptionEn: 'Creative Digital Marketing & Software Development Agency',
    headerCtaTextFa: 'شروع همکاری',
    headerCtaTextEn: 'Get Started',
    headerCtaLink: '/#contact',
    addressTitleFa: 'آدرس و نشانی استودیو',
    addressTitleEn: 'Office Address',
    streetFa: 'عظیمیه، میدان کوهنورد، گلستان ۲۱',
    streetEn: 'Golestan 21, Kouhnavard Sq, Azimiyeh',
    cityFa: 'البرز، کرج، منطقه عظیمیه',
    cityEn: 'Alborz, Karaj, Azimiyeh District',
    workingHoursFa: 'شنبه تا چهارشنبه ۹:۰۰ تا ۱۸:۰۰',
    workingHoursEn: 'Sat - Wed: 09:00 - 18:00',
    channels: [
      { id: 'manager', titleFa: 'ارتباط مستقیم با مدیریت', titleEn: 'Direct Executive Line', value: '۰۹۳۳ ۱۸۰ ۵۶۲۸', link: 'tel:+989331805628', icon: 'phone' },
      { id: 'web', titleFa: 'دپارتمان وب و تکنولوژی', titleEn: 'Web & Engineering Dept', value: '۰۹۱۸ ۲۹۲ ۴۹۸۱', link: 'tel:+989182924981', icon: 'code' },
      { id: 'social', titleFa: 'تلگرام و مشاوره برخط', titleEn: 'Telegram & Online Chat', value: '@onsupp_web', link: 'https://t.me/onsupp_web', icon: 'send' },
      { id: 'email', titleFa: 'پست الکترونیک رسمی', titleEn: 'Official Inquiries', value: 'info@onsupp.ir', link: 'mailto:info@onsupp.ir', icon: 'mail' },
    ],
    telegramUrl: 'https://t.me/onsupp_web',
    telegramHandle: 'onsupp_web',
    instagramUrl: 'https://instagram.com/onsupp_web',
    linkedinUrl: 'https://linkedin.com/company/onsupp',
    consultEmail: 'info@onsupp.ir',
    footerTextFa: 'کلیه حقوق مادی و معنوی متعلق به آژانس دیجیتال مارکتینگ آن‌ساپ می‌باشد.',
    footerTextEn: 'All rights reserved by OnSupp Digital Marketing Agency.',
    copyrightTextFa: 'تمامی حقوق برای آن‌ساپ محفوظ است.',
    copyrightTextEn: 'All rights reserved.',
    defaultMetaTitleFa: 'آن‌ساپ | آژانس دیجیتال مارکتینگ و توسعه نرم‌افزار',
    defaultMetaTitleEn: 'OnSupp | Digital Agency & Software Engineering',
    defaultMetaDescFa: 'آژانس خلاق دیجیتال مارکتینگ آن‌ساپ، پیشرو در طراحی سایت مدرن، سئو تکنیکال، برندینگ و اتوماسیون سازمانی.',
    defaultMetaDescEn: 'OnSupp Digital Agency specializes in Next.js web development, technical SEO, brand identity, and enterprise automation.',
    defaultKeywordsFa: 'دیجیتال مارکتینگ, طراحی سایت, سئو تکنیکال, استودیو تولید محتوا, آن‌ساپ',
    defaultKeywordsEn: 'digital marketing, web design, technical seo, content studio, onsupp',
    headerLogoUrl: '/images/hero/onsupp-logo.webp',
    footerLogoUrl: '/images/hero/onsupp-logo.webp',
    faviconUrl: '/favicon.ico',
    ogImageUrl: '/images/og/onsupp-default-og.png',
  };

  await db.siteSetting.upsert({
    where: { id: 1 },
    update: siteSettingData,
    create: siteSettingData,
  });

  // AboutPageSetting
  const aboutPageData = {
    id: 1,
    heroEyebrowFa: 'درباره آن‌ساپ',
    heroEyebrowEn: 'About OnSupp',
    heroTitleFa: 'آدم‌هایی که پشت هر پروژه ایستاده‌اند',
    heroTitleEn: 'The people behind every project',
    heroCaptionFa: 'تیم آن‌ساپ — تهران و کرج',
    heroCaptionEn: 'The OnSupp team — Tehran & Karaj',
    heroImageUrl: '/images/hero/hero-media-studio.webp',
    heroImageAltFa: 'عکس گروهی تیم آن‌ساپ',
    heroImageAltEn: 'OnSupp team group photograph',
    introEyebrowFa: 'درباره ما',
    introEyebrowEn: 'About Us',
    introTitleFa: 'یک تیم، از استراتژی تا اجرا',
    introTitleEn: 'One team, from strategy to delivery',
    introLeadFa: 'آن‌ساپ یک آژانس دیجیتال است که استراتژی، طراحی، فناوری و رسانه را زیر یک سقف کنار هم آورده است.',
    introLeadEn: 'OnSupp is a digital agency that brings strategy, design, technology and media together under one roof.',
    introApproachFa: 'رویکرد ما ساده است: پیش از ساختن، گوش می‌دهیم. هر پروژه با شناخت کسب‌وکار و مخاطب شروع می‌شود.',
    introApproachEn: 'Our approach is simple: we listen before we build. Every project starts with understanding the business and its audience.',
    coreValues: [
      { id: 'clarity', titleFa: 'شفافیت', titleEn: 'Clarity', descriptionFa: 'اهداف، زمان‌بندی و نتایج را روشن و قابل پیگیری نگه می‌داریم.', descriptionEn: 'Goals, timelines and results stay visible and trackable from day one.' },
      { id: 'craft', titleFa: 'دقت در اجرا', titleEn: 'Craft', descriptionFa: 'جزئیات را جدی می‌گیریم؛ از یک خط کد تا انتخاب یک کلمه.', descriptionEn: 'We take details seriously — from a single line of code to the choice of a word.' },
      { id: 'partnership', titleFa: 'همراهی بلندمدت', titleEn: 'Partnership', descriptionFa: 'پروژه با تحویل تمام نمی‌شود؛ کنار برند می‌مانیم تا رشد ادامه پیدا کند.', descriptionEn: 'Delivery isn\'t the finish line; we stay alongside the brand as it grows.' },
    ],
    ceoNameFa: 'علی شمس',
    ceoNameEn: 'Ali Shams',
    ceoRoleFa: 'بنیان‌گذار و مدیرعامل',
    ceoRoleEn: 'Founder & CEO',
    ceoQuoteFa: 'ما آن‌ساپ را ساختیم تا برندها مجبور نباشند بین خلاقیت و نتیجه یکی را انتخاب کنند.',
    ceoQuoteEn: 'We built OnSupp so brands never have to choose between creativity and results.',
    ceoBioFa: ['مسیر حرفه‌ای من با اشتیاق به خلق تجربیات دیجیتال متمایز و ساختن تیم‌های هم‌افزا آغاز شد.'],
    ceoBioEn: ['My journey began with a passion for designing distinct digital experiences and building synergistic teams.'],
    ceoPhotoUrl: '/images/team/ali-shams.webp',
    ceoSocialLinks: [{ platform: 'linkedin', url: 'https://linkedin.com' }],
  };

  await db.aboutPageSetting.upsert({
    where: { id: 1 },
    update: aboutPageData,
    create: aboutPageData,
  });

  // HomeSection
  const homeSections = [
    { key: 'hero', titleFa: 'اسلایدر هدر', titleEn: 'Hero Header', position: 0, isEnabled: true },
    { key: 'partners', titleFa: 'مشتریان و همکاران تجاری', titleEn: 'Clients & Partners', position: 1, isEnabled: true },
    { key: 'stats', titleFa: 'آمار و دستاوردها', titleEn: 'Statistics & Impact', position: 2, isEnabled: true },
    { key: 'services', titleFa: 'خدمات تخصصی', titleEn: 'Services Carousel', position: 3, isEnabled: true },
    { key: 'about', titleFa: 'معرفی آن‌ساپ', titleEn: 'About Us Overview', position: 4, isEnabled: true },
    { key: 'logos', titleFa: 'برندهای همراه', titleEn: 'Client Logo Marquee', position: 5, isEnabled: true },
    { key: 'case_studies', titleFa: 'نمونه‌کارها و پروژه‌ها', titleEn: 'Featured Case Studies', position: 6, isEnabled: true },
    { key: 'pricing', titleFa: 'پلن‌ها و تعرفه‌ها', titleEn: 'Pricing & Plans', position: 7, isEnabled: true },
    { key: 'testimonials', titleFa: 'نظرات و رضایت کارفرمایان', titleEn: 'Client Testimonials', position: 8, isEnabled: true },
    { key: 'contact', titleFa: 'تماس و شروع همکاری', titleEn: 'Contact CTA', position: 9, isEnabled: true },
  ];
  for (const sec of homeSections) {
    await db.homeSection.upsert({
      where: { key: sec.key },
      update: { titleFa: sec.titleFa, titleEn: sec.titleEn, position: sec.position, isEnabled: sec.isEnabled },
      create: sec,
    });
  }

  // ClientPartners
  const existingPartnersCount = await db.clientPartner.count();
  if (existingPartnersCount === 0) {
    await db.clientPartner.createMany({
      data: [
        {
          orderNumber: '01',
          nameFa: 'نجما توکلیان',
          nameEn: 'Najma Tavakolian',
          titleFa: 'موسسه بین‌المللی مهاجرتی و حقوقی نجما توکلیان',
          titleEn: 'Immigration & International Legal Consultancy',
          industryFa: 'حقوقی و مهاجرت بین‌المللی',
          industryEn: 'Legal & Global Mobility',
          introFa: 'مشاوره استراتژیک، اخذ ویزا و امور مهاجرت تحصیلی و سرمایه‌گذاری به کشورهای پیشرو',
          introEn: 'Strategic immigration consultancy, study permits, and global investment programs',
          quoteFa: '«توسعه بستر ارتباطی دیجیتال، طراحی پلتفرم‌های چندزبانه و هویت‌سازی معتبر بین‌المللی با آن‌ساپ، مسیر جذب متقاضیان و اعتماد کارفرمایان را متحول ساخت.»',
          quoteEn: '“Building our multilingual digital architecture and trusted global brand identity with OnSupp established unprecedented credibility and applicant trust.”',
          servicesFa: ['طراحی وب‌سایت چندزبانه', 'سئو بین‌المللی', 'تولید محتوا و اینستاگرام'],
          servicesEn: ['Multilingual Web Platform', 'International SEO', 'Content & Instagram Strategy'],
          yearFa: '۱۴۰۲ - تاکنون',
          yearEn: '2023 - Present',
          monogram: 'NT',
          portraitBadgeFa: 'کارفرمای بین‌المللی آن‌ساپ',
          portraitBadgeEn: 'OnSupp Global Client Partner',
          websites: [{ url: 'https://najmatavakolian.net/', label: 'najmatavakolian.net' }],
          instagrams: [{ handle: '@najma.immigration', profileUrl: 'https://instagram.com/najma.immigration' }],
          isActive: true,
          status: 'PUBLISHED',
          position: 0,
        },
        {
          orderNumber: '02',
          nameFa: 'مرکز زیبایی شین',
          nameEn: 'Shin Beauty Center',
          titleFa: 'کلینیک جامع مراقبت‌های پوستی، لیزر و جوانسازی',
          titleEn: 'Advanced Medical Aesthetics & Skincare Center',
          industryFa: 'پزشکی و سلامت زیبایی',
          industryEn: 'Aesthetics & Dermatology',
          introFa: 'به‌کارگیری پیشرفته‌ترین فناوری‌های لیزر، جوانسازی و پروتکل‌های پزشکی مراقبت از پوست',
          introEn: 'Leading clinical lasers, modern anti-aging therapies, and high-standard skincare protocols',
          quoteFa: '«طراحی هویت بصری منسجم، وب‌سایت نوبت‌دهی آنلاین و کمپین‌های هوشمند سوشال مدیا، جایگاه برند شین را در سطح کلینیک‌های تراز اول تثبیت کرد.»',
          quoteEn: '“Unified luxury visual branding, seamless online booking, and targeted social growth elevated Shin to a premier aesthetic clinic tier.”',
          servicesFa: ['هویت بصری و برندینگ', 'وب‌سایت نوبت‌دهی', 'کمپین‌های اینستاگرام'],
          servicesEn: ['Visual Identity & Branding', 'Online Booking System', 'Instagram Campaigns'],
          yearFa: '۱۴۰۱ - تاکنون',
          yearEn: '2022 - Present',
          monogram: 'SB',
          portraitBadgeFa: 'مرکز تخصصی زیبایی',
          portraitBadgeEn: 'Premier Aesthetic Center',
          websites: [{ url: 'https://shinbeautycenter.com/', label: 'shinbeautycenter.com' }],
          instagrams: [{ handle: '@shin.beautycenter', profileUrl: 'https://instagram.com/shin.beautycenter' }],
          isActive: true,
          status: 'PUBLISHED',
          position: 1,
        },
        {
          orderNumber: '03',
          nameFa: 'مهدی ناظری (فیت بای ناظری)',
          nameEn: 'Mehdi Nazeri (Fit by Nazeri)',
          titleFa: 'آکادمی مربیگری حرفه‌ای، تناسب اندام و سبک زندگی سالم مهدی ناظری',
          titleEn: 'Professional Fitness Coaching & Nutrition Academy by Mehdi Nazeri',
          industryFa: 'ورزش، تندرستی و سلامت فیزیکی',
          industryEn: 'Fitness & Wellness',
          introFa: 'ارائه برنامه‌های تمرینی اختصاصی، تغذیه علمی و پایش مستمر نتایج ورزشکاران',
          introEn: 'Bespoke fitness training, scientific nutrition regimens, and global athlete performance monitoring',
          quoteFa: '«سامانه دریافت برنامه تمرینی آنلاین و هویت برند نوآورانه توسعه‌یافته توسط آن‌ساپ، مدیریت مراجعین از سراسر کشور را بهینه‌سازی کرد.»',
          quoteEn: '“The online training portal and refined brand identity engineered by OnSupp streamlined client management nationwide.”',
          servicesFa: ['طراحی پرتال آنلاین تمرینی', 'هویت بصری ورزشی', 'استودیو فیلم‌برداری حرکات'],
          servicesEn: ['Online Training Portal', 'Sports Brand Identity', 'Movement Video Production'],
          yearFa: '۱۴۰۳ - تاکنون',
          yearEn: '2024 - Present',
          monogram: 'FN',
          portraitBadgeFa: 'آکادمی سلامت و فیتنس',
          portraitBadgeEn: 'Fitness & Health Academy',
          websites: [{ url: 'https://fitbynazeri.com/', label: 'fitbynazeri.com' }],
          instagrams: [{ handle: '@fitbynazeri', profileUrl: 'https://instagram.com/fitbynazeri' }],
          isActive: true,
          status: 'PUBLISHED',
          position: 2,
        },
      ],
    });
  }

  // ClientLogos
  const existingLogosCount = await db.clientLogo.count();
  if (existingLogosCount === 0) {
    await db.clientLogo.createMany({
      data: [
        { nameFa: 'کلینیک دکتر سینا پارسی‌پور', nameEn: 'Dr. Sina Parsi Pour Clinic', imageUrl: '/images/clients/cropped-دکتر-سینا-پارسی-پورDesign-tool.png', width: 522, height: 522, position: 0 },
        { nameFa: 'آسمان شب', nameEn: 'Night Sky', imageUrl: '/images/clients/night-sky-logo-Fav-Icon.webp', width: 350, height: 100, position: 1 },
        { nameFa: 'برند تخصصی همکار', nameEn: 'Partner Healthcare Brand', imageUrl: '/images/clients/cropped-داخل-مقاله-سایز-جدید-1-scaled-1.webp', width: 2558, height: 1004, position: 2 },
        { nameFa: 'برند بین‌المللی همکار', nameEn: 'Global Partner Brand', imageUrl: '/images/clients/1784025437971-220284966.png', width: 3479, height: 2561, position: 3 },
        { nameFa: 'نشان تجاری مشتریان', nameEn: 'Client Crest Identity', imageUrl: '/images/clients/cropped-fav-icon-180x180-1.png', width: 180, height: 180, position: 4 },
        { nameFa: 'مرکز تخصصی همکار', nameEn: 'Specialized Partner Center', imageUrl: '/images/clients/1786532435122-428601052.png', width: 934, height: 880, position: 5 },
        { nameFa: 'نشان برند مشتری', nameEn: 'Partner Identity', imageUrl: '/images/clients/cropped-Image-11.png', width: 1254, height: 1254, position: 6 },
        { nameFa: 'برند تجاری همراه', nameEn: 'Enterprise Client', imageUrl: '/images/clients/dont-bg-logo-Edited.png', width: 1020, height: 643, position: 7 },
        { nameFa: 'نشان همراهان آن‌ساپ', nameEn: 'OnSupp Client Partner', imageUrl: '/images/clients/d0e6674d-5672-4f41-94dd-2e3242594040.png', width: 2480, height: 2643, position: 8 },
      ],
    });
  }

  // TeamMember
  const existingTeamCount = await db.teamMember.count();
  if (existingTeamCount === 0) {
    await db.teamMember.createMany({
      data: [
        { nameFa: 'علی شمس', nameEn: 'Ali Shams', roleFa: 'بنیان‌گذار و مدیرعامل', roleEn: 'Founder & CEO', departmentFa: 'مدیریت و استراتژی', departmentEn: 'Leadership & Strategy', bioFa: 'هدایت استراتژیک پروژه‌ها و تلفیق رویکرد داده‌محور با خلاقیت سازمانی.', bioEn: 'Strategic leadership and driving data-informed creative growth.', photoUrl: '/images/team/ali-shams.webp', isPublished: true, isLeadership: true, position: 0 },
        { nameFa: 'پویا شمس', nameEn: 'Pouya Shams', roleFa: 'مدیر ارشد فنی و مهندسی نرم‌افزار', roleEn: 'Chief Technology Officer & Lead Architect', departmentFa: 'فناوری و مهندسی', departmentEn: 'Engineering & Tech', bioFa: 'معماری سامانه‌های مقیاس‌پذیر، زیرساخت ابری و نظارت بر کیفیت توسعه وب Next.js.', bioEn: 'Architecting scalable systems, cloud infrastructure, and Next.js engineering quality.', photoUrl: '/images/team/pouya-shams.webp', isPublished: true, isLeadership: true, position: 1 },
        { nameFa: 'سارا احمدی', nameEn: 'Sara Ahmadi', roleFa: 'مدیر ارشد طراحی و هویت بصری', roleEn: 'Art Director & Head of Design', departmentFa: 'دیزاین و خلاقیت', departmentEn: 'Design & Creative', bioFa: 'طراحی زبان بصری ماندگار، تایپوگرافی اختصاصی و نظارت هنری بر تمام خروجی‌های استودیو.', bioEn: 'Crafting timeless design systems, typography, and artistic direction.', isPublished: true, isLeadership: false, position: 2 },
        { nameFa: 'امیرحسین رضایی', nameEn: 'Amirhossein Rezaei', roleFa: 'سرپرست سئو تکنیکال و رشد ارگانیک', roleEn: 'Technical SEO Lead', departmentFa: 'مارکتینگ و سئو', departmentEn: 'Marketing & SEO', bioFa: 'تحلیل داده‌های سرچ کنسول، بهینه‌سازی معماری وب و افزایش ترافیک ارگانیک باکیفیت.', bioEn: 'Search analytics, web architecture optimization, and high-conversion organic growth.', isPublished: true, isLeadership: false, position: 3 },
      ],
    });
  }

  // PageSeo
  const pageSeoList = [
    { routePath: '/', titleFa: 'آن‌ساپ | آژانس دیجیتال مارکتینگ و توسعه نرم‌افزار', titleEn: 'OnSupp | Digital Agency & Software Engineering', descriptionFa: 'طراحی سایت‌های مدرن، سئو تکنیکال، تولید محتوای سینمایی و استقرار CRM.', descriptionEn: 'Enterprise web apps, technical SEO, cinematography, and automation.', canonicalUrl: 'https://onsupp.ir/' },
    { routePath: '/about', titleFa: 'درباره ما | آژانس دیجیتال مارکتینگ آن‌ساپ', titleEn: 'About Us | OnSupp Digital Agency', descriptionFa: 'آشنایی با تیم متخصص، بنیان‌گذاران، ارزش‌های محوری و داستان شکل‌گیری آن‌ساپ.', descriptionEn: 'Learn about OnSupp team, core values, leadership, and our mission.', canonicalUrl: 'https://onsupp.ir/about' },
    { routePath: '/services', titleFa: 'خدمات تخصصی دیجیتال مارکتینگ و توسعه وب | آن‌ساپ', titleEn: 'Our Services | OnSupp Digital Agency', descriptionFa: 'طراحی وب و اپلیکیشن، استودیو تصویربرداری، موشن گرافیک، سئو و اتوماسیون.', descriptionEn: 'Full suite of digital services: software development, SEO, cinematography, and CRM.', canonicalUrl: 'https://onsupp.ir/services' },
    { routePath: '/case-studies', titleFa: 'نمونه‌کارها و پروژه‌های شاخص | آن‌ساپ', titleEn: 'Case Studies & Portfolio | OnSupp', descriptionFa: 'بررسی پروژه‌های موفق برندهایی که با همراهی آن‌ساپ رشد چشمگیر دیجیتال داشتند.', descriptionEn: 'Discover how we helped leading brands achieve digital transformation.', canonicalUrl: 'https://onsupp.ir/case-studies' },
    { routePath: '/pricing', titleFa: 'تعرفه‌ها و پکیج‌های همکاری | آن‌ساپ', titleEn: 'Pricing & Plans | OnSupp', descriptionFa: 'پلن‌ها و تعرفه‌های شفاف خدمات دیجیتال مارکتینگ، طراحی سایت و سئو.', descriptionEn: 'Transparent pricing packages for web engineering, SEO, and digital marketing.', canonicalUrl: 'https://onsupp.ir/pricing' },
    { routePath: '/contact', titleFa: 'تماس با ما و شروع همکاری | آن‌ساپ', titleEn: 'Contact Us | OnSupp', descriptionFa: 'رزرو جلسه مشاوره تخصصی، دریافت برآورد هزینه پروژه یا شروع همکاری.', descriptionEn: 'Get in touch to discuss your next project or schedule a consultation.', canonicalUrl: 'https://onsupp.ir/contact' },
  ];
  for (const item of pageSeoList) {
    await db.pageSeo.upsert({
      where: { routePath: item.routePath },
      update: item,
      create: item,
    });
  }

  console.log('[seed] Dynamic CMS modules seeded successfully!');
}
