import 'dotenv/config';
import http from 'http';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient, ContentStatus } from '@prisma/client';
import { app } from './server.js';
import { getJwtSecret, JWT_ALGORITHM } from './config/jwt.js';

const prisma = new PrismaClient();
const TEST_PORT = 3088;
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

async function getJson(res: any): Promise<any> {
  return res.json();
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

async function runTests() {
  console.log('\n======================================================');
  console.log('  ON-SUPP DYNAMIC CMS BACKEND FOUNDATION TEST SUITE   ');
  console.log('======================================================\n');

  // 1. Start Server on ephemeral port
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(TEST_PORT, resolve));
  console.log(`[test] Test server listening on ${BASE_URL}\n`);

  try {
    // 2. Prepare test accounts & tokens
    const secret = getJwtSecret();
    const pwHash = await bcrypt.hash('TestPass123!@#', 10);

    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@onsupp.ir' },
      update: { role: 'ADMIN', isActive: true },
      create: { email: 'admin@onsupp.ir', password: pwHash, role: 'ADMIN', name: 'Admin', isActive: true },
    });

    const hrUser = await prisma.user.upsert({
      where: { email: 'test_hr@onsupp.ir' },
      update: { role: 'HR', isActive: true },
      create: { email: 'test_hr@onsupp.ir', password: pwHash, role: 'HR', name: 'HR Manager', isActive: true },
    });

    const seoUser = await prisma.user.upsert({
      where: { email: 'test_seo@onsupp.ir' },
      update: { role: 'CONTENT_SEO_MANAGER', isActive: true },
      create: { email: 'test_seo@onsupp.ir', password: pwHash, role: 'CONTENT_SEO_MANAGER', name: 'SEO Lead', isActive: true },
    });

    const standardUser = await prisma.user.upsert({
      where: { email: 'test_user@onsupp.ir' },
      update: { role: 'USER', isActive: true },
      create: { email: 'test_user@onsupp.ir', password: pwHash, role: 'USER', name: 'Standard User', isActive: true },
    });

    const adminToken = jwt.sign({ id: adminUser.id, email: adminUser.email, role: adminUser.role }, secret, { algorithm: JWT_ALGORITHM });
    const hrToken = jwt.sign({ id: hrUser.id, email: hrUser.email, role: hrUser.role }, secret, { algorithm: JWT_ALGORITHM });
    const seoToken = jwt.sign({ id: seoUser.id, email: seoUser.email, role: seoUser.role }, secret, { algorithm: JWT_ALGORITHM });
    const userToken = jwt.sign({ id: standardUser.id, email: standardUser.email, role: standardUser.role }, secret, { algorithm: JWT_ALGORITHM });

    const adminHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` };
    const hrHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${hrToken}` };
    const seoHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${seoToken}` };
    const userHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` };
    const publicHeaders = { 'Content-Type': 'application/json' };

    // ─────────────────────────────────────────────────────────
    // MODULE 1: SITE SETTINGS
    // ─────────────────────────────────────────────────────────
    console.log('\n[Module 1: Site Settings]');

    await test('GET /site-settings returns singleton data publicly', async () => {
      const res = await fetch(`${BASE_URL}/site-settings`);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      const data = await getJson(res);
      assert(data.id === 1, `Expected singleton id=1`);
      assert(typeof data.siteNameFa === 'string', 'Expected siteNameFa');
      assert(Array.isArray(data.channels), 'Expected channels array');
    });

    await test('PUT /site-settings requires admin authentication', async () => {
      const resNoAuth = await fetch(`${BASE_URL}/site-settings`, {
        method: 'PUT',
        headers: publicHeaders,
        body: JSON.stringify({ siteNameFa: 'Hacked' }),
      });
      assert(resNoAuth.status === 401, `Expected 401 for unauthenticated request`);

      const resUser = await fetch(`${BASE_URL}/site-settings`, {
        method: 'PUT',
        headers: userHeaders,
        body: JSON.stringify({ siteNameFa: 'Hacked' }),
      });
      assert(resUser.status === 403, `Expected 403 for non-admin user`);
    });

    await test('PUT /site-settings updates singleton as admin', async () => {
      const res = await fetch(`${BASE_URL}/site-settings`, {
        method: 'PUT',
        headers: adminHeaders,
        body: JSON.stringify({ siteNameFa: 'آن‌ساپ تست', telegramHandle: 'onsupp_test' }),
      });
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      const data = await getJson(res);
      assert(data.siteNameFa === 'آن‌ساپ تست', 'Failed to update siteNameFa');

      // Revert to canonical
      await fetch(`${BASE_URL}/site-settings`, {
        method: 'PUT',
        headers: adminHeaders,
        body: JSON.stringify({ siteNameFa: 'آن‌ساپ', telegramHandle: 'onsupp_web' }),
      });
    });

    // ─────────────────────────────────────────────────────────
    // MODULE 2: CLIENT PARTNERS
    // ─────────────────────────────────────────────────────────
    console.log('\n[Module 2: Client Partners]');

    let testPartnerId = 0;

    await test('GET /client-partners returns only published & active partners', async () => {
      const res = await fetch(`${BASE_URL}/client-partners`);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      const data = await getJson(res);
      assert(Array.isArray(data), 'Expected array');
      assert(data.length >= 3, `Expected at least 3 seeded partners, got ${data.length}`);
      for (const p of data) {
        assert(p.isActive === true, 'Public endpoint must only return active partners');
        assert(p.status === 'PUBLISHED', 'Public endpoint must only return published partners');
      }
    });

    await test('POST /client-partners creates partner as admin', async () => {
      const res = await fetch(`${BASE_URL}/client-partners`, {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({
          nameFa: 'شرکت تستی الف',
          nameEn: 'Alpha Test Co',
          titleFa: 'خدمات آزمایشی',
          titleEn: 'Test Services',
          status: 'DRAFT',
          isActive: true,
          position: 99,
        }),
      });
      assert(res.status === 201, `Expected 201, got ${res.status}`);
      const data = await getJson(res);
      testPartnerId = data.id;
      assert(testPartnerId > 0, 'Invalid id returned');
      assert(data.status === 'DRAFT', 'Expected DRAFT status');
    });

    await test('Public GET /client-partners strictly excludes DRAFT partner', async () => {
      const res = await fetch(`${BASE_URL}/client-partners`);
      const data = await getJson(res);
      const leaked = data.find((p: any) => p.id === testPartnerId);
      assert(!leaked, 'CRITICAL: Draft partner leaked into public GET response!');
    });

    await test('Admin GET /client-partners/admin includes DRAFT partner', async () => {
      const res = await fetch(`${BASE_URL}/client-partners/admin`, { headers: adminHeaders });
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      const data = await getJson(res);
      const found = data.find((p: any) => p.id === testPartnerId);
      assert(Boolean(found), 'Admin should be able to see draft partners');
    });

    await test('PUT /client-partners/:id updates partner', async () => {
      const res = await fetch(`${BASE_URL}/client-partners/${testPartnerId}`, {
        method: 'PUT',
        headers: adminHeaders,
        body: JSON.stringify({ nameFa: 'شرکت تستی ویرایش‌شده', status: 'PUBLISHED' }),
      });
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      const data = await getJson(res);
      assert(data.nameFa === 'شرکت تستی ویرایش‌شده', 'Failed to update nameFa');
      assert(data.status === 'PUBLISHED', 'Failed to update status');
    });

    await test('PUT /client-partners/reorder updates positions in batch', async () => {
      const res = await fetch(`${BASE_URL}/client-partners/reorder`, {
        method: 'PUT',
        headers: adminHeaders,
        body: JSON.stringify({
          items: [{ id: testPartnerId, position: 100 }],
        }),
      });
      assert(res.status === 200, `Expected 200, got ${res.status}`);
    });

    await test('DELETE /client-partners/:id deletes partner', async () => {
      const res = await fetch(`${BASE_URL}/client-partners/${testPartnerId}`, {
        method: 'DELETE',
        headers: adminHeaders,
      });
      assert(res.status === 200, `Expected 200, got ${res.status}`);
    });

    // ─────────────────────────────────────────────────────────
    // MODULE 3: CLIENT LOGOS
    // ─────────────────────────────────────────────────────────
    console.log('\n[Module 3: Client Logos]');

    let testLogoId = 0;

    await test('GET /client-logos returns active published logos', async () => {
      const res = await fetch(`${BASE_URL}/client-logos`);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      const data = await getJson(res);
      assert(Array.isArray(data), 'Expected array');
      assert(data.length >= 9, `Expected at least 9 logos, got ${data.length}`);
    });

    await test('POST /client-logos creates logo as admin', async () => {
      const res = await fetch(`${BASE_URL}/client-logos`, {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({
          nameFa: 'لوگوی تستی',
          imageUrl: '/images/test-logo.png',
          status: 'DRAFT',
        }),
      });
      assert(res.status === 201, `Expected 201, got ${res.status}`);
      const data = await getJson(res);
      testLogoId = data.id;
      assert(testLogoId > 0, 'Invalid id');
    });

    await test('Public GET /client-logos excludes DRAFT logo', async () => {
      const res = await fetch(`${BASE_URL}/client-logos`);
      const data = await getJson(res);
      const leaked = data.find((l: any) => l.id === testLogoId);
      assert(!leaked, 'CRITICAL: Draft logo leaked into public response!');
    });

    await test('DELETE /client-logos/:id deletes logo', async () => {
      const res = await fetch(`${BASE_URL}/client-logos/${testLogoId}`, {
        method: 'DELETE',
        headers: adminHeaders,
      });
      assert(res.status === 200, `Expected 200, got ${res.status}`);
    });

    // ─────────────────────────────────────────────────────────
    // MODULE 4: TEAM MEMBERS (RBAC: HR + ADMIN)
    // ─────────────────────────────────────────────────────────
    console.log('\n[Module 4: Team Members]');

    let testMemberId = 0;

    await test('GET /team-members returns published team members publicly', async () => {
      const res = await fetch(`${BASE_URL}/team-members`);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      const data = await getJson(res);
      assert(Array.isArray(data), 'Expected array');
      assert(data.length >= 4, `Expected at least 4 team members, got ${data.length}`);
    });

    await test('GET /team-members/admin permits HR and Admin, blocks USER', async () => {
      const resUser = await fetch(`${BASE_URL}/team-members/admin`, { headers: userHeaders });
      assert(resUser.status === 403, `Expected 403 for standard user`);

      const resHr = await fetch(`${BASE_URL}/team-members/admin`, { headers: hrHeaders });
      assert(resHr.status === 200, `Expected 200 for HR user`);

      const resAdmin = await fetch(`${BASE_URL}/team-members/admin`, { headers: adminHeaders });
      assert(resAdmin.status === 200, `Expected 200 for Admin user`);
    });

    await test('POST /team-members creates member with HR role', async () => {
      const res = await fetch(`${BASE_URL}/team-members`, {
        method: 'POST',
        headers: hrHeaders,
        body: JSON.stringify({
          nameFa: 'کارشناس تستی',
          roleFa: 'توسعه‌دهنده فرانت‌اند',
          status: 'DRAFT',
          isPublished: false,
        }),
      });
      assert(res.status === 201, `Expected 201, got ${res.status}`);
      const data = await getJson(res);
      testMemberId = data.id;
      assert(testMemberId > 0, 'Invalid id');
    });

    await test('DELETE /team-members/:id deletes member with HR role', async () => {
      const res = await fetch(`${BASE_URL}/team-members/${testMemberId}`, {
        method: 'DELETE',
        headers: hrHeaders,
      });
      assert(res.status === 200, `Expected 200, got ${res.status}`);
    });

    // ─────────────────────────────────────────────────────────
    // MODULE 5: ABOUT PAGE SETTINGS
    // ─────────────────────────────────────────────────────────
    console.log('\n[Module 5: About Page Settings]');

    await test('GET /about-page returns singleton about data', async () => {
      const res = await fetch(`${BASE_URL}/about-page`);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      const data = await getJson(res);
      assert(data.id === 1, 'Expected id=1');
      assert(typeof data.heroTitleFa === 'string', 'Expected heroTitleFa');
      assert(Array.isArray(data.coreValues), 'Expected coreValues array');
    });

    await test('PUT /about-page updates settings as admin', async () => {
      const res = await fetch(`${BASE_URL}/about-page`, {
        method: 'PUT',
        headers: adminHeaders,
        body: JSON.stringify({ ceoNameFa: 'علی شمس' }),
      });
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      const data = await getJson(res);
      assert(data.ceoNameFa === 'علی شمس', 'Failed to update ceoNameFa');
    });

    // ─────────────────────────────────────────────────────────
    // MODULE 6: HOME SECTIONS
    // ─────────────────────────────────────────────────────────
    console.log('\n[Module 6: Home Sections]');

    await test('GET /home-sections returns only enabled sections publicly', async () => {
      const res = await fetch(`${BASE_URL}/home-sections`);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      const data = await getJson(res);
      assert(Array.isArray(data), 'Expected array');
      assert(data.length === 10, `Expected 10 enabled sections, got ${data.length}`);
      for (const s of data) {
        assert(s.isEnabled === true, 'Public endpoint must only return enabled sections');
      }
    });

    await test('PUT /home-sections/:key updates section properties', async () => {
      const res = await fetch(`${BASE_URL}/home-sections/services`, {
        method: 'PUT',
        headers: adminHeaders,
        body: JSON.stringify({ titleFa: 'خدمات تخصصی آن‌ساپ' }),
      });
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      const data = await getJson(res);
      assert(data.titleFa === 'خدمات تخصصی آن‌ساپ', 'Failed to update titleFa');

      // Revert
      await fetch(`${BASE_URL}/home-sections/services`, {
        method: 'PUT',
        headers: adminHeaders,
        body: JSON.stringify({ titleFa: 'خدمات تخصصی' }),
      });
    });

    // ─────────────────────────────────────────────────────────
    // MODULE 7: PAGE SEO (RBAC: CONTENT_SEO_MANAGER + ADMIN)
    // ─────────────────────────────────────────────────────────
    console.log('\n[Module 7: Page SEO]');

    let testSeoId = 0;

    await test('GET /page-seo/by-path returns SEO for specific route publicly', async () => {
      const res = await fetch(`${BASE_URL}/page-seo/by-path?path=/about`);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      const data = await getJson(res);
      assert(data.routePath === '/about', 'Expected /about route');
      assert(typeof data.titleFa === 'string', 'Expected titleFa');
    });

    await test('GET /page-seo/admin permits SEO Manager, blocks USER', async () => {
      const resUser = await fetch(`${BASE_URL}/page-seo/admin`, { headers: userHeaders });
      assert(resUser.status === 403, `Expected 403 for user`);

      const resSeo = await fetch(`${BASE_URL}/page-seo/admin`, { headers: seoHeaders });
      assert(resSeo.status === 200, `Expected 200 for SEO manager`);
    });

    await test('PUT /page-seo upserts SEO configuration with SEO Manager role', async () => {
      const res = await fetch(`${BASE_URL}/page-seo`, {
        method: 'PUT',
        headers: seoHeaders,
        body: JSON.stringify({
          routePath: '/test-page-seo',
          titleFa: 'صفحه تستی سئو',
          descriptionFa: 'توضیحات تستی سئو',
        }),
      });
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      const data = await getJson(res);
      testSeoId = data.id;
      assert(testSeoId > 0, 'Invalid id');
      assert(data.routePath === '/test-page-seo', 'Invalid routePath');
    });

    await test('DELETE /page-seo/:id deletes SEO configuration with SEO Manager role', async () => {
      const res = await fetch(`${BASE_URL}/page-seo/${testSeoId}`, {
        method: 'DELETE',
        headers: seoHeaders,
      });
      assert(res.status === 200, `Expected 200, got ${res.status}`);
    });

    // ─────────────────────────────────────────────────────────
    // MODULE 8: EXTENDED SERVICES, CASE STUDIES, STATS
    // ─────────────────────────────────────────────────────────
    console.log('\n[Module 8: Extended Existing Services, CaseStudies, Stats]');

    await test('GET /services returns published services & GET /by-slug/:slug works', async () => {
      const res = await fetch(`${BASE_URL}/services`);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      const services = await getJson(res);
      assert(Array.isArray(services), 'Expected array');
      assert(services.length >= 7, `Expected at least 7 services, got ${services.length}`);

      const targetService = services.find((s: any) => s.slug && s.slug.trim().length > 0) || services[0];
      const serviceSlug = targetService.slug;
      assert(typeof serviceSlug === 'string' && serviceSlug.length > 0, 'Expected non-empty slug');

      const resSlug = await fetch(`${BASE_URL}/services/by-slug/${serviceSlug}`);
      assert(resSlug.status === 200, `Expected 200 for /by-slug/${serviceSlug}`);
      const single = await getJson(resSlug);
      assert(single.slug === serviceSlug, 'Slug mismatch');
    });

    await test('GET /casestudies returns published case studies & GET /by-slug works', async () => {
      const res = await fetch(`${BASE_URL}/casestudies`);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      const studies = await getJson(res);
      assert(Array.isArray(studies), 'Expected array');
      assert(studies.length >= 2, `Expected at least 2 case studies`);

      const targetCs = studies.find((c: any) => c.slug && c.slug.trim().length > 0) || studies[0];
      const csSlug = targetCs.slug;
      if (csSlug) {
        const resSlug = await fetch(`${BASE_URL}/casestudies/by-slug/${csSlug}`);
        assert(resSlug.status === 200, `Expected 200 for case study slug ${csSlug}`);
        const single = await getJson(resSlug);
        assert(single.slug === csSlug, 'Slug mismatch');
      }
    });

    await test('GET /stats returns published stats', async () => {
      const res = await fetch(`${BASE_URL}/stats`);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      const stats = await getJson(res);
      assert(Array.isArray(stats), 'Expected array');
      assert(stats.length >= 4, `Expected at least 4 stats, got ${stats.length}`);
    });

    // ─────────────────────────────────────────────────────────
    // MODULE 9: LEAKAGE DEFENSE-IN-DEPTH TEST
    // ─────────────────────────────────────────────────────────
    console.log('\n[Module 9: Strict Draft Leakage Verification]');

    await test('Services: DRAFT service is never returned on public GET', async () => {
      const draftService = await prisma.service.create({
        data: {
          title: 'سرویس پیش‌نویس محرمانه',
          slug: `draft-service-${Date.now()}`,
          status: ContentStatus.DRAFT,
          published: false,
        },
      });

      const res = await fetch(`${BASE_URL}/services`);
      const list = await getJson(res);
      const leaked = list.find((s: any) => s.id === draftService.id);

      const resSingle = await fetch(`${BASE_URL}/services/by-slug/${draftService.slug}`);

      await prisma.service.delete({ where: { id: draftService.id } });

      assert(!leaked, 'CRITICAL: Draft service was leaked in public list!');
      assert(resSingle.status === 404, 'CRITICAL: Draft service was accessible publicly by slug without auth!');
    });

    await test('CaseStudies: DRAFT case study is never returned on public GET', async () => {
      const draftCs = await prisma.caseStudy.create({
        data: {
          titleFa: 'پروژه محرمانه پیش‌نویس',
          slug: `draft-casestudy-${Date.now()}`,
          status: ContentStatus.DRAFT,
          published: false,
        },
      });

      const res = await fetch(`${BASE_URL}/casestudies`);
      const list = await getJson(res);
      const leaked = list.find((c: any) => c.id === draftCs.id);

      const resSingle = await fetch(`${BASE_URL}/casestudies/by-slug/${draftCs.slug}`);

      await prisma.caseStudy.delete({ where: { id: draftCs.id } });

      assert(!leaked, 'CRITICAL: Draft case study was leaked in public list!');
      assert(resSingle.status === 404, 'CRITICAL: Draft case study was accessible publicly by slug without auth!');
    });

  } finally {
    // 3. Clean up test users
    await prisma.user.deleteMany({
      where: { email: { in: ['test_hr@onsupp.ir', 'test_seo@onsupp.ir', 'test_user@onsupp.ir'] } },
    });
    await prisma.$disconnect();
    server.close();
  }

  // Summary
  console.log('\n======================================================');
  console.log('                 TEST SUITE SUMMARY                   ');
  console.log('======================================================');
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;

  console.log(`  Total Tests : ${total}`);
  console.log(`  Passed      : ${passed}`);
  console.log(`  Failed      : ${failed}`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('[test FATAL] Unexpected runner error:', err);
  process.exit(1);
});
