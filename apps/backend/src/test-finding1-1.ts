process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'a_secure_test_jwt_secret_with_at_least_32_characters_length';

import express from 'express';
import jwt from 'jsonwebtoken';
import http from 'http';

import usersRoutes from './routes/users.js';
import articlesRoutes from './routes/articles.js';
import commentsRoutes from './routes/comments.js';
import contactRoutes from './routes/contact.js';
import mediaRoutes from './routes/media.js';
import heroRoutes from './routes/hero.js';
import servicesRoutes from './routes/services.js';
import statsRoutes from './routes/stats.js';
import aboutRoutes from './routes/about.js';
import caseStudiesRoutes from './routes/casestudies.js';
import pricingRoutes from './routes/pricing.js';
import { prisma as authPrisma } from './middleware/auth.js';

const JWT_SECRET = process.env.JWT_SECRET;

// Mock user verification in auth middleware
(authPrisma.user as any).findUnique = async ({ where }: { where: { id: number } }) => {
  if (where.id === 1) return { id: 1, email: 'admin@onsupp.ir', role: 'ADMIN' };
  if (where.id === 10) return { id: 10, email: 'regular-user@onsupp.ir', role: 'USER' };
  return null;
};

// Generate test tokens
const userToken = jwt.sign(
  { id: 10, email: 'regular-user@onsupp.ir', role: 'USER' },
  JWT_SECRET,
  { expiresIn: '1h', algorithm: 'HS256' },
);

const adminToken = jwt.sign(
  { id: 1, email: 'admin@onsupp.ir', role: 'ADMIN' },
  JWT_SECRET,
  { expiresIn: '1h', algorithm: 'HS256' },
);

// Setup test Express app with our secured routes
const app = express();
app.use(express.json());

app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/articles', articlesRoutes);
app.use('/api/v1/comments', commentsRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/media', mediaRoutes);
app.use('/api/v1/hero', heroRoutes);
app.use('/api/v1/services', servicesRoutes);
app.use('/api/v1/stats', statsRoutes);
app.use('/api/v1/about', aboutRoutes);
app.use('/api/v1/casestudies', caseStudiesRoutes);
app.use('/api/v1/pricing', pricingRoutes);

async function runTests() {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as { port: number };
  const baseUrl = `http://127.0.0.1:${address.port}`;

  console.log(`[TEST] Test server listening on ${baseUrl}\n`);

  let passed = 0;
  let failed = 0;

  async function testCase(
    name: string,
    path: string,
    options: {
      method?: string;
      token?: string;
      body?: any;
      expectedStatus: number | number[];
      customCheck?: (data: any, status: number) => boolean;
    },
  ) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (options.token) {
      headers['Authorization'] = `Bearer ${options.token}`;
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
      } catch {
        // Not JSON
      }

      const customOk = options.customCheck ? options.customCheck(data, res.status) : true;

      if (statusOk && customOk) {
        console.log(`  [PASS] ${name} (Status: ${res.status})`);
        passed++;
      } else {
        console.error(
          `  [FAIL] ${name} -> Expected ${JSON.stringify(options.expectedStatus)}, got ${res.status}. Body:`,
          data,
        );
        failed++;
      }
    } catch (err) {
      console.error(`  [ERROR] ${name} -> Exception:`, err);
      failed++;
    }
  }

  console.log('=== گروه ۱: تست دسترسی کاربر ناشناس (Anonymous User) ===');
  await testCase('درخواست ناشناس به لیست کاربران (GET /users)', '/api/v1/users', {
    expectedStatus: 401,
  });
  await testCase('تلاش ناشناس برای ایجاد ادمین (POST /users with role: ADMIN)', '/api/v1/users', {
    method: 'POST',
    body: { name: 'Hacker', email: 'hacker@test.com', password: '123', role: 'ADMIN' },
    expectedStatus: 403,
  });
  await testCase('تلاش ناشناس برای ویرایش کاربر (PUT /users/1)', '/api/v1/users/1', {
    method: 'PUT',
    body: { name: 'Hacked' },
    expectedStatus: 401,
  });
  await testCase('تلاش ناشناس برای حذف کاربر (DELETE /users/1)', '/api/v1/users/1', {
    method: 'DELETE',
    expectedStatus: 401,
  });
  await testCase('درخواست ناشناس به پیام‌های خصوصی مشتریان (GET /contact/submissions)', '/api/v1/contact/submissions', {
    expectedStatus: 401,
  });
  await testCase('تلاش ناشناس برای ایجاد مقاله (POST /articles)', '/api/v1/articles', {
    method: 'POST',
    body: { titleFa: 'Test' },
    expectedStatus: 401,
  });
  await testCase('تلاش ناشناس برای حذف رسانه (DELETE /media/1)', '/api/v1/media/1', {
    method: 'DELETE',
    expectedStatus: 401,
  });
  await testCase('تلاش ناشناس برای تایید دیدگاه (PUT /comments/1/toggle-approve)', '/api/v1/comments/1/toggle-approve', {
    method: 'PUT',
    expectedStatus: 401,
  });

  console.log('\n=== گروه ۲: تست دسترسی کاربر عادی لاگین‌شده (Regular User - Role USER) ===');
  await testCase('کاربر عادی نباید به لیست کل کاربران دسترسی داشته باشد (GET /users)', '/api/v1/users', {
    token: userToken,
    expectedStatus: 403,
  });
  await testCase('کاربر عادی نباید بتواند کاربر دیگری را حذف کند (DELETE /users/1)', '/api/v1/users/1', {
    token: userToken,
    method: 'DELETE',
    expectedStatus: 403,
  });
  await testCase('کاربر عادی نباید بتواند کاربر دیگری را ویرایش کند (PUT /users/99)', '/api/v1/users/99', {
    token: userToken,
    method: 'PUT',
    body: { name: 'Attacker' },
    expectedStatus: 403,
  });
  await testCase('کاربر عادی نباید بتواند نقش خود را به ADMIN ارتقا دهد (PUT /users/10 with role: ADMIN)', '/api/v1/users/10', {
    token: userToken,
    method: 'PUT',
    body: { role: 'ADMIN' },
    expectedStatus: 403,
  });
  await testCase('کاربر عادی نباید بتواند پیام‌های خصوصی مشتریان را ببیند (GET /contact/submissions)', '/api/v1/contact/submissions', {
    token: userToken,
    expectedStatus: 403,
  });
  await testCase('کاربر عادی نباید بتواند مقاله ایجاد کند (POST /articles)', '/api/v1/articles', {
    token: userToken,
    method: 'POST',
    body: { titleFa: 'User Post' },
    expectedStatus: 403,
  });
  await testCase('کاربر عادی نباید بتواند کامنت را تایید کند (PUT /comments/1/toggle-approve)', '/api/v1/comments/1/toggle-approve', {
    token: userToken,
    method: 'PUT',
    expectedStatus: 403,
  });

  console.log('\n=== گروه ۳: تست دسترسی مدیر (Admin User - Role ADMIN) ===');
  // Note: Admin reaches the DB layer; if DB is offline, it returns 500 from Prisma instead of 401/403
  await testCase('مدیر باید از سد احراز هویت GET /users عبور کند', '/api/v1/users', {
    token: adminToken,
    expectedStatus: [200, 500], // 200 with DB, 500 DB offline, but NEVER 401/403
    customCheck: (_data, status) => status !== 401 && status !== 403,
  });
  await testCase('مدیر باید از سد احراز هویت GET /contact/submissions عبور کند', '/api/v1/contact/submissions', {
    token: adminToken,
    expectedStatus: [200, 500],
    customCheck: (_data, status) => status !== 401 && status !== 403,
  });
  await testCase('مدیر باید از سد احراز هویت POST /articles عبور کند', '/api/v1/articles', {
    token: adminToken,
    method: 'POST',
    body: { titleFa: 'Admin Article' },
    expectedStatus: [201, 500],
    customCheck: (_data, status) => status !== 401 && status !== 403,
  });
  await testCase('مدیر باید از سد احراز هویت DELETE /users/99 عبور کند', '/api/v1/users/99', {
    token: adminToken,
    method: 'DELETE',
    expectedStatus: [200, 500],
    customCheck: (_data, status) => status !== 401 && status !== 403,
  });

  console.log('\n=== گروه ۴: تست در دسترس بودن Endpointهای عمومی سایت ===');
  await testCase('مسیر عمومی دریافت اطلاعات تماس (GET /contact/content)', '/api/v1/contact/content', {
    expectedStatus: [200, 500],
    customCheck: (_data, status) => status !== 401 && status !== 403,
  });
  await testCase('مسیر عمومی اسلایدر هیرو (GET /hero)', '/api/v1/hero', {
    expectedStatus: [200, 500],
    customCheck: (_data, status) => status !== 401 && status !== 403,
  });
  await testCase('مسیر عمومی خدمات (GET /services)', '/api/v1/services', {
    expectedStatus: [200, 500],
    customCheck: (_data, status) => status !== 401 && status !== 403,
  });
  await testCase('مسیر عمومی آمار (GET /stats)', '/api/v1/stats', {
    expectedStatus: [200, 500],
    customCheck: (_data, status) => status !== 401 && status !== 403,
  });
  await testCase('مسیر عمومی درباره ما (GET /about)', '/api/v1/about', {
    expectedStatus: [200, 500],
    customCheck: (_data, status) => status !== 401 && status !== 403,
  });
  await testCase('مسیر عمومی نمونه‌کارها (GET /casestudies)', '/api/v1/casestudies', {
    expectedStatus: [200, 500],
    customCheck: (_data, status) => status !== 401 && status !== 403,
  });
  await testCase('مسیر عمومی تعرفه‌ها (GET /pricing/categories)', '/api/v1/pricing/categories', {
    expectedStatus: [200, 500],
    customCheck: (_data, status) => status !== 401 && status !== 403,
  });
  await testCase('مسیر عمومی لیست مقالات (GET /articles)', '/api/v1/articles', {
    expectedStatus: [200, 500],
    customCheck: (_data, status) => status !== 401 && status !== 403,
  });
  await testCase('مسیر عمومی لیست دیدگاه‌ها (GET /comments)', '/api/v1/comments', {
    expectedStatus: [200, 500],
    customCheck: (_data, status) => status !== 401 && status !== 403,
  });

  server.close();

  console.log(`\n================================`);
  console.log(`نتیجه تست‌ها: ${passed} موفق | ${failed} ناموفق`);
  console.log(`================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
