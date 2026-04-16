# Routes And Navigation

## Route tree hien tai

Nguon chinh: `src/app/app.routes.ts`

### Nhom auth

- `/auth/login`
- `/auth/register`
- `/auth/verify-otp`

Dac diem:

- Su dung `AuthLayoutComponent`.
- Duoc bao boi `guestGuard`.
- Muc dich la ngan nguoi da dang nhap quay lai man auth.

### Nhom chinh sau dang nhap

- `/dashboard`
- `/catalog/brands`
- `/catalog/categories`
- `/catalog/products`
- `/catalog/search`

Dac diem:

- Su dung `MainLayoutComponent`.
- Duoc bao boi `authGuard`.
- Route `/catalog/brands` co them `permissionGuard` voi `PRODUCT_VIEW`.

### Route he thong

- `/forbidden`
- `**` -> `NotFoundPage`

## Route constants

Nguon: `src/app/core/constants/app-routes.ts`

Da khai bao:

- `dashboard`
- `users`
- `roles`
- `brands`
- `categories`
- `products`
- `attributes`
- `search`

## Luu y

- Co route constants cho `users`, `roles`, `attributes` nhung route tree hien tai chua khai bao day du trong `app.routes.ts`.
- Khi them route moi, can kiem tra dong bo giua `APP_ROUTES`, sidebar/header navigation, va route config thuc te.
- Neu route can permission, uu tien dung `data.permissions` ket hop `permissionGuard`.
