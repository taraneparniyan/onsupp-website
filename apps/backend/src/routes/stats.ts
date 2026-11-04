import { Router, Request, Response } from 'express';
import { PrismaClient, ContentStatus } from '@prisma/client';
import { authenticate, requireAdmin, AuthenticatedRequest } from '../middleware/auth.js';
import { logAudit } from '../services/auditService.js';
import { triggerRevalidation } from '../services/revalidationService.js';

const router = Router();
const prisma = new PrismaClient();

function parseId(param: string | string[] | undefined): number {
  const val = Array.isArray(param) ? param[0] : param;
  return val ? parseInt(val, 10) : NaN;
}

// GET /api/v1/stats (Public — ordered published stats)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const stats = await prisma.stat.findMany({
      where: {
        published: true,
        status: ContentStatus.PUBLISHED,
      },
      orderBy: { position: 'asc' },
    });
    res.json(stats);
  } catch (error) {
    console.error('[stats] list error:', error);
    res.status(500).json({ error: 'دریافت آمار ناموفق بود' });
  }
});

// GET /api/v1/stats/admin (Admin only — all stats)
router.get('/admin', authenticate, requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = await prisma.stat.findMany({
      orderBy: { position: 'asc' },
    });
    res.json(stats);
  } catch (error) {
    console.error('[stats] admin list error:', error);
    res.status(500).json({ error: 'دریافت لیست کامل آمار ناموفق بود' });
  }
});

// PUT /api/v1/stats/reorder (Admin only — batch reorder)
router.put('/reorder', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'آرایه items الزامی است' });
    }

    await prisma.$transaction(
      items.map((item: { id: number; position: number }) =>
        prisma.stat.update({
          where: { id: Number(item.id) },
          data: { position: Number(item.position) },
        })
      )
    );

    triggerRevalidation({ path: '/' }).catch(() => {});
    res.json({ message: 'ترتیب آمارها با موفقیت ذخیره شد' });
  } catch (error) {
    console.error('[stats] reorder error:', error);
    res.status(500).json({ error: 'خطا در تغییر ترتیب آمار' });
  }
});

// POST /api/v1/stats (Admin — create stat)
router.post('/', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      kind = 'number',
      valueFa = '',
      valueEn = '',
      labelFa = '',
      labelEn = '',
      descFa = '',
      descEn = '',
      iconType = 'star',
      suffixFa = '',
      suffixEn = '',
      isRating = false,
      position,
      published = true,
      status = 'PUBLISHED',
    } = req.body;

    const count = await prisma.stat.count();
    const finalPosition = typeof position === 'number' ? position : count;

    const stat = await prisma.stat.create({
      data: {
        kind,
        valueFa,
        valueEn,
        labelFa,
        labelEn,
        descFa,
        descEn,
        iconType,
        suffixFa,
        suffixEn,
        isRating: Boolean(isRating),
        position: finalPosition,
        published: Boolean(published),
        status: status in ContentStatus ? (status as ContentStatus) : ContentStatus.PUBLISHED,
      },
    });

    await logAudit({
      userId: req.user?.id,
      action: 'CREATE_STAT',
      targetId: stat.id,
      details: `Created stat: ${stat.labelFa} (${stat.valueFa})`,
      ipAddress: req.ip,
    });

    triggerRevalidation({ path: '/' }).catch(() => {});
    res.status(201).json(stat);
  } catch (error) {
    console.error('[stats] create error:', error);
    res.status(500).json({ error: 'ایجاد آمار ناموفق بود' });
  }
});

// PUT /api/v1/stats/:id (Admin — update stat)
router.put('/:id', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر' });
    }

    const {
      kind,
      valueFa,
      valueEn,
      labelFa,
      labelEn,
      descFa,
      descEn,
      iconType,
      suffixFa,
      suffixEn,
      isRating,
      position,
      published,
      status,
    } = req.body;

    const data: Record<string, any> = {};
    if (kind !== undefined) data.kind = kind;
    if (valueFa !== undefined) data.valueFa = valueFa;
    if (valueEn !== undefined) data.valueEn = valueEn;
    if (labelFa !== undefined) data.labelFa = labelFa;
    if (labelEn !== undefined) data.labelEn = labelEn;
    if (descFa !== undefined) data.descFa = descFa;
    if (descEn !== undefined) data.descEn = descEn;
    if (iconType !== undefined) data.iconType = iconType;
    if (suffixFa !== undefined) data.suffixFa = suffixFa;
    if (suffixEn !== undefined) data.suffixEn = suffixEn;
    if (isRating !== undefined) data.isRating = Boolean(isRating);
    if (position !== undefined) data.position = Number(position);
    if (published !== undefined) data.published = Boolean(published);
    if (status !== undefined && status in ContentStatus) data.status = status as ContentStatus;

    const stat = await prisma.stat.update({ where: { id }, data });

    await logAudit({
      userId: req.user?.id,
      action: 'UPDATE_STAT',
      targetId: id,
      details: `Updated stat: ${stat.labelFa}`,
      ipAddress: req.ip,
    });

    triggerRevalidation({ path: '/' }).catch(() => {});
    res.json(stat);
  } catch (error) {
    console.error('[stats] update error:', error);
    res.status(500).json({ error: 'ذخیره آمار ناموفق بود' });
  }
});

// DELETE /api/v1/stats/:id (Admin — delete stat)
router.delete('/:id', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر' });
    }

    const stat = await prisma.stat.delete({ where: { id } });

    await logAudit({
      userId: req.user?.id,
      action: 'DELETE_STAT',
      targetId: id,
      details: `Deleted stat: ${stat.labelFa}`,
      ipAddress: req.ip,
    });

    triggerRevalidation({ path: '/' }).catch(() => {});
    res.json({ message: 'حذف شد' });
  } catch (error) {
    console.error('[stats] delete error:', error);
    res.status(500).json({ error: 'حذف آمار ناموفق بود' });
  }
});

export default router;
