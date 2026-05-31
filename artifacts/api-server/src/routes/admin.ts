import { Router } from "express";
import { db, usersTable, licenseKeysTable, sessionsTable, auditLogsTable } from "@workspace/db";
import { eq, desc, isNull, isNotNull, and, count } from "drizzle-orm";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { requireAuth } from "../middlewares/requireAuth";
import { requireAdmin } from "../middlewares/requireAdmin";
import { logAudit } from "../lib/audit";

const router = Router();
router.use(requireAuth, requireAdmin);

// GET /api/admin/users
router.get("/users", async (req, res) => {
  const users = await db
    .select({
      id: usersTable.id,
      username: usersTable.username,
      email: usersTable.email,
      role: usersTable.role,
      isBanned: usersTable.isBanned,
      deviceFingerprint: usersTable.deviceFingerprint,
      tiktokUsername: usersTable.tiktokUsername,
      subscriptionExpiresAt: usersTable.subscriptionExpiresAt,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .orderBy(desc(usersTable.createdAt));
  res.json(users);
});

// POST /api/admin/users/:id/ban
router.post("/users/:id/ban", async (req, res) => {
  const userId = Number(req.params.id);
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user id" });
    return;
  }
  await db.update(usersTable).set({ isBanned: true }).where(eq(usersTable.id, userId));
  // Revoke all sessions
  await db.update(sessionsTable).set({ isRevoked: true }).where(eq(sessionsTable.userId, userId));
  await logAudit("admin.user_banned", {
    userId: req.user!.id,
    category: "admin",
    details: { targetUserId: userId },
    ipAddress: req.ip,
  });
  res.json({ ok: true });
});

// POST /api/admin/users/:id/unban
router.post("/users/:id/unban", async (req, res) => {
  const userId = Number(req.params.id);
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user id" });
    return;
  }
  await db.update(usersTable).set({ isBanned: false }).where(eq(usersTable.id, userId));
  await logAudit("admin.user_unbanned", {
    userId: req.user!.id,
    category: "admin",
    details: { targetUserId: userId },
    ipAddress: req.ip,
  });
  res.json({ ok: true });
});

// POST /api/admin/users/:id/revoke-device
router.post("/users/:id/revoke-device", async (req, res) => {
  const userId = Number(req.params.id);
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user id" });
    return;
  }
  await db.update(usersTable).set({ deviceFingerprint: null }).where(eq(usersTable.id, userId));
  await db.update(sessionsTable).set({ isRevoked: true }).where(eq(sessionsTable.userId, userId));
  await logAudit("admin.device_revoked", {
    userId: req.user!.id,
    category: "admin",
    details: { targetUserId: userId },
    ipAddress: req.ip,
  });
  res.json({ ok: true, message: "Device binding cleared. User can log in from any device once." });
});

// DELETE /api/admin/users/:id/subscription
router.delete("/users/:id/subscription", async (req, res) => {
  const userId = Number(req.params.id);
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user id" });
    return;
  }
  await db
    .update(usersTable)
    .set({ subscriptionExpiresAt: new Date(0) })
    .where(eq(usersTable.id, userId));
  await logAudit("admin.subscription_revoked", {
    userId: req.user!.id,
    category: "admin",
    details: { targetUserId: userId },
    ipAddress: req.ip,
  });
  res.json({ ok: true });
});

// GET /api/admin/keys
router.get("/keys", async (req, res) => {
  const keys = await db
    .select()
    .from(licenseKeysTable)
    .orderBy(desc(licenseKeysTable.createdAt));
  res.json(keys);
});

const createKeySchema = z.object({
  duration: z.enum(["week", "month", "three_months", "six_months", "year", "lifetime"]),
  count: z.number().int().min(1).max(1000).default(1),
});

// POST /api/admin/keys
router.post("/keys", async (req, res) => {
  const parsed = createKeySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", issues: parsed.error.issues });
    return;
  }
  const { duration, count: qty } = parsed.data;
  const keys = Array.from({ length: qty }, () => ({
    key: `ARC-${uuidv4().toUpperCase().replace(/-/g, "").slice(0, 20)}`,
    duration,
    createdByAdminId: req.user!.id,
  }));

  const inserted = await db.insert(licenseKeysTable).values(keys).returning();

  await logAudit("admin.keys_created", {
    userId: req.user!.id,
    category: "admin",
    details: { count: qty, duration },
    ipAddress: req.ip,
  });

  res.status(201).json(inserted);
});

// DELETE /api/admin/keys/:id
router.delete("/keys/:id", async (req, res) => {
  const keyId = Number(req.params.id);
  if (isNaN(keyId)) {
    res.status(400).json({ error: "Invalid key id" });
    return;
  }
  await db.delete(licenseKeysTable).where(eq(licenseKeysTable.id, keyId));
  await logAudit("admin.key_deleted", {
    userId: req.user!.id,
    category: "admin",
    details: { keyId },
    ipAddress: req.ip,
  });
  res.json({ ok: true });
});

// PATCH /api/admin/keys/:id/toggle
router.patch("/keys/:id/toggle", async (req, res) => {
  const keyId = Number(req.params.id);
  if (isNaN(keyId)) {
    res.status(400).json({ error: "Invalid key id" });
    return;
  }
  const [key] = await db
    .select({ isActive: licenseKeysTable.isActive })
    .from(licenseKeysTable)
    .where(eq(licenseKeysTable.id, keyId))
    .limit(1);
  if (!key) {
    res.status(404).json({ error: "Key not found" });
    return;
  }
  const [updated] = await db
    .update(licenseKeysTable)
    .set({ isActive: !key.isActive })
    .where(eq(licenseKeysTable.id, keyId))
    .returning();
  res.json(updated);
});

// GET /api/admin/logs
router.get("/logs", async (req, res) => {
  const logs = await db
    .select()
    .from(auditLogsTable)
    .orderBy(desc(auditLogsTable.createdAt))
    .limit(500);
  res.json(logs);
});

// GET /api/admin/stats
router.get("/stats", async (req, res) => {
  const [totalUsers] = await db.select({ count: count() }).from(usersTable);
  const [activeKeys] = await db
    .select({ count: count() })
    .from(licenseKeysTable)
    .where(and(eq(licenseKeysTable.isActive, true), isNull(licenseKeysTable.usedByUserId)));
  const [usedKeys] = await db
    .select({ count: count() })
    .from(licenseKeysTable)
    .where(isNotNull(licenseKeysTable.usedByUserId));
  const [bannedUsers] = await db
    .select({ count: count() })
    .from(usersTable)
    .where(eq(usersTable.isBanned, true));

  res.json({
    totalUsers: totalUsers.count,
    availableKeys: activeKeys.count,
    usedKeys: usedKeys.count,
    bannedUsers: bannedUsers.count,
  });
});

export default router;
