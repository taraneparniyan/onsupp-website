import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, AuthenticatedRequest } from '../middleware/auth.js';

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
  ]) {
    if (body[key] !== undefined) {
      data[key] = key === 'kind' ? (body[key] === 'medical' ? 'medical' : 'number') : body[key];
    }
  }
  return data;
}

// GET /api/v1/stats  (public — ordered stats)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const stats = await prisma.stat.findMany({ orderBy: { position: 'asc' } });
    res.json(stats);
  } catch (error) {
    console.error('[stats] list error:', error);
    res.status(500).json({ error: 'دریافت آمار ناموفق بود' });
  }
});

// POST /api/v1/stats  (admin — create stat)
router.post('/', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = statData(req.body);
    const count = await prisma.stat.count();
    if (data.position === undefined) {
      data.position = count;
    }
    const stat = await prisma.stat.create({ data });
    res.status(201).json(stat);
  } catch (error) {
    console.error('[stats] create error:', error);
    res.status(500).json({ error: 'ایجاد آمار ناموفق بود' });
  }
});

// PUT /api/v1/stats/:id  (admin — update stat)
router.put('/:id', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر' });
    }
    const data = statData(req.body);
    const stat = await prisma.stat.update({ where: { id }, data });
    res.json(stat);
  } catch (error) {
    console.error('[stats] update error:', error);
    res.status(500).json({ error: 'ذخیره آمار ناموفق بود' });
  }
});

// DELETE /api/v1/stats/:id  (admin — delete stat)
router.delete('/:id', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر' });
    }
    await prisma.stat.delete({ where: { id } });
    res.json({ message: 'حذف شد' });
  } catch (error) {
    console.error('[stats] delete error:', error);
    res.status(500).json({ error: 'حذف آمار ناموفق بود' });
  }
});

export default router;
