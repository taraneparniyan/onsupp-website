import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireContentManager, AuthenticatedRequest } from '../middleware/auth.js';
import { logAudit } from '../services/auditService.js';
import { triggerRevalidation } from '../services/revalidationService.js';

const router = Router();
const prisma = new PrismaClient();

function parseId(param: string | string[] | undefined): number {
  const val = Array.isArray(param) ? param[0] : param;
  return val ? parseInt(val, 10) : NaN;
}

// GET /api/v1/page-seo (Public - by routePath query or list)
router.get('/', async (req: Request, res: Response) => {
  try {
    const routePath = req.query.routePath as string | undefined;
    if (routePath) {
      const seo = await prisma.pageSeo.findUnique({
        where: { routePath: String(routePath).trim() },
      });
      return res.json(seo || null);
    }

    const items = await prisma.pageSeo.findMany({
      orderBy: { routePath: 'asc' },
    });
    res.json(items);
  } catch (error) {
    console.error('[page-seo] list error:', error);
    res.status(500).json({ error: 'خطا در دریافت اطلاعات سئو' });
  }
});

// GET /api/v1/page-seo/by-path and /by-route (Public - explicit query ?path=... or ?routePath=...)
router.get(['/by-path', '/by-route'], async (req: Request, res: Response) => {
  try {
    const path = (req.query.path || req.query.routePath) as string;
    if (!path) {
      return res.status(400).json({ error: 'پارامتر path یا routePath الزامی است' });
    }

    const seo = await prisma.pageSeo.findUnique({
      where: { routePath: String(path).trim() },
    });

    res.json(seo || null);
  } catch (error) {
    console.error('[page-seo] by-path/by-route error:', error);
    res.status(500).json({ error: 'خطا در جستجوی سئو بر اساس آدرس' });
  }
});

// GET /api/v1/page-seo/admin (Content Manager & Admin only)
router.get('/admin', authenticate, requireContentManager, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const items = await prisma.pageSeo.findMany({
      orderBy: { routePath: 'asc' },
    });
    res.json(items);
  } catch (error) {
    console.error('[page-seo] admin list error:', error);
    res.status(500).json({ error: 'خطا در دریافت لیست کامل سئو صفحات' });
  }
});

// POST /api/v1/page-seo (Content Manager & Admin - Create/Upsert)
router.post('/', authenticate, requireContentManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      routePath,
      titleFa,
      titleEn = '',
      descriptionFa = '',
      descriptionEn = '',
      keywordsFa = '',
      keywordsEn = '',
      keywords = [],
      canonicalUrl = '',
      ogImageUrl,
      noIndex = false,
    } = req.body;

    if (!routePath || !titleFa) {
      return res.status(400).json({ error: 'مسیر صفحه (routePath) و عنوان فارسی الزامی هستند' });
    }

    const normalizedPath = String(routePath).trim();
    const finalKeywordsFa = keywordsFa || (Array.isArray(keywords) ? keywords.join(', ') : '');

    const seo = await prisma.pageSeo.upsert({
      where: { routePath: normalizedPath },
      update: {
        titleFa,
        titleEn,
        descriptionFa,
        descriptionEn,
        keywordsFa: finalKeywordsFa,
        keywordsEn,
        canonicalUrl,
        ogImageUrl: ogImageUrl || null,
        noIndex: Boolean(noIndex),
      },
      create: {
        routePath: normalizedPath,
        titleFa,
        titleEn,
        descriptionFa,
        descriptionEn,
        keywordsFa: finalKeywordsFa,
        keywordsEn,
        canonicalUrl,
        ogImageUrl: ogImageUrl || null,
        noIndex: Boolean(noIndex),
      },
    });

    await logAudit({
      userId: req.user?.id,
      action: 'CREATE_PAGE_SEO',
      targetId: seo.id,
      details: `Created SEO config for ${seo.routePath}`,
      ipAddress: req.ip,
    });

    triggerRevalidation({ path: normalizedPath }).catch(() => {});
    res.status(201).json(seo);
  } catch (error) {
    console.error('[page-seo] create error:', error);
    res.status(500).json({ error: 'خطا در ایجاد سئو صفحه' });
  }
});

// PUT /api/v1/page-seo (Content Manager & Admin - Upsert by routePath)
router.put('/', authenticate, requireContentManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      routePath,
      titleFa,
      titleEn = '',
      descriptionFa = '',
      descriptionEn = '',
      keywordsFa = '',
      keywordsEn = '',
      canonicalUrl = '',
      ogImageUrl,
      noIndex = false,
    } = req.body;

    if (!routePath || !titleFa) {
      return res.status(400).json({ error: 'مسیر صفحه (routePath) و عنوان فارسی الزامی هستند' });
    }

    const normalizedPath = String(routePath).trim();

    const seo = await prisma.pageSeo.upsert({
      where: { routePath: normalizedPath },
      update: {
        titleFa,
        titleEn,
        descriptionFa,
        descriptionEn,
        keywordsFa,
        keywordsEn,
        canonicalUrl,
        ogImageUrl: ogImageUrl || null,
        noIndex: Boolean(noIndex),
      },
      create: {
        routePath: normalizedPath,
        titleFa,
        titleEn,
        descriptionFa,
        descriptionEn,
        keywordsFa,
        keywordsEn,
        canonicalUrl,
        ogImageUrl: ogImageUrl || null,
        noIndex: Boolean(noIndex),
      },
    });

    await logAudit({
      userId: req.user?.id,
      action: 'UPSERT_PAGE_SEO',
      targetId: seo.id,
      details: `Configured SEO for ${seo.routePath}`,
      ipAddress: req.ip,
    });

    triggerRevalidation({ path: normalizedPath }).catch(() => {});
    res.json(seo);
  } catch (error) {
    console.error('[page-seo] upsert error:', error);
    res.status(500).json({ error: 'خطا در ذخیره سئو صفحه' });
  }
});

// DELETE /api/v1/page-seo/:id (Content Manager & Admin)
router.delete('/:id', authenticate, requireContentManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر است' });
    }

    const deleted = await prisma.pageSeo.delete({ where: { id } });

    await logAudit({
      userId: req.user?.id,
      action: 'DELETE_PAGE_SEO',
      targetId: id,
      details: `Deleted SEO for ${deleted.routePath}`,
      ipAddress: req.ip,
    });

    triggerRevalidation({ path: deleted.routePath }).catch(() => {});
    res.json({ message: 'تنظیمات سئو با موفقیت حذف گردید' });
  } catch (error) {
    console.error('[page-seo] delete error:', error);
    res.status(500).json({ error: 'خطا در حذف تنظیمات سئو' });
  }
});

export default router;
