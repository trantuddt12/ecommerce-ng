# API Inventory

## Muc dich

Tai lieu nay thong ke cac API frontend Angular dang su dung thuc te trong project, diem goi o service nao, HTTP method nao, tham so nao duoc gui len, va frontend dang ky vong response theo shape nao.

## Pham vi

- Nguon su that chinh:
  - `src/app/core/constants/api-endpoints.ts`
  - `src/app/core/http/base-api.service.ts`
  - `src/app/core/services/*.service.ts`
  - `src/app/core/interceptors/refresh-token.interceptor.ts`
- Chi liet ke API dang duoc frontend goi thuc te.
- Cac constant endpoint da khai bao nhung chua duoc frontend su dung duoc tach rieng o cuoi tai lieu.

## Quy uoc doc tai lieu

- `Caller`: service method hoac interceptor dang goi API.
- `Auth`: 
  - `Public`: khong nen ky vong access token.
  - `Session`: request di qua chuoi interceptor auth/refresh thong thuong.
- `Response`: shape frontend dang map o runtime.
  - `ApiEnvelope<T>`: thuong la `{ data: T }`.
  - `PagedApiEnvelope<T>`: thuong la `{ data: T[], page/pageable }`.
  - `Text`: response text, khong unwrap envelope.
- Tat ca API frontend hien tai di qua `BaseApiService` (`src/app/core/http/base-api.service.ts:11`), co timeout va URL builder tap trung.

## Rule bat buoc khi sua frontend lien quan API

- Neu thay doi frontend lien quan den them, xoa, doi endpoint, doi method, doi query/body, doi response mapping, hoac doi service call API, phai cap nhat ngay tai lieu nay trong cung task.
- Khong merge thay doi API frontend neu `AI/references/api-inventory.md` chua duoc dong bo.
- Neu chi them constant vao `API_ENDPOINTS` ma frontend chua goi toi, van phai cap nhat muc `Endpoint constants chua duoc frontend su dung`.

## Nen tang HTTP chung

### Base API layer

- `BaseApiService.get<T>(path, params?, source?)` -> GET voi query params (`src/app/core/http/base-api.service.ts:19`)
- `BaseApiService.post<T>(path, body, source?, params?)` -> POST JSON (`src/app/core/http/base-api.service.ts:25`)
- `BaseApiService.put<T>(path, body, source?)` -> PUT JSON (`src/app/core/http/base-api.service.ts:36`)
- `BaseApiService.patch<T>(path, body, source?)` -> PATCH JSON (`src/app/core/http/base-api.service.ts:40`)
- `BaseApiService.delete<T>(path, source?)` -> DELETE (`src/app/core/http/base-api.service.ts:44`)
- `BaseApiService.postFormData<T>(path, body, source?)` -> POST multipart/form-data (`src/app/core/http/base-api.service.ts:48`)
- `BaseApiService.postText(path, body, params?, source?)` -> POST nhan text (`src/app/core/http/base-api.service.ts:52`)

### Auth interceptor note

`refresh-token.interceptor.ts` bo qua auto-refresh cho cac endpoint public/auth sau (`src/app/core/interceptors/refresh-token.interceptor.ts:16-23`):

- `/auth/refresh`
- `/auth/login`
- `/auth/sendotp`
- `/auth/sendotpregister`
- `/auth/verifyotp`
- `/auth/logout`

## Danh sach API dang duoc frontend su dung

### 1. Auth

| HTTP | Endpoint | Caller | Auth | Request | Response | Ghi chu |
|---|---|---|---|---|---|---|
| POST | `/auth/login` | `AuthService.login` (`src/app/core/services/auth.service.ts:33`) | Public | `LoginRequest` | `ApiEnvelope<LoginResponse>` | Sau khi login, frontend luu `accessToken`, map current user, roi goi `/auth/me`. |
| POST | `/user/register` | `AuthService.register` (`src/app/core/services/auth.service.ts:50`) | Public | `RegisterRequest` | `ApiEnvelope<UserResponse>` | Dang dung endpoint user cho register. |
| POST | `/auth/sendotpregister` | `AuthService.registerWithOtp` (`src/app/core/services/auth.service.ts:54`) | Public | `RegisterRequest` | `ApiEnvelope<SendOtpResponse>` -> map `data` | Gui OTP cho dang ky. |
| POST | `/auth/refresh` | `AuthService.refresh` (`src/app/core/services/auth.service.ts:62`) | Public/cookie refresh | `{}` | `ApiEnvelope<LoginResponse>` | Dedupe bang `shareReplay(1)`, sau do goi `/auth/me`. |
| POST | `/auth/logout` | `AuthService.logout` (`src/app/core/services/auth.service.ts:95`) | Session | `{}` | `Text` | Loi 401/403 van clear session local. |
| POST | `/auth/sendotp` | `AuthService.sendOtp` (`src/app/core/services/auth.service.ts:108`) | Public | `SendOtpRequest` | `ApiEnvelope<SendOtpResponse>` -> map `data` | OTP login/use case khac. |
| POST | `/auth/forgot-password/request` | `AuthService.requestForgotPassword` (`src/app/core/services/auth.service.ts:112`) | Public | `{ email }` | `ApiEnvelope<SendOtpResponse>` -> map `data` | Khoi tao reset password. |
| POST | `/auth/verifyotp` | `AuthService.verifyOtp` (`src/app/core/services/auth.service.ts:116`) | Public | `VerifyOtpRequest` | `ApiEnvelope<VerifyOtpResponse>` -> map `data` | Verify OTP, chua luu session o buoc nay. |
| POST | `/auth/forgot-password/confirm` | `AuthService.confirmForgotPassword` (`src/app/core/services/auth.service.ts:137`) | Public | `ForgotPasswordConfirmRequest` | `string` | Khong unwrap envelope trong code hien tai. |
| GET | `/auth/me` | `CurrentUserService.loadCurrentUser` (`src/app/core/services/current-user.service.ts:31`) | Session | none | `BackendUser` hoac `ApiEnvelope<BackendUser>` | 401/403 thi clear session, con loi khac fallback decode JWT local. |

### 2. Health

| HTTP | Endpoint | Caller | Auth | Request | Response | Ghi chu |
|---|---|---|---|---|---|---|
| GET | `/health-check` | `HealthService.check` (`src/app/core/services/health.service.ts:9`) | Session/khong bat buoc tuy backend | none | `unknown` | Chua co unwrap cu the. |

### 3. User management

| HTTP | Endpoint | Caller | Auth | Request | Response | Ghi chu |
|---|---|---|---|---|---|---|
| GET | `/user` | `UserApiService.list` (`src/app/core/services/user-api.service.ts:11`) | Session | none | `UserResponse[]` hoac `ApiEnvelope<UserResponse[]>` | Frontend unwrap `data` neu co. |
| POST | `/user` | `UserApiService.create` (`src/app/core/services/user-api.service.ts:17`) | Session | `CreateUserRequest` | `UserResponse` hoac `ApiEnvelope<UserResponse>` | Tao user admin. |
| POST | `/user/update` | `UserApiService.update` (`src/app/core/services/user-api.service.ts:23`) | Session | `UpdateUserRequest` | `UserResponse` hoac `ApiEnvelope<UserResponse>` | Backend dang dung POST thay vi PATCH/PUT. |
| DELETE | `/user/{id}` | `UserApiService.delete` (`src/app/core/services/user-api.service.ts:29`) | Session | path param `id` | `string` | Khong unwrap. |

### 4. Role va permission management

| HTTP | Endpoint | Caller | Auth | Request | Response | Ghi chu |
|---|---|---|---|---|---|---|
| GET | `/role` | `RoleApiService.list` (`src/app/core/services/role-api.service.ts:11`) | Session | none | `RoleResponse[]` hoac `ApiEnvelope<RoleResponse[]>` | Lay danh sach role. |
| POST | `/role` | `RoleApiService.create` (`src/app/core/services/role-api.service.ts:17`) | Session | `{ name, description?, permissions[] }` | `RoleResponse` hoac `ApiEnvelope<RoleResponse>` | Tao role. |
| PATCH | `/role/{id}` | `RoleApiService.update` (`src/app/core/services/role-api.service.ts:23`) | Session | `{ name, description?, permissions[] }` | `RoleResponse` hoac `ApiEnvelope<RoleResponse>` | Sua role. |
| DELETE | `/role/{id}` | `RoleApiService.delete` (`src/app/core/services/role-api.service.ts:29`) | Session | path param `id` | `string` | Khong unwrap. |
| GET | `/permissions` | `RoleApiService.listPermissions` (`src/app/core/services/role-api.service.ts:33`) | Session | none | `PermissionResponse[]` hoac `ApiEnvelope<PermissionResponse[]>` | Lay permission de map vao role. |

### 5. Brand

| HTTP | Endpoint | Caller | Auth | Request | Response | Ghi chu |
|---|---|---|---|---|---|---|
| GET | `/brands` | `BrandApiService.list` (`src/app/core/services/brand-api.service.ts:12`) | Session | none | `Brand[]` hoac `ApiEnvelope<Brand[]>` | Danh sach admin. |
| GET | `/brands/storefront` | `BrandApiService.storefront` (`src/app/core/services/brand-api.service.ts:18`) | Session/public tuy backend | query none | `Brand[]` hoac `ApiEnvelope<Brand[]>` | Danh sach storefront. |
| GET | `/brands/storefront/by-slug/{slug}` | `BrandApiService.getStorefrontBySlug` (`src/app/core/services/brand-api.service.ts:24`) | Session/public tuy backend | path `slug` | `Brand` hoac `ApiEnvelope<Brand>` | Chi tiet brand theo slug. |
| POST | `/brands` | `BrandApiService.create` (`src/app/core/services/brand-api.service.ts:30`) | Session | `BrandCreateRequest` | `Brand` hoac `ApiEnvelope<Brand>` | Tao brand. |
| PATCH | `/brands/update/{id}` | `BrandApiService.update` (`src/app/core/services/brand-api.service.ts:36`) | Session | `BrandUpdateRequest` | `Brand` hoac `ApiEnvelope<Brand>` | Luu y update endpoint co segment `/update/`. |
| POST | `/brands/{id}/image` | `BrandApiService.uploadImage` (`src/app/core/services/brand-api.service.ts:42`) | Session | multipart field `image` | `Brand` hoac `ApiEnvelope<Brand>` | Upload anh dai dien. |
| DELETE | `/brands/{id}/image` | `BrandApiService.removeImage` (`src/app/core/services/brand-api.service.ts:51`) | Session | path `id` | `Brand` hoac `ApiEnvelope<Brand>` | Xoa anh dai dien. |
| POST | `/brands/{id}/images` | `BrandApiService.addImages` (`src/app/core/services/brand-api.service.ts:57`) | Session | multipart field `images[]` | `Brand` hoac `ApiEnvelope<Brand>` | Them gallery images. |
| GET | `/brands/{id}/images` | `BrandApiService.listImages` (`src/app/core/services/brand-api.service.ts:68`) | Session | path `id` | `ImageAsset[]` hoac `ApiEnvelope<ImageAsset[]>` | Lay gallery. |
| PATCH | `/brands/{id}/images/{imageId}/thumbnail` | `BrandApiService.setThumbnail` (`src/app/core/services/brand-api.service.ts:74`) | Session | body `{}` | `Brand` hoac `ApiEnvelope<Brand>` | Set thumbnail. |
| DELETE | `/brands/{id}/images/{imageId}` | `BrandApiService.deleteImage` (`src/app/core/services/brand-api.service.ts:80`) | Session | path `id`, `imageId` | `Brand` hoac `ApiEnvelope<Brand>` | Xoa 1 gallery image. |
| DELETE | `/brands/{id}` | `BrandApiService.delete` (`src/app/core/services/brand-api.service.ts:86`) | Session | path `id` | `void` | Xoa brand. |

### 6. Category

| HTTP | Endpoint | Caller | Auth | Request | Response | Ghi chu |
|---|---|---|---|---|---|---|
| GET | `/categories` | `CategoryApiService.list` (`src/app/core/services/category-api.service.ts:35`) | Session | query filters tu caller | `Category[]` hoac `ApiEnvelope<Category[]>` | List don gian. |
| GET | `/categories` | `CategoryApiService.listPage` (`src/app/core/services/category-api.service.ts:41`) | Session | query filters tu caller | `PagedApiEnvelope<Category>` hoac `ApiEnvelope<Category[]>` | Frontend tu map `page._totalElements`, `_currentPage`, `_pageSize`, `_totalPages`. |
| GET | `/categories/tree` | `CategoryApiService.tree` (`src/app/core/services/category-api.service.ts:47`) | Session | query filters | `CategoryTreeNode[]` hoac `ApiEnvelope<CategoryTreeNode[]>` | Tree admin. |
| GET | `/categories/storefront` | `CategoryApiService.storefront` (`src/app/core/services/category-api.service.ts:53`) | Session/public tuy backend | query filters | `Category[]` hoac `ApiEnvelope<Category[]>` | List category public/storefront. |
| GET | `/categories/storefront/tree` | `CategoryApiService.storefrontTree` (`src/app/core/services/category-api.service.ts:59`) | Session/public tuy backend | query filters | `CategoryTreeNode[]` hoac `ApiEnvelope<CategoryTreeNode[]>` | Tree public. |
| GET | `/categories/storefront/by-slug/{slug}` | `CategoryApiService.getStorefrontBySlug` (`src/app/core/services/category-api.service.ts:65`) | Session/public tuy backend | path `slug` | `Category` hoac `ApiEnvelope<Category>` | Category detail cho storefront. |
| GET | `/categories/{id}` | `CategoryApiService.getById` (`src/app/core/services/category-api.service.ts:71`) | Session | path `id` | `Category` hoac `ApiEnvelope<Category>` | Detail admin. |
| GET | `/categories/by-slug/{slug}` | `CategoryApiService.getBySlug` (`src/app/core/services/category-api.service.ts:77`) | Session | path `slug` | `Category` hoac `ApiEnvelope<Category>` | Detail theo slug. |
| POST | `/categories` | `CategoryApiService.create` (`src/app/core/services/category-api.service.ts:83`) | Session | `CategoryMutationRequest` | `Category` hoac `ApiEnvelope<Category>` | Tao category. |
| PATCH | `/categories/{id}` | `CategoryApiService.update` (`src/app/core/services/category-api.service.ts:89`) | Session | `CategoryMutationRequest` | `Category` hoac `ApiEnvelope<Category>` | Sua category. |
| GET | `/categories/deleted` | `CategoryApiService.deleted` (`src/app/core/services/category-api.service.ts:95`) | Session | none | `Category[]` hoac `ApiEnvelope<Category[]>` | Danh sach category da xoa/deleted. |
| POST | `/categories/{id}/deactivate` | `CategoryApiService.deactivate` (`src/app/core/services/category-api.service.ts:101`) | Session | body `{}` | `Category` hoac `ApiEnvelope<Category>` | Deactivate category. |
| PATCH | `/categories/{id}/status` | `CategoryApiService.updateStatus` (`src/app/core/services/category-api.service.ts:107`) | Session | `{ status }` | `Category` hoac `ApiEnvelope<Category>` | Doi status. |
| PATCH | `/categories/{id}/move` | `CategoryApiService.move` (`src/app/core/services/category-api.service.ts:113`) | Session | `CategoryMoveRequest` | `Category` hoac `ApiEnvelope<Category>` | Doi parent/vi tri. |
| PATCH | `/categories/reorder` | `CategoryApiService.reorder` (`src/app/core/services/category-api.service.ts:119`) | Session | `CategoryReorderRequest` | `Category[]` hoac `ApiEnvelope<Category[]>` | Reorder tree/list. |
| POST | `/categories/merge` | `CategoryApiService.merge` (`src/app/core/services/category-api.service.ts:125`) | Session | `CategoryMergeRequest` | `Category` hoac `ApiEnvelope<Category>` | Merge category. |
| DELETE | `/categories/{id}` | `CategoryApiService.delete` (`src/app/core/services/category-api.service.ts:131`) | Session | path `id` | `void` | Xoa category. |
| POST | `/categories/{id}/images` | `CategoryApiService.addImages` (`src/app/core/services/category-api.service.ts:135`) | Session | multipart field `images[]` | `Category` hoac `ApiEnvelope<Category>` | Them gallery images. |
| PATCH | `/categories/{id}/images/{imageId}/thumbnail` | `CategoryApiService.setThumbnail` (`src/app/core/services/category-api.service.ts:146`) | Session | body `{}` | `Category` hoac `ApiEnvelope<Category>` | Set thumbnail image. |
| DELETE | `/categories/{id}/images/{imageId}` | `CategoryApiService.deleteImage` (`src/app/core/services/category-api.service.ts:152`) | Session | path `id`, `imageId` | `Category` hoac `ApiEnvelope<Category>` | Xoa image. |
| GET | `/categories/{id}/images` | `CategoryApiService.listImages` (`src/app/core/services/category-api.service.ts:158`) | Session | path `id` | `ImageAsset[]` hoac `ApiEnvelope<ImageAsset[]>` | Lay danh sach image. |

### 7. Product

| HTTP | Endpoint | Caller | Auth | Request | Response | Ghi chu |
|---|---|---|---|---|---|---|
| GET | `/products` | `ProductApiService.list` (`src/app/core/services/product-api.service.ts:21`) | Session | query tu `ProductFilter` | `AdminProductListItem[]` hoac `ApiEnvelope<AdminProductListItem[]>` | Query gom `categoryId`, `brandId`, `minPrice`, `maxPrice`, `status`, `keyword`. |
| GET | `/products/storefront` | `ProductApiService.storefront` (`src/app/core/services/product-api.service.ts:27`) | Session/public tuy backend | query tu `ProductFilter` | `AdminProductListItem[]` hoac `ApiEnvelope<AdminProductListItem[]>` | List san pham storefront. |
| GET | `/products/storefront/catalog` | `ProductApiService.storefrontCatalog` (`src/app/core/services/product-api.service.ts:33`) | Session/public tuy backend | query `{ featuredLimit }` | `StorefrontCatalog` hoac `ApiEnvelope<StorefrontCatalog>` | Tra categories, brands, featuredProducts. |
| GET | `/products/storefront/{id}` | `ProductApiService.getStorefrontById` (`src/app/core/services/product-api.service.ts:39`) | Session/public tuy backend | path `id` | `AdminProductDetail` hoac `ApiEnvelope<AdminProductDetail>` | Chi tiet san pham public. |
| GET | `/products/{id}` | `ProductApiService.getById` (`src/app/core/services/product-api.service.ts:45`) | Session | path `id` | `AdminProductDetail` hoac `ApiEnvelope<AdminProductDetail>` | Chi tiet admin. |
| POST | `/products` | `ProductApiService.create` (`src/app/core/services/product-api.service.ts:51`) | Session | multipart: `product` JSON string + `images[]` | `AdminProductDetail` hoac `ApiEnvelope<AdminProductDetail>` | Tao product va upload images cung luc. |
| PATCH | `/products/{id}` | `ProductApiService.update` (`src/app/core/services/product-api.service.ts:58`) | Session | `AdminProductUpsertRequest` | `AdminProductDetail` hoac `ApiEnvelope<AdminProductDetail>` | Sua product. |
| PATCH | `/products/{id}/status` | `ProductApiService.updateStatus` (`src/app/core/services/product-api.service.ts:64`) | Session | `{ status }` | `AdminProductDetail` hoac `ApiEnvelope<AdminProductDetail>` | Doi status product. |
| GET | `/products/{id}/images` | `ProductApiService.listImages` (`src/app/core/services/product-api.service.ts:70`) | Session | path `id` | `ProductImage[]` hoac `ApiEnvelope<ProductImage[]>` | Lay images. |
| POST | `/products/{id}/images` | `ProductApiService.addImages` (`src/app/core/services/product-api.service.ts:76`) | Session | multipart field `images[]` | `AdminProductDetail` hoac `ApiEnvelope<AdminProductDetail>` | Them anh vao gallery. |
| PATCH | `/products/{id}/images/{imageId}/thumbnail` | `ProductApiService.setThumbnail` (`src/app/core/services/product-api.service.ts:83`) | Session | body `{}` | `AdminProductDetail` hoac `ApiEnvelope<AdminProductDetail>` | Set thumbnail. |
| DELETE | `/products/{id}/images/{imageId}` | `ProductApiService.deleteImage` (`src/app/core/services/product-api.service.ts:89`) | Session | path `id`, `imageId` | `AdminProductDetail` hoac `ApiEnvelope<AdminProductDetail>` | Xoa 1 image. |

### 8. Inventory

| HTTP | Endpoint | Caller | Auth | Request | Response | Ghi chu |
|---|---|---|---|---|---|---|
| GET | `/admin/inventories` | `InventoryApiService.list` (`src/app/core/services/inventory-api.service.ts:33`) | Session | query `InventoryQuery` | `PagedApiEnvelope<AdminInventoryListItem>` hoac `ApiEnvelope<AdminInventoryListItem[]>` | Query gom `keyword`, `inventoryStatus`, `categoryId`, `brandId`, `page`, `size`, `sortBy`, `sortDir`. |
| GET | `/admin/inventories/{variantId}` | `InventoryApiService.getByVariantId` (`src/app/core/services/inventory-api.service.ts:42`) | Session | path `variantId` | `AdminInventoryDetail` hoac `ApiEnvelope<AdminInventoryDetail>` | Detail inventory theo variant. |
| GET | `/admin/inventories/{variantId}/movements` | `InventoryApiService.getMovements` (`src/app/core/services/inventory-api.service.ts:48`) | Session | path `variantId`, query `{ limit }` | `InventoryMovement[]` hoac `ApiEnvelope<InventoryMovement[]>` | Lich su bien dong ton kho. |
| POST | `/admin/inventories/{variantId}/adjustments` | `InventoryApiService.adjust` (`src/app/core/services/inventory-api.service.ts:54`) | Session | `AdminInventoryAdjustmentRequest` | `AdminInventoryDetail` hoac `ApiEnvelope<AdminInventoryDetail>` | Dieu chinh ton kho. |

### 9. Attribute definitions va options

| HTTP | Endpoint | Caller | Auth | Request | Response | Ghi chu |
|---|---|---|---|---|---|---|
| GET | `/attributes` | `AttributeApiService.listDefinitions` (`src/app/core/services/attribute-api.service.ts:17`) | Session | none | `AttributeDefinition[]` hoac `ApiEnvelope<AttributeDefinition[]>` | Lay definitions. |
| POST | `/attributes` | `AttributeApiService.createDefinition` (`src/app/core/services/attribute-api.service.ts:23`) | Session | `AttributeDefinitionRequest` | `AttributeDefinition` | Code hien tai khong unwrap envelope. |
| PATCH | `/attributes/{id}` | `AttributeApiService.updateDefinition` (`src/app/core/services/attribute-api.service.ts:27`) | Session | `AttributeDefinitionRequest` | `AttributeDefinition` | Code hien tai khong unwrap envelope. |
| DELETE | `/attributes/{id}` | `AttributeApiService.deleteDefinition` (`src/app/core/services/attribute-api.service.ts:31`) | Session | path `id` | `void` | Xoa definition. |
| GET | `/attribute-options` | `AttributeApiService.listOptions` (`src/app/core/services/attribute-api.service.ts:35`) | Session | none | `AttributeValue[]` hoac `ApiEnvelope<AttributeValue[]>` | Lay options. |
| POST | `/attribute-options` | `AttributeApiService.createOption` (`src/app/core/services/attribute-api.service.ts:41`) | Session | `AttributeValueRequest` | `AttributeValue` | Code hien tai khong unwrap envelope. |
| PATCH | `/attribute-options/{id}` | `AttributeApiService.updateOption` (`src/app/core/services/attribute-api.service.ts:45`) | Session | `AttributeValueRequest` | `AttributeValue` | Code hien tai khong unwrap envelope. |
| DELETE | `/attribute-options/{id}` | `AttributeApiService.deleteOption` (`src/app/core/services/attribute-api.service.ts:49`) | Session | path `id` | `void` | Xoa option. |

### 10. Category attributes

| HTTP | Endpoint | Caller | Auth | Request | Response | Ghi chu |
|---|---|---|---|---|---|---|
| GET | `/categories/{categoryId}/attributes` | `CategoryAttributeApiService.list` (`src/app/core/services/category-attribute-api.service.ts:12`) | Session | path `categoryId`, query `{ includeInherited }` | `CategoryAttribute[]` hoac `ApiEnvelope<CategoryAttribute[]>` | Lay attribute theo category. |
| POST | `/categories/{categoryId}/attributes` | `CategoryAttributeApiService.create` (`src/app/core/services/category-attribute-api.service.ts:18`) | Session | `CategoryAttributeRequest` | `CategoryAttribute` | Code hien tai khong unwrap envelope. |
| PATCH | `/categories/{categoryId}/attributes/{id}` | `CategoryAttributeApiService.update` (`src/app/core/services/category-attribute-api.service.ts:22`) | Session | `CategoryAttributeRequest` | `CategoryAttribute` | Code hien tai khong unwrap envelope. |
| DELETE | `/categories/{categoryId}/attributes/{id}` | `CategoryAttributeApiService.delete` (`src/app/core/services/category-attribute-api.service.ts:26`) | Session | path `categoryId`, `id` | `void` | Xoa relation/category attribute. |

### 11. Import / Export

| HTTP | Endpoint | Caller | Auth | Request | Response | Ghi chu |
|---|---|---|---|---|---|---|
| POST | `/import/brand` | `ImportExportApiService.import('brand')` (`src/app/core/services/import-export-api.service.ts:17`) | Session | query `interfaceFileId`, `fileName`, body `null` | `Text` | Goi qua `postText`. |
| POST | `/import/category` | `ImportExportApiService.import('category')` (`src/app/core/services/import-export-api.service.ts:17`) | Session | query `interfaceFileId`, `fileName`, body `null` | `Text` | Goi qua `postText`. |
| POST | `/import/product` | `ImportExportApiService.import('product')` (`src/app/core/services/import-export-api.service.ts:17`) | Session | query `interfaceFileId`, `fileName`, body `null` | `Text` | Goi qua `postText`. |
| POST | `/import/attributes` | `ImportExportApiService.import('attributes')` (`src/app/core/services/import-export-api.service.ts:17`) | Session | query `interfaceFileId`, `fileName`, body `null` | `Text` | Goi qua `postText`. |
| POST | `/import/category-attributes` | `ImportExportApiService.import('category-attributes')` (`src/app/core/services/import-export-api.service.ts:17`) | Session | query `interfaceFileId`, `fileName`, body `null` | `Text` | Goi qua `postText`. |
| POST | `/export/brand` | `ImportExportApiService.export('brand')` (`src/app/core/services/import-export-api.service.ts:21`) | Session | query `interfaceFileId`, `fileName`, body `null` | `Text` | Goi qua `postText`. |
| POST | `/export/category` | `ImportExportApiService.export('category')` (`src/app/core/services/import-export-api.service.ts:21`) | Session | query `interfaceFileId`, `fileName`, body `null` | `Text` | Goi qua `postText`. |
| POST | `/export/product` | `ImportExportApiService.export('product')` (`src/app/core/services/import-export-api.service.ts:21`) | Session | query `interfaceFileId`, `fileName`, body `null` | `Text` | Goi qua `postText`. |
| POST | `/export/attributes` | `ImportExportApiService.export('attributes')` (`src/app/core/services/import-export-api.service.ts:21`) | Session | query `interfaceFileId`, `fileName`, body `null` | `Text` | Goi qua `postText`. |
| POST | `/export/category-attributes` | `ImportExportApiService.export('category-attributes')` (`src/app/core/services/import-export-api.service.ts:21`) | Session | query `interfaceFileId`, `fileName`, body `null` | `Text` | Goi qua `postText`. |

### 12. Cart

| HTTP | Endpoint | Caller | Auth | Request | Response | Ghi chu |
|---|---|---|---|---|---|---|
| GET | `/carts/me` | `CartApiService.getMyCart` (`src/app/core/services/cart-api.service.ts:19`) | Session | none | `Cart` hoac `ApiEnvelope<Cart>` | Lay gio hang hien tai. |
| PUT | `/carts/me/items` | `CartApiService.upsertItem` (`src/app/core/services/cart-api.service.ts:25`) | Session | `CartItemUpsertRequest` | `Cart` hoac `ApiEnvelope<Cart>` | Them/sua quantity item. |
| DELETE | `/carts/me/items/{variantId}` | `CartApiService.removeItem` (`src/app/core/services/cart-api.service.ts:31`) | Session | path `variantId` | `Cart` hoac `ApiEnvelope<Cart>` | Xoa item khoi cart. |
| POST | `/carts/me/voucher/apply` | `CartApiService.applyVoucher` (`src/app/core/services/cart-api.service.ts:37`) | Session | `CartApplyVoucherRequest` | `Cart` hoac `ApiEnvelope<Cart>` | Apply voucher. |
| DELETE | `/carts/me/voucher` | `CartApiService.removeVoucher` (`src/app/core/services/cart-api.service.ts:43`) | Session | none | `Cart` hoac `ApiEnvelope<Cart>` | Remove voucher. |
| GET | `/carts/me/pricing-preview` | `CartApiService.previewPricing` (`src/app/core/services/cart-api.service.ts:49`) | Session | none | `CheckoutPricingPreview` hoac `ApiEnvelope<CheckoutPricingPreview>` | Preview gia tri thanh toan. |
| PATCH | `/carts/me/checkout` | `CartApiService.checkout` (`src/app/core/services/cart-api.service.ts:55`) | Session | `CheckoutFromCartRequest` | `OrderDetail` hoac `ApiEnvelope<OrderDetail>` | Checkout tu cart. |

### 13. Orders

| HTTP | Endpoint | Caller | Auth | Request | Response | Ghi chu |
|---|---|---|---|---|---|---|
| GET | `/orders` | `OrderApiService.list` (`src/app/core/services/order-api.service.ts:39`) | Session | query `OrderListFilters` | `PagedApiEnvelope<OrderListItem>` hoac `ApiEnvelope<OrderListItem[]>` | Query gom `orderNumber`, `orderStatus`, `paymentStatus`, `customerPhone`, `page`, `size`, `sortBy`, `sortDir`. |
| GET | `/orders/{id}` | `OrderApiService.getById` (`src/app/core/services/order-api.service.ts:45`) | Session | path `id` | `OrderDetail` hoac `ApiEnvelope<OrderDetail>` | Frontend bo sung default cho `canCancel`, `canReturn`, `canPay`, `availableActions`, `items`, `histories`. |
| PATCH | `/orders/{id}/admin-status` | `OrderApiService.updateAdminStatus` (`src/app/core/services/order-api.service.ts:51`) | Session | `OrderAdminStatusUpdateRequest` | `OrderDetail` hoac `ApiEnvelope<OrderDetail>` | Cap nhat trang thai admin. |
| PATCH | `/orders/{id}/payment-status` | `OrderApiService.updateAdminPaymentStatus` (`src/app/core/services/order-api.service.ts:57`) | Session | `{ paymentStatus, internalNote }` | `OrderDetail` hoac `ApiEnvelope<OrderDetail>` | Cap nhat payment status. |
| PATCH | `/orders/{id}/fulfillment` | `OrderApiService.updateAdminFulfillment` (`src/app/core/services/order-api.service.ts:63`) | Session | `OrderAdminStatusUpdateRequest` | `OrderDetail` hoac `ApiEnvelope<OrderDetail>` | Cap nhat fulfillment. |
| GET | `/orders/me` | `OrderApiService.listMyOrders` (`src/app/core/services/order-api.service.ts:69`) | Session | query `page`, `size`, `sortBy`, `sortDir` | `PagedApiEnvelope<OrderListItem>` hoac `ApiEnvelope<OrderListItem[]>` | Danh sach order cua user hien tai. |
| GET | `/orders/me/{id}` | `OrderApiService.getMyOrderById` (`src/app/core/services/order-api.service.ts:75`) | Session | path `id` | `OrderDetail` hoac `ApiEnvelope<OrderDetail>` | Detail order cua user. |
| PATCH | `/orders/me/{id}/cancel` | `OrderApiService.cancelMyOrder` (`src/app/core/services/order-api.service.ts:81`) | Session | `CustomerOrderCancelRequest` | `OrderDetail` hoac `ApiEnvelope<OrderDetail>` | Huy order. |
| POST | `/orders/me/{id}/return-requests` | `OrderApiService.requestReturn` (`src/app/core/services/order-api.service.ts:87`) | Session | `CustomerOrderReturnRequest` | `OrderDetail` hoac `ApiEnvelope<OrderDetail>` | Gui yeu cau tra hang. |

## Endpoint constants chua duoc frontend su dung

Nhung endpoint sau da co trong `src/app/core/constants/api-endpoints.ts` nhung chua thay caller thuc te trong `src/app/core/services/` hoac phan con lai cua `src/app/`:

| Endpoint constant | Path | Ghi chu |
|---|---|---|
| `API_ENDPOINTS.search.brand` | `/search/brand` | Chua thay service hoac component goi toi. |
| `API_ENDPOINTS.export.categoryAttributesImport` | `/export/category-attributes/import` | Da khai bao constant nhung `ImportExportApiService` chua map domain nao toi endpoint nay. |

## Checklist khi doi API frontend

1. Sua `API_ENDPOINTS` neu contract endpoint doi.
2. Sua service caller va response mapping.
3. Kiem tra interceptor/auth impact neu endpoint thuoc auth/public.
4. Cap nhat file nay trong cung commit/task.
5. Neu endpoint khong con duoc dung, chuyen no xuong muc endpoint constants chua duoc frontend su dung hoac xoa constant neu phu hop.
