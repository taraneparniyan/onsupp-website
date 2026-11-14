import 'dotenv/config';
import http from 'http';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { app } from './server.js';
import { getJwtSecret, JWT_ALGORITHM } from './config/jwt.js';
import { getRevalidateSecret } from './services/revalidateService.js';

const prisma = new PrismaClient();
const PORT = 3089;
const BASE_URL = `http://127.0.0.1:${PORT}`;

interface RequestOptions {
  method?: string;
  path: string;
  token?: string;
  headers?: Record<string, string>;
  body?: any;
}

async function apiRequest({ method = 'GET', path, token, headers = {}, body }: RequestOptions): Promise<{
  status: number;
  data: any;
}> {
  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token) {
    reqHeaders['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: reqHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data: any = null;
  const text = await res.text();
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  return { status: res.status, data };
}

function generateToken(user: { id: number; email: string; role: string }): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    getJwtSecret(),
    { expiresIn: '1h', algorithm: JWT_ALGORITHM }
  );
}

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  [FAIL] ${testName}${detail ? ` -> ${detail}` : ''}`);
    failedTests++;
  }
}

async function run() {
  console.log('================================================================');
  console.log('   STARTING DYNAMIC CMS BACKEND FOUNDATION E2E TEST SUITE');
  console.log('================================================================\n');

  // Start HTTP Server
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(PORT, resolve));
  console.log(`[test] Ephemeral test server listening on ${BASE_URL}\n`);

  let employeeUser: any = null;
  let contentManagerUser: any = null;
  let superAdminUser: any = null;

  try {
    // 1. Setup Test Users
    superAdminUser = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' },
    });
    if (!superAdminUser) {
      throw new Error('Super Admin user not found in database');
    }

    const hashedDummyPassword = await bcrypt.hash('TestPass@12345678', 10);

    // Create temporary employee
    employeeUser = await prisma.user.create({
      data: {
        email: `test-employee-${Date.now()}@example.com`,
        name: 'Test Employee',
        role: 'EMPLOYEE',
        password: hashedDummyPassword,
        isActive: true,
      },
    });

    // Create temporary content manager
    contentManagerUser = await prisma.user.create({
      data: {
        email: `test-content-mgr-${Date.now()}@example.com`,
        name: 'Test Content Manager',
        role: 'CONTENT_SEO_MANAGER',
        password: hashedDummyPassword,
        isActive: true,
      },
    });

    const superAdminToken = generateToken(superAdminUser);
    const employeeToken = generateToken(employeeUser);
    const contentManagerToken = generateToken(contentManagerUser);

    console.log('--- Phase 1: Health & Public Endpoints ---');

    // Health
    const health = await apiRequest({ path: '/health' });
    assert(health.status === 200 && health.data.status === 'ok', 'Health check returns 200 OK');

    // Settings
    const settings = await apiRequest({ path: '/api/v1/settings' });
    assert(settings.status === 200 && settings.data.siteNameFa === 'آن‌ساپ', 'GET /api/v1/settings returns site settings');

    // Sections
    const sections = await apiRequest({ path: '/api/v1/sections' });
    assert(sections.status === 200 && Array.isArray(sections.data) && sections.data.length >= 10, 'GET /api/v1/sections returns enabled homepage sections');

    // Hero slides
    const hero = await apiRequest({ path: '/api/v1/hero' });
    assert(hero.status === 200 && Array.isArray(hero.data) && hero.data.length >= 1, 'GET /api/v1/hero returns published slides');

    // Services
    const services = await apiRequest({ path: '/api/v1/services' });
    assert(services.status === 200 && Array.isArray(services.data) && services.data.length >= 7, 'GET /api/v1/services returns 7+ published services');

    const serviceDetail = await apiRequest({ path: '/api/v1/services/web-development' });
    assert(serviceDetail.status === 200 && serviceDetail.data.slug === 'web-development', 'GET /api/v1/services/web-development returns service by slug');

    // Case Studies
    const casestudies = await apiRequest({ path: '/api/v1/casestudies' });
    assert(casestudies.status === 200 && Array.isArray(casestudies.data) && casestudies.data.length >= 1, 'GET /api/v1/casestudies returns published case studies');

    const caseStudyDetail = await apiRequest({ path: '/api/v1/casestudies/dr-miresmaeli-clinic' });
    assert(caseStudyDetail.status === 200 && caseStudyDetail.data.slug === 'dr-miresmaeli-clinic', 'GET /api/v1/casestudies/dr-miresmaeli-clinic returns case study by slug');

    // Stats
    const stats = await apiRequest({ path: '/api/v1/stats' });
    assert(stats.status === 200 && Array.isArray(stats.data) && stats.data.length >= 4, 'GET /api/v1/stats returns 4 published stats');

    // About Page Composite
    const aboutPage = await apiRequest({ path: '/api/v1/about/page' });
    assert(
      aboutPage.status === 200 &&
      aboutPage.data.hero &&
      aboutPage.data.intro &&
      aboutPage.data.ceo &&
      aboutPage.data.team,
      'GET /api/v1/about/page returns composite about page structure'
    );

    // CEO
    const ceo = await apiRequest({ path: '/api/v1/about/ceo' });
    assert(ceo.status === 200 && typeof ceo.data.nameFa === 'string' && ceo.data.nameFa.length > 0, 'GET /api/v1/about/ceo returns CEO profile');

    // Company Values
    const values = await apiRequest({ path: '/api/v1/about/values' });
    assert(values.status === 200 && Array.isArray(values.data) && values.data.length >= 3, 'GET /api/v1/about/values returns company values');

    // Team
    const team = await apiRequest({ path: '/api/v1/team' });
    assert(team.status === 200 && Array.isArray(team.data) && team.data.length >= 8, 'GET /api/v1/team returns 8 team members');

    // Clients
    const clients = await apiRequest({ path: '/api/v1/clients' });
    assert(clients.status === 200 && Array.isArray(clients.data) && clients.data.length >= 3, 'GET /api/v1/clients returns published client partners');

    // Client Logos
    const logos = await apiRequest({ path: '/api/v1/client-logos' });
    assert(logos.status === 200 && Array.isArray(logos.data) && logos.data.length >= 9, 'GET /api/v1/client-logos returns 9 client logos');

    // Testimonials
    const testimonials = await apiRequest({ path: '/api/v1/testimonials' });
    assert(testimonials.status === 200 && Array.isArray(testimonials.data) && testimonials.data.length >= 1, 'GET /api/v1/testimonials returns active testimonials');

    console.log('\n--- Phase 2: Public vs. Draft Isolation ---');

    // Create DRAFT Case Study directly in DB
    const draftCaseStudy = await prisma.caseStudy.create({
      data: {
        titleFa: 'پروژه تستی آزمایشی مخفی',
        slug: 'secret-draft-case-study',
        descriptionFa: 'توضیحات پیش‌نویس',
        isPublished: false,
        status: 'DRAFT',
      },
    });

    // Public list should NOT include it
    const publicCasestudies = await apiRequest({ path: '/api/v1/casestudies' });
    const foundInPublic = publicCasestudies.data.some((c: any) => c.slug === 'secret-draft-case-study');
    assert(!foundInPublic, 'Draft case study is hidden from public list');

    // Public slug lookup should return 404
    const publicDraftLookup = await apiRequest({ path: '/api/v1/casestudies/secret-draft-case-study' });
    assert(publicDraftLookup.status === 404, 'Public lookup of draft case study returns 404');

    // Admin list (/all) SHOULD include it
    const adminCasestudies = await apiRequest({
      path: '/api/v1/casestudies/all',
      token: contentManagerToken,
    });
    const foundInAdmin = adminCasestudies.data.some((c: any) => c.slug === 'secret-draft-case-study');
    assert(foundInAdmin, 'Draft case study is visible in admin GET /casestudies/all');

    // Clean up draft case study
    await prisma.caseStudy.delete({ where: { id: draftCaseStudy.id } });

    // Same check for Service
    const draftService = await prisma.service.create({
      data: {
        title: 'خدمت آزمایشی پیش‌نویس',
        slug: 'secret-draft-service',
        isPublished: false,
        status: 'DRAFT',
      },
    });

    const publicServices = await apiRequest({ path: '/api/v1/services' });
    const serviceFoundInPublic = publicServices.data.some((s: any) => s.slug === 'secret-draft-service');
    assert(!serviceFoundInPublic, 'Draft service is hidden from public list');

    const adminServices = await apiRequest({
      path: '/api/v1/services/all',
      token: contentManagerToken,
    });
    const serviceFoundInAdmin = adminServices.data.some((s: any) => s.slug === 'secret-draft-service');
    assert(serviceFoundInAdmin, 'Draft service is visible in admin GET /services/all');

    await prisma.service.delete({ where: { id: draftService.id } });

    console.log('\n--- Phase 3: RBAC & Permission Enforcement ---');

    // Unauthenticated update attempt on settings
    const unauthSettings = await apiRequest({
      method: 'PUT',
      path: '/api/v1/settings',
      body: { siteNameFa: 'Hacked Brand' },
    });
    assert(unauthSettings.status === 401, 'Unauthenticated PUT /settings rejected with 401');

    // Employee update attempt on settings (Forbidden)
    const employeeSettings = await apiRequest({
      method: 'PUT',
      path: '/api/v1/settings',
      token: employeeToken,
      body: { siteNameFa: 'Unauthorized Change' },
    });
    assert(employeeSettings.status === 403, 'EMPLOYEE role PUT /settings rejected with 403 Forbidden');

    // Content Manager update attempt on settings (Only SUPER_ADMIN / ADMIN can edit site settings)
    const contentMgrSettings = await apiRequest({
      method: 'PUT',
      path: '/api/v1/settings',
      token: contentManagerToken,
      body: { siteNameFa: 'Unauthorized Change' },
    });
    assert(contentMgrSettings.status === 403, 'CONTENT_SEO_MANAGER role PUT /settings rejected with 403 Forbidden');

    // Super Admin update on settings (Allowed)
    const superAdminSettings = await apiRequest({
      method: 'PUT',
      path: '/api/v1/settings',
      token: superAdminToken,
      body: { siteTitleFa: 'پارتنر فنی و راهبردی کسب‌وکارهای پیشرو' },
    });
    assert(superAdminSettings.status === 200, 'SUPER_ADMIN role PUT /settings accepted with 200 OK');

    // Content Manager creating a service (Allowed for CONTENT_SEO_MANAGER)
    const createServiceRes = await apiRequest({
      method: 'POST',
      path: '/api/v1/services',
      token: contentManagerToken,
      body: {
        title: 'سرویس هوش مصنوعی و اتوماسیون',
        slug: 'ai-automation-test',
        subtitle: 'اتوماسیون فرآیندهای سازمانی با هوش مصنوعی',
        isPublished: true,
        status: 'PUBLISHED',
      },
    });
    assert(createServiceRes.status === 201, 'CONTENT_SEO_MANAGER role POST /services creates item with 201');

    // Employee creating a service (Forbidden)
    const employeeCreateService = await apiRequest({
      method: 'POST',
      path: '/api/v1/services',
      token: employeeToken,
      body: {
        title: 'تلاش کارمند',
        slug: 'employee-attempt',
      },
    });
    assert(employeeCreateService.status === 403, 'EMPLOYEE role POST /services rejected with 403 Forbidden');

    // Clean up created service
    if (createServiceRes.data?.id) {
      await prisma.service.delete({ where: { id: createServiceRes.data.id } });
    }

    console.log('\n--- Phase 4: Cache Revalidation Endpoint ---');

    // Missing authentication & secret
    const revalNoAuth = await apiRequest({
      method: 'POST',
      path: '/api/v1/revalidate',
      body: { tags: ['services'] },
    });
    assert(revalNoAuth.status === 401, 'POST /revalidate without auth or secret rejected with 401');

    // Invalid secret
    const revalBadSecret = await apiRequest({
      method: 'POST',
      path: '/api/v1/revalidate',
      headers: { 'x-revalidate-secret': 'wrong_secret_123' },
      body: { tags: ['services'] },
    });
    assert(revalBadSecret.status === 401 || revalBadSecret.status === 403, 'POST /revalidate with invalid secret rejected with 401/403');

    // Valid secret via header
    const validSecret = getRevalidateSecret();
    const revalValidSecret = await apiRequest({
      method: 'POST',
      path: '/api/v1/revalidate',
      headers: { 'x-revalidate-secret': validSecret },
      body: { tags: ['services', 'homepage'], paths: ['/services'] },
    });
    assert(
      revalValidSecret.status === 200 &&
      revalValidSecret.data.success === true &&
      Array.isArray(revalValidSecret.data.tags) &&
      revalValidSecret.data.tags.includes('services'),
      'POST /revalidate with valid secret header returns 200 with tags acknowledged'
    );

    // Valid token via Bearer (CONTENT_SEO_MANAGER)
    const revalBearerAuth = await apiRequest({
      method: 'POST',
      path: '/api/v1/revalidate',
      token: contentManagerToken,
      body: { tags: ['casestudies'], paths: ['/portfolio'] },
    });
    assert(
      revalBearerAuth.status === 200 &&
      revalBearerAuth.data.success === true &&
      revalBearerAuth.data.tags.includes('casestudies'),
      'POST /revalidate with CONTENT_SEO_MANAGER token returns 200'
    );

  } finally {
    // Clean up test users
    if (employeeUser?.id) {
      await prisma.user.delete({ where: { id: employeeUser.id } }).catch(() => {});
    }
    if (contentManagerUser?.id) {
      await prisma.user.delete({ where: { id: contentManagerUser.id } }).catch(() => {});
    }

    server.close();
    await prisma.$disconnect();
  }

  console.log('\n================================================================');
  console.log(`   TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('[FATAL] Test runner failed:', err);
  process.exit(1);
});
