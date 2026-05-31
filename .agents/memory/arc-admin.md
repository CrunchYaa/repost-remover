---
name: ARC admin seed
description: How to seed the admin user for Auto Repost Cleaner
---

## Rule
Run: `pnpm --filter @workspace/scripts run seed-admin`

Default credentials:
- Email: `admin@arc.local`
- Password: `Admin@12345!`
- Role: `admin`

**Why:** The admin user must be seeded manually since registration is open to regular users only (no self-assignment of admin role).

**How to apply:** Run after DB push in a fresh environment. Change password after first login.
