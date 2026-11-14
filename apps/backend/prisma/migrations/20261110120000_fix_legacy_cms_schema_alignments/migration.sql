-- Migration: 20261110120000_fix_legacy_cms_schema_alignments
-- Purpose: Consolidate legacy CMS schema alignments, ensure full idempotency, zero-downtime, and preserve all data.

DO $$
BEGIN
    --------------------------------------------------------------------------------
    -- 1. Ensure PublicationStatus enum exists
    --------------------------------------------------------------------------------
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PublicationStatus') THEN
        CREATE TYPE "PublicationStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
    END IF;

    --------------------------------------------------------------------------------
    -- 2. Services Table Alignments:
    --    - status: ContentStatus -> PublicationStatus
    --    - gallery: text[] -> jsonb
    --------------------------------------------------------------------------------
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'services' AND column_name = 'status' AND udt_name = 'ContentStatus'
    ) THEN
        ALTER TABLE "services" ALTER COLUMN "status" DROP DEFAULT;
        ALTER TABLE "services" ALTER COLUMN "status" TYPE "PublicationStatus" USING "status"::text::"PublicationStatus";
        ALTER TABLE "services" ALTER COLUMN "status" SET DEFAULT 'PUBLISHED'::"PublicationStatus";
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'services' AND column_name = 'gallery' AND udt_name = '_text'
    ) THEN
        ALTER TABLE "services" ALTER COLUMN "gallery" DROP DEFAULT;
        ALTER TABLE "services" ALTER COLUMN "gallery" TYPE jsonb USING COALESCE(to_jsonb("gallery"), '[]'::jsonb);
        ALTER TABLE "services" ALTER COLUMN "gallery" SET DEFAULT '[]'::jsonb;
    END IF;

    --------------------------------------------------------------------------------
    -- 3. Stats Table Alignments:
    --    - status: ContentStatus -> PublicationStatus
    --------------------------------------------------------------------------------
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'stats' AND column_name = 'status' AND udt_name = 'ContentStatus'
    ) THEN
        ALTER TABLE "stats" ALTER COLUMN "status" DROP DEFAULT;
        ALTER TABLE "stats" ALTER COLUMN "status" TYPE "PublicationStatus" USING "status"::text::"PublicationStatus";
        ALTER TABLE "stats" ALTER COLUMN "status" SET DEFAULT 'PUBLISHED'::"PublicationStatus";
    END IF;

    --------------------------------------------------------------------------------
    -- 4. Case Studies Table Alignments:
    --    - status: ContentStatus -> PublicationStatus
    --    - gallery: text[] -> jsonb
    --------------------------------------------------------------------------------
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'case_studies' AND column_name = 'status' AND udt_name = 'ContentStatus'
    ) THEN
        ALTER TABLE "case_studies" ALTER COLUMN "status" DROP DEFAULT;
        ALTER TABLE "case_studies" ALTER COLUMN "status" TYPE "PublicationStatus" USING "status"::text::"PublicationStatus";
        ALTER TABLE "case_studies" ALTER COLUMN "status" SET DEFAULT 'PUBLISHED'::"PublicationStatus";
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'case_studies' AND column_name = 'gallery' AND udt_name = '_text'
    ) THEN
        ALTER TABLE "case_studies" ALTER COLUMN "gallery" DROP DEFAULT;
        ALTER TABLE "case_studies" ALTER COLUMN "gallery" TYPE jsonb USING COALESCE(to_jsonb("gallery"), '[]'::jsonb);
        ALTER TABLE "case_studies" ALTER COLUMN "gallery" SET DEFAULT '[]'::jsonb;
    END IF;

    --------------------------------------------------------------------------------
    -- 5. Team Members Table Alignments:
    --    - status: ContentStatus -> PublicationStatus
    --    - additionalImages: JSONB default '[]'
    --------------------------------------------------------------------------------
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'team_members' AND column_name = 'status' AND udt_name = 'ContentStatus'
    ) THEN
        ALTER TABLE "team_members" ALTER COLUMN "status" DROP DEFAULT;
        ALTER TABLE "team_members" ALTER COLUMN "status" TYPE "PublicationStatus" USING "status"::text::"PublicationStatus";
        ALTER TABLE "team_members" ALTER COLUMN "status" SET DEFAULT 'PUBLISHED'::"PublicationStatus";
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'team_members' AND column_name = 'additionalImages'
    ) THEN
        ALTER TABLE "team_members" ADD COLUMN "additionalImages" JSONB NOT NULL DEFAULT '[]'::jsonb;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'team_members' AND column_name = 'avatarUrl'
    ) THEN
        ALTER TABLE "team_members" ADD COLUMN "avatarUrl" TEXT;
        -- If photoUrl exists from previous schemas, backfill avatarUrl
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'team_members' AND column_name = 'photoUrl'
        ) THEN
            UPDATE "team_members" SET "avatarUrl" = "photoUrl" WHERE "avatarUrl" IS NULL AND "photoUrl" IS NOT NULL;
        END IF;
    END IF;

    --------------------------------------------------------------------------------
    -- 6. Client Logos Table Alignments:
    --    - imageUrl: relax NOT NULL constraint
    --------------------------------------------------------------------------------
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'client_logos' AND column_name = 'imageUrl' AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE "client_logos" ALTER COLUMN "imageUrl" DROP NOT NULL;
    END IF;

    --------------------------------------------------------------------------------
    -- 7. Client Partners Table Defaults Alignment:
    --------------------------------------------------------------------------------
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_partners' AND column_name = 'industryFa') THEN
        ALTER TABLE "client_partners" ALTER COLUMN "industryFa" SET DEFAULT '';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_partners' AND column_name = 'industryEn') THEN
        ALTER TABLE "client_partners" ALTER COLUMN "industryEn" SET DEFAULT '';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_partners' AND column_name = 'introFa') THEN
        ALTER TABLE "client_partners" ALTER COLUMN "introFa" SET DEFAULT '';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_partners' AND column_name = 'introEn') THEN
        ALTER TABLE "client_partners" ALTER COLUMN "introEn" SET DEFAULT '';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_partners' AND column_name = 'titleEn') THEN
        ALTER TABLE "client_partners" ALTER COLUMN "titleEn" SET DEFAULT '';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_partners' AND column_name = 'nameEn') THEN
        ALTER TABLE "client_partners" ALTER COLUMN "nameEn" SET DEFAULT '';
    END IF;

    --------------------------------------------------------------------------------
    -- 8. Site Settings Table Alignments:
    --    Add all missing columns required by schema.prisma with sensible defaults
    --    Preserve existing phone, email, and contact channels without overwriting
    --------------------------------------------------------------------------------
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'addressFa') THEN
        ALTER TABLE "site_settings" ADD COLUMN "addressFa" TEXT NOT NULL DEFAULT 'البرز، کرج، منطقه عظیمیه، میدان کوهنورد، گلستان ۲۱';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'addressEn') THEN
        ALTER TABLE "site_settings" ADD COLUMN "addressEn" TEXT NOT NULL DEFAULT 'Golestan 21, Kouhnavard Sq, Azimiyeh, Karaj, Iran';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'footerCopyrightFa') THEN
        ALTER TABLE "site_settings" ADD COLUMN "footerCopyrightFa" TEXT NOT NULL DEFAULT '© ۲۰۲۶ کلیه حقوق مادی و معنوی این وب‌سایت متعلق به آژانس دیجیتال آن‌ساپ می‌باشد.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'footerCopyrightEn') THEN
        ALTER TABLE "site_settings" ADD COLUMN "footerCopyrightEn" TEXT NOT NULL DEFAULT '© 2026 OnSupp Digital Agency. All rights reserved.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'footerDescriptionFa') THEN
        ALTER TABLE "site_settings" ADD COLUMN "footerDescriptionFa" TEXT NOT NULL DEFAULT 'ما در آن‌ساپ با ترکیب خلاقیت استودیویی و مهندسی داده‌محور، برندها را در مسیر رشد پایدار دیجیتال همراهی می‌کنیم.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'footerDescriptionEn') THEN
        ALTER TABLE "site_settings" ADD COLUMN "footerDescriptionEn" TEXT NOT NULL DEFAULT 'At OnSupp, we unite cinema-grade studio storytelling with data-driven software engineering to accelerate sustainable brand growth.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'footerLinks') THEN
        ALTER TABLE "site_settings" ADD COLUMN "footerLinks" JSONB NOT NULL DEFAULT '[]'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'googleMapsUrl') THEN
        ALTER TABLE "site_settings" ADD COLUMN "googleMapsUrl" TEXT NOT NULL DEFAULT 'https://maps.google.com/?q=35.8340,51.0110';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'headerNavJson') THEN
        ALTER TABLE "site_settings" ADD COLUMN "headerNavJson" JSONB NOT NULL DEFAULT '[]'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'contactChannels') THEN
        ALTER TABLE "site_settings" ADD COLUMN "contactChannels" JSONB NOT NULL DEFAULT '[]'::jsonb;
        -- If channels exists from legacy schema, copy non-null content to contactChannels
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'channels') THEN
            UPDATE "site_settings" SET "contactChannels" = "channels" WHERE "channels" IS NOT NULL AND "contactChannels" = '[]'::jsonb;
        END IF;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'phone') THEN
        ALTER TABLE "site_settings" ADD COLUMN "phone" TEXT NOT NULL DEFAULT '';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'email') THEN
        ALTER TABLE "site_settings" ADD COLUMN "email" TEXT NOT NULL DEFAULT 'info@onsupp.ir';
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'consultEmail') THEN
            UPDATE "site_settings" SET "email" = "consultEmail" WHERE "consultEmail" IS NOT NULL AND ("email" IS NULL OR "email" = '' OR "email" = 'info@onsupp.ir');
        END IF;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'phoneLabelFa') THEN
        ALTER TABLE "site_settings" ADD COLUMN "phoneLabelFa" TEXT NOT NULL DEFAULT 'تماس مستقیم';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'phoneLabelEn') THEN
        ALTER TABLE "site_settings" ADD COLUMN "phoneLabelEn" TEXT NOT NULL DEFAULT 'Direct Call';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'emailLabelFa') THEN
        ALTER TABLE "site_settings" ADD COLUMN "emailLabelFa" TEXT NOT NULL DEFAULT 'ایمیل مشاوره';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'emailLabelEn') THEN
        ALTER TABLE "site_settings" ADD COLUMN "emailLabelEn" TEXT NOT NULL DEFAULT 'Consultation Email';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'responseTimeFa') THEN
        ALTER TABLE "site_settings" ADD COLUMN "responseTimeFa" TEXT NOT NULL DEFAULT 'پاسخگویی سریع کمتر از ۲ ساعت کاری';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'responseTimeEn') THEN
        ALTER TABLE "site_settings" ADD COLUMN "responseTimeEn" TEXT NOT NULL DEFAULT 'Prompt consultation response during business hours';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'secondaryPhone') THEN
        ALTER TABLE "site_settings" ADD COLUMN "secondaryPhone" TEXT DEFAULT '';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'siteTitleFa') THEN
        ALTER TABLE "site_settings" ADD COLUMN "siteTitleFa" TEXT NOT NULL DEFAULT 'آژانس دیجیتال مارکتینگ و توسعه نرم‌افزار آن‌ساپ';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'siteTitleEn') THEN
        ALTER TABLE "site_settings" ADD COLUMN "siteTitleEn" TEXT NOT NULL DEFAULT 'OnSupp | Digital Agency & Software Engineering';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'siteDescFa') THEN
        ALTER TABLE "site_settings" ADD COLUMN "siteDescFa" TEXT NOT NULL DEFAULT 'ارائه‌دهنده راهکارهای هوشمند طراحی وب‌سایت‌های سازمانی، سئو تکنیکال و برندینگ.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'siteDescEn') THEN
        ALTER TABLE "site_settings" ADD COLUMN "siteDescEn" TEXT NOT NULL DEFAULT 'Enterprise web engineering, technical SEO, and brand growth agency.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'defaultKeywordsFa') THEN
        ALTER TABLE "site_settings" ADD COLUMN "defaultKeywordsFa" TEXT NOT NULL DEFAULT 'دیجیتال مارکتینگ, طراحی سایت, سئو تکنیکال, آن‌ساپ';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'defaultKeywordsEn') THEN
        ALTER TABLE "site_settings" ADD COLUMN "defaultKeywordsEn" TEXT NOT NULL DEFAULT 'digital marketing, web design, technical seo, onsupp';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'metaTitleTemplate') THEN
        ALTER TABLE "site_settings" ADD COLUMN "metaTitleTemplate" TEXT NOT NULL DEFAULT '%s | آن‌ساپ';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'canonicalBaseUrl') THEN
        ALTER TABLE "site_settings" ADD COLUMN "canonicalBaseUrl" TEXT NOT NULL DEFAULT 'https://onsupp.ir';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'headerDarkLogoUrl') THEN
        ALTER TABLE "site_settings" ADD COLUMN "headerDarkLogoUrl" TEXT DEFAULT '/images/logo/logo-dark.webp';
    END IF;

    -- Ensure NOT NULL and default values for branding logos if they were nullable in legacy
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'headerLogoUrl') THEN
        UPDATE "site_settings" SET "headerLogoUrl" = '/images/logo/logo-Crimson.webp' WHERE "headerLogoUrl" IS NULL;
        ALTER TABLE "site_settings" ALTER COLUMN "headerLogoUrl" SET NOT NULL;
        ALTER TABLE "site_settings" ALTER COLUMN "headerLogoUrl" SET DEFAULT '/images/logo/logo-Crimson.webp';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'faviconUrl') THEN
        UPDATE "site_settings" SET "faviconUrl" = '/favicon.ico' WHERE "faviconUrl" IS NULL;
        ALTER TABLE "site_settings" ALTER COLUMN "faviconUrl" SET NOT NULL;
        ALTER TABLE "site_settings" ALTER COLUMN "faviconUrl" SET DEFAULT '/favicon.ico';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'ogImageUrl') THEN
        UPDATE "site_settings" SET "ogImageUrl" = '/images/logo/logo-Crimson.webp' WHERE "ogImageUrl" IS NULL;
        ALTER TABLE "site_settings" ALTER COLUMN "ogImageUrl" SET NOT NULL;
        ALTER TABLE "site_settings" ALTER COLUMN "ogImageUrl" SET DEFAULT '/images/logo/logo-Crimson.webp';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'linkedinUrl') THEN
        UPDATE "site_settings" SET "linkedinUrl" = 'https://linkedin.com/company/onsupp' WHERE "linkedinUrl" IS NULL;
        ALTER TABLE "site_settings" ALTER COLUMN "linkedinUrl" SET NOT NULL;
        ALTER TABLE "site_settings" ALTER COLUMN "linkedinUrl" SET DEFAULT 'https://linkedin.com/company/onsupp';
    END IF;

END $$;
