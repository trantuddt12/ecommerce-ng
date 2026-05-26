# CLAUDE.md

Frontend project guide for Claude Code. Loads on demand from the workspace router or when `cd ecommerce-ng`.

Canonical conventions, build commands, and runtime flow live in @AGENTS.md.

## Auto-loaded reference

- @AGENTS.md
- @AI/CONVENTIONS.md

## Read on demand

- `AI/README.md` — how the `AI/` tree is organized
- `AI/instructions/*.md` — angular-coding-standards, audit-fe-be-guidelines, change-workflow, documentation-rules
- `AI/references/*.md` — api-inventory, auth-flow, conventions, http-and-api, project-overview, routes-and-navigation
- `AI/agents/*.md` — role contracts (mirrored as real subagents under `.claude/agents/`)
- `AI/workflows/*.md` — superseded by skills under `.claude/skills/`
- `AI/prompts/*.md` — prompt templates

## Skills registered with the harness

Located under `.claude/skills/`:
- `angular-best-practices` — Angular 17+ Signals/RxJS/SSR rules
- `angular-material` — Material components, theming, a11y
- `angular-ui-patterns` — loading/error/optimistic UI patterns
- `auth-change` — change auth/session flow
- `implement-feature` — implement a new feature end-to-end
- `review-frontend` — review FE diff before merge

## Subagents registered with the harness

Located under `.claude/agents/`:
- `frontend-architect`, `angular-implementer`, `code-reviewer`

## Progress log

Append daily work to workspace-level `../AI_PROGRESS/<YYYY-MM-DD>.md`. Do not write to legacy per-project `AI_PROGRESS.md` here.
