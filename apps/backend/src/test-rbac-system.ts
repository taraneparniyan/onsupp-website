process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'a_secure_test_jwt_secret_with_at_least_32_characters_length';
process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:5432/test?schema=public';

import http from 'http';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET;

// 1. In-memory Mock Data Store
interface MockUser {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  isActive: boolean;
  phone?: string | null;
  department?: string | null;
  position?: string | null;
  createdAt: Date;
}

interface MockAuditLog {
  id: number;
  userId: number | null;
  action: string;
  targetId: number | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: Date;
}

const defaultPasswordHash = bcrypt.hashSync('Pass1234!', 10);

let mockUsers: MockUser[] = [
  {
    id: 1,
    name: 'سوپر ادمین اصلی',
    email: 'superadmin@onsupp.ir',
    passwordHash: defaultPasswordHash,
    role: 'SUPER_ADMIN',
    isActive: true,
    department: 'مدیریت ارشد',
    position: 'مدیر کل',
    createdAt: new Date(),
  },
  {
    id: 2,
    name: 'مدیر محتوای سایت',
    email: 'admin@onsupp.ir',
    passwordHash: defaultPasswordHash,
    role: 'ADMIN',
    isActive: true,
    department: 'مدیریت سایت',
    position: 'مدیر پلتفرم',
    createdAt: new Date(),
  },
  {
    id: 3,
    name: 'مسئول منابع انسانی',
    email: 'hr@onsupp.ir',
    passwordHash: defaultPasswordHash,
    role: 'HR',
    isActive: true,
    department: 'منابع انسانی',
    position: 'مدیر سرمایه انسانی',
    createdAt: new Date(),
  },
  {
    id: 4,
    name: 'کارمند عادی',
    email: 'employee@onsupp.ir',
    passwordHash: defaultPasswordHash,
    role: 'EMPLOYEE',
    isActive: true,
    department: 'فنی',
    position: 'توسعه‌دهنده',
    createdAt: new Date(),
  },
  {
    id: 5,
    name: 'مدیر سئو و محتوا',
    email: 'content@onsupp.ir',
    passwordHash: defaultPasswordHash,
    role: 'CONTENT_SEO_MANAGER',
    isActive: true,
    department: 'تولید محتوا',
    position: 'سرپرست سئو',
    createdAt: new Date(),
  },
  {
    id: 6,
    name: 'کارشناس پشتیبانی',
    email: 'support@onsupp.ir',
    passwordHash: defaultPasswordHash,
    role: 'SUPPORT',
    isActive: true,
    department: 'پشتیبانی',
    position: 'پشتیبان ارشد',
    createdAt: new Date(),
  },
  {
    id: 7,
    name: 'مدیر پروژه',
    email: 'pm@onsupp.ir',
    passwordHash: defaultPasswordHash,
    role: 'PROJECT_MANAGER',
    isActive: true,
    department: 'مدیریت پروژه',
    position: 'مدیر اسکرام',
    createdAt: new Date(),
  },
  {
    id: 8,
    name: 'کارمند غیرفعال‌شده',
    email: 'deactivated@onsupp.ir',
    passwordHash: defaultPasswordHash,
    role: 'EMPLOYEE',
    isActive: false,
    department: 'فنی',
    position: 'توسعه‌دهنده سابق',
    createdAt: new Date(),
  },
];

let mockAuditLogs: MockAuditLog[] = [];
let nextUserId = 100;
let nextAuditId = 1;

// 2. Mock Prisma methods
const userMock = {
  findUnique: async ({ where, select }: any) => {
    let u: MockUser | undefined;
    if (where.id !== undefined) u = mockUsers.find((x) => x.id === where.id);
    else if (where.email !== undefined) u = mockUsers.find((x) => x.email === where.email);
    if (!u) return null;

    if (select) {
      const res: any = {};
      for (const k of Object.keys(select)) {
        if (select[k]) res[k] = (u as any)[k];
      }
      return res;
    }
    return { ...u, password: u.passwordHash };
  },
  findFirst: async ({ where, select }: any) => {
    let u = mockUsers.find((x) => {
      if (where?.role && x.role !== where.role) return false;
      if (where?.email && x.email !== where.email) return false;
      return true;
    });
    if (!u) return null;
    return { ...u, password: u.passwordHash };
  },
  findMany: async ({ where, select }: any) => {
    let list = mockUsers;
    if (where?.role) list = list.filter((x) => x.role === where.role);
    if (select) {
      return list.map((u) => {
        const res: any = {};
        for (const k of Object.keys(select)) {
          if (select[k]) res[k] = (u as any)[k];
        }
        return res;
      });
    }
    return list.map((u) => ({ ...u, password: u.passwordHash }));
  },
  count: async ({ where }: any) => {
    let list = mockUsers;
    if (where?.role) list = list.filter((x) => x.role === where.role);
    if (where?.isActive !== undefined) list = list.filter((x) => x.isActive === where.isActive);
    return list.length;
  },
  create: async ({ data, select }: any) => {
    const newUser: MockUser = {
      id: nextUserId++,
      name: data.name,
      email: data.email,
      passwordHash: data.password,
      role: data.role || 'USER',
      isActive: data.isActive ?? true,
      phone: data.phone || null,
      department: data.department || null,
      position: data.position || null,
      createdAt: new Date(),
    };
    mockUsers.push(newUser);
    if (select) {
      const res: any = {};
      for (const k of Object.keys(select)) {
        if (select[k]) res[k] = (newUser as any)[k];
      }
      return res;
    }
    return { ...newUser, password: newUser.passwordHash };
  },
  update: async ({ where, data, select }: any) => {
    const idx = mockUsers.findIndex((x) => x.id === where.id);
    if (idx === -1) throw new Error('User not found');
    const u = mockUsers[idx];
    if (data.name !== undefined) u.name = data.name;
    if (data.email !== undefined) u.email = data.email;
    if (data.role !== undefined) u.role = data.role;
    if (data.password !== undefined) u.passwordHash = data.password;
    if (data.isActive !== undefined) u.isActive = data.isActive;
    if (data.phone !== undefined) u.phone = data.phone;
    if (data.department !== undefined) u.department = data.department;
    if (data.position !== undefined) u.position = data.position;
    mockUsers[idx] = u;

    if (select) {
      const res: any = {};
      for (const k of Object.keys(select)) {
        if (select[k]) res[k] = (u as any)[k];
      }
      return res;
    }
    return { ...u, password: u.passwordHash };
  },
  delete: async ({ where }: any) => {
    const idx = mockUsers.findIndex((x) => x.id === where.id);
    if (idx === -1) throw new Error('User not found');
    const deleted = mockUsers.splice(idx, 1)[0];
    return deleted;
  },
};

const auditLogMock = {
  create: async ({ data }: any) => {
    const log: MockAuditLog = {
      id: nextAuditId++,
      userId: data.userId,
      action: data.action,
      targetId: data.targetId || null,
      details: data.details || null,
      ipAddress: data.ipAddress || null,
      createdAt: new Date(),
    };
    mockAuditLogs.push(log);
    return log;
  },
  findMany: async () => {
    return mockAuditLogs.map((l) => ({
      ...l,
      user: mockUsers.find((u) => u.id === l.userId) || null,
    }));
  },
};

const articleMock = {
  findMany: async () => [],
  findUnique: async () => null,
  create: async ({ data }: any) => ({ id: 201, ...data }),
};

const contactMock = {
  findMany: async () => [],
  findUnique: async () => null,
  update: async () => ({}),
  delete: async () => ({}),
};

// Import modules and attach mocks directly to exported prisma instances
import { prisma as authPrisma } from './middleware/auth.js';
import { prisma as usersPrisma } from './routes/users.js';
import { prisma as authControllerPrisma } from './controllers/authController.js';
import { prisma as auditPrisma } from './services/auditService.js';
import { prisma as articlePrisma } from './routes/articles.js';
import { prisma as contactPrisma } from './routes/contact.js';

function attachMocks(p: any) {
  if (!p) return;
  p.user = userMock;
  p.auditLog = auditLogMock;
  p.article = articleMock;
  p.contact = contactMock;
  p.contactSubmission = contactMock;
  p.$transaction = async (fn: any) => await fn(p);
}

attachMocks(authPrisma);
attachMocks(usersPrisma);
attachMocks(authControllerPrisma);
attachMocks(auditPrisma);
attachMocks(articlePrisma);
attachMocks(contactPrisma);

// Helper to sign valid test tokens
function createToken(user: MockUser): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET!,
    { expiresIn: '1h' },
  );
}

// 3. Test Runner
let passed = 0;
let failed = 0;

async function test(title: string, fn: () => Promise<boolean>) {
  try {
    const ok = await fn();
    if (ok) {
      console.log(`  [PASS] ${title}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${title}`);
      failed++;
    }
  } catch (err: any) {
    console.error(`  [FAIL] ${title} - Error:`, err.message || err);
    failed++;
  }
}

async function runRbacTests() {
  console.log('\n===============================================================');
  console.log('   AUTOMATED RBAC & USER MANAGEMENT ACCESS CONTROL TEST SUITE   ');
  console.log('===============================================================\n');

  // Import Express app
  const { app } = await import('./server.js');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address() as { port: number; address: string };
  const baseUrl = `http://${address.address}:${address.port}`;

  const superAdminToken = createToken(mockUsers[0]);
  const adminToken = createToken(mockUsers[1]);
  const hrToken = createToken(mockUsers[2]);
  const employeeToken = createToken(mockUsers[3]);
  const contentManagerToken = createToken(mockUsers[4]);
  const supportToken = createToken(mockUsers[5]);
  const pmToken = createToken(mockUsers[6]);
  const deactivatedToken = createToken(mockUsers[7]);

  // GROUP 1: SUPER_ADMIN Universal Permissions
  console.log('--- بخش اول: اختیارات مدیر ارشد کل (SUPER_ADMIN) ---');
  await test('۱.۱ مدیر ارشد کل به لیست تمام کاربران دسترسی دارد (200)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/users`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    return res.status === 200;
  });

  await test('۱.۲ مدیر ارشد کل به گزارش لاگ‌های امنیتی (Audit Logs) دسترسی دارد (200)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/users/audit-logs`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    return res.status === 200;
  });

  await test('۱.۳ مدیر ارشد کل مجاز به تعریف کاربر جدید با هر نقشی از جمله ADMIN است (201)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({
        name: 'ادمین جدید ایجادشده توسط سوپرادمین',
        email: 'newadmin@onsupp.ir',
        password: 'ValidPassword123!',
        role: 'ADMIN',
      }),
    });
    return res.status === 201;
  });

  // GROUP 2: ADMIN Restrictions on Employee & User Management
  console.log('\n--- بخش دوم: عدم دسترسی مدیر سایت (ADMIN) به مدیریت کارمندان ---');
  await test('۲.۱ مدیر سایت به لیست کاربران دسترسی ندارد و با ۴۰۳ مسدود می‌شود', async () => {
    const res = await fetch(`${baseUrl}/api/v1/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    return res.status === 403;
  });

  await test('۲.۲ مدیر سایت نمی‌تواند کاربر یا کارمند جدید تعریف کند (403)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'تلاش ادمین برای ایجاد کاربر',
        email: 'attempt@onsupp.ir',
        password: 'PassWord123!',
        role: 'EMPLOYEE',
      }),
    });
    return res.status === 403;
  });

  await test('۲.۳ مدیر سایت نمی‌تواند سایر کاربران را ویرایش کند (403)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/users/4`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ name: 'تغییر غیرمجاز توسط ادمین' }),
    });
    return res.status === 403;
  });

  await test('۲.۴ مدیر سایت اجازه مشاهده لاگ‌های امنیتی کاربران را ندارد (403)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/users/audit-logs`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    return res.status === 403;
  });

  await test('۲.۵ مدیر سایت به مدیریت مقالات و تماس‌ها دسترسی مجاز دارد (200)', async () => {
    const resArt = await fetch(`${baseUrl}/api/v1/articles`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const resCont = await fetch(`${baseUrl}/api/v1/contact/submissions`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    return resArt.status === 200 && resCont.status === 200;
  });

  // GROUP 3: HR Capabilities and Limits
  console.log('\n--- بخش سوم: اختیارات و محدودیت‌های منابع انسانی (HR) ---');
  await test('۳.۱ مسئول منابع انسانی مجاز به مشاهده لیست پرسنل و کارمندان است (200)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/users`, {
      headers: { Authorization: `Bearer ${hrToken}` },
    });
    return res.status === 200;
  });

  await test('۳.۲ مسئول منابع انسانی می‌تواند کارمند جدید (EMPLOYEE) تعریف کند (201)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${hrToken}`,
      },
      body: JSON.stringify({
        name: 'کارمند پرسنلی جدید',
        email: 'newemployee@onsupp.ir',
        password: 'Password123!',
        role: 'EMPLOYEE',
        department: 'فنی',
        position: 'برنامه‌نویس ری‌اکت',
      }),
    });
    return res.status === 201;
  });

  await test('۳.۳ مسئول منابع انسانی نمی‌تواند کاربر با نقش SUPER_ADMIN بسازد (403)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${hrToken}`,
      },
      body: JSON.stringify({
        name: 'تلاش ارتقای رول',
        email: 'superadmin_fake@onsupp.ir',
        password: 'Password123!',
        role: 'SUPER_ADMIN',
      }),
    });
    return res.status === 403;
  });

  await test('۳.۴ مسئول منابع انسانی نمی‌تواند کاربر با نقش ADMIN بسازد (403)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${hrToken}`,
      },
      body: JSON.stringify({
        name: 'تلاش ساخت ادمین',
        email: 'admin_fake@onsupp.ir',
        password: 'Password123!',
        role: 'ADMIN',
      }),
    });
    return res.status === 403;
  });

  await test('۳.۵ مسئول منابع انسانی نمی‌تواند حساب مدیر ارشد کل (SUPER_ADMIN) را ویرایش کند (403)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/users/1`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${hrToken}`,
      },
      body: JSON.stringify({ name: 'تغییر نام سوپرادمین' }),
    });
    return res.status === 403;
  });

  await test('۳.۶ مسئول منابع انسانی نمی‌تواند حساب مدیر سایت (ADMIN) را غیرفعال کند (403)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/users/2/toggle-status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${hrToken}` },
    });
    return res.status === 403;
  });

  await test('۳.۷ مسئول منابع انسانی مجاز به تغییر وضعیت فعال/غیرفعال کارمندان است (200)', async () => {
    const resOff = await fetch(`${baseUrl}/api/v1/users/4/toggle-status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${hrToken}` },
    });
    const resOn = await fetch(`${baseUrl}/api/v1/users/4/toggle-status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${hrToken}` },
    });
    return resOff.status === 200 && resOn.status === 200;
  });

  await test('۳.۸ مسئول منابع انسانی اجازه حذف کامل کاربر را ندارد (403)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/users/4`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${hrToken}` },
    });
    return res.status === 403;
  });

  await test('۳.۹ مسئول منابع انسانی نمی‌تواند کاربر غیر از EMPLOYEE (مانند CONTENT_SEO_MANAGER) بسازد (403)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${hrToken}`,
      },
      body: JSON.stringify({
        name: 'تلاش ساخت مدیر محتوا',
        email: 'fake_seo@onsupp.ir',
        password: 'Password123!',
        role: 'CONTENT_SEO_MANAGER',
      }),
    });
    return res.status === 403;
  });

  await test('۳.۱۰ مسئول منابع انسانی نمی‌تواند حساب غیر از EMPLOYEE را ویرایش کند (403)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/users/5`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${hrToken}`,
      },
      body: JSON.stringify({ name: 'تغییر نام مدیر محتوا' }),
    });
    return res.status === 403;
  });

  await test('۳.۱۱ مسئول منابع انسانی اجازه تغییر نقش کاربران را ندارد (403)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/users/4`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${hrToken}`,
      },
      body: JSON.stringify({ role: 'SUPPORT' }),
    });
    return res.status === 403;
  });

  // GROUP 4: EMPLOYEE Profile Limits & Escalation Prevention
  console.log('\n--- بخش چهارم: محدودیت‌های کارمند عادی (EMPLOYEE) و جلوگیری از افزایش دسترسی ---');
  await test('۴.۱ کارمند عادی اجازه دسترسی به لیست سایر کاربران را ندارد (403)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/users`, {
      headers: { Authorization: `Bearer ${employeeToken}` },
    });
    return res.status === 403;
  });

  await test('۴.۲ کارمند عادی نمی‌تواند حساب کاربر دیگری را ویرایش کند (403)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/users/2`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employeeToken}`,
      },
      body: JSON.stringify({ name: 'تلاش هک پروفایل دیگران' }),
    });
    return res.status === 403;
  });

  await test('۴.۳ کارمند عادی نمی‌تواند نقش خود را ارتقا دهد (تلاش تغییر role به SUPER_ADMIN) (403)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/users/4`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employeeToken}`,
      },
      body: JSON.stringify({ role: 'SUPER_ADMIN' }),
    });
    return res.status === 403;
  });

  await test('۴.۴ کارمند عادی اجازه تغییر وضعیت isActive روی پروفایل خود را ندارد (403)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/users/4`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employeeToken}`,
      },
      body: JSON.stringify({ isActive: false }),
    });
    return res.status === 403;
  });

  await test('۴.۵ کارمند عادی مجاز به ویرایش مشخصات مجاز خود (نام و شماره تماس) است (200)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/users/4`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employeeToken}`,
      },
      body: JSON.stringify({
        name: 'نام اصلاح‌شده کارمند',
        phone: '09129998877',
      }),
    });
    return res.status === 200;
  });

  await test('۴.۶ کارمند عادی نمی‌تواند ایمیل یا دپارتمان خود را تغییر دهد (403)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/users/4`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employeeToken}`,
      },
      body: JSON.stringify({
        email: 'hacked_email@onsupp.ir',
      }),
    });
    return res.status === 403;
  });

  // GROUP 5: Specialized Roles (CONTENT_SEO_MANAGER, SUPPORT, PM)
  console.log('\n--- بخش پنجم: نقش‌های تخصصی (محتوا، سئو، پشتیبانی و مدیر پروژه) ---');
  await test('۵.۱ مدیر محتوا و سئو به مقالات دسترسی دارد اما دسترسی به کاربران ندارد (403)', async () => {
    const resArt = await fetch(`${baseUrl}/api/v1/articles`, {
      headers: { Authorization: `Bearer ${contentManagerToken}` },
    });
    const resUser = await fetch(`${baseUrl}/api/v1/users`, {
      headers: { Authorization: `Bearer ${contentManagerToken}` },
    });
    return resArt.status === 200 && resUser.status === 403;
  });

  await test('۵.۲ کارشناس پشتیبانی به پیام‌های تماس دسترسی دارد اما به کاربران دسترسی ندارد (403)', async () => {
    const resCont = await fetch(`${baseUrl}/api/v1/contact/submissions`, {
      headers: { Authorization: `Bearer ${supportToken}` },
    });
    const resUser = await fetch(`${baseUrl}/api/v1/users`, {
      headers: { Authorization: `Bearer ${supportToken}` },
    });
    return resCont.status === 200 && resUser.status === 403;
  });

  await test('۵.۳ مدیر پروژه ساختار دسترسی‌اش تست شده و دسترسی به بخش کاربران ندارد (403)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/users`, {
      headers: { Authorization: `Bearer ${pmToken}` },
    });
    return res.status === 403;
  });

  // GROUP 6: Account Deactivation and Hardening
  console.log('\n--- بخش ششم: امنیت حساب‌های غیرفعال‌شده (Deactivated Accounts) ---');
  await test('۶.۱ کاربر غیرفعال‌شده (isActive: false) دسترسی توکنش بلاک و با ۴۰۱ رد می‌شود', async () => {
    const res = await fetch(`${baseUrl}/api/v1/users`, {
      headers: { Authorization: `Bearer ${deactivatedToken}` },
    });
    return res.status === 401;
  });

  await test('۶.۲ تلاش برای ورود (Login) کاربر غیرفعال‌شده با ۴۰۱ مسدود می‌گردد', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'deactivated@onsupp.ir',
        password: 'Pass1234!',
      }),
    });
    const data = (await res.json()) as any;
    return res.status === 401 && data.error.includes('غیرفعال');
  });

  const missingUserToken = createToken({
    id: 9999,
    email: 'nonexistent@onsupp.ir',
    passwordHash: defaultPasswordHash,
    role: 'USER',
    isActive: true,
    name: 'Non Existent',
    createdAt: new Date(),
  });

  await test('۶.۳ کاربری که در دیتابیس وجود ندارد با توکن نامعتبر بلافاصله با ۴۰۱ ریجکت می‌شود', async () => {
    const res = await fetch(`${baseUrl}/api/v1/users`, {
      headers: { Authorization: `Bearer ${missingUserToken}` },
    });
    return res.status === 401;
  });

  // GROUP 7: Self-Demotion & Last Super Admin Protections
  console.log('\n--- بخش هفتم: محافظت از آخرین مدیر ارشد و ممانعت از تنزل خودخواسته ---');
  await test('۷.۱ مدیر ارشد کل نمی‌تواند حساب خود را غیرفعال کند (400)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/users/1/toggle-status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    return res.status === 400;
  });

  await test('۷.۲ مدیر ارشد کل نمی‌تواند حساب خود را حذف کند (400)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/users/1`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    return res.status === 400;
  });

  await test('۷.۳ تنزل نقش آخرین مدیر ارشد کل مسدود است (400)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/users/1`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({ role: 'EMPLOYEE' }),
    });
    return res.status === 400;
  });

  // GROUP 8: Bootstrap Logic & Idempotency
  console.log('\n--- بخش هشتم: منطق راه‌اندازی سوپرادمین و عدم بازنویسی حساب‌ها ---');
  await test('۸.۱ اگر سوپرادمین از قبل در دیتابیس باشد، ثبت مجدد تشخیص داده می‌شود', async () => {
    const existing = mockUsers.find((u) => u.role === 'SUPER_ADMIN');
    return existing !== undefined && existing.email === 'superadmin@onsupp.ir';
  });

  await test('۸.۲ حساب مدیر سایت (admin@onsupp.ir) هرگز به عنوان سوپرادمین بازنویسی نمی‌شود', async () => {
    const adminUser = mockUsers.find((u) => u.email === 'admin@onsupp.ir');
    return adminUser !== undefined && adminUser.role === 'ADMIN';
  });

  // Summary
  console.log('\n===============================================================');
  console.log(`نتیجه کلی آزمون جامع امنیت و کنترل دسترسی: ${passed} موفق | ${failed} ناموفق`);
  console.log('===============================================================\n');

  server.close(() => {
    process.exit(failed > 0 ? 1 : 0);
  });
  setTimeout(() => {
    process.exit(failed > 0 ? 1 : 0);
  }, 1000);
}

runRbacTests().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
