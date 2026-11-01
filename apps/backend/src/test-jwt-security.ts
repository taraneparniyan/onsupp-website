process.env.NODE_ENV = 'test';

const VALID_TEST_SECRET = 'a_very_strong_and_secure_jwt_secret_with_more_than_32_characters_12345!';
process.env.JWT_SECRET = VALID_TEST_SECRET;

import express, { Response } from 'express';
import http from 'http';
import * as jwt from 'jsonwebtoken';
import { validateJwtSecret, getJwtSecret, JWT_ALGORITHM } from './config/jwt.js';
import { authenticate, requireAdmin, requireAuth, AuthenticatedRequest, prisma } from './middleware/auth.js';

// Setup isolated express app for testing JWT authorization
const app = express();
app.use(express.json());

app.get('/api/test/admin-only', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, user: req.user });
});

app.get('/api/test/authenticated', authenticate, requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, user: req.user });
});

app.get('/api/test/public', authenticate, (req: AuthenticatedRequest, res: Response) => {
  res.json({ public: true, user: req.user || null });
});

async function runJwtSecurityTests() {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as { port: number };
  const baseUrl = `http://127.0.0.1:${address.port}`;

  console.log(`[TEST-JWT] Running JWT Security Test Suite on ${baseUrl}\n`);

  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, detail?: string) {
    if (condition) {
      console.log(`  [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${name}${detail ? ` -> ${detail}` : ''}`);
      failed++;
    }
  }

  console.log('================================================================');
  console.log('بخش ۱: اعتبارسنجی مقادیر Secret و جلوگیری از مقادیر ناامن/پیش‌فرض');
  console.log('================================================================');

  assert(
    'مقدار خالی یا تعریف‌نشده برای JWT_SECRET باید نامعتبر باشد',
    validateJwtSecret('').valid === false && validateJwtSecret(undefined).valid === false,
  );

  assert(
    'استفاده از رشته پیش‌فرض dev-secret-change-in-production باید رد شود',
    validateJwtSecret('dev-secret-change-in-production').valid === false,
  );

  assert(
    'کلمات عبور ضعیف و رایج (secret, password, 123456) باید رد شوند',
    validateJwtSecret('secret').valid === false &&
      validateJwtSecret('password').valid === false &&
      validateJwtSecret('123456').valid === false,
  );

  assert(
    'کلیدهای کمتر از ۳۲ کاراکتر به دلیل ضعف امنیتی HS256 باید رد شوند',
    validateJwtSecret('short-secret-key-16bytes!').valid === false,
  );

  assert(
    'کلید امن با حداقل ۳۲ کاراکتر تأیید می‌شود',
    validateJwtSecret(VALID_TEST_SECRET).valid === true,
  );

  console.log('\n================================================================');
  console.log('بخش ۲: تست رد توکن‌های جعلی، پیش‌فرض، منقضی‌شده و الگوریتم‌های ناامن');
  console.log('================================================================');

  // Test 2.1: Forged token signed with attacker secret
  const forgedToken = jwt.sign(
    { id: 1, email: 'admin@onsupp.ir', role: 'ADMIN' },
    'attacker_fake_secret_key_32_characters_long_12345',
    { algorithm: 'HS256', expiresIn: '1h' },
  );

  const resForged = await fetch(`${baseUrl}/api/test/admin-only`, {
    headers: { Authorization: `Bearer ${forgedToken}` },
  });
  const dataForged = (await resForged.json()) as any;
  assert(
    'توکن جعلی امضاشده با کلید نفوذگر باید مسدود شود (HTTP 401)',
    resForged.status === 401 && dataForged.error === 'Authentication required',
  );

  // Test 2.2: Token signed with default legacy secret (dev-secret-change-in-production)
  const defaultSecretToken = jwt.sign(
    { id: 1, email: 'admin@onsupp.ir', role: 'ADMIN' },
    'dev-secret-change-in-production',
    { algorithm: 'HS256', expiresIn: '1h' },
  );

  const resDefault = await fetch(`${baseUrl}/api/test/admin-only`, {
    headers: { Authorization: `Bearer ${defaultSecretToken}` },
  });
  const dataDefault = (await resDefault.json()) as any;
  assert(
    'توکن امضاشده با secret پیش‌فرض (dev-secret-change-in-production) باید مسدود شود (HTTP 401)',
    resDefault.status === 401 && dataDefault.error === 'Authentication required',
  );

  // Test 2.3: Expired token
  const expiredToken = jwt.sign(
    { id: 1, email: 'admin@onsupp.ir', role: 'ADMIN' },
    VALID_TEST_SECRET,
    { algorithm: 'HS256', expiresIn: '-10s' },
  );

  const resExpired = await fetch(`${baseUrl}/api/test/admin-only`, {
    headers: { Authorization: `Bearer ${expiredToken}` },
  });
  const dataExpired = (await resExpired.json()) as any;
  assert(
    'توکن منقضی‌شده باید رد شود (HTTP 401)',
    resExpired.status === 401 && dataExpired.error === 'Authentication required',
  );

  // Test 2.4: Algorithm confusion / None algorithm token
  // Craft raw unsigned token header: { alg: "none", typ: "JWT" }
  const noneHeader = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const nonePayload = Buffer.from(JSON.stringify({ id: 1, email: 'admin@onsupp.ir', role: 'ADMIN' })).toString('base64url');
  const noneToken = `${noneHeader}.${nonePayload}.`;

  const resNone = await fetch(`${baseUrl}/api/test/admin-only`, {
    headers: { Authorization: `Bearer ${noneToken}` },
  });
  const dataNone = (await resNone.json()) as any;
  assert(
    'حمله الگوریتم none (تضعیف الگوریتم) باید بلافاصله رد شود (HTTP 401)',
    resNone.status === 401 && dataNone.error === 'Authentication required',
  );

  console.log('\n================================================================');
  console.log('بخش ۳: عدم اعتماد به JWT در زمان خطای دیتابیس یا حذف کاربر (Fail-Closed)');
  console.log('================================================================');

  const validAdminToken = jwt.sign(
    { id: 1, email: 'admin@onsupp.ir', role: 'ADMIN' },
    VALID_TEST_SECRET,
    { algorithm: 'HS256', expiresIn: '1h' },
  );

  // Test 3.1: Valid admin user in database grants access
  (prisma.user as any).findUnique = async ({ where }: { where: { id: number } }) => {
    if (where.id === 1) {
      return { id: 1, email: 'admin@onsupp.ir', role: 'ADMIN' };
    }
    return null;
  };

  const resValid = await fetch(`${baseUrl}/api/test/admin-only`, {
    headers: { Authorization: `Bearer ${validAdminToken}` },
  });
  const dataValid = (await resValid.json()) as any;
  assert(
    'مدیر معتبر موجود در دیتابیس با موفقیت دسترسی مدیریتی می‌گیرد (HTTP 200)',
    resValid.status === 200 && dataValid.success === true && dataValid.user.role === 'ADMIN',
  );

  // Test 3.2: Database Error / Disconnect -> MUST FAIL CLOSED (NO ADMIN ACCESS)
  (prisma.user as any).findUnique = async () => {
    throw new Error('Database unreachable (timeout/connection failure)');
  };

  const resDbError = await fetch(`${baseUrl}/api/test/admin-only`, {
    headers: { Authorization: `Bearer ${validAdminToken}` },
  });
  const dataDbError = (await resDbError.json()) as any;
  assert(
    'در صورت قطعی دیتابیس، سیستم به نقش داخل JWT اعتماد نمی‌کند و دسترسی را رد می‌کند (Fail-Closed, HTTP 401)',
    resDbError.status === 401 && dataDbError.error === 'Authentication required',
  );

  // Test 3.3: Deleted user (user exists in token but not in database)
  (prisma.user as any).findUnique = async () => {
    return null; // User deleted
  };

  const resDeleted = await fetch(`${baseUrl}/api/test/admin-only`, {
    headers: { Authorization: `Bearer ${validAdminToken}` },
  });
  const dataDeleted = (await resDeleted.json()) as any;
  assert(
    'کاربر حذف‌شده از دیتابیس حتی با داشتن توکن دسترسی مدیریتی دریافت نمی‌کند (HTTP 401)',
    resDeleted.status === 401 && dataDeleted.error === 'Authentication required',
  );

  // Test 3.4: Demoted user (token says role: ADMIN, but database says role: USER)
  (prisma.user as any).findUnique = async ({ where }: { where: { id: number } }) => {
    if (where.id === 1) {
      return { id: 1, email: 'admin@onsupp.ir', role: 'USER' }; // Demoted in DB
    }
    return null;
  };

  const resDemoted = await fetch(`${baseUrl}/api/test/admin-only`, {
    headers: { Authorization: `Bearer ${validAdminToken}` },
  });
  const dataDemoted = (await resDemoted.json()) as any;
  assert(
    'کاربری که در دیتابیس به USER تنزل یافته، حتی با داشتن توکن ADMIN مسدود می‌شود (HTTP 403)',
    resDemoted.status === 403 && dataDemoted.error === 'Admin access required',
  );

  // Test 3.5: Cookie authentication with valid admin
  (prisma.user as any).findUnique = async ({ where }: { where: { id: number } }) => {
    if (where.id === 1) {
      return { id: 1, email: 'admin@onsupp.ir', role: 'ADMIN' };
    }
    return null;
  };

  const resCookie = await fetch(`${baseUrl}/api/test/admin-only`, {
    headers: { Cookie: `token=${validAdminToken}` },
  });
  const dataCookie = (await resCookie.json()) as any;
  assert(
    'احراز هویت کوکی نیز با توکن معتبر مدیر دسترسی موفق دارد (HTTP 200)',
    resCookie.status === 200 && dataCookie.success === true,
  );

  server.close(() => {
    console.log('\n================================================================');
    console.log(`نتیجه کلی آزمون امنیت JWT: ${passed} موفق | ${failed} ناموفق`);
    console.log('================================================================');
    process.exit(failed > 0 ? 1 : 0);
  });

  setTimeout(() => process.exit(failed > 0 ? 1 : 0), 1000);
}

runJwtSecurityTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
