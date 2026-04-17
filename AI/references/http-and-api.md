# HTTP And API Reference

## Tam diem HTTP hien tai

- `BaseApiService`: abstraction cho API calls.
- `ApiUrlBuilderService`: xay dung URL API.
- `http-options.factory.ts`: noi tap trung cac options cho request.

## Interceptor chain

Nguon: `src/app/app.config.ts`

Thu tu hien tai:

1. `loadingInterceptor`
2. `credentialsInterceptor`
3. `authTokenInterceptor`
4. `refreshTokenInterceptor`
5. `errorMappingInterceptor`

## Vi sao thu tu nay quan trong

- Loading can bat dau som.
- Credentials can duoc gan truoc khi request gui di.
- Auth token can co truoc khi xu ly 401.
- Refresh token can bao quanh request auth thong thuong.
- Error mapping nen xu ly sau cung de map loi sau cac thu nghiem refresh.

## Endpoint constants hien tai

Nguon: `src/app/core/constants/api-endpoints.ts`

### Auth

- `/auth/login`
- `/auth/refresh`
- `/auth/logout`
- `/auth/sendotp`
- `/auth/sendotpregister`
- `/auth/verifyotp`

### Health

- `/health-check`

### User

- `/user`
- `/user/register`
- `/user/update`
- `/user/:id`

### Role

- `/role`
- `/role/:id`

### Brand

- `/brands`

### Category

- `/categories`

### Product

- `/products`
- `/products/:id`

### Attribute

- `/attributes`
- `/categories/:categoryId/attributes`

### Search

- `/search/brand`

## Nguyen tac mo rong API

- Them endpoint moi vao `API_ENDPOINTS` truoc khi goi trong service.
- Uu tien nhom endpoint theo domain nghiep vu.
- Neu endpoint co tham so, dung factory function nhu codebase dang co.

## Backend Response Wrapper Luu y

Tham chieu backend:
- `ecommerce-shop/coreservice/src/main/java/com/ttl/core/handler/ResponseHandler.java`

AI frontend khong duoc mac dinh tat ca API tra object/raw array truc tiep. Runtime hien tai co global `ResponseBodyAdvice` wrap response khi di qua Jackson:

- Neu controller tra `Collection<?>` hoac `Page<?>`:
  - Shape thuong gap: `{ data, timestamp, page }`
  - `data` la list item that su frontend can dung.
  - `page` co cac field `_totalElements`, `_currentPage`, `_pageSize`, `_totalPages`.
- Neu controller tra object JSON thong thuong:
  - Shape thuong gap: `{ data }`
  - Khong nen mac dinh field business nam o root response.
- Khong bi wrap:
  - `String`
  - `byte[]`
  - `Resource`
  - `ErrorMessage`

He qua cho frontend:

- Khi doc list/detail tu backend Spring chay chung `ResponseHandler`, uu tien map/unwrap `response.data` truoc khi bind UI.
- Import/export text response phai de `responseType: 'text'`, khong unwrap envelope.
- Neu thay response runtime lech voi code controller, can kiem tra `ResponseHandler` truoc khi ket luan backend sai contract.
