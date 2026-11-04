// Automated Security Test Suite: Frontend JWT Signature Verification (apps/web/middleware.ts)
// Verifies cryptographic validation, claims enforcement, and rejection of forged/expired tokens.

import { SignJWT } from "jose";
import { verifyAdminToken } from "./middleware";

const VALID_SECRET = "onsupp_dev_7e8b4f1c9d2a5e3b8a1f4c7d0e2b5a8c1d4e7f0a3b6c9d2e5";
const ATTACKER_SECRET = "evil_attacker_crafted_secret_key_with_at_least_32_characters_12345";

process.env.JWT_SECRET = VALID_SECRET;

async function runMiddlewareSecurityTests() {
  console.log("================================================================");
  console.log("  STARTING FRONTEND JWT MIDDLEWARE SECURITY TESTS");
  console.log("================================================================\n");

  let passedCount = 0;
  let failedCount = 0;

  function assertResult(testName: string, condition: boolean, details?: string) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passedCount++;
    } else {
      console.error(`  [FAIL] ${testName}${details ? ` -> ${details}` : ""}`);
      failedCount++;
    }
  }

  const validKey = new TextEncoder().encode(VALID_SECRET);
  const attackerKey = new TextEncoder().encode(ATTACKER_SECRET);

  // 1. Valid signed admin JWT
  const validAdminToken = await new SignJWT({ id: 1, email: "admin@onsupp.ir", role: "ADMIN" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(validKey);

  const resValid = await verifyAdminToken(validAdminToken);
  assertResult("Valid signed admin JWT is accepted", resValid === true);

  // 2. Forged / Tampered signature with untrusted secret
  const forgedTokenWrongSecret = await new SignJWT({ id: 1, email: "admin@onsupp.ir", role: "ADMIN" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(attackerKey);

  const resForged = await verifyAdminToken(forgedTokenWrongSecret);
  assertResult("Forged JWT signed with attacker secret is rejected", resForged === false);

  // 3. Tampered payload with original signature
  const parts = validAdminToken.split(".");
  // Tamper middle payload
  const tamperedPayload = Buffer.from(JSON.stringify({ id: 999, email: "hacker@evil.com", role: "ADMIN" })).toString("base64url");
  const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;
  const resTampered = await verifyAdminToken(tamperedToken);
  assertResult("Tampered JWT payload with invalid signature is rejected", resTampered === false);

  // 4. Expired JWT
  const expiredToken = await new SignJWT({ id: 1, email: "admin@onsupp.ir", role: "ADMIN" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(Math.floor(Date.now() / 1000) - 7200)
    .setExpirationTime(Math.floor(Date.now() / 1000) - 3600)
    .sign(validKey);

  const resExpired = await verifyAdminToken(expiredToken);
  assertResult("Expired admin JWT is rejected", resExpired === false);

  // 5. Missing / undefined / empty JWT
  assertResult("Undefined token is rejected", (await verifyAdminToken(undefined)) === false);
  assertResult("Empty string token is rejected", (await verifyAdminToken("")) === false);
  assertResult("Whitespace-only token is rejected", (await verifyAdminToken("   ")) === false);
  assertResult("Malformed non-JWT string is rejected", (await verifyAdminToken("not.a.valid.jwt.string")) === false);

  // 6. Non-admin role claim (valid signature, but role is USER)
  const userToken = await new SignJWT({ id: 10, email: "user@onsupp.ir", role: "USER" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(validKey);

  const resUser = await verifyAdminToken(userToken);
  assertResult("Valid JWT with USER role is rejected by admin middleware", resUser === false);

  // 7. Token with missing required claims (e.g. no id or no email)
  const tokenNoId = await new SignJWT({ role: "ADMIN" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("2h")
    .sign(validKey);
  assertResult("Admin JWT without numeric user ID is rejected", (await verifyAdminToken(tokenNoId)) === false);

  // 8. Fail-closed behavior when JWT_SECRET is missing or too short (< 32 chars)
  const originalSecret = process.env.JWT_SECRET;
  try {
    delete process.env.JWT_SECRET;
    assertResult("Missing JWT_SECRET fails closed", (await verifyAdminToken(validAdminToken)) === false);

    process.env.JWT_SECRET = "short_insecure_secret";
    assertResult("Too short JWT_SECRET (< 32 chars) fails closed", (await verifyAdminToken(validAdminToken)) === false);
  } finally {
    process.env.JWT_SECRET = originalSecret;
  }

  console.log("\n================================================================");
  console.log(`[FRONTEND JWT TEST RESULT] Passed: ${passedCount} | Failed: ${failedCount}`);
  console.log("================================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runMiddlewareSecurityTests().catch((err) => {
  console.error("[FATAL ERROR in Middleware Security Test]", err);
  process.exit(1);
});
