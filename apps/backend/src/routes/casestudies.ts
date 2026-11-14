import { Router, Request, Response } from 'express';
import { PrismaClient, PublicationStatus, AttributeType } from '@prisma/client';
import { authenticate, requireContentManager, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

const CASESTUDY_FIELDS = [
  'slug',
  'client',
  'clientEn',
  'titleFa',
  'titleEn',
  'taglineFa',
  'taglineEn',
  'categoryFa',
  'categoryEn',
  'categoryId',
  'projectType',
  'descriptionFa',
  'descriptionEn',
  'imageUrl',
  'secondaryImage',
  'gallery',
  'liveUrl',
  'featured',
  'position',
  'year',
  'challengeFa',
  'challengeEn',
  'solutionFa',
  'solutionEn',
  'resultsFa',
  'resultsEn',
  'deliverablesFa',
  'deliverablesEn',
  'servicesFa',
  'servicesEn',
  'metricsFa',
  'metricsEn',
  'colorGradient',
  'accentColor',
  'glowColor',
  'previewType',
  'metaTitleFa',
  'metaTitleEn',
  'metaDescFa',
  'metaDescEn',
  'keywords',
  'ogImage',
  'isPublished',
  'status',
] as const;

function extractCaseStudyData(body: any) {
  const data: Record<string, any> = {};
  for (const key of CASESTUDY_FIELDS) {
    if (body[key] !== undefined) {
      if (key === 'imageUrl' || key === 'secondaryImage') {
        data[key] = body[key] ? String(body[key]) : null;
      } else if (key === 'ogImage') {
        data[key] = body[key] ? String(body[key]) : '';
      } else if (key === 'categoryId') {
        data[key] = body[key] ? parseInt(String(body[key]), 10) : null;
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

const CASESTUDY_INCLUDE = {
  category: {
    include: {
      attributes: {
        where: { isActive: true },
        orderBy: { position: 'asc' as const },
      },
    },
  },
  attributeValues: {
    include: {
      attribute: true,
    },
    orderBy: {
      id: 'asc' as const,
    },
  },
};

const CATEGORY_IDS_META_KEY = '__category_ids__';

function parseCategoryIdsInput(rawIds: unknown, fallbackCategoryId?: number | null): {
  valid: boolean;
  ids: number[];
  error?: string;
} {
  if (rawIds === undefined) {
    if (fallbackCategoryId && Number.isInteger(fallbackCategoryId) && fallbackCategoryId > 0) {
      return { valid: true, ids: [fallbackCategoryId] };
    }
    return { valid: true, ids: [] };
  }

  if (!Array.isArray(rawIds)) {
    return { valid: false, ids: [], error: 'فرمت لیست دسته‌بندی‌ها نامعتبر است' };
  }

  const seen = new Set<number>();
  const ids: number[] = [];
  for (const raw of rawIds) {
    const num = typeof raw === 'number' ? raw : parseInt(String(raw), 10);
    if (!Number.isInteger(num) || num <= 0) {
      return { valid: false, ids: [], error: 'شناسه دسته‌بندی نامعتبر است' };
    }
    if (!seen.has(num)) {
      seen.add(num);
      ids.push(num);
    }
  }
  return { valid: true, ids };
}

async function syncCategoryIdsMeta(caseStudyId: number, categoryIds: number[]) {
  await prisma.portfolioAttributeValue.upsert({
    where: {
      caseStudyId_attributeKey: {
        caseStudyId,
        attributeKey: CATEGORY_IDS_META_KEY,
      },
    },
    update: {
      attributeId: null,
      type: AttributeType.MULTI_SELECT,
      valueText: JSON.stringify(categoryIds),
      valueJson: categoryIds,
    },
    create: {
      caseStudyId,
      attributeId: null,
      attributeKey: CATEGORY_IDS_META_KEY,
      type: AttributeType.MULTI_SELECT,
      valueText: JSON.stringify(categoryIds),
      valueJson: categoryIds,
    },
  });
}

async function hydrateCaseStudies(items: any[]) {
  if (!items || items.length === 0) return [];
  const allCategories = await prisma.portfolioCategory.findMany({
    include: {
      attributes: {
        where: { isActive: true },
        orderBy: { position: 'asc' },
      },
    },
    orderBy: { position: 'asc' },
  });
  const catMap = new Map(allCategories.map((c) => [c.id, c]));

  return items.map((item) => {
    const rawAttrValues = Array.isArray(item.attributeValues) ? item.attributeValues : [];
    const metaRow = rawAttrValues.find((v: any) => v.attributeKey === CATEGORY_IDS_META_KEY);
    const cleanAttrValues = rawAttrValues.filter((v: any) => v.attributeKey !== CATEGORY_IDS_META_KEY);

    let categoryIds: number[] = [];
    if (metaRow) {
      const jsonIds = Array.isArray(metaRow.valueJson)
        ? metaRow.valueJson
        : (() => {
            try {
              const parsed = JSON.parse(metaRow.valueText || '[]');
              return Array.isArray(parsed) ? parsed : [];
            } catch {
              return [];
            }
          })();
      categoryIds = jsonIds
        .map((n: any) => Number(n))
        .filter((n: number) => Number.isInteger(n) && n > 0 && catMap.has(n));
    }

    if (categoryIds.length === 0 && item.categoryId && catMap.has(item.categoryId)) {
      categoryIds = [item.categoryId];
    }

    const categories = categoryIds
      .map((id) => catMap.get(id))
      .filter((c): c is NonNullable<typeof c> => Boolean(c));

    return {
      ...item,
      categoryIds,
      categories,
      category: categories[0] || item.category || null,
      attributeValues: cleanAttrValues,
    };
  });
}

/**
 * Synchronizes dynamic attribute values for a case study.
 * Preserves existing values even if not in the current category template (prevents accidental data loss).
 */
async function syncAttributeValues(caseStudyId: number, categoryIds: number[], rawValues: any) {
  if (!rawValues || typeof rawValues !== 'object') return;

  const templates =
    categoryIds.length > 0
      ? await prisma.portfolioAttributeTemplate.findMany({
          where: { categoryId: { in: categoryIds } },
        })
      : [];

  const templateMap = new Map(templates.map((t) => [t.key, t]));

  // Support either { [key]: value } or Array<{ key: string, value: any }>
  const entries: Array<[string, any]> = Array.isArray(rawValues)
    ? rawValues.map((item) => [item.key || item.attributeKey, item.value ?? item])
    : Object.entries(rawValues);

  const valueMap = new Map(entries);

  // Validate required attributes for the category
  for (const template of templates) {
    if (template.isActive && template.isRequired) {
      const val = valueMap.get(template.key);
      const isMissing =
        val === undefined ||
        val === null ||
        (typeof val === 'string' && val.trim() === '') ||
        (Array.isArray(val) && val.length === 0);

      if (isMissing) {
        throw new Error(`REQUIRED_ATTRIBUTE_MISSING:${template.titleFa || template.key}`);
      }
    }
  }

  for (const [key, val] of entries) {
    if (!key || val === undefined || val === null) continue;
    const template = templateMap.get(key);

    const type: AttributeType = template?.type || AttributeType.TEXT;
    let valueText: string | null = null;
    let valueNumber: number | null = null;
    let valueJson: any = null;

    // Validate type-specific constraints
    const rawOptions = (template?.options && typeof template.options === 'object') ? template.options as any : {};
    const allowedChoices: string[] = Array.isArray(rawOptions.choices) ? rawOptions.choices : [];

    if (type === AttributeType.SELECT) {
      const strVal = typeof val === 'string' ? val.trim() : String(val).trim();
      if (allowedChoices.length > 0 && strVal && !allowedChoices.includes(strVal)) {
        throw new Error(`INVALID_SELECT_VALUE:${template?.titleFa || key}:${strVal}`);
      }
      valueText = strVal;
      valueJson = { value: strVal };
    } else if (type === AttributeType.MULTI_SELECT) {
      const arr: string[] = Array.isArray(val)
        ? val.map((s) => String(s).trim()).filter(Boolean)
        : typeof val === 'string'
        ? val.split(/[,،]+/).map((s) => s.trim()).filter(Boolean)
        : [String(val).trim()];

      if (allowedChoices.length > 0) {
        for (const item of arr) {
          if (!allowedChoices.includes(item)) {
            throw new Error(`INVALID_MULTI_SELECT_VALUE:${template?.titleFa || key}:${item}`);
          }
        }
      }
      valueJson = { values: arr };
      valueText = arr.join('، ');
    } else if (type === AttributeType.BOOLEAN) {
      let boolVal: boolean;
      if (typeof val === 'boolean') {
        boolVal = val;
      } else if (val === 'true' || val === 1 || val === '1') {
        boolVal = true;
      } else if (val === 'false' || val === 0 || val === '0') {
        boolVal = false;
      } else {
        throw new Error(`INVALID_BOOLEAN_VALUE:${template?.titleFa || key}`);
      }
      valueText = boolVal ? 'true' : 'false';
      valueJson = { value: boolVal };
    } else if (type === AttributeType.NUMBER || type === AttributeType.PERCENTAGE) {
      const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]/g, ''));
      if (!Number.isNaN(num)) {
        valueNumber = num;
        valueText = String(val);
      } else {
        valueText = String(val);
      }
    } else if (type === AttributeType.BEFORE_AFTER || type === AttributeType.LINK) {
      if (typeof val === 'object') {
        valueJson = val;
        valueText = val.after ?? val.url ?? JSON.stringify(val);
      } else {
        valueText = String(val);
        valueJson = { value: val };
      }
    } else {
      valueText = typeof val === 'string' ? val : JSON.stringify(val);
    }

    await prisma.portfolioAttributeValue.upsert({
      where: {
        caseStudyId_attributeKey: {
          caseStudyId,
          attributeKey: key,
        },
      },
      update: {
        attributeId: template?.id || null,
        type,
        valueText,
        valueNumber,
        valueJson,
      },
      create: {
        caseStudyId,
        attributeId: template?.id || null,
        attributeKey: key,
        type,
        valueText,
        valueNumber,
        valueJson,
      },
    });
  }
}

// GET /api/v1/casestudies (Public — returns published case studies with dynamic category & attributes)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, categoryId } = req.query;

    const items = await prisma.caseStudy.findMany({
      where: {
        isPublished: true,
        status: PublicationStatus.PUBLISHED,
      },
      include: CASESTUDY_INCLUDE,
      orderBy: { position: 'asc' },
    });

    let hydrated = await hydrateCaseStudies(items);

    if (categoryId) {
      const parsedCatId = parseInt(String(categoryId), 10);
      if (!Number.isNaN(parsedCatId)) {
        hydrated = hydrated.filter(
          (item) => item.categoryId === parsedCatId || item.categoryIds.includes(parsedCatId)
        );
      }
    } else if (category && typeof category === 'string' && category !== 'all') {
      const q = category.toLowerCase();
      hydrated = hydrated.filter(
        (item) =>
          item.categories.some((c: any) => c.slug === category) ||
          (item.categoryFa || '').toLowerCase().includes(q) ||
          (item.categoryEn || '').toLowerCase().includes(q)
      );
    }

    res.json(hydrated);
  } catch (error) {
    console.error('[casestudies] fetch error:', error);
    res.status(500).json({ error: 'خطا در دریافت لیست نمونه‌کارها' });
  }
});

// GET /api/v1/casestudies/all (Admin — returns all case studies including drafts with dynamic attributes)
router.get('/all', authenticate, requireContentManager, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const items = await prisma.caseStudy.findMany({
      include: CASESTUDY_INCLUDE,
      orderBy: { position: 'asc' },
    });
    res.json(await hydrateCaseStudies(items));
  } catch (error) {
    console.error('[casestudies] admin fetch error:', error);
    res.status(500).json({ error: 'خطا در دریافت لیست مدیریت نمونه‌کارها' });
  }
});

// GET /api/v1/casestudies/:slugOrId (Public / Preview — single case study lookup)
router.get('/:slugOrId', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const raw = String(req.params.slugOrId).trim();
    const numericId = parseInt(raw, 10);

    let item = null;
    if (!Number.isNaN(numericId)) {
      item = await prisma.caseStudy.findUnique({
        where: { id: numericId },
        include: CASESTUDY_INCLUDE,
      });
    }
    if (!item) {
      item = await prisma.caseStudy.findFirst({
        where: { slug: raw },
        include: CASESTUDY_INCLUDE,
      });
    }

    if (!item) {
      return res.status(404).json({ error: 'نمونه‌کار مورد نظر یافت نشد' });
    }

    // Public vs. Draft isolation
    const isManager = req.user && ['SUPER_ADMIN', 'ADMIN', 'CONTENT_SEO_MANAGER'].includes(req.user.role);
    if ((!item.isPublished || item.status !== PublicationStatus.PUBLISHED) && !isManager) {
      return res.status(404).json({ error: 'نمونه‌کار مورد نظر یافت نشد' });
    }

    const [hydrated] = await hydrateCaseStudies([item]);
    res.json(hydrated);
  } catch (error) {
    console.error('[casestudies] single fetch error:', error);
    res.status(500).json({ error: 'خطا در دریافت جزئیات نمونه‌کار' });
  }
});

// POST /api/v1/casestudies (Admin — create case study with dynamic category & attributes)
router.post('/', authenticate, requireContentManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = extractCaseStudyData(req.body);

    if (!data.titleFa && !data.titleEn) {
      return res.status(400).json({ error: 'عنوان پروژه الزامی است' });
    }

    if (!data.slug) {
      data.slug = String(data.titleEn || data.titleFa)
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
        .replace(/^-+|-+$/g, '') || `case-${Date.now()}`;
    }

    // Check slug uniqueness
    const conflict = await prisma.caseStudy.findFirst({ where: { slug: data.slug } });
    if (conflict) {
      data.slug = `${data.slug}-${Date.now()}`;
    }

    if (data.position === undefined) {
      data.position = await prisma.caseStudy.count();
    }

    // Validate & sync multi-select categoryIds
    const parsedCats = parseCategoryIdsInput(req.body.categoryIds, data.categoryId ?? null);
    if (!parsedCats.valid) {
      return res.status(400).json({ error: parsedCats.error });
    }
    const categoryIds = parsedCats.ids;

    if (categoryIds.length > 0) {
      const matchedCats = await prisma.portfolioCategory.findMany({
        where: { id: { in: categoryIds } },
      });
      if (matchedCats.length !== categoryIds.length) {
        return res.status(400).json({ error: 'یک یا چند دسته‌بندی انتخاب‌شده در سیستم یافت نشد' });
      }
      const catById = new Map(matchedCats.map((c) => [c.id, c]));
      const orderedCats = categoryIds.map((id) => catById.get(id)!).filter(Boolean);
      data.categoryId = orderedCats[0].id;
      data.categoryFa = orderedCats.map((c) => c.titleFa).join('، ');
      data.categoryEn = orderedCats.map((c) => c.titleEn).join(', ');
    } else if (req.body.categoryIds !== undefined) {
      data.categoryId = null;
    }

    const item = await prisma.caseStudy.create({
      data: data as any,
    });

    if (req.body.categoryIds !== undefined || categoryIds.length > 0) {
      await syncCategoryIdsMeta(item.id, categoryIds);
    }

    // Sync dynamic attribute values if provided
    if (req.body.attributeValues) {
      await syncAttributeValues(item.id, categoryIds, req.body.attributeValues);
    }

    // Fetch complete item with relations for response
    const completeItem = await prisma.caseStudy.findUnique({
      where: { id: item.id },
      include: CASESTUDY_INCLUDE,
    });
    const [hydrated] = completeItem ? await hydrateCaseStudies([completeItem]) : [null];

    // Audit Log
    if (req.user?.id) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'CREATE_CASE_STUDY',
          targetId: item.id,
          details: `Created case study "${item.titleFa}" (${item.slug}) with dynamic attributes`,
          ipAddress: req.ip || null,
        },
      });
    }

    res.status(201).json(hydrated);
  } catch (error: any) {
    console.error('[casestudies] create error:', error);
    if (error?.message?.startsWith('REQUIRED_ATTRIBUTE_MISSING:')) {
      const field = error.message.split(':')[1];
      return res.status(400).json({ error: `تکمیل ویژگی اجباری «${field}» الزامی است.` });
    }
    if (error?.message?.startsWith('INVALID_SELECT_VALUE:')) {
      const [, field, val] = error.message.split(':');
      return res.status(400).json({ error: `مقدار «${val}» برای ویژگی انتخابی «${field}» مجاز نیست.` });
    }
    if (error?.message?.startsWith('INVALID_MULTI_SELECT_VALUE:')) {
      const [, field, val] = error.message.split(':');
      return res.status(400).json({ error: `گزینه «${val}» در ویژگی چندانتخابی «${field}» نامعتبر است.` });
    }
    if (error?.message?.startsWith('INVALID_BOOLEAN_VALUE:')) {
      const field = error.message.split(':')[1];
      return res.status(400).json({ error: `مقدار واردشده برای ویژگی «${field}» باید بولین (بله/خیر) باشد.` });
    }
    res.status(500).json({ error: 'ایجاد نمونه‌کار ناموفق بود' });
  }
});

// PUT /api/v1/casestudies/:id (Admin — update case study with dynamic category & attributes)
router.put('/:id', authenticate, requireContentManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر است' });
    }

    const data = extractCaseStudyData(req.body);

    if (data.slug) {
      const conflict = await prisma.caseStudy.findFirst({
        where: { slug: data.slug, NOT: { id } },
      });
      if (conflict) {
        return res.status(400).json({ error: 'این نامک (slug) قبلاً استفاده شده است' });
      }
    }

    // Validate & sync multi-select categoryIds when categoryIds or categoryId is submitted
    let resolvedCategoryIds: number[] | null = null;
    if (req.body.categoryIds !== undefined) {
      const parsedCats = parseCategoryIdsInput(req.body.categoryIds, null);
      if (!parsedCats.valid) {
        return res.status(400).json({ error: parsedCats.error });
      }
      resolvedCategoryIds = parsedCats.ids;

      if (resolvedCategoryIds.length > 0) {
        const matchedCats = await prisma.portfolioCategory.findMany({
          where: { id: { in: resolvedCategoryIds } },
        });
        if (matchedCats.length !== resolvedCategoryIds.length) {
          return res.status(400).json({ error: 'یک یا چند دسته‌بندی انتخاب‌شده در سیستم یافت نشد' });
        }
        const catById = new Map(matchedCats.map((c) => [c.id, c]));
        const orderedCats = resolvedCategoryIds.map((cid) => catById.get(cid)!).filter(Boolean);
        data.categoryId = orderedCats[0].id;
        data.categoryFa = orderedCats.map((c) => c.titleFa).join('، ');
        data.categoryEn = orderedCats.map((c) => c.titleEn).join(', ');
      } else {
        data.categoryId = null;
        if (data.categoryFa === undefined) data.categoryFa = '';
        if (data.categoryEn === undefined) data.categoryEn = '';
      }
    } else if (data.categoryId) {
      const cat = await prisma.portfolioCategory.findUnique({ where: { id: data.categoryId } });
      if (!cat) {
        return res.status(400).json({ error: 'دسته‌بندی انتخاب‌شده در سیستم یافت نشد' });
      }
      resolvedCategoryIds = [cat.id];
      if (!data.categoryFa) data.categoryFa = cat.titleFa;
      if (!data.categoryEn) data.categoryEn = cat.titleEn;
    }

    const item = await prisma.caseStudy.update({
      where: { id },
      data: data as any,
    });

    if (resolvedCategoryIds !== null) {
      await syncCategoryIdsMeta(item.id, resolvedCategoryIds);
    }

    // Sync dynamic attribute values if provided
    if (req.body.attributeValues !== undefined) {
      const activeCatIds =
        resolvedCategoryIds !== null
          ? resolvedCategoryIds
          : item.categoryId
          ? [item.categoryId]
          : [];
      await syncAttributeValues(item.id, activeCatIds, req.body.attributeValues);
    }

    // Fetch complete item with relations for response
    const completeItem = await prisma.caseStudy.findUnique({
      where: { id: item.id },
      include: CASESTUDY_INCLUDE,
    });
    const [hydrated] = completeItem ? await hydrateCaseStudies([completeItem]) : [null];

    // Audit Log
    if (req.user?.id) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'UPDATE_CASE_STUDY',
          targetId: item.id,
          details: `Updated case study "${item.titleFa}" with dynamic attributes`,
          ipAddress: req.ip || null,
        },
      });
    }

    res.json(hydrated);
  } catch (error: any) {
    console.error('[casestudies] update error:', error);
    if (error?.message?.startsWith('REQUIRED_ATTRIBUTE_MISSING:')) {
      const field = error.message.split(':')[1];
      return res.status(400).json({ error: `تکمیل ویژگی اجباری «${field}» الزامی است.` });
    }
    if (error?.message?.startsWith('INVALID_SELECT_VALUE:')) {
      const [, field, val] = error.message.split(':');
      return res.status(400).json({ error: `مقدار «${val}» برای ویژگی انتخابی «${field}» مجاز نیست.` });
    }
    if (error?.message?.startsWith('INVALID_MULTI_SELECT_VALUE:')) {
      const [, field, val] = error.message.split(':');
      return res.status(400).json({ error: `گزینه «${val}» در ویژگی چندانتخابی «${field}» نامعتبر است.` });
    }
    if (error?.message?.startsWith('INVALID_BOOLEAN_VALUE:')) {
      const field = error.message.split(':')[1];
      return res.status(400).json({ error: `مقدار واردشده برای ویژگی «${field}» باید بولین (بله/خیر) باشد.` });
    }
    res.status(500).json({ error: 'ذخیره تغییرات نمونه‌کار ناموفق بود' });
  }
});

// DELETE /api/v1/casestudies/:id (Admin — delete case study)
router.delete('/:id', authenticate, requireContentManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر است' });
    }

    const existing = await prisma.caseStudy.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'نمونه‌کار مورد نظر یافت نشد' });
    }

    await prisma.caseStudy.delete({ where: { id } });

    // Audit Log
    if (req.user?.id) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'DELETE_CASE_STUDY',
          targetId: id,
          details: `Deleted case study "${existing.titleFa}"`,
          ipAddress: req.ip || null,
        },
      });
    }

    res.json({ message: 'نمونه‌کار با موفقیت حذف شد' });
  } catch (error) {
    console.error('[casestudies] delete error:', error);
    res.status(500).json({ error: 'حذف نمونه‌کار ناموفق بود' });
  }
});

export default router;
