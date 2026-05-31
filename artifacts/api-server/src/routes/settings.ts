import { Router } from "express";
import { UpdateSettingsBody } from "@workspace/api-zod";

const router = Router();

interface Settings {
  scanIntervalMinutes: number;
  autoRemove: boolean;
  notifications: boolean;
  notifyOnRemoval: boolean;
}

const settings: Settings = {
  scanIntervalMinutes: 5,
  autoRemove: true,
  notifications: true,
  notifyOnRemoval: true,
};

router.get("/settings", (req, res) => {
  res.json(settings);
});

router.patch("/settings", async (req, res) => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid settings" });
    return;
  }

  const updates = parsed.data;
  if (updates.scanIntervalMinutes !== undefined) settings.scanIntervalMinutes = updates.scanIntervalMinutes;
  if (updates.autoRemove !== undefined) settings.autoRemove = updates.autoRemove;
  if (updates.notifications !== undefined) settings.notifications = updates.notifications;
  if (updates.notifyOnRemoval !== undefined) settings.notifyOnRemoval = updates.notifyOnRemoval;

  if (updates.scanIntervalMinutes !== undefined) {
    const { setAutomationInterval } = await import("./automation.js");
    setAutomationInterval(updates.scanIntervalMinutes);
  }

  res.json(settings);
});

export default router;
