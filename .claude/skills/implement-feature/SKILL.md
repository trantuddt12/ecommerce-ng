---
name: implement-feature
description: Use to add a new Angular page or extend an existing feature (catalog, management, auth, dashboard) end-to-end — route, component, service wiring, permission, loading/error UI. Trigger on "thêm page", "implement feature", "tạo màn hình mới", "extend catalog/management UI".
---

# Implement Feature Skill

## When to use
- Adding a new page
- Extending catalog / management / auth / dashboard
- Wiring UI to an existing service / API

## Workflow
1. Read `AI/references/project-overview.md`.
2. Read related routes and API endpoints (`app.routes.ts`, `core/constants/api-endpoints.ts`).
3. Decide which `features/<domain>/` the feature belongs to.
4. Decide whether a new route, new permission, or new service is required.
5. Reuse existing layout, shared UI, constants.
6. Edit with the smallest correct scope.
7. Verify imports, navigation, auth impact.
8. If the change shifts architecture, update `AI/references/`.

## Expected output
- List of files created/edited
- Summary of changes
- How the feature was verified

## Special checkpoints
- Route behind login → check `authGuard`.
- Route with permission → check `permissionGuard` and route `data.permissions`.
- API request → check endpoint constant and loading/error path.
