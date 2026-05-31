import { Router } from "express";
import { ConnectAccountBody } from "@workspace/api-zod";

const router = Router();

interface AccountState {
  connected: boolean;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  followersCount: number | null;
  followingCount: number | null;
  connectedAt: string | null;
}

export const accountState: AccountState = {
  connected: false,
  username: null,
  displayName: null,
  avatarUrl: null,
  followersCount: null,
  followingCount: null,
  connectedAt: null,
};

router.get("/account", (req, res) => {
  res.json(accountState);
});

router.post("/account/connect", (req, res) => {
  const parsed = ConnectAccountBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { username } = parsed.data;

  accountState.connected = true;
  accountState.username = username;
  accountState.displayName = username;
  accountState.avatarUrl = null;
  accountState.followersCount = Math.floor(Math.random() * 50000) + 1000;
  accountState.followingCount = Math.floor(Math.random() * 1000) + 50;
  accountState.connectedAt = new Date().toISOString();

  import("./logs.js").then(({ addLog }) => {
    addLog("account_connect", `Connected TikTok account @${username}`);
  });

  res.json(accountState);
});

router.post("/account/disconnect", (req, res) => {
  const prevUsername = accountState.username;

  accountState.connected = false;
  accountState.username = null;
  accountState.displayName = null;
  accountState.avatarUrl = null;
  accountState.followersCount = null;
  accountState.followingCount = null;
  accountState.connectedAt = null;

  import("./logs.js").then(({ addLog }) => {
    addLog("account_disconnect", `Disconnected TikTok account @${prevUsername}`);
  });

  res.json(accountState);
});

export default router;
