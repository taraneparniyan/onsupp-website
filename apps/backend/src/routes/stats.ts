import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireContentManager, AuthenticatedRequest } from '../middleware/auth.js';
import { triggerRevalidation } from '../services/revalidateService.js';

const router = Router();
const prisma = new PrismaClient();

function statData(body: any) {
  const data: any = {};
  for (const key of [
    'kind',
    'valueFa',
    'valueEn',
    'labelFa',
    'labelEn',
    'descFa',
    'descEn',
    'position',
    'isPublished',
    'status',
  ]) {
    if (body[key] !== undefined) {
      if (key === 'kind') {
        data[key] = body[key] === 'medical' ? 'medical' : 'number';
      } else if (key === 'isPublished') {
        data[key] = Boolean(body[key]);
      } else if (key === 'status') {
        data[key] = ['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(body[key]) ? body[key] : 'PUBLISHED';
      } else {
        data[key] = body[key];
      }
    }
  }
  return data;
}

// GET /api/v1/stats  (public — published stats only)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const stats = await prisma.stat.findMany({
      where: {
        isPublished: true,
        status: 'PUBLISHED',
      },
      orderBy: { position: 'asc' },
    });
    res.json(stats);
  } catch (error) {
    console.error('[stats] list error:', error);
    res.status(500).json({ error: 'دریافت آمار ناموفق بود' });
  }
});

// GET /api/v1/stats/all  (admin / CMS — all stats including drafts)
router.get('/all', authenticate, requireContentManager, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = await prisma.stat.findMany({
      orderBy: { position: 'asc' },
    });
    res.json(stats);
  } catch (error) {
    console.error('[stats] admin list error:', error);
    res.status(500).json({ error: 'دریافت تمام آمارها ناموفق بود' });
  }
});

// POST /api/v1/stats  (admin — create stat)
router.post('/', authenticate, requireContentManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = statData(req.body);
    const count = await prisma.stat.count();
    if (data.position === undefined) {
      data.position = count;
    }
    const stat = await prisma.stat.create({ data });
    await triggerRevalidation({ tags: ['stats', 'homepage'], paths: ['/'] }).catch(() => {});
    res.status(201).json(stat);
  } catch (error) {
    console.error('[stats] create error:', error);
    res.status(500).json({ error: 'ایجاد آمار ناموفق بود' });
  }
});

// PUT /api/v1/stats/:id  (admin — update stat)
router.put('/:id', authenticate, requireContentManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر' });
    }
    const data = statData(req.body);
    const stat = await prisma.stat.update({ where: { id }, data });
    await triggerRevalidation({ tags: ['stats', 'homepage'], paths: ['/'] }).catch(() => {});
    res.json(stat);
  } catch (error) {
    console.error('[stats] update error:', error);
    res.status(500).json({ error: 'ذخیره آمار ناموفق بود' });
  }
});

// DELETE /api/v1/stats/:id  (admin — delete stat)
router.delete('/:id', authenticate, requireContentManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر' });
    }
    await prisma.stat.delete({ where: { id } });
    await triggerRevalidation({ tags: ['stats', 'homepage'], paths: ['/'] }).catch(() => {});
    res.json({ message: 'حذف شد' });
  } catch (error) {
    console.error('[stats] delete error:', error);
    res.status(500).json({ error: 'حذف آمار ناموفق بود' });
  }
});

export default router;
