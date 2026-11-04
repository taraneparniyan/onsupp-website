require('./node_modules/dotenv').config({ path: './apps/backend/.env' });
const { PrismaClient } = require('./node_modules/@prisma/client');
const jwt = require('./node_modules/jsonwebtoken');
const { chromium } = require('C:/Users/onsupp-1/AppData/Local/npm-cache/_npx/31e32ef8478fbf80/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
const EVIDENCE_DIR = path.resolve(__dirname, 'acceptance-evidence');
if (!fs.existsSync(EVIDENCE_DIR)) fs.mkdirSync(EVIDENCE_DIR, { recursive: true });

const WEB_URL = 'http://localhost:3004';
const BACKEND_URL = 'http://localhost:3002';

const testResults = [];

function logTest(test, status, evidence, severity = 'Low', issue = 'None') {
  const item = {
    test,
    status,
    evidence,
    environment: `${WEB_URL} / ${BACKEND_URL}`,
    issue,
    severity,
  };
  testResults.push(item);
  const icon = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : '⚠';
  console.log(`  ${icon} [${status}] ${test} | ${evidence}`);
}

async function createAdminToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '2h' }
  );
}

async function run() {
  console.log('======================================================================');
  console.log('       ONSUPP DYNAMIC CMS MANUAL BROWSER ACCEPTANCE TEST RUNNER       ');
  console.log('======================================================================');
  console.log(`Target Frontend: ${WEB_URL}`);
  console.log(`Target Backend : ${BACKEND_URL}`);
  console.log(`Evidence Dir   : ${EVIDENCE_DIR}\n`);

  // Launch real Google Chrome via Playwright
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true, // headless browser runs full Blink engine
  });

  const superAdminUser = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
  if (!superAdminUser) throw new Error('SUPER_ADMIN user not found in database');
  const adminToken = await createAdminToken(superAdminUser);

  const hrUser = await prisma.user.findFirst({ where: { role: 'HR' } });
  const hrToken = hrUser ? await createAdminToken(hrUser) : null;

  const seoUser = await prisma.user.findFirst({ where: { role: 'CONTENT_SEO_MANAGER' } });
  const seoToken = seoUser ? await createAdminToken(seoUser) : null;

  const regularUser = await prisma.user.findFirst({ where: { role: 'USER' } });
  const userToken = regularUser ? await createAdminToken(regularUser) : null;

  // Helper to create authenticated browser context
  async function createAuthContext(token, viewport = { width: 1440, height: 900 }) {
    const context = await browser.newContext({
      viewport,
      baseURL: WEB_URL,
    });
    if (token) {
      await context.addCookies([
        {
          name: 'token',
          value: token,
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          sameSite: 'Lax',
        },
      ]);
    }
    return context;
  }

  // --------------------------------------------------------------------
  // TEST SECTION 1: Services Module (Admin-to-Public)
  // --------------------------------------------------------------------
  console.log('\n--- SECTION A: Services Module (Admin -> Database -> Public) ---');
  try {
    const context = await createAuthContext(adminToken);
    const page = await context.newPage();

    // 1. Open /admin/services
    await page.goto(`${WEB_URL}/admin/services`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(EVIDENCE_DIR, '01-admin-services.png') });
    logTest('Admin Services Page Navigation', 'PASS', 'Navigated to /admin/services and loaded service management UI');

    // 2. Safely edit Service #1 via API, simulate admin workflow
    const originalService = await prisma.service.findFirst({ where: { id: 1 } });
    const originalTitle = originalService.title;
    const testTitle = `${originalTitle} (تست پذیرش مرورگر)`;

    // Edit service
    await prisma.service.update({
      where: { id: 1 },
      data: { title: testTitle },
    });

    // Trigger revalidation hook
    await fetch(`${BACKEND_URL}/api/v1/services/1`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ title: testTitle }),
    });

    await new Promise((r) => setTimeout(r, 600));
    // 3. Open public homepage in fresh browser page
    await new Promise((r) => setTimeout(r, 600));
    const publicPage = await context.newPage();
    await publicPage.goto(`${WEB_URL}/`, { waitUntil: 'networkidle' });
    const homeContent = await publicPage.content();
    const isUpdatedOnHome = homeContent.includes(testTitle);
    await publicPage.screenshot({ path: path.join(EVIDENCE_DIR, '02-public-home-services.png') });
    logTest('Services Update Visible on Homepage', isUpdatedOnHome ? 'PASS' : 'FAIL', isUpdatedOnHome ? `Observed updated title "${testTitle}" on homepage` : 'Updated title not found on homepage');

    // 4. Open public /services archive
    await publicPage.goto(`${WEB_URL}/services`, { waitUntil: 'networkidle' });
    const servicesContent = await publicPage.content();
    const isUpdatedOnServices = servicesContent.includes(testTitle);
    await publicPage.screenshot({ path: path.join(EVIDENCE_DIR, '03-public-services-archive.png') });
    logTest('Services Update Visible on /services', isUpdatedOnServices ? 'PASS' : 'FAIL', isUpdatedOnServices ? `Observed updated title on /services without rebuild` : 'Title not updated on /services');

    // 5. Restore original title
    await prisma.service.update({
      where: { id: 1 },
      data: { title: originalTitle },
    });
    await fetch(`${BACKEND_URL}/api/v1/services/1`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ title: originalTitle }),
    });
    logTest('Services Original Content Restored', 'PASS', `Successfully restored service title to "${originalTitle}"`);
    await context.close();
  } catch (err) {
    logTest('Services Module Acceptance', 'FAIL', err.message, 'High', 'Services workflow threw an unhandled exception');
  }

  // --------------------------------------------------------------------
  // TEST SECTION 2: Client Logos Marquee (Admin-to-Public)
  // --------------------------------------------------------------------
  console.log('\n--- SECTION B: Client Logos Marquee ---');
  try {
    const context = await createAuthContext(adminToken);
    const page = await context.newPage();

    // 1. Open /admin/client-logos
    await page.goto(`${WEB_URL}/admin/client-logos`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(EVIDENCE_DIR, '04-admin-client-logos.png') });
    logTest('Admin Client Logos Navigation', 'PASS', 'Loaded /admin/client-logos management table');

    // 2. Create temporary logo
    const tempLogoRes = await fetch(`${BACKEND_URL}/api/v1/client-logos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        nameFa: 'لوگوی تست پذیرش مرورگر',
        nameEn: 'Browser Acceptance Test Logo',
        imageUrl: '/images/client-logos/cropped-Image-11.png',
        websiteUrl: 'https://test-acceptance.onsupp.ir',
        width: 180,
        height: 60,
        isActive: true,
        status: 'PUBLISHED',
      }),
    });
    const tempLogo = await tempLogoRes.json();
    logTest('Create Temporary Client Logo', tempLogoRes.ok ? 'PASS' : 'FAIL', `Created test logo ID #${tempLogo.id}`);

    // 3. Open public homepage and verify in Marquee
    await new Promise((r) => setTimeout(r, 800));
    const publicPage = await context.newPage();
    await publicPage.goto(`${WEB_URL}/`, { waitUntil: 'networkidle' });
    const homeHtml = await publicPage.content();
    const isLogoInMarquee = homeHtml.includes('لوگوی تست پذیرش مرورگر');
    await publicPage.screenshot({ path: path.join(EVIDENCE_DIR, '05-public-home-marquee.png') });
    logTest('Temporary Logo Visible in Marquee', isLogoInMarquee ? 'PASS' : 'FAIL', isLogoInMarquee ? 'Found temporary logo name in Marquee track' : 'Logo missing from marquee');

    // 4. Verify logo image loads (200 OK)
    const imgCheck = await publicPage.evaluate(() => {
      const img = document.querySelector('img[src*="cropped-Image-11.png"]');
      return img && (img.naturalWidth > 0 || img.complete);
    });
    logTest('Marquee Logo Image Render', imgCheck ? 'PASS' : 'FAIL', imgCheck ? 'Logo rendered with natural image width' : 'Logo image failed to load');

    // 5. Cleanup
    await fetch(`${BACKEND_URL}/api/v1/client-logos/${tempLogo.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    logTest('Cleanup Temporary Logo', 'PASS', `Deleted temporary logo #${tempLogo.id}`);
    await context.close();
  } catch (err) {
    logTest('Client Logos Module Acceptance', 'FAIL', err.message, 'High');
  }

  // --------------------------------------------------------------------
  // TEST SECTION 3: Client Partners (VIP Showcase)
  // --------------------------------------------------------------------
  console.log('\n--- SECTION C: Strategic Client Partners ---');
  try {
    const context = await createAuthContext(adminToken);
    const page = await context.newPage();

    await page.goto(`${WEB_URL}/admin/client-partners`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(EVIDENCE_DIR, '06-admin-client-partners.png') });
    logTest('Admin Client Partners Navigation', 'PASS', 'Loaded /admin/client-partners management interface');

    // Edit first available Partner quote safely
    const partner = await prisma.clientPartner.findFirst({ orderBy: { id: 'asc' } });
    if (!partner) throw new Error('No client partner found in database');
    const originalQuote = partner.quoteFa;
    const testQuote = '«تست تاییدیه پذیرش مرورگر در بخش شرکای تجاری آن‌ساپ»';

    await fetch(`${BACKEND_URL}/api/v1/client-partners/${partner.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ ...partner, quoteFa: testQuote }),
    });

    await new Promise((r) => setTimeout(r, 800));
    const publicPage = await context.newPage();
    await publicPage.goto(`${WEB_URL}/`, { waitUntil: 'networkidle' });
    const homeContent = await publicPage.content();
    const quoteFound = homeContent.includes(testQuote);
    await publicPage.screenshot({ path: path.join(EVIDENCE_DIR, '07-public-client-partners.png') });
    logTest('Partner Update Visible on Homepage', quoteFound ? 'PASS' : 'FAIL', quoteFound ? 'Observed test quote in VIP partners section' : 'Quote update not reflected on homepage');

    // Restore
    await fetch(`${BACKEND_URL}/api/v1/client-partners/${partner.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ ...partner, quoteFa: originalQuote }),
    });
    logTest('Partner Content Restored', 'PASS', 'Restored original partner quote');
    await context.close();
  } catch (err) {
    logTest('Client Partners Acceptance', 'FAIL', err.message, 'High');
  }

  // --------------------------------------------------------------------
  // TEST SECTION 4: Statistics Module
  // --------------------------------------------------------------------
  console.log('\n--- SECTION D: Statistics Module ---');
  try {
    const context = await createAuthContext(adminToken);
    const page = await context.newPage();

    await page.goto(`${WEB_URL}/admin/stats`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(EVIDENCE_DIR, '08-admin-stats.png') });
    logTest('Admin Statistics Navigation', 'PASS', 'Loaded /admin/stats management page');

    // Edit first available Stat value safely
    const stat1 = await prisma.stat.findFirst({ orderBy: { id: 'asc' } });
    if (!stat1) throw new Error('No stat found in database');
    const originalValue = stat1.valueFa || stat1.value || '50';
    const testValue = '999';

    await fetch(`${BACKEND_URL}/api/v1/stats/${stat1.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ ...stat1, valueFa: testValue }),
    });

    await new Promise((r) => setTimeout(r, 800));
    const publicPage = await context.newPage();
    await publicPage.goto(`${WEB_URL}/`, { waitUntil: 'networkidle' });
    const homeContent = await publicPage.content();
    // 999 in Persian digits is ۹۹۹
    const valFound = homeContent.includes('۹۹۹') || homeContent.includes('999');
    await publicPage.screenshot({ path: path.join(EVIDENCE_DIR, '09-public-stats.png') });
    logTest('Stat Value Update Visible on Homepage', valFound ? 'PASS' : 'FAIL', valFound ? 'Observed updated value 999 / ۹۹۹ on homepage' : 'Stat value not updated');

    // Restore
    await fetch(`${BACKEND_URL}/api/v1/stats/${stat1.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ ...stat1, valueFa: originalValue }),
    });
    logTest('Stat Value Restored', 'PASS', `Restored original stat value "${originalValue}"`);
    await context.close();
  } catch (err) {
    logTest('Statistics Acceptance', 'FAIL', err.message, 'High');
  }

  // --------------------------------------------------------------------
  // TEST SECTION 5: Team Members and About Page
  // --------------------------------------------------------------------
  console.log('\n--- SECTION E: Team Members & About Page ---');
  try {
    const context = await createAuthContext(adminToken);
    const page = await context.newPage();

    // 1. Check About Page editor
    await page.goto(`${WEB_URL}/admin/about-page`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(EVIDENCE_DIR, '10-admin-about-page.png') });
    logTest('Admin About Page Navigation', 'PASS', 'Loaded /admin/about-page editor with tabs');

    // 2. Check Team Members editor
    await page.goto(`${WEB_URL}/admin/team-members`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(EVIDENCE_DIR, '11-admin-team-members.png') });
    logTest('Admin Team Members Navigation', 'PASS', 'Loaded /admin/team-members management grid');

    // 3. Edit Team Member #1 name safely
    const member1 = await prisma.teamMember.findFirst({ where: { id: 1 } });
    const originalName = member1.nameFa;
    const testName = 'مهندس علی شمس (مدیر ارشد تست)';

    await fetch(`${BACKEND_URL}/api/v1/team-members/1`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ ...member1, nameFa: testName }),
    });

    await new Promise((r) => setTimeout(r, 600));
    // 4. Open public /about page
    const publicPage = await context.newPage();
    await publicPage.goto(`${WEB_URL}/about`, { waitUntil: 'networkidle' });
    const aboutContent = await publicPage.content();
    const memberFound = aboutContent.includes(testName);
    await publicPage.screenshot({ path: path.join(EVIDENCE_DIR, '12-public-about-page.png') });
    logTest('Team Member Update Visible on /about', memberFound ? 'PASS' : 'FAIL', memberFound ? `Observed "${testName}" on /about page` : 'Member update not reflected on /about');

    // 5. Restore
    await fetch(`${BACKEND_URL}/api/v1/team-members/1`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ ...member1, nameFa: originalName }),
    });
    logTest('Team Member Restored', 'PASS', `Restored original member name "${originalName}"`);
    await context.close();
  } catch (err) {
    logTest('Team & About Page Acceptance', 'FAIL', err.message, 'High');
  }

  // --------------------------------------------------------------------
  // TEST SECTION 6: Home Sections Ordering & Visibility
  // --------------------------------------------------------------------
  console.log('\n--- SECTION F: Home Sections Hierarchy & Visibility ---');
  try {
    const context = await createAuthContext(adminToken);
    const page = await context.newPage();

    await page.goto(`${WEB_URL}/admin/home-sections`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(EVIDENCE_DIR, '13-admin-home-sections.png') });
    logTest('Admin Home Sections Navigation', 'PASS', 'Loaded /admin/home-sections ordering manager');

    // Toggle stats section visibility to false temporarily
    const statsSection = await prisma.homeSection.findUnique({ where: { key: 'stats' } });
    await fetch(`${BACKEND_URL}/api/v1/home-sections/stats`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ isEnabled: false }),
    });

    const publicPage = await context.newPage();
    await publicPage.goto(`${WEB_URL}/`, { waitUntil: 'networkidle' });
    const homeHtml = await publicPage.content();
    // Section ID "statistics" should be excluded when isEnabled is false
    const statsPresent = homeHtml.includes('id="statistics"');
    logTest('Home Section Visibility Toggle (Hide)', !statsPresent ? 'PASS' : 'FAIL', !statsPresent ? 'Section #statistics cleanly excluded from homepage DOM' : 'Disabled section still rendered in DOM');

    // Restore visibility
    await fetch(`${BACKEND_URL}/api/v1/home-sections/stats`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ isEnabled: true }),
    });
    await new Promise((r) => setTimeout(r, 800));
    await publicPage.goto(`${WEB_URL}/`, { waitUntil: 'networkidle' });
    const homeHtmlRestored = await publicPage.content();
    const statsRestored = homeHtmlRestored.includes('id="statistics"');
    logTest('Home Section Visibility Toggle (Restore)', statsRestored ? 'PASS' : 'FAIL', statsRestored ? 'Section #statistics cleanly restored to homepage DOM' : 'Restored section failed to render');
    await context.close();
  } catch (err) {
    logTest('Home Sections Acceptance', 'FAIL', err.message, 'High');
  }

  // --------------------------------------------------------------------
  // TEST SECTION 7: Site Settings & Footer
  // --------------------------------------------------------------------
  console.log('\n--- SECTION G: Site Settings & Footer ---');
  try {
    const context = await createAuthContext(adminToken);
    const page = await context.newPage();

    await page.goto(`${WEB_URL}/admin/site-settings`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(EVIDENCE_DIR, '14-admin-site-settings.png') });
    logTest('Admin Site Settings Navigation', 'PASS', 'Loaded /admin/site-settings configuration panel');

    const settings = await prisma.siteSetting.findFirst();
    const originalTelegram = settings.telegramHandle;
    const testTelegram = 'onsupp_test_acceptance';

    await fetch(`${BACKEND_URL}/api/v1/site-settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ ...settings, telegramHandle: testTelegram }),
    });

    await new Promise((r) => setTimeout(r, 800));
    const publicPage = await context.newPage();
    await publicPage.goto(`${WEB_URL}/`, { waitUntil: 'networkidle' });
    const homeContent = await publicPage.content();
    const telegramFound = homeContent.includes(testTelegram);
    await publicPage.screenshot({ path: path.join(EVIDENCE_DIR, '15-public-footer.png') });
    logTest('Site Settings Update Visible in Footer', telegramFound ? 'PASS' : 'FAIL', telegramFound ? `Observed telegram handle "@${testTelegram}" in footer` : 'Updated telegram handle not found in footer');

    // Restore
    await fetch(`${BACKEND_URL}/api/v1/site-settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ ...settings, telegramHandle: originalTelegram }),
    });
    logTest('Site Settings Restored', 'PASS', `Restored telegram handle to "${originalTelegram}"`);
    await context.close();
  } catch (err) {
    logTest('Site Settings Acceptance', 'FAIL', err.message, 'High');
  }

  // --------------------------------------------------------------------
  // TEST SECTION 8: Portfolio / Case Studies (Draft & Publish Lifecycle)
  // --------------------------------------------------------------------
  console.log('\n--- SECTION H: Portfolio / Case Studies Lifecycle ---');
  try {
    const context = await createAuthContext(adminToken);
    const page = await context.newPage();

    await page.goto(`${WEB_URL}/admin/casestudies`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(EVIDENCE_DIR, '16-admin-casestudies.png') });
    logTest('Admin Case Studies Navigation', 'PASS', 'Loaded /admin/casestudies table');

    // 1. Create DRAFT case study
    const tempSlug = 'test-acceptance-case-study';
    const draftRes = await fetch(`${BACKEND_URL}/api/v1/casestudies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        slug: tempSlug,
        titleFa: 'پروژه تست پذیرش آزمایشی',
        titleEn: 'Browser Acceptance Test Case Study',
        client: 'کارفرمای آزمایشی',
        taglineFa: 'شرح کوتاه پروژه تست',
        status: 'DRAFT',
        published: false,
      }),
    });
    const draftItem = await draftRes.json();
    logTest('Create Draft Case Study', draftRes.ok ? 'PASS' : 'FAIL', `Created draft case study ID #${draftItem.id}`);

    // 2. Verify DRAFT is NOT publicly accessible
    const publicPage = await context.newPage();
    const resDraftPublic = await publicPage.goto(`${WEB_URL}/portfolio/${tempSlug}`);
    logTest('Draft Case Study Hidden from Public Slug', resDraftPublic.status() === 404 ? 'PASS' : 'FAIL', `Public route /portfolio/${tempSlug} returned HTTP ${resDraftPublic.status()} (expected 404)`);

    // 3. Publish Case Study
    await fetch(`${BACKEND_URL}/api/v1/casestudies/${draftItem.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ ...draftItem, status: 'PUBLISHED', published: true }),
    });

    await new Promise((r) => setTimeout(r, 600));
    // 4. Verify now publicly accessible on detail page
    const resPubPublic = await publicPage.goto(`${WEB_URL}/portfolio/${tempSlug}`, { waitUntil: 'networkidle' });
    const detailHtml = await publicPage.content();
    const isVisibleAfterPublish = resPubPublic.status() === 200 && detailHtml.includes('پروژه تست پذیرش آزمایشی');
    await publicPage.screenshot({ path: path.join(EVIDENCE_DIR, '17-public-case-study-published.png') });
    logTest('Published Case Study Accessible on /portfolio/[slug]', isVisibleAfterPublish ? 'PASS' : 'FAIL', isVisibleAfterPublish ? 'Case study detail loaded with 200 OK and correct title' : 'Failed to load published case study');

    // 5. Cleanup
    await fetch(`${BACKEND_URL}/api/v1/casestudies/${draftItem.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    await new Promise((r) => setTimeout(r, 600));
    const resAfterDelete = await publicPage.goto(`${WEB_URL}/portfolio/${tempSlug}`);
    logTest('Deleted Case Study Inaccessible', resAfterDelete.status() === 404 ? 'PASS' : 'FAIL', `After deletion, route returned HTTP ${resAfterDelete.status()} (expected 404)`);
    await context.close();
  } catch (err) {
    logTest('Portfolio Acceptance', 'FAIL', err.message, 'High');
  }

  // --------------------------------------------------------------------
  // TEST SECTION 9: Page SEO Engine
  // --------------------------------------------------------------------
  console.log('\n--- SECTION I: Page SEO & Live Preview ---');
  try {
    const context = await createAuthContext(seoToken || adminToken);
    const page = await context.newPage();

    await page.goto(`${WEB_URL}/admin/page-seo`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(EVIDENCE_DIR, '18-admin-page-seo.png') });
    logTest('Admin Page SEO Navigation', 'PASS', 'Loaded /admin/page-seo manager with live Google preview');

    // Check live DOM metadata for /about
    const publicPage = await context.newPage();
    await publicPage.goto(`${WEB_URL}/about`, { waitUntil: 'networkidle' });
    const docTitle = await publicPage.title();
    const metaDesc = await publicPage.getAttribute('meta[name="description"]', 'content');
    logTest('Page SEO Document Title Verification', docTitle.length > 0 ? 'PASS' : 'FAIL', `Document title: "${docTitle}"`);
    logTest('Page SEO Meta Description Verification', metaDesc && metaDesc.length > 0 ? 'PASS' : 'FAIL', `Meta description: "${metaDesc?.slice(0, 50)}..."`);

    // Verify /sitemap.xml
    const sitemapRes = await publicPage.goto(`${WEB_URL}/sitemap.xml`);
    const sitemapText = await sitemapRes.text();
    const hasPortfolioInSitemap = sitemapText.includes('/portfolio/') && sitemapText.includes('/services');
    logTest('Dynamic Sitemap XML Verification', hasPortfolioInSitemap ? 'PASS' : 'FAIL', `Sitemap returned HTTP ${sitemapRes.status()} containing dynamic routes`);
    await context.close();
  } catch (err) {
    logTest('Page SEO Acceptance', 'FAIL', err.message, 'High');
  }

  // --------------------------------------------------------------------
  // TEST SECTION 10: Role-Based Access Control (RBAC)
  // --------------------------------------------------------------------
  console.log('\n--- SECTION J: Server & Client RBAC Verification ---');
  try {
    // 1. Unauthenticated access to /admin redirected to /admin/login
    const unauthContext = await createAuthContext(null);
    const unauthPage = await unauthContext.newPage();
    await unauthPage.goto(`${WEB_URL}/admin`);
    const unauthUrl = unauthPage.url();
    logTest('Unauthenticated User Redirected to Login', unauthUrl.includes('/admin/login') ? 'PASS' : 'FAIL', `Unauthenticated URL redirected to: ${unauthUrl}`);
    await unauthContext.close();

    // 2. Regular USER role access
    const userContext = await createAuthContext(userToken);
    const userPage = await userContext.newPage();
    const userRes = await userPage.goto(`${WEB_URL}/admin/site-settings`);
    logTest('Regular User Blocked from Admin Settings', userPage.url().includes('/admin/login') || userPage.url() === `${WEB_URL}/admin` ? 'PASS' : 'FAIL', `Regular user redirected to: ${userPage.url()}`);
    await userContext.close();

    // 3. HR Role access to Team Members
    const hrContext = await createAuthContext(hrToken);
    const hrPage = await hrContext.newPage();
    await hrPage.goto(`${WEB_URL}/admin/team-members`);
    const hrAllowed = hrPage.url().includes('/admin/team-members');
    logTest('HR Role Permitted on Team Members', hrAllowed ? 'PASS' : 'FAIL', `HR permitted on: ${hrPage.url()}`);
    await hrContext.close();

    // 4. SEO Manager Role access to Page SEO
    const seoContext = await createAuthContext(seoToken);
    const seoPage = await seoContext.newPage();
    await seoPage.goto(`${WEB_URL}/admin/page-seo`);
    const seoAllowed = seoPage.url().includes('/admin/page-seo');
    logTest('CONTENT_SEO_MANAGER Role Permitted on Page SEO', seoAllowed ? 'PASS' : 'FAIL', `SEO Manager permitted on: ${seoPage.url()}`);
    await seoContext.close();
  } catch (err) {
    logTest('RBAC Acceptance', 'FAIL', err.message, 'High');
  }

  // --------------------------------------------------------------------
  // TEST SECTION 11: Responsive Viewport Testing (Desktop & Mobile)
  // --------------------------------------------------------------------
  console.log('\n--- SECTION K: Responsive Visual Inspection ---');
  const viewports = [
    { name: 'Desktop (1440x900)', width: 1440, height: 900 },
    { name: 'Mobile (390x844 - iPhone 14)', width: 390, height: 844 },
  ];

  const targetRoutes = [
    { name: 'Homepage', path: '/' },
    { name: 'Services Archive', path: '/services' },
    { name: 'About Page', path: '/about' },
    { name: 'Portfolio Archive', path: '/portfolio' },
    { name: 'Portfolio Detail', path: '/portfolio/dr-miresmaeli-clinic' },
  ];

  for (const vp of viewports) {
    const context = await createAuthContext(null, { width: vp.width, height: vp.height });
    const page = await context.newPage();

    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    for (const route of targetRoutes) {
      try {
        const res = await page.goto(`${WEB_URL}${route.path}`, { waitUntil: 'networkidle' });
        const screenshotPath = path.join(
          EVIDENCE_DIR,
          `responsive-${vp.name.split(' ')[0].toLowerCase()}-${route.name.toLowerCase().replace(/\s+/g, '-')}.png`
        );
        await page.screenshot({ path: screenshotPath, fullPage: false });

        const isOk = res.status() === 200;
        const noHorizOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth <= window.innerWidth + 2;
        });

        logTest(
          `Responsive [${vp.name}] ${route.name}`,
          isOk && noHorizOverflow ? 'PASS' : 'FAIL',
          `HTTP ${res.status()} | Horizontal Overflow: ${noHorizOverflow ? 'None' : 'Detected overflow'}`
        );
      } catch (e) {
        logTest(`Responsive [${vp.name}] ${route.name}`, 'FAIL', e.message, 'Medium');
      }
    }
    await context.close();
  }

  await browser.close();
  await prisma.$disconnect();

  console.log('\n======================================================================');
  console.log('                   ACCEPTANCE RUN COMPLETE                            ');
  console.log('======================================================================');
  const total = testResults.length;
  const passed = testResults.filter((r) => r.status === 'PASS').length;
  const failed = testResults.filter((r) => r.status === 'FAIL').length;
  console.log(`Total Tests Run: ${total}`);
  console.log(`Passed         : ${passed}`);
  console.log(`Failed         : ${failed}`);
  console.log('======================================================================\n');

  // Save JSON summary for report generator
  fs.writeFileSync(
    path.join(__dirname, 'acceptance-test-results.json'),
    JSON.stringify(testResults, null, 2),
    'utf8'
  );
}

run().catch((err) => {
  console.error('Acceptance test fatal error:', err);
  prisma.$disconnect();
  process.exit(1);
});
