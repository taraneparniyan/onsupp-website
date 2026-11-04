import http from 'http';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import siteSettingsRouter from './routes/siteSettings.js';
import clientPartnersRouter from './routes/clientPartners.js';
import clientLogosRouter from './routes/clientLogos.js';
import teamMembersRouter from './routes/teamMembers.js';
import aboutPageRouter from './routes/aboutPage.js';
import homeSectionsRouter from './routes/homeSections.js';
import pageSeoRouter from './routes/pageSeo.js';
import servicesRouter from './routes/services.js';
import caseStudiesRouter from './routes/casestudies.js';
import statsRouter from './routes/stats.js';
import mediaRouter from './routes/media.js';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'onsupp_jwt_super_secret_test_key_2026';
const PORT = 3105;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

let server: http.Server;
let adminToken: string;
let hrToken: string;
let seoToken: string;
let userToken: string;

let passed = 0;
let failed = 0;
const results: { category: string; test: string; status: 'PASS' | 'FAIL'; note?: string }[] = [];

function record(category: string, test: string, success: boolean, note?: string) {
  if (success) {
    passed++;
    results.push({ category, test, status: 'PASS', note });
    console.log(`  ✓ [${category}] ${test}`);
  } else {
    failed++;
    results.push({ category, test, status: 'FAIL', note });
    console.error(`  ✗ [${category}] ${test} - ${note || 'FAILED'}`);
  }
}

async function startServer(): Promise<void> {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Mount routers
  app.use('/api/v1/site-settings', siteSettingsRouter);
  app.use('/api/v1/client-partners', clientPartnersRouter);
  app.use('/api/v1/client-logos', clientLogosRouter);
  app.use('/api/v1/team-members', teamMembersRouter);
  app.use('/api/v1/about-page', aboutPageRouter);
  app.use('/api/v1/home-sections', homeSectionsRouter);
  app.use('/api/v1/page-seo', pageSeoRouter);
  app.use('/api/v1/services', servicesRouter);
  app.use('/api/v1/casestudies', caseStudiesRouter);
  app.use('/api/v1/stats', statsRouter);
  app.use('/api/v1/media', mediaRouter);

  return new Promise((resolve) => {
    server = app.listen(PORT, () => {
      console.log(`[audit-test] Test server listening on ${BASE_URL}`);
      resolve();
    });
  });
}

async function setupUsers(): Promise<void> {
  const adminUser = await prisma.user.upsert({
    where: { email: 'superadmin@onsupp.ir' },
    update: { role: 'SUPER_ADMIN' },
    create: { email: 'superadmin@onsupp.ir', password: 'hashed_password', name: 'Super Admin', role: 'SUPER_ADMIN' },
  });
  adminToken = jwt.sign({ id: adminUser.id, role: 'SUPER_ADMIN', email: adminUser.email }, JWT_SECRET, { expiresIn: '1h' });

  const hrUser = await prisma.user.upsert({
    where: { email: 'hr@onsupp.ir' },
    update: { role: 'HR' },
    create: { email: 'hr@onsupp.ir', password: 'hashed_password', name: 'HR Manager', role: 'HR' },
  });
  hrToken = jwt.sign({ id: hrUser.id, role: 'HR', email: hrUser.email }, JWT_SECRET, { expiresIn: '1h' });

  const seoUser = await prisma.user.upsert({
    where: { email: 'seo@onsupp.ir' },
    update: { role: 'CONTENT_SEO_MANAGER' },
    create: { email: 'seo@onsupp.ir', password: 'hashed_password', name: 'SEO Manager', role: 'CONTENT_SEO_MANAGER' },
  });
  seoToken = jwt.sign({ id: seoUser.id, role: 'CONTENT_SEO_MANAGER', email: seoUser.email }, JWT_SECRET, { expiresIn: '1h' });

  const regUser = await prisma.user.upsert({
    where: { email: 'user@onsupp.ir' },
    update: { role: 'USER' },
    create: { email: 'user@onsupp.ir', password: 'hashed_password', name: 'Regular User', role: 'USER' },
  });
  userToken = jwt.sign({ id: regUser.id, role: 'USER', email: regUser.email }, JWT_SECRET, { expiresIn: '1h' });
}

async function runAudit() {
  await startServer();
  await setupUsers();

  console.log('\n--- AUDIT SECTION 1: Database Source & Public Reads Verification ---');

  // 1. Site Settings
  const resSettings = await fetch(`${BASE_URL}/site-settings`);
  const settingsData: any = await resSettings.json();
  record('Database-Backed', 'SiteSettings returns 200 with structured company info and channels', resSettings.ok && Array.isArray(settingsData.channels));

  // 2. Client Partners
  const resPartners = await fetch(`${BASE_URL}/client-partners`);
  const partnersData: any = await resPartners.json();
  record('Database-Backed', 'ClientPartners returns 200 with active published partners', resPartners.ok && Array.isArray(partnersData) && partnersData.length > 0);

  // 3. Client Logos
  const resLogos = await fetch(`${BASE_URL}/client-logos`);
  const logosData: any = await resLogos.json();
  record('Database-Backed', 'ClientLogos returns 200 with active marquee brand logos', resLogos.ok && Array.isArray(logosData) && logosData.length > 0);

  // 4. Team Members
  const resTeam = await fetch(`${BASE_URL}/team-members`);
  const teamData: any = await resTeam.json();
  record('Database-Backed', 'TeamMembers returns 200 with active published members', resTeam.ok && Array.isArray(teamData) && teamData.length > 0);

  // 5. About Page
  const resAbout = await fetch(`${BASE_URL}/about-page`);
  const aboutData: any = await resAbout.json();
  record('Database-Backed', 'AboutPage returns 200 with narrative, values and CEO profile', resAbout.ok && !!aboutData.heroTitleFa);

  // 6. Home Sections
  const resSections = await fetch(`${BASE_URL}/home-sections`);
  const sectionsData: any = await resSections.json();
  record('Database-Backed', 'HomeSections returns 200 with all 10 enabled homepage sections ordered', resSections.ok && Array.isArray(sectionsData) && sectionsData.length === 10);

  // 7. Page SEO
  const resSeo = await fetch(`${BASE_URL}/page-seo/by-route?routePath=/`);
  const seoData: any = await resSeo.json();
  record('Database-Backed', 'PageSeo resolves metadata for root route', resSeo.ok && !!seoData.titleFa);

  // 8. Services
  const resServices = await fetch(`${BASE_URL}/services`);
  const servicesData: any = await resServices.json();
  record('Database-Backed', 'Services returns 200 with published services', resServices.ok && Array.isArray(servicesData) && servicesData.length > 0);

  // 9. Case Studies
  const resCases = await fetch(`${BASE_URL}/casestudies`);
  const casesData: any = await resCases.json();
  record('Database-Backed', 'CaseStudies returns 200 with published portfolio items', resCases.ok && Array.isArray(casesData) && casesData.length > 0);

  // 10. Stats
  const resStats = await fetch(`${BASE_URL}/stats`);
  const statsData: any = await resStats.json();
  record('Database-Backed', 'Stats returns 200 with published KPI metrics', resStats.ok && Array.isArray(statsData) && statsData.length > 0);

  console.log('\n--- AUDIT SECTION 2: Server-Side RBAC Enforcement ---');

  // RBAC 1: Unauthenticated mutation rejected
  const resUnauth = await fetch(`${BASE_URL}/site-settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ siteNameFa: 'Hacked' }),
  });
  record('RBAC', 'Unauthenticated PUT /site-settings rejected with 401', resUnauth.status === 401);

  // RBAC 2: Regular USER rejected
  const resForbidden = await fetch(`${BASE_URL}/client-partners`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({ nameFa: 'Forbidden' }),
  });
  record('RBAC', 'Regular USER role rejected with 403 on protected mutation', resForbidden.status === 403);

  // RBAC 3: HR Role authorized on Team Members
  const resHrCreate = await fetch(`${BASE_URL}/team-members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${hrToken}` },
    body: JSON.stringify({
      nameFa: 'تست نقش منابع انسانی',
      nameEn: 'HR Test Member',
      roleFa: 'کارشناس منابع انسانی',
      roleEn: 'HR Specialist',
      departmentFa: 'منابع انسانی',
      departmentEn: 'People & Culture',
      status: 'PUBLISHED',
      isPublished: true,
      position: 99,
    }),
  });
  const hrCreated: any = await resHrCreate.json();
  record('RBAC', 'HR role permitted to POST /team-members (status 201)', resHrCreate.status === 201 && !!hrCreated.id);

  // Clean up HR test member
  if (hrCreated?.id) {
    await fetch(`${BASE_URL}/team-members/${hrCreated.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${hrToken}` },
    });
  }

  // RBAC 4: SEO Manager Role authorized on Page SEO
  const resSeoUpsert = await fetch(`${BASE_URL}/page-seo`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${seoToken}` },
    body: JSON.stringify({
      routePath: '/test-seo-audit',
      titleFa: 'تست سئو ممیزی',
      titleEn: 'SEO Audit Test',
      metaDescFa: 'توضیحات تست سئو',
    }),
  });
  record('RBAC', 'CONTENT_SEO_MANAGER role permitted on /page-seo (status 200/201)', resSeoUpsert.ok);

  // Clean up Page SEO test route
  const getCreatedSeo = await fetch(`${BASE_URL}/page-seo/by-route?routePath=/test-seo-audit`);
  const createdSeoData: any = await getCreatedSeo.json();
  if (createdSeoData?.id) {
    await fetch(`${BASE_URL}/page-seo/${createdSeoData.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${seoToken}` },
    });
  }

  console.log('\n--- AUDIT SECTION 3: Draft Leakage Prevention ---');

  // Create DRAFT partner
  const draftPartnerRes = await fetch(`${BASE_URL}/client-partners`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      orderNumber: '99',
      nameFa: 'شریک پیش‌نویس محرمانه',
      titleFa: 'عنوان پیش‌نویس',
      status: 'DRAFT',
      isActive: false,
    }),
  });
  const draftPartner: any = await draftPartnerRes.json();

  // Public GET must strictly omit draft
  const publicPartnersCheck = await fetch(`${BASE_URL}/client-partners`);
  const publicPartnersList: any = await publicPartnersCheck.json();
  const leakedPartner = publicPartnersList.some((p: any) => p.id === draftPartner.id);
  record('Draft-Isolation', 'Draft partner is strictly invisible on public GET /client-partners', !leakedPartner);

  // Admin GET must include draft
  const adminPartnersCheck = await fetch(`${BASE_URL}/client-partners/admin`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const adminPartnersList: any = await adminPartnersCheck.json();
  const foundInAdmin = adminPartnersList.some((p: any) => p.id === draftPartner.id);
  record('Draft-Isolation', 'Draft partner is visible on Admin GET /client-partners/admin', foundInAdmin);

  // Clean up draft partner
  if (draftPartner?.id) {
    await fetch(`${BASE_URL}/client-partners/${draftPartner.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
  }

  // Create DRAFT service
  const draftServiceRes = await fetch(`${BASE_URL}/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      slug: 'confidential-draft-service',
      title: 'سرویس پیش‌نویس محرمانه',
      description: 'توضیحات پیش‌نویس',
      status: 'DRAFT',
      published: false,
    }),
  });
  const draftService: any = await draftServiceRes.json();

  const publicServicesCheck = await fetch(`${BASE_URL}/services`);
  const publicServicesList: any = await publicServicesCheck.json();
  const leakedService = publicServicesList.some((s: any) => s.id === draftService.id || s.slug === 'confidential-draft-service');
  record('Draft-Isolation', 'Draft service is strictly invisible on public GET /services', !leakedService);

  // Clean up draft service
  if (draftService?.id) {
    await prisma.service.delete({ where: { id: draftService.id } }).catch(() => {});
  }

  console.log('\n--- AUDIT SECTION 4: Admin-to-Database-to-Public Workflow ---');

  // Test full cycle on Site Settings
  const originalSettingsRes = await fetch(`${BASE_URL}/site-settings`);
  const originalSettings: any = await originalSettingsRes.json();

  const auditTimestamp = Date.now();
  const updateSettingsRes = await fetch(`${BASE_URL}/site-settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      ...originalSettings,
      siteDescriptionFa: `توضیحات ممیزی نهایی پروداکشن ${auditTimestamp}`,
    }),
  });
  record('Workflow', 'Admin can update site settings (PUT /site-settings status 200)', updateSettingsRes.ok);

  const verifyPublicSettings = await fetch(`${BASE_URL}/site-settings`);
  const verifiedSettings: any = await verifyPublicSettings.json();
  record('Workflow', 'Public GET reflects updated site description immediately', verifiedSettings.siteDescriptionFa === `توضیحات ممیزی نهایی پروداکشن ${auditTimestamp}`);

  // Restore original settings
  await fetch(`${BASE_URL}/site-settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify(originalSettings),
  });

  console.log('\n--- AUDIT SECTION 5: Dynamic Homepage Section Reordering Engine ---');

  const reorderRes = await fetch(`${BASE_URL}/home-sections/reorder`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      sections: [
        { sectionKey: 'partners', position: 1, isEnabled: true },
        { sectionKey: 'hero', position: 2, isEnabled: true },
        { sectionKey: 'stats', position: 3, isEnabled: true },
        { sectionKey: 'services', position: 4, isEnabled: true },
        { sectionKey: 'about', position: 5, isEnabled: true },
        { sectionKey: 'logos', position: 6, isEnabled: true },
        { sectionKey: 'case_studies', position: 7, isEnabled: true },
        { sectionKey: 'pricing', position: 8, isEnabled: true },
        { sectionKey: 'testimonials', position: 9, isEnabled: true },
        { sectionKey: 'contact', position: 10, isEnabled: true },
      ],
    }),
  });
  record('Ordering-Engine', 'Admin PUT /home-sections/reorder updates positions and enabled states', reorderRes.ok);

  const publicSectionsCheck = await fetch(`${BASE_URL}/home-sections`);
  const publicSectionsData: any = await publicSectionsCheck.json();
  const firstSection = publicSectionsData[0];
  record('Ordering-Engine', 'Public GET returns sections ordered with lowest position first', firstSection?.key === 'partners');

  console.log('\n======================================================');
  console.log('             PRODUCTION AUDIT SUMMARY                 ');
  console.log('======================================================');
  console.log(`  Total Verifications : ${passed + failed}`);
  console.log(`  Verified Working    : ${passed}`);
  console.log(`  Verified Defective  : ${failed}`);
  console.log('======================================================\n');

  server.close();
  await prisma.$disconnect();
}

runAudit().catch((err) => {
  console.error('Audit fatal error:', err);
  if (server) server.close();
  prisma.$disconnect();
  process.exit(1);
});
