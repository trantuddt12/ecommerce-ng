# Tai lieu tich hop Backend cho Frontend Angular

## 1. Muc dich tai lieu

Tai lieu nay mo ta chi tiet contract backend hien tai cua project `ecommerce-shop` de team frontend Angular co the dua vao do xay dung giao dien, service layer, state management va luong xac thuc.

Tai lieu nay duoc rut ra tu code backend hien tai, khong chi dua tren y tuong thiet ke. Vi vay, neu co diem nao trong code chua dong bo hoan toan voi mong muon san pham, frontend nen uu tien bam theo tai lieu nay khi implement.

## 2. Tong quan kien truc backend

Project la monorepo Maven gom cac module chinh:

- `basecommerce`: app backend chinh, runtime chinh cho frontend goi vao.
- `coreservice`: auth, user, role, security, JWT, OTP, response wrapper, error handling.
- `common`: DTO, request, response, constant dung chung.
- `searchservice`: service tim kiem rieng cho brand.
- `scraper`: scraping va import CSV.

### 2.1 Runtime hien tai

- Backend chinh: `basecommerce`
- Entry point: `basecommerce/src/main/java/com/ttl/base/BaseCommerceApplication.java`
- `basecommerce` su dung `@SpringBootApplication(scanBasePackages = "com.ttl")`
- Nghia la cac controller trong `coreservice` va `basecommerce` deu cung chay trong app chinh

### 2.2 Base URLs cho frontend

- Main API: `http://localhost:8081`
- Search API: `http://localhost:8082`
- Swagger UI du kien: `http://localhost:8081/swagger-ui.html` hoac `http://localhost:8081/swagger-ui/index.html`

## 3. Nguyen tac tich hop cho Angular

Frontend Angular nen tach thanh 2 API clients:

- `mainApiClient`: goi vao `http://localhost:8081`
- `searchApiClient`: goi vao `http://localhost:8082`

Frontend nen cau hinh:

- `withCredentials: true` cho cac request den main API co lien quan auth/refresh cookie
- `Authorization: Bearer <accessToken>` cho cac request can xac thuc
- co interceptor de tu dong gan access token
- co interceptor de xu ly `401` va goi `POST /auth/refresh`

## 4. Co che auth va session

## 4.1 Tong quan

Backend dung:

- JWT access token tra trong response body
- refresh token tra trong response body va dong thoi set vao `HttpOnly cookie`
- backend dang cho phep CORS origin mac dinh: `http://localhost:4200`
- `allowCredentials = true`

Frontend can xem `refresh token cookie` la nguon refresh chinh. Khong nen doc hay phu thuoc vao `refreshToken` trong body de quan ly session.

## 4.2 Cookie refresh token

Cookie refresh token duoc tao voi cac thuoc tinh:

- ten cookie: gia tri tu constant `ITag.REFRESH_TOKEN`
- `HttpOnly = true`
- `path = /`
- `sameSite = Strict` theo default config
- `secure = true` theo default config neu khong override

Luu y quan trong cho frontend:

- neu backend chay local qua HTTP va `secure=true`, refresh cookie co the khong hoat dong nhu mong doi tren moi truong local
- frontend bat buoc gui request voi `withCredentials: true`

## 4.3 Public endpoints

Theo `SecurityConfig`, cac endpoint sau duoc `permitAll`:

- `POST /auth/**`
- `GET /health-check`
- `GET /home`
- `GET /mylogin`
- `GET/POST /mcp/**`
- `GET /v3/api-docs/**`
- `GET /swagger-ui/**`
- `POST /user/register`

Tat ca endpoint con lai mac dinh yeu cau authenticated.

## 4.4 Permission model quan sat duoc

Trong code hien tai, mot so permission duoc dung trong `@PreAuthorize`:

- `USER_MANAGE`
- `USER_VIEW`
- `ROLE_MANAGE`
- `ROLE_VIEW`
- `PRODUCT_VIEW`

Frontend nen thiet ke permission guard theo string, khong hard-code logic theo role name.

## 5. Response format can frontend support

## 5.1 Wrapper mac dinh cua main API

Nhieu response JSON trong app chinh se bi wrap boi `ResponseBodyAdvice` thanh format sau:

```json
{
  "data": {},
  "timestamp": "2026-04-16T10:20:30.000+07:00",
  "page": {
    "_totalElements": 1,
    "_currentPage": 0,
    "_pageSize": 0,
    "_totalPages": 1
  }
}
```

Quy tac thuc te:

- neu controller tra ve object JSON thong thuong: backend wrap thanh `{ data, timestamp?, page? }`
- neu controller tra ve collection: van bi wrap
- neu controller tra ve `Page`: co them metadata page
- neu controller tra ve `String`: khong bi wrap
- neu controller tra ve file/resource: khong bi wrap
- neu controller tra ve loi `ErrorMessage`: khong bi wrap

### 5.1.1 TypeScript de xuat

```ts
export interface ApiEnvelope<T> {
  data: T;
  timestamp?: string;
  page?: {
    _totalElements: number;
    _currentPage: number;
    _pageSize: number;
    _totalPages: number;
  };
}
```

Frontend nen viet helper `unwrapResponse()` hoac interceptor/decorator service de thao tac nhat quan.

## 5.2 Error response format

Khi loi, backend thuong tra ve:

```json
{
  "error": "message text or object",
  "status": "400 BAD_REQUEST"
}
```

Hoac voi validation error:

```json
{
  "error": {
    "username": "...",
    "password": "..."
  },
  "status": "400 BAD_REQUEST"
}
```

Frontend nen support 3 truong hop:

- `error` la string
- `error` la object field validation
- `401` tu security layer

### 5.2.1 TypeScript de xuat

```ts
export interface ApiErrorResponse {
  error: string | Record<string, string>;
  status: string;
}
```

## 5.3 Search service response format

`searchservice` chay rieng tren port `8082` va khong dung chung response wrapper cua `coreservice`.

Endpoint hien tai:

- `GET /search/brand`

Response dang la `ResponseEntity<String>`, nghia la frontend phai san sang nhan raw JSON string hoac plain text string tuy theo service Elasticsearch tra ve.

Khuyen nghi cho Angular:

- goi API nay voi `responseType: 'text'`
- neu backend tra chuoi JSON thi `JSON.parse()` sau

## 6. Chi tiet API cho Angular

## 6.1 Auth APIs

Base path: `/auth`

### 6.1.1 Dang nhap

- Method: `POST`
- URL: `/auth/login`
- Auth: public
- Content-Type: `application/json`

Request body:

```json
{
  "username": "admin",
  "password": "123456",
  "googleToken": "optional"
}
```

Request model:

```ts
export interface LoginRequest {
  username: string;
  password: string;
  googleToken?: string | null;
}
```

Response body thuc te se la JSON wrapper:

```json
{
  "data": {
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token"
  }
}
```

Response model:

```ts
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}
```

Hanh vi frontend can lam:

- luu `accessToken` o memory, service state hoac storage theo chien luoc cua team
- khong doc refresh token cookie tu JS vi cookie la `HttpOnly`
- neu backend co set-cookie, browser se tu luu cookie neu request co `withCredentials: true`

### 6.1.2 Refresh access token

- Method: `POST`
- URL: `/auth/refresh`
- Auth: public, dua tren refresh cookie
- Body: khong can body
- Bat buoc `withCredentials: true`

Neu cookie hop le, response:

```json
{
  "data": {
    "accessToken": "new-access-token",
    "refreshToken": "new-refresh-token"
  }
}
```

Neu cookie khong hop le hoac khong co:

```json
{
  "error": "No refresh token cookie",
  "status": "401 UNAUTHORIZED"
}
```

Hoac:

```json
{
  "error": "Invalid refresh token",
  "status": "TOKEN_INVALID_OR_EXPIRED"
}
```

Luu y:

- endpoint nay se rotate refresh token cookie
- frontend chi can cap nhat lai `accessToken`

### 6.1.3 Dang xuat

- Method: `POST`
- URL: `/auth/logout`
- Auth: public
- Body: rong
- Bat buoc `withCredentials: true`

Response:

- raw string: `Logged out successfully`

Luu y:

- do la `String`, endpoint nay khong bi response wrapper bao ngoai
- backend se expire refresh cookie

### 6.1.4 Gui OTP chung

- Method: `POST`
- URL: `/auth/sendotp`
- Auth: public
- Params query:
  - `pOtpType`
  - `pToEmail`

Vi du:

`POST /auth/sendotp?pOtpType=RESET_PASSWORD&pToEmail=user@example.com`

Response:

- raw string email vua gui, vi du: `user@example.com`

### 6.1.5 Gui OTP dang ky

- Method: `POST`
- URL: `/auth/sendotpregister`
- Auth: public

Request body:

```json
{
  "username": "newuser",
  "password": "123456",
  "email": "user@example.com",
  "phonenumber": "0900000000",
  "roleId": 2
}
```

Response:

- raw string email vua gui

Luu y:

- backend luu tam thong tin dang ky trong Redis theo flow OTP
- phia frontend nen xem day la buoc 1 trong quy trinh dang ky

### 6.1.6 Xac thuc OTP

- Method: `POST`
- URL: `/auth/verifyotp`
- Auth: public
- Params query:
  - `pOtpType`
  - `pEmail`
  - `pOtp`

Vi du:

`POST /auth/verifyotp?pOtpType=OTP_REGISTER&pEmail=user@example.com&pOtp=123456`

Response thanh cong:

- raw string OTP

Response that bai:

```json
{
  "error": "Invalid or expired OTP",
  "status": "OTP_INVALID"
}
```

### 6.1.7 Luu y luong auth cho Angular

Luong de xuat:

1. User login qua `/auth/login`
2. Frontend lay `data.accessToken`
3. Frontend luu token va set auth state
4. Moi request protected gan `Authorization: Bearer ...`
5. Neu gap `401`, interceptor goi `/auth/refresh` voi `withCredentials: true`
6. Neu refresh thanh cong, retry request cu
7. Neu refresh that bai, clear session va day user ve login

## 6.2 User APIs

Base path: `/user`

## 6.2.1 Dang ky user truc tiep

- Method: `POST`
- URL: `/user/register`
- Auth: public

Request body:

```json
{
  "username": "newuser",
  "password": "123456",
  "email": "newuser@example.com",
  "phonenumber": "0900000000"
}
```

Luu y:

- `roleId` la optional cho public register.
- Neu frontend khong gui `roleId`, backend tu gan role mac dinh `CUSTOMER`.
- Chi gui `roleId` khi co luong quan tri tao user voi role cu the va contract da duoc xac nhan.

Response:

```json
{
  "data": {
    "id": 10,
    "username": "newuser",
    "email": "newuser@example.com",
    "phoneNumber": "0900000000",
    "status": "ACTIVE",
    "roleIds": [2]
  }
}
```

TypeScript:

```ts
export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  phonenumber?: string | null;
  roleId?: number | null;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  phoneNumber?: string | null;
  status?: string | null;
  roleIds: number[];
}
```

### 6.2.2 Cap nhat user

- Method: `POST`
- URL: `/user/update`
- Auth: authenticated
- Permission: `USER_MANAGE` hoac `ROLE_MANAGE`

Request body:

```json
{
  "id": 10,
  "username": "updated-user",
  "password": "12345678",
  "email": "updated@example.com",
  "phonenumber": "0911111111",
  "roleIds": [1, 2]
}
```

Response la wrapped `UserResponse`.

### 6.2.3 Lay user theo id

- Method: `GET`
- URL: `/user/{id}`
- Auth: authenticated
- Permission: `USER_VIEW` hoac `PRODUCT_VIEW` hoac `USER_MANAGE`

Response la wrapped `UserResponse`.

### 6.2.4 Lay danh sach user

- Method: `GET`
- URL: `/user`
- Auth: authenticated
- Permission: `USER_VIEW` hoac `PRODUCT_VIEW` hoac `USER_MANAGE`

Response la wrapped list `UserResponse[]`.

## 6.3 Role APIs

Base path: `/role`

### 6.3.1 Tao role

- Method: `POST`
- URL: `/role`
- Auth: authenticated
- Permission: `ROLE_MANAGE` hoac `USER_MANAGE`

Request body:

```json
{
  "name": "MANAGER",
  "description": "Manager role",
  "permissions": [
    {
      "id": 1,
      "name": "USER_VIEW",
      "description": "View users"
    }
  ]
}
```

Luu y:

- controller nhan `permissions` trong `RoleRequest`
- response tra ve `RoleResponse` co danh sach permission

Response model:

```ts
export interface PermissionResponse {
  id: number;
  name: string;
  description?: string | null;
}

export interface RoleResponse {
  id: number;
  name: string;
  description?: string | null;
  permissions: PermissionResponse[];
}
```

### 6.3.2 Lay danh sach role

- Method: `GET`
- URL: `/role`
- Auth: authenticated
- Permission: `ROLE_VIEW` hoac `USER_MANAGE`

Response la wrapped `RoleResponse[]`.

### 6.3.3 Xoa role

- Method: `DELETE`
- URL: `/role/{pRoleId}`
- Auth: authenticated
- Permission: `ROLE_MANAGE` hoac `USER_MANAGE`

Response:

- raw string, vi du: `Deleted role has id: 5`

## 6.4 Brand APIs

Base path: `/brands`

Model:

```ts
export interface BrandDTO {
  id: number;
  name: string;
  description?: string | null;
  generic: boolean;
  slug: string;
}
```

### 6.4.1 Lay danh sach brand

- Method: `GET`
- URL: `/brands`
- Auth: authenticated
- Permission: `PRODUCT_VIEW`

Response la wrapped `BrandDTO[]`.

### 6.4.2 Lay brand theo id

- Method: `GET`
- URL: `/brands/{id}`
- Auth: authenticated
- Khong thay `@PreAuthorize` tai controller, nhung van can authenticated do security global

Response la wrapped `BrandDTO`.

### 6.4.3 Tao brand

- Method: `POST`
- URL: `/brands`
- Auth: authenticated
- Permission: `PRODUCT_VIEW`

Request body:

```json
{
  "name": "Apple",
  "description": "Premium electronics brand",
  "generic": false,
  "slug": "apple"
}
```

Response la wrapped `BrandDTO`.

### 6.4.4 Cap nhat brand

- Method: `PATCH`
- URL: `/brands/update/{id}`
- Auth: authenticated
- Permission: `PRODUCT_VIEW`

Request body:

```json
{
  "name": "Apple Inc.",
  "description": "Updated description",
  "generic": false
}
```

Response la wrapped `BrandDTO`.

### 6.4.5 Xoa brand

- Method: `DELETE`
- URL: `/brands/{id}`
- Auth: authenticated
- Khong thay `@PreAuthorize` tai controller, nhung van can authenticated

Response co the la empty body.

## 6.5 Category APIs

Base path: `/categories`

Model:

```ts
export interface CategoryDTO {
  id: number;
  name: string;
  slug?: string | null;
  description?: string | null;
  parentId?: number | null;
  childrenIds?: number[];
  attributes?: CategoryAttributeDTO[];
}
```

### 6.5.1 Lay danh sach category

- Method: `GET`
- URL: `/categories`
- Auth: authenticated

Response la wrapped `CategoryDTO[]`.

### 6.5.2 Lay category theo id

- Method: `GET`
- URL: `/categories/{id}`
- Auth: authenticated

Response la wrapped `CategoryDTO`.

### 6.5.3 Tao category

- Method: `POST`
- URL: `/categories`
- Auth: authenticated

Request body:

```json
{
  "name": "Laptop",
  "slug": "laptop",
  "description": "Laptop products",
  "parentId": null
}
```

Response la wrapped `CategoryDTO`.

### 6.5.4 Cap nhat category

- Method: `PATCH`
- URL: `/categories/{id}`
- Auth: authenticated

Request body cung dung `CategoryDTO`.

### 6.5.5 Xoa category

- Method: `DELETE`
- URL: `/categories/{id}`
- Auth: authenticated

Response co the empty.

## 6.6 Attribute Definition APIs

Base path: `/attributes`

Model:

```ts
export interface AttributeValueDTO {
  id: number;
  attributeId: number;
  value: string;
  label?: string | null;
  sortOrder?: number | null;
  active: boolean;
}

export interface AttributeDefDTO {
  id: number;
  code: string;
  name: string;
  valueType: string;
  variantAxis: boolean;
  specification: boolean;
  filterable: boolean;
  required: boolean;
  sortOrder?: number | null;
  status?: string | null;
  unit?: string | null;
  attributeValues: AttributeValueDTO[];
}
```

### 6.6.1 Lay danh sach attribute definitions

- Method: `GET`
- URL: `/attributes`
- Auth: authenticated

Response la wrapped `AttributeDefDTO[]`.

### 6.6.2 Lay attribute definition theo id

- Method: `GET`
- URL: `/attributes/{id}`
- Auth: authenticated

Response la wrapped `AttributeDefDTO`.

### 6.6.3 Tao attribute definition

- Method: `POST`
- URL: `/attributes`
- Auth: authenticated

Request body:

```json
{
  "code": "color",
  "name": "Color",
  "valueType": "TEXT",
  "variantAxis": true,
  "specification": true,
  "filterable": true,
  "required": true,
  "sortOrder": 1,
  "status": "ACTIVE",
  "unit": null
}
```

Response la wrapped `AttributeDefDTO`.

### 6.6.4 Cap nhat attribute definition

- Method: `PATCH`
- URL: `/attributes/{id}`
- Auth: authenticated

Request body cung dung `AttributeDefReq` nhu khi tao.

### 6.6.5 Xoa attribute definition

- Method: `DELETE`
- URL: `/attributes/{id}`
- Auth: authenticated

## 6.7 Attribute Option APIs

Base path: `/attribute-options`

### 6.7.1 Lay danh sach option

- Method: `GET`
- URL: `/attribute-options`
- Auth: authenticated

Response la wrapped `AttributeValueDTO[]`.

### 6.7.2 Lay option theo id

- Method: `GET`
- URL: `/attribute-options/{id}`
- Auth: authenticated

Response la wrapped `AttributeValueDTO`.

### 6.7.3 Tao option

- Method: `POST`
- URL: `/attribute-options`
- Auth: authenticated

Request body:

```json
{
  "attributeId": 1,
  "value": "RED",
  "label": "Red",
  "sortOrder": 1,
  "active": true
}
```

Response la wrapped `AttributeValueDTO`.

### 6.7.4 Cap nhat option

- Method: `PATCH`
- URL: `/attribute-options/{id}`
- Auth: authenticated

### 6.7.5 Xoa option

- Method: `DELETE`
- URL: `/attribute-options/{id}`
- Auth: authenticated

## 6.8 Category Attribute APIs

Base path: `/categories/{categoryId}/attributes`

Model:

```ts
export interface CategoryAttributeDTO {
  id: number;
  categoryId: number;
  attributeId: number;
  required: boolean;
  variantAxis: boolean;
  filterable: boolean;
  specification: boolean;
  sortOrder?: number | null;
}
```

### 6.8.1 Lay danh sach attribute cua category

- Method: `GET`
- URL: `/categories/{categoryId}/attributes`
- Auth: authenticated

Response la wrapped `CategoryAttributeDTO[]`.

### 6.8.2 Lay category attribute theo id

- Method: `GET`
- URL: `/categories/{categoryId}/attributes/{id}`
- Auth: authenticated

Response la wrapped `CategoryAttributeDTO`.

### 6.8.3 Tao category attribute

- Method: `POST`
- URL: `/categories/{categoryId}/attributes`
- Auth: authenticated

Request body:

```json
{
  "attributeId": 1,
  "required": true,
  "variantAxis": true,
  "filterable": true,
  "specification": true,
  "sortOrder": 1
}
```

Luu y:

- body co field `categoryId` trong DTO request, nhung path variable moi la nguon chinh
- frontend nen uu tien `categoryId` tren URL, co the bo qua field `categoryId` trong body

### 6.8.4 Cap nhat category attribute

- Method: `PATCH`
- URL: `/categories/{categoryId}/attributes/{id}`
- Auth: authenticated

### 6.8.5 Xoa category attribute

- Method: `DELETE`
- URL: `/categories/{categoryId}/attributes/{id}`
- Auth: authenticated

## 6.9 Product APIs

Base path: `/products`

Model:

```ts
export interface ProductImageDTO {
  id: number;
  url: string;
  thumbnail: boolean;
  productId: number;
}

export interface ProductVariantAttributeDTO {
  id?: number;
  variantId?: number;
  attributeId: number;
  optionId: number;
}

export interface ProductVariantDTO {
  sku: string;
  name?: string | null;
  barcode?: string | null;
  price: number;
  compareAtPrice?: number | null;
  stockQty: number;
  weight?: number | null;
  imageUrl?: string | null;
  status?: string | null;
  signature?: string | null;
  attributes: ProductVariantAttributeDTO[];
}

export interface ProductDTO {
  id?: number;
  name: string;
  description?: string | null;
  price: number;
  status?: string | null;
  sellerId?: number | null;
  categoryId: number;
  brandId: number;
  images?: ProductImageDTO[];
  variants?: ProductVariantDTO[];
}

export interface ProductResponse {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  status: string;
  sellerId?: number | null;
  categoryId: number;
  brandId: number;
  images: ProductImageDTO[];
}
```

### 6.9.1 Lay danh sach product

- Method: `GET`
- URL: `/products`
- Auth: authenticated

Query params ho tro:

- `categoryId?: number`
- `brandId?: number`
- `minPrice?: number`
- `maxPrice?: number`
- `status?: string`
- `keyword?: string`

Neu co bat ky filter nao o tren, backend se chay `searchProducts(...)`.

Response la wrapped `ProductDTO[]`.

Vi du:

`GET /products?categoryId=1&brandId=2&minPrice=100&maxPrice=500&status=ACTIVE&keyword=macbook`

### 6.9.2 Lay product theo id

- Method: `GET`
- URL: `/products/{id}`
- Auth: authenticated

Response la wrapped `ProductDTO`.

### 6.9.3 Tao product

- Method: `POST`
- URL: `/products`
- Auth: authenticated
- Content-Type: `multipart/form-data`

Request gom 2 phan:

- `product`: chuoi JSON cua `ProductDTO`
- `images`: danh sach file anh, optional

Frontend Angular can dung `FormData`.

Vi du payload:

Part `product`:

```json
{
  "name": "T-Shirt Premium",
  "description": "Cotton 100%",
  "price": 199000,
  "categoryId": 1,
  "brandId": 2,
  "variants": [
    {
      "sku": "TS-RED-M",
      "name": "Red / M",
      "price": 199000,
      "stockQty": 10,
      "signature": "color:red|size:m",
      "attributes": [
        {
          "attributeId": 11,
          "optionId": 101
        },
        {
          "attributeId": 12,
          "optionId": 201
        }
      ]
    }
  ]
}
```

Angular service goi API:

```ts
createProduct(product: ProductDTO, files: File[]) {
  const formData = new FormData();
  formData.append('product', JSON.stringify(product));

  for (const file of files) {
    formData.append('images', file);
  }

  return this.http.post<ApiEnvelope<ProductResponse>>(
    `${this.baseUrl}/products`,
    formData,
    { withCredentials: true }
  );
}
```

Validation quan trong phia backend khi tao product:

- `name` bat buoc
- `price > 0`
- `categoryId` bat buoc va phai ton tai
- `brandId` bat buoc va phai ton tai
- khong duoc gui `status` khi create, backend tu set `ACTIVE`
- moi variant:
  - `sku` bat buoc
  - `price >= 0`
  - `stockQty >= 0`
  - bat buoc co `attributes`
  - khong duoc trung `sku`
  - khong duoc trung `signature` neu co truyen
  - `attributeId` phai ton tai
  - `optionId` phai ton tai
  - option phai thuoc dung attribute
  - option phai active
  - attribute phai la `variantAxis = true`

Response la wrapped `ProductResponse`.

## 6.10 Import/Export APIs

Base path import: `/import`

Base path export: `/export`

Tat ca endpoint nhom nay hien tai deu nhan query params:

- `interfaceFileId`
- `fileName`

Va tra raw string thong bao ket qua.

### 6.10.1 Import APIs

- `POST /import/brand`
- `POST /import/category`
- `POST /import/product`
- `POST /import/attributes`
- `POST /import/category-attributes`

Vi du:

`POST /import/brand?interfaceFileId=123&fileName=brands.csv`

Response vi du:

- `Brand imported successfully`

### 6.10.2 Export APIs

- `POST /export/brand`
- `POST /export/category`
- `POST /export/product`
- `POST /export/attributes`
- `POST /export/category-attributes`
- `POST /export/category-attributes/import`

Luu y:

- ten endpoint `POST /export/category-attributes/import` co ve la endpoint import nam trong controller export; frontend co the bo qua neu khong can
- response dang la raw string, khong phai file download trong controller hien tai

## 6.11 Search API

Base URL: `http://localhost:8082`

### Tim brand

- Method: `GET`
- URL: `/search/brand`
- Params:
  - `keyword` bat buoc
  - `from` mac dinh `0`
  - `size` mac dinh `10`, toi da `100`

Vi du:

`GET http://localhost:8082/search/brand?keyword=apple&from=0&size=10`

Response:

- raw string tu Elasticsearch service

Khuyen nghi frontend:

```ts
searchBrand(keyword: string, from = 0, size = 10) {
  return this.http.get(`${this.searchBaseUrl}/search/brand`, {
    params: { keyword, from, size },
    responseType: 'text'
  });
}
```

## 6.12 Health API

- Method: `GET`
- URL: `/health-check`
- Auth: public

Body goc trong controller:

```json
{
  "status": "UP",
  "service": "coreservice",
  "timestamp": "2026-04-16T10:20:30+07:00"
}
```

Nhung do app chinh co response wrapper, frontend nen ky vong response thuc te:

```json
{
  "data": {
    "status": "UP",
    "service": "coreservice",
    "timestamp": "2026-04-16T10:20:30+07:00"
  }
}
```

## 7. Mapping model TypeScript de xuat

## 7.1 API shared models

```ts
export interface ApiEnvelope<T> {
  data: T;
  timestamp?: string;
  page?: {
    _totalElements: number;
    _currentPage: number;
    _pageSize: number;
    _totalPages: number;
  };
}

export interface ApiErrorResponse {
  error: string | Record<string, string>;
  status: string;
}
```

## 7.2 Auth state model

```ts
export interface AuthSession {
  accessToken: string | null;
  currentUser: UserResponse | null;
  isAuthenticated: boolean;
}
```

## 7.3 Permission utility model

```ts
export type PermissionCode =
  | 'USER_MANAGE'
  | 'USER_VIEW'
  | 'ROLE_MANAGE'
  | 'ROLE_VIEW'
  | 'PRODUCT_VIEW'
  | string;
```

## 8. De xuat to chuc service layer cho Angular

Nen tach theo domain:

- `auth-api.service.ts`
- `user-api.service.ts`
- `role-api.service.ts`
- `brand-api.service.ts`
- `category-api.service.ts`
- `attribute-api.service.ts`
- `product-api.service.ts`
- `import-export-api.service.ts`
- `search-api.service.ts`

Nen co them cac lop dung chung:

- `auth.interceptor.ts`
- `refresh-token.interceptor.ts`
- `api-error.mapper.ts`
- `response-unwrapper.ts`

## 9. Cac bat nhat backend ma frontend can biet truoc

Day la nhung diem rat quan trong khi implement Angular:

### 9.1 Main API co wrapper, nhung mot so endpoint tra raw string

Frontend khong duoc gia dinh response nao cung co `data`.

Raw string xuat hien o:

- `/auth/logout`
- `/auth/sendotp`
- `/auth/sendotpregister`
- `/auth/verifyotp` thanh cong
- `/role/{id}` DELETE
- nhom `/import/*`
- nhom `/export/*`

### 9.2 Search API tra ve `String`

Khong phai object typed on dinh. Frontend nen xu ly rieng.

### 9.3 Product image URL hien tai la duong dan filesystem

`FileService.upload()` dang tra ve `filePath.toString()`, tuc la duong dan local tren may chu, vi du:

- `C:\Users\...\uploads\uuid-file.png`
- hoac `D:\Spring\...\uploads\uuid-file.png`

Dieu nay co nghia:

- frontend co the nhan `images[].url`
- nhung URL nay khong phai HTTP public URL de hien thi truc tiep trong browser
- neu team frontend can render anh san pham, backend se can bo sung file-serving endpoint hoac static resource mapping

Tam thoi frontend nen:

- coi `images[].url` la du lieu metadata
- khong ky vong `img src` hoat dong ngay voi field nay

### 9.4 Permission annotation chua dong deu giua cac endpoint

Vi du:

- `GET /brands/{id}` va `DELETE /brands/{id}` khong co `@PreAuthorize` tai controller, nhung van can authenticated
- nhieu endpoint commerce khong ghi ro permission chi tiet o method level

Frontend nen:

- xu ly UI permission o muc de xuat/kinh nghiem nguoi dung
- nhung van phai chap nhan backend moi la nguon su that cuoi cung

### 9.5 Route update brand khong dong nhat REST style

Brand update dung:

- `PATCH /brands/update/{id}`

Trong khi category/attribute dung:

- `PATCH /categories/{id}`
- `PATCH /attributes/{id}`

Frontend nen map dung tung endpoint, khong generic hoa qua som.

## 10. De xuat implementation Angular

## 10.1 Environment config

```ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8081',
  searchApiBaseUrl: 'http://localhost:8082'
};
```

## 10.2 Http interceptor de xuat

Nen co 3 interceptor:

1. `AuthTokenInterceptor`
2. `ApiEnvelopeInterceptor` hoac helper unwrap
3. `AuthRefreshInterceptor`

## 10.3 Chien luoc luu token

Co 2 lua chon thuc te:

1. Luu access token trong memory state de an toan hon
2. Luu access token trong `sessionStorage` de giu session sau reload

Neu uu tien bao mat, nen:

- luu refresh token trong cookie do backend quan ly
- access token luu memory
- khi reload app, co the goi `/auth/refresh` de khoi phuc session

## 10.4 Guard de xuat

- `authGuard`: kiem tra da dang nhap chua
- `permissionGuard`: kiem tra user co permission can thiet khong
- `guestGuard`: chan vao trang login neu da dang nhap

## 11. Quy trinh build frontend theo domain

Thu tu implement nen uu tien:

1. Auth
2. User/Role
3. Brand
4. Category
5. Attribute/Attribute Option/Category Attribute
6. Product
7. Import/Export
8. Search

Ly do:

- can auth truoc de goi duoc hầu het endpoint protected
- can brand/category/attribute truoc product create

## 12. Checklist tich hop cho team Angular

- Tao environment cho `8081` va `8082`
- Cau hinh `withCredentials: true` cho main API
- Viet auth interceptor gan bearer token
- Viet refresh interceptor cho `401`
- Viet shared `ApiEnvelope<T>`
- Viet shared `ApiErrorResponse`
- Xu ly rieng cac endpoint raw string
- Xu ly rieng `searchservice` voi `responseType: 'text'`
- Khong gia dinh `images[].url` la public URL
- Tao typed services cho tung domain
- Tao permission guard theo string permission

## 13. Ket luan

Backend hien tai du de team Angular xay dung admin frontend va mot phan user flow voi cac domain sau:

- auth
- user
- role
- brand
- category
- attribute
- product
- import/export
- search

Tuy nhien, co 3 diem frontend can luu y dac biet:

1. response format khong hoan toan dong nhat giua JSON wrapper va raw string
2. search service tra ve chuoi raw, can xu ly rieng
3. image URL hien tai la filesystem path, chua phai HTTP asset URL

Neu can, buoc tiep theo co the viet them 1 tai lieu chuyen biet rieng cho Angular gom:

- danh sach interface TypeScript day du
- skeleton service methods
- interceptor refresh token hoan chinh
- route map cho tung feature module
