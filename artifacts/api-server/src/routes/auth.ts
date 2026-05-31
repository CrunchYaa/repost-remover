import { Router } from "express";
import { db, usersTable, sessionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import {
  hashPassword,
  verifyPassword,
  generateSessionToken,
  signJwt,
  tokenExpiryDate,
} from "../lib/auth";
import { logAudit } from "../lib/audit";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

const registerSchema = z.object({
  username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  deviceFingerprint: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  deviceFingerprint: z.string().min(1),
});

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", issues: parsed.error.issues });
    return;
  }
  const { username, email, password, deviceFingerprint } = parsed.data;

  // Check existing
  const existing = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (existing.length > 0) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const usernameExists = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.username, username))
    .limit(1);

  if (usernameExists.length > 0) {
    res.status(409).json({ error: "Username already taken" });
    return;
  }

  const passwordHash = await hashPassword(password);
  const [user] = await db
    .insert(usersTable)
    .values({ username, email, passwordHash, deviceFingerprint })
    .returning();

  const sessionToken = generateSessionToken();
  const expiresAt = tokenExpiryDate();

  await db.insert(sessionsTable).values({
    userId: user.id,
    token: sessionToken,
    deviceFingerprint,
    userAgent: req.headers["user-agent"] ?? null,
    ipAddress: req.ip ?? null,
    expiresAt,
  });

  const jwt = signJwt({ userId: user.id, role: user.role, sessionToken });

  await logAudit("user.register", {
    userId: user.id,
    category: "auth",
    details: { username, email },
    ipAddress: req.ip,
  });

  res.cookie("arc_token", jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: expiresAt,
    path: "/",
  });

  res.status(201).json({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    subscriptionExpiresAt: user.subscriptionExpiresAt,
  });
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { email, password, deviceFingerprint } = parsed.data;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  if (user.isBanned) {
    res.status(403).json({ error: "Account has been banned" });
    return;
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    await logAudit("user.login_failed", {
      userId: user.id,
      category: "auth",
      details: { email },
      ipAddress: req.ip,
    });
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  // Device fingerprint check — if user has a registered fingerprint, enforce it
  if (
    user.deviceFingerprint &&
    user.deviceFingerprint !== deviceFingerprint &&
    user.role !== "admin"
  ) {
    await logAudit("user.device_mismatch", {
      userId: user.id,
      category: "auth",
      details: { email, deviceFingerprint },
      ipAddress: req.ip,
    });
    res.status(403).json({
      error: "Access from a new device detected. Please contact support to reactivate.",
      code: "DEVICE_MISMATCH",
    });
    return;
  }

  const sessionToken = generateSessionToken();
  const expiresAt = tokenExpiryDate();

  await db.insert(sessionsTable).values({
    userId: user.id,
    token: sessionToken,
    deviceFingerprint,
    userAgent: req.headers["user-agent"] ?? null,
    ipAddress: req.ip ?? null,
    expiresAt,
  });

  const jwt = signJwt({ userId: user.id, role: user.role, sessionToken });

  await logAudit("user.login", {
    userId: user.id,
    category: "auth",
    details: { email },
    ipAddress: req.ip,
  });

  res.cookie("arc_token", jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: expiresAt,
    path: "/",
  });

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    subscriptionExpiresAt: user.subscriptionExpiresAt,
    tiktokUsername: user.tiktokUsername,
  });
});

// POST /api/auth/logout
router.post("/logout", requireAuth, async (req, res) => {
  const token = req.cookies?.arc_token;
  if (token) {
    const payload = (await import("../lib/auth")).verifyJwt(token);
    if (payload) {
      await db
        .update(sessionsTable)
        .set({ isRevoked: true })
        .where(eq(sessionsTable.token, payload.sessionToken));
    }
  }
  res.clearCookie("arc_token", { path: "/" });
  await logAudit("user.logout", { userId: req.user?.id, category: "auth", ipAddress: req.ip });
  res.json({ ok: true });
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req, res) => {
  res.json({
    id: req.user!.id,
    username: req.user!.username,
    email: req.user!.email,
    role: req.user!.role,
    subscriptionExpiresAt: req.user!.subscriptionExpiresAt,
    tiktokUsername: req.user!.tiktokUsername,
  });
});

export default router;
