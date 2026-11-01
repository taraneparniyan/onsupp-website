process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'a_secure_test_jwt_secret_with_at_least_32_characters_length';

import express from 'express';
import jwt from 'jsonwebtoken';
import http from 'http';

import usersRoutes from './routes/users.js';
import articlesRoutes from './routes/articles.js';
import commentsRoutes from './routes/comments.js';
import contactRoutes from './routes/contact.js';
import { prisma as authPrisma } from './middleware/auth.js';

const JWT_SECRET = process.env.JWT_SECRET;

// Mock user verification in auth middleware
(authPrisma.user as any).findUnique = async ({ where }: { where: { id: number } }) => {
  if (where.id === 1) return { id: 1, email: 'admin@onsupp.ir', role: 'ADMIN' };
  if (where.id === 10) return { id: 10, email: 'user@onsupp.ir', role: 'USER' };
  return null;
};

// Generate test tokens
const userToken = jwt.sign(
  { id: 10, email: 'user@onsupp.ir', role: 'USER' },
  JWT_SECRET,
  { expiresIn: '1h', algorithm: 'HS256' },
);

const adminToken = jwt.sign(
  { id: 1, email: 'admin@onsupp.ir', role: 'ADMIN' },
  JWT_SECRET,
  { expiresIn: '1h', algorithm: 'HS256' },
);

// Setup express app with our routes
const app = express();
app.use(express.json());

app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/articles', articlesRoutes);
app.use('/api/v1/comments', commentsRoutes);
app.use('/api/v1/contact', contactRoutes);

async function runAdminIntegrationTests() {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as { port: number };
  const baseUrl = `http://127.0.0.1:${address.port}`;

  console.log(`[TEST-ADMIN] Server listening on ${baseUrl}\n`);

  let passed = 0;
  let failed = 0;

  async function test(
    name: string,
    path: string,
    options: {
      method?: string;
      cookie?: string;
      token?: string;
      origin?: string;
      body?: any;
      expectedStatus: number | number[];
      check?: (res: Response, body: any) => boolean;
    },
  ) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (options.token) {
      headers['Authorization'] = `Bearer ${options.token}`;
    }
    if (options.cookie) {
      headers['Cookie'] = `token=${options.cookie}`;
    }
    if (options.origin) {
      headers['Origin'] = options.origin;
    }

    try {
      const res = await fetch(`${baseUrl}${path}`, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      const allowedStatuses = Array.isArray(options.expectedStatus)
        ? options.expectedStatus
        : [options.expectedStatus];

      const statusOk = allowedStatuses.includes(res.status);
      let data: any = null;
      try {
        data = await res.json();
      } catch {}

      const checkOk = options.check ? options.check(res, data) : true;

      if (statusOk && checkOk) {
        console.log(`  [PASS] ${name} (HTTP ${res.status})`);
        passed++;
      } else {
        console.error(`  [FAIL] ${name} -> Expected ${JSON.stringify(options.expectedStatus)}, got ${res.status}. Body:`, data);
        failed++;
      }
    } catch (err) {
      console.error(`  [ERROR] ${name} -> Exception:`, err);
      failed++;
    }
  }

  console.log('=== ۱. تست ارسال توکن مدیر از طریق Cookie (نحوه کارکرد پنل ادمین) ===');
  await test('خواندن توکن مدیر از کوکی در GET /api/v1/users (عبور از سد احراز هویت)', '/api/v1/users', {
    cookie: adminToken,
    expectedStatus: [200, 500],
    check: (_, data) => data?.error !== 'Authentication required' && data?.error !== 'Admin access required',
  });

  await test('ارسال توکن کاربر عادی در کوکی به GET /api/v1/users باید ۴۰۳ برگرداند', '/api/v1/users', {
    cookie: userToken,
    expectedStatus: 403,
  });

  await test('درخواست بدون کوکی و هدر به GET /api/v1/users باید ۴۰۱ برگرداند', '/api/v1/users', {
    expectedStatus: 401,
  });

  console.log('\n=== ۲. تست مقابله با CSRF بر روی کوکی‌ها (CSRF Origin Check) ===');
  await test('درخواست تغییر با کوکی از مبدأ مجاز frontend (http://localhost:3003)', '/api/v1/articles', {
    method: 'POST',
    cookie: adminToken,
    origin: 'http://localhost:3003',
    body: { titleFa: 'New Article' },
    expectedStatus: [201, 500],
    check: (_, data) => data?.error !== 'CSRF validation failed: unauthorized origin',
  });

  await test('حمله CSRF: درخواست تغییر با کوکی از سایت مخرب (https://evil-attacker.com)', '/api/v1/articles', {
    method: 'POST',
    cookie: adminToken,
    origin: 'https://evil-attacker.com',
    body: { titleFa: 'Malicious Post' },
    expectedStatus: 403,
    check: (_, data) => data?.error?.includes('CSRF validation failed'),
  });

  console.log('\n=== ۳. درخواست با Bearer Token از حملات CSRF تأثیر نمی‌پذیرد ===');
  await test('هدر Authorization: Bearer تحت کنترل کلاینت است و با هدر Origin مسدود نمی‌شود', '/api/v1/articles', {
    method: 'POST',
    token: adminToken,
    origin: 'https://other-service.com',
    body: { titleFa: 'API Service Post' },
    expectedStatus: [201, 500],
    check: (_, data) => data?.error !== 'CSRF validation failed: unauthorized origin',
  });

  server.close();
  console.log(`\n========================================`);
  console.log(`نتیجه تست‌های ادمین و CSRF: ${passed} موفق | ${failed} ناموفق`);
  console.log(`========================================`);

  if (failed > 0) process.exit(1);
}

runAdminIntegrationTests().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
