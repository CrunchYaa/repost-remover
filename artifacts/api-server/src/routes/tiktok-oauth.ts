import { Router } from "express";
import { randomBytes, createHash } from "crypto";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { logAudit } from "../lib/audit";

const router = Router();

interface OAuthState {
  codeVerifier: string;
  userId: number;
  redirectUri: string;
  appUrl: string;
  expiresAt: number;
}

// In-memory PKCE state store (TTL: 10 min)
const stateStore = new Map<string, OAuthState>();
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of stateStore.entries()) {
    if (v.expiresAt < now) stateStore.delete(k);
  }
}, 60_000);

function generateCodeVerifier(): string {
  return randomBytes(32).toString("base64url");
}

function generateCodeChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

function getAppUrl(req: import("express").Request): string {
  const appUrl = process.env.APP_URL;
  if (appUrl) return appUrl;
  const proto = (req.headers["x-forwarded-proto"] as string | undefined) ?? "https";
  const host = (req.headers["x-forwarded-host"] as string | undefined) ?? (req.headers.host as string);
  return `${proto}://${host}`;
}

// GET /api/auth/tiktok/initiate — protected, starts OAuth flow
router.get("/auth/tiktok/initiate", requireAuth, (req, res) => {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  if (!clientKey) {
    res.status(500).json({ error: "TikTok OAuth not configured" });
    return;
  }

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = randomBytes(16).toString("hex");
  const appUrl = getAppUrl(req);
  const redirectUri = `${appUrl}/api/auth/tiktok/callback`;

  stateStore.set(state, {
    codeVerifier,
    userId: req.user!.id,
    redirectUri,
    appUrl,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });

  const params = new URLSearchParams({
    client_key: clientKey,
    scope: "user.info.basic",
    response_type: "code",
    redirect_uri: redirectUri,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  res.json({ url: `https://www.tiktok.com/v2/auth/authorize/?${params}` });
});

// GET /api/auth/tiktok/callback — TikTok redirects here
router.get("/auth/tiktok/callback", async (req, res) => {
  const { code, state, error } = req.query as Record<string, string>;

  const stored = state ? stateStore.get(state) : undefined;
  const appUrl = stored?.appUrl ?? process.env.APP_URL ?? "";

  if (error || !code || !state || !stored || stored.expiresAt < Date.now()) {
    const reason = error ?? (!stored ? "invalid_state" : "state_expired");
    res.redirect(`${appUrl}/connect?error=${reason}`);
    return;
  }

  stateStore.delete(state);

  const clientKey = process.env.TIKTOK_CLIENT_KEY!;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET!;

  try {
    // Exchange code for access token
    const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: stored.redirectUri,
        code_verifier: stored.codeVerifier,
      }),
    });

    type TokenResponse = {
      access_token?: string;
      refresh_token?: string;
      open_id?: string;
      error?: string;
      error_description?: string;
    };

    const tokenData = (await tokenRes.json()) as TokenResponse;

    if (!tokenData.access_token || !tokenData.open_id) {
      req.log?.error({ tokenData }, "TikTok token exchange failed");
      res.redirect(`${appUrl}/connect?error=token_failed`);
      return;
    }

    // Fetch TikTok profile
    type ProfileResponse = {
      data?: { user?: { open_id: string; display_name?: string; avatar_url?: string } };
      error?: { code?: string; message?: string };
    };

    const profileRes = await fetch(
      "https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url",
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
    );
    const profileData = (await profileRes.json()) as ProfileResponse;
    const tiktokUser = profileData.data?.user;
    const displayName = tiktokUser?.display_name ?? `tiktok_${tokenData.open_id.slice(0, 8)}`;

    // Save to DB
    await db.update(usersTable).set({
      tiktokUsername: displayName,
      tiktokSessionToken: tokenData.access_token,
      updatedAt: new Date(),
    }).where(eq(usersTable.id, stored.userId));

    await logAudit("tiktok.oauth.connected", {
      userId: stored.userId,
      category: "account",
      details: { openId: tokenData.open_id, displayName },
      ipAddress: req.ip,
    });

    res.redirect(`${appUrl}/dashboard?tiktok=connected`);
  } catch (err) {
    req.log?.error({ err }, "TikTok OAuth callback error");
    res.redirect(`${appUrl}/connect?error=server_error`);
  }
});

export default router;
