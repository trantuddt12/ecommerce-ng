# Angular Core Module Implementation Plan

## 1. Muc tieu

Tai lieu nay tach rieng ke hoach implementation cho `Core Module` cua frontend Angular. Muc tieu la tao duoc nen tang ky thuat de cac feature module sau nay chi tap trung vao business logic.

## 2. Scope cua Core Module

`Core Module` bao gom:

- app config
- HTTP foundation
- auth session
- refresh token flow
- route guards
- permission utilities
- global error handling
- global loading va notification
- app initializer
- app shell va layout co ban

Khong dua vao `core`:

- page CRUD business
- component domain cua brand/category/product
- logic import/export chuyen biet

## 3. Folder structure implementation

```text
src/app/core/
  config/
  constants/
  guards/
  http/
  interceptors/
  layout/
  models/
  services/
  state/
  tokens/
  utils/
```

## 4. Task implementation chi tiet

## Task 1. Khoi tao Angular app nen tang

### Muc tieu
Co workspace Angular standalone, routing, SCSS va environments.

### Viec can lam
- Tao project Angular moi trong thu muc `frontend/`
- Bat standalone API
- Chon stylesheet la `SCSS`
- Bat routing
- Cau hinh environments dev/prod

### Deliverables
- `frontend/angular.json`
- `frontend/package.json`
- `frontend/src/main.ts`
- `frontend/src/app/app.config.ts`
- `frontend/src/app/app.routes.ts`

### Acceptance criteria
- Chay duoc `ng serve`
- Truy cap duoc `http://localhost:4200`

## Task 2. Tao app config va environment abstraction

### Muc tieu
Khong hardcode backend URL trong service.

### Viec can lam
- Tao `environment.development.ts`
- Tao `environment.production.ts`
- Tao interface `AppConfig`
- Tao token `APP_CONFIG`
- Inject config vao app bootstrap

### Cau hinh can co
- `apiBaseUrl`
- `searchApiBaseUrl`
- `requestTimeoutMs`
- `appName`
- `defaultLanguage`

### Acceptance criteria
- Service co the lay base URL tu DI thay vi hardcode

## Task 3. Tao constants va endpoint map

### Muc tieu
Tao mot noi tap trung de quan ly endpoint path.

### Viec can lam
- Tao `api-endpoints.ts`
- Dinh nghia endpoint groups:
  - auth
  - user
  - role
  - brand
  - category
  - product
  - attribute
  - search

### Acceptance criteria
- Tat ca service goi API thong qua constants

## Task 4. Tao HTTP foundation

### Muc tieu
Co tang service dung chung cho request/response.

### Viec can lam
- Tao `BaseApiService`
- Tao helper build query params
- Tao helper build request options
- Tao helper xu ly base URL cho `8081` va `8082`

### Acceptance criteria
- Goi duoc `GET /health-check`
- Goi duoc `GET /brands`
- Goi duoc `GET /search/brand`

## Task 5. Tao auth models va auth state

### Muc tieu
Quan ly duoc state dang nhap trong app.

### Viec can lam
- Tao models:
  - `LoginRequest`
  - `LoginResponse`
  - `AuthSession`
  - `CurrentUser`
  - `Permission`
- Tao `AuthStore` bang signals hoac service state singleton

### State can co
- `accessToken`
- `isAuthenticated`
- `currentUser`
- `permissions`
- `authInitialized`
- `isRefreshing`

### Acceptance criteria
- App co the doc state auth o bat ky noi nao can thiet

## Task 6. Tao SessionService

### Muc tieu
Quan ly lifecycle cua access token.

### Viec can lam
- Tao `SessionService`
- Luu `accessToken` trong memory
- Can nhac bo sung `sessionStorage` de phuc hoi sau reload
- Tao API:
  - `setAccessToken()`
  - `getAccessToken()`
  - `clearSession()`
  - `hasSession()`

### Acceptance criteria
- Co the set/get/clear token mot cach tap trung

## Task 7. Tao AuthService

### Muc tieu
Dong goi toan bo auth flow voi backend.

### Viec can lam
- Implement:
  - `login()` -> `POST /auth/login`
  - `refresh()` -> `POST /auth/refresh`
  - `logout()` -> `POST /auth/logout`
  - `sendOtp()`
  - `sendOtpRegister()`
  - `verifyOtp()`
- Sau login, luu `accessToken`
- Sau logout, xoa state local

### Luu y
- Luon goi request voi `withCredentials: true`
- Khong luu `refreshToken` tu response body

### Acceptance criteria
- Login va logout chay dung voi backend

## Task 8. Tao CurrentUserService

### Muc tieu
Nap thong tin user dang nhap va mapping permission.

### Viec can lam
- Tao service nap current user context
- Tam thoi xac dinh endpoint profile phu hop
- Mapping user response ve model frontend
- Rut ra permissions/roles de dung cho guard

### Risk phu thuoc backend
- Backend hien chua co `GET /auth/me`
- Can xac dinh endpoint profile chinh thuc truoc khi chot implementation

### Acceptance criteria
- Sau login hoac refresh, frontend xac dinh duoc user hien tai

## Task 9. Tao auth token interceptor

### Muc tieu
Tu dong gan access token vao request.

### Viec can lam
- Doc token tu `SessionService`
- Gan header `Authorization: Bearer ...`
- Bo qua request public neu can

### Acceptance criteria
- Request private tu dong co bearer token

## Task 10. Tao credentials interceptor

### Muc tieu
Dam bao browser gui cookie refresh token.

### Viec can lam
- Bat `withCredentials: true` cho request den backend API
- Tach logic cho `apiBaseUrl` va `searchApiBaseUrl` neu can

### Acceptance criteria
- Request auth/refresh gui kem cookie dung cach

## Task 11. Tao refresh token interceptor

### Muc tieu
Tu dong refresh access token khi het han.

### Viec can lam
- Bat `401`
- Neu request chua retry thi goi `AuthService.refresh()`
- Cap nhat token moi
- Retry request cu
- Dung co che queue hoac single-flight de tranh nhieu refresh dong thoi

### Truong hop can xu ly
- Nhieu request cung fail `401`
- Refresh fail
- Request dang la `/auth/refresh`

### Acceptance criteria
- App khong refresh lap vo han
- Request sau refresh duoc retry dung

## Task 12. Tao error mapping interceptor va error models

### Muc tieu
Thong nhat cach xu ly loi backend.

### Viec can lam
- Tao `AppError` model
- Tao `ErrorMapperService`
- Map `ErrorMessage` backend sang cac loai loi frontend
- Xu ly:
  - 400
  - 401
  - 403
  - 404
  - 500
  - network error

### Acceptance criteria
- Feature module nhan duoc loi da chuan hoa

## Task 13. Tao loading service va loading interceptor

### Muc tieu
Co loading state dung chung.

### Viec can lam
- Tao `LoadingService`
- Tao interceptor tang/giam pending request count
- Tao component loading global

### Acceptance criteria
- App co the hien loading khi co request dang chay

## Task 14. Tao notification service

### Muc tieu
Thong bao thanh cong/that bai thong nhat.

### Viec can lam
- Tao `NotificationService`
- Chuan bi abstraction de sau nay co the gan Material Snackbar hoac PrimeNG Toast

### Acceptance criteria
- Co API thong nhat de thong bao success/error/info

## Task 15. Tao permission utils

### Muc tieu
Kiem tra quyen don gian va de mo rong.

### Viec can lam
- Tao helpers:
  - `hasPermission()`
  - `hasAnyPermission()`
  - `hasAllPermissions()`
- Dung `Set<string>` de tra cuu nhanh

### Acceptance criteria
- Permission checks duoc tai su dung trong guard va UI

## Task 16. Tao guards

### Muc tieu
Bao ve route theo session va permission.

### Viec can lam
- Tao `authGuard`
- Tao `guestGuard`
- Tao `permissionGuard`
- Dinh nghia route metadata cho permissions

### Acceptance criteria
- Route auth bi chan khi chua dang nhap
- Route guest bi chan khi da dang nhap
- Route permission bi chan khi thieu quyen

## Task 17. Tao app initializer

### Muc tieu
Phuc hoi session khi app boot.

### Viec can lam
- Thu refresh token ngay luc app start neu can
- Neu refresh OK thi nap current user
- Neu refresh fail thi danh dau guest mode

### Acceptance criteria
- F5 khong lam app mat context mot cach bat ngo

## Task 18. Tao layouts va shell co ban

### Muc tieu
Dung bo khung giao dien cho auth area va private area.

### Viec can lam
- Tao `AuthLayoutComponent`
- Tao `MainLayoutComponent`
- Tao `HeaderComponent`
- Tao `SidebarComponent`
- Tao `ForbiddenComponent`
- Tao `NotFoundComponent`

### Acceptance criteria
- App co router shell cho public/private routes

## Task 19. Tao route map nen tang

### Muc tieu
Co bo route san sang cho core va features.

### Viec can lam
- Cau hinh route auth area
- Cau hinh route dashboard area
- Cau hinh route 403 va 404
- Gan guard vao cac route can bao ve

### Acceptance criteria
- Dieu huong trong app hoat dong ro rang va co cau truc

## Task 20. Tao trang auth toi thieu de verify core

### Muc tieu
Co giao dien de test auth flow thuc te.

### Viec can lam
- Tao login page
- Tao register page
- Tao OTP verify page toi thieu
- Noi form voi `AuthService`

### Acceptance criteria
- User co the login va logout bang UI

## 5. Phu thuoc backend can note lai

## 5.1 Can backend xac nhan
- Endpoint profile user hien tai la endpoint nao
- Chinh sach cookie khi deploy cross-domain
- Response auth co can giu `refreshToken` trong body hay khong

## 5.2 Can frontend luu y
- Khong luu refresh token vao browser storage
- Luon support `withCredentials`
- Search service co base URL rieng

## 6. Definition of Done cho Core Module

Core module duoc xem la xong khi:

- App Angular bootstrap thanh cong
- Environments va config DI hoat dong dung
- HTTP foundation goi duoc backend chinh va search service
- Login, logout, refresh flow hoan chinh
- Interceptors hoat dong dung thu tu
- Guards bao ve route dung
- Permission utilities su dung duoc trong UI va route
- Error handling va loading global hoat dong on dinh
- App initializer phuc hoi session sau reload
- App shell co ban san sang cho feature modules

## 7. Thu tu uu tien de team implement

1. Task 1 -> Task 4
2. Task 5 -> Task 11
3. Task 12 -> Task 17
4. Task 18 -> Task 20

## 8. Ghi chu implementation

- Uu tien solution nho gon, khong over-engineer state management som
- Chi dua singleton va cross-cutting concerns vao `core`
- Neu chua co endpoint profile chuan, can note ro dependency nay trong sprint backlog
