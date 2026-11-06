import { Router, Request, Response } from 'express';
import { PrismaClient, AttributeType } from '@prisma/client';
import { z } from 'zod';
import { authenticate, requireContentManager, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Zod schemas for validation
const CategorySchema = z.object({
  titleFa: z.string().min(1, 'عنوان فارسی دسته‌بندی الزامی است'),
  titleEn: z.string().min(1, 'عنوان انگلیسی دسته‌بندی الزامی است'),
  slug: z.string().min(1, 'اسلاگ دسته‌بندی الزامی است').regex(/^[a-z0-9-]+$/, 'اسلاگ فقط می‌تواند شامل حروف کوچک انگلیسی، اعداد و خط فاصله باشد'),
  descriptionFa: z.string().optional().default(''),
  descriptionEn: z.string().optional().default(''),
  icon: z.string().optional().default('folder'),
  color: z.string().optional().default('#38534A'),
  position: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

const AttributeTemplateSchema = z.object({
  key: z.string().min(1, 'کلید مشخصه الزامی است').regex(/^[a-z0-9_]+$/, 'کلید فقط می‌تواند شامل حروف کوچک انگلیسی، اعداد و آندرلاین باشد'),
  titleFa: z.string().min(1, 'عنوان فارسی ویژگی الزامی است'),
  titleEn: z.string().min(1, 'عنوان انگلیسی ویژگی الزامی است'),
  descriptionFa: z.string().optional().default(''),
  descriptionEn: z.string().optional().default(''),
  type: z.nativeEnum(AttributeType),
  isRequired: z.boolean().optional().default(false),
  unit: z.string().optional().default(''),
  showInFrontend: z.boolean().optional().default(true),
  position: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
  options: z.record(z.any()).optional().default({}),
});

// ==========================================
// 1. Categories Endpoints
// ==========================================

// GET /api/v1/portfolio/categories (Public)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.portfolioCategory.findMany({
      where: { isActive: true },
      include: {
        attributes: {
          where: { isActive: true },
          orderBy: { position: 'asc' },
        },
        _count: {
          select: { caseStudies: { where: { isPublished: true } } },
        },
      },
      orderBy: { position: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    console.error('[portfolioCategories] fetch error:', error);
    res.status(500).json({ error: 'خطا در دریافت لیست دسته‌بندی‌ها' });
  }
});

// GET /api/v1/portfolio/categories/admin (Admin: all categories with all attributes)
router.get('/admin', authenticate, requireContentManager, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const categories = await prisma.portfolioCategory.findMany({
      include: {
        attributes: {
          orderBy: { position: 'asc' },
        },
        _count: {
          select: { caseStudies: true },
        },
      },
      orderBy: { position: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    console.error('[portfolioCategories] admin fetch error:', error);
    res.status(500).json({ error: 'خطا در دریافت دسته‌بندی‌ها برای مدیریت' });
  }
});

// GET /api/v1/portfolio/categories/:idOrSlug
router.get('/:idOrSlug', async (req: Request, res: Response) => {
  try {
    const param = String(req.params.idOrSlug).trim();
    const numId = parseInt(param, 10);

    let category = null;
    if (!Number.isNaN(numId)) {
      category = await prisma.portfolioCategory.findUnique({
        where: { id: numId },
        include: {
          attributes: {
            where: { isActive: true },
            orderBy: { position: 'asc' },
          },
        },
      });
    }

    if (!category) {
      category = await prisma.portfolioCategory.findUnique({
        where: { slug: param },
        include: {
          attributes: {
            where: { isActive: true },
            orderBy: { position: 'asc' },
          },
        },
      });
    }

    if (!category) {
      return res.status(404).json({ error: 'دسته‌بندی مورد نظر یافت نشد' });
    }

    res.json(category);
  } catch (error) {
    console.error('[portfolioCategories] single fetch error:', error);
    res.status(500).json({ error: 'خطا در دریافت جزئیات دسته‌بندی' });
  }
});

// POST /api/v1/portfolio/categories (Admin)
router.post('/', authenticate, requireContentManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = CategorySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'اعتبارسنجی دسته‌بندی ناموفق بود',
        details: parsed.error.issues,
      });
    }

    const { slug } = parsed.data;
    const existing = await prisma.portfolioCategory.findUnique({ where: { slug } });
    if (existing) {
      return res.status(400).json({ error: 'این اسلاگ قبلاً ثبت شده است' });
    }

    const category = await prisma.portfolioCategory.create({
      data: parsed.data,
      include: { attributes: true },
    });

    if (req.user?.id) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'CREATE_PORTFOLIO_CATEGORY',
          targetId: category.id,
          details: `Created category "${category.titleFa}" (${category.slug})`,
          ipAddress: req.ip || null,
        },
      });
    }

    res.status(201).json(category);
  } catch (error) {
    console.error('[portfolioCategories] create error:', error);
    res.status(500).json({ error: 'ایجاد دسته‌بندی ناموفق بود' });
  }
});

// PUT /api/v1/portfolio/categories/:id (Admin)
router.put('/:id', authenticate, requireContentManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر است' });
    }

    const parsed = CategorySchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'اعتبارسنجی اطلاعات دسته‌بندی ناموفق بود',
        details: parsed.error.issues,
      });
    }

    if (parsed.data.slug) {
      const existing = await prisma.portfolioCategory.findFirst({
        where: { slug: parsed.data.slug, NOT: { id } },
      });
      if (existing) {
        return res.status(400).json({ error: 'این اسلاگ توسط دسته‌بندی دیگری استفاده شده است' });
      }
    }

    const category = await prisma.portfolioCategory.update({
      where: { id },
      data: parsed.data,
      include: {
        attributes: {
          orderBy: { position: 'asc' },
        },
      },
    });

    if (req.user?.id) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'UPDATE_PORTFOLIO_CATEGORY',
          targetId: category.id,
          details: `Updated category "${category.titleFa}"`,
          ipAddress: req.ip || null,
        },
      });
    }

    res.json(category);
  } catch (error) {
    console.error('[portfolioCategories] update error:', error);
    res.status(500).json({ error: 'ویرایش دسته‌بندی ناموفق بود' });
  }
});

// DELETE /api/v1/portfolio/categories/:id (Admin)
router.delete('/:id', authenticate, requireContentManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر است' });
    }

    const existing = await prisma.portfolioCategory.findUnique({
      where: { id },
      include: { _count: { select: { caseStudies: true } } },
    });

    if (!existing) {
      return res.status(404).json({ error: 'دسته‌بندی مورد نظر یافت نشد' });
    }

    // Detach related case studies gracefully so they are not deleted
    await prisma.caseStudy.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });

    await prisma.portfolioCategory.delete({ where: { id } });

    if (req.user?.id) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'DELETE_PORTFOLIO_CATEGORY',
          targetId: id,
          details: `Deleted category "${existing.titleFa}"`,
          ipAddress: req.ip || null,
        },
      });
    }

    res.json({ message: 'دسته‌بندی با موفقیت حذف شد' });
  } catch (error) {
    console.error('[portfolioCategories] delete error:', error);
    res.status(500).json({ error: 'حذف دسته‌بندی ناموفق بود' });
  }
});

// ==========================================
// 2. Attribute Templates Endpoints
// ==========================================

// POST /api/v1/portfolio/categories/:id/attributes (Admin: add attribute to category)
router.post('/:id/attributes', authenticate, requireContentManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const categoryId = parseInt(req.params.id as string, 10);
    if (Number.isNaN(categoryId)) {
      return res.status(400).json({ error: 'شناسه دسته‌بندی نامعتبر است' });
    }

    const category = await prisma.portfolioCategory.findUnique({ where: { id: categoryId } });
    if (!category) {
      return res.status(404).json({ error: 'دسته‌بندی مورد نظر یافت نشد' });
    }

    const parsed = AttributeTemplateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'اعتبارسنجی ویژگی ناموفق بود',
        details: parsed.error.issues,
      });
    }

    // Check key uniqueness within this category
    const conflict = await prisma.portfolioAttributeTemplate.findUnique({
      where: {
        categoryId_key: {
          categoryId,
          key: parsed.data.key,
        },
      },
    });

    if (conflict) {
      return res.status(400).json({ error: 'این کلید ویژگی قبلاً برای این دسته‌بندی تعریف شده است' });
    }

    const attribute = await prisma.portfolioAttributeTemplate.create({
      data: {
        ...parsed.data,
        categoryId,
      },
    });

    if (req.user?.id) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'CREATE_ATTRIBUTE_TEMPLATE',
          targetId: attribute.id,
          details: `Added attribute "${attribute.titleFa}" (${attribute.key}) to category "${category.titleFa}"`,
          ipAddress: req.ip || null,
        },
      });
    }

    res.status(201).json(attribute);
  } catch (error) {
    console.error('[portfolioCategories] create attribute error:', error);
    res.status(500).json({ error: 'افزودن ویژگی به قالب ناموفق بود' });
  }
});

// PUT /api/v1/portfolio/categories/attributes/:attrId (Admin: update attribute)
router.put('/attributes/:attrId', authenticate, requireContentManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const attrId = parseInt(req.params.attrId as string, 10);
    if (Number.isNaN(attrId)) {
      return res.status(400).json({ error: 'شناسه ویژگی نامعتبر است' });
    }

    const parsed = AttributeTemplateSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'اعتبارسنجی ویژگی ناموفق بود',
        details: parsed.error.issues,
      });
    }

    const existing = await prisma.portfolioAttributeTemplate.findUnique({ where: { id: attrId } });
    if (!existing) {
      return res.status(404).json({ error: 'ویژگی مورد نظر یافت نشد' });
    }

    // If key is changing, ensure uniqueness in the same category
    if (parsed.data.key && parsed.data.key !== existing.key) {
      const conflict = await prisma.portfolioAttributeTemplate.findUnique({
        where: {
          categoryId_key: {
            categoryId: existing.categoryId,
            key: parsed.data.key,
          },
        },
      });
      if (conflict) {
        return res.status(400).json({ error: 'این کلید ویژگی قبلاً برای این دسته‌بندی تعریف شده است' });
      }
    }

    const updated = await prisma.portfolioAttributeTemplate.update({
      where: { id: attrId },
      data: parsed.data,
    });

    if (req.user?.id) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'UPDATE_ATTRIBUTE_TEMPLATE',
          targetId: updated.id,
          details: `Updated attribute "${updated.titleFa}"`,
          ipAddress: req.ip || null,
        },
      });
    }

    res.json(updated);
  } catch (error) {
    console.error('[portfolioCategories] update attribute error:', error);
    res.status(500).json({ error: 'ویرایش ویژگی ناموفق بود' });
  }
});

// DELETE /api/v1/portfolio/categories/attributes/:attrId (Admin: delete attribute)
router.delete('/attributes/:attrId', authenticate, requireContentManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const attrId = parseInt(req.params.attrId as string, 10);
    if (Number.isNaN(attrId)) {
      return res.status(400).json({ error: 'شناسه ویژگی نامعتبر است' });
    }

    const existing = await prisma.portfolioAttributeTemplate.findUnique({ where: { id: attrId } });
    if (!existing) {
      return res.status(404).json({ error: 'ویژگی مورد نظر یافت نشد' });
    }

    await prisma.portfolioAttributeTemplate.delete({ where: { id: attrId } });

    if (req.user?.id) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'DELETE_ATTRIBUTE_TEMPLATE',
          targetId: attrId,
          details: `Deleted attribute "${existing.titleFa}" (${existing.key})`,
          ipAddress: req.ip || null,
        },
      });
    }

    res.json({ message: 'ویژگی با موفقیت حذف شد' });
  } catch (error) {
    console.error('[portfolioCategories] delete attribute error:', error);
    res.status(500).json({ error: 'حذف ویژگی ناموفق بود' });
  }
});

// PUT /api/v1/portfolio/categories/:id/attributes/reorder (Admin: bulk reorder attributes)
router.put('/:id/attributes/reorder', authenticate, requireContentManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const categoryId = parseInt(req.params.id as string, 10);
    const { orderedIds } = req.body;

    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: 'فهرست شناسه‌ها باید آرایه باشد' });
    }

    await prisma.$transaction(
      orderedIds.map((id: number, index: number) =>
        prisma.portfolioAttributeTemplate.updateMany({
          where: { id, categoryId },
          data: { position: index },
        })
      )
    );

    res.json({ message: 'ترتیب ویژگی‌ها با موفقیت به‌روزرسانی شد' });
  } catch (error) {
    console.error('[portfolioCategories] reorder error:', error);
    res.status(500).json({ error: 'به‌روزرسانی ترتیب ویژگی‌ها ناموفق بود' });
  }
});

export default router;
