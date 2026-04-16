# De xuat bo sung endpoint current user cho Angular frontend

## 1. Muc dich

Frontend Angular hien da login thanh cong, nhan duoc `accessToken`, nhung khong the on dinh trong viec xac dinh `roles` va `permissions` cua nguoi dang nhap chi dua vao token hoac endpoint `GET /user` hien tai.

De frontend co the:

- dieu huong sau login dung theo quyen
- bao ve route admin bang `permissionGuard`
- hien/ an menu theo permission
- khoi phuc session sau refresh token hoac reload trang

backend can bo sung mot endpoint chuan de tra ve thong tin user hien tai dang dang nhap.

De xuat endpoint nay la:

- `GET /auth/me`

Co the dat ten khac nhu `GET /me`, nhung nen uu tien `/auth/me` de de hieu va dong nhat voi auth flow hien tai.

## 2. Van de hien tai

Frontend hien co cac signal/computed sau:

```ts
readonly isAuthenticated = computed(() => Boolean(this.accessToken()));
readonly permissions = computed(() => new Set(this.currentUser()?.permissions ?? []));
readonly roles = computed(() => this.currentUser()?.roles ?? []);
```

Doan code tren khong co loi ve mat Angular signal.

Van de that su la frontend chua co nguon du lieu on dinh cho `currentUser.permissions` va `currentUser.roles`.

### Cac han che hien tai

1. Access token co the khong chua day du claims `roles` / `permissions`.
2. `GET /user` hien tai khong phai mot contract ro rang cho "current logged-in user".
3. `GET /user` co the la list users hoac response khong phu hop de frontend map current user context.
4. Frontend khong nen tu suy doan permission tu role name.

Vi vay, backend nen cung cap mot endpoint current-user ro rang, tra ve user context da duoc resolve day du.

## 3. Yeu cau endpoint de xuat

## 3.1 Endpoint

- Method: `GET`
- URL: `/auth/me`
- Auth: bat buoc authenticated
- Header: `Authorization: Bearer <accessToken>`
- Response: theo response wrapper hien co cua backend

## 3.2 Muc tieu cua endpoint

Endpoint nay phai tra ve thong tin cua chinh user dang dang nhap, khong nhan `id` tu frontend.

Backend can lay principal tu security context va tra ra:

- thong tin user co ban
- danh sach roles
- danh sach permissions/authorities da duoc resolve hoan chinh

## 4. Response contract de xuat

Frontend de xuat backend tra ve response theo wrapper hien tai:

```json
{
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "fullName": "Admin User",
    "firstName": "Admin",
    "lastName": "User",
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
          },
          {
            "id": 2,
            "name": "USER_MANAGE",
            "description": "Manage users"
          },
          {
            "id": 3,
            "name": "PRODUCT_VIEW",
            "description": "View products"
          }
        ]
      }
    ],
    "authorities": [
      "USER_VIEW",
      "USER_MANAGE",
      "PRODUCT_VIEW"
    ],
    "permissions": [
      "USER_VIEW",
      "USER_MANAGE",
      "PRODUCT_VIEW"
    ]
  },
  "timestamp": "2026-04-16T10:20:30.000+07:00"
}
```

## 4.1 Cac field frontend can nhat

Bat buoc nen co:

- `id`
- `username`
- `email` hoac co 1 field dinh danh hien thi duoc
- `roles`
- `permissions` hoac `authorities`

Khuyen nghi:

- `fullName`
- `firstName`
- `lastName`
- `roles[].permissions`

## 4.2 Nguyen tac quan trong

Frontend rat can mot tap permission da duoc flatten san o cap user, vi du:

```json
"permissions": ["USER_VIEW", "USER_MANAGE", "PRODUCT_VIEW"]
```

Neu backend chi tra role names ma khong tra permission codes, frontend se khong the route guard chinh xac.

## 5. TypeScript model frontend dang ky vong

Frontend co the map on dinh neu backend tra theo cau truc gan voi model sau:

```ts
export interface BackendPermission {
  id?: number | string;
  name?: string;
  description?: string;
}

export interface BackendRole {
  id?: number | string;
  name?: string;
  roleName?: string;
  authorities?: Array<string | BackendPermission>;
  permissions?: Array<string | BackendPermission>;
}

export interface BackendUser {
  id?: number | string;
  username?: string;
  email?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  roles?: BackendRole[] | string[];
  authorities?: Array<string | BackendPermission>;
  permissions?: Array<string | BackendPermission>;
}
```

## 6. Ky vong hanh vi frontend sau khi co endpoint nay

Frontend se su dung endpoint theo luong sau:

1. User login qua `POST /auth/login`
2. Frontend luu `accessToken`
3. Frontend goi `GET /auth/me`
4. Frontend luu `currentUser`, `roles`, `permissions` vao auth state
5. Frontend dieu huong theo permission

Tuong tu khi refresh token:

1. Frontend goi `POST /auth/refresh`
2. Backend tra `accessToken` moi
3. Frontend goi lai `GET /auth/me`
4. Frontend cap nhat user context

## 7. Loi ich ky thuat

Neu backend co `GET /auth/me`, frontend se:

- khong phai phu thuoc vao token claims de map user context
- khong phai doan `GET /user` la list hay current user
- co mot contract auth ro rang, on dinh, de test va mo rong
- de implement `authGuard`, `permissionGuard`, post-login redirect
- de khoi phuc session sau reload bang refresh token

## 8. Khuyen nghi backend implementation

Backend nen:

1. Lay principal tu security context hien tai
2. Resolve user entity hoac user response theo principal username/email
3. Load roles cua user
4. Resolve va flatten permissions tu roles
5. Tra ve 1 response DTO rieng cho current user

Khuyen nghi tao DTO rieng, vi du:

- `CurrentUserResponse`
- `CurrentUserRoleResponse`
- `CurrentUserPermissionResponse`

Khong nen dung tam DTO list user neu DTO do khong day du permission data.

## 9. Neu chua the bo sung endpoint moi

Neu backend chua the them `GET /auth/me` ngay, co 2 phuong an tam thoi:

### Phuong an A
Bo sung claims `roles` va `permissions` day du vao JWT access token.

Vi du payload:

```json
{
  "sub": "admin",
  "roles": ["ADMIN"],
  "authorities": ["USER_VIEW", "USER_MANAGE", "PRODUCT_VIEW"]
}
```

### Phuong an B
Tai su dung `GET /user`, nhung phai chot ro rang rang endpoint do tra ve current user va bao gom permission data.

Tuy nhien, day chi la giai phap tam. Giai phap tot nhat van la endpoint chuyen biet `GET /auth/me`.

## 10. De xuat chot cho backend team

Backend team vui long bo sung:

1. `GET /auth/me`
2. Response wrapper chua `data`
3. Trong `data` phai co:
   - user basic info
   - roles
   - flattened permissions hoac authorities

Frontend se tich hop endpoint nay ngay sau khi backend cung cap de on dinh luong dang nhap, refresh session, route guard, va permission-based navigation.
