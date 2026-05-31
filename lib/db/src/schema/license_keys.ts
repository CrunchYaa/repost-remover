import { pgTable, text, serial, boolean, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const keyDurationEnum = pgEnum("key_duration", [
  "week",
  "month",
  "three_months",
  "six_months",
  "year",
  "lifetime",
]);

export const licenseKeysTable = pgTable("license_keys", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  duration: keyDurationEnum("duration").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  usedByUserId: integer("used_by_user_id"),
  usedAt: timestamp("used_at"),
  expiresAt: timestamp("expires_at"),
  createdByAdminId: integer("created_by_admin_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertLicenseKeySchema = createInsertSchema(licenseKeysTable).omit({
  id: true,
  createdAt: true,
  usedAt: true,
  usedByUserId: true,
  expiresAt: true,
});

export type LicenseKey = typeof licenseKeysTable.$inferSelect;
export type InsertLicenseKey = z.infer<typeof insertLicenseKeySchema>;
