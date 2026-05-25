# Audit FE-BE Guidelines

## Muc tieu

Quy tac khi doi chieu frontend Angular voi backend Spring Boot de phat hien gap, dead code, hoac feature thieu. Tranh ket luan voi va viet sai trong audit report.

## Quy trinh audit

1. List toan bo REST endpoint cua backend (controller `@RequestMapping`).
2. List toan bo HTTP call cua frontend (service `*.service.ts`, hang so `API_ENDPOINTS`).
3. Doi chieu tung endpoint: path, verb, request DTO, response DTO, query param, header.
4. Voi moi gap nghi ngo (FE chua dung, BE chua co, ten lech), VERIFY truoc khi viet ket luan.
5. Tach ro: (a) dead code trong FE constants, (b) endpoint BE co nhung FE chua consume, (c) FE goi nhung BE khong co.

## Quy tac verify truoc khi ket luan

### Truoc khi viet "FE chua tich hop X"

- Doc thuc te BE co duong khac handle cung feature khong. Vi du: `loadSearchProducts` co the la JPA `Specification` + `LIKE %keyword%` + Redis cache, khong phai Elasticsearch — nhung van phuc vu use case search.
- Doc implementation cua duong day: query engine, cache layer, performance characteristics.
- Khong viet "BE module X dang bi lang phi" neu chua xac nhan FE thuc su can capability ma X mang lai.

### Truoc khi viet "FE chua co UI cho X"

- Grep caller cua service method tuong ung trong FE. Vi du `loginWithGoogle()` co the duoc goi tu login.page va register.page nhung khong xuat hien trong test file.
- Grep config value (env file, app-config) lien quan. Co the UI da co nhung an di khi config rong.
- Doc template cua page chinh: button placeholder, conditional render `@if`.

### Truoc khi xoa entry trong `api-endpoints.ts`

- Grep `API_ENDPOINTS.{group}.{key}` toan bo `src/app/`.
- Neu key la function `(id) => ...`, grep ca cach goi truc tiep voi argument.
- Khong dua tren ten file service de doan: 1 service co the goi nhieu endpoint group.

## Vi du minh hoa

### Vi du 1: searchservice "lang phi"

**Ket luan sai**: "BE da co Elasticsearch o searchservice port 8082 nhung FE chua consume — dang lang phi".

**Verify thieu**: chua doc `ProductService.loadSearchProducts` trong basecommerce. Thuc te:
- `/products/storefront` dung JPA `Specification` + SQL `LIKE %keyword%` + Redis cache 5 phut.
- Day la duong day search cho storefront dang hoat dong, du tot cho catalog hien tai.
- Searchservice ES chi can khi: fuzzy/typo-tolerant, facets, suggestion, dataset rat lon.

**Cach lam dung**: viet trung tinh "FE chua consume searchservice; can xac nhan use case fuzzy/facet co thuc su can khong truoc khi tich hop". Hoi PO ve catalog size va user behavior.

### Vi du 2: Google OAuth "chua co UI"

**Ket luan sai**: "BE accept `googleToken` nhung FE chua co button Google login".

**Verify thieu**: chua grep `loginWithGoogle` callers, `googleClientId` usage. Thuc te:
- `login.page.ts` va `register.page.ts` co dynamic GIS (Google Identity Services) script load.
- Button render qua `google.accounts.id.renderButton` voi `clientId` tu env.
- Button an di khi `googleClientId` empty — day la config gap, khong phai code gap.

**Cach lam dung**: kiem tra `loginWithGoogle` callers truoc, ket luan "Google OAuth da implement, chi thieu config `googleClientId` value trong env files".

## Tu vung dung khi viet audit report

- "FE chua consume X" thay vi "BE X dang lang phi".
- "Config gap" thay vi "code gap" khi chi can set value env.
- "Use case can confirm voi PO" thay vi "FE thieu feature" — neu chua biet user co can khong.
- "Dead code an toan xoa" chi khi da grep verify khong co caller.

## Khong nen lam

- Khong implement P2/P3/P4 ngay sau khi audit ma chua confirm scope voi user/PO.
- Khong dua truc tiep tu "BE co endpoint" thanh "FE phai goi" — co the use case khong can.
- Khong xoa dead entry chi vi 1 lan grep khong thay — verify ca cach goi truc tiep (vd `'/user/register'` literal).
- Khong gop 2 interface FE khac ten chi vi shape giong nhau neu semantic khac biet (giu type alias de team biet intent).

## Khi can hoi lai

- Khi audit phat hien gap lon co the la design decision (vi du searchservice ES tach module rieng) — hoi user truoc khi propose tich hop.
- Khi xoa dead endpoint co lien quan toi feature dang pending (vi du `order.create` cho admin direct order) — hoi PO co keep cho tuong lai khong.
- Khi nghi ngo BE config gap vs code gap — hoi devops/backend dev.
