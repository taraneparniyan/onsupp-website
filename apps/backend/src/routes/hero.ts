import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireContentManager, AuthenticatedRequest } from '../middleware/auth.js';
import { triggerRevalidation } from '../services/revalidateService.js';

const router = Router();
const prisma = new PrismaClient();

const CTA2_DISABLED_PREFIX = '__DISABLED__::';

function formatHeroSlide(slide: any) {
  if (!slide) return slide;
  const rawLink2 = typeof slide.ctaLink2 === 'string' ? slide.ctaLink2 : '';
  const cta2Enabled = !rawLink2.startsWith(CTA2_DISABLED_PREFIX);
  const ctaLink2 = cta2Enabled ? rawLink2 : rawLink2.slice(CTA2_DISABLED_PREFIX.length);
  return {
    ...slide,
    ctaLink2,
    cta2Enabled,
  };
}

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
    'isPublished',
    'status',
  ]) {
    if (body[key] !== undefined) {
      if (key === 'imageUrl') {
        data[key] = body[key] ? String(body[key]) : null;
      } else if (key === 'imageAlt') {
        data[key] = body[key] !== undefined && body[key] !== null ? String(body[key]) : '';
      } else if (key === 'isPublished') {
        data[key] = Boolean(body[key]);
      } else if (key === 'status') {
        data[key] = ['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(body[key]) ? body[key] : 'PUBLISHED';
      } else {
        data[key] = body[key];
      }
    }
  }

  if (body.cta2Enabled !== undefined) {
    const cleanLink2 = String(data.ctaLink2 ?? body.ctaLink2 ?? '').replace(CTA2_DISABLED_PREFIX, '').trim();
    data.ctaLink2 = body.cta2Enabled ? cleanLink2 : `${CTA2_DISABLED_PREFIX}${cleanLink2}`;
  }

  return data;
}

// GET /api/v1/hero  (public — published slides only)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const slides = await prisma.heroSlide.findMany({
      where: {
        isPublished: true,
        status: 'PUBLISHED',
      },
      orderBy: { position: 'asc' },
    });
    res.json(slides.map(formatHeroSlide));
  } catch (error) {
    console.error('[hero] list error:', error);
    res.status(500).json({ error: 'دریافت اسلایدهای هیرو ناموفق بود' });
  }
});

// GET /api/v1/hero/all  (admin / CMS — all slides including drafts)
router.get('/all', authenticate, requireContentManager, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const slides = await prisma.heroSlide.findMany({
      orderBy: { position: 'asc' },
    });
    res.json(slides.map(formatHeroSlide));
  } catch (error) {
    console.error('[hero] admin list error:', error);
    res.status(500).json({ error: 'دریافت تمام اسلایدهای هیرو ناموفق بود' });
  }
});

// POST /api/v1/hero  (admin — create slide)
router.post('/', authenticate, requireContentManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = slideData(req.body);
    const count = await prisma.heroSlide.count();
    if (data.position === undefined) {
      data.position = count;
    }
    const slide = await prisma.heroSlide.create({ data });
    await triggerRevalidation({ tags: ['hero', 'homepage'], paths: ['/'] }).catch(() => {});
    res.status(201).json(formatHeroSlide(slide));
  } catch (error) {
    if (error instanceof Error && error.message === 'ALT_REQUIRED') {
      return res.status(400).json({ error: 'برای تصویر، متن جایگزین (Alt) الزامی است' });
    }
    console.error('[hero] create error:', error);
    res.status(500).json({ error: 'ایجاد اسلاید هیرو ناموفق بود' });
  }
});

// PUT /api/v1/hero/:id  (admin — update slide)
router.put('/:id', authenticate, requireContentManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر' });
    }
    const data = slideData(req.body);
    const slide = await prisma.heroSlide.update({ where: { id }, data });
    await triggerRevalidation({ tags: ['hero', 'homepage'], paths: ['/'] }).catch(() => {});
    res.json(formatHeroSlide(slide));
  } catch (error) {
    if (error instanceof Error && error.message === 'ALT_REQUIRED') {
      return res.status(400).json({ error: 'برای تصویر، متن جایگزین (Alt) الزامی است' });
    }
    console.error('[hero] update error:', error);
    res.status(500).json({ error: 'ذخیره اسلاید هیرو ناموفق بود' });
  }
});

// DELETE /api/v1/hero/:id  (admin — delete slide)
router.delete('/:id', authenticate, requireContentManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر' });
    }
    await prisma.heroSlide.delete({ where: { id } });
    await triggerRevalidation({ tags: ['hero', 'homepage'], paths: ['/'] }).catch(() => {});
    res.json({ message: 'حذف شد' });
  } catch (error) {
    console.error('[hero] delete error:', error);
    res.status(500).json({ error: 'حذف اسلاید هیرو ناموفق بود' });
  }
});

export default router;
