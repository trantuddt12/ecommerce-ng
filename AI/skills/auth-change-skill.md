# Skill: Auth Change

## Khi nao dung

- Khi sua login, logout, refresh token, session, current user, guard, hoac permission.

## Pham vi nhay cam

Day la khu vuc co rui ro regression cao. Moi thay doi can duoc doi chieu o nhieu diem, khong chi o mot component.

## Quy trinh bat buoc

1. Doc `AI/references/auth-flow.md`.
2. Doc cac file:
   - `src/app/core/services/auth.service.ts`
   - `src/app/core/services/app-init.service.ts`
   - `src/app/core/state/auth.store.ts`
   - `src/app/core/interceptors/refresh-token.interceptor.ts`
   - guards lien quan
3. Xac dinh thay doi anh huong den dang nhap, refresh, khoi tao app, logout, hay permission.
4. Sua code theo pham vi toi thieu.
5. Kiem tra redirect va state clear/set day du.
6. Kiem tra request refresh khong bi loop vo han.
7. Ghi ro testing gap neu khong verify duoc backend behavior.

## Dinh nghia thanh cong

- Login thanh cong thi state va navigation dung.
- 401 co the refresh hop le neu backend cho phep.
- Refresh that bai thi session bi clear va app quay ve login.
- Guard phan anh dung auth state va permissions.
