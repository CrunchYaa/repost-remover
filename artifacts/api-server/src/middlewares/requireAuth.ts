import type { Request, Response, NextFunction } from "express";
import { db, sessionsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { verifyJwt } from "../lib/auth";

export interface AuthenticatedUser {
  id: number;
  username: string;
  email: string;
  role: string;
  isBanned: boolean;
  deviceFingerprint: string | null;
  subscriptionExpiresAt: Date | null;
  tiktokUsername: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.arc_token;
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const payload = verifyJwt(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  // Verify session in DB
  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(
      and(
        eq(sessionsTable.token, payload.sessionToken),
        eq(sessionsTable.isRevoked, false)
      )
    )
    .limit(1);

  if (!session || session.expiresAt < new Date()) {
    res.status(401).json({ error: "Session expired or revoked" });
    return;
  }

  // Device fingerprint check
  const clientFingerprint = req.headers["x-device-fingerprint"] as string | undefined;
  if (clientFingerprint && session.deviceFingerprint !== clientFingerprint) {
    res.status(403).json({ error: "Device mismatch. Please log in again." });
    return;
  }

  // Load user
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, session.userId))
    .limit(1);

  if (!user || user.isBanned) {
    res.status(403).json({ error: user?.isBanned ? "Account banned" : "User not found" });
    return;
  }

  req.user = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    isBanned: user.isBanned,
    deviceFingerprint: user.deviceFingerprint,
    subscriptionExpiresAt: user.subscriptionExpiresAt,
    tiktokUsername: user.tiktokUsername,
  };

  next();
}

export async function requireSubscription(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (req.user.role === "admin") {
    next();
    return;
  }
  const exp = req.user.subscriptionExpiresAt;
  if (!exp || exp < new Date()) {
    res.status(403).json({ error: "No active subscription. Please activate a license key." });
    return;
  }
  next();
}
