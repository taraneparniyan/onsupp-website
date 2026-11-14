-- CreateEnum
CREATE TYPE "AttributeType" AS ENUM ('TEXT', 'NUMBER', 'PERCENTAGE', 'IMAGE', 'LINK', 'BEFORE_AFTER', 'TEXTAREA');

-- CreateTable
CREATE TABLE "portfolio_categories" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "titleFa" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "descriptionFa" TEXT NOT NULL DEFAULT '',
    "descriptionEn" TEXT NOT NULL DEFAULT '',
    "icon" TEXT NOT NULL DEFAULT 'folder',
    "color" TEXT NOT NULL DEFAULT '#38534A',
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolio_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolio_attribute_templates" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "titleFa" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "descriptionFa" TEXT NOT NULL DEFAULT '',
    "descriptionEn" TEXT NOT NULL DEFAULT '',
    "type" "AttributeType" NOT NULL DEFAULT 'TEXT',
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "unit" TEXT NOT NULL DEFAULT '',
    "showInFrontend" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "options" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolio_attribute_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolio_attribute_values" (
    "id" SERIAL NOT NULL,
    "caseStudyId" INTEGER NOT NULL,
    "attributeId" INTEGER,
    "attributeKey" TEXT NOT NULL,
    "type" "AttributeType" NOT NULL DEFAULT 'TEXT',
    "valueText" TEXT,
    "valueNumber" DOUBLE PRECISION,
    "valueJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolio_attribute_values_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "case_studies" ADD COLUMN "categoryId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "portfolio_categories_slug_key" ON "portfolio_categories"("slug");
CREATE INDEX "portfolio_categories_position_idx" ON "portfolio_categories"("position");
CREATE INDEX "portfolio_categories_isActive_idx" ON "portfolio_categories"("isActive");
CREATE INDEX "portfolio_categories_slug_idx" ON "portfolio_categories"("slug");

-- CreateIndex
CREATE INDEX "portfolio_attribute_templates_categoryId_idx" ON "portfolio_attribute_templates"("categoryId");
CREATE INDEX "portfolio_attribute_templates_position_idx" ON "portfolio_attribute_templates"("position");
CREATE INDEX "portfolio_attribute_templates_isActive_idx" ON "portfolio_attribute_templates"("isActive");
CREATE UNIQUE INDEX "portfolio_attribute_templates_categoryId_key_key" ON "portfolio_attribute_templates"("categoryId", "key");

-- CreateIndex
CREATE INDEX "portfolio_attribute_values_caseStudyId_idx" ON "portfolio_attribute_values"("caseStudyId");
CREATE INDEX "portfolio_attribute_values_attributeId_idx" ON "portfolio_attribute_values"("attributeId");
CREATE UNIQUE INDEX "portfolio_attribute_values_caseStudyId_attributeKey_key" ON "portfolio_attribute_values"("caseStudyId", "attributeKey");

-- CreateIndex
CREATE INDEX "case_studies_categoryId_idx" ON "case_studies"("categoryId");

-- AddForeignKey
ALTER TABLE "case_studies" ADD CONSTRAINT "case_studies_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "portfolio_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_attribute_templates" ADD CONSTRAINT "portfolio_attribute_templates_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "portfolio_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_attribute_values" ADD CONSTRAINT "portfolio_attribute_values_caseStudyId_fkey" FOREIGN KEY ("caseStudyId") REFERENCES "case_studies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_attribute_values" ADD CONSTRAINT "portfolio_attribute_values_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "portfolio_attribute_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
