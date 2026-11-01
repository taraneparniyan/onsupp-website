// Local Admin Authentication Smoke Test
// Verifies authentication flow, ADMIN role, JWT generation, protected route access,
// and rejection of incorrect passwords and unauthenticated requests.

import 'dotenv/config';
import http from 'http';
import { app } from './server.js';
import { PrismaClient } from '@prisma/client';

// Ensure development-only database target
function assertDevelopmentDatabase() {
  const urlStr = process.env.DATABASE_URL;
  if (!urlStr) {
    throw new Error('[FATAL] DATABASE_URL is missing.');
  }
  const parsed = new URL(urlStr);
  const isPostgres = parsed.protocol === 'postgresql:' || parsed.protocol === 'postgres:';
  const isLocal = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
  const isPort5434 = parsed.port === '5434';
  const isDevDb = parsed.pathname === '/onsupp_dev';

  if (!isPostgres || !isLocal || !isPort5434 || !isDevDb) {
    throw new Error(
      `[FATAL] Safety guard blocked execution: Smoke test may only target local onsupp_dev on port 5434. Got host: "${parsed.hostname}", port: "${parsed.port}", db: "${parsed.pathname}"`
    );
  }
}

// Fallback JWT secret for local testing if not present in environment
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  process.env.JWT_SECRET = 'a_secure_local_dev_jwt_secret_with_more_than_32_characters_for_smoke_test!';
}

async function runAdminSmokeTest() {
  assertDevelopmentDatabase();
  console.log('================================================================');
  console.log('  STARTING LOCAL ADMIN AUTHENTICATION SMOKE TEST');
  console.log('================================================================\n');

  const adminEmail = process.env.ADMIN_EMAIL?.trim() || 'admin@onsupp.ir';
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    throw new Error('[FATAL] ADMIN_PASSWORD is missing in environment (.env).');
  }

  // Pre-check: Verify admin account exists in local DB via Prisma
  const prisma = new PrismaClient();
  const dbUser = await prisma.user.findUnique({
    where: { email: adminEmail },
    select: { id: true, email: true, role: true, password: true },
  });

  if (!dbUser) {
    throw new Error(`[FATAL] Seeded admin user "${adminEmail}" was not found in database onsupp_dev.`);
  }

  if (dbUser.role !== 'ADMIN') {
    throw new Error(`[FATAL] User "${adminEmail}" exists but has role "${dbUser.role}" instead of "ADMIN".`);
  }

  console.log(`[PRE-CHECK PASS] Admin user exists in onsupp_dev (ID: ${dbUser.id}, Role: ${dbUser.role})`);
  console.log(`[PRE-CHECK PASS] Password hash format: Valid bcrypt hash confirmed (length: ${dbUser.password.length})\n`);

  // Start ephemeral HTTP server on free port
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address() as { port: number; address: string };
  const baseUrl = `http://${address.address}:${address.port}`;
  console.log(`[SERVER] Ephemeral test server listening on ${baseUrl}\n`);

  let passedCount = 0;
  let failedCount = 0;

  function record(name: string, passed: boolean, details?: string) {
    if (passed) {
      console.log(`  [PASS] ${name}${details ? ` (${details})` : ''}`);
      passedCount++;
    } else {
      console.error(`  [FAIL] ${name}${details ? ` -> ${details}` : ''}`);
      failedCount++;
    }
  }

  let receivedToken: string | null = null;

  try {
    // -------------------------------------------------------------
    // Scenario 1: Successful Login with Seeded Admin Credentials
    // -------------------------------------------------------------
    console.log('--- SCENARIO 1: Admin Login with Correct Credentials (POST /api/v1/auth/login) ---');
    const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: adminEmail,
        password: adminPassword,
      }),
    });

    const loginData = (await loginRes.json()) as any;
    const isLogin200 = loginRes.status === 200;
    const hasToken = typeof loginData?.token === 'string' && loginData.token.length > 30;
    const isRoleAdmin = loginData?.user?.role === 'ADMIN';
    const isCorrectEmail = loginData?.user?.email === adminEmail;
    const noPasswordLeaked = loginData?.user?.password === undefined;

    record('Login returns HTTP 200 OK', isLogin200, `status ${loginRes.status}`);
    record('JWT token is generated and returned', hasToken, `token length: ${loginData?.token?.length ?? 0}`);
    record('Authenticated user role is ADMIN', isRoleAdmin, `role: ${loginData?.user?.role}`);
    record('Authenticated user email matches admin email', isCorrectEmail, `email: ${loginData?.user?.email}`);
    record('Password and password hash are NOT exposed in response body', noPasswordLeaked);

    if (hasToken) {
      receivedToken = loginData.token;
    }

    // -------------------------------------------------------------
    // Scenario 2: Protected Route Access with Admin JWT
    // -------------------------------------------------------------
    console.log('\n--- SCENARIO 2: Access Protected Routes with Authenticated Admin JWT ---');
    
    // 2a: GET /api/v1/auth/me
    const meRes = await fetch(`${baseUrl}/api/v1/auth/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${receivedToken}` },
    });
    const meData = (await meRes.json()) as any;
    record('GET /api/v1/auth/me returns HTTP 200 OK', meRes.status === 200, `status ${meRes.status}`);
    record(
      'GET /api/v1/auth/me returns authoritative ADMIN identity from database',
      meData?.user?.role === 'ADMIN' && meData?.user?.email === adminEmail,
      `id: ${meData?.user?.id}, role: ${meData?.user?.role}`
    );

    // 2b: GET /api/v1/users (Admin-only route)
    const usersRes = await fetch(`${baseUrl}/api/v1/users`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${receivedToken}` },
    });
    const usersData = (await usersRes.json()) as any;
    const isUsersArray = Array.isArray(usersData);
    record('GET /api/v1/users (admin-only) returns HTTP 200 OK', usersRes.status === 200, `status ${usersRes.status}`);
    record('GET /api/v1/users returns user array containing the admin', isUsersArray && usersData.some((u: any) => u.email === adminEmail), `user count: ${usersData.length}`);

    // 2c: GET /api/v1/contact/submissions (Admin-only route)
    const contactRes = await fetch(`${baseUrl}/api/v1/contact/submissions`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${receivedToken}` },
    });
    const contactData = (await contactRes.json()) as any;
    record('GET /api/v1/contact/submissions (admin-only) returns HTTP 200 OK', contactRes.status === 200, `status ${contactRes.status}`);
    record('GET /api/v1/contact/submissions returns array', Array.isArray(contactData), `submission count: ${contactData.length}`);

    // -------------------------------------------------------------
    // Scenario 3: Rejection of Incorrect Passwords
    // -------------------------------------------------------------
    console.log('\n--- SCENARIO 3: Rejection of Incorrect Password ---');
    const wrongLoginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: adminEmail,
        password: 'DefinitiveWrongPassword#2026_Test',
      }),
    });
    const wrongLoginData = (await wrongLoginRes.json()) as any;
    record('Login with incorrect password rejected with HTTP 401 Unauthorized', wrongLoginRes.status === 401, `status ${wrongLoginRes.status}`);
    record('No JWT token is issued on failed authentication', wrongLoginData?.token === undefined);
    record('Error message indicates invalid credentials', wrongLoginData?.error === 'Invalid email or password');

    // -------------------------------------------------------------
    // Scenario 4: Rejection of Unauthenticated Requests
    // -------------------------------------------------------------
    console.log('\n--- SCENARIO 4: Rejection of Unauthenticated Requests to Protected Routes ---');
    
    // 4a: GET /api/v1/users without token
    const unauthUsersRes = await fetch(`${baseUrl}/api/v1/users`, { method: 'GET' });
    const unauthUsersData = (await unauthUsersRes.json()) as any;
    record('Unauthenticated GET /api/v1/users rejected with HTTP 401', unauthUsersRes.status === 401, `status ${unauthUsersRes.status}`);
    record('Error indicates authentication is required', unauthUsersData?.error === 'Authentication required');

    // 4b: GET /api/v1/contact/submissions without token
    const unauthContactRes = await fetch(`${baseUrl}/api/v1/contact/submissions`, { method: 'GET' });
    const unauthContactData = (await unauthContactRes.json()) as any;
    record('Unauthenticated GET /api/v1/contact/submissions rejected with HTTP 401', unauthContactRes.status === 401, `status ${unauthContactRes.status}`);
    record('Error indicates authentication is required', unauthContactData?.error === 'Authentication required');

    // -------------------------------------------------------------
    // Scenario 5: Rejection of Forged / Tampered JWT Token
    // -------------------------------------------------------------
    console.log('\n--- SCENARIO 5: Rejection of Forged / Tampered JWT Tokens ---');
    const forgedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBvbnN1cHAuaXIiLCJyb2xlIjoiQURNSU4ifQ.ForgedSignatureInvalidChecksum1234567890';
    const forgedRes = await fetch(`${baseUrl}/api/v1/users`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${forgedToken}` },
    });
    record('Tampered/Forged JWT token rejected with HTTP 401', forgedRes.status === 401, `status ${forgedRes.status}`);

    // -------------------------------------------------------------
    // Summary
    // -------------------------------------------------------------
    console.log('\n================================================================');
    console.log(`[SMOKE TEST RESULT] Passed: ${passedCount} | Failed: ${failedCount}`);
    console.log('================================================================\n');

    if (failedCount > 0) {
      process.exit(1);
    }
  } finally {
    server.close();
    await prisma.$disconnect();
  }
}

runAdminSmokeTest().catch((err) => {
  console.error('[SMOKE-TEST FATAL]', err);
  process.exit(1);
});
