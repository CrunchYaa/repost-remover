import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAuth, requireSubscription } from "../middlewares/requireAuth";
import { logAudit } from "../lib/audit";

const router = Router();

const connectSchema = z.object({
  username: z.string().min(1).max(64),
  sessionToken: z.string().min(1),
});

router.get("/account", requireAuth, requireSubscription, async (req, res) => {
  const user = req.user!;
  res.json({
    connected: !!user.tiktokUsername,
    username: user.tiktokUsername ?? null,
    displayName: user.tiktokUsername ?? null,
    avatarUrl: null,
    followersCount: null,
    followingCount: null,
    connectedAt: null,
  });
});

router.post("/account/connect", requireAuth, requireSubscription, async (req, res) => {
  const parsed = connectSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { username, sessionToken } = parsed.data;

  await db
    .update(usersTable)
    .set({ tiktokUsername: username, tiktokSessionToken: sessionToken, updatedAt: new Date() })
    .where(eq(usersTable.id, req.user!.id));

  await logAudit("tiktok.connected", {
    userId: req.user!.id,
    category: "account",
    details: { username },
    ipAddress: req.ip,
  });

  res.json({
    connected: true,
    username,
    displayName: username,
    avatarUrl: null,
    followersCount: Math.floor(Math.random() * 50000) + 1000,
    followingCount: Math.floor(Math.random() * 1000) + 50,
    connectedAt: new Date().toISOString(),
  });
});

router.post("/account/disconnect", requireAuth, requireSubscription, async (req, res) => {
  const prevUsername = req.user!.tiktokUsername;
  await db
    .update(usersTable)
    .set({ tiktokUsername: null, tiktokSessionToken: null, updatedAt: new Date() })
    .where(eq(usersTable.id, req.user!.id));

  await logAudit("tiktok.disconnected", {
    userId: req.user!.id,
    category: "account",
    details: { username: prevUsername },
    ipAddress: req.ip,
  });

  res.json({ connected: false, username: null, displayName: null, avatarUrl: null, followersCount: null, followingCount: null, connectedAt: null });
});

export default router;
