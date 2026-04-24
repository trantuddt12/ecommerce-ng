# Inventory Specification va API Contract

## 1. Muc dich

Tai lieu nay la ban hop nhat giua:

- business design trong `docs/inventory-business-design.md`
- implementation backend hien tai trong codebase

Muc tieu cua tai lieu nay la cho frontend co mot nguon tham chieu duy nhat de trien khai UI, state, service layer va xu ly loi cho inventory, trong khi van phan biet ro:

- nghiep vu chuan can huong toi
- contract backend da co the goi ngay
- pham vi chua co trong implementation hien tai

## 2. Nguyen tac cot loi can thong nhat

- Inventory duoc quan ly o cap `variant/SKU`, khong o cap product tong.
- `availableQty` moi la gia tri frontend phai tin de quyet dinh UX, khong phai `onHandQty`.
- Frontend khong duoc tu suy dien business state bang cach tu tinh toan nhieu field raw roi tu dat rule rieng.
- Moi thay doi ton kho quan trong ve nghiep vu nen co audit trail.
- Reserve, release, deduct, adjust la nhung business action khac nhau; frontend khong duoc gom chung thanh mot logic ton kho mo ho.
- Neu mot flow chua co endpoint rieng trong backend hien tai, frontend khong nen tu gia lap contract do.

## 3. Pham vi inventory can frontend hieu

## 3.1 Pham vi business phase co ban

- Inventory cap SKU
- `onHandQty`, `reservedQty`, `availableQty`
- Inventory status cho UI
- Validation ton kho tren product/cart/checkout
- Reserve/release/deduct theo order lifecycle
- Inventory movement audit
- Admin adjustment co ban
- Low stock marker co ban

## 3.2 Pham vi implementation backend hien tai

Da co trong code:

- admin inventory list
- admin inventory detail
- admin inventory movements
- admin inventory adjustment
- inventory summary fields trong product/search variant summary
- inventory summary fields trong cart item response
- reserve/release/deduct inventory trong order flow

Chua co endpoint/doc lap trong code hien tai:

- public inventory detail endpoint theo variant
- bulk adjustment
- restock/scrap endpoint cho return
- low stock dashboard tong hop
- movement pagination server-side day du
- admin reserve/release/deduct manual endpoint
- multi-warehouse

## 4. Business glossary va logic nen dung chung

## 4.1 Stock buckets

- `onHandQty`: so luong vat ly dang co
- `reservedQty`: so luong da giu cho order nhung chua tru kho
- `availableQty`: so luong co the ban

Cong thuc business:

`availableQty = max(onHandQty - reservedQty, 0)`

Cong thuc nay cung la logic implementation hien tai trong `InventorySummaryResponse`.

## 4.2 Inventory status cho UI

Frontend nen support enum sau:

```ts
export type InventoryStatus =
  | 'IN_STOCK'
  | 'LOW_STOCK'
  | 'OUT_OF_STOCK'
  | 'BACKORDERABLE';
```

Ghi chu implementation hien tai:

- backend dang tra thuc te `IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`
- `BACKORDERABLE` da co trong enum nhung chua thay duoc xu ly trong service hien tai

Rule UI nen bam:

- `IN_STOCK`: `availableQty > 0` va khong thuoc low stock
- `LOW_STOCK`: `availableQty > 0` va `availableQty <= lowStockThreshold`
- `OUT_OF_STOCK`: `availableQty <= 0`

## 4.3 Movement types

```ts
export type InventoryMovementType =
  | 'RECEIVE'
  | 'RESERVE'
  | 'RELEASE'
  | 'DEDUCT'
  | 'ADJUST_IN'
  | 'ADJUST_OUT'
  | 'RETURN_RECEIVED'
  | 'RESTOCK'
  | 'SCRAP';
```

Implementation hien tai dang co API audit cho movement va adjustment tao ra `ADJUST_IN`/`ADJUST_OUT`.

## 4.4 Reference types

```ts
export type InventoryReferenceType =
  | 'PRODUCT_INIT'
  | 'ORDER'
  | 'ADJUSTMENT'
  | 'RETURN';
```

## 4.5 Adjustment types va reason codes

```ts
export type InventoryAdjustmentType = 'IN' | 'OUT';

export type InventoryAdjustmentReasonCode =
  | 'LOST'
  | 'DAMAGED'
  | 'COUNT_FIX'
  | 'FOUND'
  | 'MANUAL';
```

## 5. Order lifecycle lien quan toi inventory

Day la business lifecycle quan trong de frontend admin khong hien sai meaning:

- `create order`: chi validate ATS, chua tru kho
- `confirm order`: reserve inventory
- `cancelled`, `delivery_failed`, `returned` truoc deduct: release inventory
- `delivered`: deduct inventory

Frontend admin nen coi inventory la mot lifecycle rieng gan voi order, khong phai moi order tao ra la ton kho da bi tru ngay.

## 6. Storefront contract can bam theo

## 6.1 Frontend khong goi endpoint inventory rieng

Hien tai backend chua expose endpoint public nhu `GET /inventory/{variantId}`.

Frontend storefront lay thong tin inventory tu cac response nghiep vu khac:

- product/search variant summary
- cart item response

## 6.2 Inventory summary fields can support

```ts
export interface InventorySummary {
  onHandQty: number;
  reservedQty: number;
  availableQty: number;
  inventoryStatus: InventoryStatus;
  canAddToCart: boolean;
  canCheckout: boolean;
  lowStockMessage: string | null;
}
```

Ghi chu:

- frontend storefront thuong se nhan mot tap con cua model nay, tuy response
- frontend nen dua UX vao `availableQty`, `inventoryStatus`, `canAddToCart`, `canCheckout`, `lowStockMessage`
- khong nen tu render business state bang cach doc raw `onHandQty` va `reservedQty` roi tu xu ly rule rieng

## 6.3 Product va search variant summary

Implementation hien tai dang dua vao variant summary cac field:

- `availableQty`
- `inventoryStatus`
- `canAddToCart`
- `canCheckout`
- `lowStockMessage`

Frontend nen su dung:

- `canAddToCart` de disable nut `Add to cart`
- `canCheckout` de disable `Buy now` neu co
- `inventoryStatus` de render badge `Con hang`, `Sap het hang`, `Het hang`
- `lowStockMessage` de hien text nhu `Chi con 3 san pham`
- `availableQty` de validate quantity picker

## 6.4 Cart item response

Frontend cart can support item model sau:

```ts
export interface CartItemInventoryView {
  id: number;
  productId: number;
  variantId: number;
  productCode: string;
  productName: string;
  variantName: string;
  variantAttributes: string;
  sku: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
  compareAtPrice?: number | null;
  lineSubtotal: number;
  availableQty: number;
  inventoryStatus: InventoryStatus;
  canAddToCart: boolean;
  canCheckout: boolean;
  lowStockMessage: string | null;
}
```

Frontend cart nen co UX:

- canh bao neu quantity vuot `availableQty`
- show thong diep khi item het hang hoac low stock
- khong giu quantity cu mu quang neu backend recheck ton kho tra ve khac

## 7. Admin inventory API co the goi ngay

## 7.1 Base URL va auth

- Main API: `http://localhost:8081`
- Tat ca inventory endpoint hien tai la admin endpoint
- Gui `Authorization: Bearer <accessToken>`
- Co the giu `withCredentials: true` neu frontend dung refresh cookie flow chung

## 7.2 Permissions

Controller dang enforce:

- `INVENTORY_VIEW`: xem list, detail, movement
- `INVENTORY_MANAGE`: adjustment

Frontend nen guard theo permission string.

## 7.3 Response wrapper chung

Main API dung wrapper tu `ResponseHandler`.

### Object response

```json
{
  "data": {
    "variantId": 101,
    "sku": "SKU-RED-M",
    "productId": 55,
    "productName": "Ao thun basic",
    "onHandQty": 10,
    "reservedQty": 2,
    "availableQty": 8,
    "inventoryStatus": "IN_STOCK"
  }
}
```

### Page response

```json
{
  "data": [],
  "timestamp": "2026-04-24T11:00:00+07:00",
  "page": {
    "_totalElements": 120,
    "_currentPage": 0,
    "_pageSize": 20,
    "_totalPages": 6
  }
}
```

### Collection response

```json
{
  "data": [],
  "timestamp": "2026-04-24T11:00:00+07:00",
  "page": {
    "_totalElements": 1,
    "_currentPage": 0,
    "_pageSize": 0,
    "_totalPages": 1
  }
}
```

### TypeScript de xuat

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

## 8. Models frontend cho admin inventory

```ts
export interface AdminInventoryListItem {
  variantId: number;
  sku: string;
  productId: number;
  productName: string;
  onHandQty: number;
  reservedQty: number;
  availableQty: number;
  inventoryStatus: InventoryStatus;
  updatedAt: string;
  lowStockThreshold: number | null;
  lowStockMessage: string | null;
}

export interface InventoryMovement {
  id: number;
  variantId: number;
  movementType: InventoryMovementType;
  quantity: number;
  beforeOnHandQty: number;
  afterOnHandQty: number;
  beforeReservedQty: number;
  afterReservedQty: number;
  referenceType: InventoryReferenceType;
  referenceId: string;
  note: string | null;
  performedBy: string;
  performedAt: string;
}

export interface AdminInventoryDetail {
  variantId: number;
  sku: string;
  productId: number;
  productName: string;
  onHandQty: number;
  reservedQty: number;
  availableQty: number;
  inventoryStatus: InventoryStatus;
  updatedAt: string;
  lowStockThreshold: number | null;
  lowStockMessage: string | null;
  recentMovements: InventoryMovement[];
}

export interface AdminInventoryAdjustmentRequest {
  adjustmentType: InventoryAdjustmentType;
  quantity: number;
  reasonCode: InventoryAdjustmentReasonCode;
  note?: string | null;
}
```

## 9. API chi tiet

## 9.1 GET `/admin/inventories`

- Permission: `INVENTORY_VIEW`
- Auth: required

### Query params

| Param | Type | Required | Default | Ghi chu |
| --- | --- | --- | --- | --- |
| `keyword` | string | khong | - | tim theo SKU, product code, product name |
| `inventoryStatus` | string | khong | - | `IN_STOCK` \| `LOW_STOCK` \| `OUT_OF_STOCK` |
| `categoryId` | number | khong | - | loc theo category cua product |
| `brandId` | number | khong | - | loc theo brand cua product |
| `page` | number | khong | `0` | zero-based |
| `size` | number | khong | `20` | kich thuoc trang |
| `sortBy` | string | khong | `lastModifiedAt` | chap nhan `lastModifiedAt`, `onHandQty`, `reservedQty`, `id` |
| `sortDir` | string | khong | `desc` | `asc` hoac `desc` |

### Quy tac backend hien tai

- `keyword` match theo `sku`, `product.code`, `product.name`
- `inventoryStatus` sai enum khong nem validation error, ma tra danh sach rong
- `LOW_STOCK` chi co ket qua khi `lowStockThreshold != null` va `availableQty <= threshold`
- `IN_STOCK` la `availableQty > 0` va khong thuoc low stock
- `OUT_OF_STOCK` la `availableQty <= 0`
- `sortBy` khong hop le se fallback ve `lastModifiedAt`
- `sortDir` khong hop le se fallback ve `desc`

### Response item example

```json
{
  "variantId": 101,
  "sku": "TSHIRT-BLACK-M",
  "productId": 55,
  "productName": "Ao thun basic",
  "onHandQty": 10,
  "reservedQty": 2,
  "availableQty": 8,
  "inventoryStatus": "IN_STOCK",
  "updatedAt": "2026-04-24T10:30:00",
  "lowStockThreshold": 3,
  "lowStockMessage": null
}
```

### Frontend use cases

- inventory admin list
- filter ton kho
- search SKU/ten san pham
- pagination server-side
- sort theo `onHandQty`, `reservedQty`, `updatedAt`

## 9.2 GET `/admin/inventories/{variantId}`

- Permission: `INVENTORY_VIEW`
- Auth: required

### Path param

| Param | Type | Required | Ghi chu |
| --- | --- | --- | --- |
| `variantId` | number | co | id cua variant |

### Hanh vi backend hien tai

- load inventory theo `variantId`
- neu khong ton tai se throw business exception
- response da kem `recentMovements` toi da 20 ban ghi moi nhat

### Response example

```json
{
  "data": {
    "variantId": 101,
    "sku": "TSHIRT-BLACK-M",
    "productId": 55,
    "productName": "Ao thun basic",
    "onHandQty": 10,
    "reservedQty": 2,
    "availableQty": 8,
    "inventoryStatus": "IN_STOCK",
    "updatedAt": "2026-04-24T10:30:00",
    "lowStockThreshold": 3,
    "lowStockMessage": null,
    "recentMovements": [
      {
        "id": 9001,
        "variantId": 101,
        "movementType": "ADJUST_OUT",
        "quantity": 2,
        "beforeOnHandQty": 12,
        "afterOnHandQty": 10,
        "beforeReservedQty": 2,
        "afterReservedQty": 2,
        "referenceType": "ADJUSTMENT",
        "referenceId": "ADJ-101-1713933000000",
        "note": "Adjustment reason: DAMAGED | Vo hop khi kiem ke",
        "performedBy": "admin",
        "performedAt": "2026-04-24T10:20:00"
      }
    ]
  }
}
```

## 9.3 GET `/admin/inventories/{variantId}/movements`

- Permission: `INVENTORY_VIEW`
- Auth: required

### Params

| Param | In | Type | Required | Default | Ghi chu |
| --- | --- | --- | --- | --- | --- |
| `variantId` | path | number | co | - | id cua variant |
| `limit` | query | number | khong | `20` | backend ep trong khoang `1..100` |

### Hanh vi backend hien tai

- `limit < 1` -> backend doi thanh `1`
- `limit > 100` -> backend doi thanh `100`
- sort moi nhat truoc theo `performedAt DESC, id DESC`
- endpoint verify inventory ton tai truoc khi lay movement

### Response example

```json
{
  "data": [
    {
      "id": 9001,
      "variantId": 101,
      "movementType": "ADJUST_OUT",
      "quantity": 2,
      "beforeOnHandQty": 12,
      "afterOnHandQty": 10,
      "beforeReservedQty": 2,
      "afterReservedQty": 2,
      "referenceType": "ADJUSTMENT",
      "referenceId": "ADJ-101-1713933000000",
      "note": "Adjustment reason: DAMAGED | Vo hop khi kiem ke",
      "performedBy": "admin",
      "performedAt": "2026-04-24T10:20:00"
    }
  ],
  "timestamp": "2026-04-24T11:00:00+07:00",
  "page": {
    "_totalElements": 1,
    "_currentPage": 0,
    "_pageSize": 0,
    "_totalPages": 1
  }
}
```

## 9.4 POST `/admin/inventories/{variantId}/adjustments`

- Permission: `INVENTORY_MANAGE`
- Auth: required
- Content-Type: `application/json`

### Request body

```json
{
  "adjustmentType": "OUT",
  "quantity": 2,
  "reasonCode": "DAMAGED",
  "note": "Vo hop khi kiem ke"
}
```

### Rules backend hien tai

- body `null` -> loi business
- `adjustmentType` bat buoc
- `quantity` bat buoc va phai `> 0`
- `reasonCode` bat buoc
- `OUT` khong duoc lam `onHandQty` am
- backend chi thay doi `onHandQty`, khong doi `reservedQty`
- movement duoc tao voi:
  - `referenceType = ADJUSTMENT`
  - `referenceId = ADJ-{variantId}-{timestampMillis}`
  - `movementType = ADJUST_IN` hoac `ADJUST_OUT`
  - `performedBy` lay tu authenticated principal, fallback `SYSTEM`
  - `note` format `Adjustment reason: <REASON> | <note>`

### Response

Tra ve inventory detail moi nhat sau adjustment thanh cong.

## 10. Error handling frontend can ho tro

Backend thuong tra shape:

```json
{
  "error": "message",
  "status": "400 BAD_REQUEST"
}
```

### Cac tinh huong can support

| Tinh huong | HTTP status thuong gap | Message co the gap |
| --- | --- | --- |
| Inventory khong ton tai | `400`/`404` tuy handler | `Inventory for variant id : 123 not found` |
| Thieu body adjustment | `400` | `Inventory adjustment request is required` |
| Thieu adjustment type | `400` | `Adjustment type is required` |
| Quantity <= 0 | `400` | `Adjustment quantity must be greater than 0` |
| Thieu reason code | `400` | `Adjustment reason code is required` |
| Giam ton am | `400` | `Adjustment would make on hand quantity negative` |
| Khong co permission view | `403` | loi security |
| Khong co permission manage | `403` | loi security |
| Het han token | `401` | loi security |

### UX khuyen nghi

- `401`: trigger refresh token flow hoac ve login
- `403`: an button adjustment hoac hien thong bao khong du quyen
- business error trong adjustment: show inline error trong form/modal
- inventory not found: redirect ve list va thong bao ban ghi khong ton tai

## 11. Huong dan UI/UX theo business design

## 11.1 Storefront

Can co cac quy tac sau:

- nut `Add to cart` dua tren `canAddToCart`
- nut `Buy now` dua tren `canCheckout`
- badge ton kho dua tren `inventoryStatus`
- neu co `lowStockMessage` thi hien canh bao
- neu add to cart fail do ton thay doi, phai refresh item summary tu backend

## 11.2 Cart

Can hien:

- quantity hien tai
- canh bao item khong du ton
- CTA cap nhat quantity
- thong diep item het hang

## 11.3 Admin inventory list

Can hien:

- SKU
- product name
- on hand
- reserved
- available
- inventory status
- updated at
- low stock badge/message

Filter goi y:

- keyword SKU/product
- inventory status
- category
- brand

## 11.4 Admin inventory detail

Nen chia block:

- thong tin SKU/variant
- inventory summary
- movement timeline
- form adjustment
- thong tin lien quan order dang reserve neu UI order co lien ket

## 12. Logging va audit meaning cho frontend

Business design yeu cau frontend phan biet duoc ai va vi sao inventory thay doi. Vi vay voi movement timeline, frontend nen uu tien hien:

- `movementType`
- `quantity`
- `before/after` on-hand va reserved
- `referenceType`
- `referenceId`
- `performedBy`
- `performedAt`
- `note`

Day la can cu de:

- debug oversell
- doi soat lech ton
- giai thich voi CSKH/van hanh

## 13. Phan biet ro giua spec va implementation hien tai

## 13.1 Da align voi business design

- inventory cap SKU
- co `onHandQty`, `reservedQty`, `availableQty`
- co inventory status cho UI
- co admin list/detail/adjustment
- co movement history
- co reserve/release/deduct trong order flow
- co low stock logic co ban neu co threshold

## 13.2 Trong business design co nhung backend chua expose day du

- `POST /admin/returns/{returnId}/restock`
- `POST /admin/returns/{returnId}/scrap`
- public inventory endpoint rieng
- bulk operations
- event hooks `inventory.changed`, `inventory.low_stock`, `inventory.out_of_stock`
- multi-warehouse va transfer

Frontend nen xem nhung muc nay la roadmap, khong phai contract goi ngay.

## 14. De xuat Angular service layer

```ts
export interface InventoryQuery {
  keyword?: string;
  inventoryStatus?: InventoryStatus;
  categoryId?: number;
  brandId?: number;
  page?: number;
  size?: number;
  sortBy?: 'lastModifiedAt' | 'onHandQty' | 'reservedQty' | 'id';
  sortDir?: 'asc' | 'desc';
}

export abstract class InventoryApi {
  abstract getInventories(query: InventoryQuery): Observable<ApiEnvelope<AdminInventoryListItem[]>>;
  abstract getInventoryDetail(variantId: number): Observable<ApiEnvelope<AdminInventoryDetail>>;
  abstract getInventoryMovements(variantId: number, limit?: number): Observable<ApiEnvelope<InventoryMovement[]>>;
  abstract adjustInventory(variantId: number, body: AdminInventoryAdjustmentRequest): Observable<ApiEnvelope<AdminInventoryDetail>>;
}
```

## 15. Checklist frontend trien khai

- tao `ApiEnvelope<T>` wrapper chung
- map permission `INVENTORY_VIEW`, `INVENTORY_MANAGE`
- tao enum cho inventory status, movement type, reason code
- implement inventory list voi filter + pagination + sort
- implement inventory detail voi timeline
- implement adjustment modal
- map inventory fields vao product/cart UI ma khong tu suy dien raw stock
- danh dau ro nhung flow roadmap chua co endpoint that
