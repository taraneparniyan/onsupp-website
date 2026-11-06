import 'dotenv/config';
import { PrismaClient, PublicationStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedCms() {
  console.log('[seed-cms] Starting dynamic CMS database seeding...');

  // 1. Seed Site Settings (Singleton ID: 1)
  console.log('[seed-cms] Seeding SiteSettings...');
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      siteNameFa: 'آن‌ساپ',
      siteNameEn: 'OnSupp',
      siteTitleFa: 'آژانس دیجیتال مارکتینگ و توسعه نرم‌افزار آن‌ساپ',
      siteTitleEn: 'OnSupp | Digital Agency & Software Engineering',
      siteDescFa:
        'آژانس دیجیتال مارکتینگ و توسعه نرم‌افزار آن‌ساپ؛ ارائه‌دهنده راهکارهای هوشمند طراحی وب‌سایت‌های سازمانی، سئو تکنیکال، توسعه نرم‌افزار مقیاس‌پذیر، برندینگ و تولید محتوای رسانه‌ای.',
      siteDescEn:
        'OnSupp Digital Agency unites cinema-grade studio storytelling with data-driven software engineering to accelerate sustainable brand growth.',
      defaultKeywordsFa:
        'دیجیتال مارکتینگ, طراحی سایت اختصاصی, سئو تکنیکال, هویت بصری و برندینگ, تولید تیزر و استودیو, استقرار CRM, آن‌ساپ',
      defaultKeywordsEn:
        'digital marketing, web design, technical seo, brand identity, crm automation, software engineering, onsupp',
      metaTitleTemplate: '%s | آن‌ساپ',
      canonicalBaseUrl: 'https://onsupp.ir',
      headerLogoUrl: '/images/logo/logo-Crimson.webp',
      headerDarkLogoUrl: '/images/logo/logo-dark.webp',
      footerLogoUrl: '/images/logo/Linear-Logo-Crimson.webp',
      ogImageUrl: '/images/logo/logo-Crimson.webp',
      faviconUrl: '/favicon.ico',
      phone: '', // Intentionally empty until official number is verified
      secondaryPhone: '',
      phoneLabelFa: 'تماس مستقیم',
      phoneLabelEn: 'Direct Call',
      email: 'info@onsupp.ir',
      emailLabelFa: 'ایمیل رسمی و مشاوره',
      emailLabelEn: 'Official Email',
      responseTimeFa: 'پاسخگویی سریع کمتر از ۲ ساعت کاری',
      responseTimeEn: 'Prompt consultation response during business hours',
      telegramHandle: 'onsupp_web',
      telegramUrl: 'https://t.me/onsupp_web',
      instagramUrl: 'https://instagram.com/onsupp_web',
      linkedinUrl: 'https://linkedin.com/company/onsupp',
      addressFa: 'البرز، کرج، منطقه عظیمیه، میدان کوهنورد، گلستان ۲۱',
      addressEn: 'Golestan 21, Kouhnavard Sq, Azimiyeh, Karaj, Alborz, Iran',
      workingHoursFa: 'شنبه تا چهارشنبه ۹:۰۰ تا ۱۸:۰۰',
      workingHoursEn: 'Sat - Wed: 09:00 - 18:00',
      googleMapsUrl: 'https://maps.google.com/?q=35.8340,51.0110',
      footerCopyrightFa: '© ۲۰۲۶ کلیه حقوق مادی و معنوی این وب‌سایت متعلق به آژانس دیجیتال آن‌ساپ می‌باشد.',
      footerCopyrightEn: '© 2026 OnSupp Digital Agency. All rights reserved.',
      footerDescriptionFa:
        'ما در آن‌ساپ با ترکیب خلاقیت استودیویی و مهندسی داده‌محور، برندها را در مسیر رشد پایدار دیجیتال همراهی می‌کنیم.',
      footerDescriptionEn:
        'At OnSupp, we unite cinema-grade studio storytelling with data-driven software engineering to accelerate sustainable brand growth.',
      footerLinks: [
        { nameFa: 'صفحه اصلی', nameEn: 'Home', href: '/', position: 1 },
        { nameFa: 'گالری تصاویر و نمونه‌کارها', nameEn: 'Portfolio & Gallery', href: '/portfolio', position: 2 },
        { nameFa: 'خدمات تخصصی', nameEn: 'Our Services', href: '/services', position: 3 },
        { nameFa: 'مقالات و اخبار', nameEn: 'Articles & News', href: '/blog', position: 4 },
        { nameFa: 'درباره ما', nameEn: 'About Us', href: '/about', position: 5 },
        { nameFa: 'تماس با ما', nameEn: 'Contact Us', href: '/#contact', position: 6 },
      ],
      headerNavJson: [
        { nameFa: 'صفحه اصلی', nameEn: 'Home', href: '/', position: 1 },
        { nameFa: 'خدمات', nameEn: 'Services', href: '/services', isServices: true, position: 2 },
        { nameFa: 'نمونه‌کارها', nameEn: 'Portfolio', href: '/portfolio', position: 3 },
        { nameFa: 'پلن‌ها و تعرفه‌ها', nameEn: 'Pricing', href: '/pricing', position: 4 },
        { nameFa: 'مقالات', nameEn: 'Articles', href: '/blog', position: 5 },
        { nameFa: 'درباره ما', nameEn: 'About Us', href: '/about', position: 6 },
      ],
    },
  });

  // 2. Seed CEO Profile (Singleton ID: 1)
  console.log('[seed-cms] Seeding CEO Profile...');
  await prisma.ceoProfile.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      nameFa: 'نام مدیرعامل',
      nameEn: 'CEO Name',
      roleFa: 'بنیان‌گذار و مدیرعامل',
      roleEn: 'Founder & CEO',
      quoteFa: 'ما آن‌ساپ را ساختیم تا برندها مجبور نباشند بین خلاقیت و نتیجه یکی را انتخاب کنند.',
      quoteEn: 'We built OnSupp so brands never have to choose between creativity and results.',
      bioFa: [
        'متن موقت بیوگرافی مدیرعامل. این بخش با معرفی مسیر حرفه‌ای، تجربه‌ها و نگاه شخصی ایشان به آینده آن‌ساپ جایگزین خواهد شد.',
        'پاراگراف دوم برای توضیح فلسفه مدیریتی، حوزه‌های تمرکز و نقش ایشان در شکل‌گیری فرهنگ تیم در نظر گرفته شده است.',
      ],
      bioEn: [
        'Temporary executive biography. This section introduces career milestones, leadership philosophy and the founder vision for OnSupp.',
        'Second paragraph outlining managerial approach, focus areas and commitment to creative-engineering balance.',
      ],
      avatarUrl: null,
      focalPoint: '50% 50%',
      socialLinks: [
        { platform: 'linkedin', url: '#' },
        { platform: 'instagram', url: '#' },
      ],
      isPublished: true,
      status: PublicationStatus.PUBLISHED,
    },
  });

  // 3. Seed Company Core Values (3 Principles from /about)
  console.log('[seed-cms] Seeding Company Values...');
  const values = [
    {
      key: 'clarity',
      titleFa: 'شفافیت',
      titleEn: 'Clarity',
      descriptionFa: 'اهداف، زمان‌بندی و نتایج را از روز اول روشن و قابل پیگیری نگه می‌داریم.',
      descriptionEn: 'Goals, timelines and results stay visible and trackable from day one.',
      badgeFa: 'اصل اول',
      badgeEn: 'Principle 01',
      icon: 'clarity',
      position: 1,
    },
    {
      key: 'craft',
      titleFa: 'دقت در اجرا',
      titleEn: 'Craft',
      descriptionFa: 'جزئیات را جدی می‌گیریم؛ از یک خط کد تا انتخاب یک کلمه.',
      descriptionEn: 'We take details seriously — from a single line of code to the choice of a word.',
      badgeFa: 'اصل دوم',
      badgeEn: 'Principle 02',
      icon: 'craft',
      position: 2,
    },
    {
      key: 'partnership',
      titleFa: 'همراهی بلندمدت',
      titleEn: 'Partnership',
      descriptionFa: 'پروژه با تحویل تمام نمی‌شود؛ کنار برند می‌مانیم تا رشد ادامه پیدا کند.',
      descriptionEn: "Delivery isn't the finish line; we stay alongside the brand as it grows.",
      badgeFa: 'اصل سوم',
      badgeEn: 'Principle 03',
      icon: 'partnership',
      position: 3,
    },
  ];

  for (const v of values) {
    await prisma.companyValue.upsert({
      where: { key: v.key },
      update: {},
      create: {
        ...v,
        isPublished: true,
        status: PublicationStatus.PUBLISHED,
      },
    });
  }

  // 4. Seed Team Members (8 members from lib/about.ts)
  console.log('[seed-cms] Seeding Team Members...');
  const teamMembers = [
    {
      nameFa: 'عضو تیم ۰۱',
      nameEn: 'Team Member 01',
      roleFa: 'مدیر استراتژی',
      roleEn: 'Strategy Lead',
      departmentFa: 'استراتژی و رشد',
      departmentEn: 'Strategy & Growth',
      bioFa: 'متن موقت بیوگرافی. این بخش پس از دریافت اطلاعات نهایی جایگزین می‌شود.',
      bioEn: "Temporary biography. This text will be replaced with this member's role.",
      socialLinks: [{ platform: 'linkedin', url: '#' }],
      position: 1,
    },
    {
      nameFa: 'عضو تیم ۰۲',
      nameEn: 'Team Member 02',
      roleFa: 'مدیر هنری',
      roleEn: 'Art Director',
      departmentFa: 'برندینگ و هویت',
      departmentEn: 'Branding & Identity',
      bioFa: 'متن موقت بیوگرافی. این بخش پس از دریافت اطلاعات نهایی جایگزین می‌شود.',
      bioEn: "Temporary biography. This text will be replaced with this member's role.",
      socialLinks: [{ platform: 'behance', url: '#' }, { platform: 'instagram', url: '#' }],
      position: 2,
    },
    {
      nameFa: 'عضو تیم ۰۳',
      nameEn: 'Team Member 03',
      roleFa: 'سرپرست توسعه نرم‌افزار',
      roleEn: 'Engineering Lead',
      departmentFa: 'توسعه نرم‌افزار',
      departmentEn: 'Software Development',
      bioFa: 'متن موقت بیوگرافی. این بخش پس از دریافت اطلاعات نهایی جایگزین می‌شود.',
      bioEn: "Temporary biography. This text will be replaced with this member's role.",
      socialLinks: [{ platform: 'github', url: '#' }, { platform: 'linkedin', url: '#' }],
      position: 3,
    },
    {
      nameFa: 'عضو تیم ۰۴',
      nameEn: 'Team Member 04',
      roleFa: 'کارشناس ارشد سئو',
      roleEn: 'Senior SEO Specialist',
      departmentFa: 'دیجیتال مارکتینگ',
      departmentEn: 'Digital Marketing',
      bioFa: 'متن موقت بیوگرافی. این بخش پس از دریافت اطلاعات نهایی جایگزین می‌شود.',
      bioEn: "Temporary biography. This text will be replaced with this member's role.",
      socialLinks: [{ platform: 'linkedin', url: '#' }],
      position: 4,
    },
    {
      nameFa: 'عضو تیم ۰۵',
      nameEn: 'Team Member 05',
      roleFa: 'طراح تجربه کاربری',
      roleEn: 'UX / UI Designer',
      departmentFa: 'طراحی محصول',
      departmentEn: 'Product Design',
      bioFa: 'متن موقت بیوگرافی. این بخش پس از دریافت اطلاعات نهایی جایگزین می‌شود.',
      bioEn: "Temporary biography. This text will be replaced with this member's role.",
      socialLinks: [{ platform: 'dribbble', url: '#' }],
      position: 5,
    },
    {
      nameFa: 'عضو تیم ۰۶',
      nameEn: 'Team Member 06',
      roleFa: 'مدیر تولید محتوا',
      roleEn: 'Content Lead',
      departmentFa: 'محتوا و رسانه',
      departmentEn: 'Content & Media',
      bioFa: 'متن موقت بیوگرافی. این بخش پس از دریافت اطلاعات نهایی جایگزین می‌شود.',
      bioEn: "Temporary biography. This text will be replaced with this member's role.",
      socialLinks: [{ platform: 'instagram', url: '#' }, { platform: 'telegram', url: '#' }],
      position: 6,
    },
    {
      nameFa: 'عضو تیم ۰۷',
      nameEn: 'Team Member 07',
      roleFa: 'مدیر پروژه',
      roleEn: 'Project Manager',
      departmentFa: 'مدیریت پروژه',
      departmentEn: 'Project Management',
      bioFa: 'متن موقت بیوگرافی. این بخش پس از دریافت اطلاعات نهایی جایگزین می‌شود.',
      bioEn: "Temporary biography. This text will be replaced with this member's role.",
      socialLinks: [{ platform: 'linkedin', url: '#' }],
      position: 7,
    },
    {
      nameFa: 'عضو تیم ۰۸',
      nameEn: 'Team Member 08',
      roleFa: 'تولیدکننده موشن و ویدیو',
      roleEn: 'Motion & Video Producer',
      departmentFa: 'استودیو',
      departmentEn: 'Studio',
      bioFa: 'متن موقت بیوگرافی. این بخش پس از دریافت اطلاعات نهایی جایگزین می‌شود.',
      bioEn: "Temporary biography. This text will be replaced with this member's role.",
      socialLinks: [{ platform: 'instagram', url: '#' }],
      position: 8,
    },
  ];

  for (const m of teamMembers) {
    const existing = await prisma.teamMember.findFirst({
      where: { nameFa: m.nameFa },
    });
    if (!existing) {
      await prisma.teamMember.create({
        data: {
          ...m,
          avatarUrl: null,
          focalPoint: '50% 50%',
          isPublished: true,
          status: PublicationStatus.PUBLISHED,
        },
      });
    }
  }

  // 5. Seed Client Logos (9 logos from ClientLogoMarquee.tsx)
  console.log('[seed-cms] Seeding Client Logos...');
  const clientLogos = [
    {
      key: 'sina-parsipour',
      nameFa: 'کلینیک دکتر سینا پارسی‌پور',
      nameEn: 'Dr. Sina Parsi Pour Clinic',
      logoUrl: '/images/client-logos/cropped-دکتر-سینا-پارسی-پورDesign-tool.png',
      width: 522,
      height: 522,
      position: 1,
    },
    {
      key: 'night-sky',
      nameFa: 'آسمان شب',
      nameEn: 'Night Sky',
      logoUrl: '/images/client-logos/night-sky-logo-Fav-Icon.webp',
      width: 350,
      height: 100,
      position: 2,
    },
    {
      key: 'logo-article-banner',
      nameFa: 'برند تخصصی همکار',
      nameEn: 'Partner Healthcare Brand',
      logoUrl: '/images/client-logos/cropped-داخل-مقاله-سایز-جدید-1-scaled-1.webp',
      width: 2558,
      height: 1004,
      position: 3,
    },
    {
      key: 'logo-brand-crest',
      nameFa: 'برند بین‌المللی همکار',
      nameEn: 'Global Partner Brand',
      logoUrl: '/images/client-logos/1784025437971-220284966.png',
      width: 3479,
      height: 2561,
      position: 4,
    },
    {
      key: 'logo-fav-crest',
      nameFa: 'نشان تجاری مشتریان',
      nameEn: 'Client Crest Identity',
      logoUrl: '/images/client-logos/cropped-fav-icon-180x180-1.png',
      width: 180,
      height: 180,
      position: 5,
    },
    {
      key: 'logo-medical-shield',
      nameFa: 'مرکز تخصصی همکار',
      nameEn: 'Specialized Partner Center',
      logoUrl: '/images/client-logos/1786532435122-428601052.png',
      width: 934,
      height: 880,
      position: 6,
    },
    {
      key: 'logo-image-11',
      nameFa: 'نشان برند مشتری',
      nameEn: 'Partner Identity',
      logoUrl: '/images/client-logos/cropped-Image-11.png',
      width: 1254,
      height: 980,
      position: 7,
    },
    {
      key: 'logo-nobg-crest',
      nameFa: 'نشان برند همراه',
      nameEn: 'Partner Brand Emblem',
      logoUrl: '/images/client-logos/dont-bg-logo-Edited.png',
      width: 1800,
      height: 1400,
      position: 8,
    },
    {
      key: 'logo-vector-crest',
      nameFa: 'هویت بصری شریک تجاری',
      nameEn: 'Corporate Partner Mark',
      logoUrl: '/images/client-logos/d0e6674d-5672-4f41-94dd-2e3242594040.png',
      width: 1000,
      height: 1000,
      position: 9,
    },
  ];

  for (const l of clientLogos) {
    await prisma.clientLogo.upsert({
      where: { key: l.key },
      update: { logoUrl: l.logoUrl },
      create: {
        ...l,
        isPublished: true,
        status: PublicationStatus.PUBLISHED,
      },
    });
  }

  // 6. Seed Client Partners (15 flagship client profiles from clients-partners.ts)
  console.log('[seed-cms] Seeding Client Partners...');
  const clientPartners = [
    {
      slug: 'najma-tavakolian',
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
      yearFa: '۱۴۰۲ - تاکنون',
      yearEn: '2023 - Present',
      monogram: 'NT',
      websites: [
        { url: 'https://najmatavakolian.net/', label: 'najmatavakolian.net' },
        { url: 'https://najmatavakolian.com/', label: 'najmatavakolian.com' },
      ],
      instagrams: [
        { handle: '@najma.immigration', profileUrl: 'https://instagram.com/najma.immigration' },
        { handle: '@najma_tavakolian_immigration', profileUrl: 'https://instagram.com/najma_tavakolian_immigration' },
      ],
      servicesFa: ['طراحی وب‌سایت دو زبانه', 'هویت بصری بین‌المللی', 'سئو و برندینگ'],
      servicesEn: ['Multilingual Web Portal', 'Global Visual Identity', 'SEO & Branding'],
      position: 1,
    },
    {
      slug: 'shin-beauty-center',
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
      yearFa: '۱۴۰۱ - تاکنون',
      yearEn: '2022 - Present',
      monogram: 'SH',
      websites: [{ url: 'https://shinbeautycenter.com/', label: 'shinbeautycenter.com' }],
      instagrams: [{ handle: '@shinbeautycenter', profileUrl: 'https://instagram.com/shinbeautycenter' }],
      servicesFa: ['هویت بصری لوکس کلینیکال', 'سامانه نوبت‌دهی آنلاین', 'تولید محتوای ویدیویی ۴K'],
      servicesEn: ['Luxury Clinical Branding', 'Online Booking Engine', '4K Video Production'],
      position: 2,
    },
    {
      slug: 'canza-construction',
      orderNumber: '03',
      nameFa: 'گروه ساختمانی کانزا',
      nameEn: 'Canza Construction',
      titleFa: 'توسعه پروژه‌های لوکس مسکونی و تجاری',
      titleEn: 'Luxury Residential & Commercial Real Estate',
      industryFa: 'ساختمان و مهندسی معماری',
      industryEn: 'Architecture & Construction',
      introFa: 'طراحی، سرمایه‌گذاری و اجرای بناهای مدرن ساختمانی با استانداردهای مهندسی برتر بین‌المللی',
      introEn: 'Architectural engineering, development, and delivery of signature residential complexes',
      quoteFa: '«ارائه دیجیتال پروژه‌ها و هویت فاخر سازمانی خلق‌شده توسط آن‌ساپ، جلوه‌ای متمایز به برند کانزا در بازار املاک لوکس بخشید.»',
      quoteEn: '“Digital project presentations and signature corporate identity engineered by OnSupp distinguished Canza across premium real estate markets.”',
      yearFa: '۱۴۰۲ - تاکنون',
      yearEn: '2023 - Present',
      monogram: 'CC',
      websites: [{ url: 'https://canzaconstruction.ca/', label: 'canzaconstruction.ca' }],
      instagrams: [{ handle: '@canzaconstruction', profileUrl: 'https://instagram.com/canzaconstruction' }],
      servicesFa: ['پرتال سازمانی بین‌المللی', 'تصویربرداری هوایی و صنعتی', 'کاتالوگ و پرزنتیشن دیجیتال'],
      servicesEn: ['International Web Platform', 'Aerial & Industrial Video', 'Digital Presentation Deck'],
      position: 3,
    },
  ];

  for (const cp of clientPartners) {
    await prisma.clientPartner.upsert({
      where: { slug: cp.slug },
      update: {},
      create: {
        ...cp,
        portraitImage: null,
        portraitBadgeFa: 'کارفرمای منتخب آن‌ساپ',
        portraitBadgeEn: 'OnSupp Verified Partner',
        isFeatured: true,
        isPublished: true,
        status: PublicationStatus.PUBLISHED,
      },
    });
  }

  // 7. Seed Homepage Sections (10 sections)
  console.log('[seed-cms] Seeding Homepage Sections...');
  const sections = [
    { key: 'hero', titleFa: 'اسلایدر اصلی', titleEn: 'Hero Slide Banner', position: 0 },
    { key: 'clients-partners', titleFa: 'کارفرمایان و شرکای تجاری', titleEn: 'Clients & Partners', position: 1 },
    { key: 'stats', titleFa: 'آمار رضایت و شاخص‌ها', titleEn: 'Satisfaction Metrics', position: 2 },
    { key: 'services', titleFa: 'خدمات تخصصی', titleEn: 'Core Services Grid', position: 3 },
    { key: 'about', titleFa: 'درباره آن‌ساپ', titleEn: 'About OnSupp Agency', position: 4 },
    { key: 'client-marquee', titleFa: 'لوگوی مشتریان', titleEn: 'Client Logo Marquee', position: 5 },
    { key: 'casestudies', titleFa: 'نمونه‌کارها و پروژه‌های شاخص', titleEn: 'Case Studies Showcase', position: 6 },
    { key: 'contact-cta', titleFa: 'فرم مشاوره و ارتباط', titleEn: 'Contact Inquiry CTA', position: 7 },
    { key: 'testimonials', titleFa: 'نظرات کارفرمایان', titleEn: 'Client Testimonials', position: 8 },
    { key: 'blog-articles', titleFa: 'مقالات و آموزش‌ها', titleEn: 'Recent Articles & News', position: 9 },
  ];

  for (const s of sections) {
    await prisma.homepageSection.upsert({
      where: { key: s.key },
      update: {},
      create: {
        key: s.key,
        titleFa: s.titleFa,
        titleEn: s.titleEn,
        position: s.position,
        isEnabled: true,
        sectionType: 'standard',
        settingsJson: {},
      },
    });
  }

  // 8. Update & Enrich 7 Core Services (Matching services-data.ts)
  console.log('[seed-cms] Enriching 7 Core Services...');
  const detailedServices = [
    {
      slug: 'social-identity',
      tagFa: 'فضای مجازی و هویت',
      tagEn: 'Social & Identity',
      title: 'مدیریت و هویت‌سازی فضای مجازی',
      titleEn: 'Social Media & Brand Identity',
      subtitle: 'طراحی هویت بصری منسجم و استراتژی برندینگ',
      subtitleEn: 'Cohesive visual identity and organic audience engagement',
      headlineFa: 'تبدیل توجه مخاطب به سرمایه ماندگار برند در شبکه‌های اجتماعی',
      headlineEn: 'Transforming audience attention into lasting brand equity across social media',
      detailedNarrativeFa: 'طراحی هویت بصری منسجم، تدوین استراتژی برندینگ و مدیریت تعاملات شبکه‌های اجتماعی برای ارتقای تمایز و ماندگاری برند در ذهن مخاطب.',
      detailedNarrativeEn: 'Cohesive visual identity, brand strategy design, and active social media management to maximize brand recall and organic audience engagement.',
      businessValueTitleFa: 'ارزش افزوده استراتژیک برای کسب‌وکار شما',
      businessValueTitleEn: 'Strategic Business Value',
      businessValueFa: 'حضور منظم و هویت‌محور در فضای مجازی نرخ جذب مشتری بالقوه را تا ۳۰۰٪ ارتقا داده و هزینه جذب مراجعین جدید را به شکل محسوسی کاهش می‌دهد.',
      businessValueEn: 'Strategic visual consistency across social media drives up to 300% qualified inquiry growth while reducing customer acquisition cost.',
      iconType: 'social',
      imageUrl: '/images/services/social-identity.webp',
      coverImage: '/images/services/social-identity.webp',
      position: 1,
      metrics: [
        { valueFa: '+۳۰۰٪', valueEn: '+300%', labelFa: 'افزایش تعامل ارگانیک', labelEn: 'Organic Engagement Growth' },
        { valueFa: '۴.۸/۵', valueEn: '4.8/5', labelFa: 'امتیاز کیفیت هویت بصری', labelEn: 'Visual Identity Score' },
        { valueFa: '۱۰۰٪', valueEn: '100%', labelFa: 'تقویم محتوای یکپارچه', labelEn: 'Unified Editorial Calendar' },
      ],
      subservices: [
        {
          nameFa: 'طراحی برند و مدیریت استراتژی',
          nameEn: 'Brand Design & Strategy Management',
          descFa: 'تدوین هویت کلامی و بصری، گایدلاین‌های برند و استراتژی محتوایی تمایزبخش.',
          descEn: 'Verbal and visual branding guidelines and audience-targeted content positioning.',
          deliverablesFa: ['کتابچه راهنمای هویت برند', 'پالت رنگی و تایپوگرافی رسمی', 'پرسونای مخاطب و تقویم اجرایی'],
          deliverablesEn: ['Brand Guidelines Manual', 'Official Palette & Typography', 'Audience Personas & Calendar'],
        },
        {
          nameFa: 'طراحی محتوای گرافیکی و سینمایی پویا',
          nameEn: 'Dynamic Graphic & Cinematic Content',
          descFa: 'تولید کاور، تمپلیت‌های تعاملی، استوری‌های سناریومحور و پست‌های ورق‌زدنی با استانداردهای لوکس.',
          descEn: 'High-end social carousel designs, engaging motion stories, and luxury grid layouts.',
          deliverablesFa: ['پک قالب پست‌های اسلایدی', 'استوری‌های تعاملی روزانه', 'سناریونویسی تخصصی محتوا'],
          deliverablesEn: ['Carousel Templates Kit', 'Daily Interactive Stories', 'Targeted Copywriting Scripts'],
        },
      ],
    },
    {
      slug: 'web-development',
      tagFa: 'مهندسی وب و سامانه‌ها',
      tagEn: 'Web & Systems',
      title: 'طراحی سایت و وب‌اپلیکیشن اختصاصی',
      titleEn: 'Custom Web Design & Enterprise Apps',
      subtitle: 'توسعه وب‌سایت‌های مدرن، پرفورمنس‌محور و واکنش‌گرا',
      subtitleEn: 'Modern, high-performance Next.js portals and web apps',
      headlineFa: 'معماری فنی فوق‌سریع، تجربه کاربری روان و پایداری سازمانی',
      headlineEn: 'Ultra-fast web architecture, seamless UX, and rock-solid scalability',
      detailedNarrativeFa: 'توسعه وب‌سایت‌ها و پورتال‌های اختصاصی با فریمورک پیشرو Next.js و استانداردهای روز گوگل. سرعت لود زیر یک ثانیه، امنیت پیشرفته و معماری سئومحور.',
      detailedNarrativeEn: 'Engineering custom web platforms and enterprise portals with Next.js and industry-leading web performance standards.',
      businessValueTitleFa: 'تاثیر مهندسی اختصاصی بر رشد فروش',
      businessValueTitleEn: 'Impact on Revenue & Scalability',
      businessValueFa: 'کاهش زمان بارگذاری صفحات به زیر ۱ ثانیه، نرخ پرش (Bounce Rate) را بیش از ۴۵٪ کاهش داده و تبدیل بازدیدکنندگان به مشتری را دو برابر می‌کند.',
      businessValueEn: 'Sub-second page loading cuts bounce rates by 45% and directly doubles lead-to-customer conversion.',
      iconType: 'web',
      imageUrl: '/images/services/web-development.webp',
      coverImage: '/images/services/web-development.webp',
      position: 2,
      metrics: [
        { valueFa: '< ۰.۸s', valueEn: '< 0.8s', labelFa: 'سرعت لود اولیه صفحات', labelEn: 'Average Initial Page Load' },
        { valueFa: '۱۰۰/۱۰۰', valueEn: '100/100', labelFa: 'امتیاز Google PageSpeed', labelEn: 'Google PageSpeed Vitals' },
        { valueFa: '+۱۸۰٪', valueEn: '+180%', labelFa: 'افزایش نرخ تبدیل کاربر', labelEn: 'Conversion Rate Lift' },
      ],
      subservices: [
        {
          nameFa: 'طراحی رابط و تجربه کاربری (UI/UX)',
          nameEn: 'UI/UX Product Design',
          descFa: 'طراحی پروتوتایپ‌های تعاملی در فیگما بر اساس رفتارشناسی مخاطب هدف.',
          descEn: 'Figma interactive prototypes grounded in audience psychographics and journey mapping.',
          deliverablesFa: ['وایرفریم و پروتوتایپ فیگما', 'دیزاین سیستم اختصاصی', 'تست کاربری و مسیر تبدیل'],
          deliverablesEn: ['Figma Prototypes', 'Design System Library', 'User Journey Testing'],
        },
        {
          nameFa: 'توسعه فرانت‌اند با Next.js و TypeScript',
          nameEn: 'Next.js & TypeScript Development',
          descFa: 'کدنویسی استاندارد، بدون باگ، سئومحور و بهینه‌شده برای موتورهای جستجو.',
          descEn: 'Type-safe Next.js App Router engineering with SSR and ISR support.',
          deliverablesFa: ['سایت کاملاً داینامیک و واکنش‌گرا', 'پنل ادمین اختصاصی', 'بهینه‌سازی کامل Core Web Vitals'],
          deliverablesEn: ['Dynamic Responsive Web App', 'Custom Admin CMS', 'Core Web Vitals Optimization'],
        },
      ],
    },
    {
      slug: 'technical-seo',
      tagFa: 'سئو و رشد ارگانیک',
      tagEn: 'Technical SEO',
      title: 'سئو تکنیکال و رشد ارگانیک',
      titleEn: 'Technical SEO & Organic Dominance',
      subtitle: 'استراتژی فتح رتبه‌های نخست گوگل و ترافیک پایدار',
      subtitleEn: 'Google top rankings and sustainable search traffic',
      headlineFa: 'دستیابی به ترافیک هدفمند و تصاحب رتبه‌های اول کلمات تجاری',
      headlineEn: 'Dominating commercial search intents with predictable organic traffic',
      detailedNarrativeFa: 'تحلیل عمیق رقبا، تصحیح خطاهای فنی سرور، بهینه‌سازی کدهای اسکیما (Schema Markup) و استراتژی لینک‌سازی طبیعی برای حضور مستمر در رتبه‌های برتر گوگل.',
      detailedNarrativeEn: 'Deep competitive gap analysis, technical server architecture fixes, schema markup, and high-authority link strategies for dominant search visibility.',
      businessValueTitleFa: 'سرمایه‌گذاری بلندمدت بدون نیاز به تبلیغات کلیکی',
      businessValueTitleEn: 'Long-term Organic ROI',
      businessValueFa: 'ترافیک ورودی سئو برخلاف تبلیغات مقطعی، دائمی و پایدار است و ارزش تجاری هر ورودی ارگانیک تا ۶ برابر ورودی شبکه‌های اجتماعی برآورد می‌شود.',
      businessValueEn: 'Organic traffic compounds over time without recurring ad spend, delivering up to 6x higher qualified conversion value.',
      iconType: 'seo',
      imageUrl: '/images/services/technical-seo.webp',
      coverImage: '/images/services/technical-seo.webp',
      position: 3,
      metrics: [
        { valueFa: '+۳۲۰٪', valueEn: '+320%', labelFa: 'رشد میانگین ترافیک ارگانیک', labelEn: 'Average Organic Traffic Lift' },
        { valueFa: '#۱', valueEn: '#1', labelFa: 'رتبه در کلمات کلیدی هدف', labelEn: 'Rankings on Priority Keywords' },
        { valueFa: '۰ خطای کرال', valueEn: '0 Crawl Errors', labelFa: 'سلامت فنی در سرچ کنسول', labelEn: 'Google Search Console Health' },
      ],
      subservices: [
        {
          nameFa: 'حسابرسی فنی و رفع خطاهای سایت (Technical Audit)',
          nameEn: 'Technical SEO Audit & Architecture',
          descFa: 'بررسی رندرینگ، بودجه خزش، سرعت سرور و پیاده‌سازی اسکیماهای ساختاریافته.',
          descEn: 'Rendering optimization, crawl budget management, server latency tuning, and JSON-LD schema.',
          deliverablesFa: ['گزارش جامع سلامت سئو تکنیکال', 'پیاده‌سازی کدهای Schema Markup', 'رفع خطاهای Search Console'],
          deliverablesEn: ['Technical Audit Dossier', 'Custom JSON-LD Schema Kit', 'Search Console Issue Resolution'],
        },
      ],
    },
  ];

  for (const s of detailedServices) {
    const existing = await prisma.service.findFirst({
      where: { slug: s.slug },
    });
    if (existing) {
      await prisma.service.update({
        where: { id: existing.id },
        data: {
          ...s,
          isPublished: true,
          status: PublicationStatus.PUBLISHED,
        },
      });
    } else {
      await prisma.service.create({
        data: {
          ...s,
          isPublished: true,
          status: PublicationStatus.PUBLISHED,
        },
      });
    }
  }

  // 9. Update & Enrich Case Studies (Matching lib/case-studies.ts)
  console.log('[seed-cms] Enriching Case Studies...');
  const richCaseStudies = [
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
      servicesFa: ['طراحی وب‌سایت و پرتال رزرو', 'هویت برند و هویت بصری', 'تولید محتوا و مدیریت اینستاگرام'],
      servicesEn: ['Web Portal & Booking System', 'Medical Visual Identity', 'Content Production & Instagram'],
      challengeFa: 'ناهماهنگی در هویت بصری، هدررفت زمان پرسنل مطب در پاسخگویی تلفنی به مراجعین و عدم وجود پرتال رسمی برای معرفی خدمات زیبایی تخصصی.',
      challengeEn: 'Disjointed clinic visual branding and heavy phone consultation load preventing streamlined patient intake.',
      solutionFa: 'طراحی پرتال مدرن با سرعت بارگذاری فوق‌العاده و اتصال مستقیم سیستم نوبت‌دهی پیامکی در کنار سناریونویسی و تصویربرداری حرفه‌ای استودیویی.',
      solutionEn: 'Delivered a refined clinical editorial web presence with integrated automated SMS booking and cinema-grade studio social reels.',
      resultsFa: 'افزایش ۱۸۰ درصدی جذب مراجعین آنلاین و خودکارسازی ۱۰۰ درصدی رزرو نوبت بدون نیاز به تماس تلفنی.',
      resultsEn: '+180% increase in patient acquisition and 100% automated booking workflow.',
      deliverablesFa: ['پرتال اینترنتی رزرو و گالری قبل و بعد', 'هویت بصری لوکس و پالت رنگی پزشکی', 'پکیج ویدیوهای آموزشی و هایلایت‌های اینستاگرام'],
      deliverablesEn: ['Web Booking & Case Gallery Portal', 'Medical Visual Identity Kit', '4K Studio Video Production & Instagram Grid'],
      metricsFa: [
        { value: '+۱۸۰٪', label: 'افزایش جذب مراجعین آنلاین' },
        { value: '۱۰۰٪', label: 'نوبت‌دهی خودکار بدون تماس' },
        { value: '۴K', label: 'کیفیت محتوای استودیویی' },
      ],
      metricsEn: [
        { value: '+180%', label: 'Online Patient Inquiries' },
        { value: '100%', label: 'Automated Self-Booking' },
        { value: '4K', label: 'Studio Production Grade' },
      ],
      colorGradient: 'from-[#1a1315] via-[#241a1e] to-[#100b0d]',
      accentColor: '#D4A5A8',
      glowColor: 'rgba(212, 165, 168, 0.2)',
      previewType: 'web',
      imageUrl: '/images/portfolio/dr-miresmaeli-clinic-hero.webp',
      secondaryImage: '/images/portfolio/dr-miresmaeli-clinic-full.webp',
      liveUrl: 'https://drmiresmaeli.com/',
      featured: true,
      position: 1,
      year: '۲۰۲۴',
    },
  ];

  for (const cs of richCaseStudies) {
    const existing = await prisma.caseStudy.findFirst({
      where: { slug: cs.slug },
    });
    if (existing) {
      await prisma.caseStudy.update({
        where: { id: existing.id },
        data: {
          ...cs,
          isPublished: true,
          status: PublicationStatus.PUBLISHED,
        },
      });
    } else {
      await prisma.caseStudy.create({
        data: {
          ...cs,
          isPublished: true,
          status: PublicationStatus.PUBLISHED,
        },
      });
    }
  }

  // 10. Seed Satisfaction Stats (4 verified homepage stats)
  console.log('[seed-cms] Seeding verified Satisfaction Stats...');
  const stats = [
    {
      kind: 'score',
      valueFa: '۴.۹ / ۵',
      valueEn: '4.9 / 5',
      labelFa: 'رضایت مراجعین و برندها',
      labelEn: 'Client Satisfaction Score',
      descFa: 'بر اساس نظرسنجی و بازخورد رسمی بیش از ۲۰۰ کارفرما',
      descEn: 'Based on verified feedback across 200+ partner brands',
      position: 1,
    },
    {
      kind: 'number',
      valueFa: '+۲۰۰',
      valueEn: '+200',
      labelFa: 'پروژه موفق وب و برندینگ',
      labelEn: 'Completed Flagship Projects',
      descFa: 'پروژه‌های اجرایی شده در حوزه‌های پزشکی، صنعتی و خدماتی',
      descEn: 'Enterprise web, branding, and media projects delivered',
      position: 2,
    },
    {
      kind: 'number',
      valueFa: '۸ سال',
      valueEn: '8 Years',
      labelFa: 'تجربه تخصصی و همراهی مستمر',
      labelEn: 'Years of Digital Leadership',
      descFa: 'تخصص در بازاریابی داده‌محور و مهندسی مقیاس‌پذیر',
      descEn: 'Proven experience in data marketing and scalable tech',
      position: 3,
    },
    {
      kind: 'number',
      valueFa: '+۱۵',
      valueEn: '+15',
      labelFa: 'متخصص خلاق و ارشد مهندسی',
      labelEn: 'Senior Engineers & Creators',
      descFa: 'تیم منسجم استراتژی، طراحی، نرم‌افزار و استودیو',
      descEn: 'Multidisciplinary team under one unified roof',
      position: 4,
    },
  ];

  for (const st of stats) {
    const existing = await prisma.stat.findFirst({
      where: { labelFa: st.labelFa },
    });
    if (existing) {
      await prisma.stat.update({
        where: { id: existing.id },
        data: {
          ...st,
          isPublished: true,
          status: PublicationStatus.PUBLISHED,
        },
      });
    } else {
      await prisma.stat.create({
        data: {
          ...st,
          isPublished: true,
          status: PublicationStatus.PUBLISHED,
        },
      });
    }
  }

  // 11. Seed Canonical Testimonials
  console.log('[seed-cms] Seeding canonical Testimonials...');
  const canonicalTestimonials = [
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
      position: 1,
      isActive: true,
      status: PublicationStatus.PUBLISHED,
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
      position: 2,
      isActive: true,
      status: PublicationStatus.PUBLISHED,
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
      position: 3,
      isActive: true,
      status: PublicationStatus.PUBLISHED,
    },
  ];

  for (const t of canonicalTestimonials) {
    const existing = await prisma.testimonial.findFirst({
      where: { authorFa: t.authorFa },
    });
    if (existing) {
      await prisma.testimonial.update({
        where: { id: existing.id },
        data: t,
      });
    } else {
      await prisma.testimonial.create({
        data: t,
      });
    }
  }

  console.log('[seed-cms] All dynamic CMS entities successfully seeded!');
}

if (process.env.NODE_ENV !== 'test') {
  seedCms()
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error('[seed-cms ERROR]', e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
