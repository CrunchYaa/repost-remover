---
name: ARC zod import rule
description: esbuild cannot resolve zod/v4 subpath — always import from "zod"
---

## Rule
In `api-server` and any esbuild-bundled package, always use:
```ts
import { z } from "zod";
```
Never use `from "zod/v4"`.

**Why:** esbuild cannot resolve the `zod/v4` subpath export. It fails silently at bundle time or throws a module resolution error at runtime.

**How to apply:** Check all api-server imports after adding new validation code.
