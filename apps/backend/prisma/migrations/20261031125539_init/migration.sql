-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hero_slide" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "titleEn" TEXT NOT NULL DEFAULT '',
    "subtitle" TEXT NOT NULL DEFAULT '',
    "subtitleEn" TEXT NOT NULL DEFAULT '',
    "ctaText" TEXT NOT NULL DEFAULT '',
    "ctaTextEn" TEXT NOT NULL DEFAULT '',
    "ctaLink" TEXT NOT NULL DEFAULT '',
    "ctaText2" TEXT NOT NULL DEFAULT '',
    "ctaText2En" TEXT NOT NULL DEFAULT '',
    "ctaLink2" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT,
    "imageAlt" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hero_slide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "titleEn" TEXT NOT NULL DEFAULT '',
    "subtitle" TEXT NOT NULL DEFAULT '',
    "subtitleEn" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT,
    "imageAlt" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stats" (
    "id" SERIAL NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'number',
    "valueFa" TEXT NOT NULL DEFAULT '',
    "valueEn" TEXT NOT NULL DEFAULT '',
    "labelFa" TEXT NOT NULL DEFAULT '',
    "labelEn" TEXT NOT NULL DEFAULT '',
    "descFa" TEXT NOT NULL DEFAULT '',
    "descEn" TEXT NOT NULL DEFAULT '',
    "position" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "about_content" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "eyebrowFa" TEXT NOT NULL DEFAULT '',
    "eyebrowEn" TEXT NOT NULL DEFAULT '',
    "titleFa" TEXT NOT NULL DEFAULT '',
    "titleEn" TEXT NOT NULL DEFAULT '',
    "ctaFa" TEXT NOT NULL DEFAULT '',
    "ctaEn" TEXT NOT NULL DEFAULT '',
    "ctaLink" TEXT NOT NULL DEFAULT '#contact',
    "imageUrl" TEXT,
    "imageAlt" TEXT,
    "subTitleFa" TEXT NOT NULL DEFAULT '',
    "subTitleEn" TEXT NOT NULL DEFAULT '',
    "paragraphFa" TEXT NOT NULL DEFAULT '',
    "paragraphEn" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "about_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features" (
    "id" SERIAL NOT NULL,
    "titleFa" TEXT NOT NULL DEFAULT '',
    "titleEn" TEXT NOT NULL DEFAULT '',
    "icon" TEXT NOT NULL DEFAULT 'team',
    "position" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_studies" (
    "id" SERIAL NOT NULL,
    "titleFa" TEXT NOT NULL DEFAULT '',
    "titleEn" TEXT NOT NULL DEFAULT '',
    "categoryFa" TEXT NOT NULL DEFAULT '',
    "categoryEn" TEXT NOT NULL DEFAULT '',
    "projectType" TEXT NOT NULL DEFAULT 'website',
    "descriptionFa" TEXT NOT NULL DEFAULT '',
    "descriptionEn" TEXT NOT NULL DEFAULT '',
    "liveUrl" TEXT NOT NULL DEFAULT '#',
    "position" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_studies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_categories" (
    "id" SERIAL NOT NULL,
    "titleFa" TEXT NOT NULL DEFAULT '',
    "titleEn" TEXT NOT NULL DEFAULT '',
    "slug" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_plans" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "nameFa" TEXT NOT NULL DEFAULT '',
    "nameEn" TEXT NOT NULL DEFAULT '',
    "badgeFa" TEXT NOT NULL DEFAULT '',
    "badgeEn" TEXT NOT NULL DEFAULT '',
    "priceType" TEXT NOT NULL DEFAULT 'numeric',
    "priceFa" TEXT NOT NULL DEFAULT '',
    "priceEn" TEXT NOT NULL DEFAULT '',
    "discountPriceFa" TEXT NOT NULL DEFAULT '',
    "discountPriceEn" TEXT NOT NULL DEFAULT '',
    "periodFa" TEXT NOT NULL DEFAULT '',
    "periodEn" TEXT NOT NULL DEFAULT '',
    "descriptionFa" TEXT NOT NULL DEFAULT '',
    "descriptionEn" TEXT NOT NULL DEFAULT '',
    "featuresFa" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "featuresEn" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "ctaFa" TEXT NOT NULL DEFAULT '',
    "ctaEn" TEXT NOT NULL DEFAULT '',
    "ctaLink" TEXT NOT NULL DEFAULT '#contact',
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_content" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "eyebrowFa" TEXT NOT NULL DEFAULT 'شروع همکاری و مشاوره اختصاصی',
    "eyebrowEn" TEXT NOT NULL DEFAULT 'LET''S WORK TOGETHER',
    "titleFa" TEXT NOT NULL DEFAULT 'آماده‌اید برای برند خود انقلاب دیجیتال بسازید؟',
    "titleEn" TEXT NOT NULL DEFAULT 'Ready to transform your brand''s digital reach?',
    "descriptionFa" TEXT NOT NULL DEFAULT 'فرم زیر را پر کنید تا متخصصان ارشد آن‌ساپ آنالیز رایگان، نمونه‌کارها و برنامه رشد اختصاصی شما را ارسال کنند.',
    "descriptionEn" TEXT NOT NULL DEFAULT 'Fill out the form to receive a complimentary audit and personalized digital strategy from our senior growth team.',
    "phone" TEXT NOT NULL DEFAULT '۰۲۱ - ۹۱۰۰ ۰۰۰۰',
    "phoneLabelFa" TEXT NOT NULL DEFAULT 'تماس مستقیم فوری',
    "phoneLabelEn" TEXT NOT NULL DEFAULT 'Direct Call',
    "email" TEXT NOT NULL DEFAULT 'info@onsupp.ir',
    "emailLabelFa" TEXT NOT NULL DEFAULT 'ایمیل مشاوره',
    "emailLabelEn" TEXT NOT NULL DEFAULT 'Consultation Email',
    "responseTimeFa" TEXT NOT NULL DEFAULT 'پاسخگویی سریع کمتر از ۲ ساعت کاری',
    "responseTimeEn" TEXT NOT NULL DEFAULT 'Guaranteed response time within 2 hours',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_submissions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "service" TEXT NOT NULL DEFAULT 'seo',
    "message" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" SERIAL NOT NULL,
    "titleFa" TEXT NOT NULL DEFAULT '',
    "titleEn" TEXT NOT NULL DEFAULT '',
    "slug" TEXT NOT NULL,
    "categoryFa" TEXT NOT NULL DEFAULT 'آموزش سئو',
    "categoryEn" TEXT NOT NULL DEFAULT 'SEO Tutorial',
    "excerptFa" TEXT NOT NULL DEFAULT '',
    "excerptEn" TEXT NOT NULL DEFAULT '',
    "contentFa" TEXT NOT NULL DEFAULT '',
    "contentEn" TEXT NOT NULL DEFAULT '',
    "readTimeFa" TEXT NOT NULL DEFAULT '۵ دقیقه مطالعه',
    "readTimeEn" TEXT NOT NULL DEFAULT '5 min read',
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "author" TEXT NOT NULL DEFAULT 'آن‌ساپ',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "metaTitleFa" TEXT NOT NULL DEFAULT '',
    "metaTitleEn" TEXT NOT NULL DEFAULT '',
    "metaDescFa" TEXT NOT NULL DEFAULT '',
    "metaDescEn" TEXT NOT NULL DEFAULT '',
    "keywordsFa" TEXT NOT NULL DEFAULT '',
    "keywordsEn" TEXT NOT NULL DEFAULT '',
    "canonicalUrl" TEXT NOT NULL DEFAULT '',
    "ogImage" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" SERIAL NOT NULL,
    "articleId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "reply" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_categories_slug_key" ON "pricing_categories"("slug");

-- CreateIndex
CREATE INDEX "pricing_plans_categoryId_idx" ON "pricing_plans"("categoryId");

-- CreateIndex
CREATE INDEX "contact_submissions_read_idx" ON "contact_submissions"("read");

-- CreateIndex
CREATE INDEX "contact_submissions_createdAt_idx" ON "contact_submissions"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "articles_slug_key" ON "articles"("slug");

-- CreateIndex
CREATE INDEX "articles_published_idx" ON "articles"("published");

-- CreateIndex
CREATE INDEX "articles_createdAt_idx" ON "articles"("createdAt");

-- CreateIndex
CREATE INDEX "comments_articleId_idx" ON "comments"("articleId");

-- CreateIndex
CREATE INDEX "comments_approved_idx" ON "comments"("approved");

-- AddForeignKey
ALTER TABLE "pricing_plans" ADD CONSTRAINT "pricing_plans_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "pricing_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

