---
name: auth-change
description: Use whenever a frontend change touches login, logout, refresh token, session restore, current user, auth guard, or permission gating. High regression-risk area — this skill enforces the mandatory file-reading + verification checklist before edits land. Trigger on phrases like "sửa login", "refresh token loop", "guard auth", "permission gate", "app init auth".
---

# Auth Change Skill

## When to use
Any FE edit affecting login, logout, refresh token, session restore, `AuthStore`, current-user resolution, auth/permission guards.

## High-risk surface
This area regresses easily — every change must be cross-checked at several points, not just one component.

## Mandatory steps
1. Read `AI/references/auth-flow.md`.
2. Read these files before editing:
   - `src/app/core/services/auth.service.ts`
   - `src/app/core/services/app-init.service.ts`
   - `src/app/core/state/auth.store.ts`
   - `src/app/core/interceptors/refresh-token.interceptor.ts`
   - related guards
3. Determine whether the change affects: login, refresh, app init, logout, or permission.
4. Edit with the smallest scope that still solves the problem.
5. Verify redirects and that state is fully cleared/set on transition.
6. Verify refresh-token request cannot loop.
7. Explicitly note any testing gap when backend behavior cannot be exercised.

## Success criteria
- Successful login → state + navigation correct.
- 401 path → refresh works when backend allows.
- Refresh failure → session cleared, app returns to login.
- Guards reflect current auth state + permissions accurately.

## Output
- Files changed
- Which auth scenarios were verified
- Residual risks / testing gaps
