# Ke hoach chi tiet xay dung frontend Angular cho ecommerce-shop
## Tap trung giai doan 1: Module Core

## 1. Muc tieu

Xay dung frontend Angular cho project `ecommerce-shop` theo huong tach ro `core`, `shared`, `features`, trong do uu tien lam truoc `Core Module` de tao nen tang chung cho toan bo ung dung.

Module `core` phai giai quyet cac nhu cau xuyen suot sau:

- Quan ly cau hinh ung dung frontend theo moi truong.
- Quan ly session dang nhap bang `access token` va `refresh token cookie`.
- Cau hinh HTTP client, interceptor, xu ly loi toan cuc.
- Bao ve route bang auth guard va permission guard.
- Quan ly trang thai nguoi dung hien tai.
- Dong bo duoc voi backend hien co gom:
  - `basecommerce` tren port `8081`
  - `searchservice` tren port `8082`
  - `coreservice` duoc nhung vao `basecommerce`
- Tao app shell nen tang cho cac feature module sau nay.

## 2. Phan tich backend hien tai

### 2.1 Kien truc backend
Repo hien tai la monorepo Maven gom cac module chinh:

- `basecommerce`: ung dung backend chinh, port `8081`
- `coreservice`: auth, user, role, JWT, Redis, OTP, email
- `searchservice`: microservice tim kiem, port `8082`
- `common`: DTO, request/response, constant, exception dung chung
- `scraper`: cong cu scraping/import CSV

### 2.2 Cac diem can frontend phai tuong thich

#### Auth va security
Backend dang dung:

- JWT access token
- Refresh token luu trong `HttpOnly cookie`
- `CORS allowed origins` mac dinh: `http://localhost:4200`
- `allowCredentials = true`
- Cookie refresh co:
  - `httpOnly = true`
  - `secure` theo config
  - `sameSite` theo config
  - `path = /`

#### Auth APIs hien co
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/sendotp`
- `POST /auth/sendotpregister`
- `POST /auth/verifyotp`

#### User va role APIs
- `POST /user/register`
- `POST /user/update`
- `GET /user`
- `GET /user/{id}`
- `POST /role`
- `GET /role`
- `DELETE /role/{id}`

#### Health API
- `GET /health-check`

#### Commerce APIs
- `GET /brands`
- `POST /brands`
- `PATCH /brands/update/{id}`
- `DELETE /brands/{id}`
- `GET /categories`
- `POST /categories`
- `PATCH /categories/{id}`
- `DELETE /categories/{id}`
- `GET /products`
- `GET /products/{id}`
- `POST /products` theo `multipart/form-data`
- `GET /attributes`
- `POST /attributes`
- `GET /categories/{categoryId}/attributes`
- `POST /categories/{categoryId}/attributes`

#### Search API
- `GET /search/brand?keyword=&from=&size=`

### 2.3 Request/response dang can map tren frontend

#### Login request
```json
{
  "username": "string",
  "password": "string",
  "googleToken": "string | optional"
}
```

#### Login response
```json
{
  "accessToken": "string",
  "refreshToken": "string"
}
```

Luu y:
- Frontend nen dung `accessToken` de gan vao `Authorization: Bearer ...`
- Frontend khong nen phu thuoc vao `refreshToken` trong body
- Refresh flow chinh phai dua vao cookie `HttpOnly`

#### Error response
```json
{
  "error": "...",
  "status": "..."
}
```

Frontend can chuan hoa lai thanh model loi noi bo de hien thi nhat quan.

## 3. Dinh huong kien truc frontend Angular

## 3.1 Phien ban va cong nghe de xay dung
De xuat:

- Angular moi nhat on dinh, uu tien Angular 19, neu can on dinh rong hon thi Angular 18
- Standalone APIs cua Angular
- Angular Router
- HttpClient
- Reactive Forms
- RxJS
- SCSS
- ESLint + Prettier
- Angular environments
- Co the bo sung sau:
  - Angular Material hoac PrimeNG
  - ngx-translate neu can i18n frontend
  - NgRx chi khi ung dung phuc tap hon

### 3.2 Cau truc thu muc de xuat
```text
frontend/
  src/
    app/
      core/
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
      shared/
        components/
        directives/
        pipes/
        ui/
      features/
        auth/
        dashboard/
        users/
        roles/
        brands/
        categories/
        products/
        attributes/
        search/
      app.routes.ts
      app.component.ts
      app.config.ts
    environments/
      environment.ts
      environment.development.ts
      environment.production.ts
```

### 3.3 Nguyen tac tach lop
- `core`: chi chua cac thanh phan singleton, xuyen suot app.
- `shared`: component, pipe, directive tai su dung.
- `features`: business modules theo domain.
- Khong dua component UI domain vao `core`.
- Khong dua auth/business service domain vao `shared`.

## 4. Muc tieu cu the cua Core Module

Module `core` la nen tang bat buoc phai co truoc khi lam cac feature nhu auth, quan ly san pham, brand, category, user, role.

Core can bao gom 9 nhom chuc nang:

1. App configuration
2. HTTP abstraction
3. Authentication session management
4. Token refresh flow
5. Route guards
6. Global error handling
7. Global layout shell
8. Permission/authorization utilities
9. Bootstrapping and startup checks

## 5. Ke hoach chi tiet xay dung Core Module

## 5.1 App Configuration Layer

### Muc tieu
Quan ly thong tin moi truong frontend va endpoint backend mot cach tap trung.

### Can xay dung
- `environment.development.ts`
- `environment.production.ts`
- `AppConfig` interface
- `APP_CONFIG` injection token

### Noi dung config de xuat
- `apiBaseUrl`: `http://localhost:8081`
- `searchApiBaseUrl`: `http://localhost:8082`
- `requestTimeoutMs`
- `enableDebugTools`
- `appName`
- `defaultLanguage`

### Ket qua mong doi
Tat ca service trong app khong hardcode URL, ma lay tu `APP_CONFIG`.

### Luu y theo backend hien tai
- Auth APIs nam trong backend chinh `8081`
- Search APIs nam o `8082`
- Frontend phai goi request voi `withCredentials: true` khi can refresh cookie

## 5.2 HTTP Foundation

### Muc tieu
Tao tang giao tiep HTTP dung chung cho toan bo app.

### Can xay dung
- `ApiUrlBuilder`
- `BaseApiService`
- `HttpOptionsFactory`
- Typed request/response models
- Co che query params helper

### Chuc nang chinh
- Ghep URL endpoint an toan
- Dong bo `withCredentials`
- Cau hinh header chung
- Giai quyet query params nhu:
  - `keyword`
  - `categoryId`
  - `brandId`
  - `minPrice`
  - `maxPrice`
  - `from`
  - `size`

### De xuat
Khong can over-engineer bang generic repository qua som.
Chi can:
- 1 lop helper cho URL
- 1 lop helper cho request options
- Moi feature co service rieng

## 5.3 Authentication Session Layer

### Muc tieu
Quan ly access token, thong tin user dang nhap, trang thai session.

### Can xay dung
- `AuthService`
- `SessionService`
- `CurrentUserService`
- `AuthStateStore` hoac signal-based auth state

### State can quan ly
- `accessToken`
- `isAuthenticated`
- `currentUser`
- `permissions`
- `roles`
- `isRefreshing`
- `authInitialized`

### Cach luu tru
De xuat:
- Luu `accessToken` trong memory la chinh
- Co the bo sung `sessionStorage` neu muon giu session khi F5
- Khong luu `refreshToken` o frontend
- Refresh cookie do backend quan ly

### Auth flow de xuat
1. User login bang `POST /auth/login`
2. Backend tra `accessToken` trong body, refresh token trong cookie
3. Frontend luu `accessToken`
4. Frontend goi `GET /user` hoac endpoint profile phu hop de lay user context
5. Khi `401`, frontend tu dong goi `POST /auth/refresh`
6. Neu refresh thanh cong, cap nhat `accessToken`, retry request
7. Neu refresh that bai, xoa session va dieu huong ve login

### Diem can chu y
Backend hien chua co endpoint `GET /auth/me`, nen frontend se can:
- tam thoi dung `GET /user`
- hoac bo sung sau endpoint profile chuan hon
Trong ban ke hoach frontend, nen danh dau day la dependency backend can can nhac bo sung.

## 5.4 Interceptors

### Muc tieu
Xu ly tap trung cho auth, loi, credentials, retry.

### Danh sach interceptor de xuat

#### 1. Auth token interceptor
- Gan `Authorization: Bearer <accessToken>` neu co token
- Bo qua voi mot so endpoint neu can

#### 2. Credentials interceptor
- Bat `withCredentials: true` cho request lien quan auth/refresh
- De xuat bat cho tat ca request den `apiBaseUrl` vi backend co dung cookie refresh

#### 3. Refresh token interceptor
- Bat `401 Unauthorized`
- Neu request chua retry, goi `/auth/refresh`
- Sau khi refresh thanh cong, retry request cu
- Dung co che queue de tranh nhieu request cung refresh song song

#### 4. Api error mapping interceptor
- Chuan hoa `ErrorMessage` backend thanh `AppError`
- Tach:
  - validation error
  - auth error
  - permission error
  - server error
  - network error

#### 5. Loading interceptor
- Kich hoat loading global de app shell / spinner dung chung

### Ket qua mong doi
Moi feature module khong tu xu ly auth header hay refresh flow lap lai.

## 5.5 Route Guards

### Muc tieu
Bao ve route theo dang nhap va quyen.

### Can xay dung
- `authGuard`
- `guestGuard`
- `permissionGuard`
- `authInitGuard` hoac startup resolver

### Hanh vi de xuat
- `authGuard`: chi cho vao neu da co session hop le
- `guestGuard`: neu da dang nhap thi khong vao trang login/register
- `permissionGuard`: doc `data.permissions` trong route config
- `authInitGuard`: dam bao app da thu phuc hoi session truoc khi route vao khu vuc bao ve

### Permission strategy
Backend dung authority strings nhu:
- `USER_MANAGE`
- `ROLE_MANAGE`
- `ROLE_VIEW`
- `USER_VIEW`
- `PRODUCT_VIEW`

Frontend can:
- parse roles/permissions thanh `Set<string>`
- viet helper `hasPermission()`, `hasAnyPermission()`, `hasAllPermissions()`

## 5.6 Global Error Handling

### Muc tieu
Thong nhat cach hien thi loi trong toan ung dung.

### Can xay dung
- `AppError` model
- `ErrorMapperService`
- `GlobalErrorHandler`
- `NotificationService`
- Component hien thi toast/snackbar/banner

### Nguon loi can xu ly
- Loi backend dang `ErrorMessage`
- Loi validation form
- Loi 401/403
- Loi 404
- Loi network timeout
- Loi upload file

### Chien luoc hien thi
- Loi form: hien gan field
- Loi auth: thong bao gon va dieu huong neu can
- Loi 403: trang forbidden hoac toast
- Loi 500: thong bao chung va log console o dev mode

## 5.7 Core Models va Contracts

### Muc tieu
Dinh nghia model frontend on dinh, tach khoi raw backend response.

### Can co cac model sau
- `LoginRequest`
- `LoginResponse`
- `RegisterRequest`
- `User`
- `Role`
- `Permission`
- `AppError`
- `PagedResult<T>` neu sau nay can
- `ApiEndpoints` constants

### Nguyen tac
- Models trong `core/models` dung cho concern xuyen suot
- Models domain nhu `Brand`, `Category`, `Product` de o feature modules hoac `shared/models` tuy pham vi

## 5.8 Startup Initialization

### Muc tieu
Khi app khoi dong, frontend biet ngay:
- co session cu hay khong
- co can refresh token hay khong
- user hien tai la ai

### Can xay dung
- `AppInitializerService`
- `APP_INITIALIZER` hoac cach bootstrap tuong duong voi standalone Angular

### Luong khoi dong de xuat
1. App load
2. Kiem tra access token con trong memory/sessionStorage khong
3. Neu khong chac chan, thu `POST /auth/refresh` voi cookie
4. Neu refresh OK:
   - luu access token moi
   - nap thong tin user
5. Neu refresh fail:
   - danh dau guest mode
6. Mo app shell

### Loi ich
- Giam flicker giao dien
- Route guard hoat dong on dinh
- Khong bi redirect sai khi F5

## 5.9 App Shell va Layout nen tang

### Muc tieu
Co bo khung giao dien chung cho cac module sau nay.

### Can xay dung trong core
- `MainLayoutComponent`
- `AuthLayoutComponent`
- `HeaderComponent`
- `SidebarComponent`
- `FooterComponent`
- `GlobalLoadingBarComponent`
- `NotFoundComponent`
- `ForbiddenComponent`

### Giai doan dau
Ban dau shell chi can:
- header
- sidebar cho khu vuc admin
- router outlet
- loading indicator
- notification outlet

### Dinh huong UI
Vi project la ecommerce + admin-oriented backend, nen tach som 2 bo khung:
- `Auth layout`: login, register, OTP verify
- `Dashboard layout`: user, role, brands, categories, products, attributes

## 6. De xuat phan ra feature boundaries ngay tu dau

Sau khi xong `core`, nen tach cac feature module nhu sau:

- `features/auth`
- `features/users`
- `features/roles`
- `features/brands`
- `features/categories`
- `features/products`
- `features/attributes`
- `features/search`
- `features/import-export` neu can

Trong do:
- `core` khong chua page business
- `auth` chi chua UI va orchestration login/register/otp
- API service cho domain nao dat trong feature do

## 7. Backlog implementation cho giai doan Core

## 7.1 Phase 1 - Khoi tao du an Angular
Muc tieu:
- Tao project Angular standalone
- Cau hinh SCSS, routing, environments, linting

Cong viec:
- Khoi tao workspace frontend
- Cau hinh alias path neu can
- Tao folder structure `core/shared/features`
- Cau hinh environments cho `8081`, `8082`

Dau ra:
- App Angular chay duoc o `localhost:4200`

## 7.2 Phase 2 - Config + HTTP skeleton
Muc tieu:
- Hoan thien tang config va giao tiep backend

Cong viec:
- Tao `APP_CONFIG`
- Tao `BaseApiService`
- Tao helper query params
- Tao constants endpoint

Dau ra:
- Goi duoc `GET /health-check`
- Goi duoc `GET /brands`
- Goi duoc `GET /search/brand`

## 7.3 Phase 3 - Auth foundation
Muc tieu:
- Login/logout/refresh hoat dong hoan chinh

Cong viec:
- Tao model login/register
- Tao `AuthService`
- Tao `SessionService`
- Tao auth interceptors
- Tao refresh queue mechanism
- Tao startup initialization

Dau ra:
- Login thanh cong
- Token duoc attach vao request
- Refresh tu dong khi access token het han
- Logout xoa state dung

## 7.4 Phase 4 - Guards + permission system
Muc tieu:
- Bao ve route admin dung quyen

Cong viec:
- Tao `authGuard`
- Tao `guestGuard`
- Tao `permissionGuard`
- Tao utility check permissions

Dau ra:
- Route bi chan dung khi chua dang nhap
- Route theo quyen hoat dong dung

## 7.5 Phase 5 - Global UX layer
Muc tieu:
- Cung cap trai nghiem nen tang tot

Cong viec:
- Global loading
- Notification service
- Error pages 403/404
- Layout components
- Header/sidebar shell

Dau ra:
- App shell co the tai su dung cho moi feature

## 7.6 Phase 6 - Auth UI toi thieu
Muc tieu:
- Co giao dien de test va van hanh auth core

Cong viec:
- Login page
- Register page
- OTP verify page
- Route transition guest/auth

Dau ra:
- Core da san sang de mo rong sang features business

## 8. Danh sach file/lop nen co trong Core

```text
core/
  config/
    app-config.ts
    app-initializer.ts
  constants/
    api-endpoints.ts
    auth.constants.ts
    storage.constants.ts
  guards/
    auth.guard.ts
    guest.guard.ts
    permission.guard.ts
  http/
    base-api.service.ts
    http-options.factory.ts
    query-param.util.ts
  interceptors/
    auth-token.interceptor.ts
    credentials.interceptor.ts
    refresh-token.interceptor.ts
    error-mapping.interceptor.ts
    loading.interceptor.ts
  layout/
    main-layout.component.ts
    auth-layout.component.ts
    header.component.ts
    sidebar.component.ts
  models/
    app-error.model.ts
    auth-session.model.ts
    current-user.model.ts
    permission.model.ts
  services/
    auth.service.ts
    session.service.ts
    current-user.service.ts
    notification.service.ts
    loading.service.ts
    error-mapper.service.ts
  state/
    auth.store.ts
  tokens/
    app-config.token.ts
  utils/
    jwt.util.ts
    permission.util.ts
```

## 9. Mapping backend sang frontend core

## 9.1 Auth endpoints
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/sendotp`
- `POST /auth/sendotpregister`
- `POST /auth/verifyotp`

Frontend core can ho tro:
- login password
- refresh session
- logout
- OTP pre-register flow

## 9.2 User/role permissions
Frontend core can biet va su dung:
- `USER_MANAGE`
- `ROLE_MANAGE`
- `ROLE_VIEW`
- `USER_VIEW`
- `PRODUCT_VIEW`

Can de mo rong linh hoat cho permission moi trong tuong lai.

## 9.3 Cookie/CORS
Do backend dang:
- `allowCredentials = true`
- allowed origin la `http://localhost:4200`

Frontend bat buoc:
- dung `withCredentials: true`
- tranh doc refresh token tren JS
- khong luu refresh token vao localStorage

## 10. Rui ro ky thuat can xu ly som

## 10.1 Chua co endpoint profile chuan
Hien tai backend chua the hien ro endpoint `GET /auth/me` hoac `GET /me`.

Tac dong:
- Frontend se kho xac dinh current logged-in user sau refresh chi dua vao token.

De xuat:
- Tam thoi frontend dung `GET /user` neu phu hop quyen
- Tot hon la backend bo sung `GET /auth/me`

## 10.2 Login response tra ca refresh token trong body
Backend tra:
```json
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

Nhung refresh token da duoc dat trong cookie `HttpOnly`.

De xuat frontend:
- bo qua `refreshToken` body
- chi quan tam `accessToken`
- tranh vo tinh luu refresh token trong browser storage

## 10.3 SameSite cookie
Neu frontend/backend deploy khac domain hoac cross-site that su, `SameSite=Strict` co the gay van de refresh cookie.

De xuat:
- giai doan local: co the hoat dong neu cung site phu hop
- giai doan deploy: xac minh lai policy cookie va CORS

## 10.4 Search service tach cong
`searchservice` nam o port `8082`.

De xuat:
- tach `searchApiBaseUrl`
- co `SearchApiService` rieng
- khong tron service search vao `basecommerce` client

## 11. Tieu chi hoan thanh module Core

Module `core` duoc xem la hoan thanh khi dat du cac tieu chi sau:

- Frontend co environment config cho `8081` va `8082`
- Goi duoc health check va cac API co ban
- Login thanh cong va luu `accessToken`
- Request tu dong gan bearer token
- Request tu dong refresh khi gap `401`
- Logout xoa state va ket thuc session
- Route guard hoat dong dung
- Permission guard hoat dong dung
- Co app shell toi thieu cho auth va admin area
- Loi backend duoc map va hien thi nhat quan
- Cau truc code san sang mo rong feature module

## 12. Thu tu thuc hien de xuat

1. Khoi tao Angular app + environments
2. Tao `core/config`, `core/http`, `core/constants`
3. Tao `AuthService`, `SessionService`, auth state
4. Tao interceptors: auth token, credentials, refresh, error
5. Tao app initializer phuc hoi session
6. Tao guards: auth, guest, permission
7. Tao shell layout + loading + notification
8. Tao auth pages toi thieu de verify core
9. Sau khi core on dinh moi bat dau `features/users`, `roles`, `brands`, `categories`, `products`

## 13. De xuat uu tien sau khi xong Core

Sau `core`, thu tu feature nen lam:

1. `features/auth`
2. `features/users`
3. `features/roles`
4. `features/brands`
5. `features/categories`
6. `features/attributes`
7. `features/products`
8. `features/search`
9. `features/import-export`

Ly do:
- User/role la phan lien quan truc tiep auth va permission
- Brand/category/attribute/product la cum business chinh cua backend
- Search va import/export co the bo sung sau khi CRUD on dinh

## 14. Ket luan

Voi backend hien tai, `core module` Angular can duoc xay dung theo huong tap trung vao `authentication`, `session lifecycle`, `HTTP infrastructure`, `route protection`, `global error handling`, va `app shell`.

Neu lam dung thu tu, sau khi hoan thanh `core`, frontend se co mot nen tang rat on dinh de phat trien tiep cac module business ma khong bi lap lai logic auth, refresh token, permission, va xu ly loi.
