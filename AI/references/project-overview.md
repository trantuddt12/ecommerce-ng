# Project Overview

## Tong quan

Day la project Angular 17 su dung standalone components. Codebase duoc to chuc theo huong tach phan dung chung o `core`, man hinh nghiep vu o `features`, va UI tai su dung o `shared`.

## Cau truc chinh

- `src/app/core/`
  - `constants/`: route constants, API endpoints, storage keys.
  - `guards/`: auth, guest, permission.
  - `http/`: base API abstractions va URL helpers.
  - `interceptors/`: auth token, refresh token, loading, credentials, error mapping.
  - `layout/`: `AuthLayoutComponent`, `MainLayoutComponent`, `HeaderComponent`, `SidebarComponent`.
  - `models/`: auth, user, app error.
  - `services/`: auth, session, current user, notification, health, app init.
  - `state/`: `AuthStore` dung Angular signals.
  - `tokens/`, `config/`, `utils/`: token config, types, helper utilities.
- `src/app/features/`
  - `auth/`: login, register, verify OTP.
  - `dashboard/`: dashboard page.
  - `catalog/`: brands, categories, products, attributes, search.
  - `management/`: users, roles.
  - `system/`: forbidden, not found.
- `src/app/shared/ui/`
  - `feature-shell.component.ts`
  - `global-loading.component.ts`
  - `notification-outlet.component.ts`

## Entry points

- `src/main.ts`: bootstrap client app.
- `src/main.server.ts`: bootstrap server app.
- `src/app/app.config.ts`: providers, router, hydration, interceptors, app initializer.
- `src/app/app.routes.ts`: route tree chinh.

## Tooling

- Angular CLI 17.3.x
- RxJS 7.8
- TypeScript 5.4
- Karma/Jasmine cho unit test
- Angular SSR voi Express server

## Dac diem quan trong

- App co auth flow dua tren access token + refresh API.
- Co permission guard cho route can phan quyen.
- HTTP requests di qua chuoi interceptors trong `app.config.ts`.
- Auth state duoc giu trong `AuthStore` bang `signal` va `computed`.
