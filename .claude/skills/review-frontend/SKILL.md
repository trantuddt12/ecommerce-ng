---
name: review-frontend
description: Use to review an Angular PR, patch, or multi-file change before merge. Prioritizes behavior bugs, auth/route/permission regressions, API/state/loading/error gaps over style. Trigger on "review FE diff", "kiểm tra trước khi merge", "review PR Angular".
---

# Review Frontend Skill

## When to use
Reviewing PRs, patches, or multi-file frontend changes.

## Review workflow
1. Identify the scope of changed files.
2. Cross-check against `AI/instructions/angular-coding-standards.md`.
3. Review in this order:
   - Behavior bugs
   - Auth / route / permission
   - API / state / loading / error handling
   - Maintainability and conventions
4. Record findings with severity.
5. If no findings, state residual risks.

## High-alert files
- `app.routes.ts`
- `app.config.ts`
- `core/interceptors/*`
- `core/services/auth.service.ts`
- `core/services/app-init.service.ts`
- `core/state/auth.store.ts`

## Finding template
- **Finding N: <severity>** — <short description>
- File: `<path:line>`
- Reason: <why it is a problem>
- Impact: <behavior consequence>
- Suggestion: <short fix direction>
