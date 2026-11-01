import 'dotenv/config';
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
  if (dbName !== 'onsupp_dev') {
    const errorMsg = `[seed FATAL] Target database "${dbName}" is not approved for seeding. Only "onsupp_dev" is permitted.`;
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
        title: 'رشد دیجیتال شما، افقی نو می‌شود',
        titleEn: 'Your Digital Growth',
        subtitle:
          'ما با استراتژی‌های نوین دیجیتال مارکتینگ، کسب‌وکار شما را به مشتریان بیشتری می‌رسانیم.',
        subtitleEn:
          'We help you grow your business with modern digital marketing strategies.',
        ctaText: 'شروع همکاری',
        ctaTextEn: 'Get Started',
        ctaLink: '#contact',
        ctaText2: 'خدمات ما',
        ctaText2En: 'Our Services',
        ctaLink2: '/services',
        imageUrl: null,
        imageAlt: null,
        position: 0,
      },
      {
        title: 'دیجیتال مارکتینگ نوین',
        titleEn: 'Modern Digital Marketing',
        subtitle: 'کمپین‌های هوشمند با هدف‌گذاری دقیق، نرخ تبدیل شما را چند برابر می‌کند.',
        subtitleEn: 'Smart campaigns with precise targeting multiply your conversion rate.',
        ctaText: 'مشاوره رایگان',
        ctaTextEn: 'Free Consultation',
        ctaLink: '#contact',
        ctaText2: 'درباره ما',
        ctaText2En: 'About Us',
        ctaLink2: '/#about',
        imageUrl: null,
        imageAlt: null,
        position: 1,
      },
      {
        title: 'برندسازی و رشد پایدار',
        titleEn: 'Branding & Sustainable Growth',
        subtitle: 'برند شما را قدرتمند می‌کنیم تا در ذهن مشتری ماندگار بماند.',
        subtitleEn: "We empower your brand to stay memorable in customers' minds.",
        ctaText: 'برند خود را بسازید',
        ctaTextEn: 'Build Your Brand',
        ctaLink: '#contact',
        ctaText2: 'خدمات ما',
        ctaText2En: 'Our Services',
        ctaLink2: '/',
        imageUrl: null,
        imageAlt: null,
        position: 2,
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

  const existingCaseStudies = await prisma.caseStudy.count();
  if (existingCaseStudies === 0) {
    const defaultCaseStudies = [
      {
        titleFa: 'سامانه پایش سلامت MedLink',
        titleEn: 'MedLink Vital Telemetry',
        categoryFa: 'سلامت و پزشکی',
        categoryEn: 'Healthcare',
        projectType: 'app',
        descriptionFa: 'سیستم مانیتورینگ آنلاین بیماران با پردازش زنده تلمتری و سیستم هوشمند هشدارهای پزشکی.',
        descriptionEn: 'Real-time patient monitoring system with biometric telemetry and AI risk alert algorithms.',
        liveUrl: 'https://medlink.example.com',
        position: 0,
      },
      {
        titleFa: 'پلتفرم تحلیل مالی Finalytix',
        titleEn: 'Finalytix Analytics Platform',
        categoryFa: 'فین‌تک و سازمان‌ها',
        categoryEn: 'Fintech & Enterprise',
        projectType: 'website',
        descriptionFa: 'داشبورد سازمانی پیشرفته برای پیش‌بینی جریان مالی و گزارش‌گیری هوشمند تعاملی.',
        descriptionEn: 'Advanced financial analytics platform for forecasting cash flow and enterprise reporting.',
        liveUrl: 'https://finalytix.example.com',
        position: 1,
      },
      {
        titleFa: 'پیج اینستاگرام و استراتژی محتوای OnSupp',
        titleEn: 'OnSupp Digital Marketing',
        categoryFa: 'دیجیتال مارکتینگ',
        categoryEn: 'Social Media',
        projectType: 'instagram',
        descriptionFa: 'طراحی هویت بصری، کمپین‌های تبلیغاتی و رشد تعامل اینستاگرام با استراتژی داده‌محور.',
        descriptionEn: 'Visual identity design, campaign management, and Instagram engagement strategy.',
        liveUrl: 'https://instagram.com/onsupp',
        position: 2,
      },
    ];
    for (const cs of defaultCaseStudies) {
      await prisma.caseStudy.create({ data: cs });
    }
    console.log('[seed] Default case studies created:', defaultCaseStudies.length);
  }

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
    await prisma.article.createMany({
      data: [
        {
          titleFa: '۱۰ استراتژی برتر سئو در سال ۲۰۲۶ برای رشد انفجاری کسب‌وکارها',
          titleEn: 'Top 10 SEO Strategies in 2026 for Exponential Business Growth',
          slug: 'top-seo-strategies-2026',
          categoryFa: 'آموزش سئو',
          categoryEn: 'SEO Tutorial',
          excerptFa: 'با الگوریتم‌های جدید گوگل و هوش مصنوعی، چگونه رتبه اول گوگل را در کمتر از ۳ ماه تسخیر کنیم؟',
          excerptEn: 'With new Google AI algorithms, how to reach position #1 in under 3 months?',
          contentFa: 'لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است، و برای شرایط فعلی تکنولوژی مورد نیاز، و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد.',
          contentEn: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          readTimeFa: '۵ دقیقه مطالعه',
          readTimeEn: '5 min read',
          imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
          author: 'آن‌ساپ',
          published: true,
        },
        {
          titleFa: 'نقش طراحی سایت اختصاصی در افزایش ۳ برابری نرخ تبدیل مشتری',
          titleEn: 'The Role of Custom Web Design in Tripling Conversion Rates',
          slug: 'custom-web-design-conversion-rate',
          categoryFa: 'طراحی وب',
          categoryEn: 'Web Design',
          excerptFa: 'بررسی اهمیت تجربه کاربری (UX)، سرعت لود زیر ۱ ثانیه و دیزاین مدرن در اعتماد مشتریان دیجیتال.',
          excerptEn: 'Exploring UX impact, sub-second load times, and modern aesthetics on customer trust.',
          contentFa: 'طراحی وب‌سایت اختصاصی نه تنها به برند شما هویت می‌بخشد، بلکه با بهینه‌سازی مسیر خرید کاربر، نرخ تبدیل خریداران را تا ۳ برابر افزایش می‌دهد.',
          contentEn: 'Custom website design gives your brand identity and optimizes conversion path by 3x.',
          readTimeFa: '۷ دقیقه مطالعه',
          readTimeEn: '7 min read',
          imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
          author: 'تیم دیزاین آن‌ساپ',
          published: true,
        },
        {
          titleFa: 'گزارش رشد سالانه آن‌ساپ: کسب رتبه اول سئو برای بیش از ۵۰ برند پیشرو',
          titleEn: 'OnSupp Annual Growth Report: Over 50 Leader Brands Ranked #1',
          slug: 'onsupp-annual-growth-report',
          categoryFa: 'اخبار سازمان',
          categoryEn: 'Company News',
          excerptFa: 'دستاوردهای آژانس دیجیتال مارکتینگ آن‌ساپ و برنامه‌های توسعه همکاری با برندهای بین‌المللی.',
          excerptEn: 'OnSupp Agency milestones and international brand partnership expansion plans.',
          contentFa: 'آژانس آن‌ساپ با افتتاح دفاتر جدید بین‌المللی و همکاری با بیش از ۵۰ برند مطرح، سال مالی جدید را با موفقیت بی‌نظیری به پایان رساند.',
          contentEn: 'OnSupp agency expands international operations with over 50 leading enterprise brands.',
          readTimeFa: '۴ دقیقه مطالعه',
          readTimeEn: '4 min read',
          imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
          author: 'روابط عمومی آن‌ساپ',
          published: true,
        },
      ],
    });
    console.log('[seed] Default articles created: 3');
  } else {
    console.log('[seed] Articles already exist. Skipping creation.');
  }

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
