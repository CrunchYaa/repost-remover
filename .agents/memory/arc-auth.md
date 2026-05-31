---
name: ARC auth system
description: JWT cookie auth + session DB + device fingerprint for Auto Repost Cleaner
---

## Rule
- Auth token stored in httpOnly cookie named `arc_token` (JWT signed with `SESSION_SECRET`)
- Every session is persisted in the `sessions` DB table (Drizzle ORM)
- Device fingerprint sent by client via `x-device-fingerprint` header (FingerprintJS)
- `requireAuth` middleware returns 403 with `{ code: "DEVICE_MISMATCH" }` if fingerprint doesn't match session

**Why:** Prevents session hijacking and concurrent use across devices.

**How to apply:** All protected routes must go through `requireAuth`; subscription-gated routes also need `requireSubscription`. The client (`AuthContext.tsx`) always sends `credentials: "include"` and the fingerprint header.
