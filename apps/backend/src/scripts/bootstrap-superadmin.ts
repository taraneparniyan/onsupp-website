import { PrismaClient, Prisma, Role } from '@prisma/client';

const defaultPrisma = new PrismaClient();
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 50;

export interface PromotionResult {
  status: 'PROMOTED' | 'ALREADY_PROMOTED';
  email: string;
  userId: number;
}

/**
 * ارتقای امن و اتمیک کاربر اولیه (ID: 1) به Super Admin
 * - بدون ساخت کاربر جدید
 * - حفظ کامل شناسه، هش رمز عبور و اطلاعات پروفایل
 * - اعتبارسنجی دقیق پیش‌شرط‌ها و جلوگیری از تداخل ایمیل
 * - ثبت AuditLog در همان تراکنش اتمیک
 * - idempotent (تکرار عملیات موجب بازنویسی یا خطا نمی‌شود)
 */
export async function promoteInitialAdminToSuperAdmin(client: PrismaClient = defaultPrisma): Promise<PromotionResult> {
  const TARGET_USER_ID = parseInt(process.env.TARGET_USER_ID || '1', 10);
  const EXPECTED_CURRENT_EMAIL = (process.env.EXPECTED_CURRENT_EMAIL || 'admin@onsupp.ir').trim().toLowerCase();
  const NEW_SUPERADMIN_EMAIL = (process.env.NEW_SUPERADMIN_EMAIL || 'taraneparnian2005@gmail.com').trim().toLowerCase();

  let attempt = 0;
  while (attempt < MAX_RETRIES) {
    attempt++;
    try {
      return await client.$transaction(
        async (tx) => {
          // ۱. بررسی وجود کاربر هدف با شناسه مشخص‌شده
          const targetUser = await tx.user.findUnique({
            where: { id: TARGET_USER_ID },
          });

          if (!targetUser) {
            throw new Error(`کاربر هدف با شناسه ${TARGET_USER_ID} در پایگاه داده یافت نشد.`);
          }

          // ۲. بررسی idempotent: اگر کاربر قبلاً ارتقا یافته باشد
          if (targetUser.email.toLowerCase() === NEW_SUPERADMIN_EMAIL && targetUser.role === Role.SUPER_ADMIN) {
            return {
              status: 'ALREADY_PROMOTED',
              email: targetUser.email,
              userId: targetUser.id,
            };
          }

          // ۳. تطابق ایمیل فعلی با پیش‌شرط امنیتی
          if (targetUser.email.toLowerCase() !== EXPECTED_CURRENT_EMAIL) {
            throw new Error(
              `ایمیل فعلی کاربر شناسه ${TARGET_USER_ID} برابر '${targetUser.email}' است که با ایمیل اولیه مورد انتظار '${EXPECTED_CURRENT_EMAIL}' مطابقت ندارد.`
            );
          }

          // ۴. بررسی عدم تصاحب ایمیل جدید توسط کاربر دیگر
          const duplicateUser = await tx.user.findFirst({
            where: {
              email: NEW_SUPERADMIN_EMAIL,
              NOT: { id: TARGET_USER_ID },
            },
          });

          if (duplicateUser) {
            throw new Error(
              `ایمیل جدید '${NEW_SUPERADMIN_EMAIL}' قبلاً توسط کاربر دیگری با شناسه ${duplicateUser.id} ثبت شده است.`
            );
          }

          // ۵. به‌روزرسانی اتمیک کاربر موجود (حفظ کامل شناسه، هش پسورد و اطلاعات پروفایل)
          const updatedUser = await tx.user.update({
            where: { id: TARGET_USER_ID },
            data: {
              email: NEW_SUPERADMIN_EMAIL,
              role: Role.SUPER_ADMIN,
              isActive: true,
            },
          });

          // ۶. ثبت ردپای حسابرسی در همان تراکنش
          await tx.auditLog.create({
            data: {
              userId: updatedUser.id,
              action: 'PROMOTE_SUPER_ADMIN',
              targetId: updatedUser.id,
              details: `ارتقای حساب اولیه از '${EXPECTED_CURRENT_EMAIL}' به '${NEW_SUPERADMIN_EMAIL}' با نقش SUPER_ADMIN.`,
            },
          });

          return {
            status: 'PROMOTED',
            email: updatedUser.email,
            userId: updatedUser.id,
          };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
      );
    } catch (err: any) {
      const isConflict =
        err?.code === 'P2034' ||
        (typeof err?.message === 'string' &&
          (err.message.includes('could not serialize access') ||
            err.message.includes('write conflict') ||
            err.message.includes('deadlock')));

      if (isConflict && attempt < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 25);
        await new Promise((res) => setTimeout(res, delay));
        continue;
      }
      throw err;
    }
  }

  throw new Error('تراکنش ارتقای Super Admin پس از چندین تلاش متوالی با بن‌بست یا خطای همزمانی مواجه شد.');
}

// برای حفظ سازگاری در صورت فراخوانی نام قدیمی
export const bootstrapSuperAdmin = promoteInitialAdminToSuperAdmin;

async function main() {
  try {
    const res = await promoteInitialAdminToSuperAdmin();
    if (res.status === 'ALREADY_PROMOTED') {
      console.log(`[BOOTSTRAP] کاربر شناسه ${res.userId} قبلاً به عنوان SUPER_ADMIN با ایمیل ${res.email} ارتقا یافته است. هیچ تغییری اعمال نشد.`);
    } else {
      console.log(`[BOOTSTRAP SUCCESS] کاربر شناسه ${res.userId} با موفقیت به نقش SUPER_ADMIN ارتقا یافت و ایمیل به ${res.email} تغییر یافت.`);
    }
  } catch (error: any) {
    console.error('[BOOTSTRAP ERROR]:', error.message || error);
    process.exitCode = 1;
  } finally {
    await defaultPrisma.$disconnect();
  }
}

if (process.argv[1]?.includes('bootstrap-superadmin')) {
  main();
}
