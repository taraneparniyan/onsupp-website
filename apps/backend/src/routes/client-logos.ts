import { Router, Request, Response } from 'express';
import { PrismaClient, PublicationStatus } from '@prisma/client';
import { authenticate, requireContentManager, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

const LOGO_FIELDS = [
  'key',
  'nameFa',
  'nameEn',
  'logoUrl',
  'darkLogoUrl',
  'altFa',
  'altEn',
  'width',
  'height',
  'linkUrl',
  'position',
  'isPublished',
  'status',
] as const;

function extractLogoData(body: any) {
  const data: Record<string, any> = {};
  for (const field of LOGO_FIELDS) {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  }

  if (data.status) {
    data.isPublished = data.status === PublicationStatus.PUBLISHED;
  } else if (data.isPublished !== undefined) {
    data.status = data.isPublished ? PublicationStatus.PUBLISHED : PublicationStatus.DRAFT;
  }

  return data;
}

// GET /api/v1/client-logos (Public — published logos for marquee)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const logos = await prisma.clientLogo.findMany({
      where: {
        isPublished: true,
        status: PublicationStatus.PUBLISHED,
      },
      orderBy: { position: 'asc' },
    });
    res.json(logos);
  } catch (error) {
    console.error('[client-logos] list error:', error);
    res.status(500).json({ error: 'خطا در دریافت لوگوهای همکاران' });
  }
});

// GET /api/v1/client-logos/all (Admin — all logos)
router.get('/all', authenticate, requireContentManager, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const logos = await prisma.clientLogo.findMany({
      orderBy: { position: 'asc' },
    });
    res.json(logos);
  } catch (error) {
    console.error('[client-logos] admin list error:', error);
    res.status(500).json({ error: 'خطا در دریافت لیست مدیریت لوگوها' });
  }
});

// POST /api/v1/client-logos (Admin — create logo)
router.post('/', authenticate, requireContentManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = extractLogoData(req.body);

    if (!data.nameFa || !data.logoUrl) {
      return res.status(400).json({ error: 'نام و نشانی فایل لوگو الزامی است' });
    }

    if (!data.key) {
      data.key = String(data.nameEn || data.nameFa)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || `logo-${Date.now()}`;
    }

    // Ensure key uniqueness
    const conflict = await prisma.clientLogo.findUnique({ where: { key: data.key } });
    if (conflict) {
      data.key = `${data.key}-${Date.now()}`;
    }

    if (data.position === undefined) {
      data.position = await prisma.clientLogo.count();
    }

    const logo = await prisma.clientLogo.create({ data: data as any });

    // Audit Log
    if (req.user?.id) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'CREATE_CLIENT_LOGO',
          targetId: logo.id,
          details: `Created client logo "${logo.nameFa}"`,
          ipAddress: req.ip || null,
        },
      });
    }

    res.status(201).json(logo);
  } catch (error) {
    console.error('[client-logos] create error:', error);
    res.status(500).json({ error: 'افزودن لوگو ناموفق بود' });
  }
});

// PUT /api/v1/client-logos/:id (Admin — update logo)
router.put('/:id', authenticate, requireContentManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر است' });
    }

    const data = extractLogoData(req.body);

    if (data.key) {
      const conflict = await prisma.clientLogo.findFirst({
        where: { key: data.key, NOT: { id } },
      });
      if (conflict) {
        return res.status(400).json({ error: 'این شناسه (key) قبلاً استفاده شده است' });
      }
    }

    const logo = await prisma.clientLogo.update({
      where: { id },
      data: data as any,
    });

    // Audit Log
    if (req.user?.id) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'UPDATE_CLIENT_LOGO',
          targetId: logo.id,
          details: `Updated client logo "${logo.nameFa}"`,
          ipAddress: req.ip || null,
        },
      });
    }

    res.json(logo);
  } catch (error) {
    console.error('[client-logos] update error:', error);
    res.status(500).json({ error: 'ذخیره لوگو ناموفق بود' });
  }
});

// DELETE /api/v1/client-logos/:id (Admin — delete logo)
router.delete('/:id', authenticate, requireContentManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر است' });
    }

    const existing = await prisma.clientLogo.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'لوگو یافت نشد' });
    }

    await prisma.clientLogo.delete({ where: { id } });

    // Audit Log
    if (req.user?.id) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'DELETE_CLIENT_LOGO',
          targetId: id,
          details: `Deleted client logo "${existing.nameFa}"`,
          ipAddress: req.ip || null,
        },
      });
    }

    res.json({ message: 'لوگو با موفقیت حذف شد' });
  } catch (error) {
    console.error('[client-logos] delete error:', error);
    res.status(500).json({ error: 'حذف لوگو ناموفق بود' });
  }
});

export default router;
