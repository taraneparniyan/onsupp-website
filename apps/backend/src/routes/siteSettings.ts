import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, AuthenticatedRequest } from '../middleware/auth.js';
import { logAudit } from '../services/auditService.js';
import { triggerRevalidation } from '../services/revalidationService.js';

const router = Router();
const prisma = new PrismaClient();

const ALLOWED_FIELDS = [
  'siteNameFa',
  'siteNameEn',
  'siteDescriptionFa',
  'siteDescriptionEn',
  'headerCtaTextFa',
  'headerCtaTextEn',
  'headerCtaLink',
  'addressTitleFa',
  'addressTitleEn',
  'streetFa',
  'streetEn',
  'cityFa',
  'cityEn',
  'workingHoursFa',
  'workingHoursEn',
  'channels',
  'telegramUrl',
  'telegramHandle',
  'instagramUrl',
  'linkedinUrl',
  'consultEmail',
  'footerTextFa',
  'footerTextEn',
  'copyrightTextFa',
  'copyrightTextEn',
  'defaultMetaTitleFa',
  'defaultMetaTitleEn',
  'defaultMetaDescFa',
  'defaultMetaDescEn',
  'defaultKeywordsFa',
  'defaultKeywordsEn',
  'headerLogoUrl',
  'footerLogoUrl',
  'faviconUrl',
  'ogImageUrl',
] as const;

// GET /api/v1/site-settings (Public)
router.get('/', async (_req: Request, res: Response) => {
  try {
    let settings = await prisma.siteSetting.findUnique({
      where: { id: 1 },
    });

    if (!settings) {
      // Auto-initialize default singleton record if not present
      settings = await prisma.siteSetting.create({
        data: { id: 1 },
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('[site-settings] fetch error:', error);
    res.status(500).json({ error: 'خطا در دریافت تنظیمات سایت' });
  }
});

// PUT /api/v1/site-settings (Admin only - updates singleton id=1)
router.put('/', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updateData: Record<string, any> = {};

    for (const field of ALLOWED_FIELDS) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    const settings = await prisma.siteSetting.upsert({
      where: { id: 1 },
      update: updateData,
      create: { id: 1, ...updateData },
    });

    await logAudit({
      userId: req.user?.id,
      action: 'UPDATE_SITE_SETTINGS',
      targetId: 1,
      details: `Site settings updated by ${req.user?.email || 'admin'}`,
      ipAddress: req.ip,
    });

    // Invalidate root cache
    triggerRevalidation({ path: '/' }).catch(() => {});
    triggerRevalidation({ tag: 'site-settings' }).catch(() => {});

    res.json(settings);
  } catch (error) {
    console.error('[site-settings] update error:', error);
    res.status(500).json({ error: 'خطا در ذخیره تنظیمات سایت' });
  }
});

export default router;
