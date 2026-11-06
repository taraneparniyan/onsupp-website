import { Router, Request, Response } from 'express';
import { PrismaClient, PublicationStatus } from '@prisma/client';
import { authenticate, requireRoles, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

const requireTeamManager = requireRoles('SUPER_ADMIN', 'ADMIN', 'HR');

const TEAM_FIELDS = [
  'nameFa',
  'nameEn',
  'roleFa',
  'roleEn',
  'departmentFa',
  'departmentEn',
  'bioFa',
  'bioEn',
  'avatarUrl',
  'additionalImages',
  'focalPoint',
  'socialLinks',
  'position',
  'isPublished',
  'status',
] as const;

function extractTeamData(body: any) {
  const data: Record<string, any> = {};
  for (const field of TEAM_FIELDS) {
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

// GET /api/v1/team (Public — published members only)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const members = await prisma.teamMember.findMany({
      where: {
        isPublished: true,
        status: PublicationStatus.PUBLISHED,
      },
      orderBy: { position: 'asc' },
    });
    res.json(members);
  } catch (error) {
    console.error('[team] public list error:', error);
    res.status(500).json({ error: 'خطا در دریافت لیست اعضای تیم' });
  }
});

// GET /api/v1/team/all (Admin/HR — all members including drafts)
router.get('/all', authenticate, requireTeamManager, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const members = await prisma.teamMember.findMany({
      orderBy: { position: 'asc' },
    });
    res.json(members);
  } catch (error) {
    console.error('[team] admin list error:', error);
    res.status(500).json({ error: 'خطا در دریافت لیست مدیریت تیم' });
  }
});

// GET /api/v1/team/:id (Public/Admin single member lookup)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر است' });
    }

    const member = await prisma.teamMember.findUnique({ where: { id } });
    if (!member) {
      return res.status(404).json({ error: 'عضو تیم یافت نشد' });
    }

    res.json(member);
  } catch (error) {
    console.error('[team] single lookup error:', error);
    res.status(500).json({ error: 'خطا در دریافت اطلاعات عضو تیم' });
  }
});

// POST /api/v1/team (Admin/HR — create team member)
router.post('/', authenticate, requireTeamManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = extractTeamData(req.body);

    if (!data.nameFa || !data.roleFa || !data.departmentFa) {
      return res.status(400).json({ error: 'نام، عنوان شغلی و دپارتمان به زبان فارسی الزامی هستند' });
    }

    if (data.position === undefined) {
      data.position = await prisma.teamMember.count();
    }

    const member = await prisma.teamMember.create({ data: data as any });

    // Audit Log
    if (req.user?.id) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'CREATE_TEAM_MEMBER',
          targetId: member.id,
          details: `Added team member "${member.nameFa}" (${member.roleFa})`,
          ipAddress: req.ip || null,
        },
      });
    }

    res.status(201).json(member);
  } catch (error) {
    console.error('[team] create error:', error);
    res.status(500).json({ error: 'افزودن عضو جدید تیم ناموفق بود' });
  }
});

// PUT /api/v1/team/:id (Admin/HR — update team member)
router.put('/:id', authenticate, requireTeamManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر است' });
    }

    const data = extractTeamData(req.body);

    const member = await prisma.teamMember.update({
      where: { id },
      data: data as any,
    });

    // Audit Log
    if (req.user?.id) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'UPDATE_TEAM_MEMBER',
          targetId: member.id,
          details: `Updated team member "${member.nameFa}"`,
          ipAddress: req.ip || null,
        },
      });
    }

    res.json(member);
  } catch (error) {
    console.error('[team] update error:', error);
    res.status(500).json({ error: 'ذخیره تغییرات عضو تیم ناموفق بود' });
  }
});

// DELETE /api/v1/team/:id (Admin/HR — delete team member)
router.delete('/:id', authenticate, requireTeamManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر است' });
    }

    const existing = await prisma.teamMember.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'عضو تیم یافت نشد' });
    }

    await prisma.teamMember.delete({ where: { id } });

    // Audit Log
    if (req.user?.id) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'DELETE_TEAM_MEMBER',
          targetId: id,
          details: `Deleted team member "${existing.nameFa}"`,
          ipAddress: req.ip || null,
        },
      });
    }

    res.json({ message: 'عضو تیم با موفقیت حذف شد' });
  } catch (error) {
    console.error('[team] delete error:', error);
    res.status(500).json({ error: 'حذف عضو تیم ناموفق بود' });
  }
});

export default router;
