import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import {
  authenticate,
  requireContentManager,
  AuthenticatedRequest,
} from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

const testimonialInputSchema = z.object({
  quoteFa: z.string().trim().min(3, 'متن نظر فارسی الزامی است و باید حداقل ۳ کاراکتر باشد'),
  quoteEn: z.string().trim().optional().default(''),
  authorFa: z.string().trim().min(2, 'نام نویسنده الزامی است و باید حداقل ۲ کاراکتر باشد'),
  authorEn: z.string().trim().optional().default(''),
  roleFa: z.string().trim().optional().default(''),
  roleEn: z.string().trim().optional().default(''),
  companyFa: z.string().trim().nullable().optional(),
  companyEn: z.string().trim().nullable().optional(),
  serviceTagFa: z.string().trim().nullable().optional(),
  serviceTagEn: z.string().trim().nullable().optional(),
  highlightFa: z.string().trim().nullable().optional(),
  highlightEn: z.string().trim().nullable().optional(),
  avatarUrl: z.string().trim().nullable().optional(),
  isActive: z.boolean().optional().default(true),
  position: z.number().int().optional(),
});

const testimonialUpdateSchema = testimonialInputSchema.partial();

function parseId(param: string | string[] | undefined): number {
  const val = Array.isArray(param) ? param[0] : param;
  return val ? parseInt(val, 10) : NaN;
}

// GET /api/v1/testimonials
// Public: returns active testimonials ordered by position
// Admin / Content Manager: can pass ?all=true to receive all (including inactive)
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const isManager = req.user && ['SUPER_ADMIN', 'ADMIN', 'CONTENT_SEO_MANAGER'].includes(req.user.role);
    const showAll = isManager && (req.query.all === 'true' || req.query.includeInactive === 'true');

    const testimonials = await prisma.testimonial.findMany({
      where: showAll ? undefined : { isActive: true },
      orderBy: { position: 'asc' },
    });

    res.json(testimonials);
  } catch (error) {
    console.error('[testimonials] fetch error:', error);
    res.status(500).json({ error: 'دریافت نظرات مشتریان ناموفق بود' });
  }
});

// GET /api/v1/testimonials/:id
router.get('/:id', async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر است' });
    }

    const item = await prisma.testimonial.findUnique({ where: { id } });
    if (!item) {
      return res.status(404).json({ error: 'نظر مورد نظر یافت نشد' });
    }

    res.json(item);
  } catch (error) {
    console.error('[testimonials] single fetch error:', error);
    res.status(500).json({ error: 'دریافت جزئیات نظر ناموفق بود' });
  }
});

// POST /api/v1/testimonials (Authenticated Admin / Content Manager)
router.post('/', authenticate, requireContentManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = testimonialInputSchema.safeParse(req.body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'اطلاعات ارسالی نامعتبر است';
      return res.status(400).json({ error: firstError, details: parsed.error.issues });
    }

    const data = parsed.data;
    if (data.position === undefined) {
      const count = await prisma.testimonial.count();
      data.position = count;
    }

    const created = await prisma.testimonial.create({
      data: {
        quoteFa: data.quoteFa,
        quoteEn: data.quoteEn || '',
        authorFa: data.authorFa,
        authorEn: data.authorEn || '',
        roleFa: data.roleFa || '',
        roleEn: data.roleEn || '',
        companyFa: data.companyFa || null,
        companyEn: data.companyEn || null,
        serviceTagFa: data.serviceTagFa || null,
        serviceTagEn: data.serviceTagEn || null,
        highlightFa: data.highlightFa || null,
        highlightEn: data.highlightEn || null,
        avatarUrl: data.avatarUrl || null,
        isActive: data.isActive ?? true,
        position: data.position,
      },
    });

    res.status(201).json(created);
  } catch (error) {
    console.error('[testimonials] create error:', error);
    res.status(500).json({ error: 'ثبت نظر مشتری ناموفق بود' });
  }
});

// PUT /api/v1/testimonials/:id (Authenticated Admin / Content Manager)
router.put('/:id', authenticate, requireContentManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر است' });
    }

    const parsed = testimonialUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'اطلاعات ارسالی نامعتبر است';
      return res.status(400).json({ error: firstError, details: parsed.error.issues });
    }

    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'نظر مورد نظر یافت نشد' });
    }

    const updated = await prisma.testimonial.update({
      where: { id },
      data: parsed.data,
    });

    res.json(updated);
  } catch (error) {
    console.error('[testimonials] update error:', error);
    res.status(500).json({ error: 'به‌روزرسانی نظر ناموفق بود' });
  }
});

// PATCH /api/v1/testimonials/:id/toggle-active (Authenticated Admin / Content Manager)
router.patch('/:id/toggle-active', authenticate, requireContentManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر است' });
    }

    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'نظر مورد نظر یافت نشد' });
    }

    const updated = await prisma.testimonial.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    res.json(updated);
  } catch (error) {
    console.error('[testimonials] toggle-active error:', error);
    res.status(500).json({ error: 'تغییر وضعیت نمایش ناموفق بود' });
  }
});

// DELETE /api/v1/testimonials/:id (Authenticated Admin / Content Manager)
router.delete('/:id', authenticate, requireContentManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر است' });
    }

    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'نظر مورد نظر یافت نشد' });
    }

    await prisma.testimonial.delete({ where: { id } });
    res.json({ message: 'نظر با موفقیت حذف شد' });
  } catch (error) {
    console.error('[testimonials] delete error:', error);
    res.status(500).json({ error: 'حذف نظر ناموفق بود' });
  }
});

export default router;
