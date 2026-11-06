import { Router, Request, Response } from 'express';
import { PrismaClient, PublicationStatus } from '@prisma/client';
import { authenticate, requireContentManager, AuthenticatedRequest } from '../middleware/auth.js';
import { triggerRevalidation } from '../services/revalidateService.js';

const router = Router();
const prisma = new PrismaClient();

/**
 * Triggers Next.js cache invalidation for service archive, homepage, and affected service detail slugs.
 * Logs warnings safely without exposing credentials and never interrupts or fails the parent database transaction.
 */
async function revalidateServiceCache(slugs: string[]) {
  const cleanSlugs = Array.from(new Set(slugs.map((s) => (s || '').trim()).filter(Boolean)));
  const tags = ['services', 'homepage', ...cleanSlugs.map((s) => `service-${s}`)];
  const paths = ['/services', '/', ...cleanSlugs.map((s) => `/services/${s}`)];

  try {
    const result = await triggerRevalidation({ tags, paths });
    if (!result.success) {
      console.warn('[services] Revalidation dispatch returned non-success:', result.message, result.error || '');
    }
  } catch (err: any) {
    console.warn('[services] Revalidation dispatch warning (database mutation preserved):', err.message || err);
  }
}

const SERVICE_FIELDS = [
  'slug',
  'title',
  'titleEn',
  'subtitle',
  'subtitleEn',
  'tagFa',
  'tagEn',
  'headlineFa',
  'headlineEn',
  'detailedNarrativeFa',
  'detailedNarrativeEn',
  'businessValueTitleFa',
  'businessValueTitleEn',
  'businessValueFa',
  'businessValueEn',
  'imageUrl',
  'imageAlt',
  'coverImage',
  'gallery',
  'iconType',
  'badgeAccentFa',
  'badgeAccentEn',
  'ctaLabelFa',
  'ctaLabelEn',
  'subservices',
  'deliverablesFa',
  'deliverablesEn',
  'metrics',
  'relatedLinks',
  'metaTitleFa',
  'metaTitleEn',
  'metaDescFa',
  'metaDescEn',
  'keywords',
  'position',
  'isPublished',
  'status',
] as const;

function extractServiceData(body: any) {
  const data: Record<string, any> = {};
  for (const key of SERVICE_FIELDS) {
    if (body[key] !== undefined) {
      if (key === 'imageUrl' || key === 'coverImage') {
        data[key] = body[key] ? String(body[key]) : null;
      } else if (key === 'imageAlt') {
        data[key] = body[key] ? String(body[key]) : '';
      } else {
        data[key] = body[key];
      }
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

// GET /api/v1/services (Public — returns published services only)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const services = await prisma.service.findMany({
      where: {
        isPublished: true,
        status: PublicationStatus.PUBLISHED,
      },
      orderBy: { position: 'asc' },
    });
    res.json(services);
  } catch (error) {
    console.error('[services] public list error:', error);
    res.status(500).json({ error: 'دریافت خدمات ناموفق بود' });
  }
});

// GET /api/v1/services/all (Admin — returns all services including drafts)
router.get('/all', authenticate, requireContentManager, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { position: 'asc' },
    });
    res.json(services);
  } catch (error) {
    console.error('[services] admin list error:', error);
    res.status(500).json({ error: 'دریافت لیست مدیریت خدمات ناموفق بود' });
  }
});

// GET /api/v1/services/:slugOrId (Public / Preview — single service lookup by slug or ID)
router.get('/:slugOrId', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const raw = String(req.params.slugOrId).trim();
    const numericId = parseInt(raw, 10);

    let service = null;
    if (!Number.isNaN(numericId)) {
      service = await prisma.service.findUnique({ where: { id: numericId } });
    }
    if (!service) {
      service = await prisma.service.findFirst({ where: { slug: raw } });
    }

    if (!service) {
      return res.status(404).json({ error: 'خدمت مورد نظر یافت نشد' });
    }

    // Public vs. Draft isolation
    const isManager = req.user && ['SUPER_ADMIN', 'ADMIN', 'CONTENT_SEO_MANAGER'].includes(req.user.role);
    if ((!service.isPublished || service.status !== PublicationStatus.PUBLISHED) && !isManager) {
      return res.status(404).json({ error: 'خدمت مورد نظر یافت نشد' });
    }

    res.json(service);
  } catch (error) {
    console.error('[services] single fetch error:', error);
    res.status(500).json({ error: 'دریافت جزئیات خدمت ناموفق بود' });
  }
});

// POST /api/v1/services (Admin — create service)
router.post('/', authenticate, requireContentManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = extractServiceData(req.body);

    if (!data.title && !data.titleEn) {
      return res.status(400).json({ error: 'عنوان خدمت الزامی است' });
    }

    if (!data.slug) {
      data.slug = String(data.titleEn || data.title)
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
        .replace(/^-+|-+$/g, '') || `service-${Date.now()}`;
    }

    // Check slug uniqueness
    const conflict = await prisma.service.findFirst({ where: { slug: data.slug } });
    if (conflict) {
      data.slug = `${data.slug}-${Date.now()}`;
    }

    if (data.position === undefined) {
      data.position = await prisma.service.count();
    }

    const service = await prisma.service.create({ data: data as any });

    // Audit Log
    if (req.user?.id) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'CREATE_SERVICE',
          targetId: service.id,
          details: `Created service "${service.title}" (${service.slug})`,
          ipAddress: req.ip || null,
        },
      });
    }

    // Trigger on-demand cache revalidation for services archive, homepage and affected detail slug
    await revalidateServiceCache([service.slug]);

    res.status(201).json(service);
  } catch (error) {
    console.error('[services] create error:', error);
    res.status(500).json({ error: 'ایجاد خدمت ناموفق بود' });
  }
});

// PUT /api/v1/services/:id (Admin — update service)
router.put('/:id', authenticate, requireContentManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر است' });
    }

    const data = extractServiceData(req.body);

    if (data.slug) {
      const conflict = await prisma.service.findFirst({
        where: { slug: data.slug, NOT: { id } },
      });
      if (conflict) {
        return res.status(400).json({ error: 'این نامک (slug) قبلاً برای خدمت دیگری ثبت شده است' });
      }
    }

    const existing = await prisma.service.findUnique({
      where: { id },
      select: { id: true, slug: true },
    });

    const service = await prisma.service.update({
      where: { id },
      data: data as any,
    });

    // Audit Log
    if (req.user?.id) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'UPDATE_SERVICE',
          targetId: service.id,
          details: `Updated service "${service.title}"`,
          ipAddress: req.ip || null,
        },
      });
    }

    // Trigger on-demand cache revalidation for services, new slug and previous slug if changed
    const slugsToPurge = [service.slug];
    if (existing?.slug && existing.slug !== service.slug) {
      slugsToPurge.push(existing.slug);
    }
    await revalidateServiceCache(slugsToPurge);

    res.json(service);
  } catch (error) {
    console.error('[services] update error:', error);
    res.status(500).json({ error: 'ذخیره خدمت ناموفق بود' });
  }
});

// DELETE /api/v1/services/:id (Admin — delete service)
router.delete('/:id', authenticate, requireContentManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر است' });
    }

    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'خدمت مورد نظر یافت نشد' });
    }

    const deletedSlug = existing.slug;
    await prisma.service.delete({ where: { id } });

    // Audit Log
    if (req.user?.id) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'DELETE_SERVICE',
          targetId: id,
          details: `Deleted service "${existing.title}"`,
          ipAddress: req.ip || null,
        },
      });
    }

    // Trigger on-demand cache revalidation for services and deleted slug
    await revalidateServiceCache(deletedSlug ? [deletedSlug] : []);

    res.json({ message: 'خدمت با موفقیت حذف شد' });
  } catch (error) {
    console.error('[services] delete error:', error);
    res.status(500).json({ error: 'حذف خدمت ناموفق بود' });
  }
});

export default router;
