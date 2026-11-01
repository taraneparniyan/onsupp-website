import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import { PrismaClient, Prisma } from "@prisma/client";
import {
  authenticate,
  requireAuth,
  AuthenticatedRequest,
} from "../middleware/auth.js";
import { logAudit, getAuditLogs } from "../services/auditService.js";

const router = Router();
export const prisma = new PrismaClient();

const MAX_SERIALIZABLE_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 25;

const SENSITIVE_ROLES = ["SUPER_ADMIN", "ADMIN"] as const;
const HR_ALLOWED_ROLES = ["EMPLOYEE"] as const;

/**
 * Executes a transaction with PostgreSQL Serializable isolation level.
 */
async function runSerializableTransaction<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
  maxRetries = MAX_SERIALIZABLE_RETRIES,
): Promise<T> {
  let attempt = 0;
  while (true) {
    attempt++;
    try {
      return await prisma.$transaction(fn, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error: any) {
      const isSerializationConflict =
        error?.code === "P2034" ||
        (typeof error?.message === "string" &&
          (error.message.includes("could not serialize access") ||
            error.message.includes("write conflict") ||
            error.message.includes("deadlock")));

      if (isSerializationConflict && attempt < maxRetries) {
        const delay =
          BASE_RETRY_DELAY_MS * Math.pow(2, attempt - 1) +
          Math.floor(Math.random() * 20);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      throw error;
    }
  }
}

// GET /api/v1/users/audit-logs - Super Admin only
router.get(
  "/audit-logs",
  authenticate,
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    if (req.user?.role !== "SUPER_ADMIN") {
      return res.status(403).json({
        error: "مشاهده گزارش رویدادهای امنیتی فقط در صلاحیت مدیر ارشد کل است.",
      });
    }

    try {
      const logs = await getAuditLogs(150);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ error: "خطا در دریافت لاگ‌های امنیتی" });
    }
  },
);

// GET /api/v1/users - List all users (Super Admin & HR only; Admin is strictly forbidden)
router.get(
  "/",
  authenticate,
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    const role = req.user?.role;

    // Security Rule: Admin has NO access to employee accounts
    if (role === "ADMIN") {
      return res.status(403).json({
        error: "مدیر سایت به بخش مدیریت کاربران و کارمندان دسترسی ندارد.",
      });
    }

    if (role !== "SUPER_ADMIN" && role !== "HR") {
      return res.status(403).json({ error: "عدم دسترسی کافی." });
    }

    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          phone: true,
          department: true,
          position: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      const formatted = users.map((u) => ({
        ...u,
        isActive: u.isActive,
        phone: u.phone ?? null,
        department: u.department ?? null,
        position: u.position ?? null,
      }));

      res.json(formatted);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "خطا در دریافت لیست کاربران" });
    }
  },
);

// POST /api/v1/users - Create new user (Super Admin & HR only)
router.post(
  "/",
  authenticate,
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    const actorRole = req.user?.role;

    if (actorRole === "ADMIN") {
      return res.status(403).json({
        error: "مدیر سایت مجاز به ایجاد حساب کاربران و کارمندان نیست.",
      });
    }

    if (actorRole !== "SUPER_ADMIN" && actorRole !== "HR") {
      return res.status(403).json({ error: "عدم دسترسی کافی." });
    }

    try {
      const { name, email, password, role, phone, department, position } =
        req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "ایمیل و کلمه عبور الزامی است." });
      }

      const trimmedEmail = String(email).trim().toLowerCase();
      if (!trimmedEmail.includes("@")) {
        return res.status(400).json({ error: "فرمت ایمیل نامعتبر است." });
      }

      if (typeof password !== "string" || password.length < 6) {
        return res
          .status(400)
          .json({ error: "کلمه عبور باید حداقل ۶ نویسه باشد." });
      }

      // Least privilege default is USER
      let targetRole: any = "USER";

      if (actorRole === "HR") {
        // HR can ONLY create EMPLOYEE accounts
        if (role !== undefined && String(role) !== "EMPLOYEE") {
          return res.status(403).json({
            error: "مسئول منابع انسانی تنها مجاز به ایجاد حساب پرسنل (EMPLOYEE) است.",
          });
        }
        targetRole = "EMPLOYEE";
      } else if (actorRole === "SUPER_ADMIN") {
        // Super Admin can assign any valid role; defaults to USER if unspecified
        targetRole = role !== undefined ? String(role) : "USER";
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: trimmedEmail },
      });
      if (existingUser) {
        return res.status(400).json({ error: "این ایمیل قبلاً ثبت شده است." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await prisma.user.create({
        data: {
          name: name ? String(name).trim() : "کاربر جدید",
          email: trimmedEmail,
          password: hashedPassword,
          role: targetRole,
          isActive: true,
          phone: phone ? String(phone).trim() : null,
          department: department ? String(department).trim() : null,
          position: position ? String(position).trim() : null,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      const resUser = {
        ...newUser,
        isActive: true,
        phone: phone ? String(phone).trim() : null,
        department: department ? String(department).trim() : null,
        position: position ? String(position).trim() : null,
      };

      // Audit Log
      await logAudit({
        userId: req.user?.id,
        action: "USER_CREATE",
        targetId: newUser.id,
        details: `Created user ${newUser.email} with role ${newUser.role}`,
        ipAddress: req.ip || req.socket.remoteAddress,
      });

      res.status(201).json(resUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "خطا در ثبت کاربر جدید" });
    }
  },
);

// PUT /api/v1/users/:id - Update user
router.put(
  "/:id",
  authenticate,
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const targetId = parseInt(String(req.params.id), 10);
      if (Number.isNaN(targetId)) {
        return res.status(400).json({ error: "شناسه کاربر نامعتبر است." });
      }

      const actor = req.user;
      if (!actor) return res.status(401).json({ error: "احراز هویت الزامی است." });

      const isSelf = actor.id === targetId;
      const isSuperAdmin = actor.role === "SUPER_ADMIN";
      const isHR = actor.role === "HR";
      const isAdmin = actor.role === "ADMIN";

      // Security Rule: Admin has no access to employee management
      if (isAdmin && !isSelf) {
        return res.status(403).json({
          error: "مدیر سایت دسترسی به ویرایش اطلاعات سایر کاربران و کارمندان ندارد.",
        });
      }

      // Security Rule: Regular employees / users can ONLY edit their own profile
      if (!isSuperAdmin && !isHR && !isSelf) {
        return res.status(403).json({
          error: "شما فقط به ویرایش حساب کاربری خود دسترسی دارید.",
        });
      }

      const { name, email, password, role, phone, department, position, isActive } =
        req.body;

      // Security Rule: Employee cannot escalate role or change email/isActive on self-profile
      if (isSelf && !isSuperAdmin && !isHR) {
        if (role !== undefined && role !== actor.role) {
          return res.status(403).json({
            error: "تغییر سطح دسترسی توسط کاربر عادی مجاز نیست.",
          });
        }
        if (isActive !== undefined) {
          return res.status(403).json({
            error: "تغییر وضعیت فعال بودن توسط کاربر مجاز نیست.",
          });
        }
      }

      const txResult = await runSerializableTransaction(async (tx) => {
        const targetUser = await tx.user.findUnique({ where: { id: targetId } });
        if (!targetUser) {
          return { status: 404, error: "کاربر مورد نظر یافت نشد." };
        }

        // Security Rule: HR cannot edit accounts other than EMPLOYEE
        if (isHR && !isSuperAdmin) {
          if (targetUser.role !== "EMPLOYEE") {
            return {
              status: 403,
              error: "مسئول منابع انسانی تنها مجاز به مدیریت حساب‌های پرسنل (EMPLOYEE) است.",
            };
          }
        }

        // Security Rule: Only SUPER_ADMIN can assign or change roles
        const updateData: any = {};
        let roleChanged = false;
        let oldRole = targetUser.role;
        if (role !== undefined && role !== targetUser.role) {
          if (!isSuperAdmin) {
            return {
              status: 403,
              error: "تغییر سطح دسترسی و نقش کاربران منحصراً در صلاحیت مدیر ارشد کل (SUPER_ADMIN) است.",
            };
          }

          // Prevent demoting the last remaining active SUPER_ADMIN
          if (targetUser.role === "SUPER_ADMIN") {
            const activeSuperAdmins = await tx.user.count({
              where: { role: "SUPER_ADMIN", isActive: true },
            });
            if (activeSuperAdmins <= 1) {
              return {
                status: 400,
                error: "امکان تنزل رتبه آخرین مدیر ارشد کل سیستم (SUPER_ADMIN) وجود ندارد.",
              };
            }
          }

          // Prevent self-demotion if you are the last SUPER_ADMIN
          if (isSelf && targetUser.role === "SUPER_ADMIN") {
            return {
              status: 400,
              error: "تنزل سطح دسترسی حساب کاربری خود توسط مدیر ارشد مجاز نیست.",
            };
          }

          updateData.role = role;
          roleChanged = true;
        }

        if (name !== undefined) updateData.name = String(name).trim();
        if (phone !== undefined) updateData.phone = String(phone).trim();

        // Only HR and SUPER_ADMIN can change department and position
        if (isSuperAdmin || isHR) {
          if (department !== undefined) updateData.department = String(department).trim();
          if (position !== undefined) updateData.position = String(position).trim();
        }

        // Email can only be changed by Super Admin
        if (email !== undefined) {
          const trimmedEmail = String(email).trim().toLowerCase();
          if (trimmedEmail !== targetUser.email) {
            if (!isSuperAdmin) {
              return { status: 403, error: "تغییر آدرس ایمیل تنها توسط مدیر ارشد کل مجاز است." };
            }
            const emailExists = await tx.user.findUnique({
              where: { email: trimmedEmail },
            });
            if (emailExists) {
              return { status: 400, error: "این ایمیل قبلاً ثبت شده است." };
            }
            updateData.email = trimmedEmail;
          }
        }

        if ((isSuperAdmin || isHR) && isActive !== undefined) {
          // Cannot deactivate self
          if (isSelf && isActive === false) {
            return { status: 400, error: "امکان غیرفعال‌سازی حساب کاربری خود وجود ندارد." };
          }
          updateData.isActive = Boolean(isActive);
        }

        if (password && typeof password === "string" && password.trim() !== "") {
          if (password.length < 6) {
            return { status: 400, error: "کلمه عبور باید حداقل ۶ نویسه باشد." };
          }
          updateData.password = await bcrypt.hash(password, 10);
        }

        const safeUpdateData: any = {};
        if (updateData.name !== undefined) safeUpdateData.name = updateData.name;
        if (updateData.email !== undefined) safeUpdateData.email = updateData.email;
        if (updateData.password !== undefined) safeUpdateData.password = updateData.password;
        if (updateData.role !== undefined) safeUpdateData.role = updateData.role;
        if (updateData.isActive !== undefined) safeUpdateData.isActive = updateData.isActive;
        if (updateData.phone !== undefined) safeUpdateData.phone = updateData.phone;
        if (updateData.department !== undefined) safeUpdateData.department = updateData.department;
        if (updateData.position !== undefined) safeUpdateData.position = updateData.position;

        const updated = await tx.user.update({
          where: { id: targetId },
          data: safeUpdateData,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        });

        const resUpdated = {
          ...updated,
          isActive: safeUpdateData.isActive !== undefined ? safeUpdateData.isActive : targetUser.isActive,
          phone: safeUpdateData.phone !== undefined ? safeUpdateData.phone : targetUser.phone,
          department: safeUpdateData.department !== undefined ? safeUpdateData.department : targetUser.department,
          position: safeUpdateData.position !== undefined ? safeUpdateData.position : targetUser.position,
        };

        return {
          status: 200,
          user: resUpdated,
          roleChanged,
          oldRole,
          newRole: updated.role,
        };
      });

      if (txResult.status !== 200 || !txResult.user) {
        return res.status(txResult.status).json({ error: txResult.error });
      }

      // Audit Logs
      if (txResult.roleChanged) {
        await logAudit({
          userId: actor.id,
          action: "ROLE_CHANGE",
          targetId,
          details: `Changed role of user ${txResult.user.email} from ${txResult.oldRole} to ${txResult.newRole}`,
          ipAddress: req.ip || req.socket.remoteAddress,
        });
      } else {
        await logAudit({
          userId: actor.id,
          action: "USER_UPDATE",
          targetId,
          details: `Updated details of user ${txResult.user.email}`,
          ipAddress: req.ip || req.socket.remoteAddress,
        });
      }

      res.json(txResult.user);
    } catch (error: any) {
      if (error?.code === "P2034") {
        return res.status(409).json({
          error: "تداخل در انجام عملیات هم‌زمان. لطفاً مجدداً تلاش کنید.",
        });
      }
      console.error("Error updating user:", error);
      res.status(500).json({ error: "خطا در بروزرسانی کاربر" });
    }
  },
);

// PATCH /api/v1/users/:id/toggle-status - Deactivate or activate employee account
router.patch(
  "/:id/toggle-status",
  authenticate,
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const targetId = parseInt(String(req.params.id), 10);
      if (Number.isNaN(targetId)) {
        return res.status(400).json({ error: "شناسه کاربر نامعتبر است." });
      }

      const actor = req.user;
      if (!actor) return res.status(401).json({ error: "احراز هویت الزامی است." });

      const isSuperAdmin = actor.role === "SUPER_ADMIN";
      const isHR = actor.role === "HR";

      if (!isSuperAdmin && !isHR) {
        return res.status(403).json({
          error: "تنها مدیر ارشد و مسئول منابع انسانی مجاز به تغییر وضعیت حساب کارمندان هستند.",
        });
      }

      // Cannot deactivate self
      if (actor.id === targetId) {
        return res.status(400).json({ error: "امکان غیرفعال‌سازی حساب کاربری خود وجود ندارد." });
      }

      const txResult = await runSerializableTransaction(async (tx) => {
        const targetUser = await tx.user.findUnique({ where: { id: targetId } });
        if (!targetUser) {
          return { status: 404, error: "کاربر مورد نظر یافت نشد." };
        }

        // HR can only toggle status of EMPLOYEE accounts
        if (isHR && !isSuperAdmin) {
          if (targetUser.role !== "EMPLOYEE") {
            return {
              status: 403,
              error: "مسئول منابع انسانی تنها مجاز به تغییر وضعیت حساب‌های پرسنل (EMPLOYEE) است.",
            };
          }
        }

        // Prevent deactivating the last remaining Super Admin
        if (targetUser.role === "SUPER_ADMIN") {
          const activeSuperAdmins = await tx.user.count({
            where: { role: "SUPER_ADMIN", isActive: true },
          });
          if (activeSuperAdmins <= 1) {
            return {
              status: 400,
              error: "امکان غیرفعال‌سازی آخرین مدیر ارشد فعال سیستم وجود ندارد.",
            };
          }
        }

        const newStatus = !targetUser.isActive;

        // Persist isActive update to PostgreSQL via Prisma
        const updated = await tx.user.update({
          where: { id: targetId },
          data: { isActive: newStatus },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        });

        const resUser = {
          ...updated,
          isActive: newStatus,
        };

        return { status: 200, user: resUser, newStatus };
      });

      if (txResult.status !== 200 || !txResult.user) {
        return res.status(txResult.status).json({ error: txResult.error });
      }

      await logAudit({
        userId: actor.id,
        action: txResult.newStatus ? "USER_ACTIVATE" : "USER_DEACTIVATE",
        targetId,
        details: `${txResult.newStatus ? "Activated" : "Deactivated"} account of user ${txResult.user.email}`,
        ipAddress: req.ip || req.socket.remoteAddress,
      });

      res.json({
        success: true,
        message: txResult.newStatus
          ? "حساب کاربر با موفقیت فعال شد."
          : "حساب کاربر غیرفعال شد و امکان ورود نخواهد داشت.",
        user: txResult.user,
      });
    } catch (error: any) {
      console.error("Error toggling user status:", error);
      res.status(500).json({ error: "خطا در تغییر وضعیت حساب کاربری" });
    }
  },
);

// DELETE /api/v1/users/:id - Permanent deletion (Super Admin ONLY)
// By default, soft deactivation (/toggle-status) should be used instead of permanent delete.
router.delete(
  "/:id",
  authenticate,
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const targetId = parseInt(String(req.params.id), 10);
      if (Number.isNaN(targetId)) {
        return res.status(400).json({ error: "شناسه کاربر نامعتبر است." });
      }

      if (req.user?.role !== "SUPER_ADMIN") {
        return res.status(403).json({
          error: "حذف دائمی کاربر تنها در صلاحیت مدیر ارشد کل (SUPER_ADMIN) است. لطفاً از قابلیت غیرفعال‌سازی استفاده کنید.",
        });
      }

      // 1. Prevent self-deletion
      if (req.user?.id === targetId) {
        return res.status(400).json({
          error: "امکان حذف حساب کاربری خود توسط مدیر وجود ندارد.",
        });
      }

      // 2. Prevent deleting the last remaining SUPER_ADMIN
      const txResult = await runSerializableTransaction(async (tx) => {
        const targetUser = await tx.user.findUnique({ where: { id: targetId } });
        if (!targetUser) {
          return { status: 404, error: "کاربر مورد نظر یافت نشد." };
        }

        if (targetUser.role === "SUPER_ADMIN") {
          const activeSuperAdmins = await tx.user.count({
            where: { role: "SUPER_ADMIN", isActive: true },
          });
          if (activeSuperAdmins <= 1) {
            return {
              status: 400,
              error: "امکان حذف آخرین مدیر ارشد فعال سیستم وجود ندارد.",
            };
          }
        }

        await tx.user.delete({ where: { id: targetId } });
        return { status: 200, targetUser };
      });

      if (txResult.status !== 200 || !txResult.targetUser) {
        return res.status(txResult.status).json({ error: txResult.error });
      }

      await logAudit({
        userId: req.user?.id,
        action: "USER_DELETE",
        targetId,
        details: `Permanently deleted user ${txResult.targetUser.email}`,
        ipAddress: req.ip || req.socket.remoteAddress,
      });

      res.json({ success: true, message: "کاربر با موفقیت حذف شد" });
    } catch (error: any) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "خطا در حذف کاربر" });
    }
  },
);

export default router;
