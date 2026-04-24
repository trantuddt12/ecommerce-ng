# Angular Frontend Plan For Team Execution

## 1. Muc tieu

Xay frontend Angular cho repo `ecommerce-shop`, uu tien dung `Core Module` truoc de tao nen tang chung cho auth, HTTP, route protection, error handling, va app shell.

## 2. Backend context can biet

- Backend chinh: `basecommerce` tren `http://localhost:8081`
- Search service: `http://localhost:8082`
- Auth dang dung JWT access token + refresh token trong `HttpOnly cookie`
- CORS hien tai cho phep `http://localhost:4200`
- Frontend can dung `withCredentials: true`

## 3. Pham vi Core Module

Core can lam xong cac phan sau:

1. App config va environment
2. HTTP base layer
3. Session va auth state
4. Interceptors
5. Guards
6. Error handling
7. Layout shell
8. Startup initialization

## 4. Thu tu implementation de xuat

### Phase 1
- Tao Angular app standalone
- Cau hinh SCSS, routing, environments
- Tao folder `core/shared/features`

### Phase 2
- Tao `APP_CONFIG`
- Tao constants endpoint
- Tao `BaseApiService`
- Test ket noi `GET /health-check`

### Phase 3
- Tao `AuthService`
- Tao `SessionService`
- Luu `accessToken`
- Login qua `POST /auth/login`
- Logout qua `POST /auth/logout`

### Phase 4
- Tao `auth-token.interceptor`
- Tao `credentials.interceptor`
- Tao `refresh-token.interceptor`
- Retry request sau refresh

### Phase 5
- Tao `authGuard`
- Tao `guestGuard`
- Tao `permissionGuard`
- Mapping authority backend thanh frontend permissions

### Phase 6
- Tao `NotificationService`
- Tao `ErrorMapperService`
- Tao `loading` global
- Tao trang `403` va `404`

### Phase 7
- Tao `AuthLayoutComponent`
- Tao `MainLayoutComponent`
- Tao `HeaderComponent`
- Tao `SidebarComponent`

### Phase 8
- Tao login page
- Tao register page
- Tao OTP verify flow toi thieu
- Validate session khoi dong bang initializer

## 5. Danh sach endpoint uu tien tich hop

### Auth
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/sendotp`
- `POST /auth/sendotpregister`
- `POST /auth/verifyotp`

### Core validation
- `GET /health-check`
- `GET /user`
- `GET /role`

### Business follow-up
- `GET /brands`
- `GET /categories`
- `GET /products`
- `GET /attributes`
- `GET /search/brand`

## 6. Tieu chi xong Core

- App Angular chay duoc tren `localhost:4200`
- Goi duoc backend `8081` va `8082`
- Login thanh cong
- Request duoc gan bearer token
- Refresh token tu dong hoat dong khi gap `401`
- Route private duoc bao ve
- Route theo quyen duoc bao ve
- Co shell giao dien co ban cho auth va dashboard
- Loi backend duoc hien thi nhat quan

## 7. Risks can theo doi

- Backend chua co endpoint profile ro rang nhu `GET /auth/me`
- Response login tra ca `refreshToken` trong body, frontend khong nen luu gia tri nay
- `SameSite=Strict` co the anh huong luc deploy cross-domain
- Search service tach rieng nen can config base URL rieng

## 8. Uu tien sau Core

1. Auth UI
2. Users
3. Roles
4. Brands
5. Categories
6. Attributes
7. Products
8. Search
9. Import-export
