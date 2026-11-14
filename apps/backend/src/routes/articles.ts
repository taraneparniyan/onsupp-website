import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import {
  authenticate,
  requireContentManager,
  AuthenticatedRequest,
} from "../middleware/auth.js";
import {
  normalizeFocusKeyword,
  normalizeSecondaryKeywords,
  normalizeSeoConfig,
} from "../utils/seoConfig.js";

const router = Router();
export const prisma = new PrismaClient();

const canManageArticles = (role?: string) =>
  Boolean(role && ["SUPER_ADMIN", "ADMIN", "CONTENT_SEO_MANAGER"].includes(role));

const articleIncludeRelations = {
  faqs: {
    orderBy: { order: "asc" as const },
  },
  translation: {
    select: {
      id: true,
      titleFa: true,
      titleEn: true,
      slug: true,
      language: true,
      published: true,
    },
  },
  translatedFrom: {
    select: {
      id: true,
      titleFa: true,
      titleEn: true,
      slug: true,
      language: true,
      published: true,
    },
  },
};

function formatArticle(article: any) {
  if (!article) return null;
  const relatedTranslation = article.translation || article.translatedFrom || null;
  return {
    ...article,
    relatedTranslation,
  };
}

// GET all published articles (public) or all articles including drafts (authorized roles only)
router.get("/", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const isManager = canManageArticles(req.user?.role);
    const authorQuery = req.query.author ? String(req.query.author) : undefined;
    const languageQuery = req.query.language ? String(req.query.language) : undefined;

    const whereCondition: any = {};
    if (!isManager) {
      whereCondition.published = true;
      // Filter out test and placeholder mock entries from public view
      whereCondition.AND = [
        {
          NOT: [
            { slug: { startsWith: "test" } },
            { slug: { startsWith: "article-179" } },
            { slug: "seo-technical-architecture-1793534887383" },
            { titleFa: "تست" },
            { titleFa: "New Article" },
            { titleFa: "API Service Post" },
            { titleFa: "" },
          ],
        },
      ];
    }
    if (authorQuery) {
      whereCondition.author = {
        equals: authorQuery,
        mode: "insensitive",
      };
    }
    if (languageQuery) {
      whereCondition.language = languageQuery;
    }

    const articles = await prisma.article.findMany({
      where: whereCondition,
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      take: limit,
      include: articleIncludeRelations,
    });

    res.json(articles.map(formatArticle));
  } catch (error) {
    console.error("[Articles List Error]", error);
    res.status(500).json({ error: "Failed to fetch articles" });
  }
});

// GET single article by slug
router.get("/by-slug/:slug", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const slug = String(req.params.slug);
    const article = await prisma.article.findUnique({
      where: { slug },
      include: articleIncludeRelations,
    });
    if (!article) return res.status(404).json({ error: "Article not found" });

    const isManager = canManageArticles(req.user?.role);
    if (!article.published && !isManager) {
      return res.status(404).json({ error: "Article not found" });
    }

    if (!isManager && (
      article.slug.startsWith("test") ||
      article.slug.startsWith("article-179") ||
      article.slug === "seo-technical-architecture-1793534887383" ||
      article.titleFa === "تست" ||
      article.titleFa === "New Article" ||
      article.titleFa === "API Service Post" ||
      !article.titleFa ||
      article.titleFa.trim() === ""
    )) {
      return res.status(404).json({ error: "Article not found" });
    }

    res.json(formatArticle(article));
  } catch (error) {
    console.error("[Article by-slug Error]", error);
    res.status(500).json({ error: "Failed to fetch article" });
  }
});

// GET single article by id
router.get("/:id", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid article ID" });
    }

    const article = await prisma.article.findUnique({
      where: { id },
      include: articleIncludeRelations,
    });
    if (!article) return res.status(404).json({ error: "Article not found" });

    const isManager = canManageArticles(req.user?.role);
    if (!article.published && !isManager) {
      return res.status(404).json({ error: "Article not found" });
    }

    if (!isManager && (
      article.slug.startsWith("test") ||
      article.slug.startsWith("article-179") ||
      article.slug === "seo-technical-architecture-1793534887383" ||
      article.titleFa === "تست" ||
      article.titleFa === "New Article" ||
      article.titleFa === "API Service Post" ||
      !article.titleFa ||
      article.titleFa.trim() === ""
    )) {
      return res.status(404).json({ error: "Article not found" });
    }

    res.json(formatArticle(article));
  } catch (error) {
    console.error("[Article by-id Error]", error);
    res.status(500).json({ error: "Failed to fetch article" });
  }
});

// POST create article (Super Admin, Admin, Content Manager)
router.post("/", authenticate, requireContentManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      titleFa,
      titleEn,
      slug,
      language = "fa",
      translationId,
      faqs,
      categoryFa,
      categoryEn,
      excerptFa,
      excerptEn,
      contentFa,
      contentEn,
      readTimeFa,
      readTimeEn,
      imageUrl,
      author,
      published,
      metaTitleFa,
      metaTitleEn,
      metaDescFa,
      metaDescEn,
      keywordsFa,
      keywordsEn,
      canonicalUrl,
      ogImage,
      focusKeyword,
      secondaryKeywords,
      isPillar,
      seoConfig,
    } = req.body;

    const validatedLang = language === "en" ? "en" : "fa";
    const generatedSlug = slug && slug.trim() !== "" ? slug.trim() : `article-${Date.now()}`;

    // Validate translation link if provided
    let finalTranslationId: number | null = null;
    if (translationId) {
      const parsedTransId = parseInt(String(translationId), 10);
      if (Number.isNaN(parsedTransId) || parsedTransId <= 0) {
        return res.status(400).json({ error: "شناسه مقاله ترجمه نامعتبر است." });
      }

      const targetArticle = await prisma.article.findUnique({ where: { id: parsedTransId } });
      if (!targetArticle) {
        return res.status(400).json({ error: "مقاله ترجمه مورد نظر یافت نشد." });
      }

      if (targetArticle.language === validatedLang) {
        return res.status(400).json({
          error: "پیوند ترجمه فقط بین دو مقاله با زبان‌های متفاوت (فارسی و انگلیسی) امکان‌پذیر است.",
        });
      }

      // Safe cleanup of existing links on target article before establishing new 1-to-1
      await prisma.article.updateMany({
        where: { translationId: parsedTransId },
        data: { translationId: null },
      });
      await prisma.article.update({
        where: { id: parsedTransId },
        data: { translationId: null },
      });

      finalTranslationId = parsedTransId;
    }

    const article = await prisma.article.create({
      data: {
        titleFa: titleFa || "",
        titleEn: titleEn || "",
        slug: generatedSlug,
        language: validatedLang,
        translationId: finalTranslationId,
        categoryFa: categoryFa || "آموزش سئو",
        categoryEn: categoryEn || "SEO Tutorial",
        excerptFa: excerptFa || "",
        excerptEn: excerptEn || "",
        contentFa: contentFa || "",
        contentEn: contentEn || "",
        readTimeFa: readTimeFa || (validatedLang === "en" ? "5 min read" : "۵ دقیقه مطالعه"),
        readTimeEn: readTimeEn || "5 min read",
        imageUrl: imageUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
        author: author || "آن‌ساپ",
        published: published !== undefined ? Boolean(published) : true,
        metaTitleFa: metaTitleFa || titleFa || "",
        metaTitleEn: metaTitleEn || titleEn || "",
        metaDescFa: metaDescFa || excerptFa || "",
        metaDescEn: metaDescEn || excerptEn || "",
        keywordsFa: keywordsFa || "",
        keywordsEn: keywordsEn || "",
        canonicalUrl: canonicalUrl || "",
        ogImage: ogImage || imageUrl || "",
        focusKeyword: normalizeFocusKeyword(focusKeyword),
        secondaryKeywords: normalizeSecondaryKeywords(secondaryKeywords),
        isPillar: Boolean(isPillar),
        seoConfig: normalizeSeoConfig(seoConfig, "BlogPosting"),
      },
    });

    // Save optional FAQ items
    if (Array.isArray(faqs) && faqs.length > 0) {
      const validFaqs = faqs
        .filter((f: any) => f && (f.question?.trim() || f.answer?.trim()))
        .map((f: any, idx: number) => ({
          articleId: article.id,
          question: String(f.question || "").trim(),
          answer: String(f.answer || "").trim(),
          order: typeof f.order === "number" ? f.order : idx,
        }));

      if (validFaqs.length > 0) {
        await prisma.articleFaq.createMany({ data: validFaqs });
      }
    }

    const fullArticle = await prisma.article.findUnique({
      where: { id: article.id },
      include: articleIncludeRelations,
    });

    res.status(201).json(formatArticle(fullArticle));
  } catch (error) {
    console.error("[Article Create Error]", error);
    res.status(500).json({ error: "Failed to create article" });
  }
});

// PUT update article (Super Admin, Admin, Content Manager)
router.put("/:id", authenticate, requireContentManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "شناسه مقاله نامعتبر است." });
    }

    const currentArticle = await prisma.article.findUnique({ where: { id } });
    if (!currentArticle) {
      return res.status(404).json({ error: "مقاله یافت نشد." });
    }

    const {
      titleFa,
      titleEn,
      slug,
      language,
      translationId,
      faqs,
      categoryFa,
      categoryEn,
      excerptFa,
      excerptEn,
      contentFa,
      contentEn,
      readTimeFa,
      readTimeEn,
      imageUrl,
      author,
      published,
      metaTitleFa,
      metaTitleEn,
      metaDescFa,
      metaDescEn,
      keywordsFa,
      keywordsEn,
      canonicalUrl,
      ogImage,
      focusKeyword,
      secondaryKeywords,
      isPillar,
      seoConfig,
    } = req.body;

    const validatedLang = language ? (language === "en" ? "en" : "fa") : currentArticle.language;

    // Handle translation linking validation
    let updateTranslationId = currentArticle.translationId;
    if (translationId !== undefined) {
      if (translationId === null || translationId === 0 || translationId === "") {
        // Disconnect translation link on both sides
        await prisma.article.updateMany({
          where: { translationId: id },
          data: { translationId: null },
        });
        updateTranslationId = null;
      } else {
        const parsedTargetId = parseInt(String(translationId), 10);
        if (Number.isNaN(parsedTargetId) || parsedTargetId <= 0) {
          return res.status(400).json({ error: "شناسه ترجمه نامعتبر است." });
        }

        // Prevent linking an article to itself
        if (parsedTargetId === id) {
          return res.status(400).json({ error: "یک مقاله نمی‌تواند به عنوان ترجمه خودش انتخاب شود." });
        }

        const targetArticle = await prisma.article.findUnique({ where: { id: parsedTargetId } });
        if (!targetArticle) {
          return res.status(400).json({ error: "مقاله ترجمه مورد نظر یافت نشد." });
        }

        // Prevent linking two articles of the same language
        if (targetArticle.language === validatedLang) {
          return res.status(400).json({
            error: "پیوند ترجمه فقط بین دو مقاله با زبان‌های متفاوت (فارسی و انگلیسی) امکان‌پذیر است.",
          });
        }

        // Clean up prior links on both sides to preserve safe 1-to-1 invariant
        await prisma.article.updateMany({
          where: { translationId: id },
          data: { translationId: null },
        });
        await prisma.article.updateMany({
          where: { translationId: parsedTargetId },
          data: { translationId: null },
        });
        await prisma.article.update({
          where: { id: parsedTargetId },
          data: { translationId: null },
        });

        updateTranslationId = parsedTargetId;
      }
    }

    await prisma.article.update({
      where: { id },
      data: {
        ...(titleFa !== undefined && { titleFa }),
        ...(titleEn !== undefined && { titleEn }),
        ...(slug !== undefined && { slug }),
        ...(language !== undefined && { language: validatedLang }),
        translationId: updateTranslationId,
        ...(categoryFa !== undefined && { categoryFa }),
        ...(categoryEn !== undefined && { categoryEn }),
        ...(excerptFa !== undefined && { excerptFa }),
        ...(excerptEn !== undefined && { excerptEn }),
        ...(contentFa !== undefined && { contentFa }),
        ...(contentEn !== undefined && { contentEn }),
        ...(readTimeFa !== undefined && { readTimeFa }),
        ...(readTimeEn !== undefined && { readTimeEn }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(author !== undefined && { author }),
        ...(published !== undefined && { published: Boolean(published) }),
        ...(metaTitleFa !== undefined && { metaTitleFa }),
        ...(metaTitleEn !== undefined && { metaTitleEn }),
        ...(metaDescFa !== undefined && { metaDescFa }),
        ...(metaDescEn !== undefined && { metaDescEn }),
        ...(keywordsFa !== undefined && { keywordsFa }),
        ...(keywordsEn !== undefined && { keywordsEn }),
        ...(canonicalUrl !== undefined && { canonicalUrl }),
        ...(ogImage !== undefined && { ogImage }),
        ...(focusKeyword !== undefined && { focusKeyword: normalizeFocusKeyword(focusKeyword) }),
        ...(secondaryKeywords !== undefined && {
          secondaryKeywords: normalizeSecondaryKeywords(secondaryKeywords),
        }),
        ...(isPillar !== undefined && { isPillar: Boolean(isPillar) }),
        ...(seoConfig !== undefined && {
          seoConfig: normalizeSeoConfig(seoConfig, "BlogPosting"),
        }),
      },
    });

    // Update FAQs if provided in request
    if (faqs !== undefined && Array.isArray(faqs)) {
      await prisma.articleFaq.deleteMany({ where: { articleId: id } });
      const validFaqs = faqs
        .filter((f: any) => f && (f.question?.trim() || f.answer?.trim()))
        .map((f: any, idx: number) => ({
          articleId: id,
          question: String(f.question || "").trim(),
          answer: String(f.answer || "").trim(),
          order: typeof f.order === "number" ? f.order : idx,
        }));

      if (validFaqs.length > 0) {
        await prisma.articleFaq.createMany({ data: validFaqs });
      }
    }

    const fullArticle = await prisma.article.findUnique({
      where: { id },
      include: articleIncludeRelations,
    });

    res.json(formatArticle(fullArticle));
  } catch (error) {
    console.error("[Article Update Error]", error);
    res.status(500).json({ error: "Failed to update article" });
  }
});

// DELETE article (Super Admin, Admin, Content Manager)
router.delete("/:id", authenticate, requireContentManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid article ID" });
    }

    // Unlink any article that had this article as its translation
    await prisma.article.updateMany({
      where: { translationId: id },
      data: { translationId: null },
    });

    await prisma.article.delete({ where: { id } });
    res.json({ message: "Article deleted successfully" });
  } catch (error) {
    console.error("[Article Delete Error]", error);
    res.status(500).json({ error: "Failed to delete article" });
  }
});

export default router;
