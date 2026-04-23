# AGENTS.md

## Project Snapshot

- Angular 17 standalone application (`@angular/core` 17.3.x) with SSR support (`@angular/ssr`, Express server in `server.ts`).
- Main app root: `src/app` with three top-level areas:
  - `core/` for cross-cutting concerns (auth, HTTP, interceptors, guards, layout, state, constants)
  - `features/` for domain pages (auth, catalog, management, orders, dashboard, system)
  - `shared/ui/` for reusable global UI widgets
- Uses Angular Material heavily in feature pages; many pages are single-file components with inline template + inline styles.

## Essential Commands

From repo root:

```bash
npm install
npm run start
npm run build
npm run watch
npm run test -- --watch=false --browsers=ChromeHeadless
npm run serve:ssr:ecommerce-ng
```

Notes:
- `npm run start` uses Angular dev server (`ng serve`) on default port 4200.
- Build output goes to `dist/ecommerce-ng`.
- SSR server entry runs from `dist/ecommerce-ng/server/server.mjs`.
- No ESLint/Prettier scripts were found in `package.json`.

## Architecture and Runtime Flow

## 1) Bootstrap and providers

- Client bootstrap: `src/main.ts` -> `bootstrapApplication(AppComponent, appConfig)`.
- App config: `src/app/app.config.ts` wires router, hydration, animations, HTTP interceptors, config token, and `APP_INITIALIZER`.
- Server bootstrap: `src/main.server.ts` + `src/app/app.config.server.ts` + Express host in `server.ts`.

## 2) HTTP stack (important)

All API calls are expected to go through `BaseApiService` (`src/app/core/http/base-api.service.ts`) which provides:
- base URL composition via `ApiUrlBuilder`
- timeout from environment (`requestTimeoutMs`)
- query params normalization via `HttpOptionsFactory` + `buildQueryParams`

Interceptor order is explicitly meaningful (`app.config.ts`):
1. `loadingInterceptor`
2. `credentialsInterceptor`
3. `authTokenInterceptor`
4. `refreshTokenInterceptor`
5. `errorMappingInterceptor`

Keep this order unless there is a strong reason and full regression check.

## 3) Auth/session flow

Core pieces:
- State: `AuthStore` (signals) in `src/app/core/state/auth.store.ts`
- Token persistence: `SessionService` stores access token in **sessionStorage** key `ecommerce.access-token`
- User identity mapping: `CurrentUserService`
- API auth operations: `AuthService`
- Startup auth restore/refresh: `AppInitService` via `APP_INITIALIZER`

Non-obvious behavior:
- `AppInitService.initialize()` attempts refresh even when no local access token exists (refresh via cookie-based endpoint is expected).
- Refresh dedupe is implemented with `refreshInFlight$` + `shareReplay(1)` in `AuthService`.
- `refresh-token.interceptor` skips refresh/login/sendOtp/verify/logout endpoints and retries once using header `x-refresh-attempt`.
- Route-level authorization combines role checks and permission checks in `permission.guard.ts` (`route.data.roles` and `route.data.permissions`).

## 4) Routing/layout model

- Root routes in `src/app/app.routes.ts`:
  - `home` lazy-loads `features/public/public.routes.ts`
  - `auth` uses `AuthLayoutComponent` + `guestGuard`
  - `admin` lazy-loads `features/admin/admin.routes.ts`
  - `client` lazy-loads `features/client/client.routes.ts`
- Admin/client areas are wrapped by layout components (`MainLayoutComponent`, `ClientLayoutComponent`).
- Post-login default destination is centralized in `PostLoginRouteService` and keyed off current roles/permissions.

## API Contract Gotcha (critical)

Backend may return envelope-wrapped payloads (not always plain objects/arrays). Existing code supports both by using:
- `ApiEnvelope<T>` and `unwrapApiEnvelope()` in `src/app/core/models/auth.models.ts`

When adding/changing API services:
- verify whether endpoint returns `{ data: ... }` / paged envelope / raw text
- use `postText` for text responses
- avoid assuming direct JSON payload shape at component level

## Code Organization Conventions Observed

- Naming suffixes are consistent:
  - `*.page.ts` for page components
  - `*.service.ts`, `*.guard.ts`, `*.interceptor.ts`, `*.store.ts`
- Constants in `core/constants/`:
  - paths in `app-routes.ts`
  - API paths in `api-endpoints.ts`
  - storage keys in `storage-keys.ts`
- Feature folders are domain-first (`catalog`, `management`, `order`, etc.), not technical-layer-first.
- Most feature pages do data orchestration + UI interaction directly in page component class.

## Style and Implementation Patterns

Observed patterns to preserve when editing:
- Standalone components throughout; imports declared per component.
- Mixed DI style currently exists:
  - newer code often uses `inject()`
  - some services still use constructor DI
  - follow local file style unless doing targeted refactor
- Strong TypeScript settings are enabled (`strict`, strict template checks).
- EditorConfig enforced: 2 spaces, UTF-8, final newline, single quotes in TS.
- UI text is predominantly Vietnamese; keep wording consistent with surrounding page copy.

## Testing Reality

- Test runner is Karma + Jasmine (`ng test`), not Jest/Vitest.
- Currently very low unit test coverage in repo (only `src/app/app.component.spec.ts` found).
- If you add logic-heavy services/guards/interceptors, prefer adding focused unit tests near changed code.

## Practical Gotchas for Future Agents

- Many components use inline templates/styles with large blocks; small targeted edits are safer than broad rewrites.
- Global loading and notifications are signal-driven (`LoadingService`, `NotificationService`) and surfaced at app root via `GlobalLoadingComponent` and `NotificationOutletComponent`.
- `credentialsInterceptor` only adds `withCredentials` when URL starts with configured API/search base URLs; if requests silently miss cookies, check URL construction first.
- `resolveMediaUrl` is used to normalize media links before rendering images in catalog pages.
- There is AI project documentation under `AI/` and installed external skills under `.agents/skills/`; internal project conventions should stay in `AI/`, not in `.agents/skills/`.

## High-Value Files to Read Before Major Changes

- `src/app/app.config.ts` (global providers/interceptor chain)
- `src/app/app.routes.ts` + `src/app/features/*/*.routes.ts` (route + guard wiring)
- `src/app/core/services/auth.service.ts`
- `src/app/core/services/current-user.service.ts`
- `src/app/core/services/app-init.service.ts`
- `src/app/core/http/base-api.service.ts`
- `src/app/core/constants/api-endpoints.ts`
- `AI/references/http-and-api.md` and `AI/references/conventions.md`
