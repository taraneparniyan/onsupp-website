import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/v1/dashboard/stats
 * Admin-only endpoint returning live statistics and counts from the database.
 */
router.get('/stats', authenticate, requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const [
      usersCount,
      adminUsersCount,
      servicesCount,
      articlesCount,
      publishedArticlesCount,
      mediaCount,
      commentsCount,
      pendingCommentsCount,
      contactSubmissionsCount,
      unreadContactSubmissionsCount,
      caseStudiesCount,
      pricingPlansCount,
      heroSlidesCount,
      recentSubmissions,
      recentComments,
      recentArticles,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.service.count(),
      prisma.article.count(),
      prisma.article.count({ where: { published: true } }),
      prisma.media.count(),
      prisma.comment.count(),
      prisma.comment.count({ where: { approved: false } }),
      prisma.contactSubmission.count(),
      prisma.contactSubmission.count({ where: { read: false } }),
      prisma.caseStudy.count(),
      prisma.pricingPlan.count(),
      prisma.heroSlide.count(),
      prisma.contactSubmission.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          phone: true,
          service: true,
          read: true,
          createdAt: true,
        },
      }),
      prisma.comment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          content: true,
          approved: true,
          createdAt: true,
        },
      }),
      prisma.article.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          titleFa: true,
          categoryFa: true,
          published: true,
          createdAt: true,
        },
      }),
    ]);

    let dbPort = 5434;
    let dbName = 'onsupp_dev';
    try {
      if (process.env.DATABASE_URL) {
        const parsed = new URL(process.env.DATABASE_URL);
        dbPort = parsed.port ? parseInt(parsed.port, 10) : 5434;
        dbName = parsed.pathname.replace(/^\//, '') || 'onsupp_dev';
      }
    } catch {
      // Fallback safely without logging or exposing secrets
    }

    res.json({
      users: {
        total: usersCount,
        admins: adminUsersCount,
      },
      services: {
        total: servicesCount,
      },
      articles: {
        total: articlesCount,
        published: publishedArticlesCount,
      },
      media: {
        total: mediaCount,
      },
      comments: {
        total: commentsCount,
        pending: pendingCommentsCount,
      },
      contact: {
        total: contactSubmissionsCount,
        unread: unreadContactSubmissionsCount,
      },
      caseStudies: {
        total: caseStudiesCount,
      },
      pricingPlans: {
        total: pricingPlansCount,
      },
      heroSlides: {
        total: heroSlidesCount,
      },
      database: {
        connected: true,
        engine: 'PostgreSQL 18',
        host: 'localhost',
        port: dbPort,
        name: dbName,
        tablesCount: 12,
      },
      recentActivity: {
        submissions: recentSubmissions,
        comments: recentComments,
        articles: recentArticles,
      },
    });
  } catch (error) {
    console.error('[dashboard] stats error:', error);
    res.status(500).json({ error: 'دریافت آمار داشبورد با خطا مواجه شد' });
  }
});

export default router;
