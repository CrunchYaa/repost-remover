import { db } from "@workspace/db";
import { auditLogsTable } from "@workspace/db";
import { logger } from "./logger";

export async function logAudit(
  action: string,
  opts: {
    userId?: number;
    category?: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
  } = {}
) {
  try {
    await db.insert(auditLogsTable).values({
      action,
      userId: opts.userId ?? null,
      category: opts.category ?? "system",
      details: opts.details ?? null,
      ipAddress: opts.ipAddress ?? null,
    });
  } catch (err) {
    logger.error({ err, action }, "Failed to write audit log");
  }
}
