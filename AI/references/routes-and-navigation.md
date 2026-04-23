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

### Nhom admin

- `/admin/dashboard`
- `/admin/management/users`
- `/admin/management/roles`
- `/admin/catalog/brands`
- `/admin/catalog/categories`
- `/admin/catalog/products`
- `/admin/catalog/attributes`
- `/admin/catalog/operations`
- `/admin/catalog/search`
- `/admin/orders`

Dac diem:

- Su dung `MainLayoutComponent`.
- Duoc bao boi `authGuard`.
- Tung route dung `permissionGuard` voi `data.permissions` theo permission backend.

### Nhom client

- `/client/checkout`
- `/client/orders/me`
- `/client/orders/me/:id`

Dac diem:

- Su dung `ClientLayoutComponent`.
- Duoc bao boi `authGuard` va `permissionGuard` o `canActivateChild`.
- Route client hien duoc tach theo `data.roles = ['CUSTOMER']` de ngan user admin/staff di vao man client khi da dang nhap.

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
- `operations`
- `search`
- `checkout`
- `myOrders`
- `adminOrders`

## Luu y

- Khi them route moi, can kiem tra dong bo giua `APP_ROUTES`, sidebar/header navigation, va route config thuc te.
- Route admin uu tien dung `data.permissions` ket hop `permissionGuard`.
- Route client co the dung `data.roles` neu can tach audience theo vai tro ma khong doi backend permission contract.
