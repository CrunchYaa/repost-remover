import { Router } from "express";
import { randomUUID } from "crypto";
import { requireAuth, requireSubscription } from "../middlewares/requireAuth";

const router = Router();

export type LogType = "scan" | "removal" | "automation_start" | "automation_stop" | "account_connect" | "account_disconnect" | "error";

interface LogEntry { id: string; type: LogType; message: string; detail: string | null; createdAt: string; }

export const logs: LogEntry[] = [
  { id: randomUUID(), type: "scan", message: "System initialized — ready to scan for reposts", detail: null, createdAt: new Date(Date.now() - 3600000).toISOString() },
];

export function addLog(type: LogType, message: string, detail?: string) {
  logs.unshift({ id: randomUUID(), type, message, detail: detail ?? null, createdAt: new Date().toISOString() });
  if (logs.length > 500) logs.splice(500);
}

router.get("/logs", requireAuth, requireSubscription, (req, res) => { res.json(logs); });

export default router;
