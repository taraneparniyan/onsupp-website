import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, AuthenticatedRequest } from '../middleware/auth.js';
import { logAudit } from '../services/auditService.js';
import { triggerRevalidation } from '../services/revalidationService.js';

const router = Router();
const prisma = new PrismaClient();

const ALLOWED_FIELDS = [
  'heroEyebrowFa',
  'heroEyebrowEn',
  'heroTitleFa',
  'heroTitleEn',
  'heroCaptionFa',
  'heroCaptionEn',
  'heroImageUrl',
  'heroImageAltFa',
  'heroImageAltEn',
  'introEyebrowFa',
  'introEyebrowEn',
  'introTitleFa',
  'introTitleEn',
  'introLeadFa',
  'introLeadEn',
  'introApproachFa',
  'introApproachEn',
  'coreValues',
  'ceoNameFa',
  'ceoNameEn',
  'ceoRoleFa',
  'ceoRoleEn',
  'ceoQuoteFa',
  'ceoQuoteEn',
  'ceoBioFa',
  'ceoBioEn',
  'ceoPhotoUrl',
  'ceoSocialLinks',
] as const;

// GET /api/v1/about-page (Public)
router.get('/', async (_req: Request, res: Response) => {
  try {
    let setting = await prisma.aboutPageSetting.findUnique({
      where: { id: 1 },
    });

    if (!setting) {
      setting = await prisma.aboutPageSetting.create({
        data: { id: 1 },
      });
    }

    res.json(setting);
  } catch (error) {
    console.error('[about-page] fetch error:', error);
    res.status(500).json({ error: 'خطا در دریافت اطلاعات صفحه درباره ما' });
  }
});

// PUT /api/v1/about-page (Admin only)
router.put('/', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data: Record<string, any> = {};

    for (const field of ALLOWED_FIELDS) {
      if (req.body[field] !== undefined) {
        if (field === 'ceoBioFa' || field === 'ceoBioEn') {
          data[field] = Array.isArray(req.body[field]) ? req.body[field] : [];
        } else {
          data[field] = req.body[field];
        }
      }
    }

    const setting = await prisma.aboutPageSetting.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    });

    await logAudit({
      userId: req.user?.id,
      action: 'UPDATE_ABOUT_PAGE',
      targetId: 1,
      details: `Updated about page setting`,
      ipAddress: req.ip,
    });

    triggerRevalidation({ path: '/about' }).catch(() => {});
    triggerRevalidation({ tag: 'about-page' }).catch(() => {});
    res.json(setting);
  } catch (error) {
    console.error('[about-page] update error:', error);
    res.status(500).json({ error: 'خطا در ذخیره تنظیمات صفحه درباره ما' });
  }
});

export default router;
