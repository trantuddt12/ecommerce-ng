# Workflow: Review Changes

## Khi nao dung

- Khi can review pull request, patch, hoac mot thay doi co nhieu file.

## Quy trinh review

1. Xac dinh pham vi file thay doi.
2. Doi chieu voi conventions trong `AI/instructions/angular-coding-standards.md`.
3. Review theo thu tu:
   - bug hanh vi
   - auth/route/permission
   - API/state/loading/error handling
   - maintainability va convention
4. Ghi finding co muc do uu tien.
5. Neu khong co finding, neu residual risks.

## Muc canh bao cao

- `app.routes.ts`
- `app.config.ts`
- `core/interceptors/*`
- `core/services/auth.service.ts`
- `core/services/app-init.service.ts`
- `core/state/auth.store.ts`

## Mau output

- Finding 1: <muc do> - <mo ta>
- File: <path>
- Ly do: <tai sao la van de>
- Tac dong: <anh huong hanh vi>
- De xuat: <huong sua ngan gon>
