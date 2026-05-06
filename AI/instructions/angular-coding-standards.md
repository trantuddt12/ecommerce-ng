# Angular Coding Standards

## Muc tieu

Day la bo quy tac de AI hoac lap trinh vien sua code trong repo nay ma khong lam lech kien truc hien co.

## Kien truc tong quan

- Dung Angular 17 voi standalone components.
- Chia thu muc theo `core`, `features`, `shared`.
- `core` chua cac thanh phan dung xuyen suot: layout, guards, interceptors, services, state, constants.
- `features` chua man hinh theo domain nghiep vu.
- `shared` chua UI tai su dung va khong nen chua business logic nang.

## Quy tac tao file

- Page component: dat trong `features/<domain>/.../*.page.ts`.
- Layout component: dat trong `core/layout/`.
- Global service: dat trong `core/services/`.
- Domain model dung chung: dat trong `core/models/` neu duoc dung xuyen feature.
- Constant route va endpoint: dat trong `core/constants/`.

## Quy tac code

- Uu tien `inject()` neu file hien tai dang theo kieu nay.
- Uu tien `signal` va `computed` cho auth state nhu codebase dang dung.
- Service API nen di qua `BaseApiService` thay vi goi `HttpClient` truc tiep neu khong co ly do dac biet.
- Endpoint moi nen them vao `API_ENDPOINTS`.
- Moi thay doi frontend lien quan API (them, xoa, doi endpoint, doi method, doi query/body, doi response mapping, doi service caller) bat buoc cap nhat `AI/references/api-inventory.md` trong cung task.
- Route moi nen can nhac them vao `APP_ROUTES` neu duoc navigate lap lai.
- Khong tao utility moi neu chi dung mot lan va logic van de doc trong file hien tai.

## Quy tac UI

- Ton trong visual style hien tai: gradient nhe, card sang, border radius lon, mau xanh lam la chu dao.
- Khong dua design system moi vao repo khi chua co yeu cau.
- Uu tien responsive co ban cho desktop va mobile.

## Quy tac auth va state

- Auth state nam trong `AuthStore`.
- Access token duoc dong bo qua `SessionService` va `CurrentUserService`.
- 401 flow duoc xu ly qua `refresh-token.interceptor.ts`.
- Khong tu y tao auth flow song song trong component.

## Quy tac review thay doi

- Luon kiem tra anh huong len guards.
- Luon kiem tra dieu huong sau login/logout.
- Luon kiem tra endpoint co phu hop backend naming da co khong.
- Neu them feature can API, xac dinh loading va error path.
