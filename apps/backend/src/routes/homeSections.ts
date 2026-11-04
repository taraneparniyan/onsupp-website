import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, AuthenticatedRequest } from '../middleware/auth.js';
import { logAudit } from '../services/auditService.js';
import { triggerRevalidation } from '../services/revalidationService.js';

const router = Router();
const prisma = new PrismaClient();

// GET /api/v1/home-sections (Public - only enabled sections)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const sections = await prisma.homeSection.findMany({
      where: { isEnabled: true },
      orderBy: { position: 'asc' },
    });
    const enriched = sections.map((s) => ({ ...s, sectionKey: s.key }));
    res.json(enriched);
  } catch (error) {
    console.error('[home-sections] public list error:', error);
    res.status(500).json({ error: 'خطا در دریافت بخش‌های صفحه اصلی' });
  }
});

// GET /api/v1/home-sections/admin (Admin only - all sections)
router.get('/admin', authenticate, requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const sections = await prisma.homeSection.findMany({
      orderBy: { position: 'asc' },
    });
    const enriched = sections.map((s) => ({ ...s, sectionKey: s.key }));
    res.json(enriched);
  } catch (error) {
    console.error('[home-sections] admin list error:', error);
    res.status(500).json({ error: 'خطا در دریافت لیست کامل بخش‌ها' });
  }
});

// PUT /api/v1/home-sections/reorder (Admin only - batch reorder & toggle)
router.put('/reorder', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rawItems = req.body.items || req.body.sections;
    if (!Array.isArray(rawItems)) {
      return res.status(400).json({ error: 'آرایه items یا sections الزامی است' });
    }

    await prisma.$transaction(
      rawItems.map((item: { key?: string; sectionKey?: string; id?: number; position: number; isEnabled?: boolean }) => {
        const itemKey = item.key || item.sectionKey;
        const whereClause = itemKey ? { key: itemKey } : { id: Number(item.id) };
        const data: Record<string, any> = { position: Number(item.position) };
        if (item.isEnabled !== undefined) {
          data.isEnabled = Boolean(item.isEnabled);
        }
        return prisma.homeSection.update({
          where: whereClause as any,
          data,
        });
      })
    );

    await logAudit({
      userId: req.user?.id,
      action: 'REORDER_HOME_SECTIONS',
      details: `Reordered ${rawItems.length} homepage sections`,
      ipAddress: req.ip,
    });

    triggerRevalidation({ path: '/' }).catch(() => {});
    triggerRevalidation({ tag: 'home-sections' }).catch(() => {});
    res.json({ message: 'ترتیب بخش‌ها با موفقیت ذخیره شد' });
  } catch (error) {
    console.error('[home-sections] reorder error:', error);
    res.status(500).json({ error: 'خطا در تغییر چیدمان بخش‌ها' });
  }
});

// PUT /api/v1/home-sections/:key (Admin only - update single section)
router.put('/:key', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rawKey = Array.isArray(req.params.key) ? req.params.key[0] : req.params.key;
    const key = String(rawKey);

    const { titleFa, titleEn, isEnabled, position, settings } = req.body;

    const data: Record<string, any> = {};
    if (titleFa !== undefined) data.titleFa = titleFa;
    if (titleEn !== undefined) data.titleEn = titleEn;
    if (isEnabled !== undefined) data.isEnabled = Boolean(isEnabled);
    if (position !== undefined) data.position = Number(position);
    if (settings !== undefined) data.settings = settings;

    const section = await prisma.homeSection.upsert({
      where: { key },
      update: data,
      create: {
        key,
        titleFa: titleFa || key,
        titleEn: titleEn || '',
        isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : true,
        position: position !== undefined ? Number(position) : 0,
        settings: settings || null,
      },
    });

    await logAudit({
      userId: req.user?.id,
      action: 'UPDATE_HOME_SECTION',
      targetId: section.id,
      details: `Updated home section: ${section.key}`,
      ipAddress: req.ip,
    });

    triggerRevalidation({ path: '/' }).catch(() => {});
    triggerRevalidation({ tag: 'home-sections' }).catch(() => {});
    res.json(section);
  } catch (error) {
    console.error('[home-sections] update error:', error);
    res.status(500).json({ error: 'خطا در ویرایش بخش صفحه اصلی' });
  }
});

export default router;
