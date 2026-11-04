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

// GET /api/v1/client-partners (Public - only active & published)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const items = await prisma.clientPartner.findMany({
      where: {
        isActive: true,
        status: ContentStatus.PUBLISHED,
      },
      orderBy: { position: 'asc' },
    });
    res.json(items);
  } catch (error) {
    console.error('[client-partners] public list error:', error);
    res.status(500).json({ error: 'خطا در دریافت لیست مشتریان' });
  }
});

// GET /api/v1/client-partners/admin (Admin only - includes drafts and inactive)
router.get('/admin', authenticate, requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const items = await prisma.clientPartner.findMany({
      orderBy: { position: 'asc' },
    });
    res.json(items);
  } catch (error) {
    console.error('[client-partners] admin list error:', error);
    res.status(500).json({ error: 'خطا در دریافت لیست کامل مشتریان' });
  }
});

// PUT /api/v1/client-partners/reorder (Admin only - batch reorder)
router.put('/reorder', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'آرایه items الزامی است' });
    }

    await prisma.$transaction(
      items.map((item: { id: number; position: number }) =>
        prisma.clientPartner.update({
          where: { id: Number(item.id) },
          data: { position: Number(item.position) },
        })
      )
    );

    triggerRevalidation({ path: '/' }).catch(() => {});
    res.json({ message: 'ترتیب مشتریان با موفقیت ذخیره شد' });
  } catch (error) {
    console.error('[client-partners] reorder error:', error);
    res.status(500).json({ error: 'خطا در تغییر چیدمان مشتریان' });
  }
});

// GET /api/v1/client-partners/:id (Public or Admin single item)
router.get('/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر است' });
    }

    const item = await prisma.clientPartner.findUnique({
      where: { id },
    });

    if (!item) {
      return res.status(404).json({ error: 'مشتری مورد نظر یافت نشد' });
    }

    // If not authenticated admin, restrict access to published and active items only
    const isAdmin = req.user && ['SUPER_ADMIN', 'ADMIN'].includes(req.user.role);
    if (!isAdmin && (!item.isActive || item.status !== ContentStatus.PUBLISHED)) {
      return res.status(404).json({ error: 'مشتری مورد نظر یافت نشد یا در دسترس نیست' });
    }

    res.json(item);
  } catch (error) {
    console.error('[client-partners] detail error:', error);
    res.status(500).json({ error: 'خطا در دریافت جزئیات مشتری' });
  }
});

// POST /api/v1/client-partners (Admin only)
router.post('/', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      nameFa,
      nameEn = '',
      titleFa,
      titleEn = '',
      orderNumber,
      industryFa = '',
      industryEn = '',
      introFa = '',
      introEn = '',
      quoteFa,
      quoteEn,
      servicesFa = [],
      servicesEn = [],
      yearFa = '۱۴۰۳',
      yearEn = '2024',
      portraitImage,
      portraitBadgeFa,
      portraitBadgeEn,
      monogram = 'OP',
      websites = [],
      instagrams = [],
      isActive = true,
      status = 'PUBLISHED',
      position,
    } = req.body;

    if (!nameFa || !titleFa) {
      return res.status(400).json({ error: 'نام و عنوان فارسی الزامی هستند' });
    }

    const count = await prisma.clientPartner.count();
    const finalPosition = typeof position === 'number' ? position : count;
    const finalOrderNumber = orderNumber || String(count + 1).padStart(2, '0');

    const created = await prisma.clientPartner.create({
      data: {
        orderNumber: finalOrderNumber,
        nameFa,
        nameEn,
        titleFa,
        titleEn,
        industryFa,
        industryEn,
        introFa,
        introEn,
        quoteFa,
        quoteEn,
        servicesFa: Array.isArray(servicesFa) ? servicesFa : [],
        servicesEn: Array.isArray(servicesEn) ? servicesEn : [],
        yearFa,
        yearEn,
        portraitImage,
        portraitBadgeFa,
        portraitBadgeEn,
        monogram,
        websites,
        instagrams,
        isActive: Boolean(isActive),
        status: status in ContentStatus ? (status as ContentStatus) : ContentStatus.PUBLISHED,
        position: finalPosition,
      },
    });

    await logAudit({
      userId: req.user?.id,
      action: 'CREATE_CLIENT_PARTNER',
      targetId: created.id,
      details: `Created partner: ${created.nameFa}`,
      ipAddress: req.ip,
    });

    triggerRevalidation({ path: '/' }).catch(() => {});
    res.status(201).json(created);
  } catch (error) {
    console.error('[client-partners] create error:', error);
    res.status(500).json({ error: 'خطا در ثبت مشتری جدید' });
  }
});

// PUT /api/v1/client-partners/:id (Admin only)
router.put('/:id', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر است' });
    }

    const {
      nameFa,
      nameEn,
      titleFa,
      titleEn,
      orderNumber,
      industryFa,
      industryEn,
      introFa,
      introEn,
      quoteFa,
      quoteEn,
      servicesFa,
      servicesEn,
      yearFa,
      yearEn,
      portraitImage,
      portraitBadgeFa,
      portraitBadgeEn,
      monogram,
      websites,
      instagrams,
      isActive,
      status,
      position,
    } = req.body;

    const data: Record<string, any> = {};
    if (nameFa !== undefined) data.nameFa = nameFa;
    if (nameEn !== undefined) data.nameEn = nameEn;
    if (titleFa !== undefined) data.titleFa = titleFa;
    if (titleEn !== undefined) data.titleEn = titleEn;
    if (orderNumber !== undefined) data.orderNumber = orderNumber;
    if (industryFa !== undefined) data.industryFa = industryFa;
    if (industryEn !== undefined) data.industryEn = industryEn;
    if (introFa !== undefined) data.introFa = introFa;
    if (introEn !== undefined) data.introEn = introEn;
    if (quoteFa !== undefined) data.quoteFa = quoteFa;
    if (quoteEn !== undefined) data.quoteEn = quoteEn;
    if (servicesFa !== undefined) data.servicesFa = Array.isArray(servicesFa) ? servicesFa : [];
    if (servicesEn !== undefined) data.servicesEn = Array.isArray(servicesEn) ? servicesEn : [];
    if (yearFa !== undefined) data.yearFa = yearFa;
    if (yearEn !== undefined) data.yearEn = yearEn;
    if (portraitImage !== undefined) data.portraitImage = portraitImage;
    if (portraitBadgeFa !== undefined) data.portraitBadgeFa = portraitBadgeFa;
    if (portraitBadgeEn !== undefined) data.portraitBadgeEn = portraitBadgeEn;
    if (monogram !== undefined) data.monogram = monogram;
    if (websites !== undefined) data.websites = websites;
    if (instagrams !== undefined) data.instagrams = instagrams;
    if (isActive !== undefined) data.isActive = Boolean(isActive);
    if (status !== undefined && status in ContentStatus) data.status = status as ContentStatus;
    if (position !== undefined) data.position = Number(position);

    const updated = await prisma.clientPartner.update({
      where: { id },
      data,
    });

    await logAudit({
      userId: req.user?.id,
      action: 'UPDATE_CLIENT_PARTNER',
      targetId: id,
      details: `Updated partner: ${updated.nameFa}`,
      ipAddress: req.ip,
    });

    triggerRevalidation({ path: '/' }).catch(() => {});
    res.json(updated);
  } catch (error) {
    console.error('[client-partners] update error:', error);
    res.status(500).json({ error: 'خطا در به‌روزرسانی اطلاعات مشتری' });
  }
});

// DELETE /api/v1/client-partners/:id (Admin only)
router.delete('/:id', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر است' });
    }

    const deleted = await prisma.clientPartner.delete({
      where: { id },
    });

    await logAudit({
      userId: req.user?.id,
      action: 'DELETE_CLIENT_PARTNER',
      targetId: id,
      details: `Deleted partner: ${deleted.nameFa}`,
      ipAddress: req.ip,
    });

    triggerRevalidation({ path: '/' }).catch(() => {});
    res.json({ message: 'مشتری با موفقیت حذف گردید' });
  } catch (error) {
    console.error('[client-partners] delete error:', error);
    res.status(500).json({ error: 'خطا در حذف مشتری' });
  }
});

export default router;
