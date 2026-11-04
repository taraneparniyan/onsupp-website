-- CreateTable
CREATE TABLE "testimonials" (
    "id" SERIAL NOT NULL,
    "quoteFa" TEXT NOT NULL,
    "quoteEn" TEXT NOT NULL DEFAULT '',
    "authorFa" TEXT NOT NULL,
    "authorEn" TEXT NOT NULL DEFAULT '',
    "roleFa" TEXT NOT NULL DEFAULT '',
    "roleEn" TEXT NOT NULL DEFAULT '',
    "companyFa" TEXT,
    "companyEn" TEXT,
    "serviceTagFa" TEXT,
    "serviceTagEn" TEXT,
    "highlightFa" TEXT,
    "highlightEn" TEXT,
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "testimonials_isActive_idx" ON "testimonials"("isActive");

-- CreateIndex
CREATE INDEX "testimonials_position_idx" ON "testimonials"("position");
