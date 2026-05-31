import { Router } from "express";

const router = Router();

router.get("/stats", async (req, res) => {
  const { totalRemoved, removedToday, removedThisWeek, reposts, dailyData } = await import("./reposts.js");
  const { getAutomationState } = await import("./automation.js");
  const { logs } = await import("./logs.js");

  const automationState = getAutomationState();
  const pendingReposts = reposts.filter((r) => r.status === "pending").length;

  const lastScanLog = logs.find((l) => l.type === "scan");

  res.json({
    totalRemoved,
    removedToday,
    removedThisWeek,
    pendingReposts,
    lastScanAt: lastScanLog?.createdAt ?? null,
    automationActive: automationState.active,
    dailyData,
  });
});

export default router;
