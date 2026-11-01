process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'a_secure_test_jwt_secret_with_at_least_32_characters_length';

import bcrypt from 'bcryptjs';
import { assertDevelopmentOnly, seedAdmin } from './seed.js';

async function runSeedTests() {
  console.log('[TEST-SEED] Running Comprehensive Seed Security Test Suite...\n');

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

  // ================================================================
  // بخش ۱: آزمون‌های گارد امنیتی محیط و دیتابیس (assertDevelopmentOnly)
  // ================================================================
  console.log('================================================================');
  console.log('بخش ۱: آزمون‌های گارد امنیتی محیط و دیتابیس (assertDevelopmentOnly)');
  console.log('================================================================');

  // Test 1.1: Valid localhost URL with port 5434 and onsupp_dev
  let validLocalhostPassed = false;
  try {
    process.env.NODE_ENV = 'test';
    assertDevelopmentOnly('postgresql://postgres:tarane2005@localhost:5434/onsupp_dev?schema=public');
    validLocalhostPassed = true;
  } catch {
    validLocalhostPassed = false;
  }
  assert('آدرس معتبر localhost با پورت 5434 و دیتابیس onsupp_dev تأیید می‌شود', validLocalhostPassed);

  // Test 1.2: Valid 127.0.0.1 URL
  let validIpPassed = false;
  try {
    assertDevelopmentOnly('postgresql://postgres:tarane2005@127.0.0.1:5434/onsupp_dev');
    validIpPassed = true;
  } catch {
    validIpPassed = false;
  }
  assert('آدرس معتبر 127.0.0.1 با پورت 5434 و دیتابیس onsupp_dev تأیید می‌شود', validIpPassed);

  // Test 1.3: Valid postgres: protocol scheme
  let validPostgresSchemePassed = false;
  try {
    assertDevelopmentOnly('postgres://postgres:tarane2005@localhost:5434/onsupp_dev');
    validPostgresSchemePassed = true;
  } catch {
    validPostgresSchemePassed = false;
  }
  assert('پروتکل postgres: به همراه postgresql: مجاز است', validPostgresSchemePassed);

  // Test 1.4: Reject remote host even if onsupp_dev is in path
  let remotePathRejected = false;
  try {
    assertDevelopmentOnly('postgresql://postgres:pass@production-db.company.com:5434/onsupp_dev');
  } catch (err: any) {
    remotePathRejected = err.message.includes('not an approved local development host');
  }
  assert('هاست ریموت حاوی onsupp_dev در مسیر باید بلافاصله رد شود', remotePathRejected);

  // Test 1.5: Reject query parameter containing onsupp_dev on remote host
  let remoteQueryRejected = false;
  try {
    assertDevelopmentOnly('postgresql://postgres:pass@evil-cloud.com:5434/prod_database?cluster=onsupp_dev');
  } catch (err: any) {
    remoteQueryRejected = err.message.includes('not an approved local development host');
  }
  assert('کوئری پارامتر حاوی onsupp_dev روی سرور ریموت فریب‌دهنده نیست و رد می‌شود', remoteQueryRejected);

  // Test 1.6: Reject username containing localhost on remote host
  let spoofedUserRejected = false;
  try {
    assertDevelopmentOnly('postgresql://localhost:pass@production-server.com:5434/onsupp_dev');
  } catch (err: any) {
    spoofedUserRejected = err.message.includes('not an approved local development host');
  }
  assert('نام کاربری حاوی localhost روی سرور ریموت مسدود می‌شود', spoofedUserRejected);

  // Test 1.7: Reject wrong port (e.g. 5432 instead of 5434)
  let wrongPortRejected = false;
  try {
    assertDevelopmentOnly('postgresql://postgres:pass@localhost:5432/onsupp_dev');
  } catch (err: any) {
    wrongPortRejected = err.message.includes('Expected port 5434');
  }
  assert('پورت غیر از 5434 (مثلاً 5432) باید صراحتاً رد شود', wrongPortRejected);

  // Test 1.8: Reject unapproved database name on localhost
  let wrongDbRejected = false;
  try {
    assertDevelopmentOnly('postgresql://postgres:pass@localhost:5434/production_db');
  } catch (err: any) {
    wrongDbRejected = err.message.includes('Only "onsupp_dev" is permitted');
  }
  assert('نام دیتابیس تأییدنشده روی localhost باید رد شود', wrongDbRejected);

  // Test 1.9: Reject onsupp_migration_test for Seed execution
  let testDbRejected = false;
  try {
    assertDevelopmentOnly('postgresql://postgres:pass@localhost:5434/onsupp_migration_test');
  } catch (err: any) {
    testDbRejected = err.message.includes('onsupp_migration_test') && err.message.includes('restricted to migration testing');
  }
  assert('دیتابیس onsupp_migration_test برای Seed صراحتاً مسدود می‌شود', testDbRejected);

  // Test 1.10: Reject non-postgres protocol
  let invalidProtocolRejected = false;
  try {
    assertDevelopmentOnly('mysql://root:pass@localhost:5434/onsupp_dev');
  } catch (err: any) {
    invalidProtocolRejected = err.message.includes('Only postgresql: or postgres: is permitted');
  }
  assert('پروتکل‌های غیرپستگرس (مانند mysql) رد می‌شوند', invalidProtocolRejected);

  // Test 1.11: Reject malformed URL
  let malformedRejected = false;
  try {
    assertDevelopmentOnly('this-is-not-a-valid-url-at-all');
  } catch (err: any) {
    malformedRejected = err.message.includes('malformed or invalid');
  }
  assert('آدرس نامعتبر و بدشکل (Malformed URL) مسدود می‌شود', malformedRejected);

  // Test 1.12: Reject missing or empty DATABASE_URL
  let missingUrlRejected = false;
  try {
    delete process.env.DATABASE_URL;
    assertDevelopmentOnly();
  } catch (err: any) {
    missingUrlRejected = err.message.includes('DATABASE_URL environment variable is missing');
  }
  assert('فقدان یا خالی بودن متغیر DATABASE_URL متوقف می‌شود', missingUrlRejected);

  // Test 1.13: Reject production NODE_ENV
  let prodEnvRejected = false;
  try {
    process.env.NODE_ENV = 'production';
    assertDevelopmentOnly('postgresql://postgres:pass@localhost:5434/onsupp_dev');
  } catch (err: any) {
    prodEnvRejected = err.message.includes('strictly forbidden in production');
  } finally {
    process.env.NODE_ENV = 'test';
  }
  assert('محیط NODE_ENV=production تحت هر شرایطی کاملاً مسدود می‌شود', prodEnvRejected);

  // ================================================================
  // بخش ۲: آزمون‌های ساخت حساب ادمین و امنیت کلمات عبور
  // ================================================================
  console.log('\n================================================================');
  console.log('بخش ۲: آزمون‌های ساخت حساب ادمین و اعتبارسنجی کلمات عبور');
  console.log('================================================================');

  let storedUsers: any[] = [];
  let updateCalled = false;
  let createCalled = false;

  const mockDb: any = {
    user: {
      findFirst: async ({ where }: any) => {
        if (where?.email) {
          return storedUsers.find((u) => u.email === where.email) || null;
        }
        if (where?.role) {
          return storedUsers.find((u) => u.role === where.role) || null;
        }
        if (where?.OR) {
          const emailCheck = where.OR.find((c: any) => c.email)?.email;
          const roleCheck = where.OR.find((c: any) => c.role)?.role;
          return storedUsers.find((u) => u.email === emailCheck || u.role === roleCheck) || null;
        }
        return storedUsers[0] || null;
      },
      create: async ({ data }: any) => {
        createCalled = true;
        const user = { id: storedUsers.length + 1, ...data };
        storedUsers.push(user);
        return user;
      },
      update: async () => {
        updateCalled = true;
        throw new Error('user.update should NOT be called by seed!');
      },
    },
  };

  // Test 2.1: Missing password
  storedUsers = [];
  delete process.env.ADMIN_INITIAL_PASSWORD;
  delete process.env.ADMIN_PASSWORD;
  let missingPasswordFailed = false;
  try {
    await seedAdmin(mockDb);
  } catch (err: any) {
    missingPasswordFailed = err.message.includes('ADMIN_PASSWORD');
  }
  assert(
    'عدم تنظیم متغیر ADMIN_PASSWORD باید مانع اجرای Seed شود و خطا دهد',
    missingPasswordFailed && storedUsers.length === 0,
  );

  // Test 2.2: Insecure password admin123
  process.env.ADMIN_PASSWORD = 'admin123';
  let admin123Rejected = false;
  try {
    await seedAdmin(mockDb);
  } catch (err: any) {
    admin123Rejected = err.message.includes('admin123') || err.message.includes('weak');
  }
  assert(
    'رمز عبور پیش‌فرض و ناامن admin123 باید مسدود شود',
    admin123Rejected && storedUsers.length === 0,
  );

  // Test 2.3: Short password
  process.env.ADMIN_PASSWORD = 'short';
  let shortRejected = false;
  try {
    await seedAdmin(mockDb);
  } catch (err: any) {
    shortRejected = err.message.includes('short');
  }
  assert(
    'رمز عبور کمتر از ۸ کاراکتر باید مسدود شود',
    shortRejected && storedUsers.length === 0,
  );

  // Test 2.4: Valid initial creation
  const secureInitialPassword = 'SuperSecretInitialAdminPass2026!';
  process.env.ADMIN_PASSWORD = secureInitialPassword;
  createCalled = false;
  updateCalled = false;

  await seedAdmin(mockDb);

  const createdAdmin = storedUsers.find((u) => u.role === 'ADMIN');
  const passwordMatches = createdAdmin ? await bcrypt.compare(secureInitialPassword, createdAdmin.password) : false;

  assert(
    'ادمین اولیه با هش امن bcrypt ایجاد شد و متغیر محیطی اعمال گردید',
    createCalled && createdAdmin !== undefined && passwordMatches,
  );

  // Test 2.5: Re-running seed when admin already exists
  const newCustomPassword = 'AdminCustomChangedPassword999#';
  const customHash = await bcrypt.hash(newCustomPassword, 10);
  createdAdmin.password = customHash;

  process.env.ADMIN_PASSWORD = 'SomeOtherPasswordAttempt123!';
  createCalled = false;
  updateCalled = false;

  await seedAdmin(mockDb);

  const adminAfterSeed = storedUsers.find((u) => u.role === 'ADMIN');
  const stillHasCustomPassword = await bcrypt.compare(newCustomPassword, adminAfterSeed.password);

  assert(
    'رمز عبور ادمین موجود پس از اجرای مجدد Seed بدون تغییر باقی ماند',
    !createCalled && !updateCalled && stillHasCustomPassword,
  );

  // Test 2.6: Re-running when another ADMIN exists with a different email
  storedUsers = [
    {
      id: 1,
      email: 'existing-different-admin@onsupp.ir',
      name: 'Existing Admin',
      password: customHash,
      role: 'ADMIN',
    },
  ];
  createCalled = false;
  updateCalled = false;
  process.env.ADMIN_EMAIL = 'new-admin@onsupp.ir';
  process.env.ADMIN_PASSWORD = 'AnotherValidPassword123!';

  await seedAdmin(mockDb);

  assert(
    'در صورت وجود ادمین دیگر با ایمیل متفاوت، ادمین تکراری ایجاد نمی‌شود',
    !createCalled && storedUsers.length === 1,
  );

  // ================================================================
  // بخش ۳: آزمون تعارض ایمیل ادمین با کاربر عادی (Role Conflict)
  // ================================================================
  console.log('\n================================================================');
  console.log('بخش ۳: آزمون تعارض ایمیل ادمین با کاربر عادی (Role Conflict)');
  console.log('================================================================');

  // Test 3.1: ADMIN_EMAIL already belongs to a user with role 'USER'
  const regularUserPasswordHash = await bcrypt.hash('UserPassword123!', 10);
  storedUsers = [
    {
      id: 5,
      email: 'conflict-user@onsupp.ir',
      name: 'Regular Customer',
      password: regularUserPasswordHash,
      role: 'USER',
    },
  ];
  createCalled = false;
  updateCalled = false;
  process.env.ADMIN_EMAIL = 'conflict-user@onsupp.ir';
  process.env.ADMIN_PASSWORD = 'SomeAdminPassword999!';

  let emailConflictCaught = false;
  let conflictErrorMessage = '';
  try {
    await seedAdmin(mockDb);
  } catch (err: any) {
    emailConflictCaught = true;
    conflictErrorMessage = err.message;
  }

  const existingUserAfterTest = storedUsers.find((u) => u.id === 5);
  const userPasswordIntact = await bcrypt.compare('UserPassword123!', existingUserAfterTest.password);

  assert(
    'در صورت تعلق ایمیل ادمین به یک کاربر عادی، خطا پرتاب شده و متوقف می‌شود',
    emailConflictCaught && conflictErrorMessage.includes('already exists with role "USER"'),
  );

  assert(
    'نقش و رمز عبور کاربر عادی در صورت تعارض ایمیل به هیچ وجه تغییر نمی‌کند',
    !createCalled && !updateCalled && existingUserAfterTest.role === 'USER' && userPasswordIntact,
  );

  console.log('\n================================================================');
  console.log(`نتیجه کلی آزمون Seed: ${passed} موفق | ${failed} ناموفق`);
  console.log('================================================================');

  if (failed > 0) process.exit(1);
}

runSeedTests().catch((err) => {
  console.error('Fatal seed test error:', err);
  process.exit(1);
});
