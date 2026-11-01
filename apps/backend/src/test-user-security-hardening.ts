// Automated Security Test Suite: User Creation & Admin Account Protection (Including Real Concurrency Tests)
// Tests backend enforcement for:
// - Unauthenticated user creation rejection (401)
// - Non-admin user creation rejection (403)
// - Admin user creation permitted (201)
// - Self-deletion rejection (400)
// - Self-demotion rejection (400)
// - Real concurrent mutual deletion race condition handling (Serializable + retry)
// - Real concurrent mutual demotion race condition handling (Serializable + retry)
// - Last-admin deletion rejection (400)
// - Last-admin demotion rejection (400)
// - Normal permitted admin operations

import 'dotenv/config';
import http from 'http';
import jwt from 'jsonwebtoken';
import { app } from './server.js';
import { PrismaClient } from '@prisma/client';
import { getJwtSecret, JWT_ALGORITHM } from './config/jwt.js';

// Development-only database guard
function assertDevelopmentDatabase() {
  const urlStr = process.env.DATABASE_URL;
  if (!urlStr) throw new Error('[FATAL] DATABASE_URL is missing.');
  const parsed = new URL(urlStr);
  const isPostgres = parsed.protocol === 'postgresql:' || parsed.protocol === 'postgres:';
  const isLocal = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
  const isPort5434 = parsed.port === '5434';
  const isDevDb = parsed.pathname === '/onsupp_dev';

  if (!isPostgres || !isLocal || !isPort5434 || !isDevDb) {
    throw new Error(`[FATAL] Safety guard blocked execution: Target must be local onsupp_dev on port 5434.`);
  }
}

async function runUserSecurityHardeningTests() {
  assertDevelopmentDatabase();
  console.log('================================================================');
  console.log('  STARTING USER SECURITY & REAL CONCURRENCY HARDENING TESTS');
  console.log('================================================================\n');

  const prisma = new PrismaClient();
  const secret = getJwtSecret();

  // Find primary admin from seeded database
  const primaryAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!primaryAdmin) {
    throw new Error('[FATAL] Primary admin not found in onsupp_dev.');
  }

  // Ephemeral test server
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address() as { port: number; address: string };
  const baseUrl = `http://${address.address}:${address.port}`;
  console.log(`[TEST-SERVER] Listening on ${baseUrl}\n`);

  let passedCount = 0;
  let failedCount = 0;

  function assertResult(testName: string, passed: boolean, details?: string) {
    if (passed) {
      console.log(`  [PASS] ${testName}${details ? ` (${details})` : ''}`);
      passedCount++;
    } else {
      console.error(`  [FAIL] ${testName}${details ? ` -> ${details}` : ''}`);
      failedCount++;
    }
  }

  // Generate token for primary admin
  const primaryAdminToken = jwt.sign(
    { id: primaryAdmin.id, email: primaryAdmin.email, role: 'ADMIN' },
    secret,
    { algorithm: JWT_ALGORITHM, expiresIn: '1h' },
  );

  let tempUserId: number | null = null;
  let tempAdmin2Id: number | null = null;

  try {
    // -------------------------------------------------------------
    // 1. Unauthenticated user creation rejected
    // -------------------------------------------------------------
    console.log('--- 1. Testing User Creation Access Control ---');
    const unauthCreateRes = await fetch(`${baseUrl}/api/v1/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Hacker Attempt',
        email: 'unauth@onsupp.local',
        password: 'Password123!',
        role: 'USER',
      }),
    });
    assertResult(
      'Unauthenticated POST /api/v1/users is rejected with HTTP 401',
      unauthCreateRes.status === 401,
      `status: ${unauthCreateRes.status}`
    );

    // -------------------------------------------------------------
    // 2. Non-admin user creation rejected
    // -------------------------------------------------------------
    const fakeUserToken = jwt.sign(
      { id: 9999, email: 'fakeuser@onsupp.local', role: 'USER' },
      secret,
      { algorithm: JWT_ALGORITHM, expiresIn: '1h' },
    );
    const nonAdminCreateRes = await fetch(`${baseUrl}/api/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${fakeUserToken}`,
      },
      body: JSON.stringify({
        name: 'Unauthorized Create',
        email: 'regular_user_create@onsupp.local',
        password: 'Password123!',
        role: 'USER',
      }),
    });
    const nonAdminDenied = nonAdminCreateRes.status === 401 || nonAdminCreateRes.status === 403;
    assertResult(
      'Non-admin token attempting user creation is rejected (HTTP 401/403)',
      nonAdminDenied,
      `status: ${nonAdminCreateRes.status}`
    );

    // -------------------------------------------------------------
    // 3. Admin user creation permitted
    // -------------------------------------------------------------
    const testUserEmail = `test_normal_user_${Date.now()}@onsupp.local`;
    const adminCreateUserRes = await fetch(`${baseUrl}/api/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${primaryAdminToken}`,
      },
      body: JSON.stringify({
        name: 'کاربر تستی معتبر',
        email: testUserEmail,
        password: 'TestPassword123!',
        role: 'USER',
      }),
    });
    const createdUserData = (await adminCreateUserRes.json()) as any;
    assertResult(
      'Admin POST /api/v1/users successfully creates regular user (HTTP 201)',
      adminCreateUserRes.status === 201 && createdUserData?.role === 'USER',
      `status: ${adminCreateUserRes.status}`
    );
    tempUserId = createdUserData?.id;

    // -------------------------------------------------------------
    // 4. Self-deletion rejected
    // -------------------------------------------------------------
    console.log('\n--- 2. Testing Self-Deletion & Self-Demotion Guards ---');
    const selfDeleteRes = await fetch(`${baseUrl}/api/v1/users/${primaryAdmin.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${primaryAdminToken}` },
    });
    const selfDeleteData = (await selfDeleteRes.json()) as any;
    assertResult(
      'Admin attempting self-deletion is rejected with HTTP 400',
      selfDeleteRes.status === 400,
      `status: ${selfDeleteRes.status}, error: "${selfDeleteData?.error}"`
    );

    // -------------------------------------------------------------
    // 5. Self-demotion rejected
    // -------------------------------------------------------------
    const selfDemoteRes = await fetch(`${baseUrl}/api/v1/users/${primaryAdmin.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${primaryAdminToken}`,
      },
      body: JSON.stringify({ role: 'USER' }),
    });
    const selfDemoteData = (await selfDemoteRes.json()) as any;
    assertResult(
      'Admin attempting self-demotion is rejected with HTTP 400',
      selfDemoteRes.status === 400,
      `status: ${selfDemoteRes.status}, error: "${selfDemoteData?.error}"`
    );

    // -------------------------------------------------------------
    // 6. Normal permitted admin operations
    // -------------------------------------------------------------
    console.log('\n--- 3. Testing Normal Permitted Admin Operations ---');
    if (tempUserId) {
      const updateRes = await fetch(`${baseUrl}/api/v1/users/${tempUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${primaryAdminToken}`,
        },
        body: JSON.stringify({ name: 'نام بروزرسانی شده کاربر' }),
      });
      const updateData = (await updateRes.json()) as any;
      assertResult(
        'Admin updating secondary user profile succeeds (HTTP 200)',
        updateRes.status === 200 && updateData?.name === 'نام بروزرسانی شده کاربر',
        `status: ${updateRes.status}`
      );

      const deleteRes = await fetch(`${baseUrl}/api/v1/users/${tempUserId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${primaryAdminToken}` },
      });
      assertResult(
        'Admin deleting regular user succeeds (HTTP 200)',
        deleteRes.status === 200,
        `status: ${deleteRes.status}`
      );
      tempUserId = null;
    }

    // -------------------------------------------------------------
    // 7. Real Concurrency Test A: Concurrent Mutual Deletion
    // -------------------------------------------------------------
    console.log('\n--- 4. Real Concurrency Test: Concurrent Mutual Deletion ---');
    // Create secondary admin account
    const testAdmin2Email = `test_concurrent_admin2_${Date.now()}@onsupp.local`;
    const admin2Record = await prisma.user.create({
      data: {
        name: 'مدیر تستی هم‌روند ۲',
        email: testAdmin2Email,
        password: 'HashedPassword123!',
        role: 'ADMIN',
      },
    });
    tempAdmin2Id = admin2Record.id;

    const admin2Token = jwt.sign(
      { id: admin2Record.id, email: admin2Record.email, role: 'ADMIN' },
      secret,
      { algorithm: JWT_ALGORITHM, expiresIn: '1h' },
    );

    const initialAdminsCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    console.log(`  [INFO] Starting concurrency test with exactly ${initialAdminsCount} admins.`);

    // Simultaneously send mutually conflicting deletion requests:
    // Request 1: Primary admin deletes Admin 2
    // Request 2: Admin 2 deletes Primary admin
    const [concurrentDelRes1, concurrentDelRes2] = await Promise.all([
      fetch(`${baseUrl}/api/v1/users/${admin2Record.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${primaryAdminToken}` },
      }),
      fetch(`${baseUrl}/api/v1/users/${primaryAdmin.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${admin2Token}` },
      }),
    ]);

    const postDelAdminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    console.log(`  [INFO] Mutual deletion responses: Req1 status: ${concurrentDelRes1.status}, Req2 status: ${concurrentDelRes2.status}`);
    console.log(`  [INFO] Admin count after concurrent deletion: ${postDelAdminCount}`);

    // Verification 1: System MUST NOT have zero admins!
    assertResult(
      'Concurrency guard ensures at least 1 ADMIN remains after concurrent mutual deletion',
      postDelAdminCount >= 1,
      `remaining admins: ${postDelAdminCount}`
    );

    // Verification 2: Exactly one request succeeded (200), and the other was prevented (400 / 409)
    const oneSucceededOneFailed =
      (concurrentDelRes1.status === 200 && (concurrentDelRes2.status === 400 || concurrentDelRes2.status === 409)) ||
      (concurrentDelRes2.status === 200 && (concurrentDelRes1.status === 400 || concurrentDelRes1.status === 409));
    assertResult(
      'One concurrent deletion succeeded and the competing deletion was blocked',
      oneSucceededOneFailed,
      `Req1: ${concurrentDelRes1.status}, Req2: ${concurrentDelRes2.status}`
    );

    // -------------------------------------------------------------
    // 8. Real Concurrency Test B: Concurrent Mutual Demotion
    // -------------------------------------------------------------
    console.log('\n--- 5. Real Concurrency Test: Concurrent Mutual Demotion ---');
    // Ensure primary admin exists with role ADMIN
    await prisma.user.update({
      where: { id: primaryAdmin.id },
      data: { role: 'ADMIN' },
    });

    // Create a new fresh secondary admin
    const admin3Email = `test_concurrent_admin3_${Date.now()}@onsupp.local`;
    const admin3Record = await prisma.user.create({
      data: {
        name: 'مدیر تستی هم‌روند ۳',
        email: admin3Email,
        password: 'HashedPassword123!',
        role: 'ADMIN',
      },
    });
    tempAdmin2Id = admin3Record.id;

    const admin3Token = jwt.sign(
      { id: admin3Record.id, email: admin3Record.email, role: 'ADMIN' },
      secret,
      { algorithm: JWT_ALGORITHM, expiresIn: '1h' },
    );

    const countBeforeDemote = await prisma.user.count({ where: { role: 'ADMIN' } });
    console.log(`  [INFO] Starting demotion test with exactly ${countBeforeDemote} admins.`);

    // Simultaneously send mutually conflicting demotion requests:
    // Request 1: Primary admin demotes Admin 3 to USER
    // Request 2: Admin 3 demotes Primary admin to USER
    const [concurrentDemoteRes1, concurrentDemoteRes2] = await Promise.all([
      fetch(`${baseUrl}/api/v1/users/${admin3Record.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${primaryAdminToken}`,
        },
        body: JSON.stringify({ role: 'USER' }),
      }),
      fetch(`${baseUrl}/api/v1/users/${primaryAdmin.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${admin3Token}`,
        },
        body: JSON.stringify({ role: 'USER' }),
      }),
    ]);

    const postDemoteAdminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    console.log(`  [INFO] Mutual demotion responses: Req1 status: ${concurrentDemoteRes1.status}, Req2 status: ${concurrentDemoteRes2.status}`);
    console.log(`  [INFO] Admin count after concurrent demotion: ${postDemoteAdminCount}`);

    // Verification 1: System MUST NOT have zero admins!
    assertResult(
      'Concurrency guard ensures at least 1 ADMIN remains after concurrent mutual demotion',
      postDemoteAdminCount >= 1,
      `remaining admins: ${postDemoteAdminCount}`
    );

    // Verification 2: Exactly one demotion succeeded and the competing demotion was blocked
    const oneDemoteSucceeded =
      (concurrentDemoteRes1.status === 200 && (concurrentDemoteRes2.status === 400 || concurrentDemoteRes2.status === 409)) ||
      (concurrentDemoteRes2.status === 200 && (concurrentDemoteRes1.status === 400 || concurrentDemoteRes1.status === 409));
    assertResult(
      'One concurrent demotion succeeded and the competing demotion was blocked',
      oneDemoteSucceeded,
      `Req1: ${concurrentDemoteRes1.status}, Req2: ${concurrentDemoteRes2.status}`
    );

    // -------------------------------------------------------------
    // 9. Last-Admin Protection on Single Remaining Admin
    // -------------------------------------------------------------
    console.log('\n--- 6. Testing Protection on Last Remaining Admin ---');
    // Ensure primary admin is restored to ADMIN
    await prisma.user.update({
      where: { id: primaryAdmin.id },
      data: { role: 'ADMIN' },
    });
    // Remove admin3 if it still exists
    await prisma.user.deleteMany({ where: { id: admin3Record.id } });
    tempAdmin2Id = null;

    const finalAdminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    assertResult('Verified exactly 1 admin remains in database', finalAdminCount === 1);

    // Attempt to demote the single remaining admin
    const lastDemoteRes = await fetch(`${baseUrl}/api/v1/users/${primaryAdmin.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${primaryAdminToken}`,
      },
      body: JSON.stringify({ role: 'USER' }),
    });
    const lastDemoteData = (await lastDemoteRes.json()) as any;
    assertResult(
      'Demoting the single remaining admin is rejected with HTTP 400',
      lastDemoteRes.status === 400,
      `status: ${lastDemoteRes.status}, error: "${lastDemoteData?.error}"`
    );

    // Attempt to delete the single remaining admin (self-deletion block)
    const lastDeleteRes = await fetch(`${baseUrl}/api/v1/users/${primaryAdmin.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${primaryAdminToken}` },
    });
    assertResult(
      'Deleting the single remaining admin is rejected with HTTP 400',
      lastDeleteRes.status === 400,
      `status: ${lastDeleteRes.status}`
    );

    // -------------------------------------------------------------
    // Summary
    // -------------------------------------------------------------
    console.log('\n================================================================');
    console.log(`[USER SECURITY TEST RESULT] Passed: ${passedCount} | Failed: ${failedCount}`);
    console.log('================================================================\n');

    if (failedCount > 0) {
      process.exit(1);
    }
  } finally {
    // Robust cleanup: Always delete all temporary test users by domain pattern and IDs
    try {
      await prisma.user.deleteMany({
        where: {
          email: {
            contains: 'onsupp.local',
          },
        },
      });
      // Ensure primary admin always retains ADMIN role
      await prisma.user.updateMany({
        where: { email: primaryAdmin.email },
        data: { role: 'ADMIN' },
      });
    } catch (cleanupErr) {
      console.error('[CLEANUP WARNING]', cleanupErr);
    }
    server.close();
    await prisma.$disconnect();
  }
}

runUserSecurityHardeningTests().catch((err) => {
  console.error('[FATAL ERROR in User Security Test]', err);
  process.exit(1);
});
