import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, AuthenticatedRequest } from '../middleware/auth.js';
import { triggerRevalidation } from '../services/revalidateService.js';

const router = Router();
const prisma = new PrismaClient();

// GET /api/v1/sections (Public — returns enabled homepage sections in display order)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const sections = await prisma.homepageSection.findMany({
      where: { isEnabled: true },
      orderBy: { position: 'asc' },
    });
    res.json(sections);
  } catch (error) {
    console.error('[sections] public list error:', error);
    res.status(500).json({ error: 'خطا در دریافت لیست بخش‌های صفحه اصلی' });
  }
});

// GET /api/v1/sections/all (Admin — returns all sections with configuration)
router.get('/all', authenticate, requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const sections = await prisma.homepageSection.findMany({
      orderBy: { position: 'asc' },
    });
    res.json(sections);
  } catch (error) {
    console.error('[sections] admin list error:', error);
    res.status(500).json({ error: 'خطا در دریافت لیست مدیریت بخش‌ها' });
  }
});

// PUT /api/v1/sections/reorder (Admin — bulk update section positions and visibility)
router.put('/reorder', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'آرایه‌ای از بخش‌ها الزامی است' });
    }

    const updates = items.map((item: { id: number; position: number; isEnabled?: boolean }) => {
      const data: Record<string, any> = { position: Number(item.position) };
      if (item.isEnabled !== undefined) {
        data.isEnabled = Boolean(item.isEnabled);
      }
      return prisma.homepageSection.update({
        where: { id: Number(item.id) },
        data,
      });
    });

    await prisma.$transaction(updates);

    if (req.user?.id) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'REORDER_HOMEPAGE_SECTIONS',
          details: `Reordered ${items.length} homepage sections`,
          ipAddress: req.ip || null,
        },
      });
    }

    const sections = await prisma.homepageSection.findMany({ orderBy: { position: 'asc' } });
    await triggerRevalidation({ tags: ['sections', 'homepage'], paths: ['/'] }).catch(() => {});
    res.json({ message: 'ترتیب بخش‌ها با موفقیت ذخیره شد', sections });
  } catch (error) {
    console.error('[sections] reorder error:', error);
    res.status(500).json({ error: 'ذخیره ترتیب بخش‌ها ناموفق بود' });
  }
});

// PUT /api/v1/sections/:id (Admin — update single section settings or toggle)
router.put('/:id', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر است' });
    }

    const { titleFa, titleEn, isEnabled, position, settingsJson } = req.body;
    const data: Record<string, any> = {};

    if (titleFa !== undefined) data.titleFa = String(titleFa);
    if (titleEn !== undefined) data.titleEn = String(titleEn);
    if (isEnabled !== undefined) data.isEnabled = Boolean(isEnabled);
    if (position !== undefined) data.position = Number(position);
    if (settingsJson !== undefined) data.settingsJson = settingsJson;

    const section = await prisma.homepageSection.update({
      where: { id },
      data,
    });

    if (req.user?.id) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'UPDATE_HOMEPAGE_SECTION',
          targetId: id,
          details: `Updated homepage section "${section.key}"`,
          ipAddress: req.ip || null,
        },
      });
    }

    await triggerRevalidation({ tags: ['sections', 'homepage'], paths: ['/'] }).catch(() => {});
    res.json(section);
  } catch (error) {
    console.error('[sections] update error:', error);
    res.status(500).json({ error: 'ذخیره تنظیمات بخش ناموفق بود' });
  }
});

export default router;
