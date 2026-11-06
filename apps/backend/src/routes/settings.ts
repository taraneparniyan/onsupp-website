import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

const SETTINGS_FIELDS = [
  'siteNameFa',
  'siteNameEn',
  'siteTitleFa',
  'siteTitleEn',
  'siteDescFa',
  'siteDescEn',
  'defaultKeywordsFa',
  'defaultKeywordsEn',
  'metaTitleTemplate',
  'canonicalBaseUrl',
  'headerLogoUrl',
  'headerDarkLogoUrl',
  'footerLogoUrl',
  'ogImageUrl',
  'faviconUrl',
  'phone',
  'secondaryPhone',
  'phoneLabelFa',
  'phoneLabelEn',
  'email',
  'emailLabelFa',
  'emailLabelEn',
  'responseTimeFa',
  'responseTimeEn',
  'telegramHandle',
  'telegramUrl',
  'instagramUrl',
  'linkedinUrl',
  'contactChannels',
  'addressFa',
  'addressEn',
  'workingHoursFa',
  'workingHoursEn',
  'googleMapsUrl',
  'footerCopyrightFa',
  'footerCopyrightEn',
  'footerDescriptionFa',
  'footerDescriptionEn',
  'footerLinks',
  'headerNavJson',
] as const;

// GET /api/v1/settings (Public — site-wide settings & coordinates)
router.get('/', async (_req: Request, res: Response) => {
  try {
    let settings = await prisma.siteSettings.findFirst({ where: { id: 1 } });
    if (!settings) {
      settings = await prisma.siteSettings.create({ data: { id: 1 } });
    }
    res.json(settings);
  } catch (error) {
    console.error('[settings] fetch error:', error);
    res.status(500).json({ error: 'دریافت تنظیمات وب‌سایت ناموفق بود' });
  }
});

// PUT /api/v1/settings (Admin — update site settings)
router.put('/', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data: Record<string, any> = {};
    for (const field of SETTINGS_FIELDS) {
      if (req.body[field] !== undefined) {
        data[field] = req.body[field];
      }
    }

    const settings = await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    });

    // Audit Log
    if (req.user?.id) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'UPDATE_SITE_SETTINGS',
          targetId: 1,
          details: 'Updated global site settings and coordinates',
          ipAddress: req.ip || null,
        },
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('[settings] update error:', error);
    res.status(500).json({ error: 'ذخیره تنظیمات وب‌سایت ناموفق بود' });
  }
});

export default router;
