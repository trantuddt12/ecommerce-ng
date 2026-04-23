# Frontend Auth Login Logout Spec

## 1. Muc tieu

Tai lieu nay mo ta quy trinh `login`, `logout`, `OTP`, `MFA`, `session expired`, va `re-authentication` theo huong product thuc te de frontend co the trien khai thong nhat voi backend.

Tai lieu tap trung vao:

- User flow thuc te.
- Auth state ma frontend can quan ly.
- Man hinh va route can co.
- API contract de frontend va backend chot chung.
- Cac edge case va quy uoc UX.

## 2. Pham vi

Tai lieu nay bao gom:

- Login thong thuong bang password.
- Login bang OTP nhu mot phuong thuc chinh.
- Login co xac thuc them buoc 2 `MFA/2FA`.
- Logout hien tai va logout tat ca thiet bi.
- Session timeout, refresh token, va auto logout.
- Re-authentication cho thao tac nhay cam.

Tai lieu nay khong di sau vao:

- UI design chi tiet.
- Backend implementation.
- Quy trinh dang ky day du.

## 3. Cac kieu login pho bien trong product thuc te

Frontend nen san sang cho cac dang login sau:

### 3.1. Login bang email/phone/username va password

Day la flow co ban nhat:

1. User nhap `identifier`.
2. User nhap `password`.
3. Frontend submit login.
4. Neu hop le thi tao session va vao he thong.

### 3.2. Login bang OTP

OTP la cach dang nhap chinh, khong can password.

Flow:

1. User nhap `email` hoac `phone`.
2. He thong gui OTP.
3. User nhap OTP.
4. Neu hop le thi tao session.

### 3.3. Login bang password va OTP nhu buoc xac thuc thu 2

Day la `MFA/2FA`, khong phai passwordless OTP.

Flow:

1. User nhap `identifier + password`.
2. Backend xac dinh can them mot buoc xac thuc.
3. Frontend hien man hinh nhap `OTP`, `TOTP`, `push`, hoac factor khac.
4. Sau khi verify thanh cong moi duoc xem la login xong.

### 3.4. Social login va SSO

Vi du:

- Google
- Facebook
- Apple
- Microsoft
- OIDC/SAML SSO

Flow tong quat:

1. User bam provider.
2. Frontend redirect ra nha cung cap dang nhap.
3. Sau khi dang nhap xong, provider redirect lai he thong.
4. Frontend nhan session hop le va bootstrap current user.

### 3.5. Passwordless khac

Co the ho tro them:

- Magic link qua email.
- Passkey/WebAuthn.
- Biometrics tren mobile.

Tai lieu nay khong di sau vao cac flow nay, nhung frontend nen giu auth architecture du linh hoat de mo rong.

## 4. Nguyen tac frontend can ap dung

### 4.1. Xem auth nhu mot state machine

Khong nen chi dung `isLoggedIn`. Frontend can quan ly it nhat cac state sau:

- `unauthenticated`
- `authenticating`
- `authenticated`
- `otp_required`
- `mfa_required`
- `verification_required`
- `reauth_required`
- `session_expired`
- `logout_in_progress`
- `account_locked`
- `suspended`

### 4.2. Phan biet ro 3 flow de tranh lam sai UX

- `OTP login`: OTP la phuong thuc dang nhap chinh.
- `MFA/2FA`: OTP chi la buoc thu hai sau login.
- `Re-authentication`: user da dang nhap roi, nhung can xac thuc lai cho thao tac nhay cam.

### 4.3. Frontend xu ly theo `status/code`, khong xu ly theo raw message

Frontend nen map response backend thanh cac state noi bo on dinh.

### 4.4. Logout khong chi la xoa token local

Can tinh den:

- Session local trong app.
- Session backend/auth server.
- Session cua social provider/SSO neu co.

## 5. Auth state de frontend quan ly

Frontend nen co mot auth store trung tam, toi thieu gom:

- `accessToken`
- `currentUser`
- `authInitialized`
- `isRefreshing`
- `isAuthenticated`
- `authStep`
- `pendingChallenge`
- `returnUrl`

Goi y y nghia:

- `accessToken`: token hien tai neu dung token-based auth.
- `currentUser`: thong tin user da duoc nap tu backend.
- `authInitialized`: app da bootstrap xong auth state luc khoi dong.
- `isRefreshing`: dang refresh session.
- `isAuthenticated`: da co session hop le.
- `authStep`: buoc hien tai cua auth flow, vi du `login`, `otp`, `mfa`, `reauth`.
- `pendingChallenge`: thong tin tam de verify OTP/MFA.
- `returnUrl`: URL can quay lai sau login.

## 6. Quy trinh login thong thuong bang password

### 6.1. Man hinh login can co

- Input `identifier`.
- Input `password`.
- Nut `Dang nhap`.
- Link `Quen mat khau`.
- Toggle `Hien/An mat khau`.
- Social login neu co.
- Link `Dang ky` neu la public product.
- Tuy chon `Ghi nho dang nhap` neu backend ho tro.

### 6.2. User flow

1. User mo trang login.
2. User nhap `identifier` va `password`.
3. Frontend validate co ban:
   - Khong de trong.
   - Email/phone dung format neu co validate.
4. Frontend goi API login.
5. Backend tra mot trong cac ket qua ben duoi.

### 6.3. Cac ket qua co the xay ra

#### A. Login thanh cong

Backend tra session hop le.

Frontend can:

1. Luu auth state.
2. Nap `currentUser` neu can.
3. Redirect theo `returnUrl` hoac route mac dinh.

#### B. Can MFA

Backend tra `MFA_REQUIRED`.

Frontend can:

1. Luu `challengeId`.
2. Chuyen sang man hinh `MFA`.
3. Hien danh sach factor neu backend tra ve.

#### C. Can verify email/phone

Backend tra `VERIFICATION_REQUIRED`.

Frontend can:

1. Chuyen sang flow verify.
2. Hien thong diep huong dan ro rang.

#### D. Sai thong tin dang nhap

Frontend hien message tong quat:

- `Thong tin dang nhap khong hop le`

Khong nen tach qua ro tung truong hop neu backend muon tranh user enumeration.

#### E. Bi gioi han thu dang nhap

Frontend hien:

- `Ban da thu qua nhieu lan. Vui long thu lai sau.`

Neu backend tra ve thoi gian khoa tam, frontend nen hien countdown neu co.

### 6.4. Quy trinh ky thuat frontend

1. Submit form.
2. Disable nut submit trong luc loading.
3. Xu ly response theo `status/code`.
4. Thanh cong thi bootstrap current user.
5. That bai thi hien error theo quy uoc chung.

## 7. Quy trinh login bang OTP

### 7.1. Khi nao nen dung

Phu hop voi:

- Ecommerce can giam friction.
- Product user hay quen mat khau.
- Mobile-first flow.

### 7.2. User flow

1. User chon `Dang nhap bang OTP`.
2. Nhap `email` hoac `phone`.
3. Frontend goi API gui OTP.
4. Neu gui thanh cong, frontend chuyen sang man hinh nhap OTP.
5. User nhap OTP.
6. Frontend goi API verify OTP.
7. Neu verify thanh cong thi tao session va redirect.

### 7.3. Man hinh nhap OTP nen co

- 6 o OTP hoac 1 input co auto format.
- Ho tro paste toan bo ma.
- Countdown `gui lai ma`.
- Nut `Gui lai ma`.
- Nut `Doi email/so dien thoai`.
- Hien thong tin da mask, vi du `09******67` hoac `u***@mail.com`.

### 7.4. Ket qua xu ly

#### A. Verify thanh cong

Frontend:

1. Luu auth state.
2. Nap current user.
3. Redirect vao he thong.

#### B. OTP sai hoac het han

Frontend hien:

- `Ma xac thuc khong dung hoac da het han`

#### C. Qua so lan thu cho phep

Frontend:

1. Khoa form tam thoi neu backend yeu cau.
2. Buoc user gui lai OTP moi.

### 7.5. Luu y UX

- Tu dong focus o tiep theo khi nhap OTP.
- Ho tro backspace lui o truoc.
- Hien loading ro rang khi verify.
- Khong cho spam nut resend.

## 8. Quy trinh login co MFA/2FA

### 8.1. Muc dich

MFA duoc dung khi:

- Tai khoan da bat 2FA.
- Dang nhap tu thiet bi moi.
- Dang nhap tu IP bat thuong.
- Co danh gia rui ro cao.

### 8.2. User flow tong quat

1. User login bang password hoac social login.
2. Backend tra `MFA_REQUIRED`.
3. Frontend mo man hinh xac thuc bo sung.
4. User chon hoac duoc yeu cau dung mot factor.
5. User nhap ma hoac approve challenge.
6. Verify thanh cong thi hoan tat login.

### 8.3. Cac factor co the ho tro

- `TOTP` tu app Authenticator.
- `SMS OTP`.
- `Email OTP`.
- `Push notification`.
- `Recovery code`.
- `WebAuthn/Passkey` neu co.

### 8.4. Yeu cau frontend

Frontend can:

1. Hien danh sach factor neu backend tra ve nhieu factor.
2. Luu `challengeId` trong state tam.
3. Cho phep user dung factor khac neu factor hien tai khong kha dung.
4. Ho tro `recovery code` lam fallback.
5. Ho tro tuy chon `Tin cay thiet bi nay` neu product can.

### 8.5. Xu ly ket qua

#### A. Verify MFA thanh cong

Frontend:

1. Hoan tat tao session.
2. Nap current user.
3. Redirect vao he thong.

#### B. Verify MFA that bai

Frontend hien:

- `Ma xac thuc khong hop le`

Neu con factor khac thi cho user doi factor.

## 9. Re-authentication cho thao tac nhay cam

### 9.1. Khi nao can re-auth

Can ho tro xac thuc lai khi user dang dang nhap nhung thuc hien thao tac nhay cam, vi du:

- Doi mat khau.
- Doi email.
- Them/sua thong tin thanh toan.
- Xoa tai khoan.
- Dat hang gia tri cao neu business yeu cau.

### 9.2. User flow

1. User dang dang nhap va bam thao tac nhay cam.
2. Backend hoac frontend xac dinh can `reauth`.
3. Frontend mo modal hoac route `reauth`.
4. User nhap lai password hoac OTP/MFA.
5. Verify thanh cong thi cho phep tiep tuc thao tac truoc do.

### 9.3. Luu y

- `reauth` khong phai logout/login lai toan bo.
- Sau khi verify thanh cong, frontend quay lai dung context truoc do.

## 10. Quy trinh logout

### 10.1. Logout co ban

Khi user bam `Dang xuat`, frontend can:

1. Goi API logout neu backend co session server-side hoac refresh cookie.
2. Xoa access token va auth state local.
3. Xoa current user va user-specific cache.
4. Redirect ve trang `login` hoac trang public.

### 10.2. Neu backend dung `HttpOnly cookie`

Frontend khong tu xoa cookie duoc. Vi vay can:

1. Goi endpoint `logout`.
2. De backend revoke/invalidate session va clear cookie.
3. Sau do frontend moi clear local state.

### 10.3. Logout current device va all devices

Frontend nen ho tro tach ro:

- `Logout current device`.
- `Logout all devices`.

#### Logout current device

- Huy session hien tai.

#### Logout all devices

- Backend revoke tat ca session/refresh token.
- Cac thiet bi khac bi out o request tiep theo hoac real-time event neu co.

### 10.4. Logout voi social login/SSO

Can phan biet:

- `App logout`: chi logout khoi ung dung hien tai.
- `Federated logout`: co gang logout luon khoi provider.

Mac dinh frontend nen uu tien `app logout`, chi dung `federated logout` neu business yeu cau ro.

### 10.5. Hanh vi sau logout

Frontend can:

1. Dieu huong ve login hoac landing page.
2. Hien thong diep `Ban da dang xuat` neu can.
3. Dam bao route guard chan truy cap lai protected route.
4. Khong de stale data cua user cu hien tren UI.

## 11. Session expired va auto logout

### 11.1. Khi access token het han

Neu he thong co refresh flow:

1. Interceptor phat hien `401`.
2. Goi API refresh.
3. Neu refresh thanh cong thi retry request goc.
4. Neu refresh that bai thi clear session va dua ve login.

### 11.2. Khi session het han hoan toan

Frontend can:

1. Clear auth state.
2. Chuyen sang `session_expired`.
3. Dieu huong ve login.
4. Hien thong diep `Phien dang nhap da het han, vui long dang nhap lai`.

### 11.3. Idle timeout

Neu product co yeu cau idle timeout, frontend nen:

1. Theo doi user inactivity.
2. Hien canh bao truoc khi session het han.
3. Cho user chon `Tiep tuc phien` neu backend ho tro.
4. Neu khong, logout tu dong.

## 12. Man hinh va route frontend nen co

Toi thieu nen co cac route/man hinh sau:

- `/auth/login`
- `/auth/login-otp`
- `/auth/verify-otp`
- `/auth/mfa`
- `/auth/forgot-password`
- `/auth/reset-password`
- `/auth/verify-contact`
- `/auth/reauth`
- `/auth/session-expired`

Neu dung modal thay vi route rieng thi van nen giu state mapping tuong duong.

## 13. API contract de frontend va backend chot chung

Frontend se de trien khai nhat neu backend tra cac trang thai ro rang.

### 13.1. Login thong thuong

Request goi y:

```json
{
  "identifier": "user@example.com",
  "password": "******",
  "rememberMe": true
}
```

Response thanh cong:

```json
{
  "status": "SUCCESS",
  "accessToken": "jwt-token",
  "user": {
    "id": "u1",
    "name": "User A",
    "roles": ["CUSTOMER"]
  }
}
```

Response can MFA:

```json
{
  "status": "MFA_REQUIRED",
  "challengeId": "mfa_123",
  "availableFactors": ["totp", "sms", "email"]
}
```

Response can verify account:

```json
{
  "status": "VERIFICATION_REQUIRED",
  "channel": "email"
}
```

Response loi:

```json
{
  "status": "ERROR",
  "code": "INVALID_CREDENTIALS",
  "message": "Thong tin dang nhap khong hop le"
}
```

### 13.2. Gui OTP dang nhap

Request:

```json
{
  "identifier": "0901234567",
  "channel": "sms",
  "purpose": "login"
}
```

Response:

```json
{
  "status": "OTP_REQUIRED",
  "challengeId": "otp_123",
  "maskedDestination": "09******67",
  "expiresIn": 300,
  "resendAfter": 30
}
```

### 13.3. Verify OTP

Request:

```json
{
  "challengeId": "otp_123",
  "identifier": "0901234567",
  "otp": "123456"
}
```

Response thanh cong:

```json
{
  "status": "SUCCESS",
  "accessToken": "jwt-token"
}
```

### 13.4. Logout

Request:

```json
{
  "scope": "CURRENT_DEVICE"
}
```

Hoac:

```json
{
  "scope": "ALL_DEVICES"
}
```

Response:

```json
{
  "status": "SUCCESS"
}
```

## 14. Quy uoc xu ly loi tren frontend

Frontend nen chuan hoa message theo nhom, khong hien raw error tu backend neu khong can thiet.

### 14.1. Nhom loi de xuat

- `INVALID_CREDENTIALS`: `Thong tin dang nhap khong hop le`
- `OTP_INVALID`: `Ma xac thuc khong dung hoac da het han`
- `MFA_INVALID`: `Ma xac thuc khong hop le`
- `RATE_LIMITED`: `Ban da thu qua nhieu lan. Vui long thu lai sau`
- `ACCOUNT_LOCKED`: `Tai khoan tam thoi bi khoa`
- `ACCOUNT_SUSPENDED`: `Tai khoan hien khong kha dung`
- `SESSION_EXPIRED`: `Phien dang nhap da het han, vui long dang nhap lai`
- `NETWORK_ERROR`: `Khong the ket noi toi he thong. Vui long thu lai`
- `UNKNOWN_ERROR`: `Da co loi xay ra. Vui long thu lai sau`

### 14.2. Nguyen tac hien thi loi

- Loi dang nhap hien gan form.
- Loi OTP/MFA hien ngay tai man hinh verify.
- Loi session expired nen co redirect ro rang.
- Khong hien qua nhieu thong tin co the gay user enumeration.

## 15. UX checklist de frontend ap dung

### 15.1. Login password

- Cho phep paste vao password field.
- Co `show/hide password`.
- `Enter` de submit.
- Disable submit khi dang loading.
- Focus vao field loi dau tien.
- Tuong thich password manager.

### 15.2. OTP

- Ho tro paste full OTP.
- Auto move giua cac o.
- Co resend countdown.
- Co nut doi lai identifier.
- Hien destination da duoc mask.

### 15.3. MFA

- Hien ro factor dang duoc dung.
- Co fallback factor neu co.
- Co recovery code neu product ho tro.
- Co option `Tin cay thiet bi nay` neu co.

### 15.4. Logout

- Logout phai ro rang va nhanh.
- Sau logout phai clear user cache.
- Khong hien du lieu user cu khi chua bootstrap xong session moi.

## 16. Bao mat frontend can luu y

### 16.1. Khong phu thuoc vao local state de xac dinh truy cap

Can ket hop:

- Route guard.
- HTTP interceptor.
- Bootstrap auth luc app khoi dong.

### 16.2. Khong de lo thong tin tai khoan qua thong bao loi

Mac dinh nen uu tien generic message.

### 16.3. Khong cho resend OTP vo han

Frontend phai ton trong `resendAfter` va `max attempts` tu backend.

### 16.4. Clear du lieu nhay cam khi logout

Can xoa:

- `currentUser`
- cart private neu co rang buoc user
- permission cache
- query cache gan voi user
- du lieu tam OTP/MFA

## 17. Mapping de xuat voi auth flow hien tai cua repo

Theo tai lieu hien co trong repo:

- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/sendotp`
- `POST /auth/sendotpregister`
- `POST /auth/verifyotp`

Frontend hien tai da co cac thanh phan nen tan dung:

- `AuthService`
- `SessionService`
- `CurrentUserService`
- `AuthStore`
- `AppInitService`
- `auth-token.interceptor.ts`
- `refresh-token.interceptor.ts`

De ap dung tai lieu nay vao repo hien tai, frontend nen:

1. Bo sung `authStep` va `pendingChallenge` trong `AuthStore` neu chua co.
2. Chuan hoa response mapping trong `AuthService` thanh cac `status/code` noi bo.
3. Tach ro flow `login password`, `login OTP`, `verify OTP`, `MFA`, `logout`.
4. Dam bao `refresh-token interceptor` clear dung stale state khi refresh that bai.
5. Dinh nghia route ro rang cho OTP, session expired, va re-auth.

## 18. Danh sach cau hoi can chot voi backend/Product truoc khi code

1. `identifier` la email, phone, username hay ca 3?
2. OTP la login chinh hay chi dung cho verify/register?
3. Co MFA khong? Neu co thi factor nao duoc ho tro?
4. Co social login/SSO khong?
5. Session dung JWT + refresh cookie hay thuong mai khac?
6. Access token timeout bao lau?
7. Refresh token timeout bao lau?
8. Co idle timeout khong?
9. Co `logout all devices` khong?
10. Co `trust this device` khong?
11. Khi nao can `reauth`?
12. OTP song trong bao lau?
13. Bao lau moi duoc resend OTP?
14. Toi da bao nhieu lan nhap sai OTP?
15. Loi auth backend tra theo `status/code` nao?

## 19. Ban tom tat de frontend co the apply ngay

Frontend co the bat dau implementation theo thu tu sau:

1. Xay dung auth store co `authInitialized`, `isAuthenticated`, `authStep`, `pendingChallenge`, `currentUser`.
2. Chuan hoa `AuthService` tra ve cac state `SUCCESS`, `OTP_REQUIRED`, `MFA_REQUIRED`, `VERIFICATION_REQUIRED`, `ERROR`.
3. Hoan thien `login page` cho password login.
4. Them `verify OTP page` va resend flow.
5. Them `MFA page` neu backend ho tro.
6. Hoan thien `logout flow` gom clear local state + goi backend logout.
7. Hoan thien `refresh/session expired flow` trong interceptor.
8. Them `reauth flow` cho thao tac nhay cam neu product can.

Neu can chon phien ban trien khai toi thieu cho giai doan 1, nen lam truoc:

1. Login password.
2. Refresh token.
3. Logout.
4. Session expired.
5. OTP verify neu backend da co san.
