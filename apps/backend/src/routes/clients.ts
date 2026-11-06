import { Router, Request, Response } from 'express';
import { PrismaClient, PublicationStatus } from '@prisma/client';
import { authenticate, requireContentManager, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

const CLIENT_FIELDS = [
  'slug',
  'orderNumber',
  'nameFa',
  'nameEn',
  'titleFa',
  'titleEn',
  'industryFa',
  'industryEn',
  'introFa',
  'introEn',
  'quoteFa',
  'quoteEn',
  'yearFa',
  'yearEn',
  'monogram',
  'portraitImage',
  'portraitBadgeFa',
  'portraitBadgeEn',
  'websites',
  'instagrams',
  'servicesFa',
  'servicesEn',
  'position',
  'isFeatured',
  'isPublished',
  'status',
] as const;

function extractClientData(body: any) {
  const data: Record<string, any> = {};
  for (const field of CLIENT_FIELDS) {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  }

  // Auto-sync status and isPublished boolean
  if (data.status) {
    data.isPublished = data.status === PublicationStatus.PUBLISHED;
  } else if (data.isPublished !== undefined) {
    data.status = data.isPublished ? PublicationStatus.PUBLISHED : PublicationStatus.DRAFT;
  }

  return data;
}

// GET /api/v1/clients (Public — returns published clients only)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const clients = await prisma.clientPartner.findMany({
      where: {
        isPublished: true,
        status: PublicationStatus.PUBLISHED,
      },
      orderBy: { position: 'asc' },
    });
    res.json(clients);
  } catch (error) {
    console.error('[clients] public list error:', error);
    res.status(500).json({ error: 'خطا در دریافت لیست همکاران و کارفرمایان' });
  }
});

// GET /api/v1/clients/all (Admin — returns all clients including drafts)
router.get('/all', authenticate, requireContentManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '50'), 10)));
    const skip = (page - 1) * limit;

    const [total, clients] = await Promise.all([
      prisma.clientPartner.count(),
      prisma.clientPartner.findMany({
        orderBy: { position: 'asc' },
        skip,
        take: limit,
      }),
    ]);

    res.json({
      data: clients,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[clients] admin list error:', error);
    res.status(500).json({ error: 'خطا در دریافت لیست مدیریت همکاران' });
  }
});

// GET /api/v1/clients/:slugOrId (Public / Preview — single client lookup)
router.get('/:slugOrId', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const param = String(req.params.slugOrId).trim();
    const id = parseInt(param, 10);

    let client = null;
    if (!Number.isNaN(id)) {
      client = await prisma.clientPartner.findUnique({ where: { id } });
    }
    if (!client) {
      client = await prisma.clientPartner.findUnique({ where: { slug: param } });
    }

    if (!client) {
      return res.status(404).json({ error: 'کارفرمای مورد نظر یافت نشد' });
    }

    // Public vs. Draft isolation
    const isManager = req.user && ['SUPER_ADMIN', 'ADMIN', 'CONTENT_SEO_MANAGER'].includes(req.user.role);
    if ((!client.isPublished || client.status !== PublicationStatus.PUBLISHED) && !isManager) {
      return res.status(404).json({ error: 'کارفرمای مورد نظر یافت نشد' });
    }

    res.json(client);
  } catch (error) {
    console.error('[clients] single lookup error:', error);
    res.status(500).json({ error: 'خطا در دریافت اطلاعات کارفرما' });
  }
});

// POST /api/v1/clients (Admin — create client partner)
router.post('/', authenticate, requireContentManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = extractClientData(req.body);

    if (!data.nameFa || !data.titleFa) {
      return res.status(400).json({ error: 'نام و عنوان کارفرما به زبان فارسی الزامی است' });
    }

    if (!data.slug) {
      data.slug = String(data.nameEn || data.nameFa)
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
        .replace(/^-+|-+$/g, '') || `client-${Date.now()}`;
    }

    // Ensure slug uniqueness
    const existing = await prisma.clientPartner.findUnique({ where: { slug: data.slug } });
    if (existing) {
      data.slug = `${data.slug}-${Date.now()}`;
    }

    if (data.position === undefined) {
      data.position = await prisma.clientPartner.count();
    }

    const client = await prisma.clientPartner.create({ data: data as any });

    // Audit Log
    if (req.user?.id) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'CREATE_CLIENT_PARTNER',
          targetId: client.id,
          details: `Created client partner "${client.nameFa}" (${client.slug})`,
          ipAddress: req.ip || null,
        },
      });
    }

    res.status(201).json(client);
  } catch (error) {
    console.error('[clients] create error:', error);
    res.status(500).json({ error: 'ایجاد کارفرما ناموفق بود' });
  }
});

// PUT /api/v1/clients/:id (Admin — update client partner)
router.put('/:id', authenticate, requireContentManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر است' });
    }

    const data = extractClientData(req.body);

    // If slug is changed, ensure uniqueness
    if (data.slug) {
      const conflict = await prisma.clientPartner.findFirst({
        where: { slug: data.slug, NOT: { id } },
      });
      if (conflict) {
        return res.status(400).json({ error: 'این نامک (slug) قبلاً استفاده شده است' });
      }
    }

    const client = await prisma.clientPartner.update({
      where: { id },
      data: data as any,
    });

    // Audit Log
    if (req.user?.id) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'UPDATE_CLIENT_PARTNER',
          targetId: client.id,
          details: `Updated client partner "${client.nameFa}"`,
          ipAddress: req.ip || null,
        },
      });
    }

    res.json(client);
  } catch (error) {
    console.error('[clients] update error:', error);
    res.status(500).json({ error: 'ذخیره اطلاعات کارفرما ناموفق بود' });
  }
});

// DELETE /api/v1/clients/:id (Admin — delete client partner)
router.delete('/:id', authenticate, requireContentManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر است' });
    }

    const existing = await prisma.clientPartner.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'کارفرمای مورد نظر یافت نشد' });
    }

    await prisma.clientPartner.delete({ where: { id } });

    // Audit Log
    if (req.user?.id) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'DELETE_CLIENT_PARTNER',
          targetId: id,
          details: `Deleted client partner "${existing.nameFa}"`,
          ipAddress: req.ip || null,
        },
      });
    }

    res.json({ message: 'کارفرما با موفقیت حذف شد' });
  } catch (error) {
    console.error('[clients] delete error:', error);
    res.status(500).json({ error: 'حذف کارفرما ناموفق بود' });
  }
});

export default router;
