# BaseCommerce Backend API Implementation Plan For Angular Frontend

## 1. Muc tieu

Tai lieu nay tap trung rieng cho module `basecommerce` de frontend Angular co the trien khai dung thu tu nghiep vu, dung API contract hien tai, va tranh sai lech khi map du lieu.

Scope tai lieu:
- Liet ke API thuoc `basecommerce`.
- Tom tat nghiep vu va dependency giua cac domain.
- Dua ra ke hoach implement frontend theo thu tu it rui ro nhat.
- Chi ra cac edge case contract can xu ly som.

Khong bao gom API auth/user/role cua `coreservice` ngoai cac ghi chu auth dependency.

## 2. Pham vi va dependency runtime

- Runtime chinh frontend goi vao: `http://localhost:8081`.
- Security global: endpoint khong nam trong whitelist cua `SecurityConfig` yeu cau authenticated.
- Do module `basecommerce` chay chung app scan package `com.ttl`, frontend phai di theo auth flow hien tai (`/auth/login` -> bearer token + withCredentials refresh cookie).

Security tham chieu:
- `ecommerce-shop/coreservice/src/main/java/com/ttl/core/config/SecurityConfig.java:52`

## 3. Tong quan nghiep vu basecommerce

Crux nghiep vu: Product phu thuoc manh vao catalog schema dong (`AttributeDef -> AttributeValue -> CategoryAttribute`). Neu frontend bo qua thu tu nay thi create product se fail do validate quan he option/attribute/category.

### 3.1 Domain va quan he

1. Brand
- Nhom danh muc thuong hieu cho product.
- Delete bi chan neu brand dang duoc product su dung.

2. Category
- Danh muc co parent-child.
- Delete bi chan neu category con child hoac dang duoc product su dung.

3. AttributeDef
- Dinh nghia thuoc tinh tong quat (color, size, weight...).
- Kiem soat valueType va cac co `variantAxis/specification/filterable/required`.

4. AttributeValue (attribute-options)
- Option thuoc ve AttributeDef (vi du color=RED).
- Chi hop le cho attribute co valueType option-based (`select|multi_select`).

5. CategoryAttribute
- Gan AttributeDef vao 1 Category.
- Dinh nghia attribute nao la required/variantAxis/specification trong scope category.

6. Product
- Tao product gom thong tin co ban + variants + images.
- Validate cheo giua category, brand, attribute, option, variant.

7. Import/Export
- Trigger import/export qua query `interfaceFileId` + `fileName`.
- Response dang raw string thong bao.

## 4. Endpoint inventory (basecommerce)

## 4.1 Brand APIs

Controller tham chieu:
- `ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/BrandController.java`

- `POST /brands`
  - Req: `BrandCreateRequest`
  - Res: `BrandDTO`
  - Auth: authenticated
  - Method-level permission: `PRODUCT_VIEW`

- `GET /brands`
  - Req: none
  - Res: `List<BrandDTO>`
  - Auth: authenticated
  - Method-level permission: `PRODUCT_VIEW`

- `PATCH /brands/update/{id}`
  - Req: `BrandUpdateRequest`
  - Res: `BrandDTO`
  - Auth: authenticated
  - Method-level permission: `PRODUCT_VIEW`

- `GET /brands/{id}`
  - Req: path `id`
  - Res: `BrandDTO`
  - Auth: authenticated by global security

- `DELETE /brands/{id}`
  - Req: path `id`
  - Res: empty/void
  - Auth: authenticated by global security

## 4.2 Category APIs

Controller tham chieu:
- `ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/CategoryController.java`

- `GET /categories` -> paged `CategoryDTO[]` runtime envelope `{ data, page }`
- `POST /categories` -> `CategoryDTO`
- `PATCH /categories/{id}` -> `CategoryDTO`
- `DELETE /categories/{id}` -> empty/void
- `GET /categories/{id}` -> `CategoryDTO`

Auth: authenticated by global security.

## 4.3 Attribute Definition APIs

Controller tham chieu:
- `ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/AttributeDefController.java`

- `POST /attributes` -> `AttributeDefDTO`
- `GET /attributes` -> `List<AttributeDefDTO>`
- `GET /attributes/{id}` -> `AttributeDefDTO`
- `PATCH /attributes/{id}` -> `AttributeDefDTO`
- `DELETE /attributes/{id}` -> empty/void

Auth: authenticated by global security.

## 4.4 Attribute Option APIs

Controller tham chieu:
- `ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/AttributeValueController.java`

- `POST /attribute-options` -> `AttributeValueDTO`
- `GET /attribute-options` -> `List<AttributeValueDTO>`
- `GET /attribute-options/{id}` -> `AttributeValueDTO`
- `PATCH /attribute-options/{id}` -> `AttributeValueDTO`
- `DELETE /attribute-options/{id}` -> empty/void

Auth: authenticated by global security.

## 4.5 Category Attribute APIs

Controller tham chieu:
- `ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/CategoryAttributeController.java`

- `POST /categories/{categoryId}/attributes` -> `CategoryAttributeDTO`
- `GET /categories/{categoryId}/attributes` -> `List<CategoryAttributeDTO>`
- `GET /categories/{categoryId}/attributes/{id}` -> `CategoryAttributeDTO`
- `PATCH /categories/{categoryId}/attributes/{id}` -> `CategoryAttributeDTO`
- `DELETE /categories/{categoryId}/attributes/{id}` -> empty/void

Auth: authenticated by global security.

## 4.6 Product APIs

Controller tham chieu:
- `ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/ProductController.java:24`

- `GET /products`
  - Query optional: `categoryId`, `brandId`, `minPrice`, `maxPrice`, `status`, `keyword`
  - Res: `List<ProductDTO>`
  - Auth: authenticated by global security

- `GET /products/{id}`
  - Res: `ProductDTO`
  - Auth: authenticated by global security

- `POST /products` (multipart/form-data)
  - Part `product`: JSON string map sang `ProductDTO`
  - Part `images`: `List<MultipartFile>` optional
  - Res: `ProductResponse`
  - Auth: authenticated by global security

- `PATCH /products/{id}`
  - Req: `AdminProductUpsertRequest` dang JSON-only
  - Res: `AdminProductDetailResponse`
  - Auth: authenticated by global security

- `GET /products/{id}/images`
  - Res: `List<ProductImageDTO>`
  - Auth: authenticated by global security

- `POST /products/{id}/images`
  - Req: multipart `images[]`
  - Res: `AdminProductDetailResponse`
  - Auth: authenticated by global security

- `PATCH /products/{id}/images/{imageId}/thumbnail`
  - Res: `AdminProductDetailResponse`
  - Auth: authenticated by global security

- `DELETE /products/{id}/images/{imageId}`
  - Res: `AdminProductDetailResponse`
  - Auth: authenticated by global security

## 4.7 Import APIs

Controller tham chieu:
- `ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/interfacefile/ImportController.java:19`

Tat ca deu `POST`, nhan query:
- `interfaceFileId`
- `fileName`

Endpoints:
- `/import/brand`
- `/import/category`
- `/import/product`
- `/import/attributes`
- `/import/category-attributes`

Response: raw string message.

## 4.8 Export APIs

Controller tham chieu:
- `ecommerce-shop/basecommerce/src/main/java/com/ttl/base/controller/interfacefile/ExportController.java:24`

Tat ca deu `POST`, nhan query:
- `interfaceFileId`
- `fileName`

Endpoints:
- `/export/brand`
- `/export/category`
- `/export/product`
- `/export/attributes`
- `/export/category-attributes`
- `/export/category-attributes/import` (route dac biet, ten de gay nham)

Response: raw string message.

## 5. Nghiệp vu va validation quan trong cho frontend

## 5.1 Brand

- Create/update can giu unique name/slug theo rule backend.
- Delete co the fail neu brand dang duoc product tham chieu.

## 5.2 Category

- Parent-child phai hop le, khong duoc tao cycle.
- Delete co the fail neu category co child hoac dang duoc product dung.

## 5.3 AttributeDef

- `valueType` hop le trong tap cho phep.
- Neu `variantAxis=true` thi valueType phai option-based (`select|multi_select`).
- Mot so thay doi co the bi chan neu da co du lieu dang dung (tranh break variant/spec).

## 5.4 AttributeValue

- Chi tao option cho attribute option-based.
- `option` phai thuoc dung `attribute`.
- Delete/update bi chan neu dang duoc product variant su dung.

## 5.5 CategoryAttribute

- Moi cap `(categoryId, attributeId)` la duy nhat.
- Co `variantAxis/specification` tren category scope, frontend can map ro checkbox/rule tu service response.

## 5.6 Product create (critical)

- Product:
  - `name` bat buoc
  - `price > 0`
  - `categoryId`, `brandId` bat buoc
  - khong gui `status` khi create

- Variant:
  - `sku` bat buoc, unique trong request
  - `price >= 0`, `stockQty >= 0`
  - phai co attributes
  - khong trung signature (neu co)

- Variant attributes:
  - `attributeId` ton tai va la variant axis
  - `optionId` ton tai, active, va thuoc dung attribute

## 6. Contract edge cases frontend phai xu ly

1. Product create la multipart, khong phai JSON thuan.
2. Product update la JSON-only, nhung media update di bang endpoints rieng `/products/{id}/images*`.
3. Import/export tra raw string, khong envelope.
4. Endpoint naming khong dong deu (`/brands/update/{id}` khac cac domain khac).
5. Co endpoint bat thuong `/export/category-attributes/import`; can map rieng trong constants.
6. List API basecommerce hien tai khong theo page contract; frontend can san sang cho list full.

## 7. Mapping de xuat cho Angular

## 7.1 API constants

Cap nhat/doi chieu `API_ENDPOINTS` theo dung path thuc te:
- `brands.update = (id) => /brands/update/${id}`
- `attributes.options = /attribute-options`
- `categoryAttributes = (categoryId) => /categories/${categoryId}/attributes`
- import/export endpoint giu dung ten route hien tai

## 7.2 Service decomposition

Service de xuat:
- `brand-api.service.ts`
- `category-api.service.ts`
- `attribute-api.service.ts` (def + option)
- `category-attribute-api.service.ts`
- `product-api.service.ts`
- `import-export-api.service.ts`

Rule call:
- Main API (`8081`): `withCredentials: true` + bearer token qua interceptor.
- Product create: service helper tao `FormData`.
- Import/export: `responseType: 'text'`.

## 7.3 UI flow de xuat theo domain

1. Catalog foundation:
- Brand CRUD
- Category CRUD

2. Schema foundation:
- AttributeDef CRUD
- AttributeValue CRUD
- CategoryAttribute CRUD theo category

3. Product:
- List/filter/detail
- Create multipart (metadata + files + variants)

4. Operations:
- Import/export man hinh trigger theo interface file

## 8. Ke hoach trien khai chi tiet cho frontend

## Phase 0 - Kiem tra prerequisite
- Xac nhan auth flow dang on (`/auth/login`, `/auth/refresh`, `/auth/me`).
- Xac nhan interceptor chain khong bi break (`credentials -> auth -> refresh`).

## Phase 1 - Dong bo endpoint constants
- Doi chieu endpoint basecommerce theo muc 4.
- Sua cac endpoint sai ten (dac biet brand update, attribute-options).

Deliverable:
- constants endpoint dung 100% contract backend.

## Phase 2 - Service layer + models
- Chuan hoa request/response model cho 6 domain service.
- Tach handler cho text response import/export.
- Tao helper `createProductFormData(product, files)`.

Deliverable:
- Typed services call duoc tat ca endpoint basecommerce.

## Phase 3 - UI CRUD theo thu tu dependency
- Brand, Category.
- AttributeDef, AttributeValue.
- CategoryAttribute theo category.
- Product list/detail/create.

Deliverable:
- UI flow tao duoc du lieu nen cho product va tao duoc product variant hop le.

## Phase 4 - Hardening
- Xu ly thong diep loi business nhat quan.
- Validate client-side truoc submit de giam loi backend.
- Them loading/error states cho import-export jobs.

Deliverable:
- UX on dinh, giam request fail do invalid payload.

## 9. Verification checklist cho frontend team

- [ ] Login + load current user thanh cong truoc khi goi API basecommerce.
- [ ] Tat ca call basecommerce duoc gui kem bearer token.
- [ ] Product create gui dung multipart format (`product` json string + `images`).
- [ ] Import/export parse dung text response.
- [ ] Brand update dung `/brands/update/{id}`.
- [ ] CategoryAttribute UI map dung nested route theo `categoryId`.
- [ ] Cac case delete in-use duoc hien thi thong diep ro rang.

## 10. Risks / handoff notes

- Permission annotation trong basecommerce khong dong deu o method-level; backend security global van enforce authenticated. Frontend khong nen suy luan full RBAC chi dua vao annotation tung endpoint.
- Neu team can pagination cho list lon, can thoa thuan backend contract moi (hien tai tra list).
- Neu can upload/update product sau create hoac delete product, can xac nhan bo endpoint tiep theo vi controller hien tai moi expose list/get/create.
