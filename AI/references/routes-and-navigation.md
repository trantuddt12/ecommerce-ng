# Routes And Navigation

## Route tree hien tai

Nguon chinh: `src/app/app.routes.ts`. `''` redirect ve `/home`. `/dashboard` redirect ve `/admin/dashboard`.

### Nhom public (storefront)

Nguon: `src/app/features/public/public.routes.ts`

- `/home` -> `PublicProductsPage`
- `/home/products` -> redirect ve `/home`
- `/home/products/:id` -> `PublicProductDetailPage`
- `/home/category/:categorySlug` -> `PublicProductsPage`
- `/home/brand/:brandSlug` -> `PublicProductsPage`
- `/home/dashboard` -> `DashboardPage`

Dac diem:

- Su dung `ClientLayoutComponent`.
- Khong bao guard, ai cung vao duoc.

### Nhom auth

- `/auth/login`
- `/auth/register`
- `/auth/verify-email`
- `/auth/verify-otp`
- `/auth/forgot-password`
- `/auth/reset-password`

Dac diem:

- Su dung `AuthLayoutComponent`.
- Duoc bao boi `guestGuard`.
- Muc dich la ngan nguoi da dang nhap quay lai man auth.

### Nhom admin

Nguon: `src/app/features/admin/admin.routes.ts`

- `/admin/dashboard`
- `/admin/management/users`
- `/admin/management/roles`
- `/admin/catalog/brands`
- `/admin/catalog/categories`
- `/admin/catalog/products`
- `/admin/catalog/inventory`
- `/admin/catalog/attributes`
- `/admin/catalog/operations`
- `/admin/catalog/search`
- `/admin/orders`
- `/admin/orders/:id`

Dac diem:

- Su dung `MainLayoutComponent`.
- Duoc bao boi `authGuard` o cap children.
- Tung route dung `permissionGuard` voi `data.permissions` theo permission backend (vi du `PRODUCT_VIEW`, `ORDER_VIEW`).

### Nhom client

Nguon: `src/app/features/client/client.routes.ts`

- `/client/cart`
- `/client/checkout`
- `/client/payments/momo/:orderId`
- `/client/orders/me`
- `/client/orders/me/:id`

Dac diem:

- Su dung `ClientLayoutComponent`.
- Duoc bao boi `authGuard` va `permissionGuard` o `canActivateChild`.
- Route client hien duoc tach theo `data.roles = ['CUSTOMER']` de ngan user admin/staff di vao man client khi da dang nhap.

### Route he thong

- `/forbidden` -> `ForbiddenPage`
- `**` -> `NotFoundPage`

## Route constants

Nguon: `src/app/core/constants/app-routes.ts`

Da khai bao (string constants):

- `home`, `homeProducts`
- `login`
- `dashboard`
- `users`, `roles`
- `brands`, `categories`, `products`, `inventory`, `attributes`, `operations`, `search`
- `cart`, `cartCheckout`
- `myOrders`, `adminOrders`

Da khai bao (factory functions):

- `storefrontCategory(slug)`, `storefrontBrand(slug)`, `storefrontProductDetail(id)`
- `momoPayment(orderId)`
- `myOrderDetail(id)`, `adminOrderDetail(id)`

## Luu y

- Khi them route moi, can kiem tra dong bo giua `APP_ROUTES`, sidebar/header navigation, va route config thuc te.
- Route admin uu tien dung `data.permissions` ket hop `permissionGuard`.
- Route client co the dung `data.roles` neu can tach audience theo vai tro ma khong doi backend permission contract.
