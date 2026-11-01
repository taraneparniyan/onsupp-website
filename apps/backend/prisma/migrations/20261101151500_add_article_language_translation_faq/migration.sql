-- AlterTable
ALTER TABLE "articles" ADD COLUMN "language" TEXT NOT NULL DEFAULT 'fa';
ALTER TABLE "articles" ADD COLUMN "translationId" INTEGER;

-- CreateTable
CREATE TABLE "article_faqs" (
    "id" SERIAL NOT NULL,
    "articleId" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_faqs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "articles_translationId_key" ON "articles"("translationId");

-- CreateIndex
CREATE INDEX "articles_language_idx" ON "articles"("language");

-- CreateIndex
CREATE INDEX "article_faqs_articleId_idx" ON "article_faqs"("articleId");

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_translationId_fkey" FOREIGN KEY ("translationId") REFERENCES "articles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_faqs" ADD CONSTRAINT "article_faqs_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
