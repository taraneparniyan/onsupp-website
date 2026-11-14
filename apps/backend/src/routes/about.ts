import { Router, Request, Response } from 'express';
import { PrismaClient, PublicationStatus } from '@prisma/client';
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
  'heroCaptionFa',
  'heroCaptionEn',
  'leadFa',
  'leadEn',
  'approachFa',
  'approachEn',
] as const;

// ─── 1. HOMEPAGE ABOUT SECTION ───────────────────────────────────────────────

// GET /api/v1/about (public — content + features for homepage card)
router.get('/', async (_req: Request, res: Response) => {
  try {
    let content = await prisma.aboutContent.findFirst({ where: { id: 1 } });
    if (!content) {
      content = await prisma.aboutContent.create({ data: { id: 1 } });
    }
    const features = await prisma.feature.findMany({ orderBy: { position: 'asc' } });
    res.json({ content, features });
  } catch (error) {
    console.error('[about] get error:', error);
    res.status(500).json({ error: 'دریافت محتوای درباره ما ناموفق بود' });
  }
});

// PUT /api/v1/about (admin — upsert content singleton id=1)
router.put('/', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data: Record<string, any> = { id: 1 };
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

    if (req.user?.id) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'UPDATE_ABOUT_CONTENT',
          targetId: 1,
          details: 'Updated homepage and about page narrative copy',
          ipAddress: req.ip || null,
        },
      });
    }

    res.json(content);
  } catch (error) {
    console.error('[about] update error:', error);
    res.status(500).json({ error: 'ذخیره محتوای درباره ما ناموفق بود' });
  }
});

// ─── 2. DEDICATED /about PAGE AGGREGATOR ──────────────────────────────────────

// GET /api/v1/about/page (public — consolidated payload for /about route)
router.get('/page', async (_req: Request, res: Response) => {
  try {
    let about = await prisma.aboutContent.findFirst({ where: { id: 1 } });
    if (!about) {
      about = await prisma.aboutContent.create({ data: { id: 1 } });
    }

    let ceo = await prisma.ceoProfile.findFirst({ where: { id: 1 } });
    if (!ceo) {
      ceo = await prisma.ceoProfile.create({ data: { id: 1 } });
    }

    const values = await prisma.companyValue.findMany({
      where: { isPublished: true, status: PublicationStatus.PUBLISHED },
      orderBy: { position: 'asc' },
    });

    const members = await prisma.teamMember.findMany({
      where: { isPublished: true, status: PublicationStatus.PUBLISHED },
      orderBy: { position: 'asc' },
    });

    const pageContent = {
      hero: {
        eyebrowFa: about.eyebrowFa || 'درباره آن‌ساپ',
        eyebrowEn: about.eyebrowEn || 'About OnSupp',
        titleFa: about.titleFa || 'آدم‌هایی که پشت هر پروژه ایستاده‌اند',
        titleEn: about.titleEn || 'The people behind every project',
        captionFa: about.heroCaptionFa,
        captionEn: about.heroCaptionEn,
        photo: {
          src: about.imageUrl,
          altFa: about.imageAlt || 'عکس گروهی تیم آن‌ساپ',
          altEn: 'OnSupp team group photograph',
        },
      },
      intro: {
        eyebrowFa: 'درباره ما',
        eyebrowEn: 'About Us',
        titleFa: about.subTitleFa || 'یک تیم، از استراتژی تا اجرا',
        titleEn: about.subTitleEn || 'One team, from strategy to delivery',
        leadFa: about.leadFa,
        leadEn: about.leadEn,
        approachFa: about.approachFa,
        approachEn: about.approachEn,
        values: values.map((v) => ({
          id: v.key,
          titleFa: v.titleFa,
          titleEn: v.titleEn,
          descriptionFa: v.descriptionFa,
          descriptionEn: v.descriptionEn,
        })),
      },
      ceo: {
        nameFa: ceo.nameFa,
        nameEn: ceo.nameEn,
        roleFa: ceo.roleFa,
        roleEn: ceo.roleEn,
        quoteFa: ceo.quoteFa,
        quoteEn: ceo.quoteEn,
        bioFa: ceo.bioFa,
        bioEn: ceo.bioEn,
        photo: {
          src: ceo.avatarUrl,
          altFa: `پرتره رسمی ${ceo.nameFa}`,
          altEn: `Executive portrait of ${ceo.nameEn}`,
          focalPoint: ceo.focalPoint,
        },
        links: ceo.socialLinks,
      },
      team: {
        eyebrowFa: 'همکاران ما',
        eyebrowEn: 'Our Team',
        titleFa: 'ترکیب مهندسی و خلاقیت',
        titleEn: 'Engineering Meets Craft',
        descriptionFa: 'متخصصان ارشد حوزه‌های استراتژی، طراحی، نرم‌افزار و استودیو رسانه.',
        descriptionEn: 'Senior specialists across digital strategy, product design, engineering, and cinema.',
        members: members.map((m) => ({
          id: `member-${m.id}`,
          position: m.position,
          isPublished: m.isPublished,
          nameFa: m.nameFa,
          nameEn: m.nameEn,
          roleFa: m.roleFa,
          roleEn: m.roleEn,
          departmentFa: m.departmentFa,
          departmentEn: m.departmentEn,
          bioFa: m.bioFa,
          bioEn: m.bioEn,
          photo: {
            src: m.avatarUrl,
            altFa: `تصویر ${m.nameFa}`,
            altEn: `Portrait of ${m.nameEn}`,
            focalPoint: m.focalPoint,
          },
          links: m.socialLinks,
        })),
      },
    };

    res.json(pageContent);
  } catch (error) {
    console.error('[about] page content aggregator error:', error);
    res.status(500).json({ error: 'خطا در دریافت اطلاعات جامع صفحه درباره ما' });
  }
});

// ─── 3. CEO PROFILE ENDPOINTS ────────────────────────────────────────────────

// GET /api/v1/about/ceo (public — returns CEO profile)
router.get('/ceo', async (_req: Request, res: Response) => {
  try {
    let ceo = await prisma.ceoProfile.findFirst({ where: { id: 1 } });
    if (!ceo) {
      ceo = await prisma.ceoProfile.create({ data: { id: 1 } });
    }
    res.json(ceo);
  } catch (error) {
    console.error('[about] ceo fetch error:', error);
    res.status(500).json({ error: 'دریافت پروفایل مدیرعامل ناموفق بود' });
  }
});

// PUT /api/v1/about/ceo (admin — update CEO profile)
router.put('/ceo', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const fields = [
      'nameFa',
      'nameEn',
      'roleFa',
      'roleEn',
      'quoteFa',
      'quoteEn',
      'bioFa',
      'bioEn',
      'avatarUrl',
      'focalPoint',
      'socialLinks',
      'isPublished',
      'status',
    ];

    const data: Record<string, any> = {};
    for (const f of fields) {
      if (req.body[f] !== undefined) {
        data[f] = req.body[f];
      }
    }

    const ceo = await prisma.ceoProfile.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    });

    if (req.user?.id) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'UPDATE_CEO_PROFILE',
          targetId: 1,
          details: 'Updated CEO profile information and portrait',
          ipAddress: req.ip || null,
        },
      });
    }

    res.json(ceo);
  } catch (error) {
    console.error('[about] ceo update error:', error);
    res.status(500).json({ error: 'ذخیره پروفایل مدیرعامل ناموفق بود' });
  }
});

// ─── 4. COMPANY VALUES ENDPOINTS ─────────────────────────────────────────────

// GET /api/v1/about/values (public)
router.get('/values', async (_req: Request, res: Response) => {
  try {
    const values = await prisma.companyValue.findMany({
      orderBy: { position: 'asc' },
    });
    res.json(values);
  } catch (error) {
    console.error('[about] values fetch error:', error);
    res.status(500).json({ error: 'دریافت ارزش‌های سازمانی ناموفق بود' });
  }
});

// POST /api/v1/about/values (admin)
router.post('/values', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { key, titleFa, titleEn, descriptionFa, descriptionEn, badgeFa, badgeEn, icon, position } = req.body;

    if (!key || !titleFa || !descriptionFa) {
      return res.status(400).json({ error: 'کلید (key)، عنوان و توضیحات فارسی الزامی هستند' });
    }

    const count = await prisma.companyValue.count();
    const value = await prisma.companyValue.create({
      data: {
        key: String(key).trim().toLowerCase(),
        titleFa,
        titleEn: titleEn || '',
        descriptionFa,
        descriptionEn: descriptionEn || '',
        badgeFa: badgeFa || '',
        badgeEn: badgeEn || '',
        icon: icon || 'check',
        position: position ?? count,
      },
    });

    res.status(201).json(value);
  } catch (error) {
    console.error('[about] value create error:', error);
    res.status(500).json({ error: 'ایجاد ارزش جدید ناموفق بود' });
  }
});

// PUT /api/v1/about/values/:id (admin)
router.put('/values/:id', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر است' });
    }

    const value = await prisma.companyValue.update({
      where: { id },
      data: req.body,
    });

    res.json(value);
  } catch (error) {
    console.error('[about] value update error:', error);
    res.status(500).json({ error: 'ذخیره تغییرات ارزش سازمانی ناموفق بود' });
  }
});

// DELETE /api/v1/about/values/:id (admin)
router.delete('/values/:id', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر است' });
    }

    await prisma.companyValue.delete({ where: { id } });
    res.json({ message: 'ارزش سازمانی حذف شد' });
  } catch (error) {
    console.error('[about] value delete error:', error);
    res.status(500).json({ error: 'حذف ارزش سازمانی ناموفق بود' });
  }
});

// ─── 5. FEATURES ENDPOINTS (PRESERVED) ────────────────────────────────────────

// POST /api/v1/about/features (admin)
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

// PUT /api/v1/about/features/:id (admin)
router.put('/features/:id', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر' });
    }
    const data: Record<string, any> = {};
    for (const field of ['titleFa', 'titleEn', 'icon', 'position']) {
      if (req.body[field] !== undefined) {
        data[field] = req.body[field];
      }
    }
    const feature = await prisma.feature.update({ where: { id }, data });
    res.json(feature);
  } catch (error) {
    console.error('[about] feature update error:', error);
    res.status(500).json({ error: 'ذخیره ویژگی ناموفق بود' });
  }
});

// DELETE /api/v1/about/features/:id (admin)
router.delete('/features/:id', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر' });
    }
    await prisma.feature.delete({ where: { id } });
    res.json({ message: 'ویژگی حذف شد' });
  } catch (error) {
    console.error('[about] feature delete error:', error);
    res.status(500).json({ error: 'حذف ویژگی ناموفق بود' });
  }
});

export default router;
