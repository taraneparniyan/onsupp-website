import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

const CONTENT_FIELDS = [
  'eyebrowFa',
  'eyebrowEn',
  'titleFa',
  'titleEn',
  'ctaFa',
  'ctaEn',
  'ctaLink',
  'imageUrl',
  'imageAlt',
  'subTitleFa',
  'subTitleEn',
  'paragraphFa',
  'paragraphEn',
] as const;

// GET /api/v1/about  (public — content + features)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const content = await prisma.aboutContent.findFirst({ where: { id: 1 } });
    const features = await prisma.feature.findMany({ orderBy: { position: 'asc' } });
    res.json({ content, features });
  } catch (error) {
    console.error('[about] get error:', error);
    res.status(500).json({ error: 'دریافت محتوای درباره ما ناموفق بود' });
  }
});

// PUT /api/v1/about  (admin — upsert content singleton id=1)
router.put('/', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data: any = { id: 1 };
    for (const field of CONTENT_FIELDS) {
      if (req.body[field] !== undefined) {
        data[field] = req.body[field];
      }
    }
    const content = await prisma.aboutContent.upsert({
      where: { id: 1 },
      update: data,
      create: data,
    });
    res.json(content);
  } catch (error) {
    console.error('[about] update error:', error);
    res.status(500).json({ error: 'ذخیره محتوای درباره ما ناموفق بود' });
  }
});

// POST /api/v1/about/features  (admin — create feature)
router.post('/features', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { titleFa = '', titleEn = '', icon = 'team', position } = req.body;
    const count = await prisma.feature.count();
    const feature = await prisma.feature.create({
      data: { titleFa, titleEn, icon, position: position ?? count },
    });
    res.status(201).json(feature);
  } catch (error) {
    console.error('[about] feature create error:', error);
    res.status(500).json({ error: 'ایجاد ویژگی ناموفق بود' });
  }
});

// PUT /api/v1/about/features/:id  (admin — update feature)
router.put('/features/:id', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر' });
    }
    const data: any = {};
    for (const field of ['titleFa', 'titleEn', 'icon', 'position']) {
      if (req.body[field] !== undefined) data[field] = req.body[field];
    }
    const feature = await prisma.feature.update({ where: { id }, data });
    res.json(feature);
  } catch (error) {
    console.error('[about] feature update error:', error);
    res.status(500).json({ error: 'ذخیره ویژگی ناموفق بود' });
  }
});

// DELETE /api/v1/about/features/:id  (admin — delete feature)
router.delete('/features/:id', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر' });
    }
    await prisma.feature.delete({ where: { id } });
    res.json({ message: 'حذف شد' });
  } catch (error) {
    console.error('[about] feature delete error:', error);
    res.status(500).json({ error: 'حذف ویژگی ناموفق بود' });
  }
});

export default router;