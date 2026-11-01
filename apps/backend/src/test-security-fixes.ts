process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'a_secure_test_jwt_secret_with_at_least_32_characters_length';

import express from 'express';
import http from 'http';
import jwt from 'jsonwebtoken';

import { app, getAllowedOrigins } from './server.js';
import { prisma } from './routes/articles.js';
import { prisma as authPrisma } from './middleware/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'a_secure_test_jwt_secret_with_at_least_32_characters_length';

// Test tokens
const adminToken = jwt.sign(
  { id: 1, email: 'admin@onsupp.ir', role: 'ADMIN' },
  JWT_SECRET,
  { expiresIn: '1h' },
);

const userToken = jwt.sign(
  { id: 2, email: 'user@onsupp.ir', role: 'USER' },
  JWT_SECRET,
  { expiresIn: '1h' },
);

// Mock database articles
const mockArticles: Record<string | number, any> = {
  'published-article': {
    id: 101,
    titleFa: 'مقاله عمومی منتشرشده',
    titleEn: 'Published Article',
    slug: 'published-article',
    published: true,
  },
  101: {
    id: 101,
    titleFa: 'مقاله عمومی منتشرشده',
    titleEn: 'Published Article',
    slug: 'published-article',
    published: true,
  },
  'draft-article': {
    id: 102,
    titleFa: 'پیش‌نویس محرمانه منتشرنشده',
    titleEn: 'Secret Draft Article',
    slug: 'draft-article',
    published: false,
  },
  102: {
    id: 102,
    titleFa: 'پیش‌نویس محرمانه منتشرنشده',
    titleEn: 'Secret Draft Article',
    slug: 'draft-article',
    published: false,
  },
};

// Wire up mock Prisma handlers for Article model
let lastFindManyWhere: any = null;

(prisma.article as any).findUnique = async ({ where }: { where: { id?: number; slug?: string } }) => {
  const key = where.slug !== undefined ? where.slug : where.id;
  return mockArticles[key as any] || null;
};

(prisma.article as any).findMany = async ({ where }: { where: any }) => {
  lastFindManyWhere = where;
  const all = [mockArticles['published-article'], mockArticles['draft-article']];
  if (where?.published === true) {
    return all.filter((a) => a.published === true);
  }
  return all;
};

// Mock user lookup in auth middleware
(authPrisma.user as any).findUnique = async ({ where }: { where: { id: number } }) => {
  if (where.id === 1) return { id: 1, email: 'admin@onsupp.ir', role: 'ADMIN' };
  if (where.id === 2) return { id: 2, email: 'user@onsupp.ir', role: 'USER' };
  return null;
};

async function runTests() {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as { port: number };
  const baseUrl = `http://127.0.0.1:${address.port}`;

  console.log(`[TEST-SECURITY] Running test suite against ${baseUrl}\n`);

  let passed = 0;
  let failed = 0;

  async function assertCase(
    description: string,
    action: () => Promise<boolean>,
  ) {
    try {
      const ok = await action();
      if (ok) {
        console.log(`  [PASS] ${description}`);
        passed++;
      } else {
        console.error(`  [FAIL] ${description}`);
        failed++;
      }
    } catch (e: any) {
      console.error(`  [ERROR] ${description} -> Exception: ${e.message}`);
      failed++;
    }
  }

  console.log('====================================================');
  console.log('بخش ۱: تست تنظیمات CORS در محیط Development و Production');
  console.log('====================================================');

  // 1.1 Development origin allowed
  await assertCase(
    'درخواست با هدر Origin مجاز در Development (http://localhost:3000) باید هدر CORS دریافت کند',
    async () => {
      const res = await fetch(`${baseUrl}/health`, {
        headers: { Origin: 'http://localhost:3000' },
      });
      const corsHeader = res.headers.get('access-control-allow-origin');
      return res.status === 200 && corsHeader === 'http://localhost:3000';
    },
  );

  await assertCase(
    'درخواست با هدر Origin مجاز دیگر (http://localhost:3003) باید هدر CORS دریافت کند',
    async () => {
      const res = await fetch(`${baseUrl}/health`, {
        headers: { Origin: 'http://localhost:3003' },
      });
      const corsHeader = res.headers.get('access-control-allow-origin');
      return res.status === 200 && corsHeader === 'http://localhost:3003';
    },
  );

  // 1.2 Development untrusted origin rejected
  await assertCase(
    'درخواست با Origin نامعتبر در Development (https://evil-attacker.com) نباید هدر CORS دریافت کند',
    async () => {
      const res = await fetch(`${baseUrl}/health`, {
        headers: { Origin: 'https://evil-attacker.com' },
      });
      const corsHeader = res.headers.get('access-control-allow-origin');
      return corsHeader === null;
    },
  );

  // 1.3 Request without Origin header (SSR / curl / health check)
  await assertCase(
    'درخواست بدون هدر Origin (SSR / server-to-server) با موفقیت پاسخ داده شود (سیاست صریح)',
    async () => {
      const res = await fetch(`${baseUrl}/health`);
      return res.status === 200;
    },
  );

  // 1.4 Preflight OPTIONS request
  await assertCase(
    'درخواست Preflight (OPTIONS) با Origin مجاز هدرهای دسترسی دریافت کند',
    async () => {
      const res = await fetch(`${baseUrl}/health`, {
        method: 'OPTIONS',
        headers: {
          Origin: 'http://localhost:3000',
          'Access-Control-Request-Method': 'GET',
        },
      });
      const corsHeader = res.headers.get('access-control-allow-origin');
      return (res.status === 204 || res.status === 200) && corsHeader === 'http://localhost:3000';
    },
  );

  await assertCase(
    'درخواست Preflight (OPTIONS) با Origin نامعتبر هدر Access-Control-Allow-Origin دریافت نکند',
    async () => {
      const res = await fetch(`${baseUrl}/health`, {
        method: 'OPTIONS',
        headers: {
          Origin: 'https://evil-attacker.com',
          'Access-Control-Request-Method': 'GET',
        },
      });
      const corsHeader = res.headers.get('access-control-allow-origin');
      return corsHeader === null;
    },
  );

  // 1.5 Production CORS simulation
  await assertCase(
    'در حالت Production، فقط دامنه‌های دقیق تعریف‌شده در FRONTEND_URL/ALLOWED_ORIGINS مجاز باشند و localhost رد شود',
    async () => {
      const originalEnv = process.env.NODE_ENV;
      const originalFrontendUrl = process.env.FRONTEND_URL;
      try {
        process.env.NODE_ENV = 'production';
        process.env.FRONTEND_URL = 'https://onsupp.ir';

        const trusted = getAllowedOrigins();
        const includesProd = trusted.includes('https://onsupp.ir');
        const excludesLocal = !trusted.includes('http://localhost:3000');

        // Test with live request through app
        const resAllowed = await fetch(`${baseUrl}/health`, {
          headers: { Origin: 'https://onsupp.ir' },
        });
        const headerAllowed = resAllowed.headers.get('access-control-allow-origin');

        const resBlocked = await fetch(`${baseUrl}/health`, {
          headers: { Origin: 'http://localhost:3000' },
        });
        const headerBlocked = resBlocked.headers.get('access-control-allow-origin');

        return includesProd && excludesLocal && headerAllowed === 'https://onsupp.ir' && headerBlocked === null;
      } finally {
        process.env.NODE_ENV = originalEnv;
        if (originalFrontendUrl !== undefined) {
          process.env.FRONTEND_URL = originalFrontendUrl;
        } else {
          delete process.env.FRONTEND_URL;
        }
      }
    },
  );

  console.log('\n====================================================');
  console.log('بخش ۲: تست دسترسی به مقالات منتشرشده و پیش‌نویس (Articles Security)');
  console.log('====================================================');

  // 2.1 GET /by-slug/:slug - Published article accessible by anyone
  await assertCase(
    'کاربر ناشناس به مقاله منتشرشده دسترسی دارد (GET /by-slug/:slug -> 200 OK)',
    async () => {
      const res = await fetch(`${baseUrl}/api/v1/articles/by-slug/published-article`);
      if (res.status === 500) throw new Error('خطای ۵۰۰ دیتابیس نباید رخ دهد');
      const data = (await res.json()) as any;
      return res.status === 200 && data.slug === 'published-article' && data.published === true;
    },
  );

  // 2.2 GET /by-slug/:slug - Draft article hidden from public (must return 404, NOT 500)
  await assertCase(
    'کاربر ناشناس به پیش‌نویس منتشرنشده دسترسی ندارد و ۴۰۴ دریافت می‌کند (GET /by-slug/:slug -> 404 Not Found)',
    async () => {
      const res = await fetch(`${baseUrl}/api/v1/articles/by-slug/draft-article`);
      if (res.status === 500) throw new Error('خطای ۵۰۰ دیتابیس نباید رخ دهد');
      const data = (await res.json()) as any;
      return res.status === 404 && data.error === 'Article not found';
    },
  );

  // 2.3 GET /by-slug/:slug - Draft article hidden from regular user (role: USER)
  await assertCase(
    'کاربر عادی (USER) به پیش‌نویس منتشرنشده دسترسی ندارد و ۴۰۴ دریافت می‌کند (GET /by-slug/:slug -> 404 Not Found)',
    async () => {
      const res = await fetch(`${baseUrl}/api/v1/articles/by-slug/draft-article`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      if (res.status === 500) throw new Error('خطای ۵۰۰ دیتابیس نباید رخ دهد');
      const data = (await res.json()) as any;
      return res.status === 404 && data.error === 'Article not found';
    },
  );

  // 2.4 GET /by-slug/:slug - Draft article accessible by ADMIN (returns 200)
  await assertCase(
    'مدیر (ADMIN) به پیش‌نویس منتشرنشده دسترسی دارد (GET /by-slug/:slug -> 200 OK)',
    async () => {
      const res = await fetch(`${baseUrl}/api/v1/articles/by-slug/draft-article`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status === 500) throw new Error('خطای ۵۰۰ دیتابیس نباید رخ دهد');
      const data = (await res.json()) as any;
      return res.status === 200 && data.slug === 'draft-article' && data.published === false;
    },
  );

  // 2.5 GET /:id - Published article accessible by anyone
  await assertCase(
    'کاربر ناشناس به مقاله منتشرشده با شناسه عددی دسترسی دارد (GET /:id -> 200 OK)',
    async () => {
      const res = await fetch(`${baseUrl}/api/v1/articles/101`);
      if (res.status === 500) throw new Error('خطای ۵۰۰ دیتابیس نباید رخ دهد');
      const data = (await res.json()) as any;
      return res.status === 200 && data.id === 101 && data.published === true;
    },
  );

  // 2.6 GET /:id - Draft article hidden from public (must return 404, NOT 500)
  await assertCase(
    'کاربر ناشناس به پیش‌نویس با شناسه عددی دسترسی ندارد و ۴۰۴ دریافت می‌کند (GET /:id -> 404 Not Found)',
    async () => {
      const res = await fetch(`${baseUrl}/api/v1/articles/102`);
      if (res.status === 500) throw new Error('خطای ۵۰۰ دیتابیس نباید رخ دهد');
      const data = (await res.json()) as any;
      return res.status === 404 && data.error === 'Article not found';
    },
  );

  // 2.7 GET /:id - Draft article hidden from regular user (role: USER)
  await assertCase(
    'کاربر عادی (USER) به پیش‌نویس با شناسه عددی دسترسی ندارد و ۴۰۴ دریافت می‌کند (GET /:id -> 404 Not Found)',
    async () => {
      const res = await fetch(`${baseUrl}/api/v1/articles/102`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      if (res.status === 500) throw new Error('خطای ۵۰۰ دیتابیس نباید رخ دهد');
      const data = (await res.json()) as any;
      return res.status === 404 && data.error === 'Article not found';
    },
  );

  // 2.8 GET /:id - Draft article accessible by ADMIN (returns 200)
  await assertCase(
    'مدیر (ADMIN) به پیش‌نویس با شناسه عددی دسترسی دارد (GET /:id -> 200 OK)',
    async () => {
      const res = await fetch(`${baseUrl}/api/v1/articles/102`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status === 500) throw new Error('خطای ۵۰۰ دیتابیس نباید رخ دهد');
      const data = (await res.json()) as any;
      return res.status === 200 && data.id === 102 && data.published === false;
    },
  );

  // 2.9 GET /:id - Invalid ID format returns 400
  await assertCase(
    'شناسه نامعتبر در GET /:id باید ۴۰۰ برگرداند',
    async () => {
      const res = await fetch(`${baseUrl}/api/v1/articles/not-a-number`);
      return res.status === 400;
    },
  );

  // 2.10 GET / (listing) - Public only gets published: true in Prisma query
  await assertCase(
    'لیست مقالات برای عموم فقط مقالات published: true را فیلتر می‌کند',
    async () => {
      lastFindManyWhere = null;
      const res = await fetch(`${baseUrl}/api/v1/articles`);
      if (res.status === 500) throw new Error('خطای ۵۰۰ دیتابیس نباید رخ دهد');
      const data = (await res.json()) as any;
      return res.status === 200 && lastFindManyWhere?.published === true && data.every((a: any) => a.published === true);
    },
  );

  // 2.11 GET / (listing) - Admin sees all articles including drafts
  await assertCase(
    'لیست مقالات برای مدیر (ADMIN) شرط published: true را اعمال نمی‌کند و پیش‌نویس‌ها را نیز شامل می‌شود',
    async () => {
      lastFindManyWhere = null;
      const res = await fetch(`${baseUrl}/api/v1/articles`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status === 500) throw new Error('خطای ۵۰۰ دیتابیس نباید رخ دهد');
      const data = (await res.json()) as any;
      return res.status === 200 && lastFindManyWhere?.published === undefined && data.some((a: any) => a.published === false);
    },
  );
  console.log('\n====================================================');
  console.log(`نتیجه کلی آزمون امنیتی: ${passed} موفق | ${failed} ناموفق`);
  console.log('====================================================');

  server.close(() => {
    process.exit(failed > 0 ? 1 : 0);
  });
  setTimeout(() => {
    process.exit(failed > 0 ? 1 : 0);
  }, 1000);
}

runTests().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
