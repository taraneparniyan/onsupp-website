import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

function serviceData(body: any) {
  const data: any = {};
  for (const key of ['title', 'titleEn', 'subtitle', 'subtitleEn', 'imageUrl', 'imageAlt', 'position']) {
    if (body[key] !== undefined) {
      data[key] = key === 'imageUrl' || key === 'imageAlt'
        ? (body[key] ? String(body[key]) : null)
        : body[key];
    }
  }
  if (data.imageUrl && !data.imageAlt) {
    throw new Error('ALT_REQUIRED');
  }
  return data;
}

// GET /api/v1/services  (public — ordered services)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const services = await prisma.service.findMany({ orderBy: { position: 'asc' } });
    res.json(services);
  } catch (error) {
    console.error('[services] list error:', error);
    res.status(500).json({ error: 'دریافت خدمات ناموفق بود' });
  }
});

// POST /api/v1/services  (admin — create service)
router.post('/', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = serviceData(req.body);
    const count = await prisma.service.count();
    if (data.position === undefined) {
      data.position = count;
    }
    const service = await prisma.service.create({ data });
    res.status(201).json(service);
  } catch (error) {
    if (error instanceof Error && error.message === 'ALT_REQUIRED') {
      return res.status(400).json({ error: 'برای تصویر، متن جایگزین (Alt) الزامی است' });
    }
    console.error('[services] create error:', error);
    res.status(500).json({ error: 'ایجاد خدمت ناموفق بود' });
  }
});

// PUT /api/v1/services/:id  (admin — update service)
router.put('/:id', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر' });
    }
    const data = serviceData(req.body);
    const service = await prisma.service.update({ where: { id }, data });
    res.json(service);
  } catch (error) {
    if (error instanceof Error && error.message === 'ALT_REQUIRED') {
      return res.status(400).json({ error: 'برای تصویر، متن جایگزین (Alt) الزامی است' });
    }
    console.error('[services] update error:', error);
    res.status(500).json({ error: 'ذخیره خدمت ناموفق بود' });
  }
});

// DELETE /api/v1/services/:id  (admin — delete service)
router.delete('/:id', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر' });
    }
    await prisma.service.delete({ where: { id } });
    res.json({ message: 'حذف شد' });
  } catch (error) {
    console.error('[services] delete error:', error);
    res.status(500).json({ error: 'حذف خدمت ناموفق بود' });
  }
});

export default router;
