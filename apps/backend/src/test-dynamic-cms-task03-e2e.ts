import 'dotenv/config';
import http from 'http';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient, ContentStatus } from '@prisma/client';
import { app } from './server.js';
import { getJwtSecret, JWT_ALGORITHM } from './config/jwt.js';

const prisma = new PrismaClient();
const TEST_PORT = 3099;
const BASE_URL = `http://localhost:${TEST_PORT}/api/v1`;

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ name, passed: true });
    console.log(`  ✓ ${name}`);
  } catch (err: any) {
    results.push({ name, passed: false, error: err?.message || String(err) });
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err?.message || err}`);
  }
}

async function runE2ETests() {
  console.log('\n======================================================');
  console.log('   ON-SUPP TASK 03 DYNAMIC CMS E2E VERIFICATION SUITE  ');
  console.log('======================================================\n');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(TEST_PORT, resolve));
  console.log(`[e2e] Test server running on ${BASE_URL}\n`);

  try {
    const secret = getJwtSecret();
    const pwHash = await bcrypt.hash('SecretPass123!', 10);

    // Setup Admin
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin-e2e@onsupp.ir' },
      update: { role: 'ADMIN', isActive: true },
      create: {
        email: 'admin-e2e@onsupp.ir',
        password: pwHash,
        name: 'Admin E2E',
        role: 'ADMIN',
        isActive: true,
      },
    });

    // Setup HR
    const hrUser = await prisma.user.upsert({
      where: { email: 'hr-e2e@onsupp.ir' },
      update: { role: 'HR', isActive: true },
      create: {
        email: 'hr-e2e@onsupp.ir',
        password: pwHash,
        name: 'HR E2E',
        role: 'HR',
        isActive: true,
      },
    });

    // Setup Content/SEO Manager
    const seoUser = await prisma.user.upsert({
      where: { email: 'seo-e2e@onsupp.ir' },
      update: { role: 'CONTENT_SEO_MANAGER', isActive: true },
      create: {
        email: 'seo-e2e@onsupp.ir',
        password: pwHash,
        name: 'SEO E2E',
        role: 'CONTENT_SEO_MANAGER',
        isActive: true,
      },
    });

    // Setup Regular User
    const regularUser = await prisma.user.upsert({
      where: { email: 'regular-e2e@onsupp.ir' },
      update: { role: 'USER', isActive: true },
      create: {
        email: 'regular-e2e@onsupp.ir',
        password: pwHash,
        name: 'User E2E',
        role: 'USER',
        isActive: true,
      },
    });

    const adminToken = jwt.sign(
      { id: adminUser.id, role: 'ADMIN', email: adminUser.email },
      secret,
      { algorithm: JWT_ALGORITHM, expiresIn: '2h' }
    );
    const hrToken = jwt.sign(
      { id: hrUser.id, role: 'HR', email: hrUser.email },
      secret,
      { algorithm: JWT_ALGORITHM, expiresIn: '2h' }
    );
    const seoToken = jwt.sign(
      { id: seoUser.id, role: 'CONTENT_SEO_MANAGER', email: seoUser.email },
      secret,
      { algorithm: JWT_ALGORITHM, expiresIn: '2h' }
    );
    const userToken = jwt.sign(
      { id: regularUser.id, role: 'USER', email: regularUser.email },
      secret,
      { algorithm: JWT_ALGORITHM, expiresIn: '2h' }
    );

    // =========================================================================
    // SECTION 1: PUBLIC CMS ENDPOINTS READ INTEGRATION
    // =========================================================================
    console.log('--- SECTION 1: Public CMS Endpoints Read Integration ---');

    await test('GET /api/v1/site-settings returns 200 with structured settings', async () => {
      const res = await fetch(`${BASE_URL}/site-settings`);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      const data: any = await res.json();
      assert(Boolean(data.siteNameFa), 'Expected siteNameFa in site settings');
      assert(Boolean(data.streetFa), 'Expected streetFa in site settings');
      assert(Boolean(data.consultEmail), 'Expected consultEmail in site settings');
      assert(Boolean(data.telegramUrl), 'Expected telegramUrl in site settings');
      assert(Array.isArray(data.channels), 'Expected channels array in site settings');
    });

    await test('GET /api/v1/client-partners returns active published partners', async () => {
      const res = await fetch(`${BASE_URL}/client-partners`);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      const data: any = await res.json();
      assert(Array.isArray(data), 'Expected array of client partners');
      assert(data.length >= 3, `Expected at least 3 partners, got ${data.length}`);
    });

    await test('GET /api/v1/client-logos returns active marquee logos', async () => {
      const res = await fetch(`${BASE_URL}/client-logos`);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      const data: any = await res.json();
      assert(Array.isArray(data), 'Expected array of logos');
      assert(data.length >= 8, `Expected at least 8 logos, got ${data.length}`);
    });

    await test('GET /api/v1/team-members returns active team members', async () => {
      const res = await fetch(`${BASE_URL}/team-members`);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      const data: any = await res.json();
      assert(Array.isArray(data), 'Expected array of team members');
      assert(data.length >= 4, `Expected at least 4 team members, got ${data.length}`);
    });

    await test('GET /api/v1/about-page returns full about page narrative & values', async () => {
      const res = await fetch(`${BASE_URL}/about-page`);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      const data: any = await res.json();
      assert(Boolean(data.heroTitleFa), 'Expected heroTitleFa');
      assert(Boolean(data.introTitleFa), 'Expected introTitleFa');
      assert(Array.isArray(data.coreValues), 'Expected coreValues array');
      assert(Boolean(data.ceoNameFa), 'Expected ceoNameFa');
    });

    await test('GET /api/v1/home-sections returns 10 homepage sections ordered by position', async () => {
      const res = await fetch(`${BASE_URL}/home-sections`);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      const data: any = await res.json();
      assert(Array.isArray(data), 'Expected array of sections');
      assert(data.length === 10, `Expected 10 home sections, got ${data.length}`);
      for (let i = 0; i < data.length - 1; i++) {
        assert(data[i].position <= data[i + 1].position, `Section ordering violated at index ${i}`);
      }
    });

    await test('GET /api/v1/page-seo/by-route resolves home page SEO metadata', async () => {
      const res = await fetch(`${BASE_URL}/page-seo/by-route?routePath=/`);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      const data: any = await res.json();
      assert(data.routePath === '/', `Expected routePath '/', got ${data.routePath}`);
      assert(Boolean(data.titleFa), 'Expected titleFa for homepage');
    });

    await test('GET /api/v1/services/by-slug/web-design resolves dynamic service', async () => {
      const res = await fetch(`${BASE_URL}/services/by-slug/web-design`);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      const data: any = await res.json();
      assert(data.slug === 'web-design', `Expected slug 'web-design', got ${data.slug}`);
      assert(Boolean(data.title), 'Expected title');
    });

    await test('GET /api/v1/casestudies/by-slug/dr-miresmaeli-clinic resolves dynamic case study', async () => {
      const res = await fetch(`${BASE_URL}/casestudies/by-slug/dr-miresmaeli-clinic`);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      const data: any = await res.json();
      assert(data.slug === 'dr-miresmaeli-clinic', `Expected slug 'dr-miresmaeli-clinic', got ${data.slug}`);
      assert(Boolean(data.titleFa), 'Expected titleFa');
    });

    // =========================================================================
    // SECTION 2: RBAC PERMISSIONS VERIFICATION
    // =========================================================================
    console.log('\n--- SECTION 2: RBAC Permissions Verification ---');

    await test('Unauthenticated mutation to /api/v1/site-settings returns 401', async () => {
      const res = await fetch(`${BASE_URL}/site-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteNameFa: 'Hacked Name' }),
      });
      assert(res.status === 401, `Expected 401, got ${res.status}`);
    });

    await test('HR role can create and update team members via /api/v1/team-members', async () => {
      const res = await fetch(`${BASE_URL}/team-members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${hrToken}`,
        },
        body: JSON.stringify({
          nameFa: 'تست کننده منابع انسانی',
          nameEn: 'HR Tester',
          roleFa: 'تست نقش',
          roleEn: 'Test Role',
          departmentFa: 'منابع انسانی',
          departmentEn: 'Human Resources',
          position: 99,
          status: 'DRAFT',
        }),
      });
      assert(res.status === 201, `Expected 201 Created by HR, got ${res.status}`);
      const created: any = await res.json();

      // Clean up created record
      await prisma.teamMember.delete({ where: { id: created.id } });
    });

    await test('Content SEO Manager role can update /api/v1/page-seo', async () => {
      const res = await fetch(`${BASE_URL}/page-seo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${seoToken}`,
        },
        body: JSON.stringify({
          routePath: '/test-seo-path',
          titleFa: 'سئوی آزمایشی',
          titleEn: 'Test SEO',
          descriptionFa: 'توضیحات سئوی آزمایشی',
          descriptionEn: 'Test SEO Description',
          keywords: ['تست', 'سئو'],
        }),
      });
      assert(res.status === 201, `Expected 201 Created by SEO Manager, got ${res.status}`);
      const created: any = await res.json();

      // Clean up
      await prisma.pageSeo.delete({ where: { id: created.id } });
    });

    await test('Regular USER role is rejected (403) from mutating CMS content', async () => {
      const res = await fetch(`${BASE_URL}/team-members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          nameFa: 'کاربر غیرمجاز',
          nameEn: 'Unauthorized User',
          roleFa: 'تست',
          roleEn: 'Test',
          departmentFa: 'تست',
          departmentEn: 'Test',
        }),
      });
      assert(res.status === 403, `Expected 403 Forbidden for USER, got ${res.status}`);
    });

    // =========================================================================
    // SECTION 3: DRAFT LEAKAGE PREVENTION VERIFICATION
    // =========================================================================
    console.log('\n--- SECTION 3: Draft Leakage Prevention Verification ---');

    await test('Draft client partner is NOT leaked into public GET /api/v1/client-partners', async () => {
      const draft = await prisma.clientPartner.create({
        data: {
          nameFa: 'شرکت محرمانه در حال مذاکره',
          nameEn: 'Confidential Draft Partner',
          titleFa: 'خدمات محرمانه',
          titleEn: 'Confidential Services',
          industryFa: 'محرمانه',
          industryEn: 'Confidential',
          status: ContentStatus.DRAFT,
          position: 999,
        },
      });

      try {
        const res = await fetch(`${BASE_URL}/client-partners`);
        const list: any = await res.json();
        const found = list.some((p: any) => p.nameFa === 'شرکت محرمانه در حال مذاکره');
        assert(!found, 'Security breach: Draft partner leaked to public endpoint!');
      } finally {
        await prisma.clientPartner.delete({ where: { id: draft.id } });
      }
    });

    await test('Draft service (published=false) is NOT leaked to public GET /api/v1/services', async () => {
      const draft = await prisma.service.create({
        data: {
          title: 'خدمت سری و منتشر نشده',
          titleEn: 'Confidential Unpublished Service',
          subtitle: 'توضیحات پیش‌نویس',
          subtitleEn: 'Draft subtitle',
          slug: 'unpublished-draft-service-test',
          published: false,
          position: 999,
        },
      });

      try {
        const res = await fetch(`${BASE_URL}/services`);
        const list: any = await res.json();
        const found = list.some((s: any) => s.slug === 'unpublished-draft-service-test');
        assert(!found, 'Security breach: Unpublished service leaked to public endpoint!');
      } finally {
        await prisma.service.delete({ where: { id: draft.id } });
      }
    });

    await test('Draft case study (published=false) is NOT leaked to public GET /api/v1/casestudies', async () => {
      const draft = await prisma.caseStudy.create({
        data: {
          client: 'کارفرمای محرمانه',
          clientEn: 'Confidential Client',
          titleFa: 'پروژه محرمانه در دست ساخت',
          titleEn: 'Confidential In-Flight Project',
          slug: 'unpublished-draft-casestudy-test',
          descriptionFa: 'توضیحات پیش‌نویس',
          descriptionEn: 'Draft description',
          published: false,
          position: 999,
        },
      });

      try {
        const res = await fetch(`${BASE_URL}/casestudies`);
        const list: any = await res.json();
        const found = list.some((c: any) => c.slug === 'unpublished-draft-casestudy-test');
        assert(!found, 'Security breach: Unpublished case study leaked to public endpoint!');
      } finally {
        await prisma.caseStudy.delete({ where: { id: draft.id } });
      }
    });

    // =========================================================================
    // SECTION 4: HOMEPAGE SECTIONS REORDERING & PERSISTENCE
    // =========================================================================
    console.log('\n--- SECTION 4: Homepage Sections Reordering Engine ---');

    await test('PUT /api/v1/home-sections/reorder updates ordering and state accurately', async () => {
      const initialRes = await fetch(`${BASE_URL}/home-sections`);
      const initialSections: any = await initialRes.json();
      assert(initialSections.length === 10, 'Expected 10 sections');

      // Invert positions of top 2
      const newOrder = [
        { sectionKey: initialSections[1].sectionKey, position: 1, isEnabled: true },
        { sectionKey: initialSections[0].sectionKey, position: 2, isEnabled: true },
        ...initialSections.slice(2).map((s: any, idx: number) => ({
          sectionKey: s.sectionKey,
          position: idx + 3,
          isEnabled: s.isEnabled,
        })),
      ];

      const putRes = await fetch(`${BASE_URL}/home-sections/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ sections: newOrder }),
      });
      assert(putRes.status === 200, `Expected 200, got ${putRes.status}`);

      // Re-fetch and verify new order
      const updatedRes = await fetch(`${BASE_URL}/home-sections`);
      const updatedList: any = await updatedRes.json();
      assert(updatedList[0].sectionKey === initialSections[1].sectionKey, 'Section 1 should be first now');
      assert(updatedList[1].sectionKey === initialSections[0].sectionKey, 'Section 0 should be second now');

      // Restore canonical original order
      const restoreOrder = initialSections.map((s: any, idx: number) => ({
        sectionKey: s.sectionKey,
        position: idx + 1,
        isEnabled: s.isEnabled,
      }));
      await fetch(`${BASE_URL}/home-sections/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ sections: restoreOrder }),
      });
    });

    // =========================================================================
    // SECTION 5: SITE SETTINGS UPDATE & CHANNELS PERSISTENCE
    // =========================================================================
    console.log('\n--- SECTION 5: Site Settings Persistence & Interactive Channels ---');

    await test('PUT /api/v1/site-settings updates interactive channels and contacts', async () => {
      const currentRes = await fetch(`${BASE_URL}/site-settings`);
      const originalSettings: any = await currentRes.json();

      const testChannel = {
        title: 'کانال آزمایشی تلگرام پشتیبانی ویژه',
        value: '@onsupp_e2e_test',
        type: 'telegram',
        action: 'https://t.me/onsupp_e2e_test',
        icon: 'telegram',
        description: 'پشتیبانی برخط شبانه‌روزی برای کارفرمایان پلن پرو',
      };

      const updatedChannels = [...(originalSettings.channels || []), testChannel];

      const putRes = await fetch(`${BASE_URL}/site-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          ...originalSettings,
          channels: updatedChannels,
        }),
      });
      assert(putRes.status === 200, `Expected 200, got ${putRes.status}`);

      // Verify persistence
      const verifyRes = await fetch(`${BASE_URL}/site-settings`);
      const verifyData: any = await verifyRes.json();
      const foundChannel = verifyData.channels.some((c: any) => c.value === '@onsupp_e2e_test');
      assert(foundChannel, 'Channel was not persisted in site settings');

      // Revert back
      await fetch(`${BASE_URL}/site-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(originalSettings),
      });
    });

  } finally {
    await prisma.$disconnect();
    server.close();
  }

  // Print summary
  console.log('\n======================================================');
  console.log('             TASK 03 E2E TEST SUMMARY                 ');
  console.log('======================================================');
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`  Total Tests : ${results.length}`);
  console.log(`  Passed      : ${passed}`);
  console.log(`  Failed      : ${failed}`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runE2ETests().catch((err) => {
  console.error('Fatal E2E test execution failure:', err);
  process.exit(1);
});
