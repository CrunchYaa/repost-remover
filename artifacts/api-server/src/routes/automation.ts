import { Router } from "express";

const router = Router();

interface AutomationState {
  active: boolean;
  intervalMinutes: number;
  nextRunAt: string | null;
  startedAt: string | null;
}

const state: AutomationState = {
  active: false,
  intervalMinutes: 5,
  nextRunAt: null,
  startedAt: null,
};

let autoTimer: ReturnType<typeof setInterval> | null = null;

export function getAutomationState() {
  return state;
}

export function setAutomationInterval(minutes: number) {
  state.intervalMinutes = minutes;
  if (state.active && autoTimer) {
    clearInterval(autoTimer);
    startAutoLoop();
  }
}

async function runAutoScan() {
  const { reposts, generateFakeRepost: _g, incrementRemoved } = await import("./reposts.js");
  const { addLog } = await import("./logs.js");

  const newCount = Math.floor(Math.random() * 3);
  for (let i = 0; i < newCount; i++) {
    const { default: repostsRouter, ...repostsModule } = await import("./reposts.js");
    void repostsRouter;
    void repostsModule;
  }

  const pendingReposts = reposts.filter((r) => r.status === "pending");
  let removed = 0;

  for (const repost of pendingReposts) {
    if (Math.random() > 0.1) {
      repost.status = "removed";
      removed++;
      incrementRemoved();
    }
  }

  state.nextRunAt = new Date(Date.now() + state.intervalMinutes * 60000).toISOString();

  if (removed > 0) {
    addLog(
      "removal",
      `Auto-mode removed ${removed} repost${removed !== 1 ? "s" : ""}`,
      `Next scan in ${state.intervalMinutes} min`,
    );
  } else {
    addLog("scan", `Auto-mode scan complete — no new reposts found`, `Next scan in ${state.intervalMinutes} min`);
  }
}

function startAutoLoop() {
  autoTimer = setInterval(runAutoScan, state.intervalMinutes * 60 * 1000);
  state.nextRunAt = new Date(Date.now() + state.intervalMinutes * 60000).toISOString();
}

router.get("/automation", (req, res) => {
  res.json(state);
});

router.post("/automation/start", async (req, res) => {
  const { addLog } = await import("./logs.js");

  if (!state.active) {
    state.active = true;
    state.startedAt = new Date().toISOString();
    startAutoLoop();
    addLog("automation_start", `Auto-mode activated — scanning every ${state.intervalMinutes} min`);
  }

  res.json(state);
});

router.post("/automation/stop", async (req, res) => {
  const { addLog } = await import("./logs.js");

  if (state.active) {
    state.active = false;
    state.nextRunAt = null;
    state.startedAt = null;
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
    addLog("automation_stop", "Auto-mode deactivated");
  }

  res.json(state);
});

export default router;
