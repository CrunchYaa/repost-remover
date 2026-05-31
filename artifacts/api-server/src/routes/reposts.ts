import { Router } from "express";
import { randomUUID } from "crypto";
import { RemoveRepostParams } from "@workspace/api-zod";
import { requireAuth, requireSubscription } from "../middlewares/requireAuth";

const router = Router();
router.use(requireAuth, requireSubscription);

export interface Repost {
  id: string;
  videoId: string;
  originalAuthor: string;
  description: string | null;
  repostedAt: string;
  thumbnailUrl: string | null;
  status: "pending" | "removed" | "failed";
}

export const reposts: Repost[] = [];
export let totalRemoved = 0;
export let removedToday = 0;
export let removedThisWeek = 0;

export function incrementRemoved() {
  totalRemoved++;
  removedToday++;
  removedThisWeek++;
  updateDailyData();
}

const dailyAuthors = [
  "@trendsetter99", "@tiktokviral", "@danceking", "@comedy.clips",
  "@fashionfix", "@foodlover", "@travelbug", "@musicmixer", "@gamerpro", "@lifehacks",
];

export interface DailyCount { date: string; count: number; }
export const dailyData: DailyCount[] = [];

function initDailyData() {
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dailyData.push({ date: d.toISOString().split("T")[0], count: i === 0 ? 0 : Math.floor(Math.random() * 12) });
  }
}
initDailyData();

function updateDailyData() {
  const todayStr = new Date().toISOString().split("T")[0];
  const entry = dailyData.find((d) => d.date === todayStr);
  if (entry) entry.count++;
}

function generateFakeRepost(): Repost {
  const author = dailyAuthors[Math.floor(Math.random() * dailyAuthors.length)];
  const minutesAgo = Math.floor(Math.random() * 10080);
  return {
    id: randomUUID(),
    videoId: `vid_${randomUUID().slice(0, 8)}`,
    originalAuthor: author,
    description: Math.random() > 0.4 ? `Check out this video from ${author}! #fyp #viral` : null,
    repostedAt: new Date(Date.now() - minutesAgo * 60000).toISOString(),
    thumbnailUrl: null,
    status: "pending",
  };
}

router.get("/reposts", (req, res) => { res.json(reposts); });

router.post("/reposts/scan", async (req, res) => {
  const { addLog } = await import("./logs.js");
  const newCount = Math.floor(Math.random() * 5) + 1;
  let newFound = 0;
  for (let i = 0; i < newCount; i++) {
    const isDuplicate = Math.random() > 0.6 && reposts.some((r) => r.status === "pending");
    if (!isDuplicate) { reposts.unshift(generateFakeRepost()); newFound++; }
  }
  addLog("scan", `Scan completed — found ${newFound} new repost${newFound !== 1 ? "s" : ""}`, `Total pending: ${reposts.filter((r) => r.status === "pending").length}`);
  res.json({ found: reposts.filter((r) => r.status === "pending").length, newFound, scannedAt: new Date().toISOString() });
});

router.post("/reposts/remove-all", async (req, res) => {
  const { addLog } = await import("./logs.js");
  const pending = reposts.filter((r) => r.status === "pending");
  let removed = 0, failed = 0;
  for (const repost of pending) {
    if (Math.random() > 0.05) { repost.status = "removed"; removed++; incrementRemoved(); }
    else { repost.status = "failed"; failed++; }
  }
  if (removed > 0) addLog("removal", `Removed ${removed} repost${removed !== 1 ? "s" : ""}`, failed > 0 ? `${failed} failed` : undefined);
  res.json({ removed, failed });
});

router.delete("/reposts/:id", async (req, res) => {
  const { addLog } = await import("./logs.js");
  const parsed = RemoveRepostParams.safeParse(req.params);
  if (!parsed.success) { res.status(400).json({ error: "Invalid repost id" }); return; }
  const { id } = parsed.data;
  const repost = reposts.find((r) => r.id === id);
  if (!repost) { res.status(404).json({ error: "Repost not found" }); return; }
  if (Math.random() > 0.05) { repost.status = "removed"; incrementRemoved(); addLog("removal", `Removed repost from ${repost.originalAuthor}`); }
  else { repost.status = "failed"; addLog("error", `Failed to remove repost from ${repost.originalAuthor}`); }
  res.json(repost);
});

export default router;
