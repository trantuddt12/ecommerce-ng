# Workflow: Implement Feature

## Khi nao dung

- Khi can them page moi.
- Khi can mo rong feature catalog, management, auth, hoac dashboard.
- Khi can noi UI voi service/API san co.

## Quy trinh

1. Doc `AI/references/project-overview.md`.
2. Doc route va endpoint lien quan.
3. Xac dinh feature thuoc `features/<domain>` nao.
4. Kiem tra co can route moi, permission moi, service moi hay khong.
5. Tai su dung layout, shared UI, va constants san co.
6. Sua code theo thay doi nho nhat dung.
7. Verify import, navigation, auth impact.
8. Neu co thay doi kien truc, cap nhat `AI/references/`.

## Output mong muon

- Danh sach file da sua/tao.
- Tom tat thay doi.
- Cach verify feature.

## Checkpoints dac biet

- Neu route nam sau login, phai kiem tra `authGuard`.
- Neu route co phan quyen, phai kiem tra `permissionGuard` va `data.permissions`.
- Neu co request API, phai kiem tra endpoint constant va loading/error path.
