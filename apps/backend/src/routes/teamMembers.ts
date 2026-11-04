import { Router, Request, Response } from 'express';
import { PrismaClient, ContentStatus } from '@prisma/client';
import { authenticate, requireRoles, AuthenticatedRequest } from '../middleware/auth.js';
import { logAudit } from '../services/auditService.js';
import { triggerRevalidation } from '../services/revalidationService.js';

const router = Router();
const prisma = new PrismaClient();

const requireTeamManager = requireRoles('SUPER_ADMIN', 'ADMIN', 'HR');

function parseId(param: string | string[] | undefined): number {
  const val = Array.isArray(param) ? param[0] : param;
  return val ? parseInt(val, 10) : NaN;
}

// GET /api/v1/team-members (Public - published only)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const members = await prisma.teamMember.findMany({
      where: {
        isPublished: true,
        status: ContentStatus.PUBLISHED,
      },
      orderBy: { position: 'asc' },
    });
    res.json(members);
  } catch (error) {
    console.error('[team-members] public list error:', error);
    res.status(500).json({ error: 'خطا در دریافت لیست اعضای تیم' });
  }
});

// GET /api/v1/team-members/admin (HR & Admin only - all members)
router.get('/admin', authenticate, requireTeamManager, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const members = await prisma.teamMember.findMany({
      orderBy: { position: 'asc' },
    });
    res.json(members);
  } catch (error) {
    console.error('[team-members] admin list error:', error);
    res.status(500).json({ error: 'خطا در دریافت اطلاعات کامل اعضای تیم' });
  }
});

// PUT /api/v1/team-members/reorder (HR & Admin only - batch reorder)
router.put('/reorder', authenticate, requireTeamManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'آرایه items الزامی است' });
    }

    await prisma.$transaction(
      items.map((item: { id: number; position: number }) =>
        prisma.teamMember.update({
          where: { id: Number(item.id) },
          data: { position: Number(item.position) },
        })
      )
    );

    triggerRevalidation({ path: '/about' }).catch(() => {});
    triggerRevalidation({ tag: 'team-members' }).catch(() => {});
    res.json({ message: 'ترتیب اعضای تیم با موفقیت ذخیره شد' });
  } catch (error) {
    console.error('[team-members] reorder error:', error);
    res.status(500).json({ error: 'خطا در تغییر چیدمان اعضای تیم' });
  }
});

// GET /api/v1/team-members/:id
router.get('/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر است' });
    }

    const member = await prisma.teamMember.findUnique({ where: { id } });
    if (!member) {
      return res.status(404).json({ error: 'عضو تیم یافت نشد' });
    }

    const isAuthorized = req.user && ['SUPER_ADMIN', 'ADMIN', 'HR'].includes(req.user.role);
    if (!isAuthorized && (!member.isPublished || member.status !== ContentStatus.PUBLISHED)) {
      return res.status(404).json({ error: 'عضو تیم یافت نشد یا غیرفعال است' });
    }

    res.json(member);
  } catch (error) {
    console.error('[team-members] detail error:', error);
    res.status(500).json({ error: 'خطا در دریافت مشخصات عضو تیم' });
  }
});

// POST /api/v1/team-members (HR & Admin)
router.post('/', authenticate, requireTeamManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      nameFa,
      nameEn = '',
      roleFa,
      roleEn = '',
      departmentFa = 'عمومی',
      departmentEn = 'General',
      bioFa = '',
      bioEn = '',
      photoUrl,
      photoAltFa,
      photoAltEn,
      focalPoint = '50% 50%',
      gallery = [],
      socialLinks = [],
      isPublished = true,
      isLeadership = false,
      status = 'PUBLISHED',
      position,
    } = req.body;

    if (!nameFa || !roleFa) {
      return res.status(400).json({ error: 'نام و سمت شغلی به زبان فارسی الزامی هستند' });
    }

    const count = await prisma.teamMember.count();
    const finalPosition = typeof position === 'number' ? position : count;

    const member = await prisma.teamMember.create({
      data: {
        nameFa,
        nameEn,
        roleFa,
        roleEn,
        departmentFa,
        departmentEn,
        bioFa,
        bioEn,
        photoUrl: photoUrl || null,
        photoAltFa: photoAltFa || nameFa,
        photoAltEn: photoAltEn || nameEn,
        focalPoint,
        gallery: Array.isArray(gallery) ? gallery : [],
        socialLinks,
        isPublished: Boolean(isPublished),
        isLeadership: Boolean(isLeadership),
        status: status in ContentStatus ? (status as ContentStatus) : ContentStatus.PUBLISHED,
        position: finalPosition,
      },
    });

    await logAudit({
      userId: req.user?.id,
      action: 'CREATE_TEAM_MEMBER',
      targetId: member.id,
      details: `Created team member: ${member.nameFa} (${member.roleFa})`,
      ipAddress: req.ip,
    });

    triggerRevalidation({ path: '/about' }).catch(() => {});
    triggerRevalidation({ tag: 'team-members' }).catch(() => {});
    res.status(201).json(member);
  } catch (error) {
    console.error('[team-members] create error:', error);
    res.status(500).json({ error: 'خطا در ثبت عضو جدید تیم' });
  }
});

// PUT /api/v1/team-members/:id (HR & Admin)
router.put('/:id', authenticate, requireTeamManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر است' });
    }

    const {
      nameFa,
      nameEn,
      roleFa,
      roleEn,
      departmentFa,
      departmentEn,
      bioFa,
      bioEn,
      photoUrl,
      photoAltFa,
      photoAltEn,
      focalPoint,
      gallery,
      socialLinks,
      isPublished,
      isLeadership,
      status,
      position,
    } = req.body;

    const data: Record<string, any> = {};
    if (nameFa !== undefined) data.nameFa = nameFa;
    if (nameEn !== undefined) data.nameEn = nameEn;
    if (roleFa !== undefined) data.roleFa = roleFa;
    if (roleEn !== undefined) data.roleEn = roleEn;
    if (departmentFa !== undefined) data.departmentFa = departmentFa;
    if (departmentEn !== undefined) data.departmentEn = departmentEn;
    if (bioFa !== undefined) data.bioFa = bioFa;
    if (bioEn !== undefined) data.bioEn = bioEn;
    if (photoUrl !== undefined) data.photoUrl = photoUrl;
    if (photoAltFa !== undefined) data.photoAltFa = photoAltFa;
    if (photoAltEn !== undefined) data.photoAltEn = photoAltEn;
    if (focalPoint !== undefined) data.focalPoint = focalPoint;
    if (gallery !== undefined) data.gallery = Array.isArray(gallery) ? gallery : [];
    if (socialLinks !== undefined) data.socialLinks = socialLinks;
    if (isPublished !== undefined) data.isPublished = Boolean(isPublished);
    if (isLeadership !== undefined) data.isLeadership = Boolean(isLeadership);
    if (status !== undefined && status in ContentStatus) data.status = status as ContentStatus;
    if (position !== undefined) data.position = Number(position);

    const updated = await prisma.teamMember.update({
      where: { id },
      data,
    });

    await logAudit({
      userId: req.user?.id,
      action: 'UPDATE_TEAM_MEMBER',
      targetId: id,
      details: `Updated team member: ${updated.nameFa}`,
      ipAddress: req.ip,
    });

    triggerRevalidation({ path: '/about' }).catch(() => {});
    triggerRevalidation({ tag: 'team-members' }).catch(() => {});
    res.json(updated);
  } catch (error) {
    console.error('[team-members] update error:', error);
    res.status(500).json({ error: 'خطا در ویرایش عضو تیم' });
  }
});

// DELETE /api/v1/team-members/:id (HR & Admin)
router.delete('/:id', authenticate, requireTeamManager, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'شناسه نامعتبر است' });
    }

    const deleted = await prisma.teamMember.delete({ where: { id } });

    await logAudit({
      userId: req.user?.id,
      action: 'DELETE_TEAM_MEMBER',
      targetId: id,
      details: `Deleted team member: ${deleted.nameFa}`,
      ipAddress: req.ip,
    });

    triggerRevalidation({ path: '/about' }).catch(() => {});
    triggerRevalidation({ tag: 'team-members' }).catch(() => {});
    res.json({ message: 'عضو تیم با موفقیت حذف گردید' });
  } catch (error) {
    console.error('[team-members] delete error:', error);
    res.status(500).json({ error: 'خطا در حذف عضو تیم' });
  }
});

export default router;
