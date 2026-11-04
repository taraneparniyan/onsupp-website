-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "case_studies" ADD COLUMN     "accentColor" TEXT NOT NULL DEFAULT '#8BB3A4',
ADD COLUMN     "canonicalUrl" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "challengeEn" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "challengeFa" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "colorGradient" TEXT NOT NULL DEFAULT 'from-[#1a1315] via-[#241a1e] to-[#100b0d]',
ADD COLUMN     "deliverablesEn" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "deliverablesFa" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "gallery" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "glowColor" TEXT NOT NULL DEFAULT 'rgba(139, 179, 164, 0.2)',
ADD COLUMN     "keywordsEn" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "keywordsFa" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "metaDescEn" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "metaDescFa" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "metaTitleEn" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "metaTitleFa" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "metricsEn" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "metricsFa" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "ogImage" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "previewType" TEXT NOT NULL DEFAULT 'web',
ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "servicesEn" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "servicesFa" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "solutionEn" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "solutionFa" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
ALTER COLUMN "year" SET DEFAULT '۱۴۰۳';

-- AlterTable
ALTER TABLE "contact_content" ALTER COLUMN "phone" SET DEFAULT '';

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "businessValueEn" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "businessValueFa" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "businessValueTitleEn" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "businessValueTitleFa" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "canonicalUrl" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "coverImageAlt" TEXT,
ADD COLUMN     "coverImageUrl" TEXT,
ADD COLUMN     "deliverablesEn" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "deliverablesFa" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "descriptionEn" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "descriptionFa" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "detailedNarrativeEn" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "detailedNarrativeFa" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "gallery" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "headlineEn" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "headlineFa" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "iconType" TEXT NOT NULL DEFAULT 'web',
ADD COLUMN     "keywordsEn" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "keywordsFa" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "metaDescEn" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "metaDescFa" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "metaTitleEn" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "metaTitleFa" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "metrics" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "ogImage" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "relatedLinks" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "slug" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
ADD COLUMN     "subservices" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "tagEn" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "tagFa" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "stats" ADD COLUMN     "iconType" TEXT NOT NULL DEFAULT 'star',
ADD COLUMN     "isRating" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
ADD COLUMN     "suffixEn" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "suffixFa" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "site_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "siteNameFa" TEXT NOT NULL DEFAULT 'آن‌ساپ',
    "siteNameEn" TEXT NOT NULL DEFAULT 'OnSupp',
    "siteDescriptionFa" TEXT NOT NULL DEFAULT 'آژانس خلاق دیجیتال مارکتینگ و توسعه نرم‌افزار',
    "siteDescriptionEn" TEXT NOT NULL DEFAULT 'Creative Digital Marketing & Software Development Agency',
    "headerCtaTextFa" TEXT NOT NULL DEFAULT 'شروع همکاری',
    "headerCtaTextEn" TEXT NOT NULL DEFAULT 'Get Started',
    "headerCtaLink" TEXT NOT NULL DEFAULT '/#contact',
    "addressTitleFa" TEXT NOT NULL DEFAULT 'آدرس و نشانی',
    "addressTitleEn" TEXT NOT NULL DEFAULT 'Office Address',
    "streetFa" TEXT NOT NULL DEFAULT 'عظیمیه، میدان کوهنورد، گلستان ۲۱',
    "streetEn" TEXT NOT NULL DEFAULT 'Golestan 21, Kouhnavard Sq, Azimiyeh',
    "cityFa" TEXT NOT NULL DEFAULT 'البرز، کرج، منطقه عظیمیه',
    "cityEn" TEXT NOT NULL DEFAULT 'Alborz, Karaj, Azimiyeh District',
    "workingHoursFa" TEXT NOT NULL DEFAULT 'شنبه تا چهارشنبه ۹:۰۰ تا ۱۸:۰۰',
    "workingHoursEn" TEXT NOT NULL DEFAULT 'Sat - Wed: 09:00 - 18:00',
    "channels" JSONB NOT NULL DEFAULT '[]',
    "telegramUrl" TEXT NOT NULL DEFAULT 'https://t.me/onsupp_web',
    "telegramHandle" TEXT NOT NULL DEFAULT 'onsupp_web',
    "instagramUrl" TEXT NOT NULL DEFAULT 'https://instagram.com/onsupp_web',
    "linkedinUrl" TEXT,
    "consultEmail" TEXT NOT NULL DEFAULT 'info@onsupp.ir',
    "footerTextFa" TEXT NOT NULL DEFAULT 'کلیه حقوق مادی و معنوی متعلق به آژانس دیجیتال مارکتینگ آن‌ساپ می‌باشد.',
    "footerTextEn" TEXT NOT NULL DEFAULT 'All rights reserved by OnSupp Digital Marketing Agency.',
    "copyrightTextFa" TEXT NOT NULL DEFAULT 'تمامی حقوق برای آن‌ساپ محفوظ است.',
    "copyrightTextEn" TEXT NOT NULL DEFAULT 'All rights reserved.',
    "defaultMetaTitleFa" TEXT NOT NULL DEFAULT 'آن‌ساپ | آژانس دیجیتال مارکتینگ و توسعه نرم‌افزار',
    "defaultMetaTitleEn" TEXT NOT NULL DEFAULT 'OnSupp | Digital Agency & Software Engineering',
    "defaultMetaDescFa" TEXT NOT NULL DEFAULT '',
    "defaultMetaDescEn" TEXT NOT NULL DEFAULT '',
    "defaultKeywordsFa" TEXT NOT NULL DEFAULT '',
    "defaultKeywordsEn" TEXT NOT NULL DEFAULT '',
    "headerLogoUrl" TEXT,
    "footerLogoUrl" TEXT,
    "faviconUrl" TEXT,
    "ogImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_partners" (
    "id" SERIAL NOT NULL,
    "orderNumber" TEXT NOT NULL DEFAULT '01',
    "nameFa" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL DEFAULT '',
    "titleFa" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL DEFAULT '',
    "industryFa" TEXT NOT NULL DEFAULT '',
    "industryEn" TEXT NOT NULL DEFAULT '',
    "introFa" TEXT NOT NULL DEFAULT '',
    "introEn" TEXT NOT NULL DEFAULT '',
    "quoteFa" TEXT,
    "quoteEn" TEXT,
    "servicesFa" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "servicesEn" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "yearFa" TEXT NOT NULL DEFAULT '۱۴۰۳',
    "yearEn" TEXT NOT NULL DEFAULT '2024',
    "portraitImage" TEXT,
    "portraitBadgeFa" TEXT,
    "portraitBadgeEn" TEXT,
    "monogram" TEXT NOT NULL DEFAULT 'OP',
    "websites" JSONB NOT NULL DEFAULT '[]',
    "instagrams" JSONB NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_logos" (
    "id" SERIAL NOT NULL,
    "nameFa" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT NOT NULL,
    "altFa" TEXT NOT NULL DEFAULT '',
    "altEn" TEXT NOT NULL DEFAULT '',
    "websiteUrl" TEXT,
    "width" INTEGER NOT NULL DEFAULT 200,
    "height" INTEGER NOT NULL DEFAULT 100,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_logos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" SERIAL NOT NULL,
    "nameFa" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL DEFAULT '',
    "roleFa" TEXT NOT NULL,
    "roleEn" TEXT NOT NULL DEFAULT '',
    "departmentFa" TEXT NOT NULL DEFAULT 'عمومی',
    "departmentEn" TEXT NOT NULL DEFAULT 'General',
    "bioFa" TEXT NOT NULL DEFAULT '',
    "bioEn" TEXT NOT NULL DEFAULT '',
    "photoUrl" TEXT,
    "photoAltFa" TEXT,
    "photoAltEn" TEXT,
    "focalPoint" TEXT NOT NULL DEFAULT '50% 50%',
    "gallery" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "socialLinks" JSONB NOT NULL DEFAULT '[]',
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "isLeadership" BOOLEAN NOT NULL DEFAULT false,
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "about_page_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "heroEyebrowFa" TEXT NOT NULL DEFAULT 'درباره آن‌ساپ',
    "heroEyebrowEn" TEXT NOT NULL DEFAULT 'About OnSupp',
    "heroTitleFa" TEXT NOT NULL DEFAULT 'تیمی فراتر از مرزهای سنتی دیجیتال مارکتینگ',
    "heroTitleEn" TEXT NOT NULL DEFAULT 'Beyond the Boundaries of Traditional Agency',
    "heroCaptionFa" TEXT NOT NULL DEFAULT '',
    "heroCaptionEn" TEXT NOT NULL DEFAULT '',
    "heroImageUrl" TEXT,
    "heroImageAltFa" TEXT,
    "heroImageAltEn" TEXT,
    "introEyebrowFa" TEXT NOT NULL DEFAULT 'دیدگاه استراتژیک',
    "introEyebrowEn" TEXT NOT NULL DEFAULT 'Strategic Vision',
    "introTitleFa" TEXT NOT NULL DEFAULT 'تمرکز بر ساختن ارزش‌های ماندگار',
    "introTitleEn" TEXT NOT NULL DEFAULT 'Focused on Enduring Value Creation',
    "introLeadFa" TEXT NOT NULL DEFAULT '',
    "introLeadEn" TEXT NOT NULL DEFAULT '',
    "introApproachFa" TEXT NOT NULL DEFAULT '',
    "introApproachEn" TEXT NOT NULL DEFAULT '',
    "coreValues" JSONB NOT NULL DEFAULT '[]',
    "ceoNameFa" TEXT NOT NULL DEFAULT 'علی شمس',
    "ceoNameEn" TEXT NOT NULL DEFAULT 'Ali Shams',
    "ceoRoleFa" TEXT NOT NULL DEFAULT 'مدیرعامل و هم‌بنیان‌گذار',
    "ceoRoleEn" TEXT NOT NULL DEFAULT 'Chief Executive Officer & Co-Founder',
    "ceoQuoteFa" TEXT NOT NULL DEFAULT '',
    "ceoQuoteEn" TEXT NOT NULL DEFAULT '',
    "ceoBioFa" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ceoBioEn" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ceoPhotoUrl" TEXT,
    "ceoSocialLinks" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "about_page_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_sections" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "titleFa" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT 'section',
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "home_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_seo" (
    "id" SERIAL NOT NULL,
    "routePath" TEXT NOT NULL,
    "titleFa" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL DEFAULT '',
    "descriptionFa" TEXT NOT NULL DEFAULT '',
    "descriptionEn" TEXT NOT NULL DEFAULT '',
    "keywordsFa" TEXT NOT NULL DEFAULT '',
    "keywordsEn" TEXT NOT NULL DEFAULT '',
    "canonicalUrl" TEXT NOT NULL DEFAULT '',
    "ogImageUrl" TEXT,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_seo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "client_partners_isActive_idx" ON "client_partners"("isActive");

-- CreateIndex
CREATE INDEX "client_partners_status_idx" ON "client_partners"("status");

-- CreateIndex
CREATE INDEX "client_partners_position_idx" ON "client_partners"("position");

-- CreateIndex
CREATE INDEX "client_logos_isActive_idx" ON "client_logos"("isActive");

-- CreateIndex
CREATE INDEX "client_logos_status_idx" ON "client_logos"("status");

-- CreateIndex
CREATE INDEX "client_logos_position_idx" ON "client_logos"("position");

-- CreateIndex
CREATE INDEX "team_members_isPublished_idx" ON "team_members"("isPublished");

-- CreateIndex
CREATE INDEX "team_members_status_idx" ON "team_members"("status");

-- CreateIndex
CREATE INDEX "team_members_position_idx" ON "team_members"("position");

-- CreateIndex
CREATE UNIQUE INDEX "home_sections_key_key" ON "home_sections"("key");

-- CreateIndex
CREATE INDEX "home_sections_position_idx" ON "home_sections"("position");

-- CreateIndex
CREATE INDEX "home_sections_isEnabled_idx" ON "home_sections"("isEnabled");

-- CreateIndex
CREATE UNIQUE INDEX "page_seo_routePath_key" ON "page_seo"("routePath");

-- CreateIndex
CREATE INDEX "page_seo_routePath_idx" ON "page_seo"("routePath");

-- CreateIndex
CREATE INDEX "case_studies_published_idx" ON "case_studies"("published");

-- CreateIndex
CREATE INDEX "case_studies_status_idx" ON "case_studies"("status");

-- CreateIndex
CREATE INDEX "services_slug_idx" ON "services"("slug");

-- CreateIndex
CREATE INDEX "services_published_idx" ON "services"("published");

-- CreateIndex
CREATE INDEX "services_status_idx" ON "services"("status");

-- CreateIndex
CREATE INDEX "services_position_idx" ON "services"("position");

-- CreateIndex
CREATE INDEX "stats_published_idx" ON "stats"("published");

-- CreateIndex
CREATE INDEX "stats_status_idx" ON "stats"("status");

-- CreateIndex
CREATE INDEX "stats_position_idx" ON "stats"("position");
