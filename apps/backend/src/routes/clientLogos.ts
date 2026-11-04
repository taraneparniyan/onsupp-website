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

// GET /api/v1/client-logos (Public - only active & published)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const logos = await prisma.clientLogo.findMany({
      where: {
        isActive: true,
        status: ContentStatus.PUBLISHED,
      },
      orderBy: { position: 'asc' },
    });
    res.json(logos);
  } catch (error) {
    console.error('[client-logos] public list error:', error);
    res.status(500).json({ error: 'خطا در دریافت لوگوی همکاران' });
  }
});

// GET /api/v1/client-logos/admin (Admin only - includes all)
router.get('/admin', authenticate, requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const logos = await prisma.clientLogo.findMany({
      orderBy: { position: 'asc' },
    });
    res.json(logos);
  } catch (error) {
    console.error('[client-logos] admin list error:', error);
    res.status(500).json({ error: 'خطا در دریافت لیست کامل لوگوها' });
  }
});

// PUT /api/v1/client-logos/reorder (Admin only - batch reorder)
router.put('/reorder', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'آرایه items الزامی است' });
    }

    await prisma.$transaction(
      items.map((item: { id: number; position: number }) =>
        prisma.clientLogo.update({
          where: { id: Number(item.id) },
          data: { position: Number(item.position) },
        })
      )
    );

    triggerRevalidation({ path: '/' }).catch(() => {});
    res.json({ message: 'ترتیب لوگوها با موفقیت ذخیره شد' });
  } catch (error) {
    console.error('[client-logos] reorder error:', error);
    res.status(500).json({ error: 'خطا در تغییر ترتیب لوگوها' });
  }
});

// GET /api/v1/client-logos/:id
router.get('/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر است' });
    }

    const item = await prisma.clientLogo.findUnique({ where: { id } });
    if (!item) {
      return res.status(404).json({ error: 'لوگوی مورد نظر یافت نشد' });
    }

    const isAdmin = req.user && ['SUPER_ADMIN', 'ADMIN'].includes(req.user.role);
    if (!isAdmin && (!item.isActive || item.status !== ContentStatus.PUBLISHED)) {
      return res.status(404).json({ error: 'لوگوی مورد نظر یافت نشد یا در دسترس نیست' });
    }

    res.json(item);
  } catch (error) {
    console.error('[client-logos] get single error:', error);
    res.status(500).json({ error: 'خطا در دریافت اطلاعات لوگو' });
  }
});

// POST /api/v1/client-logos (Admin only)
router.post('/', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      nameFa,
      nameEn = '',
      imageUrl,
      altFa = '',
      altEn = '',
      websiteUrl,
      width = 200,
      height = 100,
      isActive = true,
      status = 'PUBLISHED',
      position,
    } = req.body;

    if (!nameFa || !imageUrl) {
      return res.status(400).json({ error: 'نام و آدرس تصویر لوگو الزامی هستند' });
    }

    const count = await prisma.clientLogo.count();
    const finalPosition = typeof position === 'number' ? position : count;

    const logo = await prisma.clientLogo.create({
      data: {
        nameFa,
        nameEn,
        imageUrl,
        altFa: altFa || nameFa,
        altEn: altEn || nameEn,
        websiteUrl: websiteUrl || null,
        width: Number(width) || 200,
        height: Number(height) || 100,
        isActive: Boolean(isActive),
        status: status in ContentStatus ? (status as ContentStatus) : ContentStatus.PUBLISHED,
        position: finalPosition,
      },
    });

    await logAudit({
      userId: req.user?.id,
      action: 'CREATE_CLIENT_LOGO',
      targetId: logo.id,
      details: `Created logo: ${logo.nameFa}`,
      ipAddress: req.ip,
    });

    triggerRevalidation({ path: '/' }).catch(() => {});
    res.status(201).json(logo);
  } catch (error) {
    console.error('[client-logos] create error:', error);
    res.status(500).json({ error: 'خطا در ثبت لوگوی جدید' });
  }
});

// PUT /api/v1/client-logos/:id (Admin only)
router.put('/:id', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر است' });
    }

    const {
      nameFa,
      nameEn,
      imageUrl,
      altFa,
      altEn,
      websiteUrl,
      width,
      height,
      isActive,
      status,
      position,
    } = req.body;

    const data: Record<string, any> = {};
    if (nameFa !== undefined) data.nameFa = nameFa;
    if (nameEn !== undefined) data.nameEn = nameEn;
    if (imageUrl !== undefined) data.imageUrl = imageUrl;
    if (altFa !== undefined) data.altFa = altFa;
    if (altEn !== undefined) data.altEn = altEn;
    if (websiteUrl !== undefined) data.websiteUrl = websiteUrl;
    if (width !== undefined) data.width = Number(width);
    if (height !== undefined) data.height = Number(height);
    if (isActive !== undefined) data.isActive = Boolean(isActive);
    if (status !== undefined && status in ContentStatus) data.status = status as ContentStatus;
    if (position !== undefined) data.position = Number(position);

    const updated = await prisma.clientLogo.update({
      where: { id },
      data,
    });

    await logAudit({
      userId: req.user?.id,
      action: 'UPDATE_CLIENT_LOGO',
      targetId: id,
      details: `Updated logo: ${updated.nameFa}`,
      ipAddress: req.ip,
    });

    triggerRevalidation({ path: '/' }).catch(() => {});
    res.json(updated);
  } catch (error) {
    console.error('[client-logos] update error:', error);
    res.status(500).json({ error: 'خطا در ویرایش اطلاعات لوگو' });
  }
});

// DELETE /api/v1/client-logos/:id (Admin only)
router.delete('/:id', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر است' });
    }

    const deleted = await prisma.clientLogo.delete({ where: { id } });

    await logAudit({
      userId: req.user?.id,
      action: 'DELETE_CLIENT_LOGO',
      targetId: id,
      details: `Deleted logo: ${deleted.nameFa}`,
      ipAddress: req.ip,
    });

    triggerRevalidation({ path: '/' }).catch(() => {});
    res.json({ message: 'لوگو با موفقیت حذف گردید' });
  } catch (error) {
    console.error('[client-logos] delete error:', error);
    res.status(500).json({ error: 'خطا در حذف لوگو' });
  }
});

export default router;
