# Repo Conventions

## Naming

- Page files dung hau to `.page.ts`.
- Service files dung hau to `.service.ts`.
- Guard files dung hau to `.guard.ts`.
- Interceptor files dung hau to `.interceptor.ts`.
- Store files dung hau to `.store.ts`.

## To chuc domain

- Feature page dat theo domain kinh doanh, khong dat theo loai ky thuat.
- Thanh phan toan cuc dat trong `core`.
- Thanh phan UI dung lai dat trong `shared/ui`.

## State va side effects

- Auth state tap trung tai `AuthStore`.
- Side effects auth tap trung trong services va interceptors.
- Component page chu yeu phu trach form, user interaction, va navigation.

## Navigation

- Uu tien su dung route constant neu co navigate lap lai.
- Kiem tra route tree that, khong chi dua vao constant file.

## Styling

- Nhieu component dang dung inline template + inline styles.
- Khi sua mot component dang theo kieu nay, uu tien giu dong phong cach de thay doi toi thieu.
