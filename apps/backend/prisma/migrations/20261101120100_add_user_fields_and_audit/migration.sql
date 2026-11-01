-- Migration: 20261101120100_add_user_fields_and_audit
-- Adds employee profile columns, enforces USER default, and creates audit_logs table

-- 1. Add employee columns
ALTER TABLE "users" 
  ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "phone" TEXT,
  ADD COLUMN IF NOT EXISTS "department" TEXT,
  ADD COLUMN IF NOT EXISTS "position" TEXT;

-- 2. Keep least-privilege default as USER
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER'::"Role";

-- 3. Create audit_logs table matching application schema
CREATE TABLE IF NOT EXISTS "audit_logs" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "action" TEXT NOT NULL,
    "targetId" INTEGER,
    "details" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- 4. Create performance indexes
CREATE INDEX IF NOT EXISTS "audit_logs_userId_idx" ON "audit_logs"("userId");
CREATE INDEX IF NOT EXISTS "audit_logs_action_idx" ON "audit_logs"("action");
CREATE INDEX IF NOT EXISTS "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- 5. Foreign key with SET NULL to preserve audit trail upon user deletion
ALTER TABLE "audit_logs" 
  DROP CONSTRAINT IF EXISTS "audit_logs_userId_fkey",
  ADD CONSTRAINT "audit_logs_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
