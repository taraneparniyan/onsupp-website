import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

function slideData(body: any) {
  const data: any = {};
  for (const key of [
    'title',
    'titleEn',
    'subtitle',
    'subtitleEn',
    'ctaText',
    'ctaTextEn',
    'ctaLink',
    'ctaText2',
    'ctaText2En',
    'ctaLink2',
    'imageUrl',
    'imageAlt',
    'position',
  ]) {
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

// GET /api/v1/hero  (public — ordered slides)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const slides = await prisma.heroSlide.findMany({ orderBy: { position: 'asc' } });
    res.json(slides);
  } catch (error) {
    console.error('[hero] list error:', error);
    res.status(500).json({ error: 'دریافت اسلایدهای هیرو ناموفق بود' });
  }
});

// POST /api/v1/hero  (admin — create slide)
router.post('/', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = slideData(req.body);
    const count = await prisma.heroSlide.count();
    if (data.position === undefined) {
      data.position = count;
    }
    const slide = await prisma.heroSlide.create({ data });
    res.status(201).json(slide);
  } catch (error) {
    if (error instanceof Error && error.message === 'ALT_REQUIRED') {
      return res.status(400).json({ error: 'برای تصویر، متن جایگزین (Alt) الزامی است' });
    }
    console.error('[hero] create error:', error);
    res.status(500).json({ error: 'ایجاد اسلاید هیرو ناموفق بود' });
  }
});

// PUT /api/v1/hero/:id  (admin — update slide)
router.put('/:id', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر' });
    }
    const data = slideData(req.body);
    const slide = await prisma.heroSlide.update({ where: { id }, data });
    res.json(slide);
  } catch (error) {
    if (error instanceof Error && error.message === 'ALT_REQUIRED') {
      return res.status(400).json({ error: 'برای تصویر، متن جایگزین (Alt) الزامی است' });
    }
    console.error('[hero] update error:', error);
    res.status(500).json({ error: 'ذخیره اسلاید هیرو ناموفق بود' });
  }
});

// DELETE /api/v1/hero/:id  (admin — delete slide)
router.delete('/:id', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر' });
    }
    await prisma.heroSlide.delete({ where: { id } });
    res.json({ message: 'حذف شد' });
  } catch (error) {
    console.error('[hero] delete error:', error);
    res.status(500).json({ error: 'حذف اسلاید هیرو ناموفق بود' });
  }
});

export default router;
