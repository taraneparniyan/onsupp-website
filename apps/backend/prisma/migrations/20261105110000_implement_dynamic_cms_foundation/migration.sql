-- CreateEnum (Idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PublicationStatus') THEN
    CREATE TYPE "PublicationStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
  END IF;
END $$;

-- AlterTable hero_slide
ALTER TABLE "hero_slide" 
  ADD COLUMN IF NOT EXISTS "isPublished" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "status" "PublicationStatus" NOT NULL DEFAULT 'PUBLISHED';

CREATE INDEX IF NOT EXISTS "hero_slide_position_idx" ON "hero_slide"("position");
CREATE INDEX IF NOT EXISTS "hero_slide_isPublished_idx" ON "hero_slide"("isPublished");

-- AlterTable services
ALTER TABLE "services" 
  ADD COLUMN IF NOT EXISTS "slug" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "tagFa" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "tagEn" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "headlineFa" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "headlineEn" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "detailedNarrativeFa" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "detailedNarrativeEn" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "businessValueTitleFa" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "businessValueTitleEn" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "businessValueFa" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "businessValueEn" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "coverImage" TEXT,
  ADD COLUMN IF NOT EXISTS "gallery" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS "iconType" TEXT NOT NULL DEFAULT 'web',
  ADD COLUMN IF NOT EXISTS "badgeAccentFa" TEXT,
  ADD COLUMN IF NOT EXISTS "badgeAccentEn" TEXT,
  ADD COLUMN IF NOT EXISTS "ctaLabelFa" TEXT NOT NULL DEFAULT 'درخواست مشاوره این خدمت',
  ADD COLUMN IF NOT EXISTS "ctaLabelEn" TEXT NOT NULL DEFAULT 'Request Service Consultation',
  ADD COLUMN IF NOT EXISTS "subservices" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS "deliverablesFa" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "deliverablesEn" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "metrics" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS "relatedLinks" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS "metaTitleFa" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "metaTitleEn" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "metaDescFa" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "metaDescEn" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "keywords" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "isPublished" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "status" "PublicationStatus" NOT NULL DEFAULT 'PUBLISHED';

CREATE INDEX IF NOT EXISTS "services_position_idx" ON "services"("position");
CREATE INDEX IF NOT EXISTS "services_slug_idx" ON "services"("slug");
CREATE INDEX IF NOT EXISTS "services_isPublished_idx" ON "services"("isPublished");

-- AlterTable stats
ALTER TABLE "stats" 
  ADD COLUMN IF NOT EXISTS "isPublished" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "status" "PublicationStatus" NOT NULL DEFAULT 'PUBLISHED';

CREATE INDEX IF NOT EXISTS "stats_position_idx" ON "stats"("position");
CREATE INDEX IF NOT EXISTS "stats_isPublished_idx" ON "stats"("isPublished");

-- AlterTable about_content
ALTER TABLE "about_content" 
  ADD COLUMN IF NOT EXISTS "heroCaptionFa" TEXT NOT NULL DEFAULT 'تیم آن‌ساپ — تهران',
  ADD COLUMN IF NOT EXISTS "heroCaptionEn" TEXT NOT NULL DEFAULT 'The OnSupp team — Tehran',
  ADD COLUMN IF NOT EXISTS "leadFa" TEXT NOT NULL DEFAULT 'آن‌ساپ یک آژانس دیجیتال است که استراتژی، طراحی، فناوری و رسانه را زیر یک سقف کنار هم آورده است.',
  ADD COLUMN IF NOT EXISTS "leadEn" TEXT NOT NULL DEFAULT 'OnSupp is a digital agency that brings strategy, design, technology and media together under one roof.',
  ADD COLUMN IF NOT EXISTS "approachFa" TEXT NOT NULL DEFAULT 'رویکرد ما ساده است: پیش از ساختن، گوش می‌دهیم. هر پروژه با شناخت کسب‌وکار و مخاطب شروع می‌شود.',
  ADD COLUMN IF NOT EXISTS "approachEn" TEXT NOT NULL DEFAULT 'Our approach is simple: we listen before we build. Every project starts with understanding the business and its audience.';

-- CreateTable ceo_profile
CREATE TABLE IF NOT EXISTS "ceo_profile" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "nameFa" TEXT NOT NULL DEFAULT 'نام مدیرعامل',
    "nameEn" TEXT NOT NULL DEFAULT 'CEO Name',
    "roleFa" TEXT NOT NULL DEFAULT 'بنیان‌گذار و مدیرعامل',
    "roleEn" TEXT NOT NULL DEFAULT 'Founder & CEO',
    "quoteFa" TEXT NOT NULL DEFAULT 'ما آن‌ساپ را ساختیم تا برندها مجبور نباشند بین خلاقیت و نتیجه یکی را انتخاب کنند.',
    "quoteEn" TEXT NOT NULL DEFAULT 'We built OnSupp so brands never have to choose between creativity and results.',
    "bioFa" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "bioEn" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "avatarUrl" TEXT,
    "focalPoint" TEXT NOT NULL DEFAULT '50% 50%',
    "socialLinks" JSONB NOT NULL DEFAULT '[]',
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "status" "PublicationStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ceo_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable company_values
CREATE TABLE IF NOT EXISTS "company_values" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "titleFa" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "descriptionFa" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "badgeFa" TEXT NOT NULL DEFAULT '',
    "badgeEn" TEXT NOT NULL DEFAULT '',
    "icon" TEXT NOT NULL DEFAULT 'check',
    "position" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "status" "PublicationStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_values_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "company_values_key_key" ON "company_values"("key");
CREATE INDEX IF NOT EXISTS "company_values_position_idx" ON "company_values"("position");
CREATE INDEX IF NOT EXISTS "company_values_isPublished_idx" ON "company_values"("isPublished");

-- CreateTable team_members
CREATE TABLE IF NOT EXISTS "team_members" (
    "id" SERIAL NOT NULL,
    "nameFa" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "roleFa" TEXT NOT NULL,
    "roleEn" TEXT NOT NULL,
    "departmentFa" TEXT NOT NULL,
    "departmentEn" TEXT NOT NULL,
    "bioFa" TEXT NOT NULL DEFAULT '',
    "bioEn" TEXT NOT NULL DEFAULT '',
    "avatarUrl" TEXT,
    "additionalImages" JSONB NOT NULL DEFAULT '[]',
    "focalPoint" TEXT NOT NULL DEFAULT '50% 50%',
    "socialLinks" JSONB NOT NULL DEFAULT '[]',
    "position" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "status" "PublicationStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "team_members_position_idx" ON "team_members"("position");
CREATE INDEX IF NOT EXISTS "team_members_isPublished_idx" ON "team_members"("isPublished");

-- CreateTable client_partners
CREATE TABLE IF NOT EXISTS "client_partners" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL DEFAULT '01',
    "nameFa" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "titleFa" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "industryFa" TEXT NOT NULL,
    "industryEn" TEXT NOT NULL,
    "introFa" TEXT NOT NULL,
    "introEn" TEXT NOT NULL,
    "quoteFa" TEXT,
    "quoteEn" TEXT,
    "yearFa" TEXT NOT NULL DEFAULT '۱۴۰۳',
    "yearEn" TEXT NOT NULL DEFAULT '2024',
    "monogram" TEXT NOT NULL DEFAULT 'ON',
    "portraitImage" TEXT,
    "portraitBadgeFa" TEXT,
    "portraitBadgeEn" TEXT,
    "websites" JSONB NOT NULL DEFAULT '[]',
    "instagrams" JSONB NOT NULL DEFAULT '[]',
    "servicesFa" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "servicesEn" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "position" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT true,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "status" "PublicationStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_partners_pkey" PRIMARY KEY ("id")
);

-- Adapt client_partners if it existed from previous migrations
ALTER TABLE "client_partners" 
  ADD COLUMN IF NOT EXISTS "slug" TEXT,
  ADD COLUMN IF NOT EXISTS "isPublished" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN NOT NULL DEFAULT true;

-- Deterministic collision-proof slug generation
UPDATE "client_partners"
SET "slug" = TRIM(BOTH '-' FROM 
  LOWER(
    REGEXP_REPLACE(
      COALESCE(NULLIF(TRIM("nameEn"), ''), 'partner') || '-' || id::text,
      '[^a-zA-Z0-9]+', '-', 'g'
    )
  )
)
WHERE "slug" IS NULL OR "slug" = '';

ALTER TABLE "client_partners" ALTER COLUMN "slug" SET NOT NULL;

-- Safe transition of status to PublicationStatus if ContentStatus was used
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'client_partners' AND column_name = 'status' AND udt_name = 'ContentStatus'
  ) THEN
    ALTER TABLE "client_partners" ALTER COLUMN "status" DROP DEFAULT;
    ALTER TABLE "client_partners" ALTER COLUMN "status" TYPE "PublicationStatus" USING "status"::text::"PublicationStatus";
    ALTER TABLE "client_partners" ALTER COLUMN "status" SET DEFAULT 'PUBLISHED'::"PublicationStatus";
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "client_partners_slug_key" ON "client_partners"("slug");
CREATE INDEX IF NOT EXISTS "client_partners_position_idx" ON "client_partners"("position");
CREATE INDEX IF NOT EXISTS "client_partners_isPublished_idx" ON "client_partners"("isPublished");
CREATE INDEX IF NOT EXISTS "client_partners_slug_idx" ON "client_partners"("slug");

-- CreateTable client_logos
CREATE TABLE IF NOT EXISTS "client_logos" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "nameFa" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "darkLogoUrl" TEXT,
    "altFa" TEXT NOT NULL DEFAULT '',
    "altEn" TEXT NOT NULL DEFAULT '',
    "width" INTEGER NOT NULL DEFAULT 300,
    "height" INTEGER NOT NULL DEFAULT 120,
    "linkUrl" TEXT DEFAULT '#',
    "position" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "status" "PublicationStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_logos_pkey" PRIMARY KEY ("id")
);

-- Adapt client_logos if it existed from previous migrations
ALTER TABLE "client_logos"
  ADD COLUMN IF NOT EXISTS "key" TEXT,
  ADD COLUMN IF NOT EXISTS "logoUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "darkLogoUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "linkUrl" TEXT DEFAULT '#',
  ADD COLUMN IF NOT EXISTS "isPublished" BOOLEAN NOT NULL DEFAULT true;

-- Deterministic collision-proof key generation
UPDATE "client_logos"
SET "key" = TRIM(BOTH '-' FROM 
  LOWER(
    REGEXP_REPLACE(
      COALESCE(NULLIF(TRIM("nameEn"), ''), 'logo') || '-' || id::text,
      '[^a-zA-Z0-9]+', '-', 'g'
    )
  )
)
WHERE "key" IS NULL OR "key" = '';

-- Safely copy real image URLs
UPDATE "client_logos"
SET "logoUrl" = "imageUrl"
WHERE ("logoUrl" IS NULL OR "logoUrl" = '') AND "imageUrl" IS NOT NULL;

UPDATE "client_logos"
SET "linkUrl" = COALESCE("websiteUrl", '#')
WHERE "linkUrl" IS NULL;

ALTER TABLE "client_logos" ALTER COLUMN "key" SET NOT NULL;
ALTER TABLE "client_logos" ALTER COLUMN "logoUrl" SET NOT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'client_logos' AND column_name = 'status' AND udt_name = 'ContentStatus'
  ) THEN
    ALTER TABLE "client_logos" ALTER COLUMN "status" DROP DEFAULT;
    ALTER TABLE "client_logos" ALTER COLUMN "status" TYPE "PublicationStatus" USING "status"::text::"PublicationStatus";
    ALTER TABLE "client_logos" ALTER COLUMN "status" SET DEFAULT 'PUBLISHED'::"PublicationStatus";
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "client_logos_key_key" ON "client_logos"("key");
CREATE INDEX IF NOT EXISTS "client_logos_position_idx" ON "client_logos"("position");
CREATE INDEX IF NOT EXISTS "client_logos_isPublished_idx" ON "client_logos"("isPublished");

-- CreateTable homepage_sections
CREATE TABLE IF NOT EXISTS "homepage_sections" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "sectionType" TEXT NOT NULL DEFAULT 'standard',
    "titleFa" TEXT NOT NULL DEFAULT '',
    "titleEn" TEXT NOT NULL DEFAULT '',
    "position" INTEGER NOT NULL DEFAULT 0,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "settingsJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "homepage_sections_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "homepage_sections_key_key" ON "homepage_sections"("key");
CREATE INDEX IF NOT EXISTS "homepage_sections_position_idx" ON "homepage_sections"("position");
CREATE INDEX IF NOT EXISTS "homepage_sections_isEnabled_idx" ON "homepage_sections"("isEnabled");

-- CreateTable site_settings
CREATE TABLE IF NOT EXISTS "site_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "siteNameFa" TEXT NOT NULL DEFAULT 'آن‌ساپ',
    "siteNameEn" TEXT NOT NULL DEFAULT 'OnSupp',
    "siteTitleFa" TEXT NOT NULL DEFAULT 'آژانس دیجیتال مارکتینگ و توسعه نرم‌افزار آن‌ساپ',
    "siteTitleEn" TEXT NOT NULL DEFAULT 'OnSupp | Digital Agency & Software Engineering',
    "siteDescFa" TEXT NOT NULL DEFAULT 'ارائه‌دهنده راهکارهای هوشمند طراحی وب‌سایت‌های سازمانی، سئو تکنیکال و برندینگ.',
    "siteDescEn" TEXT NOT NULL DEFAULT 'Enterprise web engineering, technical SEO, and brand growth agency.',
    "defaultKeywordsFa" TEXT NOT NULL DEFAULT 'دیجیتال مارکتینگ, طراحی سایت, سئو تکنیکال, آن‌ساپ',
    "defaultKeywordsEn" TEXT NOT NULL DEFAULT 'digital marketing, web design, technical seo, onsupp',
    "metaTitleTemplate" TEXT NOT NULL DEFAULT '%s | آن‌ساپ',
    "canonicalBaseUrl" TEXT NOT NULL DEFAULT 'https://onsupp.ir',
    "headerLogoUrl" TEXT NOT NULL DEFAULT '/images/logo/logo-Crimson.webp',
    "headerDarkLogoUrl" TEXT DEFAULT '/images/logo/logo-dark.webp',
    "footerLogoUrl" TEXT DEFAULT '/images/logo/Linear-Logo-Crimson.webp',
    "ogImageUrl" TEXT NOT NULL DEFAULT '/images/logo/logo-Crimson.webp',
    "faviconUrl" TEXT NOT NULL DEFAULT '/favicon.ico',
    "phone" TEXT NOT NULL DEFAULT '',
    "secondaryPhone" TEXT DEFAULT '',
    "phoneLabelFa" TEXT NOT NULL DEFAULT 'تماس مستقیم',
    "phoneLabelEn" TEXT NOT NULL DEFAULT 'Direct Call',
    "email" TEXT NOT NULL DEFAULT 'info@onsupp.ir',
    "emailLabelFa" TEXT NOT NULL DEFAULT 'ایمیل مشاوره',
    "emailLabelEn" TEXT NOT NULL DEFAULT 'Consultation Email',
    "responseTimeFa" TEXT NOT NULL DEFAULT 'پاسخگویی سریع کمتر از ۲ ساعت کاری',
    "responseTimeEn" TEXT NOT NULL DEFAULT 'Prompt consultation response during business hours',
    "telegramHandle" TEXT NOT NULL DEFAULT 'onsupp_web',
    "telegramUrl" TEXT NOT NULL DEFAULT 'https://t.me/onsupp_web',
    "instagramUrl" TEXT NOT NULL DEFAULT 'https://instagram.com/onsupp_web',
    "linkedinUrl" TEXT NOT NULL DEFAULT 'https://linkedin.com/company/onsupp',
    "contactChannels" JSONB NOT NULL DEFAULT '[]',
    "addressFa" TEXT NOT NULL DEFAULT 'البرز، کرج، منطقه عظیمیه، میدان کوهنورد، گلستان ۲۱',
    "addressEn" TEXT NOT NULL DEFAULT 'Golestan 21, Kouhnavard Sq, Azimiyeh, Karaj, Iran',
    "workingHoursFa" TEXT NOT NULL DEFAULT 'شنبه تا چهارشنبه ۹:۰۰ تا ۱۸:۰۰',
    "workingHoursEn" TEXT NOT NULL DEFAULT 'Sat - Wed: 09:00 - 18:00',
    "googleMapsUrl" TEXT NOT NULL DEFAULT 'https://maps.google.com/?q=35.8340,51.0110',
    "footerCopyrightFa" TEXT NOT NULL DEFAULT '© ۲۰۲۶ کلیه حقوق مادی و معنوی این وب‌سایت متعلق به آژانس دیجیتال آن‌ساپ می‌باشد.',
    "footerCopyrightEn" TEXT NOT NULL DEFAULT '© 2026 OnSupp Digital Agency. All rights reserved.',
    "footerDescriptionFa" TEXT NOT NULL DEFAULT 'ما در آن‌ساپ با ترکیب خلاقیت استودیویی و مهندسی داده‌محور، برندها را در مسیر رشد پایدار دیجیتال همراهی می‌کنیم.',
    "footerDescriptionEn" TEXT NOT NULL DEFAULT 'At OnSupp, we unite cinema-grade studio storytelling with data-driven software engineering to accelerate sustainable brand growth.',
    "footerLinks" JSONB NOT NULL DEFAULT '[]',
    "headerNavJson" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- Adapt site_settings if it existed from previous migrations
ALTER TABLE "site_settings"
  ADD COLUMN IF NOT EXISTS "siteTitleFa" TEXT NOT NULL DEFAULT 'آژانس دیجیتال مارکتینگ و توسعه نرم‌افزار آن‌ساپ',
  ADD COLUMN IF NOT EXISTS "siteTitleEn" TEXT NOT NULL DEFAULT 'OnSupp | Digital Agency & Software Engineering',
  ADD COLUMN IF NOT EXISTS "siteDescFa" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "siteDescEn" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "metaTitleTemplate" TEXT NOT NULL DEFAULT '%s | آن‌ساپ',
  ADD COLUMN IF NOT EXISTS "canonicalBaseUrl" TEXT NOT NULL DEFAULT 'https://onsupp.ir',
  ADD COLUMN IF NOT EXISTS "headerDarkLogoUrl" TEXT DEFAULT '/images/logo/logo-dark.webp',
  ADD COLUMN IF NOT EXISTS "phone" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "secondaryPhone" TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS "phoneLabelFa" TEXT NOT NULL DEFAULT 'تماس مستقیم',
  ADD COLUMN IF NOT EXISTS "phoneLabelEn" TEXT NOT NULL DEFAULT 'Direct Call',
  ADD COLUMN IF NOT EXISTS "email" TEXT NOT NULL DEFAULT 'info@onsupp.ir',
  ADD COLUMN IF NOT EXISTS "emailLabelFa" TEXT NOT NULL DEFAULT 'ایمیل مشاوره',
  ADD COLUMN IF NOT EXISTS "emailLabelEn" TEXT NOT NULL DEFAULT 'Consultation Email',
  ADD COLUMN IF NOT EXISTS "responseTimeFa" TEXT NOT NULL DEFAULT 'پاسخگویی سریع کمتر از ۲ ساعت کاری',
  ADD COLUMN IF NOT EXISTS "responseTimeEn" TEXT NOT NULL DEFAULT 'Prompt consultation response during business hours',
  ADD COLUMN IF NOT EXISTS "contactChannels" JSONB NOT NULL DEFAULT '[]';

-- Copy old site description and channels only if new ones are unpopulated
UPDATE "site_settings"
SET 
  "siteDescFa" = CASE WHEN ("siteDescFa" IS NULL OR "siteDescFa" = '') AND "siteDescriptionFa" IS NOT NULL THEN "siteDescriptionFa" ELSE "siteDescFa" END,
  "siteDescEn" = CASE WHEN ("siteDescEn" IS NULL OR "siteDescEn" = '') AND "siteDescriptionEn" IS NOT NULL THEN "siteDescriptionEn" ELSE "siteDescEn" END,
  "phone" = CASE WHEN ("phone" IS NULL OR "phone" = '') THEN '09331805628' ELSE "phone" END,
  "secondaryPhone" = CASE WHEN ("secondaryPhone" IS NULL OR "secondaryPhone" = '') THEN '09182924981' ELSE "secondaryPhone" END,
  "email" = CASE WHEN ("email" IS NULL OR "email" = '') THEN 'info@onsupp.ir' ELSE "email" END,
  "contactChannels" = CASE WHEN "contactChannels" = '[]'::jsonb AND "channels" IS NOT NULL THEN "channels" ELSE "contactChannels" END
WHERE id = 1;

-- AlterTable case_studies
ALTER TABLE "case_studies"
  ADD COLUMN IF NOT EXISTS "gallery" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS "challengeFa" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "challengeEn" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "solutionFa" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "solutionEn" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "resultsFa" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "resultsEn" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "deliverablesFa" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "deliverablesEn" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "servicesFa" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "servicesEn" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "metricsFa" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS "metricsEn" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS "colorGradient" TEXT NOT NULL DEFAULT 'from-[#1a1315] via-[#241a1e] to-[#100b0d]',
  ADD COLUMN IF NOT EXISTS "accentColor" TEXT NOT NULL DEFAULT '#D4A5A8',
  ADD COLUMN IF NOT EXISTS "glowColor" TEXT NOT NULL DEFAULT 'rgba(212, 165, 168, 0.2)',
  ADD COLUMN IF NOT EXISTS "previewType" TEXT NOT NULL DEFAULT 'web',
  ADD COLUMN IF NOT EXISTS "metaTitleFa" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "metaTitleEn" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "metaDescFa" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "metaDescEn" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "keywords" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "ogImage" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "isPublished" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "status" "PublicationStatus" NOT NULL DEFAULT 'PUBLISHED';

CREATE INDEX IF NOT EXISTS "case_studies_isPublished_idx" ON "case_studies"("isPublished");

-- AlterTable pricing_plans
ALTER TABLE "pricing_plans" 
  ADD COLUMN IF NOT EXISTS "isPublished" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "status" "PublicationStatus" NOT NULL DEFAULT 'PUBLISHED';

CREATE INDEX IF NOT EXISTS "pricing_plans_isPublished_idx" ON "pricing_plans"("isPublished");

-- AlterTable testimonials
ALTER TABLE "testimonials" 
  ADD COLUMN IF NOT EXISTS "status" "PublicationStatus" NOT NULL DEFAULT 'PUBLISHED';
