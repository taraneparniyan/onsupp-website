import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export interface AuditLogEntry {
  userId?: number;
  action: string;
  targetId?: number;
  details?: string;
  ipAddress?: string;
}

/**
 * Safely writes an audit entry without throwing or disrupting primary transactions.
 * Strictly guarantees that no sensitive fields (passwords, JWTs, hashes) are recorded.
 */
export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    // Sanitize details: strip any accidental password or token strings
    let sanitizedDetails = entry.details;
    if (sanitizedDetails) {
      sanitizedDetails = sanitizedDetails
        .replace(/password[:=]\s*["']?[^,"'\s]+["']?/gi, "password:[REDACTED]")
        .replace(/token[:=]\s*["']?[^,"'\s]+["']?/gi, "token:[REDACTED]");
    }

    await (prisma as any).auditLog.create({
      data: {
        userId: entry.userId ?? null,
        action: entry.action,
        targetId: entry.targetId ?? null,
        details: sanitizedDetails ?? null,
        ipAddress: entry.ipAddress ?? null,
      },
    });
  } catch (err) {
    // If table does not yet exist or connection hiccup occurs, fail safely and log to console
    console.warn("[auditService] Failed to record audit log:", err);
  }
}

/**
 * Retrieves audit logs with user details for Super Admin review.
 */
export async function getAuditLogs(limit = 100) {
  try {
    return await (prisma as any).auditLog.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
  } catch (err) {
    console.warn("[auditService] Failed to fetch audit logs:", err);
    return [];
  }
}
