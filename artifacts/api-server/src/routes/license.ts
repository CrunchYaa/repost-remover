import { Router } from "express";
import { db, licenseKeysTable, usersTable } from "@workspace/db";
import { eq, and, isNull } from "drizzle-orm";
import { z } from "zod";
import { requireAuth } from "../middlewares/requireAuth";
import { subscriptionExpiryDate } from "../lib/auth";
import { logAudit } from "../lib/audit";

const router = Router();

const activateSchema = z.object({
  key: z.string().min(1).trim(),
});

// POST /api/license/activate
router.post("/activate", requireAuth, async (req, res) => {
  const parsed = activateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid key format" });
    return;
  }

  const { key } = parsed.data;

  const [licenseKey] = await db
    .select()
    .from(licenseKeysTable)
    .where(
      and(
        eq(licenseKeysTable.key, key),
        eq(licenseKeysTable.isActive, true),
        isNull(licenseKeysTable.usedByUserId)
      )
    )
    .limit(1);

  if (!licenseKey) {
    await logAudit("license.activate_failed", {
      userId: req.user!.id,
      category: "license",
      details: { key },
      ipAddress: req.ip,
    });
    res.status(400).json({ error: "Invalid, expired, or already-used license key" });
    return;
  }

  const expiresAt = subscriptionExpiryDate(licenseKey.duration);
  const now = new Date();

  // Mark key as used
  await db
    .update(licenseKeysTable)
    .set({ usedByUserId: req.user!.id, usedAt: now, expiresAt: expiresAt ?? undefined })
    .where(eq(licenseKeysTable.id, licenseKey.id));

  // Update user subscription
  await db
    .update(usersTable)
    .set({
      subscriptionExpiresAt: expiresAt,
      updatedAt: now,
    })
    .where(eq(usersTable.id, req.user!.id));

  await logAudit("license.activated", {
    userId: req.user!.id,
    category: "license",
    details: { key, duration: licenseKey.duration, expiresAt },
    ipAddress: req.ip,
  });

  res.json({
    ok: true,
    duration: licenseKey.duration,
    expiresAt,
    message: "License activated successfully",
  });
});

export default router;
