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
- JWT access token mang san `roles` va `permissions` claims de backend authorize request truc tiep tu token
- JWT access token va refresh token deu mang `authVersion`; backend dung Redis de check token freshness va user lock state trong luc xu ly request
- refresh token tra trong response body va dong thoi set vao `HttpOnly cookie`
- backend dang cho phep CORS origin mac dinh: `http://localhost:4200`
- `allowCredentials = true`

Frontend can xem `refresh token cookie` la nguon refresh chinh. Khong nen doc hay phu thuoc vao `refreshToken` trong body de quan ly session.

Backend khong con reload user tu DB cho moi request chi de check permission. Sau login hoac refresh, frontend tiep tuc gui `Authorization: Bearer <accessToken>` nhu cu; backend se verify chu ky JWT va dung permissions trong claims de xu ly `@PreAuthorize`.

Logout hien revoke ca refresh token persisted va access token `jti` trong Redis blacklist. Neu tai khoan bi khoa hoac quyen thay doi lam tang `authVersion`, access token hien tai co the bi tu choi truoc khi het han.

## 4.2 Cookie refresh token

Cookie refresh token duoc tao voi cac thuoc tinh:

- ten cookie: gia tri tu constant `ITag.REFRESH_TOKEN`
- `HttpOnly = true`
- `path = /`
- `sameSite = Strict` theo default config
- `secure = true` theo default config neu khong override

Luu y quan trong cho frontend:

- neu backend chay local qua HTTP va `secure=true`, refresh cookie co the khong hoat dong nhu mong doi tren moi truong local
- profile `application-local.yaml` hien da override `security.cookies.secure=false` de login va refresh flow hoat dong tren `http://localhost`
- profile `application-local.yaml` hien cung override `spring.mail` ve `localhost:1025` de OTP/verification email di vao `Mailpit` local thay vi Mailtrap hay email that
- de test OTP local, chay `docker compose -f basecommerce/src/main/resources/docker-mailpit/docker-compose.yml up -d` va mo `http://localhost:8025`
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
  username?: string | null;
  password?: string | null;
  googleToken?: string | null;
}
```

Notes:

- Dang nhap username/password: gui `username` va `password`.
- Dang nhap Google: gui `googleToken`, backend se verify token voi Google va neu email chua ton tai thi tao tai khoan `CUSTOMER` moi roi tra ve access/refresh token.

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

### 6.1.4 Current logged-in user

- Method: `GET`
- URL: `/auth/me`
- Auth: bat buoc authenticated
- Header: `Authorization: Bearer <accessToken>`

Response:

```json
{
  "success": true,
  "message": "Current user loaded",
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "fullName": "admin",
    "roles": [
      {
        "id": 1,
        "name": "ADMIN",
        "description": "Administrator role",
        "permissions": [
          {
            "id": 1,
            "name": "USER_VIEW",
            "description": "View users"
          }
        ]
      }
    ],
    "authorities": ["USER_VIEW"],
    "permissions": ["USER_VIEW"]
  },
  "timestamp": "2026-04-16T10:20:30"
}
```

Luu y:

- endpoint nay la contract chuan cho current user sau login va sau refresh
- frontend nen dung endpoint nay thay vi suy doan current user tu `GET /user`
- `permissions` va `authorities` deu tra tap permission da flatten san

### 6.1.5 Gui OTP chung

- Method: `POST`
- URL: `/auth/sendotp`
- Auth: public

Request body:

```json
{
  "purpose": "LOGIN",
  "email": "user@example.com"
}
```

Vi du:

`POST /auth/sendotp`

Response:

```json
{
  "data": {
    "email": "user@example.com",
    "purpose": "LOGIN",
    "ttlSeconds": 300,
    "resendAfterSeconds": 60,
    "maskedDestination": "u***@example.com"
  }
}
```

Luu y:

- `purpose=LOGIN` gui OTP dang nhap theo email
- `purpose=FORGOT_PASSWORD` giu nguyen flow quen mat khau hien tai

### 6.1.6 Gui OTP dang ky

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

```json
{
  "data": {
    "email": "user@example.com",
    "purpose": "REGISTER",
    "ttlSeconds": 300,
    "resendAfterSeconds": 60,
    "maskedDestination": "u***@example.com"
  }
}
```

Luu y:

- backend luu tam thong tin dang ky trong Redis theo flow OTP
- phia frontend nen xem day la buoc 1 trong quy trinh dang ky
- verify OTP thanh cong cho `purpose=REGISTER` se tao user that su tu temp register payload va activate account trong cung request

### 6.1.7 Xac thuc OTP

- Method: `POST`
- URL: `/auth/verifyotp`
- Auth: public

Request body:

```json
{
  "purpose": "REGISTER",
  "email": "user@example.com",
  "otp": "123456"
}
```

Vi du:

`POST /auth/verifyotp`

Response thanh cong:

```json
{
  "data": {
    "verified": true,
    "purpose": "LOGIN",
    "nextAction": "LOGIN_SUCCESS",
    "accessToken": "<jwt-access-token>",
    "refreshToken": "<opaque-or-jwt-refresh-token>"
  }
}
```

Luu y:

- voi `purpose=LOGIN`, backend dong thoi set refresh-token cookie nhu login thuong
- frontend phai xu ly nhu login thuong: luu `accessToken`, goi `/auth/me`, roi moi dieu huong vao app

Response that bai:

```json
{
  "error": "Invalid OTP.",
  "status": "401 UNAUTHORIZED",
  "code": "OTP_INVALID",
  "remainingAttempts": 2
}
```

Response block tam thoi:

```json
{
  "error": "Too many invalid OTP attempts. Please try again later.",
  "status": "429 TOO_MANY_REQUESTS",
  "code": "OTP_VERIFY_BLOCKED",
  "retryAfterSeconds": 900
}
```

### 6.1.8 Luu y luong auth cho Angular

Luong de xuat:

1. User login qua `/auth/login`
2. Frontend lay `data.accessToken`
3. Frontend goi `/auth/me` de lay current user, roles, permissions
4. Frontend luu token va current user vao auth state
5. Moi request protected gan `Authorization: Bearer ...`
6. Neu gap `401`, interceptor goi `/auth/refresh` voi `withCredentials: true`
7. Neu refresh thanh cong, frontend nen goi lai `/auth/me` truoc khi retry request cu
8. Neu refresh that bai, clear session va day user ve login
9. Google login/register khong co endpoint rieng: frontend lay Google credential o client, gui `googleToken` vao `/auth/login`, backend tu xu ly login hoac auto-provision account `CUSTOMER`

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

Notes:

- `roleId` is optional for public self-registration.
- When `roleId` is omitted, backend resolves the default `CUSTOMER` role.
- Frontend should not assume a role catalog lookup is required for the public register page.

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
  roles?: RoleResponse[];
}
```

### 6.2.2 Tao user admin

- Method: `POST`
- URL: `/user`
- Auth: authenticated
- Permission: `USER_UPDATE`

Request body:

```json
{
  "username": "staff-user",
  "password": "12345678",
  "email": "staff@example.com",
  "phonenumber": "0901234567",
  "status": "A",
  "roleIds": [1, 2]
}
```

Notes:

- `roleIds` supports multiple roles for admin CRUD flow.
- If `roleIds` is omitted or empty, backend falls back to default role `CUSTOMER`.

Response la wrapped `UserResponse`.

### 6.2.3 Cap nhat user

- Method: `POST`
- URL: `/user/update`
- Auth: authenticated
- Permission: `USER_UPDATE`

Request body:

```json
{
  "id": 10,
  "username": "updated-user",
  "password": "12345678",
  "email": "updated@example.com",
  "phonenumber": "0911111111",
  "status": "I",
  "roleIds": [1, 2]
}
```

Response la wrapped `UserResponse`.

### 6.2.4 Lay user theo id

- Method: `GET`
- URL: `/user/{id}`
- Auth: authenticated
- Permission: `USER_VIEW`

Response la wrapped `UserResponse`.

### 6.2.5 Lay danh sach user

- Method: `GET`
- URL: `/user`
- Auth: authenticated
- Permission: `USER_VIEW`

Response la wrapped list `UserResponse[]`.

Notes:

- `UserResponse.roles` hien tra them role summary va permission summary de frontend admin page co the render role names ma khong can tu map thu cong tu `roleIds`.

### 6.2.6 Xoa user

- Method: `DELETE`
- URL: `/user/{id}`
- Auth: authenticated
- Permission: `USER_UPDATE`

Response:

- raw string, vi du: `Deleted user has id: 10`

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
- Permission: `ROLE_VIEW`

Response la wrapped `RoleResponse[]`.

### 6.3.3 Lay role theo id

- Method: `GET`
- URL: `/role/{roleId}`
- Auth: authenticated
- Permission: `ROLE_VIEW`

Response la wrapped `RoleResponse`.

### 6.3.4 Cap nhat role

- Method: `PATCH`
- URL: `/role/{roleId}`
- Auth: authenticated
- Permission: `ROLE_MANAGE`

Request body giong `POST /role`.

Response la wrapped `RoleResponse`.

### 6.3.5 Xoa role

- Method: `DELETE`
- URL: `/role/{pRoleId}`
- Auth: authenticated
- Permission: `ROLE_MANAGE`

Response:

- raw string, vi du: `Deleted role has id: 5`

### 6.3.6 Lay permission catalog cho role form

- Method: `GET`
- URL: `/permissions`
- Auth: authenticated
- Permission: `ROLE_VIEW` hoac `ROLE_MANAGE`

Response la wrapped `PermissionResponse[]`.

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
  imageUrl?: string | null;
  image?: {
    id: number;
    url: string;
    thumbnail: boolean;
  } | null;
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

### 6.4.6 Upload hoac thay brand image

- Method: `POST`
- URL: `/brands/{id}/image`
- Auth: authenticated
- Permission: `BRAND_MANAGE`
- Content-Type: `multipart/form-data`

Request:

- Part `image`: `MultipartFile` bat buoc

Response la wrapped `BrandDTO`.

Ghi chu:

- API nay replace anh dai dien hien tai cua brand.
- Frontend co the doc nhanh URL qua `data.imageUrl`, va metadata day du qua `data.image`.
- Backend khong tra filesystem path nua. URL anh duoc expose qua static resource public o dang `/assets/uploads/{filename}` de browser co the tai truc tiep trong moi truong app chay binh thuong.
- UI nen chi mo upload image sau khi brand da ton tai va da co `id`, khong can flow upload tam.

### 6.4.7 Xoa brand image

- Method: `DELETE`
- URL: `/brands/{id}/image`
- Auth: authenticated
- Permission: `BRAND_MANAGE`

Response la wrapped `BrandDTO` voi `data.imageUrl = null`, `data.image = null`.

### 6.4.8 Lay brand gallery images

- Method: `GET`
- URL: `/brands/{id}/images`
- Auth: authenticated
- Permission: `BRAND_VIEW`

Response la wrapped `ImageDTO[]`.

### 6.4.9 Them images vao brand gallery

- Method: `POST`
- URL: `/brands/{id}/images`
- Auth: authenticated
- Permission: `BRAND_MANAGE`
- Content-Type: `multipart/form-data`

Request:

- Part `images`: `MultipartFile[]` bat buoc, co the gui nhieu file

Response la wrapped `BrandDTO`.

Ghi chu:

- Brand image workflow da duoc canh chinh theo huong giong `product` va `category`: chi quan ly image sau khi brand da ton tai.
- `data.galleryImages` la source chinh cho admin UI; `data.imageUrl` va `data.image` duoc giu nhu projection cua thumbnail hien tai de giam rui ro vo contract cu.

### 6.4.10 Dat thumbnail cho brand image

- Method: `PATCH`
- URL: `/brands/{id}/images/{imageId}/thumbnail`
- Auth: authenticated
- Permission: `BRAND_MANAGE`

Response la wrapped `BrandDTO` voi `data.imageUrl` tro den thumbnail moi.

### 6.4.11 Xoa brand image khoi gallery

- Method: `DELETE`
- URL: `/brands/{id}/images/{imageId}`
- Auth: authenticated
- Permission: `BRAND_MANAGE`

Response la wrapped `BrandDTO`.

Ghi chu:

- Neu xoa thumbnail, backend tu chon image con lai dau tien lam thumbnail moi neu gallery van con anh.
- Neu gallery rong, `data.imageUrl` va `data.image` se ve `null`.

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
  imageUrl?: string | null;
  galleryImages?: {
    id: number;
    url: string;
    thumbnail: boolean;
  }[];
}
```

### 6.5.1 Lay danh sach category

- Method: `GET`
- URL: `/categories`
- Auth: authenticated

Query params ho tro:

- `keyword`
- `status`
- `parentId`
- `visible`
- `assignable`
- `page`
- `size`
- `sortBy`
- `sortDir`

Response runtime la wrapped page envelope `{ data, timestamp, page }`, trong do `data` la `CategoryDTO[]` va `page` chua metadata `_totalElements`, `_currentPage`, `_pageSize`, `_totalPages`.

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

### 6.5.6 Lay gallery images cua category

- Method: `GET`
- URL: `/categories/{id}/images`
- Auth: authenticated
- Permission: `CATEGORY_VIEW`

Response la wrapped `ImageDTO[]`:

```ts
export interface ImageDTO {
  id: number;
  url: string;
  thumbnail: boolean;
}
```

### 6.5.7 Them images vao category gallery

- Method: `POST`
- URL: `/categories/{id}/images`
- Auth: authenticated
- Permission: `CATEGORY_MANAGE`
- Content-Type: `multipart/form-data`

Request:

- Part `images`: `MultipartFile[]` bat buoc, co the gui nhieu file

Response la wrapped `CategoryDTO`.

Ghi chu:

- Image dau tien se thanh thumbnail neu category chua co thumbnail.
- Backend dong bo `data.imageUrl` theo thumbnail hien tai de giu on dinh contract cu.
- URL gallery image va thumbnail deu duoc tra duoi dang public path `/assets/uploads/{filename}`, khong phu thuoc vao duong dan file system noi bo.
- UI nen quan ly category image sau khi category da duoc tao thanh cong, giong flow image cua product.

### 6.5.8 Dat thumbnail cho category image

- Method: `PATCH`
- URL: `/categories/{id}/images/{imageId}/thumbnail`
- Auth: authenticated
- Permission: `CATEGORY_MANAGE`

Response la wrapped `CategoryDTO` voi `data.imageUrl` tro den URL cua thumbnail moi.

### 6.5.9 Xoa category image khoi gallery

- Method: `DELETE`
- URL: `/categories/{id}/images/{imageId}`
- Auth: authenticated
- Permission: `CATEGORY_MANAGE`

Response la wrapped `CategoryDTO`.

Ghi chu:

- Neu xoa thumbnail, backend se tu chon image con lai dau tien lam thumbnail moi neu gallery van con anh.
- Neu gallery rong, `data.imageUrl` se ve `null`.

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

Response la wrapped `AdminProductListItemResponse[]`.

Moi item list hien tai bao gom ca:

- `thumbnailUrl`: URL thumbnail chinh de giu contract list gon cho cac consumer chi can 1 anh dai dien
- `images`: `ProductImageDTO[]` da duoc sort voi thumbnail truoc, de frontend admin co the hien thi nhieu anh cua cung mot product ngay trong danh sach ma khong can goi them detail API

Vi du:

`GET /products?categoryId=1&brandId=2&minPrice=100&maxPrice=500&status=ACTIVE&keyword=macbook`

### 6.9.2 Lay product theo id

- Method: `GET`
- URL: `/products/{id}`
- Auth: authenticated

Response la wrapped `AdminProductDetailResponse`.

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

### 6.9.4 Cap nhat product

- Method: `PATCH`
- URL: `/products/{id}`
- Auth: authenticated
- Content-Type: `application/json`

Request body dung cung shape `AdminProductUpsertRequest` nhu create, bao gom day du thong tin product va toan bo danh sach variants can giu sau khi cap nhat.

Luu y:

- Update hien tai la JSON-only, khong nhan multipart images trong cung request nay.
- Neu frontend thay doi category, variants gui len phai phu hop voi schema `variantAxis` cua category moi.
- Backend validate duplicate `sku`, duplicate `signature`, duplicate `attributeId` trong tung variant, va quan he `attributeId -> optionId` nhu create.

Response la wrapped `AdminProductDetailResponse`.

### 6.9.5 Lay gallery images cua product

- Method: `GET`
- URL: `/products/{id}/images`
- Auth: authenticated

Response la wrapped `ProductImageDTO[]`.

### 6.9.6 Them images vao product gallery

- Method: `POST`
- URL: `/products/{id}/images`
- Auth: authenticated
- Content-Type: `multipart/form-data`

Request:

- Part `images`: `MultipartFile[]` bat buoc, co the gui nhieu file

Behavior:

- Neu product chua co thumbnail, image dau tien moi upload se duoc dat lam thumbnail.
- Neu product da co thumbnail, backend giu nguyen thumbnail cu va append them images moi vao gallery.

Response la wrapped `AdminProductDetailResponse` voi `data.images` da cap nhat.

### 6.9.7 Dat thumbnail cho product image

- Method: `PATCH`
- URL: `/products/{id}/images/{imageId}/thumbnail`
- Auth: authenticated

Response la wrapped `AdminProductDetailResponse` voi `data.images` phan anh thumbnail moi.

### 6.9.8 Xoa product image khoi gallery

- Method: `DELETE`
- URL: `/products/{id}/images/{imageId}`
- Auth: authenticated

Behavior:

- Neu xoa thumbnail, backend se tu chon image con lai dau tien lam thumbnail moi neu gallery van con anh.
- Neu gallery rong sau khi xoa, `data.images` se ve mang rong.

Response la wrapped `AdminProductDetailResponse`.

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

## 6.13 Client commerce APIs

Nhom nay la API cho khu vuc client/customer tren frontend.

### 6.13.1 Cart APIs

Base path: `/carts`

Contract hien tai:

- `GET /carts/me`
- `PUT /carts/me/items`
- `DELETE /carts/me/items/{variantId}`
- `POST /carts/me/voucher/apply`
- `DELETE /carts/me/voucher`
- `GET /carts/me/pricing-preview`
- `PATCH /carts/me/checkout`

Auth va audience:

- Auth: authenticated
- Backend controller hien da duoc gan ro `@PreAuthorize("isAuthenticated()")` o class level de nhom cart duoc coi la nhom client-authenticated ro rang hon.
- Frontend hien tach nhom route UI client thanh `/client/**` va gate theo role `CUSTOMER`.

Response:

- JSON APIs trong nhom nay van theo runtime wrapper `{ data }` khi qua `ResponseHandler`.

### 6.13.2 My Orders APIs

Base path: `/orders/me`

Contract hien tai:

- `GET /orders/me`
- `GET /orders/me/{id}`
- `PATCH /orders/me/{id}/cancel`

Auth va audience:

- Auth: authenticated
- Backend method hien da gan ro `@PreAuthorize("isAuthenticated()")` cho nhom `/orders/me` de tach ro hon voi nhom admin order.
- Frontend map nhom nay vao `/client/orders/me` va `/client/orders/me/:id`.

### 6.13.3 Admin order APIs

Base path: `/orders`

Contract hien tai:

- `GET /orders` -> permission `ORDER_VIEW`
- `GET /orders/{id}` -> permission `ORDER_VIEW`
- `PATCH /orders/{id}/admin-status` -> permission `ORDER_UPDATE` hoac `ORDER_MANAGE`

Luu y tach scope:

- URL backend hien chua doi prefix thanh `/admin/orders`; viec tach admin/client hien dang duoc the hien chu yeu qua method-level auth o backend va route namespace `/admin/**`, `/client/**` o frontend.
- `POST /orders` hien van la customer create-order flow, khong phai admin create flow.

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
- `/auth/forgot-password/confirm`
- `/role/{id}` DELETE
- nhom `/import/*`
- nhom `/export/*`

Auth OTP endpoints `/auth/sendotp`, `/auth/sendotpregister`, `/auth/verifyotp`, va `/auth/forgot-password/request` hien tra object JSON va runtime thuong di qua response envelope `{ data }`.

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
