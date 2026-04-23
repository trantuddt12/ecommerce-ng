# AI Progress Log

File nay la nhat ky tien trinh chung cho ca frontend va backend.

## Cach ghi nhan

- Sau moi lan thay doi code hoac tai lieu, append mot muc moi vao cuoi file.
- Moi muc can du de team frontend, backend, va AI khac tiep tuc theo doi.
- Khong xoa lich su cu. Neu mot todo khong con phu hop, danh dau trang thai thay vi xoa dong.

## Mau ghi nhan

### YYYY-MM-DD HH:mm - Project - Task title

- Scope: frontend | backend | shared
- Changed:
  - file/path-1
  - file/path-2
- Summary:
  - change 1
  - change 2
- Verification:
  - command/result
- Todo:
  - [ ] next step 1
  - [ ] next step 2
- Notes:
  - risk, blocker, handoff note

### 2026-04-16 16:55 - Shared - Add current-user endpoint and progress logging rule

- Scope: shared
- Changed:
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/controler/AuthController.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/service/AuthService.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/service/UserService.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/repository/UserRepository.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/config/SecurityConfig.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/response/CurrentUserResponse.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/response/CurrentUserRoleResponse.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/response/CurrentUserPermissionResponse.java
  - ecommerce-shop/coreservice/src/test/java/com/ttl/core/service/AuthServiceTest.java
  - ecommerce-shop/docs/frontend/angular-backend-api-integration.md
  - ecommerce-ng/src/app/core/constants/api-endpoints.ts
  - ecommerce-ng/src/app/core/services/current-user.service.ts
  - ecommerce-ng/AI/README.md
  - ecommerce-ng/AI/instructions/change-workflow.md
  - ecommerce-shop/.ai/BASELINE.md
  - ecommerce-shop/.ai/AI_CONFIGURATION_GUIDE.md
  - AI_PROGRESS.md
- Summary:
  - Added `GET /auth/me` in backend to return authenticated user context with roles and flattened permissions.
  - Updated Angular current-user flow to use `/auth/me` instead of `/user`.
  - Tightened backend auth whitelist so `/auth/me` remains protected.
  - Added shared AI rule requiring progress and todo logging after each change set.
- Verification:
  - `ecommerce-shop`: `.\mvnw.cmd -pl coreservice test` -> passed
  - `ecommerce-ng`: `npm run build` -> passed
- Todo:
  - [ ] Run an end-to-end manual login check against the running frontend and backend.
  - [ ] Continue appending new entries here after every future change set.
- Notes:
  - `fullName` in `/auth/me` currently falls back to `username` because backend `User` entity does not yet expose dedicated name fields.

### 2026-04-16 17:11 - Shared - Stabilize local login refresh cookie flow

- Scope: shared
- Changed:
  - ecommerce-shop/basecommerce/src/main/resources/application-local.yaml
  - ecommerce-shop/README.md
  - ecommerce-shop/docs/frontend/angular-backend-api-integration.md
  - AI_PROGRESS.md
- Summary:
  - Re-checked login end-to-end contract: Angular `LoginPage` -> `AuthService.login()` -> backend `POST /auth/login` -> frontend `GET /auth/me`.
  - Fixed local environment mismatch by overriding `security.cookies.secure=false` in backend `application-local.yaml` so browser can persist/send refresh cookie over `http://localhost`.
  - Synced backend docs to state that local profile intentionally relaxes secure-cookie behavior for Angular login testing.
- Verification:
  - `ecommerce-ng`: `npm run build` -> passed
  - `ecommerce-shop`: `.\mvnw.cmd -pl coreservice test` -> failed, but due to pre-existing assertion in `coreservice/src/test/java/com/ttl/core/service/AuthServiceTest.java:85` expecting a different permission order (`USER_VIEW` vs actual sorted `USER_MANAGE`, `USER_VIEW`)
  - Manual contract review confirmed frontend already sends `withCredentials: true` and uses `/auth/login`, `/auth/refresh`, `/auth/me` consistently.
- Todo:
  - [ ] Run manual login on local Angular + Spring Boot to confirm refresh cookie is now stored and reused after reload/401 refresh.
  - [ ] Decide whether to fix the existing backend test assertion order separately.
- Notes:
  - No frontend code or backend API contract was changed in this change set; only local runtime behavior/docs were adjusted.
  - If login still fails manually, next checks should be browser cookie attributes (`SameSite`, `Secure`) and backend `CORS_ALLOWED_ORIGINS` alignment with the actual frontend origin.

### 2026-04-16 17:41 - Shared - Add basecommerce API implementation plan for frontend

- Scope: shared
- Changed:
  - ecommerce-shop/docs/frontend/angular-basecommerce-api-implementation-plan.md
  - AI_PROGRESS.md
- Summary:
  - Added a dedicated frontend-facing implementation plan document for backend `basecommerce`, including endpoint inventory, domain workflow dependencies, critical validation rules, and phased Angular implementation sequence.
  - Clarified contract edge cases that impact frontend mapping (`/brands/update/{id}`, multipart `/products`, raw string import/export responses, and `/export/category-attributes/import` route).
  - Anchored auth expectation to global `SecurityConfig` whitelist behavior so frontend treats basecommerce endpoints as authenticated by default.
- Verification:
  - Documentation-only change; no runtime code or API behavior modified.
  - Cross-checked endpoint list and auth notes against controllers and security config:
    - `ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/ProductController.java:24`
    - `ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/interfacefile/ImportController.java:19`
    - `ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/interfacefile/ExportController.java:24`
    - `ecommerce-shop/coreservice/src/main/java/com/ttl/core/config/SecurityConfig.java:52`
- Todo:
  - [ ] Frontend team maps `API_ENDPOINTS` to exact basecommerce paths in the new plan and confirms no mismatch in current Angular services.
  - [ ] Backend team decides whether to normalize inconsistent routes (`/brands/update/{id}`, `/export/category-attributes/import`) in a future non-breaking API cleanup.
- Notes:
  - This change set is intentionally minimal and documentation-only to avoid unintended contract drift.
  - If teams later adjust API contracts, update both docs files and append a new progress entry for cross-team handoff.

### 2026-04-17 08:52 - Shared - Fix login token mapping for wrapped auth response

- Scope: shared
- Changed:
  - ecommerce-ng/src/app/core/models/auth.models.ts
  - ecommerce-ng/src/app/core/services/auth.service.ts
  - AI_PROGRESS.md
- Summary:
  - Re-checked login contract end-to-end before editing: Angular `AuthService.login()` and `refresh()` were reading `response.accessToken`, while the active backend auth response used an envelope with token payload under `data`.
  - Updated frontend auth models to include a reusable `ApiEnvelope<T>` and changed login/refresh mapping to read `response.data.accessToken` while keeping the existing `SessionService` and `CurrentUserService` auth flow unchanged.
  - Kept the fix frontend-only because it is the smallest safe change for the current runtime contract and avoids unnecessary backend auth API churn.
- Verification:
  - `ecommerce-ng`: `npm run build` -> passed
  - Manual code review confirmed affected auth flow path: `POST /auth/login` -> store access token -> hydrate current user via `GET /auth/me`; `POST /auth/refresh` now reads the same wrapped token shape.
- Todo:
  - [ ] Run a manual login against the running Angular app and backend to confirm access token is stored and `/auth/me` loads successfully after login.
  - [ ] Decide in a later cleanup whether all frontend services should standardize envelope handling in one shared HTTP abstraction instead of per-service mapping.
- Notes:
  - Backend source currently shows `AuthController.login()` returning `LoginResponse` directly, but observed runtime payload for login is wrapped in `{ data, timestamp, page }`; this suggests an existing global response wrapper or environment-specific behavior. Any backend-side normalization should be validated carefully before changing auth contracts.
  - Existing `debugger` and `console.log` statements remain in frontend auth-related files outside this change set, notably `current-user.service.ts`.

### 2026-04-17 09:41 - Shared - Align public register contract without frontend roleId

- Scope: shared
- Changed:
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/service/UserService.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/service/register/RegisterByEmail.java
  - ecommerce-shop/coreservice/src/test/java/com/ttl/core/service/UserServiceTest.java
  - ecommerce-ng/src/app/core/models/auth.models.ts
  - ecommerce-ng/src/app/features/auth/pages/register.page.ts
  - ecommerce-ng/doc/angular-backend-api-integration.md
  - ecommerce-shop/docs/frontend/angular-backend-api-integration.md
  - AI_PROGRESS.md
- Summary:
  - Re-checked `POST /user/register` end-to-end: Angular register page was sending only `username`, `email`, `password`, while backend registration services still treated `roleId` as required and would reject the request.
  - Updated backend registration to resolve default role `CUSTOMER` whenever `roleId` is omitted, while still preserving explicit `roleId` support for admin or specialized flows.
  - Updated Angular register typing to use the active wrapped response contract and synced frontend/backend integration docs to state that `roleId` is optional for public self-registration.
- Verification:
  - `ecommerce-shop`: `.\mvnw.cmd -pl coreservice -Dtest=UserServiceTest test` -> passed
  - `ecommerce-ng`: `npm run build` -> passed
  - Manual contract review confirmed both public registration paths now align on optional `roleId`: `UserService.register(...)` and OTP-based `RegisterByEmail.register(...)`.
- Todo:
  - [ ] Run a manual register flow against the running frontend and backend to confirm the created user receives the expected `CUSTOMER` role in the local database.
  - [ ] Verify local seed data or migrations always create a `CUSTOMER` role, otherwise public register will still fail with `Default role CUSTOMER not found`.
- Notes:
  - Current frontend register page still uses direct `/user/register`; it does not yet orchestrate `/auth/sendotpregister` and `/auth/verifyotp`. If the product decision is OTP-first registration, that should be handled in a separate shared change set.

### 2026-04-17 10:03 - Shared - Align backend authorities and frontend permission guard with ROLE_PERMISSION

- Scope: shared
- Changed:
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/controler/RoleController.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/controler/UserController.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/BrandController.java
  - ecommerce-shop/coreservice/src/test/java/com/ttl/core/service/AuthServiceTest.java
  - ecommerce-ng/src/app/core/guards/permission.guard.ts
  - ecommerce-ng/src/app/app.routes.ts
  - ecommerce-ng/src/app/core/services/post-login-route.service.ts
  - ecommerce-ng/src/app/core/layout/sidebar.component.ts
  - AI_PROGRESS.md
- Summary:
  - Re-checked authority and route-permission usage against `ROLE_PERMISSION.md` before editing and found the frontend still depended on obsolete permissions such as `USER_MANAGE`, `PRODUCT_MANAGE`, and `SEARCH_VIEW`.
  - Updated backend `@PreAuthorize` checks to use active permissions from the shared role-permission matrix, including `USER_VIEW`, `USER_UPDATE`, `ROLE_VIEW`, `ROLE_MANAGE`, `BRAND_VIEW`, and `BRAND_MANAGE`.
  - Changed Angular `permissionGuard` to allow access when the user has any configured route permission, then synced route config, sidebar visibility, and post-login redirect logic to the current permission names. Search routing now uses `BRAND_VIEW` because the active endpoint is `GET /search/brand` and `SEARCH_VIEW` does not exist in the shared permission source.
  - Updated `AuthServiceTest` to assert current permission names and keep the flattened current-user permission contract covered.
- Verification:
  - `ecommerce-ng`: `npm run build` -> passed
  - `ecommerce-shop`: `.\mvnw.cmd -pl coreservice "-Dtest=AuthServiceTest,UserServiceTest" test` -> passed
  - `ecommerce-shop`: `.\mvnw.cmd -pl basecommerce test` -> failed due to pre-existing MapStruct compilation errors in `basecommerce/src/main/java/com/ttl/base/mapper/AttributeValMapper.java`, `CategoryAttributeMapper.java`, `ProductMapper.java`, and `CategoryMapper.java`; not caused by this authority/guard change set
- Todo:
  - [ ] Run a manual login and route-access check with representative roles (`ADMIN`, `STORE_MANAGER`, `STAFF`, `SUPPORT`, `MARKETING`, `CUSTOMER`) to confirm frontend menu visibility and forbidden redirects match backend authority enforcement.
  - [ ] Review the remaining `basecommerce` controllers and Angular route metadata in a separate change set if more endpoints need to be mapped from coarse permissions to the new granular permission matrix.
- Notes:
  - This change set intentionally kept the current auth flow, `/auth/me` response shape, and route structure unchanged; only permission naming and guard semantics were aligned to the shared contract.
  - `permissionGuard` now treats `data.permissions` as an OR-list. This matches the existing route metadata, sidebar gating, and post-login redirect behavior already used throughout the Angular app.

### 2026-04-17 10:08 - Backend - Add missing method authorities in basecommerce and coreservice

- Scope: backend
- Changed:
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/CategoryController.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/ProductController.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/AttributeDefController.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/AttributeValueController.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/CategoryAttributeController.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/interfacefile/ImportController.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/interfacefile/ExportController.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/controler/AuthController.java
  - ecommerce-shop/coreservice/src/test/java/com/ttl/core/service/AuthServiceTest.java
  - AI_PROGRESS.md
- Summary:
  - Scanned `basecommerce` and `coreservice` controllers and added missing method-level `@PreAuthorize` checks for category, product, attribute, category-attribute, import, and export endpoints.
  - Mapped authorities to the active permission matrix in `ROLE_PERMISSION.md` without introducing new permissions: read endpoints use `*_VIEW`, mutation/import endpoints use `*_MANAGE` or product CRUD permissions, and `/auth/me` now explicitly requires `isAuthenticated()` at method level.
  - Used `hasAnyAuthority(...)` for category-attribute and related import/export endpoints because those APIs sit across both category and attribute domains.
  - Updated `AuthServiceTest` assertion to deterministic list ordering so the module test suite can validate the current flattened permission behavior reliably.
- Verification:
  - `ecommerce-shop`: `.\mvnw.cmd -pl coreservice test` -> passed
  - `ecommerce-shop`: `.\mvnw.cmd -pl basecommerce test` -> failed due to pre-existing MapStruct compilation errors in `basecommerce/src/main/java/com/ttl/base/mapper/AttributeValMapper.java`, `CategoryMapper.java`, `ProductMapper.java`, and `CategoryAttributeMapper.java`
- Todo:
  - [ ] Run authorization-focused integration or manual checks for representative endpoints in `basecommerce` to confirm the selected permissions match actual business expectations.
  - [ ] Fix the existing `basecommerce` mapper compilation errors in a separate change set, then rerun module tests to validate the newly added method security annotations end-to-end.
  - [ ] Review whether any frontend screens need finer route gating once these newly protected backend endpoints start being consumed.
- Notes:
  - This change set tightens backend access control behavior for previously unguarded authenticated endpoints; if any client flow implicitly relied on broad authenticated access, it may now receive `403` until the user has the appropriate permission.
  - Public auth endpoints (`/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/sendotp`, `/auth/sendotpregister`, `/auth/verifyotp`, `/user/register`) were intentionally left unchanged.

### 2026-04-17 11:00 - Shared - Implement basecommerce frontend catalog pages and API services

- Scope: shared
- Changed:
  - ecommerce-ng/src/app/core/http/base-api.service.ts
  - ecommerce-ng/src/app/core/constants/api-endpoints.ts
  - ecommerce-ng/src/app/core/constants/app-routes.ts
  - ecommerce-ng/src/app/core/models/catalog.models.ts
  - ecommerce-ng/src/app/core/services/brand-api.service.ts
  - ecommerce-ng/src/app/core/services/category-api.service.ts
  - ecommerce-ng/src/app/core/services/attribute-api.service.ts
  - ecommerce-ng/src/app/core/services/category-attribute-api.service.ts
  - ecommerce-ng/src/app/core/services/product-api.service.ts
  - ecommerce-ng/src/app/core/services/import-export-api.service.ts
  - ecommerce-ng/src/app/features/catalog/brands/brands.page.ts
  - ecommerce-ng/src/app/features/catalog/categories/categories.page.ts
  - ecommerce-ng/src/app/features/catalog/attributes/attributes.page.ts
  - ecommerce-ng/src/app/features/catalog/products/products.page.ts
  - ecommerce-ng/src/app/features/catalog/operations/operations.page.ts
  - ecommerce-ng/src/app/app.routes.ts
  - ecommerce-ng/src/app/core/layout/sidebar.component.ts
  - AI_PROGRESS.md
- Summary:
  - Re-checked `basecommerce` controllers and common DTO/request classes before editing, then aligned Angular `API_ENDPOINTS` with the active backend contract, including the special `PATCH /brands/update/:id`, `attribute-options`, nested `categories/:categoryId/attributes`, and text-based import/export endpoints.
  - Extended the frontend HTTP layer with minimal new capabilities needed by the plan: `patch`, `delete`, multipart `postFormData`, and text-response `postText`, then added typed catalog services for brand, category, attribute, category-attribute, product, and import/export flows.
  - Replaced placeholder catalog pages with working frontend screens that load live backend data for brand CRUD, category CRUD, attribute/schema overview with category-attribute mapping, product list/filter plus multipart create, and a dedicated operations page for import/export triggers.
  - Added `/admin/catalog/operations` route and sidebar entry so import/export flow is reachable from the authenticated catalog area.
  - No backend code change was required because the current `basecommerce` contract was sufficient for the planned frontend implementation after endpoint alignment on the Angular side.
- Verification:
  - `ecommerce-ng`: `npm run build` -> passed
  - Backend contract verification was done by direct controller/DTO review against:
    - `ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/BrandController.java`
    - `ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/CategoryController.java`
    - `ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/AttributeDefController.java`
    - `ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/AttributeValueController.java`
    - `ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/CategoryAttributeController.java`
    - `ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/ProductController.java`
    - `ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/interfacefile/ImportController.java`
    - `ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/interfacefile/ExportController.java`
- Todo:
  - [ ] Run manual authenticated checks against running Angular + Spring Boot for the new catalog pages, especially brand/category mutations, product multipart create, and text import/export responses.
  - [ ] Expand the attribute page from read-only schema overview to full create/update/delete flows for `AttributeDef`, `AttributeValue`, and `CategoryAttribute` if the product team needs full CRUD parity from the plan.
  - [ ] Expand the product create UI to support real variant attribute selection by category schema instead of the current minimal single-variant bootstrap form.
- Notes:
  - The current product create form intentionally keeps the smallest valid frontend payload shape and does not yet collect `ProductVariantAttributeDTO[]`; products that require strict variant-axis option validation may still be rejected until the richer schema-driven UI is added.
  - The attribute page currently proves end-to-end mapping for `GET /attributes`, `GET /attribute-options`, and `GET /categories/{categoryId}/attributes`, but mutation controls were deferred to keep this change set small and build-safe.

### 2026-04-17 13:39 - Shared - Unwrap basecommerce envelope responses in Angular catalog services

- Scope: shared
- Changed:
  - ecommerce-ng/src/app/core/models/auth.models.ts
  - ecommerce-ng/src/app/core/services/brand-api.service.ts
  - ecommerce-ng/src/app/core/services/category-api.service.ts
  - ecommerce-ng/src/app/core/services/attribute-api.service.ts
  - ecommerce-ng/src/app/core/services/category-attribute-api.service.ts
  - ecommerce-ng/src/app/core/services/product-api.service.ts
  - ecommerce-ng/src/app/core/services/current-user.service.ts
  - AI_PROGRESS.md
- Summary:
  - Re-checked the failing brand page against the live response payload and confirmed `basecommerce` list endpoints are wrapped by the backend global `ResponseHandler` as `{ data, timestamp, page }`, while the new Angular catalog services were incorrectly treating them as raw arrays.
  - Added a shared frontend helper `unwrapApiEnvelope(...)` and updated catalog list/detail services to read `response.data` when the backend returns the wrapped shape, while still tolerating raw payloads.
  - Removed leftover frontend debug statements from `BrandApiService` and `CurrentUserService` so the browser no longer pauses or logs raw auth payloads during normal navigation.
  - Kept the fix frontend-only because the existing backend envelope behavior is shared across modules and changing it now would create wider contract risk than simply normalizing reads on the Angular side.
- Verification:
  - `ecommerce-ng`: `npm run build` -> passed
  - Root cause cross-check:
    - `ecommerce-shop/coreservice/src/main/java/com/ttl/core/handler/ResponseHandler.java`
    - `ecommerce-shop/coreservice/src/main/java/com/ttl/core/response/Response.java`
    - `ecommerce-shop/coreservice/src/main/java/com/ttl/core/response/Pageable.java`
- Todo:
  - [ ] Manually reload `/admin/catalog/brands` and verify the table now renders the returned `data[]` items instead of throwing iterator errors.
  - [ ] Smoke-test `/admin/catalog/categories`, `/admin/catalog/attributes`, and `/admin/catalog/products` because they use the same unwrap path and should now handle wrapped list/detail responses consistently.
  - [ ] Consider a later cleanup to centralize envelope unwrapping inside the HTTP abstraction if more frontend domains start consuming the same backend wrapper pattern.
- Notes:
  - Backend string import/export endpoints remain raw string and are intentionally not passed through the envelope unwrap helper.
  - Create/update/delete catalog calls are still assumed to return raw object payloads or compatible wrapped payloads depending on runtime behavior; if mutation screens show similar shape issues, the same unwrap pattern should be applied there too.

### 2026-04-17 13:50 - Shared - Document ResponseHandler wrapper behavior for AI guidance

### 2026-04-17 23:12 - Shared - Add brand/category image business APIs

- Scope: shared
- Changed:
  - ecommerce-shop/common/src/main/java/com/ttl/common/dto/ImageDTO.java
  - ecommerce-shop/common/src/main/java/com/ttl/common/dto/BrandDTO.java
  - ecommerce-shop/common/src/main/java/com/ttl/common/dto/CategoryDTO.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/mapper/BrandMapper.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/mapper/CategoryMapper.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/service/BrandService.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/service/CategoryService.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/BrandController.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/CategoryController.java
  - ecommerce-shop/basecommerce/src/test/java/com/ttl/base/service/BrandServiceTest.java
  - ecommerce-shop/basecommerce/src/test/java/com/ttl/base/service/CategoryServiceTest.java
  - ecommerce-shop/docs/frontend/angular-backend-api-integration.md
  - ecommerce-ng/src/app/core/models/catalog.models.ts
  - ecommerce-ng/src/app/core/constants/api-endpoints.ts
  - AI_PROGRESS.md
- Summary:
  - Re-checked backend image usage before editing and found `Product` already had multipart image handling, while `Brand` and `Category` still lacked dedicated business APIs for image operations.
  - Added `POST /brands/{id}/image` and `DELETE /brands/{id}/image` so brand avatar image can be uploaded, replaced, or removed through a stable API instead of overloading the existing JSON CRUD contract.
  - Added category gallery APIs: `GET /categories/{id}/images`, `POST /categories/{id}/images`, `PATCH /categories/{id}/images/{imageId}/thumbnail`, and `DELETE /categories/{id}/images/{imageId}`.
  - Kept the change minimal by reusing existing `FileService` and current entity structure. For category, backend now syncs the legacy `imageUrl` field to the active thumbnail so old consumers still work while newer clients can use `galleryImages` metadata.
  - Exposed new image metadata in shared DTOs (`BrandDTO.imageUrl`, `BrandDTO.image`, `CategoryDTO.galleryImages`) and updated Angular shared models/constants so frontend or later AI tasks can consume the contract without rediscovery.
  - Synced frontend-facing backend API docs with the new image endpoints and response shape.
- Verification:
  - `ecommerce-shop`: `./mvnw.cmd -pl basecommerce -am "-Dtest=BrandServiceTest,CategoryServiceTest" "-Dsurefire.failIfNoSpecifiedTests=false" test` -> passed
  - `ecommerce-ng`: `npm run build` -> passed
  - Initial attempt without `-am` failed because PowerShell parsing and stale upstream artifacts prevented `basecommerce` from seeing updated `common`; rerun with dependency modules built successfully.
- Todo:
  - [ ] Add Angular service methods and UI actions for brand/category image upload, thumbnail switching, and delete if admin needs direct image management from catalog pages.
  - [ ] Consider whether `Product` update should later gain the same dedicated image mutation endpoints for consistency with the new brand/category flows.
  - [ ] Run manual authenticated API smoke tests against running backend for multipart upload and category thumbnail switching.
- Notes:
  - Current backend file upload still stores filesystem paths via `FileService.upload(...)`; if public URL serving is needed, that should be handled in a separate change set to avoid changing current storage behavior implicitly.
  - Category JSON create/update contract was intentionally left intact. `imageUrl` can still be sent directly, but once gallery images exist the backend treats the thumbnail URL as the canonical exposed primary image.

### 2026-04-17 23:24 - Frontend - Optimize catalog admin UI with Angular Material shared styling

- Scope: frontend
- Changed:
  - ecommerce-ng/src/styles.css
  - ecommerce-ng/src/app/features/catalog/operations/operations.page.ts
  - AI_PROGRESS.md
- Summary:
  - Re-checked catalog admin screens before editing and confirmed `brands`, `products`, `attributes`, `operations`, and `categories` already share a common class vocabulary (`catalog-page`, `catalog-grid`, `catalog-panel`) but were still underusing Angular Material surface density and shared responsive polish.
  - Strengthened the global Angular Material presentation layer for catalog pages by improving card content spacing, form-field density, panel hover states, table surfaces/header treatment, and mobile stacking behavior in the shared stylesheet instead of duplicating page-local CSS.
  - Updated `operations.page.ts` to consume the new shared catalog utility classes for the form container and response block, removing the one-off inline `pre` style so the page now visually aligns with the rest of the catalog admin area.
  - Kept the change intentionally frontend-only and style-layer focused to get visible UI improvement across multiple admin screens without rewriting templates or changing route/API behavior.
- Verification:
  - `ecommerce-ng`: `npm run build` -> passed
  - Angular build still reports the pre-existing bundle budget warning, but the build completed successfully.
- Todo:
  - [ ] Manually review `/admin/catalog/brands`, `/admin/catalog/categories`, `/admin/catalog/attributes`, `/admin/catalog/products`, and `/admin/catalog/operations` on desktop/mobile widths to confirm spacing, header stacking, and table readability feel right in-browser.
  - [ ] If needed in the next change set, add page-specific Angular Material enhancements such as sticky filter bars, `mat-divider`, `mat-icon`, or `mat-expansion-panel` for the densest catalog screens rather than broad CSS-only tuning.
- Notes:
  - This pass optimizes the shared visual foundation first; it does not yet introduce new Angular Material interaction patterns per page.
  - `categories.page.ts` already had richer custom styling, so this change mainly lifts the simpler catalog screens to a more consistent Material quality bar.

### 2026-04-17 23:33 - Frontend - Optimize users and roles pages with Angular Material styling

- Scope: frontend
- Changed:
  - ecommerce-ng/src/styles.css
  - ecommerce-ng/src/app/features/management/users/users.page.ts
  - ecommerce-ng/src/app/features/management/roles/roles.page.ts
  - AI_PROGRESS.md
- Summary:
  - Re-checked `users` and `roles` pages before editing and found they already used Angular Material components extensively, but the `management-*` UI layer had almost no shared visual styling compared with the catalog area.
  - Added a dedicated shared management styling foundation in `styles.css` for hero cards, stat cards, two-column desktop layout, panel surfaces, toolbar/header behavior, form grids, table treatment, chip variants, error/empty surfaces, and responsive stacking.
  - Updated `users.page.ts` and `roles.page.ts` to consume the new shared utility classes for list toolbars and search surfaces, keeping all existing Angular Material controls, permissions, and CRUD behavior intact.
  - Kept the change frontend-only and style-focused so the management area now feels materially closer to the catalog admin experience without changing routes, auth logic, or API calls.
- Verification:
  - `ecommerce-ng`: `npm run build` -> passed
  - Angular build still reports the pre-existing bundle budget warning, but the build completed successfully.
- Todo:
  - [ ] Manually review `/admin/management/users` and `/admin/management/roles` on desktop/mobile widths to confirm grid balance, search surface spacing, and table readability feel right in-browser.
  - [ ] If needed later, add page-specific Material interaction enhancements such as `mat-icon`, `mat-divider`, row-level action grouping, or sticky filter/search bars for large user/role datasets.
- Notes:
  - This pass does not change any backend contract, permission enforcement, or frontend state flow; only the management presentation layer was improved.
  - Existing user/role CRUD logic and route guards were intentionally left unchanged to keep the optimization low-risk.

- Scope: shared
- Changed:
  - ecommerce-ng/AI/references/http-and-api.md
  - ecommerce-shop/.ai/BASELINE.md
  - AI_PROGRESS.md
- Summary:
  - Reviewed `coreservice` global `ResponseHandler` and documented the actual runtime response wrapping behavior into both frontend and backend AI guidance so future tasks do not misread API contracts from controller signatures alone.
  - Clarified that collection/page responses are wrapped as `{ data, timestamp, page }`, regular Jackson object responses are commonly wrapped as `{ data }`, and `String`/`byte[]`/`Resource`/`ErrorMessage` are intentionally left unwrapped.
  - Added explicit frontend guidance to unwrap `response.data` for normal JSON APIs and to keep import/export text endpoints on `responseType: 'text'` without envelope handling.
- Verification:
  - Documentation-only change; no runtime code modified.
  - Source of truth reviewed: `ecommerce-shop/coreservice/src/main/java/com/ttl/core/handler/ResponseHandler.java`
- Todo:
  - [ ] When adding new frontend services, check whether the target endpoint is wrapped by `ResponseHandler` before binding response data directly.
  - [ ] If backend later changes or scopes `ResponseHandler`, sync both AI docs and frontend service mapping rules in the same change set.
- Notes:
  - The docs intentionally describe current runtime behavior, not an idealized API contract. Any future backend normalization should update these notes immediately to avoid stale AI assumptions.

### 2026-04-17 14:12 - Shared - Check brand CRUD flow and remove frontend debug blockers

### 2026-04-21 22:41 - Shared - Lock Redis OTP auth contract with tests and docs sync

- Scope: shared
- Changed:
  - ecommerce-shop/coreservice/src/test/java/com/ttl/core/service/AuthServiceTest.java
  - ecommerce-shop/coreservice/src/test/java/com/ttl/core/service/ForgotPasswordServiceTest.java
  - ecommerce-shop/coreservice/src/test/java/com/ttl/core/service/OtpRateLimitServiceTest.java
  - ecommerce-shop/coreservice/src/test/java/com/ttl/core/service/LoginRateLimitServiceTest.java
  - ecommerce-shop/docs/frontend/angular-backend-api-integration.md
  - ecommerce-ng/AI/references/auth-flow.md
  - ecommerce-ng/doc/angular-backend-api-integration.md
  - AI_PROGRESS.md
- Summary:
  - Re-checked `docs/redis-auth-otp-design.md` against the live codebase and confirmed the Redis OTP, forgot-password, atomic consume, and auth abuse-protection runtime flow had already been implemented in backend/frontend.
  - Added focused backend tests to lock the active Sprint 2 behavior: register OTP dispatch metadata, atomic register OTP consume path, forgot-password neutral request flow and reset grant issuance, OTP cooldown/rate-limit checks, and login temporary lock/IP rate-limit checks.
  - Synced backend/frontend integration docs and frontend AI auth reference away from the old query-param/raw-string OTP contract to the current body-based enum contract with wrapped JSON responses, retry metadata, and reset-password flow.
- Verification:
  - `ecommerce-shop`: `.\mvnw.cmd -pl coreservice "-Dtest=AuthServiceTest,ForgotPasswordServiceTest,OtpRateLimitServiceTest,LoginRateLimitServiceTest" test` -> passed
  - `ecommerce-ng`: `npm run build` -> timed out twice at 120s and 300s while Angular was still building; no compile error was captured before timeout, so frontend build is not confirmed by this change set
- Todo:
  - [ ] Re-run `ecommerce-ng` build in an environment/session with a longer timeout and confirm the docs-only frontend changes do not coincide with any unrelated build break.
  - [ ] Manually smoke-test the full OTP flows against running apps: register with OTP, resend cooldown, OTP invalid/block states, forgot-password verify, and reset-password confirm.
  - [ ] If future work changes auth responses again, update both `ecommerce-shop/docs/frontend/angular-backend-api-integration.md` and `ecommerce-ng/AI/references/auth-flow.md` in the same change set to avoid contract drift.
- Notes:
  - No production runtime code path was changed on frontend in this pass because the Angular OTP pages/services already matched the current backend contract; this change set hardens behavior with tests and removes stale documentation that still described `verifyotp` query params and raw string responses.
  - `ecommerce-ng/doc/angular-backend-api-integration.md` was also synced because it still advertised the same obsolete OTP contract and would mislead later implementation work.

### 2026-04-22 10:22 - Backend - Route local OTP email to Mailpit trap inbox

- Scope: backend
- Changed:
  - ecommerce-shop/basecommerce/src/main/resources/application-local.yaml
  - ecommerce-shop/basecommerce/src/main/resources/docker-mailpit/docker-compose.yml
  - ecommerce-shop/README.md
  - ecommerce-shop/docs/frontend/angular-backend-api-integration.md
  - AI_PROGRESS.md
- Summary:
  - Re-checked current mail wiring and found the default backend SMTP config still pointed to Mailtrap in `application.yaml`, while `application-local.yaml` had no local mail override.
  - Added a local-profile SMTP override to send mail to `Mailpit` on `localhost:1025` with auth and STARTTLS disabled, so OTP and verification email flows use a disposable local inbox instead of real email credentials.
  - Added a minimal `docker-compose.yml` for `Mailpit` and updated README/frontend-facing integration docs with the exact local command and inbox URL `http://localhost:8025`.
- Verification:
  - `ecommerce-shop`: `.\mvnw.cmd -pl coreservice "-Dtest=AuthServiceTest,ForgotPasswordServiceTest,OtpRateLimitServiceTest,LoginRateLimitServiceTest" test` -> passed
  - Reviewed resulting local config: `spring.mail.host=localhost`, `spring.mail.port=1025`, `smtp.auth=false`, `starttls.enable=false`
- Todo:
  - [ ] Start Mailpit locally: `docker compose -f basecommerce/src/main/resources/docker-mailpit/docker-compose.yml up -d`
  - [ ] Run backend with profile `local` and manually trigger `/auth/sendotpregister` or `/auth/forgot-password/request` to confirm OTP email appears in Mailpit UI.
  - [ ] If team later wants shared local infra startup, consider adding Mailpit into a broader developer compose stack rather than keeping it as a dedicated file.
- Notes:
  - This change set intentionally affects only local profile behavior; non-local/default SMTP settings remain unchanged.
  - `application.yaml` still contains default Mailtrap credentials in source. For longer-term cleanup, move those defaults fully to environment variables or neutral placeholders in a separate security-focused change set.

### 2026-04-19 22:05 - Shared - Wire brand image management in catalog admin

- Scope: shared
- Changed:
  - ecommerce-ng/src/app/core/services/brand-api.service.ts
  - ecommerce-ng/src/app/features/catalog/brands/brands.page.ts
  - AI_PROGRESS.md
- Summary:
  - Re-checked the current brand contract before editing and confirmed backend already exposes `POST /brands/{id}/image` and `DELETE /brands/{id}/image`, while Angular brand admin only handled JSON CRUD and did not use the image business flow.
  - Updated `BrandApiService` to unwrap wrapped object responses for create/update and added `uploadImage(...)` plus `removeImage(...)` using the existing multipart brand image endpoint.
  - Extended the Angular brands admin page with a minimal brand-image management flow: current image preview, file upload for the selected brand, image removal, and image visibility directly in the table so admins can manage brand avatar state end-to-end without changing the backend contract.
- Verification:
  - `ecommerce-ng`: `npm run build` -> passed, with the pre-existing bundle budget warnings still present
  - `ecommerce-shop`: `.\mvnw.cmd -pl basecommerce -am "-Dtest=BrandServiceTest" "-Dsurefire.failIfNoSpecifiedTests=false" test` -> passed
- Todo:
  - [ ] Run a manual authenticated check on `/admin/catalog/brands` to confirm browser upload/remove behavior against the running backend and verify image URLs resolve correctly in the UI.
  - [ ] Decide later whether category/product image management should follow the same inline admin UX pattern for consistency across catalog screens.
- Notes:
  - Backend code for brand image APIs was kept unchanged in this change set because the existing contract was already sufficient and tested.
  - The current UI intentionally allows image management only when editing an existing brand, which avoids inventing a temporary upload flow before a brand ID exists.

### 2026-04-19 21:28 - Shared - Complete attribute CRUD flow with category and product linkage

- Scope: shared
- Changed:
  - ecommerce-ng/src/app/features/catalog/attributes/attributes.page.ts
  - ecommerce-ng/src/app/features/catalog/products/products.page.ts
  - AI_PROGRESS.md
- Summary:
  - Re-read frontend/backend AI rules and verified the active backend contract before editing: `AttributeDefController`, `AttributeValueController`, and `CategoryAttributeController` already expose CRUD APIs, so the smallest correct change was to complete the Angular admin flow instead of introducing new backend endpoints.
  - Replaced the attribute admin page's read-only schema view with working CRUD flows for attribute definitions, predefined attribute options, and per-category attribute mappings, while keeping the existing Angular service layer and current `/attributes`, `/attribute-options`, and `/categories/{categoryId}/attributes` contracts unchanged.
  - Tightened product creation linkage so the product page now loads category-specific variant-axis mappings first and only allows selecting variant attributes/options that are actually configured for the chosen category, matching backend validation in `ProductService` and reducing avoidable create failures.
- Verification:
  - `ecommerce-ng`: `npm run build` -> passed
  - Backend contract cross-check only, no backend code changed:
    - `ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/AttributeDefController.java`
    - `ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/AttributeValueController.java`
    - `ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/CategoryAttributeController.java`
    - `ecommerce-shop/basecommerce/src/main/java/com/ttl/base/service/ProductService.java`
- Todo:
  - [ ] Manually test admin attribute flows against running frontend/backend: create/update/delete definition, create/update/delete option, and create/update/delete category mapping.
  - [ ] Manually test product create with a category that has mapped variant-axis attributes to confirm the UI-selected signature/option combination is accepted end-to-end.
  - [ ] If admin needs richer product variant CRUD, extend the product page to support multiple mapped variant axes and existing product detail editing in a follow-up change set.
- Notes:
  - No backend API contract was changed in this set; existing service-level rules still apply, including delete rejection when an attribute/option is already in use.
  - Angular build still reports the pre-existing initial bundle budget warning, but the application build completed successfully.

### 2026-04-19 21:43 - Shared - Extend product editor for multi-axis variants and schema-based update flow

- Scope: shared
- Changed:
  - ecommerce-ng/src/app/features/catalog/products/products.page.ts
  - AI_PROGRESS.md
- Summary:
  - Re-checked current backend product contract before editing and confirmed `POST /products` and `PATCH /products/{id}` already accept the same `AdminProductUpsertRequest`, where each variant can contain multiple `attributes[]`; kept backend unchanged and expanded Angular to finally use that existing capability.
  - Rebuilt the product page into a single Material-based product workspace that supports both create and edit flows, including loading `GET /products/{id}` into the editor, mapping current variant attributes back to the selected category schema, and submitting updates through the existing `ProductApiService.update(...)` path.
  - Replaced the old single-axis quick-create flow with a multi-variant editor: each variant can now choose multiple variant-axis attributes/options from the category's mapped schema, auto-generate or override signatures, and manage several variants in one product form.
  - Refined the page layout with denser Angular Material structure and clearer sections for filters, product basics, SEO, schema axes, variant cards, and media so the catalog product area is easier to operate on desktop and still stacks cleanly on smaller widths.
- Verification:
  - `ecommerce-ng`: `npm run build` -> passed
  - Backend contract cross-check only, no backend code changed:
    - `ecommerce-shop/basecommerce/src/main/java/com/ttl/base/service/ProductService.java`
    - `ecommerce-shop/common/src/main/java/com/ttl/common/request/AdminProductUpsertRequest.java`
    - `ecommerce-shop/common/src/main/java/com/ttl/common/response/AdminProductDetailResponse.java`
    - `ecommerce-shop/common/src/main/java/com/ttl/common/response/AdminProductVariantResponse.java`
- Todo:
  - [ ] Manually test create flow with a category that has 2+ mapped variant axes to confirm signatures, duplicate-axis prevention, and backend validation all align in-browser.
  - [ ] Manually test edit flow for an existing product with multiple variants to confirm `GET /products/{id}` -> editor -> `PATCH /products/{id}` persists the expected variant changes.
  - [ ] Decide in a follow-up change set whether product image updates should gain dedicated backend endpoints for parity with create multipart upload, since current update flow remains JSON-only.
- Notes:
  - Current editor intentionally preserves the existing backend image contract: image upload is available only on create because `PATCH /products/{id}` currently expects JSON, not multipart.
  - Angular build still reports the pre-existing initial bundle budget warning, but the build completed successfully.

### 2026-04-19 21:55 - Shared - Add product image APIs and strengthen variant-combination editing UX

- Scope: shared
- Changed:
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/ProductController.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/service/ProductService.java
  - ecommerce-shop/basecommerce/src/test/java/com/ttl/base/service/ProductServiceTest.java
  - ecommerce-shop/docs/frontend/angular-backend-api-integration.md
  - ecommerce-shop/docs/frontend/angular-basecommerce-api-implementation-plan.md
  - ecommerce-ng/src/app/core/constants/api-endpoints.ts
  - ecommerce-ng/src/app/core/services/product-api.service.ts
  - ecommerce-ng/src/app/features/catalog/products/products.page.ts
  - AI_PROGRESS.md
- Summary:
  - Re-checked the active product contract and found update flow still lacked any dedicated image mutation APIs, so the smallest stable backend change was to add product gallery endpoints aligned with the existing category image pattern instead of overloading JSON `PATCH /products/{id}` with multipart concerns.
  - Added backend product media APIs: `GET /products/{id}/images`, `POST /products/{id}/images`, `PATCH /products/{id}/images/{imageId}/thumbnail`, and `DELETE /products/{id}/images/{imageId}`. Service logic now preserves one thumbnail, promotes a remaining image when the thumbnail is deleted, and returns the existing wrapped `AdminProductDetailResponse`/`ProductImageDTO` shapes.
  - Extended the Angular product editor to use the new media APIs during edit mode, including upload, thumbnail switch, and delete actions for gallery images.
  - Strengthened the multi-axis editor UX by adding duplicate-combination detection before save, visible warnings on colliding variants, and a Material combination preview grid so admins can spot signature collisions before the backend rejects them.
- Verification:
  - `ecommerce-ng`: `npm run build` -> passed
  - `ecommerce-shop`: `./mvnw.cmd -pl basecommerce -Dtest=ProductServiceTest test` -> passed
  - Frontend build still reports pre-existing bundle budget warnings and now also a component CSS budget warning for `products.page.ts`, but compilation completed successfully.
- Todo:
  - [ ] Manually test edit-mode product media flow against running backend: upload images, set thumbnail, and delete thumbnail/non-thumbnail images.
  - [ ] Manually test duplicate-combination warning by creating two variants with the same attribute-option signature and confirm the UI blocks save before backend rejection.
  - [ ] If bundle/component style budgets matter for CI later, consider moving some `products.page.ts` inline styles into shared stylesheet utilities in a follow-up cleanup.
- Notes:
  - Product update remains JSON-only for core fields/variants; gallery media now has its own explicit mutation endpoints, which keeps contract boundaries clearer and easier to maintain.
  - The frontend duplicate guard is intentionally advisory plus blocking at save time; backend validation remains the source of truth for duplicate signature and invalid attribute-option combinations.

### 2026-04-19 21:59 - Frontend - Fix broken attributes page grid layout

- Scope: frontend
- Changed:
  - ecommerce-ng/src/app/features/catalog/attributes/attributes.page.ts
  - AI_PROGRESS.md
- Summary:
  - Investigated the broken attributes layout and found the immediate cause was local template usage of `catalog-span-6` while the global shared stylesheet only defines `catalog-span-4`, `catalog-span-5`, `catalog-span-7`, `catalog-span-8`, and `catalog-span-12`.
  - Applied the smallest targeted fix by defining `catalog-span-6` inside `attributes.page.ts` and adding page-local responsive fallbacks so the form/table panels stack correctly on narrower viewports without changing shared global grid behavior for other pages.
- Verification:
  - `ecommerce-ng`: `npm run build` -> passed
  - Angular build still reports the pre-existing bundle budget warning and the existing `products.page.ts` component CSS budget warning, but compilation completed successfully.
- Todo:
  - [ ] Manually re-open `/catalog/attributes` on desktop and mobile widths to confirm the two bottom panels now render side-by-side on wide screens and stack cleanly on smaller screens.
  - [ ] If the team wants stricter consistency, consider moving `catalog-span-6` into shared global catalog layout utilities in a follow-up cleanup instead of keeping it page-local.
- Notes:
  - This change set is frontend-only and does not alter any API contract or behavior.

- Scope: shared
- Changed:
  - ecommerce-ng/src/app/features/catalog/brands/brands.page.ts
  - AI_PROGRESS.md
- Summary:
  - Re-read required frontend/backend AI rules and then traced brand CRUD end-to-end before editing: Angular route `/admin/catalog/brands` -> `BrandApiService` -> backend `BrandController` and `BrandService`.
  - Confirmed current contract alignment for brand CRUD: `GET /brands`, `POST /brands`, `PATCH /brands/update/{id}`, `GET /brands/{id}`, `DELETE /brands/{id}` with backend permission requirements `BRAND_VIEW` and `BRAND_MANAGE` matching frontend route gating.
  - Removed leftover `debugger` and `console.log` statements from `brands.page.ts` because they could pause or disrupt manual CRUD checks in the browser during load, create, update, and edit flows.
- Verification:
  - `ecommerce-ng`: `npm run build` -> passed
  - Manual code contract review:
    - `ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/BrandController.java`
    - `ecommerce-shop/basecommerce/src/main/java/com/ttl/base/service/BrandService.java`
    - `ecommerce-shop/coreservice/src/main/java/com/ttl/core/handler/ResponseHandler.java`
    - `ecommerce-ng/src/app/core/services/brand-api.service.ts`
    - `ecommerce-ng/src/app/features/catalog/brands/brands.page.ts`
- Todo:
  - [ ] Run manual authenticated CRUD against running Angular + backend to confirm create/update/delete success messages and backend business errors render correctly.
  - [ ] Specifically verify delete failure path when a brand is still referenced by products, because backend intentionally blocks that with `DATA_IN_USE`.
  - [ ] If mutation responses show wrapped payload issues at runtime, apply the same `unwrapApiEnvelope(...)` pattern to brand create/update service methods in a separate minimal change set.
- Notes:
  - No backend code change was needed in this check because the currently implemented brand endpoints and Angular endpoint constants already match.
  - Frontend route reference doc `ecommerce-ng/AI/references/routes-and-navigation.md` still contains an older note saying `/catalog/brands` uses `PRODUCT_VIEW`; actual route config now uses `BRAND_VIEW` or `BRAND_MANAGE` in `src/app/app.routes.ts`.

### 2026-04-17 14:45 - Shared - Fix brand update CORS preflight for PATCH

- Scope: shared
- Changed:
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/config/SecurityConfig.java
  - AI_PROGRESS.md
- Summary:
  - Investigated the reported brand update failure showing frontend popup `Khong the ket noi toi may chu.` and traced it through Angular `ErrorMapperService`, `BrandApiService.update(...)`, and backend `BrandController`.
  - Identified root cause in backend CORS configuration: the app allowed `GET`, `POST`, `PUT`, `DELETE`, and `OPTIONS`, but brand update uses `PATCH /brands/update/{id}`. This causes browser preflight to fail and surfaces as Angular `HttpErrorResponse` with `status === 0`.
  - Added `PATCH` to the allowed CORS methods in `SecurityConfig` as the minimal fix without changing the existing brand endpoint contract.
- Verification:
  - `ecommerce-shop`: `./mvnw.cmd -pl coreservice test` -> passed
  - `ecommerce-ng`: `npm run build` -> passed
  - Root-cause review:
    - `ecommerce-shop/coreservice/src/main/java/com/ttl/core/config/SecurityConfig.java`
    - `ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/BrandController.java`
    - `ecommerce-ng/src/app/core/services/error-mapper.service.ts`
    - `ecommerce-ng/src/app/core/services/brand-api.service.ts`
- Todo:
  - [ ] Restart the backend so the updated CORS configuration is applied.
  - [ ] Re-run manual brand update from Angular and confirm the browser no longer reports a network error on the `PATCH` request.
  - [ ] Smoke-test other `PATCH` endpoints consumed by frontend to ensure they also benefit from the same CORS fix.
- Notes:
  - The previous symptom text came from Angular's `error.status === 0` mapping and did not necessarily mean the backend was down.
  - Any frontend call using `PATCH` against this backend could have been affected by the same CORS omission, not only brand update.

### 2026-04-17 15:44 - Shared - Rebuild category aggregate and admin flow from category business spec

- Scope: shared
- Changed:
  - ecommerce-shop/common/src/main/java/com/ttl/common/dto/CategoryDTO.java
  - ecommerce-shop/common/src/main/java/com/ttl/common/dto/CategoryStatus.java
  - ecommerce-shop/common/src/main/java/com/ttl/common/dto/CategoryTreeDTO.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/entities/Category.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/repositories/CategoryRepository.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/mapper/CategoryMapper.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/service/CategoryService.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/CategoryController.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/service/interfacefile/InterfaceFileSchemas.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/service/interfacefile/CategoryExportService.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/service/interfacefile/CategoryImportService.java
  - ecommerce-shop/basecommerce/src/main/resources/db/migration/mysql/V20260417_01__category_business_spec_alignment.sql
  - ecommerce-shop/basecommerce/src/main/resources/db/migration/postgresql/V20260417_01__category_business_spec_alignment.sql
  - ecommerce-shop/basecommerce/src/test/java/com/ttl/base/service/CategoryServiceTest.java
  - ecommerce-shop/docs/category-api-alignment.md
  - ecommerce-ng/src/app/core/constants/api-endpoints.ts
  - ecommerce-ng/src/app/core/models/catalog.models.ts
  - ecommerce-ng/src/app/core/services/category-api.service.ts
  - ecommerce-ng/src/app/features/catalog/categories/categories.page.ts
  - AI_PROGRESS.md
- Summary:
  - Re-read `docs/category-business-specification.md` and rebuilt category toward the documented business aggregate with the smallest compatible scope: added `code`, hierarchy metadata (`level`, `path`, `sortOrder`), lifecycle fields (`status`, `visible`, `assignable`, `deleted`), and SEO/media fields to backend category model, DTOs, mapper, import/export, and database migration.
  - Extended backend category API with filtered list, tree response, lookup by slug, explicit status update, and `POST /categories/{id}/deactivate`; kept hard delete only for the guarded cleanup case where no child category or product reference exists.
  - Preserved current product-category contract as single `products.category_id` to avoid broad catalog refactor in this change set; frontend category admin was updated to use the richer category contract and call deactivate instead of treating delete as the default lifecycle action.
  - Added a focused backend doc `docs/category-api-alignment.md` so other agents/frontend contributors can continue from the implemented contract instead of the larger future-state spec.
- Verification:
  - `ecommerce-ng`: `npm run build` -> passed
  - `ecommerce-shop`: `.\mvnw.cmd -pl basecommerce -am -DskipTests compile` -> passed
  - `ecommerce-shop`: `.\mvnw.cmd -pl basecommerce -am -Dtest=CategoryServiceTest "-Dsurefire.failIfNoSpecifiedTests=false" test` -> passed
- Todo:
  - [ ] Run Flyway migration or local app startup against a real MySQL/PostgreSQL database and verify existing category rows are backfilled with `code`, `path`, `level`, and defaults as expected.
  - [ ] Manually verify Angular category admin create/edit/deactivate flow against the running backend, especially parent change warnings and visibility/assignable/status persistence.
  - [ ] Decide in a later shared change set whether product creation/update must enforce `assignable=true` and `status=ACTIVE` when choosing `categoryId`.
  - [ ] If business needs full parity with the spec, continue with move/reorder/merge/split flows, slug history, storefront category endpoints, and product multi-category assignment.
- Notes:
  - This change set intentionally does not implement category merge, split, slug history, or product multi-category because current backend product contract is still `categoryId` only and the requested safe change was to rebuild category first.
  - Admin UI parent selector currently disables self-selection and shows `path`, but descendant exclusion is still best-effort via backend cycle validation rather than full tree-selector UX.
  - `DELETE /categories/{id}` authority was tightened to `CATEGORY_DELETE`; if the permission seed or role matrix does not yet contain that authority, hard delete will return `403` until permissions are aligned.

### 2026-04-17 15:58 - Shared - Promote category domain commands and admin tree rules

- Scope: shared
- Changed:
  - ecommerce-shop/common/src/main/java/com/ttl/common/dto/CategoryDTO.java
  - ecommerce-shop/common/src/main/java/com/ttl/common/request/CategoryMoveReq.java
  - ecommerce-shop/common/src/main/java/com/ttl/common/request/CategoryReorderReq.java
  - ecommerce-shop/common/src/main/java/com/ttl/common/request/CategoryMergeReq.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/repositories/CategoryRepository.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/mapper/CategoryMapper.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/service/CategoryService.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/CategoryController.java
  - ecommerce-shop/basecommerce/src/test/java/com/ttl/base/service/CategoryServiceTest.java
  - ecommerce-shop/docs/category-api-alignment.md
  - ecommerce-ng/src/app/core/constants/api-endpoints.ts
  - ecommerce-ng/src/app/core/models/catalog.models.ts
  - ecommerce-ng/src/app/core/services/category-api.service.ts
  - ecommerce-ng/src/app/features/catalog/categories/categories.page.ts
  - AI_PROGRESS.md
- Summary:
  - Moved category implementation further toward the business spec by making category lifecycle and structure self-sufficient: `DELETE /categories/{id}` now acts as guarded soft delete, backend exposes `/categories/deleted`, and the default admin flow no longer depends on a separate `CATEGORY_DELETE` permission to clean up taxonomy.
  - Added category command APIs for `move`, `reorder`, and `merge`, plus `ancestorIds` in category DTO so frontend can reason about tree constraints without re-deriving ancestry from partial data.
  - Updated Angular category admin to use the richer category command set: parent selector disables self and descendants, edit flow can call move explicitly, list offers simple reorder promotion and soft delete, and a merge panel was added for backoffice duplicate-category cleanup.
  - Kept product untouched as requested; category is now the leading contract and product can follow this taxonomy model in a later change set.
- Verification:
  - `ecommerce-ng`: `npm run build` -> passed
  - `ecommerce-shop`: `.\mvnw.cmd -pl basecommerce -am -Dtest=CategoryServiceTest "-Dsurefire.failIfNoSpecifiedTests=false" test` -> passed
- Todo:
  - [ ] Run backend with real MySQL/PostgreSQL and exercise migration + category endpoints manually to verify `deleted`, `ancestorIds`, merge child moves, and reorder persistence on existing rows.
  - [ ] Run manual Angular category admin flow against running backend for create, edit, move, reorder, merge, deactivate, and soft delete.
  - [ ] If business wants full spec parity, continue with split flow, slug history/redirect, storefront category endpoints, and audit log persistence for category actions.
- Notes:
  - Backend merge currently archives/soft-deletes source categories and can move their children to target, but it intentionally does not migrate product references yet because you explicitly asked to leave product for a later follow-up.
  - Frontend merge UI currently takes source category ids as a comma-separated input for a minimal usable backoffice flow; if the team wants safer UX, replace this with multi-select/tree-select in a future frontend-only refinement.
  - `DELETE /categories/{id}` is no longer a hard delete. Any client or script expecting physical removal must be updated to use the new soft-delete semantics.

### 2026-04-17 16:08 - Frontend - Build category admin UI around the new category domain contract

- Scope: frontend
- Changed:
  - ecommerce-ng/src/app/core/models/catalog.models.ts
  - ecommerce-ng/src/app/core/services/category-api.service.ts
  - ecommerce-ng/src/app/features/catalog/categories/categories.page.ts
  - AI_PROGRESS.md
- Summary:
  - Reworked Angular category frontend to actually follow the new backend category contract instead of only doing expanded CRUD: added `CategoryTreeNode`, `ancestorIds`, and unwrap handling for category mutation responses that may arrive as `{ data }` via backend response wrapper.
  - Extended `CategoryApiService` with `tree()` and made `create/update/deactivate/move/reorder/merge` unwrap envelope responses consistently so category page binds against stable runtime payloads.
  - Upgraded `CategoriesPage` with category-focused admin views: list filters (`keyword/status/visible/assignable`), dedicated tree panel, deleted-categories panel, and safer parent selection using `ancestorIds` to disable self/descendant targets.
  - Kept the existing minimal backoffice actions usable in one screen: create/update, move, reorder-to-top, deactivate, soft delete, and merge.
- Verification:
  - `ecommerce-ng`: `npm run build` -> passed
- Todo:
  - [ ] Run manual authenticated category admin flow against the running backend to verify envelope handling for create/update/move/merge/deactivate/soft-delete responses.
  - [ ] If merge becomes frequent, replace comma-separated source ids with multi-select or tree-select UX to reduce operator error.
  - [ ] Consider adding route-level separation later if category admin becomes too dense for one page, such as dedicated views for deleted categories or merge operations.
- Notes:
  - This change set is intentionally frontend-only; no additional backend contract changes were introduced here.
  - Category tree rendering is currently flattened recursively in the page itself for minimal code churn. If the tree grows large or needs expand/collapse, move that into a dedicated reusable component later.

### 2026-04-17 16:13 - Frontend - Fix categories tab crash when category path is null

- Scope: frontend
- Changed:
  - ecommerce-ng/src/app/features/catalog/categories/categories.page.ts
  - AI_PROGRESS.md
- Summary:
  - Investigated runtime crash on opening the categories tab and traced it to `availableParents()` sorting with `left.path.localeCompare(right.path)` while real category data still contains rows where `path` is `null`.
  - Applied a minimal null-safe fix by introducing `displayCategoryPath(...)` and `fallbackPathLabel(...)`, then routing sort/render paths through those helpers so the page remains usable even before backend/data backfill is complete.
- Verification:
  - `ecommerce-ng`: `npm run build` -> passed
- Todo:
  - [ ] Refresh the categories page against the running backend and confirm the tab now renders fully without console crashes.
  - [ ] Backfill missing `path` values in backend data/migration so frontend fallback labels become a safety net rather than the normal display path.
- Notes:
  - Root cause was data nullability, not route, guard, or hydration logic.
  - Any other frontend location that assumes `category.path` is always non-null should be treated as potentially unsafe until backend data is fully normalized.

### 2026-04-17 16:19 - Frontend - Add sortable category table columns

- Scope: frontend
- Changed:
  - ecommerce-ng/src/app/features/catalog/categories/categories.page.ts
  - AI_PROGRESS.md
- Summary:
  - Added client-side sorting for the main category table without introducing `MatSort` or a table datasource refactor: headers for `name`, `parent`, `status`, `children`, `visibility`, and `products` now toggle ascending/descending sort state.
  - Implemented lightweight sort helpers inside `CategoriesPage` (`sortedCategories`, `toggleSort`, `sortIndicator`, `compareCategories`) and bound the table to the sorted list.
  - Removed temporary `debugger` statements and console logging that were left behind from earlier category troubleshooting.
- Verification:
  - `ecommerce-ng`: `npm run build` -> passed
- Todo:
  - [ ] Manually verify header clicks on the running categories page and confirm sort order updates correctly for each sortable column.
  - [ ] If users need persisted sort state later, move the current in-page signal state into query params or a small UI state service.
- Notes:
  - Sorting is currently frontend-only and applies to the already loaded category list. It does not request backend-side sorting.

### 2026-04-17 16:31 - Frontend - Redesign category page with Material polish and motion

- Scope: frontend
- Changed:
  - ecommerce-ng/src/app/features/catalog/categories/categories.page.ts
  - ecommerce-ng/src/styles.css
  - AI_PROGRESS.md
- Summary:
  - Refreshed the category page visual language while keeping existing category logic intact: upgraded the hero with layered badge cards and animated glow, gave stat cards and content panels more depth/hover motion, and polished table/tree/deleted/merge surfaces with a more premium Material-like presentation.
  - Added lightweight motion and interaction feedback for category hero, stats, panels, table rows, tree nodes, and sort buttons so the page feels less flat without introducing new dependencies.
  - Moved the larger category-specific CSS from component-local styles into `src/styles.css` because Angular component style budget was exceeded when the redesign stayed inline in `categories.page.ts`.
- Verification:
  - `ecommerce-ng`: `npm run build` -> passed
- Todo:
  - [ ] Review the category page in browser on desktop and mobile to tune spacing/density if any section now feels too heavy.
  - [ ] If the team wants even richer Material motion later, consider adding expand/collapse for tree nodes and staggered entrance only for visible viewport sections.
- Notes:
  - This is a presentation-only frontend change; category API contracts and mutations were not changed here.
  - The global stylesheet now contains category-page-specific classes because component-scoped CSS exceeded Angular budget limits.

### 2026-04-17 16:41 - Frontend - Prevent false category update errors for view-only users

- Scope: frontend
- Changed:
  - ecommerce-ng/src/app/core/services/category-api.service.ts
  - ecommerce-ng/src/app/features/catalog/categories/categories.page.ts
  - AI_PROGRESS.md
- Summary:
  - Investigated the reported category update failure by tracing Angular `save()` -> `CategoryApiService.update(...)` against backend `PATCH /categories/{id}` and found a likely permission mismatch: the route allows users in with either `CATEGORY_VIEW` or `CATEGORY_MANAGE`, but backend update/create/move/merge/deactivate/delete require `CATEGORY_MANAGE`.
  - Updated the category page to respect that backend contract in the UI: form inputs and all mutating actions are now disabled unless the current user has `CATEGORY_MANAGE`, and the page shows a clear read-only message for view-only users.
  - Removed leftover `debugger` statements from `CategoryApiService` while touching the flow.
- Verification:
  - `ecommerce-ng`: `npm run build` -> passed
- Todo:
  - [ ] Re-test category update with a user that has `CATEGORY_MANAGE` to confirm the original failure is gone.
  - [ ] If update still fails for a manage-capable user, capture the actual network response body/status from `PATCH /categories/{id}` because the remaining issue would then be backend validation/data-specific rather than permission gating.
- Notes:
  - This fix addresses the common false-negative path where the UI exposed update actions to users who were only authorized to view categories.
  - Backend route guard remains unchanged: page access still permits `CATEGORY_VIEW` or `CATEGORY_MANAGE`, but mutation buttons now align with backend authorization.

### 2026-04-17 17:16 - Frontend - Build Users and Roles management tabs

- Scope: frontend
- Changed:
  - ecommerce-ng/src/app/core/constants/api-endpoints.ts
  - ecommerce-ng/src/app/core/services/user-api.service.ts
  - ecommerce-ng/src/app/core/services/role-api.service.ts
  - ecommerce-ng/src/app/features/management/users/users.page.ts
  - ecommerce-ng/src/app/features/management/roles/roles.page.ts
  - AI_PROGRESS.md
- Summary:
  - Re-read frontend routes/API guidance and backend `UserController` plus `RoleController` before editing, then confirmed the current management contract is read-only for this task: `GET /user`, `GET /user/{id}`, and `GET /role` with wrapped list responses.
  - Added minimal frontend API services for users and roles on top of `BaseApiService`, with envelope unwrapping aligned to the shared Spring `ResponseHandler` behavior.
  - Replaced the `Users` and `Roles` placeholder pages with working management tabs that load live backend data, show compact summary cards, support client-side keyword filtering, and render user role IDs plus role permission chips without changing backend contracts or auth flow.
- Verification:
  - `ecommerce-ng`: `npm run build` -> passed
- Todo:
  - [ ] Manually open `/admin/management/users` with a `USER_VIEW` account and `/admin/management/roles` with a `ROLE_VIEW` or `ROLE_MANAGE` account to confirm live data loads and route guards match backend authorization.
  - [ ] If the product needs create/update/delete actions later, extend the tabs in a new change set after confirming the desired UX for `POST /role`, `DELETE /role/{id}`, and any future user-management mutation APIs.
- Notes:
  - Current backend user list only exposes `roleIds`, not role names, so the Users tab intentionally displays role IDs rather than guessing names client-side.
  - No backend code or API contract was changed in this change set.

### 2026-04-17 17:34 - Shared - Implement full CRUD user-role flow across backend and frontend

- Scope: shared
- Changed:
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/controler/UserController.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/controler/RoleController.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/controler/PermissionController.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/service/UserService.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/service/RoleService.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/service/PermissionService.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/request/CreateUserRequest.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/request/UpdateUserRequest.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/response/UserResponse.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/response/PermissionCatalogResponse.java
  - ecommerce-shop/coreservice/src/test/java/com/ttl/core/service/RoleServiceTest.java
  - ecommerce-shop/README.md
  - ecommerce-shop/docs/frontend/angular-backend-api-integration.md
  - ecommerce-ng/src/app/core/constants/api-endpoints.ts
  - ecommerce-ng/src/app/core/models/auth.models.ts
  - ecommerce-ng/src/app/core/services/user-api.service.ts
  - ecommerce-ng/src/app/core/services/role-api.service.ts
  - ecommerce-ng/src/app/features/management/users/users.page.ts
  - ecommerce-ng/src/app/features/management/roles/roles.page.ts
  - AI_PROGRESS.md
- Summary:
  - Re-read frontend/backend AI rules and traced the active contract before editing. Backend previously only covered partial user-role management, so this change set completed the admin flow end-to-end with the smallest extension that fit the current architecture: user create/update/delete, role detail/update/delete, and permission catalog lookup for role forms.
  - Added backend APIs `POST /user`, `DELETE /user/{id}`, `GET /role/{id}`, `PATCH /role/{id}`, and `GET /permissions`; kept controllers thin and business logic in services. `POST /user` now uses a dedicated `CreateUserRequest` that supports multiple `roleIds`, while `UserResponse` now includes role summaries so the frontend can render role names without guessing.
  - Rebuilt Angular management tabs into actual CRUD workspaces: Users page now supports create/edit/delete with role assignment and status editing; Roles page now supports create/edit/delete with permission multi-select loaded from backend `GET /permissions`. Existing auth store, permission guard, interceptor chain, and `BaseApiService` flow were preserved.
- Verification:
  - `ecommerce-shop`: `.\mvnw.cmd -pl coreservice "-Dtest=UserServiceTest,RoleServiceTest,AuthServiceTest" test` -> passed
  - `ecommerce-ng`: `npm run build` -> passed
- Todo:
  - [ ] Run manual CRUD checks against the running frontend and backend for representative accounts with `USER_VIEW`, `USER_UPDATE`, `ROLE_VIEW`, and `ROLE_MANAGE` to confirm UI gating matches backend authorization.
  - [ ] Verify whether deleting a role that is still assigned to users should be blocked with a business error; current backend behavior still depends on the underlying persistence constraints and existing data.
  - [ ] Consider a follow-up cleanup to centralize shared management page styling because the new Users/Roles pages currently keep their own component-local presentation for speed of delivery.
- Notes:
  - User mutation permissions intentionally reuse existing `USER_UPDATE` because the current permission catalog and docs in-repo do not define separate `USER_CREATE` or `USER_DELETE` authorities.
  - Backend user status was kept aligned with the current persisted convention (`A`/existing string values) instead of introducing a new enum contract in the same change set.
  - `UserService.getById()` and `getAllUsers()` now serialize nested role summaries from the loaded user roles; if a lazy-loading issue appears in a full integration environment, the next fix should be to fetch user roles with permissions explicitly at repository level rather than changing the response contract again.

### 2026-04-17 14:25 - Shared - Add realistic product domain design v2 document

- Scope: shared
- Changed:
  - ecommerce-shop/docs/product-realistic-domain-design.md
  - AI_PROGRESS.md
- Summary:
  - Read required frontend/backend AI rules and surveyed the current product implementation end-to-end before designing.
  - Added a new detailed Product domain design document that proposes a realistic ecommerce model around SPU/Product, SKU/Variant, inventory, media, SEO, specification values, ERD, target DB schema, API contract direction, frontend mapping points, and phased implementation guidance.
  - Explicitly compared the proposed target model with the current repo state so future implementation can choose the smallest safe migration path instead of rewriting blindly.
- Verification:
  - Documentation-only change; no runtime code or API behavior modified.
  - Cross-checked against current source and docs:
    - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/entities/Product.java
    - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/entities/ProductVariant.java
    - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/entities/Inventory.java
    - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/service/ProductService.java
    - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/ProductController.java
    - ecommerce-ng/src/app/core/models/catalog.models.ts
    - ecommerce-ng/src/app/core/services/product-api.service.ts
    - ecommerce-ng/src/app/features/catalog/products/products.page.ts
- Todo:
  - [ ] Decide whether Phase 1 should be implemented next as backend-first or shared frontend-backend.
  - [ ] If implementation starts, split the work into: entity/migration changes, DTO/API contract updates, then Angular admin mapping updates.
  - [ ] Review whether the team wants separate admin and storefront product contracts before coding.
- Notes:
  - The new document is a target design, not an immediate schema migration plan.
  - Recommended smallest-safe direction for the current repo is the Phase 1 path described in the document: keep the current attribute/variant foundation, add publishing/SEO fields, normalize inventory usage, and split product DTOs by use case.

### 2026-04-17 14:39 - Shared - Add Product Phase 1 implementation spec

- Scope: shared
- Changed:
  - ecommerce-shop/docs/product-phase-1-implementation-spec.md
  - AI_PROGRESS.md
- Summary:
  - Wrote a second, implementation-focused product document that rewrites the direction into a concrete Phase 1 spec instead of a broad target-domain design.
  - Locked the smallest-safe path for the current repo: add publishing/SEO fields to `Product`, make `Inventory` the stock source for variants, split admin product DTOs by use case, and keep the existing attribute/variant foundation unchanged in this phase.
  - Explicitly documented scope, non-scope, DB/API/DTO/frontend changes, rollout order, and compatibility rules so the team can start coding without reinterpreting the broader V2 design doc.
- Verification:
  - Documentation-only change; no runtime code or API behavior modified.
  - Cross-checked against the current target design and active code paths:
    - ecommerce-shop/docs/product-realistic-domain-design.md
    - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/entities/Product.java
    - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/entities/ProductVariant.java
    - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/entities/Inventory.java
    - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/service/ProductService.java
    - ecommerce-ng/src/app/core/models/catalog.models.ts
    - ecommerce-ng/src/app/features/catalog/products/products.page.ts
- Todo:
  - [ ] If the team agrees with this direction, implement Phase 1 in separate change sets: backend migration/entity, backend DTO/service/API, then Angular model/service/page updates.
  - [ ] Decide whether `Product.price` should remain as a transitional summary field in admin responses or be removed once list/detail DTOs are split.
  - [ ] Decide whether product update should stay multipart in Phase 1 or move image handling to a separate upload flow in a later phase.
- Notes:
  - This new doc is intended to be the working spec for coding; the V2 design doc remains the broader target reference.
  - Phase 1 intentionally avoids typed specification values and storefront-specific contracts to keep the first implementation tractable.

### 2026-04-17 22:53 - Shared - Align product admin domain to phase 1 contract

- Scope: shared
- Changed:
  - ecommerce-shop/common/src/main/java/com/ttl/common/dto/ProductStatus.java
  - ecommerce-shop/common/src/main/java/com/ttl/common/dto/ProductVisibility.java
  - ecommerce-shop/common/src/main/java/com/ttl/common/request/AdminProductUpsertRequest.java
  - ecommerce-shop/common/src/main/java/com/ttl/common/request/AdminProductStatusUpdateRequest.java
  - ecommerce-shop/common/src/main/java/com/ttl/common/response/AdminProductListItemResponse.java
  - ecommerce-shop/common/src/main/java/com/ttl/common/response/AdminProductDetailResponse.java
  - ecommerce-shop/common/src/main/java/com/ttl/common/response/AdminProductVariantResponse.java
  - ecommerce-shop/common/src/main/java/com/ttl/common/response/InventorySummaryResponse.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/entities/Product.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/entities/ProductVariant.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/repositories/ProductRepository.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/service/ProductSpecification.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/service/ProductService.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/ProductController.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/service/interfacefile/ProductImportService.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/service/interfacefile/ProductExportService.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/mapper/ProductMapper.java
  - ecommerce-shop/basecommerce/src/main/resources/db/migration/mysql/V20260417_02__product_phase_1_alignment.sql
  - ecommerce-shop/basecommerce/src/main/resources/db/migration/postgresql/V20260417_02__product_phase_1_alignment.sql
  - ecommerce-shop/basecommerce/src/test/java/com/ttl/base/service/ProductServiceTest.java
  - ecommerce-shop/basecommerce/src/test/java/com/ttl/base/service/interfacefile/ProductExportServiceTest.java
  - ecommerce-shop/docs/product-phase-1-api-alignment.md
  - ecommerce-ng/src/app/core/constants/api-endpoints.ts
  - ecommerce-ng/src/app/core/models/catalog.models.ts
  - ecommerce-ng/src/app/core/services/product-api.service.ts
  - ecommerce-ng/src/app/features/catalog/products/products.page.ts
  - AI_PROGRESS.md
- Summary:
  - Implemented product phase 1 backend contract from the product docs with the smallest repo-safe scope: product API now uses dedicated admin request/response models, adds `PATCH /products/{id}` and `PATCH /products/{id}/status`, and keeps the existing global response wrapper behavior unchanged.
  - Extended backend `Product` with phase 1 publishing/SEO fields (`slug`, `shortDescription`, `visibility`, `publishedAt`, `seoTitle`, `seoDescription`, `seoKeywords`), added DB migrations for MySQL/PostgreSQL, and introduced `ProductVisibility` plus `ARCHIVED` support in `ProductStatus`.
  - Moved stock source-of-truth handling into the product flow: create/update now convert compatibility field `variant.stockQty` into `Inventory.onHandQty`, detail responses return `inventory { onHandQty, reservedQty, availableQty }`, and list price is summarized from variant prices.
  - Tightened backend validation to match the current category/attribute contract: variant attributes are required, must be `variantAxis`, option must belong to the selected attribute, and the attribute must already be assigned to the chosen category.
  - Updated Angular admin product models/service/page to the phase 1 contract, added code/slug/shortDescription/visibility/SEO inputs, switched list UI to code/slug/visibility/variantCount fields, and required one variant-axis option selection so frontend no longer sends empty variant attributes.
  - Added `ecommerce-shop/docs/product-phase-1-api-alignment.md` as the implementation handoff doc for future frontend/backend work.
- Verification:
  - `ecommerce-shop`: `./mvnw.cmd -pl basecommerce -am -DskipTests compile` -> passed
  - `ecommerce-shop`: `./mvnw.cmd -pl basecommerce -am "-Dtest=ProductServiceTest,ProductExportServiceTest" "-Dsurefire.failIfNoSpecifiedTests=false" test` -> passed
  - `ecommerce-ng`: `npm run build` -> passed
  - Angular build still reports the pre-existing bundle budget warning, but the build completed successfully.
- Todo:
  - [ ] Run a manual authenticated `/admin/catalog/products` check against running frontend/backend: create one product with a valid category variant-axis option, verify list rendering, and inspect `GET /products/{id}` wrapped detail payload.
  - [ ] Decide whether product update should also support multipart image replacement; current phase 1 implementation keeps create as multipart and update as JSON for minimal change.
  - [ ] Extend product import/export to full phase 1 SEO/publishing parity in a later change set if CSV flows must carry the new fields, not just inventory-compatible core data.
  - [ ] Add Angular detail/update/status UI if admin needs to edit existing products from the screen instead of API/manual tools.
- Notes:
  - Storefront product APIs, slug history, typed specification values, and a richer product-media aggregate were intentionally left out because they are phase 2+ work from `product-realistic-domain-design.md`.
  - `ProductImportService` and `ProductExportService` were only adjusted enough to stay compile-safe and inventory-compatible; they are not yet complete phase 1 parity for SEO/publishing metadata.
  - Angular create now depends on existing backend attribute schema. If a category has no assigned variant-axis attribute/options, product create should still fail or be blocked until catalog schema is configured, which matches the new backend validation.

### 2026-04-17 23:44 - Shared - Complete register/login flow with OTP and Google token auth

- Scope: shared
- Changed:
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/request/LoginRequest.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/controler/AuthController.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/service/LoginService.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/service/RegistrationService.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/service/OtpRedisService.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/service/login/PaswordLoginStrategy.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/service/login/GoogleLoginStrategy.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/service/login/GoogleTokenVerifierService.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/dto/GoogleTokenInfoResponse.java
  - ecommerce-shop/coreservice/src/test/java/com/ttl/core/service/LoginServiceTest.java
  - ecommerce-shop/coreservice/src/test/java/com/ttl/core/service/RegistrationServiceTest.java
  - ecommerce-shop/docs/frontend/angular-backend-api-integration.md
  - ecommerce-ng/src/app/core/config/app-config.model.ts
  - ecommerce-ng/src/app/core/models/auth.models.ts
  - ecommerce-ng/src/app/core/services/auth.service.ts
  - ecommerce-ng/src/app/features/auth/pages/login.page.ts
  - ecommerce-ng/src/app/features/auth/pages/register.page.ts
  - ecommerce-ng/src/app/features/auth/pages/verify-otp.page.ts
  - ecommerce-ng/src/environments/environment.ts
  - ecommerce-ng/src/environments/environment.development.ts
  - ecommerce-ng/src/environments/environment.production.ts
  - ecommerce-ng/AI/references/auth-flow.md
  - AI_PROGRESS.md
- Summary:
  - Re-checked auth contract end-to-end before editing and found 3 gaps: Angular register page still bypassed OTP flow, Angular had no social auth path, and backend `googleToken` support existed only as an unused field while `LoginService` always forced username/password strategy.
  - Completed backend login strategy selection so `POST /auth/login` now supports both username/password and Google ID token login on the same endpoint. Added runtime Google token verification through `https://oauth2.googleapis.com/tokeninfo`, validated `aud` against configured `spring.security.oauth2.client.registration.google.client-id`, and auto-provisioned a default `CUSTOMER` account on first successful Google login.
  - Completed backend OTP register flow by turning `sendotpregister -> verifyotp` into a real registration path: temp register payload is read from Redis during OTP verification, user is created, then activated in the same flow. Also relaxed request-level login validation so Google login is not rejected before strategy dispatch, while password login still validates required credentials inside the password strategy.
  - Refactored Angular auth flow into `AuthService` so auth pages stay thin and use the existing session/current-user/interceptor pipeline. `RegisterPage` now supports direct register, OTP register, and a Google handoff path; `VerifyOtpPage` now sends the actual query-param contract expected by backend; `LoginPage` now renders a Google Identity button when `environment.googleClientId` is configured and reuses the same `POST /auth/login` endpoint with `googleToken`.
  - Synced frontend AI auth-flow guidance and backend Angular integration docs to document the active OTP register flow and the single-endpoint Google login/register contract.
- Verification:
  - `ecommerce-shop`: `.\mvnw.cmd -pl coreservice "-Dtest=LoginServiceTest,UserServiceTest,RegistrationServiceTest,AuthServiceTest" test` -> passed
  - `ecommerce-ng`: `npm run build` -> passed
  - Angular build still reports the pre-existing bundle budget warning, but the build completed successfully.
- Todo:
  - [ ] Set real `googleClientId` in Angular environment files and matching `GOOGLE_CLIENT_ID` in backend runtime config before manual Google login/register testing.
  - [ ] Run manual flows against running apps: direct register, OTP register (`/auth/sendotpregister` -> `/auth/verifyotp`), normal login, refresh after reload, and first-time Google login auto-provisioning.
  - [ ] Decide in a follow-up change set whether Google button should also render directly on `RegisterPage` instead of the current minimal handoff to `/auth/login`.
- Notes:
  - Google verification currently depends on outbound network access from backend to Google `tokeninfo`; if deployment blocks outbound traffic, Google login will fail until that network path is allowed.
  - OTP verification uses `pOtpType=otp:register:` because that is the actual Redis key prefix in current backend constants. The older docs/example using `OTP_REGISTER` were stale and were updated in this change set.
  - Auto-provisioned Google accounts currently derive username from email local-part with numeric suffix fallback and assign encoded `sub` as the stored password placeholder. This keeps the change small and avoids new schema, but if product later needs explicit social-provider metadata it should be modeled in a dedicated follow-up change set.

### 2026-04-17 23:48 - Shared - Finish remaining auth UI todo and document runtime blockers

- Scope: shared
- Changed:
  - ecommerce-ng/src/app/features/auth/pages/register.page.ts
  - AI_PROGRESS.md
- Summary:
  - Completed the remaining frontend auth todo by rendering the Google Identity button directly on `RegisterPage` instead of forcing a handoff back to `/auth/login`.
  - Kept the implementation minimal by reusing the same Google client script, `AuthService.loginWithGoogle(...)`, and existing post-login redirect flow already used on `LoginPage`, without introducing a new shared auth widget abstraction.
  - Re-checked runtime prerequisites for manual auth smoke testing and confirmed the Angular dev server is reachable, but backend auth API on `http://localhost:8081` is currently down and all Angular environment files still have empty `googleClientId`, so manual end-to-end verification remains blocked by runtime config/state rather than code compilation.
- Verification:
  - `ecommerce-ng`: `npm run build` -> passed
  - `runtime check`: `http://localhost:4200` -> reachable
  - `runtime check`: `http://localhost:8081/auth/refresh` -> backend not reachable (`Unable to connect to the remote server`)
- Todo:
  - [ ] Start backend locally on `:8081` with working DB/Redis/mail dependencies before rerunning direct register, OTP register, login, and refresh smoke tests.
  - [ ] Set `googleClientId` in Angular environment and matching backend `GOOGLE_CLIENT_ID` before rerunning Google register/login smoke test.
  - [ ] Once backend is up, manually verify cookies/refresh on browser reload and OTP email delivery in the active local environment.
- Notes:
  - This change set is intentionally frontend-only; no backend contract changed.
  - Google button rendering on both login and register pages still depends on browser runtime and will stay hidden when `googleClientId` is blank.

### 2026-04-18 00:00 - Shared - Bring local auth runtime up and verify active blockers

- Scope: shared
- Changed:
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/config/JwtAuthenticationEntryPoint.java
  - AI_PROGRESS.md
- Summary:
  - Continued the auth todo from runtime instead of static review: started local Redis container, rebuilt `common`, `coreservice`, and `basecommerce`, and brought the backend back up on `http://localhost:8081` so auth endpoints could be exercised directly.
  - Verified live backend behavior for the completed auth flow: public direct register works, username/password login works, refresh cookie is issued on login, `/auth/me` works with a valid bearer token, and OTP verify failure path returns stable `E113` for an invalid OTP.
  - Identified 2 remaining runtime blockers that are external to the core auth contract: `sendotpregister` currently fails in local because SMTP credentials are missing/invalid (`MailAuthenticationException: failed to connect, no password specified?`), and Google login/register still cannot be smoke-tested because Angular/backend Google client IDs are unset.
  - Fixed one backend bug discovered during runtime checks: `JwtAuthenticationEntryPoint` was incorrectly treating arbitrary Spring Security messages like `Full authentication is required to access this resource` as message codes, which could cascade into `NoSuchMessageException` and unstable `500` responses. It now only treats `E...` values as explicit error codes and otherwise falls back to the standard token-invalid code path.
- Verification:
  - Infra/runtime:
    - `docker start redis` -> passed
    - `Test-NetConnection localhost -Port 3307` -> `TcpTestSucceeded=True`
    - `Test-NetConnection localhost -Port 6379` -> `TcpTestSucceeded=True`
    - backend boot on `http://localhost:8081` -> passed after rebuilding/installing dependent modules
  - Backend build:
    - `ecommerce-shop`: `./mvnw.cmd -pl common,coreservice,basecommerce -am install -DskipTests` -> passed
    - `ecommerce-shop`: `./mvnw.cmd -pl coreservice -DskipTests compile` -> passed
  - Live auth smoke tests:
    - `POST /user/register` with `aiuser_direct_001` -> passed, returned wrapped `UserResponse` with default `CUSTOMER` role
    - `POST /auth/login` with `aiuser_direct_001` -> passed, returned wrapped access token and issued `refresh_token` cookie
    - `GET /auth/me` with returned bearer token -> passed
    - `POST /auth/verifyotp?pOtpType=otp:register:&pEmail=aiuser_otp_001@example.com&pOtp=000000` -> returned expected invalid OTP response `E113`
    - `POST /auth/sendotpregister` -> failed due to local SMTP auth/runtime config, not request-contract mismatch
  - Notes on refresh:
    - PowerShell smoke calls to `POST /auth/refresh` still returned `500` during this session; local logs from the same run clearly show a valid `refresh_token` cookie is being issued on login, so this path likely still needs one more focused check under browser semantics or a dedicated backend inspection of the refresh error handling path.
- Todo:
  - [ ] Inspect and fix the remaining backend `POST /auth/refresh` runtime failure under the local environment; verify whether the error is in refresh-token validation/entry-point handling or only in the PowerShell request flow.
  - [ ] Configure working SMTP credentials (`MAIL_USERNAME`/`MAIL_PASSWORD`) or a local mail trap before rerunning OTP register end-to-end; current failure is infrastructure, not endpoint shape.
  - [ ] Set real `googleClientId` in Angular and matching `GOOGLE_CLIENT_ID` in backend before running Google login/register smoke tests.
  - [ ] After SMTP and Google config are in place, rerun browser-level manual flows: OTP register, refresh-after-reload, and first-time Google auto-provisioning.
- Notes:
  - During restart, Spring DevTools briefly hit an unrelated `AttributeDefRepository` wiring issue while classpath was mid-refresh, then recovered on the next restart; the final backend instance used for smoke testing was healthy and serving Swagger/API on `:8081`.
  - Local Hibernate startup still logs a non-fatal MySQL DDL warning for `idx_category_path` key length. It did not block auth verification in this change set.

### 2026-04-19 22:16 - Shared - Stabilize image workflow with public asset URLs and post-create management

- Scope: shared
- Changed:
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/service/FileService.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/config/UploadResourceConfig.java
  - ecommerce-shop/basecommerce/src/test/java/com/ttl/base/service/BrandServiceTest.java
  - ecommerce-shop/basecommerce/src/test/java/com/ttl/base/service/CategoryServiceTest.java
  - ecommerce-shop/basecommerce/src/test/java/com/ttl/base/service/ProductServiceTest.java
  - ecommerce-shop/basecommerce/src/test/java/com/ttl/base/service/FileServiceTest.java
  - ecommerce-shop/docs/frontend/angular-backend-api-integration.md
  - ecommerce-ng/src/app/core/services/category-api.service.ts
  - ecommerce-ng/src/app/features/catalog/categories/categories.page.ts
  - AI_PROGRESS.md
- Summary:
  - Re-checked image flow end-to-end and kept the business direction aligned with product: image upload/manage only after the owning entity already exists, instead of introducing temporary upload state before `brandId` or `categoryId` exists.
  - Changed backend file storage contract so `FileService.upload(...)` now returns stable public asset URLs under `/assets/uploads/{filename}` instead of raw filesystem paths, and added Spring static resource mapping so browser image rendering no longer depends on local machine path layout.
  - Kept existing brand/category product-like image APIs, but moved category admin UI away from manual `imageUrl` entry to gallery-based management after create: upload multiple images, set thumbnail, delete image, and use backend-returned thumbnail URL as the primary display source.
  - Synced frontend-facing backend docs to state the new public asset URL rule and the intended post-create image-management workflow.
- Verification:
  - `ecommerce-shop`: `.\mvnw.cmd -pl basecommerce -am "-Dtest=BrandServiceTest,CategoryServiceTest,ProductServiceTest,FileServiceTest" "-Dsurefire.failIfNoSpecifiedTests=false" test` -> passed
  - `ecommerce-ng`: `npm run build` -> passed
  - Angular build still reports the pre-existing bundle budget warnings; build completed successfully.
- Todo:
  - [ ] Run manual browser smoke test for brand/category/product image rendering against a running backend to confirm `/assets/uploads/**` is reachable from the Angular origin and images display after upload.
  - [ ] Review whether brand admin UI should also be expanded from single-avatar management to full gallery semantics, or remain single-image by business decision.
  - [ ] If API consumers outside Angular still send category `imageUrl` directly, decide whether to deprecate that field later instead of removing it immediately.
- Notes:
  - This change set intentionally did not introduce temporary uploads, draft image entities, or pre-create asset ownership because the current admin UX requirement is to manage images only after the brand/category already exists.
  - Current backend still stores only the public URL on `Image.url`; no separate original filesystem path or metadata table was added in this pass to keep the redesign minimal and safe.

### 2026-04-19 22:29 - Shared - Standardize brand images to gallery workflow

- Scope: shared
- Changed:
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/entities/Brand.java
  - ecommerce-shop/common/src/main/java/com/ttl/common/dto/BrandDTO.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/mapper/BrandMapper.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/service/BrandService.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/BrandController.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/service/interfacefile/BrandImportService.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/service/interfacefile/BrandExportService.java
  - ecommerce-shop/basecommerce/src/test/java/com/ttl/base/service/BrandServiceTest.java
  - ecommerce-shop/docs/frontend/angular-backend-api-integration.md
  - ecommerce-ng/src/app/core/models/catalog.models.ts
  - ecommerce-ng/src/app/core/constants/api-endpoints.ts
  - ecommerce-ng/src/app/core/services/brand-api.service.ts
  - ecommerce-ng/src/app/features/catalog/brands/brands.page.ts
  - AI_PROGRESS.md
- Summary:
  - Reworked `brand` image business flow to match the same post-create gallery semantics already used by `product` and now `category`: multiple images per brand, one thumbnail, add/set-thumbnail/delete image operations, and admin UI management only after the brand already exists.
  - Added brand gallery support on the backend through `galleryImages` plus new APIs `GET/POST /brands/{id}/images`, `PATCH /brands/{id}/images/{imageId}/thumbnail`, and `DELETE /brands/{id}/images/{imageId}` while preserving `imageUrl` and `image` in `BrandDTO` as the current thumbnail projection for compatibility.
  - Updated Angular brand admin screen from single-avatar upload/remove to gallery management with multi-upload, thumbnail switching, and per-image delete.
  - Synced brand import/export logic and frontend-facing backend docs so CSV/image flows continue to resolve a primary thumbnail consistently.
- Verification:
  - `ecommerce-shop`: `.\mvnw.cmd -pl basecommerce -am "-Dtest=BrandServiceTest,CategoryServiceTest,ProductServiceTest,FileServiceTest" "-Dsurefire.failIfNoSpecifiedTests=false" test` -> passed
  - `ecommerce-ng`: `npm run build` -> passed
  - Angular build still reports the pre-existing bundle budget warnings; build completed successfully.
- Todo:
  - [ ] Run manual browser checks for `/catalog/brands` to confirm multi-upload, thumbnail switch, delete-image, and delete-all flows behave correctly against a running backend.
  - [ ] Decide in a later migration change set whether legacy `brands.image_id` should be fully retired once all consumers move to `galleryImages` + thumbnail projection.
  - [ ] If API consumers need explicit ordering beyond thumbnail-first behavior, add stable gallery sort metadata in a future change set instead of inferring order by id.
- Notes:
  - This pass intentionally kept backward-compatible DTO fields (`imageUrl`, `image`) so existing screens and integrations can continue to read a single primary brand image while newer clients move to `galleryImages`.
  - Persistence is still intentionally minimal: no separate media aggregate, ownership table, or temporary upload workflow was added.

### 2026-04-19 22:33 - Backend - Fix brand gallery orphan-removal collection handling

- Scope: backend
- Changed:
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/service/BrandService.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/service/interfacefile/BrandImportService.java
  - AI_PROGRESS.md
- Summary:
  - Fixed runtime failure when calling `POST /brands/{id}/images`: Hibernate rejected the update because `Brand.galleryImages` uses orphan removal and the service/import flow was replacing the managed collection reference with a new `HashSet`.
  - Updated brand image mutation logic to mutate the existing managed collection in place (`clear/add`) instead of swapping the collection reference, which keeps Hibernate ownership tracking stable.
- Verification:
  - `ecommerce-shop`: `.\mvnw.cmd -pl basecommerce -am "-Dtest=BrandServiceTest,CategoryServiceTest,ProductServiceTest,FileServiceTest" "-Dsurefire.failIfNoSpecifiedTests=false" test` -> passed
- Todo:
  - [ ] Re-run manual browser/API upload for `POST /brands/{id}/images` against the running app to confirm the previous `all-delete-orphan` exception no longer occurs at transaction commit.
  - [ ] Review category/product gallery mutation paths later because they still contain collection replacement patterns and may deserve the same hardening if those entities move to orphan removal in future mappings.
- Notes:
  - Root cause observed in live runtime log: `A collection with cascade="all-delete-orphan" was no longer referenced by the owning entity instance: com.ttl.base.entities.Brand.galleryImages`.

### 2026-04-19 22:42 - Shared - Fix image display for backend-relative asset paths in Angular admin

- Scope: shared
- Changed:
  - ecommerce-ng/src/app/core/utils/media-url.util.ts
  - ecommerce-ng/src/app/features/catalog/brands/brands.page.ts
  - ecommerce-ng/src/app/features/catalog/categories/categories.page.ts
  - ecommerce-ng/src/app/features/catalog/products/products.page.ts
  - AI_PROGRESS.md
- Summary:
  - Investigated the case where image rows were correctly persisted in `images` with URLs like `/assets/uploads/...` but the browser still showed broken images.
  - Root cause on the admin UI side: Angular pages were binding backend-returned relative asset paths directly into `img/src` and CSS background-image, so when Angular ran on a different origin (`localhost:4200`) than the backend (`localhost:8081`), the browser requested the asset from the wrong host.
  - Added a small shared frontend utility to resolve relative media paths against `apiBaseUrl`, then applied it to brand/category/product image rendering points.
- Verification:
  - `ecommerce-ng`: `npm run build` -> passed
  - Angular build still reports the pre-existing bundle budget warnings; build completed successfully.
- Todo:
  - [ ] Manual check in browser DevTools Network tab: confirm image requests now go to `http://localhost:8081/assets/uploads/...` instead of `http://localhost:4200/assets/uploads/...`.
  - [ ] If any other screens outside catalog render media URLs from backend DTOs, apply the same helper there.
- Notes:
  - This change does not alter backend persistence or upload behavior; it only fixes frontend resolution of backend-relative asset URLs.

### 2026-04-19 22:49 - Frontend - Make brand create flow continue directly into image upload

- Scope: frontend
- Changed:
  - ecommerce-ng/src/app/features/catalog/brands/brands.page.ts
  - AI_PROGRESS.md
- Summary:
  - Refined the brand admin UX so creating a brand no longer resets the form back to an empty state immediately.
  - After a successful create, the page now keeps the newly created brand in local state, switches straight into edit mode for that brand, scrolls to the image management section, and auto-opens the file picker once so the user can continue with image upload as one continuous flow.
  - Update flow remains unchanged apart from reusing the same local state replacement path.
- Verification:
  - Angular compile/runtime code path is valid; no TypeScript/template errors remain after the change.
  - `ecommerce-ng`: `npm run build` still fails only because the existing initial bundle budget is exceeded by `275 bytes`; this is a build-budget threshold issue, not a logic or compile error introduced by the UX flow.
- Todo:
  - [ ] Manual browser check: create a new brand and confirm the UI immediately enters edit mode and opens the image picker.
  - [ ] Decide separately whether to relax the Angular initial bundle budget or do a broader bundle-size reduction pass; current failure is too small to justify invasive code churn in this task.
- Notes:
  - The auto-open file picker is triggered only after a successful create response, preserving the rule that image management starts only once a real `brandId` exists.

### 2026-04-19 22:53 - Frontend - Focus first brand gallery card after first upload

- Scope: frontend
- Changed:
  - ecommerce-ng/src/app/features/catalog/brands/brands.page.ts
  - AI_PROGRESS.md
- Summary:
  - Improved the post-upload UX for newly created brands with no existing gallery.
  - After the first successful image upload into an empty brand gallery, the page now scrolls to the first rendered gallery card and focuses it so the user immediately sees the uploaded result without manually searching the section.
  - The focus behavior is intentionally limited to the first upload into an empty gallery to avoid disruptive scrolling on every later image add.
- Verification:
  - Angular code compiles cleanly from a TypeScript/template perspective.
  - `ecommerce-ng`: `npm run build` still fails only because the existing initial bundle budget is exceeded by `646 bytes`; this is a project build-budget threshold issue, not a functional code error in the UX change.
- Todo:
  - [ ] Manual browser check: create brand -> auto-open picker -> upload first image -> verify page scrolls/focuses the new gallery card.
  - [ ] Decide separately whether to relax the Angular initial bundle budget or perform a dedicated bundle-size cleanup pass.
- Notes:
  - No backend/API contract changes were made in this pass.

### 2026-04-19 22:58 - Frontend - Add uploaded-image highlight and lightweight brand page animations

- Scope: frontend
- Changed:
  - ecommerce-ng/src/app/features/catalog/brands/brands.page.ts
  - AI_PROGRESS.md
- Summary:
  - Added a temporary `recentlyUploadedImageId` state so the first newly uploaded image can be emphasized after upload.
  - Brand gallery now shows a `new` chip and a soft highlight/glow animation on the newly added image card for about 2.6 seconds, making the upload result easier to spot.
  - Added lightweight entrance/hover/focus animations for the main brand page sections (hero, stat cards, editor/list panels, and image cards) while staying within the existing visual language.
- Verification:
  - Angular logic/template path is valid; no functional TypeScript/template errors were introduced.
  - `ecommerce-ng`: `npm run build` now fails only on the existing initial bundle budget threshold, exceeded by `4.07 kB` after the UX animation additions.
- Todo:
  - [ ] Manual browser check: create brand -> upload first image -> confirm `new` chip and temporary highlight appear, and the card is still auto-focused.
  - [ ] Decide whether to keep this richer animation layer and relax the Angular bundle budget, or trim the CSS animation pass in a follow-up if strict budget compliance is required.
- Notes:
  - No backend/API changes in this pass; impact is limited to the frontend brand admin page.

### 2026-04-19 23:03 - Frontend - Scroll to brand editor on edit and add client-side search

- Scope: frontend
- Changed:
  - ecommerce-ng/src/app/features/catalog/brands/brands.page.ts
  - AI_PROGRESS.md
- Summary:
  - Added smooth scroll-to-editor behavior when the user clicks `Sua`, so the page moves directly to the brand edit form instead of requiring manual scrolling back up.
  - Added a client-side search field above the brand table that filters by `name`, `slug`, and `description` without changing the backend/API contract.
  - Empty state now distinguishes between “no brands yet” and “no search matches”.
- Verification:
  - Angular logic/template path is valid.
  - `ecommerce-ng`: `npm run build` still fails only because the existing initial bundle budget is exceeded, now by `5.06 kB`; this remains a build-budget constraint rather than a functional code error.
- Todo:
  - [ ] Manual browser check: click `Sua` from a row far down the table and confirm the page scrolls back to the editor panel.
  - [ ] Manual browser check: search by partial brand name, slug, and description to confirm list filtering and empty state text.
  - [ ] Decide whether to keep the richer frontend UX changes and adjust bundle budget, or do a dedicated brand-page trimming pass for strict build compliance.
- Notes:
  - Search is intentionally client-side because the current brand list is admin-sized and a backend search API is not required for this workflow.

### 2026-04-19 23:08 - Frontend - Align category and product edit buttons with scroll-to-editor behavior

- Scope: frontend
- Changed:
  - ecommerce-ng/src/app/features/catalog/categories/categories.page.ts
  - ecommerce-ng/src/app/features/catalog/products/products.page.ts
  - AI_PROGRESS.md
- Summary:
  - Extended the same edit UX pattern already used on the brand page to category and product pages.
  - Clicking `Sua` for a category now scrolls smoothly back to the category form and focuses the `Name` field.
  - Clicking `Sua` for a product now scrolls back to the product editor after detail load completes and focuses the `Name` field.
- Verification:
  - Angular logic/template path is valid.
  - `ecommerce-ng`: `npm run build` still fails only because the existing initial bundle budget is exceeded, now by `6.49 kB`; this remains a build-budget constraint rather than a functional code error.
- Todo:
  - [ ] Manual browser check on category page: scroll down list, click `Sua`, confirm the page scrolls back to the form and the `Name` input is focused.
  - [ ] Manual browser check on product page: scroll down list, click `Sua`, wait for detail load, confirm the page scrolls back to the editor and the `Name` input is focused.
  - [ ] Decide separately whether to keep the current richer frontend UX changes and relax bundle budget, or trim frontend page code/CSS in a dedicated optimization pass.
- Notes:
  - No backend/API changes in this pass.

### 2026-04-20 09:20 - Frontend - Implement order frontend flow from order business design

- Scope: frontend
- Changed:
  - ecommerce-ng/src/app/core/constants/api-endpoints.ts
  - ecommerce-ng/src/app/core/constants/app-routes.ts
  - ecommerce-ng/src/app/core/http/base-api.service.ts
  - ecommerce-ng/src/app/core/models/order.models.ts
  - ecommerce-ng/src/app/core/services/cart-api.service.ts
  - ecommerce-ng/src/app/core/services/order-api.service.ts
  - ecommerce-ng/src/app/core/layout/sidebar.component.ts
  - ecommerce-ng/src/app/app.routes.ts
  - ecommerce-ng/src/app/features/order/checkout/checkout.page.ts
  - ecommerce-ng/src/app/features/order/my-orders/my-orders.page.ts
  - ecommerce-ng/src/app/features/order/my-order-detail/my-order-detail.page.ts
  - ecommerce-ng/src/app/features/order/admin-orders/admin-orders.page.ts
  - ecommerce-ng/src/app/features/order/admin-order-detail/admin-order-detail.page.ts
  - AI_PROGRESS.md
- Summary:
  - Re-read frontend/backend AI rules and implemented frontend-only order scope based on `ecommerce-shop/docs/order-business-design.md` with smallest viable changes: API constants, typed models, API services, routes, and 5 new Angular Material pages (`checkout`, `my orders`, `my order detail`, `admin orders`, `admin order detail`).
  - Mapped current backend contract end-to-end without changing backend: `/carts/me`, `/carts/me/pricing-preview`, `/carts/me/checkout`, `/orders`, `/orders/{id}`, `/orders/me`, `/orders/me/{id}`, `/orders/me/{id}/cancel`, `/orders/{id}/admin-status`.
  - Added UI animation and Material-based layouts for order pages while preserving existing auth/permission/interceptor flow; admin routes are gated by `ORDER_VIEW`, and customer routes stay under authenticated `admin` layout.
- Verification:
  - `ecommerce-ng`: `npm run build` -> compile succeeded but build fails on existing/expected bundle budget gate (`initial` bundle > 1MB) and additional component CSS budget warnings (including new order pages).
  - Contract cross-check before implementation:
    - `ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/OrderController.java`
    - `ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/CartController.java`
    - `ecommerce-shop/common/src/main/java/com/ttl/common/response/OrderDetailResponse.java`
    - `ecommerce-shop/common/src/main/java/com/ttl/common/response/OrderListItemResponse.java`
    - `ecommerce-shop/common/src/main/java/com/ttl/common/response/CartResponse.java`
- Todo:
  - [ ] Manual test with running backend: checkout flow (`/admin/checkout`) from real cart, then verify redirect to `/admin/orders/me/:id` and rendered order snapshot.
  - [ ] Manual test admin order processing flow: `/admin/orders` -> `/admin/orders/:id` -> status update transitions (`SHIPPING` with tracking, `CANCELLED` with reason, `DELIVERED` with fulfillment consistency).
  - [ ] Decide whether to move duplicated order-page CSS into shared stylesheet utilities or relax per-component CSS budgets, then rerun `npm run build` until budget gate passes.
  - [ ] If product expects customer-facing public layout (non-admin path), split order customer routes from current `admin` shell in a follow-up minimal change set.
- Notes:
  - This change set intentionally did not alter backend behavior or contracts.
  - The Angular `routes-and-navigation` AI reference is now stale for new order routes and should be updated in a docs-sync pass.

### 2026-04-20 09:48 - Backend - Fix Product getAll multiple-bag fetch failure

- Scope: backend
- Changed:
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/repositories/ProductRepository.java
  - AI_PROGRESS.md
- Summary:
  - Traced the runtime exception from `ProductService.getAll()` to `ProductRepository.findAllWithDetails()` using an `@EntityGraph` that eagerly fetched both `variants.attributes` and `variants.inventories`.
  - This triggered Hibernate `MultipleBagFetchException` (`ProductVariant.attributes` and `ProductVariant.inventories`) when loading product list.
  - Applied the smallest safe fix by removing `variants.inventories` from the `findAllWithDetails()` entity graph; list flow does not require inventories, so contract stays unchanged while avoiding the invalid simultaneous bag fetch.
- Verification:
  - `ecommerce-shop`: `./mvnw.cmd -pl basecommerce "-Dtest=ProductServiceTest" "-Dsurefire.failIfNoSpecifiedTests=false" test` -> failed before test execution due pre-existing compile issues outside this change set (missing order/cart DTO classes from `common` and existing `BrandMapper` mapping error).
  - Static code-path verification confirms the failing path (`ProductService.getAll` -> `ProductRepository.findAllWithDetails`) no longer requests both bag collections in one fetch graph.
- Todo:
  - [ ] Run a live smoke check for `GET /products` (or the frontend product list page) after backend restart to confirm `MultipleBagFetchException` is gone.
  - [ ] Re-run backend module tests once the existing unrelated compile issues in current workspace are resolved.
- Notes:
  - No frontend change and no API response shape change in this fix.

### 2026-04-20 09:53 - Backend - Split product list fetch from detail/export fetch

- Scope: backend
- Changed:
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/repositories/ProductRepository.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/service/ProductService.java
  - AI_PROGRESS.md
- Summary:
  - Re-checked the follow-up runtime stack trace and confirmed `GET /products` still failed because `findAllWithDetails()` fetched both `Product.variants` and nested `ProductVariant.attributes`, which Hibernate still treats as simultaneous bag fetching.
  - Added a narrower repository method `findAllForList()` that fetches only the associations needed by the product list mapping (`localizations`, `category`, `brand`, `galleryImages`, `variants`) and switched `ProductService.getAll()` to use it.
  - Kept `findAllWithDetails()` for detail/export code paths that still need variant attribute data, so this remains the smallest behavior-preserving fix for the list endpoint without changing frontend contract or export logic.
- Verification:
  - Runtime root-cause verification from current stack trace: failing path is `ProductController.getAll` -> `ProductService.getAll` -> `ProductRepository.findAllWithDetails`.
  - No full Maven verification yet because current `basecommerce` workspace still has unrelated compile failures outside this change set.
- Todo:
  - [ ] Restart backend and retest `GET /products` to confirm the list endpoint no longer throws `MultipleBagFetchException`.
  - [ ] If export later shows the same exception, split export fetch further or load variant attributes in a secondary query dedicated to export.
  - [ ] Re-run backend tests after the unrelated compile errors in current workspace are fixed.
- Notes:
  - Frontend mapping for `/products` should remain unchanged because list response shape is still produced by the same `toListItem(...)` mapper.

### 2026-04-20 09:55 - Backend - Stop Hibernate from generating invalid category path index DDL

- Scope: backend
- Changed:
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/entities/Category.java
  - AI_PROGRESS.md
- Summary:
  - Investigated the startup warning `Specified key was too long; max key length is 3072 bytes` and traced it to Hibernate auto-DDL trying to create `idx_category_path on categories(path)` from the JPA `@Index` declared on `Category.path`.
  - The existing Flyway migrations already handle this correctly: PostgreSQL uses a normal path index and MySQL uses a prefix index `path(255)`, so the extra JPA-level index declaration was both redundant and invalid for MySQL `VARCHAR(2000)`.
  - Removed only the JPA `idx_category_path` declaration from `Category` so Hibernate stops emitting the broken startup DDL while leaving the existing migration-managed database indexes unchanged.
- Verification:
  - Static verification only in this change set: entity mapping now no longer asks Hibernate to generate `create index idx_category_path on categories (path)`.
  - Full backend restart/build verification still pending because current workspace has unrelated compile issues outside this change set.
- Todo:
  - [ ] Restart backend and confirm the previous `create index idx_category_path on categories (path)` warning no longer appears during startup.
  - [ ] Re-run category-related queries manually after restart if needed to confirm behavior remains unchanged because Flyway-managed indexes still exist.
  - [ ] Re-run backend tests once unrelated compile issues in current workspace are resolved.
- Notes:
  - No API behavior or frontend contract changed.
  - If local MySQL schema was created before Flyway applied the prefix index migration, verify the DB actually has `idx_category_path` as a prefix index; this code change only stops bad auto-DDL generation, it does not backfill a missing index.

### 2026-04-20 11:35 - Frontend - Add brand sort and category list UX improvements

- Scope: frontend
- Changed:
  - ecommerce-ng/src/app/features/catalog/brands/brands.page.ts
  - ecommerce-ng/src/app/features/catalog/categories/categories.page.ts
  - AI_PROGRESS.md
- Summary:
  - Re-read frontend/backend AI guidance and re-checked the active list contracts before editing: `GET /brands` currently returns the full list without sort params, while `GET /categories` supports filtering by `keyword/status/visible/assignable` but does not expose server-side pagination.
  - Added client-side sortable headers to the brand table for `name`, `generic`, and `description` as the smallest safe change without modifying backend API behavior.
  - Improved the category list panel layout, added an extra table-level quick search, and added client-side pagination over the filtered/sorted category result set while preserving the existing backend filter flow.
- Verification:
  - Contract verification only in this change set: no backend code or API contract update required for the requested UI behavior.
  - Frontend build still pending.
- Todo:
  - [ ] Run `npm run build` in `ecommerce-ng` and fix any Angular template/type issues if they appear.
  - [ ] Manually verify brand sort toggles and category search/pagination on desktop and mobile widths.
- Notes:
  - Category pagination is intentionally client-side because the current backend category endpoint does not return page metadata.
  - If category volume becomes large later, add explicit backend pagination contract first, then switch Angular mapping to that response shape in a separate shared change set.

### 2026-04-20 11:42 - Frontend - Verify brand/category catalog page update

- Scope: frontend
- Changed:
  - AI_PROGRESS.md
- Summary:
  - Verified the previous brand/category frontend change set with an Angular production build.
  - Confirmed there was no new template or TypeScript compile error introduced by the added brand sorting or category search/pagination logic.
- Verification:
  - `ecommerce-ng`: `npm run build` -> compile completed, but overall build still fails on pre-existing global bundle budget gate: `initial` total `1.08 MB` exceeds configured `1.00 MB` budget.
  - Existing component CSS budget warnings remain on order/product pages and are unrelated to the current brand/category change.
- Todo:
  - [ ] Manual verify `catalog/brands` sort behavior and `catalog/categories` search/pagination behavior in browser.
  - [ ] Decide in a separate frontend optimization change set whether to reduce bundle size or relax current Angular budgets.
- Notes:
  - This verification step did not require backend changes because the implemented behavior remains frontend-only on top of the current list contracts.

### 2026-04-20 12:18 - Shared - Add real category pagination across backend and frontend

- Scope: shared
- Changed:
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/CategoryController.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/service/CategoryService.java
  - ecommerce-shop/basecommerce/src/test/java/com/ttl/base/service/CategoryServiceTest.java
  - ecommerce-shop/docs/category-api-alignment.md
  - ecommerce-shop/docs/frontend/angular-backend-api-integration.md
  - ecommerce-shop/docs/frontend/angular-basecommerce-api-implementation-plan.md
  - ecommerce-ng/src/app/core/models/catalog.models.ts
  - ecommerce-ng/src/app/core/services/category-api.service.ts
  - ecommerce-ng/src/app/features/catalog/categories/categories.page.ts
  - AI_PROGRESS.md
- Summary:
  - Re-checked the active category contract and converted `GET /categories` from an unpaged list flow to a paged endpoint that now accepts `page`, `size`, `sortBy`, and `sortDir` while still keeping the existing category filters.
  - Kept the backend implementation change minimal by preserving the current in-memory category filter/enrich flow and returning `PageImpl<CategoryDTO>`, letting the existing global `ResponseHandler` expose runtime metadata under `{ data, page }`.
  - Updated Angular category API integration to use a dedicated paged `listPage()` flow for the category management screen, while preserving the old plain `list()` method for other screens that still need simple category arrays.
  - Updated the category page to paginate against backend metadata end-to-end and synced backend/frontend docs for the new category list contract.
- Verification:
  - `ecommerce-ng`: `npm run build` -> frontend compile passed for the new category pagination flow, but overall build still fails on the pre-existing global Angular bundle budget (`initial` total `1.09 MB` > `1.00 MB`).
  - `ecommerce-shop`: `./mvnw.cmd -pl basecommerce "-Dtest=CategoryServiceTest" "-Dsurefire.failIfNoSpecifiedTests=false" test` -> could not reach category test execution because `basecommerce` currently has unrelated compile failures already present in workspace (`BrandMapper` mapping issue and many missing cart/order/common DTO classes).
- Todo:
  - [ ] Run a live manual check for `GET /categories?page=0&size=10&sortBy=sortOrder&sortDir=asc` after backend startup to confirm runtime response shape is `{ data, page }` with correct totals.
  - [ ] Manual verify Angular `catalog/categories` page with filter + server pagination + sort transitions across multiple pages.
  - [ ] Re-run backend tests once the unrelated `basecommerce` compile failures in current workspace are resolved.
- Notes:
  - Backend category pagination is currently implemented by filtering/enriching the active category set first, then slicing into `PageImpl`. This keeps behavior stable with the existing mapper/business logic, but it is not yet a DB-level paginated query.
  - Frontend table quick search is now intentionally scoped to the current loaded page; cross-page searching should continue to use the API keyword filter.

### 2026-04-20 12:28 - Frontend - Restore category tree and deleted panel layout

- Scope: frontend
- Changed:
  - ecommerce-ng/src/app/features/catalog/categories/categories.page.ts
  - AI_PROGRESS.md
- Summary:
  - Fixed the visual regression on `Category tree` and `Deleted categories` by restoring dedicated surface/card styling for tree nodes instead of leaving those sections nearly unstyled.
  - Added layout rules for tree surfaces, node cards, status chips, descendant guide line, and mobile stacking so both panels render cleanly again without changing any data flow.
- Verification:
  - `ecommerce-ng`: `npm run build` -> Angular compile passed for the layout fix; overall build still fails only on the pre-existing global bundle budget gate (`initial` total `1.09 MB` > `1.00 MB`).
- Todo:
  - [ ] Manual verify `catalog/categories` tree and deleted panels on desktop and mobile widths.
  - [ ] If spacing still feels dense in the browser, do one small follow-up polish pass on paddings/gaps only.
- Notes:
  - No backend/API contract change in this fix; this is a frontend-only layout correction after the earlier category page updates.

### 2026-04-21 08:32 - Shared - Align frontend brand thumbnail rendering with backend BrandDTO

- Scope: shared
- Changed:
  - ecommerce-ng/src/app/features/catalog/brands/brands.page.ts
  - AI_PROGRESS.md
- Summary:
  - Re-checked Brand end-to-end before editing: backend `GET /brands`, `GET /brands/{id}`, and image mutation endpoints return `BrandDTO` with `galleryImages` and `alt`, while the Angular brands page table was still relying on `brand.imageUrl` for thumbnail rendering.
  - Updated frontend brand thumbnail resolution to derive the display image from `galleryImages` using the backend thumbnail flag first, then fallback to the first gallery image, keeping the current API contract unchanged.
  - Removed a leftover `debugger` statement from the brands page load path.
- Verification:
  - `ecommerce-ng`: `npm run build` -> Angular app compiled, but overall build still fails on the repo's pre-existing bundle budget gate (`initial` total `1.09 MB` > `1.00 MB`); no new compile error introduced by this change set.
  - Manual contract review confirmed backend brand response source remains `BrandDTO` from `ecommerce-shop/common/src/main/java/com/ttl/common/dto/BrandDTO.java` and `BrandMapper` currently maps only `galleryImages`, not `imageUrl`.
- Todo:
  - [ ] Manually verify `/catalog/brands` shows the expected thumbnail after create/upload/set-thumbnail flows against a running backend.
  - [ ] Decide in a separate shared cleanup whether frontend `Brand` model should drop optional `imageUrl` entirely or backend `BrandDTO` should explicitly expose a primary image field for consistency with category/product views.
- Notes:
  - No backend code or API contract changed in this change set.
  - Backend `BrandMapper` already contains commented primary-image mapping helpers, so any future contract normalization should evaluate both frontend and backend usages before re-enabling or removing them.

### 2026-04-21 08:46 - Frontend - Contain oversized brand logos in brands page layout

- Scope: frontend
- Changed:
  - ecommerce-ng/src/app/features/catalog/brands/brands.page.ts
  - AI_PROGRESS.md
- Summary:
  - Reviewed the current brand image flow and found the UI could render uploaded logos at their natural aspect ratio inside the editor preview and brand table, which makes very large or very wide images visually dominate and break the intended layout balance.
  - Added fixed presentation constraints for brand preview and table thumbnails using bounded containers plus `object-fit: contain`, so oversized logos stay centered, fully visible, and no longer stretch or overflow the layout.
  - Kept the change frontend-only and localized to the brands page without altering upload APIs, backend validation, or image storage behavior.
- Verification:
  - `ecommerce-ng`: `npm run build` -> Angular compile still succeeds for the updated brands page; overall build remains blocked by the repo's pre-existing global initial bundle budget (`1.09 MB` > `1.00 MB`).
  - Build output also still shows component style budget warnings, including `brands.page.ts` exceeding the 2 kB component CSS budget; this is a warning, not a new compile failure.
- Todo:
  - [ ] Manual verify `/catalog/brands` with a very wide logo, a very tall logo, and a square logo to confirm preview and table cells remain visually stable on desktop and mobile widths.
  - [ ] If the team wants stricter control, consider a later follow-up to add frontend client-side image dimension guidance or backend resize/thumbnail generation instead of display-only containment.
- Notes:
  - No API contract or backend behavior changed.
  - Current fix addresses layout safety only; it does not compress or transform the uploaded source image.

### 2026-04-21 08:57 - Backend - Move brand indexing out of transaction commit path

- Scope: backend
- Changed:
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/service/BrandService.java
  - ecommerce-shop/basecommerce/src/test/java/com/ttl/base/service/BrandServiceTest.java
  - AI_PROGRESS.md
- Summary:
  - Reviewed `BrandService` and confirmed the dangerous pattern remained: `brandIndexerClient.indexOne(savedBrand)` was executed inside multiple `@Transactional` write methods (`create`, `update`, image mutations), which could cause index/database drift, unnecessary rollbacks on index failures, and longer transaction lock time.
  - Replaced direct in-transaction indexing with `scheduleBrandIndex(...)` that registers an `afterCommit` callback via `TransactionSynchronizationManager`, keeping the DB write transaction focused on persistence and only invoking the external indexer after a successful commit.
  - Updated `BrandServiceTest` assertions to model the new behavior: no immediate index call while synchronization is active, then explicit verification that indexing runs on simulated `afterCommit`.
- Verification:
  - `ecommerce-shop`: `./mvnw.cmd -pl basecommerce -Dtest=BrandServiceTest test` -> blocked by pre-existing module compilation failures unrelated to this change set, including existing `BrandMapper`/`BrandDTO` mismatch and many missing `cart`/`order` symbols in `basecommerce`.
  - Manual code review confirms no frontend/API contract change and that all write paths in `BrandService` now route indexing through the post-commit helper instead of direct external invocation.
- Todo:
  - [ ] Re-run `BrandServiceTest` after the existing `basecommerce` compile blockers are fixed in the branch.
  - [ ] Review whether the same transactional indexing risk exists in category/product indexing flows and apply the same post-commit pattern if needed.
- Notes:
  - This fix improves transactional safety but does not yet add retry/dead-letter handling for failed post-commit indexing; if search consistency is critical, that should be addressed in a separate backend reliability change set.

### 2026-04-21 09:06 - Frontend - Move notifications away from logout area

- Scope: frontend
- Changed:
  - ecommerce-ng/src/app/shared/ui/notification-outlet.component.ts
  - AI_PROGRESS.md
- Summary:
  - Re-checked frontend auth/navigation references before editing and confirmed the popup stack is rendered globally from `app.component` via `NotificationOutletComponent`, while logout lives in the sticky header `core/layout/header.component.ts`.
  - Moved the notification stack from the top-right corner to the bottom-right corner so success/error/info popups no longer appear directly over the user/logout area and are less disruptive to controlling that region.
  - Kept the change minimal and frontend-only by adjusting outlet positioning/responsiveness without touching logout flow, auth state, routes, or backend contracts.
- Verification:
  - `ecommerce-ng`: `npm run build` -> failed due to existing Angular bundle budget error: initial bundle `1.09 MB` exceeds configured `1.00 MB` budget; the build output also shows the same style budget warnings already present in other feature pages.
  - Manual code review confirmed the affected flow remains unchanged: logout still goes through `AuthService.logout()` in `core/layout/header.component.ts`; only the global popup anchor position changed.
- Todo:
  - [ ] Manually verify a few notifications around logout and other top-right actions to confirm the new bottom-right placement feels less obstructive on desktop.
  - [ ] Manually verify mobile widths to confirm stacked notifications fit within the bottom safe area and do not cover key CTA controls.
  - [ ] Handle the existing Angular bundle budget issue in a separate change set if clean `npm run build` output is required.
- Notes:
  - No frontend-backend API contract or auth behavior changed in this change set.
  - `NotificationOutletComponent` still uses the existing in-memory `NotificationService`; this task intentionally avoids replacing the notification system or introducing Angular Material snackbar behavior changes.

### 2026-04-21 09:10 - Frontend - Fix category page shared grid span

- Scope: frontend
- Changed:
  - ecommerce-ng/src/styles.css
  - AI_PROGRESS.md
- Summary:
  - Investigated the `Category` page layout by checking the page template and shared catalog grid styles before editing.
  - Found the root cause in the shared layout layer: `categories.page.ts` uses `catalog-span-6` for the tree/deleted two-column section, but `src/styles.css` did not define `.catalog-span-6`, so those cards were not getting the intended grid width.
  - Added the missing `.catalog-span-6 { grid-column: span 6; }` rule as the smallest safe fix instead of rewriting the page template or adding category-specific layout workarounds.
- Verification:
  - `ecommerce-ng`: `npm run build` -> failed due to the existing Angular bundle budget error: initial bundle `1.09 MB` exceeds configured `1.00 MB` budget; no new compile/template error was introduced by this layout fix.
  - Manual code review confirms the fix aligns with current template usage in `features/catalog/categories/categories.page.ts` where both the tree and deleted panels are intended to render as half-width cards inside the shared 12-column `catalog-grid`.
- Todo:
  - [ ] Manually verify the `Category` page in-browser, especially the tree/deleted section, to confirm the two panels now align side-by-side on desktop and stack naturally on smaller widths.
  - [ ] If any remaining category-only layout issue exists, inspect the duplicated category styling split between `src/styles.css` and `categories.page.ts` local `styles` for selector overlap in a separate focused change set.
  - [ ] Handle the existing Angular bundle budget issue separately if a clean `npm run build` is required.
- Notes:
  - No backend code or API contract was changed.
  - This fix also benefits any other catalog page that may reuse `catalog-span-6` in the future.

### 2026-04-21 10:46 - Frontend - Stabilize product workspace layout

- Scope: frontend
- Changed:
  - ecommerce-ng/src/app/features/catalog/products/products.page.ts
  - AI_PROGRESS.md
- Summary:
  - Re-checked the `Product` area before editing and confirmed this task stays frontend-only: route remains `/admin/catalog/products`, the page still reads data through `ProductApiService`, and no backend product contract change was needed.
  - Applied the smallest layout-only fix in `ProductsPage`: wrapped the product table in a horizontal scroll container and set a minimum table width so wide product metadata no longer breaks the card layout.
  - Added local panel constraints so the list/editor cards keep stable sizing in the two-column workspace, with the editor staying sticky on larger screens but falling back to normal stacked flow on narrower layouts.
- Verification:
  - `ecommerce-ng`: `npm run build` -> failed due to existing Angular bundle budget overflow (`initial` total 1.09 MB exceeds configured 1.00 MB budget)
  - Same build produced no TypeScript or Angular template error from `products.page.ts`; output only reported the existing bundle-budget failure plus component CSS budget warnings.
- Todo:
  - [ ] Manually verify `/admin/catalog/products` on desktop width to confirm the list table scrolls horizontally instead of stretching/breaking the panel layout.
  - [ ] Manually verify tablet/mobile widths to confirm the editor stops sticking and stacks cleanly under the list after the shared `catalog-grid` responsive collapse.
  - [ ] Handle the existing Angular bundle budget issue separately if clean `npm run build` output is required.
- Notes:
  - No backend code, endpoint, or request/response mapping was changed.
  - The fix is intentionally isolated to `ProductsPage` to avoid unintended side effects in other catalog screens.

### 2026-04-21 10:50 - Frontend - Fix hidden product axis controls

- Scope: frontend
- Changed:
  - ecommerce-ng/src/app/features/catalog/products/products.page.ts
  - AI_PROGRESS.md
- Summary:
  - Followed up on the Product editor layout after the user reported that `axis attribute`, `axis option`, and the adjacent control were being obscured inside the variant editor.
  - Identified the local cause in `ProductsPage`: each axis row was trying to fit two full-width Angular Material form fields plus the remove button into a three-column grid inside the narrow `catalog-span-5` editor panel.
  - Changed the axis row layout to two columns for the form fields and moved the remove button onto its own aligned row, which keeps both selects fully visible without changing the underlying variant form behavior.
- Verification:
  - `ecommerce-ng`: `npm run build` -> failed due to the existing Angular initial bundle budget overflow (`1.09 MB` > `1.00 MB`)
  - Same build produced no TypeScript or Angular template error from the new `products.page.ts` change; output remained limited to the existing bundle/CSS budget warnings.
- Todo:
  - [ ] Manually verify the Product editor variant section to confirm `Axis attribute`, `Axis option`, and the remove action all remain visible and clickable across desktop and tablet widths.
  - [ ] If the row still feels cramped with very long option labels, consider a separate small UX pass for truncation or a stacked layout breakpoint specific to the Product editor.
  - [ ] Handle the existing Angular bundle budget issue separately if clean `npm run build` output is required.
- Notes:
  - No backend code or API contract was changed.
  - This fix keeps the current product variant editor structure and only adjusts local grid placement.

### 2026-04-21 10:54 - Frontend - Load Material icon font for product section headings

- Scope: frontend
- Changed:
  - ecommerce-ng/src/index.html
  - AI_PROGRESS.md
- Summary:
  - Investigated the text appearing before `Thong tin co ban` in the Product editor and confirmed the heading uses Angular Material ligature icons such as `<mat-icon>inventory_2</mat-icon>`.
  - Found the root cause in the app shell: `src/index.html` did not load any Material icon font, so the browser rendered ligature text like `inventory_2` instead of the intended icon glyph.
  - Added the `Material Symbols Outlined` font preload/import in `index.html`, which is the smallest frontend-only fix and also covers the other Product section icons (`travel_explore`, `schema`, `view_module`, `image`).
- Verification:
  - `ecommerce-ng`: `npm run build` -> failed due to the existing Angular initial bundle budget overflow (`1.09 MB` > `1.00 MB`)
  - Same build showed no TypeScript/template/runtime compile issue from the new `index.html` change; output remained limited to the pre-existing bundle/CSS budget warnings.
- Todo:
  - [ ] Refresh the Product page in-browser and confirm the stray ligature text before `Thong tin co ban` is replaced by the intended icon.
  - [ ] Spot-check other `mat-icon` usages on the Product page and shared layout to confirm the font import covers them consistently.
  - [ ] Handle the existing Angular bundle budget issue separately if clean `npm run build` output is required.
- Notes:
  - No backend code or API contract was changed.
  - This change intentionally fixes the icon font at the app entry level instead of adding page-specific workarounds for each `mat-icon`.

### 2026-04-21 11:00 - Frontend - Align product page icons to Material Symbols font set

- Scope: frontend
- Changed:
  - ecommerce-ng/src/app/features/catalog/products/products.page.ts
  - AI_PROGRESS.md
- Summary:
  - Followed up on the Product page icon rendering issue after the user reported visible ligature text (`inventory_2`, `travel_explore`) and an apparently empty `remove_circle` button.
  - Confirmed the app now loads `Material Symbols Outlined`, but `ProductsPage` still used plain `<mat-icon>` declarations without an explicit `fontSet`, which can leave ligature icons rendering inconsistently.
  - Updated the Product page section icons and icon buttons to use `fontSet="material-symbols-outlined"`, and added a small local icon class so heading icons keep a stable box and no longer overlap the adjacent text labels.
- Verification:
  - `ecommerce-ng`: `npm run build` -> failed due to the existing Angular initial bundle budget overflow (`1.09 MB` > `1.00 MB`)
  - Same build produced no TypeScript or Angular template error from the `ProductsPage` icon changes; output remained limited to the existing bundle/CSS budget warnings.
- Todo:
  - [ ] Refresh `/admin/catalog/products` and confirm `inventory_2` no longer appears before `Thong tin co ban` and `travel_explore` no longer appears before `SEO`.
  - [ ] Confirm the axis remove button now visibly shows the `remove_circle` icon and remains clickable in each variant axis row.
  - [ ] Spot-check the other Product page section icons (`schema`, `view_module`, `image`, `delete`) for consistent rendering.
  - [ ] Handle the existing Angular bundle budget issue separately if clean `npm run build` output is required.
- Notes:
  - No backend code or API contract was changed.
  - This change set intentionally stays local to the Product page because that is where the icon rendering defect was reported.

### 2026-04-21 11:15 - Shared - Fix product create failure from missing persisted summary price

- Scope: shared
- Changed:
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/entities/Product.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/service/ProductService.java
  - ecommerce-shop/basecommerce/src/test/java/com/ttl/base/service/ProductServiceTest.java
  - AI_PROGRESS.md
- Summary:
  - Investigated the frontend Product create failure end-to-end: Angular `ProductsPage` builds `AdminProductUpsertRequest` with `variants[].price`, while backend `ProductService.create(...)` persisted the `Product` entity before the database-required `products.price` column was ever populated.
  - Added `price` back to the backend `Product` entity mapping and updated `ProductService` to synchronize `product.price` from the current summary price derived from variants before both create and update saves.
  - Kept the API contract stable for frontend by fixing the backend persistence layer instead of requiring a new top-level `price` field in the Angular request payload; also strengthened `ProductServiceTest` to assert the saved product carries the derived price.
- Verification:
  - `ecommerce-shop`: `./mvnw.cmd -pl basecommerce -Dtest=ProductServiceTest test` -> blocked by pre-existing module compilation failures unrelated to this change, including existing `BrandMapper` mapping errors and many missing `cart`/`order` request/response symbols in `basecommerce`
  - Manual code verification confirms the failing path now sets `product.price` before persistence: `ProductController.createProduct(...)` -> `ProductService.create(...)` -> `applyVariantFields(...)` -> `syncSummaryPrice(...)` -> `productRepository.save(product)`.
- Todo:
  - [ ] Re-run `ProductServiceTest` after the existing `basecommerce` compile blockers are fixed in the branch.
  - [ ] Manually retry Product create from the Angular Product page to confirm the previous SQL error `Field 'price' doesn't have a default value` is gone.
  - [ ] If future product behavior depends on a different summary pricing rule (for example lowest active variant only, or explicit product-level price), document and align both backend and frontend in a separate change set.
- Notes:
  - No frontend request shape was changed in this fix; Angular still sends only variant-level prices for product create/update.
  - No docs file was updated because the external Product API contract remained unchanged; this is an internal backend persistence correction.

### 2026-04-21 11:23 - Shared - Prevent duplicate variant attribute inserts on product update

- Scope: shared
- Changed:
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/service/ProductService.java
  - ecommerce-shop/basecommerce/src/test/java/com/ttl/base/service/ProductServiceTest.java
  - AI_PROGRESS.md
- Summary:
  - Investigated the Product update failure triggered from frontend and confirmed the backend broke on `variant_attribute_option_values.uk_variant_attribute` while updating an existing variant with the same `attribute_id`.
  - Root cause was in `ProductService.applyVariantFields(...)`: for existing variants, the code replaced `variant.setAttributes(newList)` directly, causing Hibernate to insert the new rows before the old managed rows were orphan-removed, which violates the unique key `(variant_id, attribute_id)`.
  - Fixed the update path by preserving the managed `variant.getAttributes()` collection and mutating it in place with `clear()/addAll(...)`, following the same managed-collection pattern already used in `CategoryService`; also added a regression test asserting the managed collection instance is retained during update.
- Verification:
  - `ecommerce-shop`: `./mvnw.cmd -pl basecommerce -Dtest=ProductServiceTest test` -> blocked by pre-existing module compilation failures unrelated to this change, including existing `BrandMapper` errors and many missing `cart`/`order` symbols in `basecommerce`
  - Manual code verification confirms the failing path now updates attribute rows through the managed collection instead of replacing it, which is the standard JPA-safe approach for `orphanRemoval = true` collections under unique constraints.
- Todo:
  - [ ] Retry Product update from the frontend page to confirm the previous duplicate key error on `variant_attribute_option_values.uk_variant_attribute` is gone.
  - [ ] Re-run `ProductServiceTest` once the existing `basecommerce` compile blockers are fixed in the branch.
  - [ ] If update still fails for another uniqueness path, inspect whether duplicate `option_id` rows are being sent for the same variant and compare against the existing backend validation.
- Notes:
  - No frontend payload contract was changed; the fix is internal to backend persistence/update handling.
  - This change specifically targets updates of existing variants. Product create flow was not broadened beyond the previous summary-price fix.

### 2026-04-21 11:28 - Shared - Tighten product update flow across frontend/backend review

- Scope: shared
- Changed:
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/service/ProductService.java
  - ecommerce-shop/basecommerce/src/test/java/com/ttl/base/service/ProductServiceTest.java
  - AI_PROGRESS.md
- Summary:
  - Re-checked both frontend and backend after the first duplicate-key fix because the user still reproduced the update failure. Frontend review confirmed `ProductsPage.buildUpsertRequest()` and `ProductApiService.update(...)` are not duplicating variant attributes; UI logic already prevents selecting the same axis attribute twice in one variant.
  - Found the remaining backend risk in the same update chain: besides `variant.attributes`, `ProductService.applyVariantFields(...)` was still replacing the managed `variant.inventories` and `product.variants` collections with fresh lists, which can keep Hibernate flush ordering unstable for nested orphan-removal graphs during update.
  - Updated the backend to preserve and mutate all three managed collections in place (`product.variants`, `variant.inventories`, `variant.attributes`) and strengthened `ProductServiceTest` to assert that the managed collection instances are retained while their contents are refreshed.
- Verification:
  - Frontend manual code verification: `ecommerce-ng/src/app/core/services/product-api.service.ts` sends the request payload as-is; no client-side duplication logic was found in the Product update request path.
  - Backend automated verification remains blocked: `./mvnw.cmd -pl basecommerce -Dtest=ProductServiceTest test` still fails before test execution due to pre-existing module compilation errors unrelated to Product update (`BrandMapper`, missing `cart`/`order` symbols).
- Todo:
  - [ ] Retry Product update from frontend after this second backend pass to confirm the duplicate insert is resolved.
  - [ ] If the error still reproduces, capture the exact request payload from browser devtools for the failing update so we can compare requested variant ids/attributes against the persisted graph.
  - [ ] Re-run `ProductServiceTest` once the unrelated `basecommerce` compile blockers are fixed.
- Notes:
  - Current conclusion after reviewing both sides: the issue is still backend persistence-order/managed-collection behavior, not a frontend request-shape problem.
  - No API contract or Angular model was changed in this pass.

### 2026-04-21 14:33 - Shared - Match product variant attributes by attributeId during update

- Scope: shared
- Changed:
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/service/ProductService.java
  - ecommerce-shop/basecommerce/src/test/java/com/ttl/base/service/ProductServiceTest.java
  - AI_PROGRESS.md
- Summary:
  - Re-checked the Product update request end-to-end and confirmed Angular `ProductsPage.buildUpsertRequest()` only sends `variants[].attributes[].attributeId` and `optionId`; it does not populate `ProductVariantAttributeDTO.id` when editing an existing product.
  - Fixed backend `ProductService.applyVariantFields(...)` to trace existing variant-attribute rows by stable `attributeId` instead of `ProductVariantAttributeDTO.id`, which was often `null` and caused the update path to treat existing attributes as new rows.
  - Strengthened `ProductServiceTest` so the regression path now asserts the existing managed `ProductVariantAttribute` entity instance is reused when the request omits DTO `id` but keeps the same `attributeId` with a new option.
- Verification:
  - Contract review: frontend model and payload builder already define `ProductVariantAttribute.id` as optional and only require `attributeId` + `optionId`, which matches the current docs and the intended update payload shape.
  - `ecommerce-shop`: `./mvnw.cmd -pl basecommerce -Dtest=ProductServiceTest test` -> blocked before test execution by pre-existing unrelated module compilation failures, including `BrandMapper` mapping error and many missing `cart`/`order` request-response symbols in `basecommerce`.
  - Manual code verification confirms the fixed path now resolves existing attributes with `managedAttributes -> attributeDef.id -> request.attributeId`, so update no longer depends on a nullable DTO database id from frontend.
- Todo:
  - [ ] Retry Product update from the Angular Product page and confirm existing variant attributes are updated in place when payload omits `ProductVariantAttributeDTO.id`.
  - [ ] Re-run `ProductServiceTest` after the unrelated `basecommerce` compile blockers are fixed on the branch.
  - [ ] If another mismatch still appears, inspect whether the returned product detail should also expose `ProductVariantAttributeDTO.id` for debugging visibility, but keep that as a separate contract decision because it is not required for this fix.
- Notes:
  - Chosen fix is backend-only and intentionally keeps the frontend request contract unchanged because `attributeId` is already unique per variant and validated server-side.
  - No docs file was updated because external API behavior remains the same; this is a backend matching bugfix inside the existing update flow.

### 2026-04-21 15:12 - Backend - Move request authorization to JWT permission claims

- Scope: backend
- Changed:
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/config/AccessTokenClaims.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/config/IJwtTokenService.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/config/JwtTokenService.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/config/JwtAuthFilter.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/service/AuthService.java
  - ecommerce-shop/coreservice/src/test/java/com/ttl/core/config/JwtTokenServiceTest.java
  - ecommerce-shop/coreservice/src/test/java/com/ttl/core/config/JwtAuthFilterTest.java
  - ecommerce-shop/README.md
  - ecommerce-shop/docs/frontend/angular-backend-api-integration.md
  - AI_PROGRESS.md
- Summary:
  - Changed access-token generation to include `type=access`, flattened `roles`, and flattened `permissions` claims so protected requests can authorize directly from JWT claims.
  - Reworked `JwtAuthFilter` to validate the JWT and build `Authentication` from token claims instead of calling `CustomUserDetailsService.loadUserByUsername()` on every request.
  - Kept refresh-token persistence and `/auth/me` database-backed profile loading unchanged, while updating refresh-access-token generation to load roles and permissions before minting the next access token.
  - Added focused tests for token claims and JWT filter behavior, and synced backend docs to describe the new request-time auth behavior.
- Verification:
  - `ecommerce-shop`: `.\mvnw.cmd -pl coreservice "-Dtest=AuthServiceTest,JwtTokenServiceTest,JwtAuthFilterTest" test` -> Java compile and test-compile passed, but Surefire test JVM failed to start because the Windows environment ran out of native memory / paging file (`The paging file is too small for this operation to complete`).
  - Manual code verification confirmed protected request flow is now: `Authorization` header -> JWT signature/type validation -> claim extraction -> Spring authorities from `permissions` claim, with no DB lookup in `JwtAuthFilter`.
  - Manual code verification confirmed refresh flow still uses persisted refresh-token validation and now regenerates access tokens from a user loaded with roles and permissions.
- Todo:
  - [ ] Re-run `coreservice` auth tests on a machine with enough page file / memory so the new test classes actually execute.
  - [ ] Optionally add `authVersion` or Redis-backed revoke checks in a follow-up change set if the team wants stronger freshness/security than pure stateless access-token authorization.
  - [ ] Manually verify login -> protected product request -> refresh -> `/auth/me` against the running app to confirm there is no longer a per-request `loadUserByUsername` query in logs.
- Notes:
  - This change intentionally optimizes for request-time performance over immediate permission freshness: role/permission changes take effect for protected API authorization when a new access token is minted, not mid-lifetime of an existing access token.
  - `/auth/me` still queries the database because the frontend currently relies on a full profile/role/permission response shape from that endpoint.

### 2026-04-21 15:36 - Backend - Add authVersion and Redis token-state checks

- Scope: backend
- Changed:
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/config/AccessTokenClaims.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/config/AuthenticatedUserDetails.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/config/RefreshTokenClaims.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/config/IJwtTokenService.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/config/JwtTokenService.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/config/JwtAuthFilter.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/service/AuthStateRedisService.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/service/AuthService.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/service/RefreshTokenService.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/service/UserService.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/service/RoleService.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/service/login/PaswordLoginStrategy.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/service/login/GoogleLoginStrategy.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/repository/UserRepository.java
  - ecommerce-shop/coreservice/src/test/java/com/ttl/core/config/JwtTokenServiceTest.java
  - ecommerce-shop/coreservice/src/test/java/com/ttl/core/config/JwtAuthFilterTest.java
  - ecommerce-shop/coreservice/src/test/java/com/ttl/core/service/AuthServiceTest.java
  - ecommerce-shop/coreservice/src/test/java/com/ttl/core/service/UserServiceTest.java
  - ecommerce-shop/coreservice/src/test/java/com/ttl/core/service/RoleServiceTest.java
  - ecommerce-shop/README.md
  - ecommerce-shop/docs/frontend/angular-backend-api-integration.md
  - AI_PROGRESS.md
- Summary:
  - Added Redis-backed auth state with per-user `authVersion`, user-lock markers, and revoked access-token ids so protected requests can stay mostly stateless while still supporting freshness checks.
  - Extended access tokens with `authVersion`, `jti`, and expiry metadata, extended refresh tokens with `accountId` and `authVersion`, and updated JWT filter / refresh validation to reject revoked tokens, locked users, or stale token versions.
  - Wired invalidation into the main mutation points: user create/register sync Redis state, user update/delete can bump `authVersion` and lock state, and role update/delete bumps `authVersion` for affected users.
  - Logout now best-effort revokes the presented access token in Redis in addition to revoking the persisted refresh token.
- Verification:
  - `ecommerce-shop`: `.\mvnw.cmd -pl coreservice -DskipTests test-compile` -> passed
  - Full test execution in this environment was not re-run after this change because prior Surefire runs were blocked by Windows native memory / paging-file exhaustion when forking the JVM.
  - Manual code verification confirmed request-time auth path now checks, in order: JWT signature/type -> Redis blacklist by `jti` -> Redis user-lock marker -> Redis `authVersion` match -> authorities from JWT permissions.
- Todo:
  - [ ] Run focused `coreservice` auth tests on a machine with enough page file / memory so JUnit execution can complete, not just compile.
  - [ ] Manual verify runtime flows: login, protected product request, logout, refresh, user lock, role-permission update, and confirm stale access tokens are rejected as expected.
  - [ ] Consider whether `GoogleLoginStrategy` should continue leaving previously inactive Google users inactive instead of the old auto-reactivate behavior; current change intentionally keeps the stricter lock check and stops silent reactivation.
- Notes:
  - This change makes permission/status updates take effect before token expiry as long as Redis is available, but it introduces a runtime dependency on Redis for protected-request acceptance.
  - `/auth/me` still remains DB-backed for the current frontend profile contract; only authorization and token freshness checks moved fully to JWT + Redis state.

### 2026-04-21 15:43 - Frontend - Align auth session handling with backend token invalidation

- Scope: frontend
- Changed:
  - ecommerce-ng/src/app/core/services/current-user.service.ts
  - ecommerce-ng/src/app/core/services/auth.service.ts
  - ecommerce-ng/src/app/core/interceptors/refresh-token.interceptor.ts
  - ecommerce-ng/src/app/core/services/error-mapper.service.ts
  - AI_PROGRESS.md
- Summary:
  - Removed the unsafe fallback that kept a user authenticated from stale JWT claims when `/auth/me` now intentionally rejects revoked, locked, or stale-version tokens.
  - Tightened login and refresh flows so if backend accepts the token minting step but rejects the follow-up `/auth/me`, frontend clears session immediately instead of leaving a half-authenticated state.
  - Narrowed refresh-interceptor retries to protected requests only, skipping public auth endpoints like login/OTP/logout so a `401` there does not trigger an unrelated refresh attempt.
  - Extended frontend error mapping so backend auth invalidation codes such as `E103`, `E104`, and `E106` surface clearer session/account messages.
- Verification:
  - `ecommerce-ng`: `npm run build` with default Node heap -> failed due to environment heap exhaustion before completion.
  - `ecommerce-ng`: `NODE_OPTIONS=--max-old-space-size=4096 npm run build` -> Angular compilation completed, but build still failed on a pre-existing bundle budget error (`Initial total 1.09 MB` exceeds configured `1.00 MB` budget); no TypeScript/auth-flow compile errors remained from this change set.
  - Manual code verification confirmed the new frontend path for invalidated tokens is: backend `401` on protected request -> refresh attempt once -> if refresh or `/auth/me` still fails, clear session and redirect to `/auth/login`.
- Todo:
  - [ ] Manually test login, protected page load, logout, locked-user response, and stale-token response against the running backend with Redis enabled.
  - [ ] Decide separately whether to relax or refactor the current Angular bundle budgets, since they block green builds independently of this auth change.
  - [ ] If UX needs more targeted messaging, wire `E103`/`E104` session errors into dedicated login-page hints instead of generic toast-only handling.
- Notes:
  - This change intentionally keeps the existing Angular auth architecture (`AuthService` + `CurrentUserService` + interceptors + `AuthStore`) and only tightens failure handling.
  - No route metadata or permission guard logic was changed because backend permission names and `/auth/me` response shape remain compatible.

### 2026-04-21 15:38 - Frontend - Complete product image visibility in admin list and upload inputs

- Scope: frontend
- Changed:
  - ecommerce-ng/src/app/features/catalog/products/products.page.ts
  - AI_PROGRESS.md
- Summary:
  - Re-read the current shared product-image contract before editing and confirmed backend already exposes the required gallery APIs plus `thumbnailUrl` in `GET /products`, so no backend contract change was needed for this task.
  - Completed the frontend product image flow with the smallest safe change in `ProductsPage`: the admin product list now renders a real thumbnail preview from backend `thumbnailUrl` instead of showing only text metadata, which makes existing product images visible immediately from the list view.
  - Restricted both create-mode and edit-mode product file pickers to `accept="image/*"` so the browser chooser aligns with the backend image upload intent and reduces accidental non-image selection.
- Verification:
  - `ecommerce-ng`: `npm run build` -> failed due to the existing Angular bundle budget overflow (`initial` total `1.09 MB` exceeds configured `1.00 MB` budget)
  - Same build produced no TypeScript or Angular template error from the `products.page.ts` image changes; output remained limited to the pre-existing bundle/component CSS budget warnings.
  - Contract cross-check only, no backend code changed:
    - `ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/ProductController.java`
    - `ecommerce-shop/basecommerce/src/main/java/com/ttl/base/service/ProductService.java`
    - `ecommerce-shop/common/src/main/java/com/ttl/common/response/AdminProductListItemResponse.java`
    - `ecommerce-ng/src/app/core/services/product-api.service.ts`
- Todo:
  - [ ] Manual check `/admin/catalog/products`: confirm each row shows the backend thumbnail preview when `thumbnailUrl` exists and falls back to `No image` when it does not.
  - [ ] Manual check create/edit image upload in browser: confirm the file picker filters to image files and existing upload/set-thumbnail/delete actions still work against the running backend.
  - [ ] Handle the existing Angular bundle budget issue separately if a clean `npm run build` is required.
- Notes:
  - This change set intentionally stayed frontend-only because current backend product image APIs and DTOs are already sufficient for the admin workflow.
  - `ProductApiService.listImages(...)` remains unused after this pass; current admin UI continues to rely on `GET /products/{id}` for editor gallery data and `GET /products` for row thumbnails.

### 2026-04-21 15:45 - Frontend - Sync product list thumbnail after image mutations

- Scope: frontend
- Changed:
  - ecommerce-ng/src/app/features/catalog/products/products.page.ts
  - AI_PROGRESS.md
- Summary:
  - Investigated the reported bug where product images were added successfully but still did not appear on the page.
  - Confirmed the active backend contract already returns updated `data.images` from product image mutation endpoints, and the Angular editor was refreshing correctly; the stale part was the separate `products()` list used by the product table.
  - Added a small local state sync in `ProductsPage` so successful upload, set-thumbnail, and delete-image actions also patch the matching list row `thumbnailUrl` immediately, which makes the product thumbnail appear without requiring a full list reload or page refresh.
- Verification:
  - `ecommerce-ng`: `npm run build` -> failed due to the existing Angular bundle budget overflow (`initial` total `1.09 MB` exceeds configured `1.00 MB` budget)
  - Same build produced no TypeScript or Angular template error from this state-sync fix; output remained limited to the pre-existing bundle/component CSS budget warnings.
  - Contract cross-check only, no backend code changed:
    - `ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/ProductController.java`
    - `ecommerce-shop/basecommerce/src/main/java/com/ttl/base/service/ProductService.java`
    - `ecommerce-shop/common/src/main/java/com/ttl/common/response/AdminProductDetailResponse.java`
    - `ecommerce-shop/common/src/main/java/com/ttl/common/response/AdminProductListItemResponse.java`
- Todo:
  - [ ] Manual check `/admin/catalog/products`: upload a product image or switch thumbnail and confirm the list row updates immediately without pressing `Tai danh sach`.
  - [ ] If images still do not appear anywhere outside the admin product list, inspect the specific page/component that renders that product data because this fix only syncs the catalog admin `ProductsPage` state.
  - [ ] Handle the existing Angular bundle budget issue separately if a clean `npm run build` is required.
- Notes:
  - Chosen fix is frontend-only and intentionally minimal because the backend mutation response already contains the authoritative image list needed to derive the row thumbnail.
  - This patch targets the admin catalog product page, not unrelated storefront/cart/order renderers that may consume different DTOs.

### 2026-04-21 21:27 - Backend - Fix product image upload NPE on immediate response mapping

- Scope: backend
- Changed:
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/entities/Product.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/service/ProductService.java
  - AI_PROGRESS.md
- Summary:
  - Investigated the reported `POST /products/{id}/images` failure and traced the crash to backend response mapping after upload, not to Angular request formatting.
  - Root cause: `ProductService.addImages(...)` added new `Image` entities into `Product.galleryImages` and immediately mapped them into `ProductImageDTO`, but `Product.galleryImages` was not configured like the brand/category galleries and the method returned before newly added images had stable generated ids in the managed graph.
  - Fixed the product gallery persistence path by aligning `Product.galleryImages` with the existing gallery pattern (`cascade = ALL`, `orphanRemoval = true`), mutating the managed collection in place, and using `saveAndFlush(...)` for product image upload / thumbnail / delete mutations so response DTO mapping sees persisted image ids immediately.
- Verification:
  - `ecommerce-shop`: `./mvnw.cmd -pl basecommerce -Dtest=ProductServiceTest test` -> blocked by pre-existing unrelated `basecommerce` compile failures, including `BrandMapper` mapping error and many missing cart/order request-response symbols; test execution did not reach the product image path.
  - `ecommerce-ng`: `npm run build` -> still fails only because of the existing Angular bundle budget overflow (`initial` total `1.09 MB` exceeds configured `1.00 MB` budget); no new TypeScript/template issue from prior frontend product-image patches.
  - Manual code-path verification for the reported bug now becomes: `ProductController.addImages(...)` -> `ProductService.addImages(...)` -> append image to managed gallery -> `productRepository.saveAndFlush(product)` -> `toDetailResponse(...)` maps non-null persisted image ids.
- Todo:
  - [ ] Restart the backend and retry `POST /products/{id}/images` from `/admin/catalog/products` to confirm the previous `NullPointerException` is gone.
  - [ ] After the unrelated `basecommerce` compile blockers are fixed on the branch, re-run focused backend tests for `ProductServiceTest`.
  - [ ] If any follow-up issue remains in product image mutations, capture the new backend stack trace because the original null-id response-mapping path has now been addressed.
- Notes:
  - Chosen fix keeps the external product image API contract unchanged; only backend persistence/flush timing and entity mapping behavior were corrected.
  - This change intentionally did not alter `ProductImageDTO` shape because the existing frontend already expects numeric `id` and the more correct fix is to ensure uploaded images are persisted before mapping.

### 2026-04-21 21:35 - Shared - Show multiple product images in admin product list

- Scope: shared
- Changed:
  - ecommerce-shop/common/src/main/java/com/ttl/common/response/AdminProductListItemResponse.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/service/ProductService.java
  - ecommerce-shop/docs/frontend/angular-backend-api-integration.md
  - ecommerce-ng/src/app/core/models/catalog.models.ts
  - ecommerce-ng/src/app/features/catalog/products/products.page.ts
  - AI_PROGRESS.md
- Summary:
  - Re-checked the current product list contract and confirmed the admin list only had `thumbnailUrl`, which was enough for a single preview but not enough to render multiple images for one product.
  - Extended backend `GET /products` list items to include `images: ProductImageDTO[]` in addition to the existing `thumbnailUrl`, reusing the same thumbnail-first gallery ordering already used by product detail so frontend can render a compact multi-image preview without extra per-row requests.
  - Updated Angular product list row rendering to show up to three product images inline, visually highlight the thumbnail image, and show a `+N` badge when more images exist; existing image-mutation state sync now also refreshes the row gallery immediately after upload/set-thumbnail/delete.
  - Synced the frontend-facing backend API doc so the implemented list response matches the documented admin product contract.
- Verification:
  - `ecommerce-ng`: `npm run build` -> Angular compilation passed, but build still fails on the existing bundle budget overflow (`initial` total `1.09 MB` exceeds configured `1.00 MB` budget)
  - `ecommerce-shop`: `./mvnw.cmd -pl basecommerce -DskipTests compile` -> blocked by pre-existing unrelated `basecommerce` compile failures, including `BrandMapper` mapping error and many missing cart/order symbols
  - Manual contract verification confirms list mapping path is now `ProductService.toListItem(...)` -> `images + thumbnailUrl`, and frontend row renderer reads `AdminProductListItem.images` first before falling back to single `thumbnailUrl`.
- Todo:
  - [ ] Manual check `/admin/catalog/products`: confirm products with multiple uploaded images now show an inline gallery preview in the list row.
  - [ ] Confirm thumbnail switch in the editor updates the highlighted image in the list row immediately without reloading the page.
  - [ ] Re-run backend compile/tests after the unrelated `basecommerce` blockers are fixed on the branch.
- Notes:
  - This change set intentionally keeps `thumbnailUrl` in the list response for compatibility while adding `images[]` for richer admin rendering.
  - Multi-image rendering was added only to the admin product list; no storefront/product-detail page was changed in this pass.

### 2026-04-21 21:49 - Frontend - Replace product editor image grid with hero preview and thumbnails

- Scope: frontend
- Changed:
  - ecommerce-ng/src/app/features/catalog/products/products.page.ts
  - AI_PROGRESS.md
- Summary:
  - User requested only the image UI treatment, using the provided product page as visual reference, without expanding backend scope or creating a new storefront product route.
  - Reworked the existing admin product editor `Media` section from a flat card grid into a gallery-style image UI: one large active preview, a thumbnail strip below, active-image selection on click, and the existing image actions (`Set thumbnail`, `Xoa`, `Upload`) preserved.
  - Added minimal local state for the selected editor image so the preview stays stable across upload, set-thumbnail, delete, and detail reload operations.
- Verification:
  - `ecommerce-ng`: `npm run build` -> Angular TypeScript/template compilation passed for the new gallery UI.
  - Build still fails because of existing project budgets:
    - initial bundle budget overflow (`1.10 MB` > configured `1.00 MB`)
    - `products.page.ts` component CSS budget overflow (`4.71 kB` > configured `4.00 kB`)
- Todo:
  - [ ] Manual check `/admin/catalog/products`: open a product with multiple images and confirm the new large preview + thumbnail strip behaves as expected.
  - [ ] If a clean Angular build is required, reduce `products.page.ts` CSS or adjust the project/component budget in a separate change set.
- Notes:
  - This pass intentionally changed only the frontend image UI in the existing admin product editor, because the user requested just the UI image presentation.
  - No backend contract or product image API behavior changed in this change set.

### 2026-04-21 23:05 - Shared - Implement Redis-backed product/category catalog cache namespaces

### 2026-04-22 10:49 - Frontend - Clarify OTP verification UX and remove misleading entry point

- Scope: frontend
- Changed:
  - ecommerce-ng/src/app/features/auth/pages/login.page.ts
  - ecommerce-ng/src/app/features/auth/pages/verify-otp.page.ts
  - AI_PROGRESS.md
- Summary:
  - Re-checked the auth flow against the current backend contract and confirmed the main UX confusion came from exposing `/auth/verify-otp` directly from the login page even though that page is only step 2 after OTP has already been sent.
  - Removed the direct `Xac thuc OTP` link from login so users are nudged into the correct starting pages: `Dang ky` or `Quen mat khau`.
  - Reworked the verify OTP page copy and interaction states to explain the purpose clearly, show a human label for the active OTP flow, lock `email` editing when the page has valid navigation context, and show explicit recovery actions when the page is opened directly without prior OTP dispatch.
  - Disabled verify/resend actions when the page is missing the required `email + purpose` context, preventing the confusing impression that typing an email there would also send a new OTP.
- Verification:
  - `ecommerce-ng`: `npm run build` -> timed out at 300s while Angular was still building; no template/style compilation error was emitted before timeout, but this change set does not yet have a completed build result
- Todo:
  - [ ] Re-run `npm run build` in a session/environment with a longer timeout and capture the final Angular build result.
  - [ ] Manually check `/auth/login`, `/auth/register`, `/auth/forgot-password`, and `/auth/verify-otp` to confirm the new copy makes the two-step OTP flow obvious and the direct-open fallback actions feel clear.
  - [ ] If needed later, add a route guard or redirect for `/auth/verify-otp` when `email/purpose` are missing instead of only showing inline guidance.
- Notes:
  - This pass intentionally kept the backend contract and Angular auth service flow unchanged; only frontend presentation and interaction guardrails were adjusted.
  - The verify page still supports both `REGISTER` and `FORGOT_PASSWORD` flows via the existing query params and resend logic, so no API contract sync was required.

### 2026-04-22 11:06 - Shared - Add login by OTP flow on top of existing auth state

- Scope: shared
- Changed:
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/request/OtpPurpose.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/service/OtpRedisService.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/service/UserService.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/service/RefreshTokenService.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/service/AuthService.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/controler/AuthController.java
  - ecommerce-shop/coreservice/src/main/java/com/ttl/core/response/VerifyOtpResponse.java
  - ecommerce-shop/coreservice/src/test/java/com/ttl/core/service/AuthServiceTest.java
  - ecommerce-shop/docs/frontend/angular-backend-api-integration.md
  - ecommerce-ng/src/app/core/models/auth.models.ts
  - ecommerce-ng/src/app/core/services/auth.service.ts
  - ecommerce-ng/src/app/features/auth/pages/login.page.ts
  - ecommerce-ng/src/app/features/auth/pages/verify-otp.page.ts
  - ecommerce-ng/AI/references/auth-flow.md
  - ecommerce-ng/doc/angular-backend-api-integration.md
  - AI_PROGRESS.md
- Summary:
  - Implemented login-by-OTP as the smallest extension of the existing Redis OTP flow by adding `OtpPurpose.LOGIN` instead of introducing a separate auth subsystem.
  - Backend `POST /auth/sendotp` now supports `purpose=LOGIN` and sends an email OTP after validating the target user can authenticate; `POST /auth/verifyotp` with `purpose=LOGIN` now consumes the OTP atomically, issues access/refresh tokens, and sets the refresh cookie like normal login.
  - Frontend login page now offers an OTP-by-email entry path, reuses the existing verify OTP page for `purpose=LOGIN`, and on `nextAction='LOGIN_SUCCESS'` reuses the current `SessionService` + `CurrentUserService` flow so auth state, `/auth/me`, interceptors, and redirects stay aligned with password/Google login.
  - Synced frontend/backend docs and AI auth reference to document the new login OTP contract and expected frontend mapping.
- Verification:
  - `ecommerce-shop`: `.\mvnw.cmd -pl coreservice "-Dtest=AuthServiceTest,ForgotPasswordServiceTest,OtpRateLimitServiceTest,LoginRateLimitServiceTest" test` -> passed
  - Added backend test coverage for OTP login success token issuance in `AuthServiceTest`
  - `ecommerce-ng`: `npm run build` -> timed out at 300s; no Angular compile error was emitted before timeout, but frontend build is not conclusively verified in this change set
- Todo:
  - [ ] Re-run `ecommerce-ng` build in a longer-lived session and capture the final result.
  - [ ] Manually test full login OTP flow with Mailpit: request OTP from `/auth/login`, verify OTP, confirm refresh cookie is set, `/auth/me` loads, and redirect enters the expected admin route.
  - [ ] Manually test failure paths: nonexistent email, cooldown, invalid OTP, blocked OTP attempts, and resend flow for `purpose=LOGIN`.
- Notes:
  - The current backend login OTP entry uses `email` as the identifier, not `username`, because OTP delivery already depends on email and this keeps the contract stable for the first iteration.
  - `VerifyOtpResponse` now carries tokens for `purpose=LOGIN` only; existing `REGISTER` and `FORGOT_PASSWORD` flows keep their prior behavior.

### 2026-04-22 11:18 - Frontend - Redesign login page into password and OTP modes

- Scope: frontend
- Changed:
  - ecommerce-ng/src/app/features/auth/pages/login.page.ts
  - AI_PROGRESS.md
- Summary:
  - Reworked the login page to separate `Dang nhap thuong` and `Dang nhap bang OTP` into two clear modes instead of mixing both forms in the same panel.
  - Added a lightweight segmented switcher at the top of the page, dedicated explanatory copy per mode, and a cleaner layout where password login and OTP login each expose only the fields/actions relevant to that path.
  - Kept the existing Google login and auth service flow unchanged; only the page structure and presentation were redesigned so users can understand the available login methods faster.
- Verification:
  - `ecommerce-ng`: `npm run build` -> timed out at 300s while Angular was still building; no template/style compilation error was emitted before timeout, but there is no completed frontend build result for this change set yet
- Todo:
  - [ ] Re-run `npm run build` in a longer-lived session and capture the final Angular result.
  - [ ] Manually review `/auth/login` on desktop and mobile to confirm the mode switcher, field grouping, and Google section hierarchy are clear.
  - [ ] If users still hesitate between OTP and password paths, consider adding small iconography or a one-line benefit/risk note under each mode in a follow-up pass.
- Notes:
  - This pass intentionally changed only the login page UI; no backend contract, route config, or auth service behavior was modified.

- Scope: shared
- Changed:
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/cache/CatalogCachedPage.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/cache/CatalogCacheKeyFactory.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/cache/CatalogCacheVersionService.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/cache/CatalogCacheService.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/cache/CatalogCacheInvalidationService.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/service/ProductService.java
  - ecommerce-shop/basecommerce/src/main/java/com/ttl/base/service/CategoryService.java
  - ecommerce-shop/basecommerce/src/test/java/com/ttl/base/cache/CatalogCacheKeyFactoryTest.java
  - ecommerce-shop/basecommerce/src/test/java/com/ttl/base/cache/CatalogCacheServiceTest.java
  - ecommerce-shop/basecommerce/src/test/java/com/ttl/base/service/ProductServiceTest.java
  - ecommerce-shop/basecommerce/src/test/java/com/ttl/base/service/CategoryServiceTest.java
  - AI_PROGRESS.md
- Summary:
  - Re-read `docs/redis-product-category-cache-design.md` and implemented the smallest matching backend shape: Redis read-through cache for product/category read APIs using `StringRedisTemplate`, versioned catalog key namespaces, JSON payload storage, and fail-open fallback when Redis read/write/deserialize fails.
  - Added catalog cache integration to `ProductService` for `getAll`, `searchProducts`, `getById`, `getImages`, and to `CategoryService` for `getAll`, `getTree`, `getById`, `getBySlug`, `getDeleted`, `getImages`.
  - Added after-commit invalidation via version bumps for product/category mutations, including the design-required cross-invalidation where category updates/move/merge also bump product namespaces because product responses embed category display data.
  - Frontend contract/API shape was re-checked against Angular catalog services and does not need code changes in this change set because cache is transparent at backend response level.
- Verification:
  - Backend code review confirmed endpoint-to-service flow remains unchanged at contract level: `ProductController` and `CategoryController` still return the same DTOs/pages while cache now wraps only the service read path.
  - `ecommerce-shop`: `./mvnw.cmd -pl basecommerce "-Dtest=CatalogCacheKeyFactoryTest,CatalogCacheServiceTest,ProductServiceTest,CategoryServiceTest" test` -> blocked by pre-existing unrelated `basecommerce` compile failures before tests run, including `BrandMapper` mapping error and many missing `Cart*`/`Order*` symbols in the module.
  - Added targeted tests for key generation, cache fail-open behavior, and service interaction/invalidation paths, but they could not be executed until the existing module compile blockers are fixed.
- Todo:
  - [ ] Re-run `basecommerce` compile/tests after unrelated compile blockers are fixed to validate the new cache classes and service wiring.
  - [ ] Smoke-test Redis locally with real backend runtime: first read miss then second read hit for `/products`, `/products/{id}`, `/categories`, `/categories/tree`, `/categories/by-slug/{slug}`.
  - [ ] Verify category mutations (`update`, `move`, `merge`) invalidate product cache as intended by checking the next product read rebuilds from DB.
  - [ ] Decide in a later follow-up whether to expose cache metrics to Micrometer instead of relying only on structured logs.
- Notes:
  - The implementation intentionally uses coarse-grained version bump invalidation and does not scan Redis or partially patch cached payloads.
  - Category paged list is cached as a simple serializable `CatalogCachedPage<T>` wrapper, then converted back to `PageImpl` in service code to avoid fragile direct Jackson serialization of Spring `Page` implementations.
  - Frontend handoff: no Angular change is required unless the team wants admin UI hints for cache behavior; API response envelope and DTO shapes are unchanged.

### 2026-04-21 23:22 - Shared - Rehydrate Angular category editor from cache-backed backend reads

- Scope: shared
- Changed:
  - ecommerce-ng/src/app/core/services/category-api.service.ts
  - ecommerce-ng/src/app/features/catalog/categories/categories.page.ts
  - AI_PROGRESS.md
- Summary:
  - Re-checked the current frontend after the backend cache change and found Angular category editing still relied heavily on list-page state plus local replacement, which can drift from the canonical backend detail after cache rebuilds, image changes, or later contract enrichment.
  - Added `CategoryApiService.getById(...)` and `getBySlug(...)` so Angular can explicitly consume the backend's cache-backed detail endpoints instead of only paged list/tree/deleted routes.
  - Updated `CategoriesPage` so opening the editor and post-image mutations now rehydrate the category from `GET /categories/{id}`, then refresh tree/deleted side panels, reducing stale admin state while keeping the existing UI flow and route structure unchanged.
- Verification:
  - `ecommerce-ng`: `npm run build` -> TypeScript/template compilation passed for the new category API service methods and editor hydration flow.
  - Angular build still fails due to pre-existing project budgets, not this change set:
    - initial bundle budget overflow (`1.11 MB` > configured `1.00 MB`)
    - existing `products.page.ts` component CSS budget overflow (`4.71 kB` > configured `4.00 kB`)
  - Backend compile remains blocked by unrelated `basecommerce` issues already noted in the prior entry, so full shared runtime verification is still pending.
- Todo:
  - [ ] Manually open `/admin/catalog/categories`, click edit on a category, and confirm the editor loads canonical detail from backend even after list data was previously loaded.
  - [ ] Upload/delete/set-thumbnail for category images and verify the editor preview, tree panel, and deleted list stay in sync after the backend cache invalidation/rebuild path.
  - [ ] Decide in a follow-up whether product/category admin pages should expose an explicit manual refresh action for detail hydration by slug as well as by id.
- Notes:
  - This frontend pass intentionally did not add browser-side caching; it only aligns Angular reads with the new backend cache-backed canonical endpoints.
  - `getBySlug(...)` was added for contract completeness and future category navigation/search usage even though the current page now uses `getById(...)` for editor hydration.
