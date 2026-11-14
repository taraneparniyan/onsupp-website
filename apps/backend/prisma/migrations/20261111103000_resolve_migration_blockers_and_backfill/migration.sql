-- Migration: 20261111103000_resolve_migration_blockers_and_backfill
-- Purpose:
--   1. Resolve schema drift in contact_submissions (add nullable "subject" column and indexes).
--   2. Backfill site_settings legacy custom fields (footerTextFa/En, copyrightTextFa/En, defaultMetaTitleFa/En, streetFa/En + cityFa/En).
--   3. Migrate legacy data from about_page_settings -> ceo_profile & company_values, and home_sections -> homepage_sections.
--   4. Ensure services.gallery & case_studies.gallery NOT NULL alignment with schema.prisma.
--   5. Fully idempotent and safe for repeated execution without overwriting customized data or dropping legacy data.

DO $$
BEGIN
    --------------------------------------------------------------------------------
    -- 1. Contact Submissions Schema Drift Alignment
    --------------------------------------------------------------------------------
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'contact_submissions' AND column_name = 'subject'
    ) THEN
        ALTER TABLE "contact_submissions" ADD COLUMN "subject" TEXT;
    END IF;

    CREATE INDEX IF NOT EXISTS "contact_submissions_read_idx" ON "contact_submissions"("read");
    CREATE INDEX IF NOT EXISTS "contact_submissions_createdAt_idx" ON "contact_submissions"("createdAt");

    --------------------------------------------------------------------------------
    -- 2. Gallery NOT NULL alignment (schema.prisma defines Json @default("[]"))
    --------------------------------------------------------------------------------
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'services' AND column_name = 'gallery' AND udt_name = 'jsonb' AND is_nullable = 'YES'
    ) THEN
        UPDATE "services" SET "gallery" = '[]'::jsonb WHERE "gallery" IS NULL;
        ALTER TABLE "services" ALTER COLUMN "gallery" SET NOT NULL;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'case_studies' AND column_name = 'gallery' AND udt_name = 'jsonb' AND is_nullable = 'YES'
    ) THEN
        UPDATE "case_studies" SET "gallery" = '[]'::jsonb WHERE "gallery" IS NULL;
        ALTER TABLE "case_studies" ALTER COLUMN "gallery" SET NOT NULL;
    END IF;

    --------------------------------------------------------------------------------
    -- 3. Preserve and Backfill site_settings Legacy Fields
    --------------------------------------------------------------------------------
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'site_settings' AND column_name = 'footerTextFa')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'site_settings' AND column_name = 'footerDescriptionFa') THEN
        UPDATE "site_settings"
        SET "footerDescriptionFa" = "footerTextFa"
        WHERE NULLIF(TRIM("footerTextFa"), '') IS NOT NULL
          AND (
              "footerDescriptionFa" IS NULL
              OR TRIM("footerDescriptionFa") = ''
              OR "footerDescriptionFa" = 'ما در آن‌ساپ با ترکیب خلاقیت استودیویی و مهندسی داده‌محور، برندها را در مسیر رشد پایدار دیجیتال همراهی می‌کنیم.'
          );
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'site_settings' AND column_name = 'footerTextEn')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'site_settings' AND column_name = 'footerDescriptionEn') THEN
        UPDATE "site_settings"
        SET "footerDescriptionEn" = "footerTextEn"
        WHERE NULLIF(TRIM("footerTextEn"), '') IS NOT NULL
          AND (
              "footerDescriptionEn" IS NULL
              OR TRIM("footerDescriptionEn") = ''
              OR "footerDescriptionEn" = 'At OnSupp, we unite cinema-grade studio storytelling with data-driven software engineering to accelerate sustainable brand growth.'
          );
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'site_settings' AND column_name = 'copyrightTextFa')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'site_settings' AND column_name = 'footerCopyrightFa') THEN
        UPDATE "site_settings"
        SET "footerCopyrightFa" = "copyrightTextFa"
        WHERE NULLIF(TRIM("copyrightTextFa"), '') IS NOT NULL
          AND (
              "footerCopyrightFa" IS NULL
              OR TRIM("footerCopyrightFa") = ''
              OR "footerCopyrightFa" = '© ۲۰۲۶ کلیه حقوق مادی و معنوی این وب‌سایت متعلق به آژانس دیجیتال آن‌ساپ می‌باشد.'
          );
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'site_settings' AND column_name = 'copyrightTextEn')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'site_settings' AND column_name = 'footerCopyrightEn') THEN
        UPDATE "site_settings"
        SET "footerCopyrightEn" = "copyrightTextEn"
        WHERE NULLIF(TRIM("copyrightTextEn"), '') IS NOT NULL
          AND (
              "footerCopyrightEn" IS NULL
              OR TRIM("footerCopyrightEn") = ''
              OR "footerCopyrightEn" = '© 2026 OnSupp Digital Agency. All rights reserved.'
          );
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'site_settings' AND column_name = 'defaultMetaTitleFa')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'site_settings' AND column_name = 'siteTitleFa') THEN
        UPDATE "site_settings"
        SET "siteTitleFa" = "defaultMetaTitleFa"
        WHERE NULLIF(TRIM("defaultMetaTitleFa"), '') IS NOT NULL
          AND (
              "siteTitleFa" IS NULL
              OR TRIM("siteTitleFa") = ''
              OR "siteTitleFa" = 'آژانس دیجیتال مارکتینگ و توسعه نرم‌افزار آن‌ساپ'
          );
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'site_settings' AND column_name = 'defaultMetaTitleEn')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'site_settings' AND column_name = 'siteTitleEn') THEN
        UPDATE "site_settings"
        SET "siteTitleEn" = "defaultMetaTitleEn"
        WHERE NULLIF(TRIM("defaultMetaTitleEn"), '') IS NOT NULL
          AND (
              "siteTitleEn" IS NULL
              OR TRIM("siteTitleEn") = ''
              OR "siteTitleEn" = 'OnSupp | Digital Agency & Software Engineering'
          );
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'site_settings' AND column_name = 'streetFa')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'site_settings' AND column_name = 'addressFa') THEN
        UPDATE "site_settings"
        SET "addressFa" = CASE
            WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'site_settings' AND column_name = 'cityFa')
                 AND NULLIF(TRIM("cityFa"), '') IS NOT NULL
                THEN CONCAT_WS('، ', NULLIF(TRIM("cityFa"), ''), NULLIF(TRIM("streetFa"), ''))
            ELSE TRIM("streetFa")
        END
        WHERE NULLIF(TRIM("streetFa"), '') IS NOT NULL
          AND (
              "addressFa" IS NULL
              OR TRIM("addressFa") = ''
              OR (
                  "addressFa" = 'البرز، کرج، منطقه عظیمیه، میدان کوهنورد، گلستان ۲۱'
                  AND POSITION(TRIM("streetFa") IN "addressFa") = 0
              )
          );
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'site_settings' AND column_name = 'streetEn')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'site_settings' AND column_name = 'addressEn') THEN
        UPDATE "site_settings"
        SET "addressEn" = CASE
            WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'site_settings' AND column_name = 'cityEn')
                 AND NULLIF(TRIM("cityEn"), '') IS NOT NULL
                THEN CONCAT_WS(', ', NULLIF(TRIM("streetEn"), ''), NULLIF(TRIM("cityEn"), ''))
            ELSE TRIM("streetEn")
        END
        WHERE NULLIF(TRIM("streetEn"), '') IS NOT NULL
          AND (
              "addressEn" IS NULL
              OR TRIM("addressEn") = ''
              OR (
                  "addressEn" = 'Golestan 21, Kouhnavard Sq, Azimiyeh, Karaj, Iran'
                  AND POSITION(TRIM("streetEn") IN "addressEn") = 0
              )
          );
    END IF;

    --------------------------------------------------------------------------------
    -- 4. Migrate Legacy Data from about_page_settings -> ceo_profile & company_values
    --------------------------------------------------------------------------------
    IF to_regclass('public.about_page_settings') IS NOT NULL AND to_regclass('public.ceo_profile') IS NOT NULL THEN
        INSERT INTO "ceo_profile" (
            "id",
            "nameFa",
            "nameEn",
            "roleFa",
            "roleEn",
            "quoteFa",
            "quoteEn",
            "bioFa",
            "bioEn",
            "avatarUrl",
            "focalPoint",
            "socialLinks",
            "isPublished",
            "status",
            "createdAt",
            "updatedAt"
        )
        SELECT
            1,
            COALESCE(NULLIF(TRIM("ceoNameFa"), ''), 'نام مدیرعامل'),
            COALESCE(NULLIF(TRIM("ceoNameEn"), ''), 'CEO Name'),
            COALESCE(NULLIF(TRIM("ceoRoleFa"), ''), 'بنیان‌گذار و مدیرعامل'),
            COALESCE(NULLIF(TRIM("ceoRoleEn"), ''), 'Founder & CEO'),
            COALESCE(NULLIF(TRIM("ceoQuoteFa"), ''), ''),
            COALESCE(NULLIF(TRIM("ceoQuoteEn"), ''), ''),
            COALESCE("ceoBioFa", ARRAY[]::TEXT[]),
            COALESCE("ceoBioEn", ARRAY[]::TEXT[]),
            "ceoPhotoUrl",
            '50% 50%',
            COALESCE("ceoSocialLinks", '[]'::jsonb),
            true,
            'PUBLISHED'::"PublicationStatus",
            "createdAt",
            "updatedAt"
        FROM "about_page_settings"
        WHERE "id" = 1
        ON CONFLICT ("id") DO UPDATE SET
            "avatarUrl" = CASE WHEN "ceo_profile"."avatarUrl" IS NULL OR TRIM("ceo_profile"."avatarUrl") = '' THEN EXCLUDED."avatarUrl" ELSE "ceo_profile"."avatarUrl" END,
            "socialLinks" = CASE WHEN "ceo_profile"."socialLinks" = '[]'::jsonb AND EXCLUDED."socialLinks" <> '[]'::jsonb THEN EXCLUDED."socialLinks" ELSE "ceo_profile"."socialLinks" END,
            "bioFa" = CASE WHEN COALESCE(array_length("ceo_profile"."bioFa", 1), 0) = 0 AND COALESCE(array_length(EXCLUDED."bioFa", 1), 0) > 0 THEN EXCLUDED."bioFa" ELSE "ceo_profile"."bioFa" END,
            "bioEn" = CASE WHEN COALESCE(array_length("ceo_profile"."bioEn", 1), 0) = 0 AND COALESCE(array_length(EXCLUDED."bioEn", 1), 0) > 0 THEN EXCLUDED."bioEn" ELSE "ceo_profile"."bioEn" END,
            "nameFa" = CASE WHEN TRIM("ceo_profile"."nameFa") = '' OR "ceo_profile"."nameFa" = 'نام مدیرعامل' THEN EXCLUDED."nameFa" ELSE "ceo_profile"."nameFa" END,
            "nameEn" = CASE WHEN TRIM("ceo_profile"."nameEn") = '' OR "ceo_profile"."nameEn" = 'CEO Name' THEN EXCLUDED."nameEn" ELSE "ceo_profile"."nameEn" END;

        -- Also backfill extended narrative fields on about_content only if blank
        IF to_regclass('public.about_content') IS NOT NULL THEN
            UPDATE "about_content" ac
            SET
                "heroCaptionFa" = CASE WHEN TRIM(ac."heroCaptionFa") = '' AND NULLIF(TRIM(aps."heroCaptionFa"), '') IS NOT NULL THEN aps."heroCaptionFa" ELSE ac."heroCaptionFa" END,
                "heroCaptionEn" = CASE WHEN TRIM(ac."heroCaptionEn") = '' AND NULLIF(TRIM(aps."heroCaptionEn"), '') IS NOT NULL THEN aps."heroCaptionEn" ELSE ac."heroCaptionEn" END,
                "leadFa" = CASE WHEN TRIM(ac."leadFa") = '' AND NULLIF(TRIM(aps."introLeadFa"), '') IS NOT NULL THEN aps."introLeadFa" ELSE ac."leadFa" END,
                "leadEn" = CASE WHEN TRIM(ac."leadEn") = '' AND NULLIF(TRIM(aps."introLeadEn"), '') IS NOT NULL THEN aps."introLeadEn" ELSE ac."leadEn" END,
                "approachFa" = CASE WHEN TRIM(ac."approachFa") = '' AND NULLIF(TRIM(aps."introApproachFa"), '') IS NOT NULL THEN aps."introApproachFa" ELSE ac."approachFa" END,
                "approachEn" = CASE WHEN TRIM(ac."approachEn") = '' AND NULLIF(TRIM(aps."introApproachEn"), '') IS NOT NULL THEN aps."introApproachEn" ELSE ac."approachEn" END
            FROM "about_page_settings" aps
            WHERE ac."id" = 1 AND aps."id" = 1;
        END IF;
    END IF;

    IF to_regclass('public.about_page_settings') IS NOT NULL AND to_regclass('public.company_values') IS NOT NULL THEN
        INSERT INTO "company_values" (
            "key",
            "titleFa",
            "titleEn",
            "descriptionFa",
            "descriptionEn",
            "badgeFa",
            "badgeEn",
            "icon",
            "position",
            "isPublished",
            "status",
            "createdAt",
            "updatedAt"
        )
        SELECT
            COALESCE(NULLIF(TRIM(elem.val->>'id'), ''), 'value-' || elem.ord::text),
            COALESCE(elem.val->>'titleFa', ''),
            COALESCE(elem.val->>'titleEn', ''),
            COALESCE(elem.val->>'descriptionFa', ''),
            COALESCE(elem.val->>'descriptionEn', ''),
            '',
            '',
            'check',
            (elem.ord - 1)::int,
            true,
            'PUBLISHED'::"PublicationStatus",
            aps."createdAt",
            aps."updatedAt"
        FROM "about_page_settings" aps
        CROSS JOIN LATERAL jsonb_array_elements(aps."coreValues") WITH ORDINALITY AS elem(val, ord)
        WHERE aps."id" = 1
          AND jsonb_typeof(aps."coreValues") = 'array'
        ON CONFLICT ("key") DO NOTHING;
    END IF;

    --------------------------------------------------------------------------------
    -- 5. Migrate Legacy Data from home_sections -> homepage_sections
    --------------------------------------------------------------------------------
    IF to_regclass('public.home_sections') IS NOT NULL AND to_regclass('public.homepage_sections') IS NOT NULL THEN
        INSERT INTO "homepage_sections" (
            "key",
            "sectionType",
            "titleFa",
            "titleEn",
            "position",
            "isEnabled",
            "settingsJson",
            "createdAt",
            "updatedAt"
        )
        SELECT
            hs."key",
            COALESCE(NULLIF(TRIM(hs."type"), ''), 'standard'),
            COALESCE(hs."titleFa", ''),
            COALESCE(hs."titleEn", ''),
            hs."position",
            hs."isEnabled",
            COALESCE(hs."settings", '{}'::jsonb),
            hs."createdAt",
            hs."updatedAt"
        FROM "home_sections" hs
        ORDER BY hs."position" ASC, hs."id" ASC
        ON CONFLICT ("key") DO NOTHING;
    END IF;

END $$;
