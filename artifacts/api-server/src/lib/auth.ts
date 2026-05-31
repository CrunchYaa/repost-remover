import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const JWT_SECRET = process.env.SESSION_SECRET ?? "fallback-dev-secret-change-me";
const TOKEN_EXPIRY_DAYS = 30;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateSessionToken(): string {
  return randomBytes(48).toString("hex");
}

export function signJwt(payload: { userId: number; role: string; sessionToken: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: `${TOKEN_EXPIRY_DAYS}d` });
}

export function verifyJwt(token: string): { userId: number; role: string; sessionToken: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; role: string; sessionToken: string };
  } catch {
    return null;
  }
}

export function tokenExpiryDate(): Date {
  const d = new Date();
  d.setDate(d.getDate() + TOKEN_EXPIRY_DAYS);
  return d;
}

export function subscriptionExpiryDate(duration: string): Date | null {
  const now = new Date();
  switch (duration) {
    case "week":
      now.setDate(now.getDate() + 7);
      return now;
    case "month":
      now.setMonth(now.getMonth() + 1);
      return now;
    case "three_months":
      now.setMonth(now.getMonth() + 3);
      return now;
    case "six_months":
      now.setMonth(now.getMonth() + 6);
      return now;
    case "year":
      now.setFullYear(now.getFullYear() + 1);
      return now;
    case "lifetime":
      return null;
    default:
      return null;
  }
}
