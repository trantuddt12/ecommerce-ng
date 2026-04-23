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
3. Neu user dang nhap Google, frontend van goi cung endpoint `POST /auth/login` nhung gui `googleToken` thay cho username/password.
4. Neu user chon dang nhap bang OTP, `LoginPage` goi `POST /auth/sendotp` voi body `{ purpose: 'LOGIN', email }`.
5. Frontend chuyen sang `/auth/verify-otp` kem `email`, `purpose=LOGIN`, va `resendAfterSeconds`.
6. `VerifyOtpPage` goi `POST /auth/verifyotp` voi body `{ purpose: 'LOGIN', email, otp }`.
7. Neu backend tra `nextAction='LOGIN_SUCCESS'`, frontend luu `accessToken`, tai `/auth/me`, va dieu huong nhu login thuong.
8. Response tra ve `accessToken`.
9. `SessionService` luu token.
10. `CurrentUserService.setCurrentUserFromToken()` dong bo thong tin user tu token.
11. `CurrentUserService.loadCurrentUser()` nap user detail tu backend.
12. Component navigate sang `/dashboard` khi thanh cong.

## Luong dang ky

Nguon: `src/app/features/auth/pages/register.page.ts`, `src/app/features/auth/pages/verify-otp.page.ts`

1. Public register co 2 nhanh: dang ky truc tiep qua `/user/register` hoac dang ky OTP qua `/auth/sendotpregister`.
2. Voi dang ky OTP, frontend gui full `RegisterRequest` den `/auth/sendotpregister`.
3. Backend luu tam request trong Redis va gui OTP qua email.
4. Frontend dieu huong sang `/auth/verify-otp` kem `email`, `purpose=REGISTER`, va `resendAfterSeconds`.
5. `VerifyOtpPage` goi `POST /auth/verifyotp` voi body `{ purpose, email, otp }`.
6. Backend tao user tu du lieu tam va activate account trong cung flow verify thanh cong.
7. Sau verify, frontend day user ve login de dang nhap binh thuong hoac Google.

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
- Google login/register hien di qua cung auth state, session, interceptor, va `/auth/me` flow nhu login thuong; khong tao social auth store rieng.
