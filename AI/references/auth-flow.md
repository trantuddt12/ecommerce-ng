# Auth Flow

## Thanh phan chinh

- `AuthService`
- `CurrentUserService`
- `SessionService`
- `AuthStore`
- `AppInitService`
- `authGuard`, `guestGuard`, `permissionGuard`
- `auth-token.interceptor.ts`
- `refresh-token.interceptor.ts`

## Luong dang nhap

Nguon: `src/app/core/services/auth.service.ts`, `src/app/features/auth/pages/login.page.ts`

1. User submit form o `LoginPage`.
2. `AuthService.login()` goi `POST /auth/login`.
3. Response tra ve `accessToken`.
4. `SessionService` luu token.
5. `CurrentUserService.setCurrentUserFromToken()` dong bo thong tin user tu token.
6. `CurrentUserService.loadCurrentUser()` nap user detail tu backend.
7. Component navigate sang `/dashboard` khi thanh cong.

## Luong khoi tao app

Nguon: `src/app/core/services/app-init.service.ts`

1. `APP_INITIALIZER` goi `AppInitService.initialize()`.
2. Neu khong co session, app van thu refresh.
3. Neu co session, app tai current user.
4. Neu load user that bai, app thu refresh token.
5. Neu refresh that bai, session bi xoa.
6. Cuoi cung `authInitialized` duoc dat thanh `true`.

## Luong refresh token khi gap 401

Nguon: `src/app/core/interceptors/refresh-token.interceptor.ts`

1. Request bat ky that bai voi 401.
2. Interceptor bo qua request refresh de tranh loop.
3. Neu request chua co header `x-refresh-attempt`, interceptor goi `authService.refresh()`.
4. Sau khi refresh thanh cong, reload current user.
5. Clone request goc voi header danh dau da refresh va goi lai request.
6. Neu refresh that bai, xoa session va dieu huong ve `/auth/login`.

## Auth state

Nguon: `src/app/core/state/auth.store.ts`

- `accessToken`: signal luu token.
- `currentUser`: signal luu user hien tai.
- `authInitialized`: xac nhan app da xu ly xong pha khoi tao auth.
- `isRefreshing`: danh dau dang refresh token.
- `isAuthenticated`: computed tu `accessToken`.
- `permissions`: computed tu current user permissions.
- `roles`: computed tu current user roles.

## Luu y quan trong

- Khong nen bo sung auth logic rieng trong component neu da co service/interceptor xu ly.
- Moi thay doi lien quan session can kiem tra ca app init va refresh flow.
- Khi thay doi login/logout, can kiem tra redirect va stale auth state.
