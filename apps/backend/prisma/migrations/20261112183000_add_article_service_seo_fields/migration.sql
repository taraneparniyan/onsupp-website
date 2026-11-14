-- Additive-only SEO migration for Article and Service on onsupp_sandbox_check
-- Preserves all existing columns, tables, and content without any destructive drops.

-- AlterTable: articles
ALTER TABLE "articles"
  ADD COLUMN IF NOT EXISTS "focusKeyword" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "secondaryKeywords" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "isPillar" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "seoConfig" JSONB NOT NULL DEFAULT '{}';

-- AlterTable: services
ALTER TABLE "services"
  ADD COLUMN IF NOT EXISTS "canonicalUrl" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "ogImage" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "focusKeyword" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "secondaryKeywords" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "isPillar" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "seoConfig" JSONB NOT NULL DEFAULT '{}';

-- CreateIndex
CREATE INDEX IF NOT EXISTS "articles_focusKeyword_idx" ON "articles"("focusKeyword");
CREATE INDEX IF NOT EXISTS "articles_isPillar_idx" ON "articles"("isPillar");
CREATE INDEX IF NOT EXISTS "services_focusKeyword_idx" ON "services"("focusKeyword");
CREATE INDEX IF NOT EXISTS "services_isPillar_idx" ON "services"("isPillar");
