import { Router, Request, Response } from 'express';
import { PrismaClient, ContentStatus } from '@prisma/client';
import { authenticate, requireAdmin, AuthenticatedRequest } from '../middleware/auth.js';
import { logAudit } from '../services/auditService.js';
import { triggerRevalidation } from '../services/revalidationService.js';

const router = Router();

function revalidateServices(slug?: string) {
  triggerRevalidation({ path: "/services" }).catch(() => {});
  triggerRevalidation({ path: "/" }).catch(() => {});
  triggerRevalidation({ tag: "services" }).catch(() => {});
  if (slug) {
    triggerRevalidation({ path: `/services/${slug}` }).catch(() => {});
  }
}
const prisma = new PrismaClient();

function parseId(param: string | string[] | undefined): number {
  const val = Array.isArray(param) ? param[0] : param;
  return val ? parseInt(val, 10) : NaN;
}

// GET /api/v1/services (Public — ordered published services)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const services = await prisma.service.findMany({
      where: {
        published: true,
        status: ContentStatus.PUBLISHED,
      },
      orderBy: { position: 'asc' },
    });
    res.json(services);
  } catch (error) {
    console.error('[services] list error:', error);
    res.status(500).json({ error: 'دریافت خدمات ناموفق بود' });
  }
});

// GET /api/v1/services/admin (Admin only — all services including drafts)
router.get('/admin', authenticate, requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { position: 'asc' },
    });
    res.json(services);
  } catch (error) {
    console.error('[services] admin list error:', error);
    res.status(500).json({ error: 'دریافت لیست کامل خدمات ناموفق بود' });
  }
});

// PUT /api/v1/services/reorder (Admin only — batch reorder)
router.put('/reorder', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'آرایه items الزامی است' });
    }

    await prisma.$transaction(
      items.map((item: { id: number; position: number }) =>
        prisma.service.update({
          where: { id: Number(item.id) },
          data: { position: Number(item.position) },
        })
      )
    );

    triggerRevalidation({ path: '/services' }).catch(() => {});
    res.json({ message: 'ترتیب خدمات با موفقیت ذخیره شد' });
  } catch (error) {
    console.error('[services] reorder error:', error);
    res.status(500).json({ error: 'خطا در تغییر ترتیب خدمات' });
  }
});

// GET /api/v1/services/by-slug/:slug (Public or Admin)
router.get('/by-slug/:slug', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const slug = req.params.slug as string;
    if (!slug) {
      return res.status(400).json({ error: 'نامک (slug) نامعتبر است' });
    }

    const service = await prisma.service.findFirst({
      where: { slug: slug.trim() },
    });

    if (!service) {
      return res.status(404).json({ error: 'خدمت مورد نظر یافت نشد' });
    }

    const isAdmin = req.user && ['SUPER_ADMIN', 'ADMIN'].includes(req.user.role);
    if (!isAdmin && (!service.published || service.status !== ContentStatus.PUBLISHED)) {
      return res.status(404).json({ error: 'خدمت مورد نظر یافت نشد یا در دسترس نیست' });
    }

    res.json(service);
  } catch (error) {
    console.error('[services] by-slug error:', error);
    res.status(500).json({ error: 'خطا در دریافت مشخصات خدمت' });
  }
});

// GET /api/v1/services/:id (Public or Admin)
router.get('/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر است' });
    }

    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) {
      return res.status(404).json({ error: 'خدمت مورد نظر یافت نشد' });
    }

    const isAdmin = req.user && ['SUPER_ADMIN', 'ADMIN'].includes(req.user.role);
    if (!isAdmin && (!service.published || service.status !== ContentStatus.PUBLISHED)) {
      return res.status(404).json({ error: 'خدمت مورد نظر یافت نشد یا در دسترس نیست' });
    }

    res.json(service);
  } catch (error) {
    console.error('[services] single error:', error);
    res.status(500).json({ error: 'خطا در دریافت مشخصات خدمت' });
  }
});

// POST /api/v1/services (Admin — create service)
router.post('/', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      title,
      titleEn = '',
      subtitle = '',
      subtitleEn = '',
      slug,
      tagFa = '',
      tagEn = '',
      iconType = 'web',
      headlineFa = '',
      headlineEn = '',
      descriptionFa = '',
      descriptionEn = '',
      detailedNarrativeFa = '',
      detailedNarrativeEn = '',
      businessValueTitleFa = '',
      businessValueTitleEn = '',
      businessValueFa = '',
      businessValueEn = '',
      imageUrl = null,
      imageAlt = null,
      coverImageUrl = null,
      coverImageAlt = null,
      gallery = [],
      subservices = [],
      deliverablesFa = [],
      deliverablesEn = [],
      metrics = [],
      relatedLinks = [],
      metaTitleFa = '',
      metaTitleEn = '',
      metaDescFa = '',
      metaDescEn = '',
      keywordsFa = '',
      keywordsEn = '',
      canonicalUrl = '',
      ogImage = '',
      position,
      published = true,
      status = 'PUBLISHED',
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'عنوان خدمت الزامی است' });
    }

    if (imageUrl && !imageAlt) {
      return res.status(400).json({ error: 'برای تصویر، متن جایگزین (Alt) الزامی است' });
    }

    const count = await prisma.service.count();
    const finalPosition = typeof position === 'number' ? position : count;
    const finalSlug = slug?.trim() || titleEn?.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || `service-${Date.now()}`;

    const service = await prisma.service.create({
      data: {
        title,
        titleEn,
        subtitle,
        subtitleEn,
        slug: finalSlug,
        tagFa,
        tagEn,
        iconType,
        headlineFa,
        headlineEn,
        descriptionFa,
        descriptionEn,
        detailedNarrativeFa,
        detailedNarrativeEn,
        businessValueTitleFa,
        businessValueTitleEn,
        businessValueFa,
        businessValueEn,
        imageUrl: imageUrl ? String(imageUrl) : null,
        imageAlt: imageAlt ? String(imageAlt) : null,
        coverImageUrl: coverImageUrl ? String(coverImageUrl) : null,
        coverImageAlt: coverImageAlt ? String(coverImageAlt) : null,
        gallery: Array.isArray(gallery) ? gallery : [],
        subservices,
        deliverablesFa: Array.isArray(deliverablesFa) ? deliverablesFa : [],
        deliverablesEn: Array.isArray(deliverablesEn) ? deliverablesEn : [],
        metrics,
        relatedLinks,
        metaTitleFa,
        metaTitleEn,
        metaDescFa,
        metaDescEn,
        keywordsFa,
        keywordsEn,
        canonicalUrl,
        ogImage,
        position: finalPosition,
        published: Boolean(published),
        status: status in ContentStatus ? (status as ContentStatus) : ContentStatus.PUBLISHED,
      },
    });

    await logAudit({
      userId: req.user?.id,
      action: 'CREATE_SERVICE',
      targetId: service.id,
      details: `Created service: ${service.title} (${service.slug})`,
      ipAddress: req.ip,
    });

    revalidateServices(service.slug);

    res.status(201).json(service);
  } catch (error) {
    console.error('[services] create error:', error);
    res.status(500).json({ error: 'ایجاد خدمت ناموفق بود' });
  }
});

// PUT /api/v1/services/:id (Admin — update service)
router.put('/:id', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر' });
    }

    const {
      title,
      titleEn,
      subtitle,
      subtitleEn,
      slug,
      tagFa,
      tagEn,
      iconType,
      headlineFa,
      headlineEn,
      descriptionFa,
      descriptionEn,
      detailedNarrativeFa,
      detailedNarrativeEn,
      businessValueTitleFa,
      businessValueTitleEn,
      businessValueFa,
      businessValueEn,
      imageUrl,
      imageAlt,
      coverImageUrl,
      coverImageAlt,
      gallery,
      subservices,
      deliverablesFa,
      deliverablesEn,
      metrics,
      relatedLinks,
      metaTitleFa,
      metaTitleEn,
      metaDescFa,
      metaDescEn,
      keywordsFa,
      keywordsEn,
      canonicalUrl,
      ogImage,
      position,
      published,
      status,
    } = req.body;

    const data: Record<string, any> = {};
    if (title !== undefined) data.title = title;
    if (titleEn !== undefined) data.titleEn = titleEn;
    if (subtitle !== undefined) data.subtitle = subtitle;
    if (subtitleEn !== undefined) data.subtitleEn = subtitleEn;
    if (slug !== undefined) data.slug = String(slug).trim();
    if (tagFa !== undefined) data.tagFa = tagFa;
    if (tagEn !== undefined) data.tagEn = tagEn;
    if (iconType !== undefined) data.iconType = iconType;
    if (headlineFa !== undefined) data.headlineFa = headlineFa;
    if (headlineEn !== undefined) data.headlineEn = headlineEn;
    if (descriptionFa !== undefined) data.descriptionFa = descriptionFa;
    if (descriptionEn !== undefined) data.descriptionEn = descriptionEn;
    if (detailedNarrativeFa !== undefined) data.detailedNarrativeFa = detailedNarrativeFa;
    if (detailedNarrativeEn !== undefined) data.detailedNarrativeEn = detailedNarrativeEn;
    if (businessValueTitleFa !== undefined) data.businessValueTitleFa = businessValueTitleFa;
    if (businessValueTitleEn !== undefined) data.businessValueTitleEn = businessValueTitleEn;
    if (businessValueFa !== undefined) data.businessValueFa = businessValueFa;
    if (businessValueEn !== undefined) data.businessValueEn = businessValueEn;
    if (imageUrl !== undefined) data.imageUrl = imageUrl ? String(imageUrl) : null;
    if (imageAlt !== undefined) data.imageAlt = imageAlt ? String(imageAlt) : null;
    if (coverImageUrl !== undefined) data.coverImageUrl = coverImageUrl ? String(coverImageUrl) : null;
    if (coverImageAlt !== undefined) data.coverImageAlt = coverImageAlt ? String(coverImageAlt) : null;
    if (gallery !== undefined) data.gallery = Array.isArray(gallery) ? gallery : [];
    if (subservices !== undefined) data.subservices = subservices;
    if (deliverablesFa !== undefined) data.deliverablesFa = Array.isArray(deliverablesFa) ? deliverablesFa : [];
    if (deliverablesEn !== undefined) data.deliverablesEn = Array.isArray(deliverablesEn) ? deliverablesEn : [];
    if (metrics !== undefined) data.metrics = metrics;
    if (relatedLinks !== undefined) data.relatedLinks = relatedLinks;
    if (metaTitleFa !== undefined) data.metaTitleFa = metaTitleFa;
    if (metaTitleEn !== undefined) data.metaTitleEn = metaTitleEn;
    if (metaDescFa !== undefined) data.metaDescFa = metaDescFa;
    if (metaDescEn !== undefined) data.metaDescEn = metaDescEn;
    if (keywordsFa !== undefined) data.keywordsFa = keywordsFa;
    if (keywordsEn !== undefined) data.keywordsEn = keywordsEn;
    if (canonicalUrl !== undefined) data.canonicalUrl = canonicalUrl;
    if (ogImage !== undefined) data.ogImage = ogImage;
    if (position !== undefined) data.position = Number(position);
    if (published !== undefined) data.published = Boolean(published);
    if (status !== undefined && status in ContentStatus) data.status = status as ContentStatus;

    if (data.imageUrl && !data.imageAlt && req.body.imageAlt === undefined) {
      // Validate only if updating imageUrl without alt
      const existing = await prisma.service.findUnique({ where: { id } });
      if (!existing?.imageAlt) {
        return res.status(400).json({ error: 'برای تصویر، متن جایگزین (Alt) الزامی است' });
      }
    }

    const service = await prisma.service.update({ where: { id }, data });

    await logAudit({
      userId: req.user?.id,
      action: 'UPDATE_SERVICE',
      targetId: id,
      details: `Updated service: ${service.title}`,
      ipAddress: req.ip,
    });

    revalidateServices(service.slug);

    res.json(service);
  } catch (error) {
    console.error('[services] update error:', error);
    res.status(500).json({ error: 'ذخیره خدمت ناموفق بود' });
  }
});

// DELETE /api/v1/services/:id (Admin — delete service)
router.delete('/:id', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر' });
    }

    const service = await prisma.service.delete({ where: { id } });

    await logAudit({
      userId: req.user?.id,
      action: 'DELETE_SERVICE',
      targetId: id,
      details: `Deleted service: ${service.title}`,
      ipAddress: req.ip,
    });

    revalidateServices(service.slug);

    res.json({ message: 'حذف شد' });
  } catch (error) {
    console.error('[services] delete error:', error);
    res.status(500).json({ error: 'حذف خدمت ناموفق بود' });
  }
});

export default router;
