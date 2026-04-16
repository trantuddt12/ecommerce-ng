# AI Workspace

Thu muc `AI/` la bo tai lieu van hanh de agent, AI assistant, va thanh vien du an co the lam viec nhat quan trong project Angular nay.

## Muc tieu

- Mo ta ro kien truc hien tai cua repo.
- Cung cap prompt mau cho cac tac vu pho bien.
- Chuan hoa cach AI doc code, sua code, review, va viet tai lieu.
- Giam viec doan mo khi mo rong tinh nang moi.

## Cau truc

- `agents/`: Dinh nghia vai tro va pham vi cua tung agent.
- `instructions/`: Huong dan thuc thi, coding rules, va quy trinh lam viec.
- `prompts/`: Prompt mau de dung lai cho cac tac vu lap lai.
- `references/`: Tai lieu tham chieu ve kien truc, routes, auth flow, conventions.
- `skills/`: Quy trinh xu ly theo nang luc chuyen biet cho cac bai toan cu the.

## Cach dung nhanh

1. Doc `references/project-overview.md` de nam toan canh.
2. Doc `instructions/angular-coding-standards.md` truoc khi sua code.
3. Chon prompt phu hop trong `prompts/`.
4. Neu tac vu dac thu, ap dung workflow trong `skills/`.
5. Neu can tach vai tro, su dung mo ta agent trong `agents/`.

## Pham vi codebase hien tai

- Angular 17 standalone app.
- Cau truc `core`, `features`, `shared`.
- Co auth, route guards, HTTP interceptors, signal store, SSR.
- Cac feature hien co: auth, dashboard, catalog, management, system.

## Nguyen tac cap nhat

- Khi kien truc thay doi, cap nhat `references/` truoc.
- Khi team doi convention, cap nhat `instructions/`.
- Khi co task lap lai moi, bo sung `prompts/` hoac `skills/`.
- Sau moi lan thay doi code hoac tai lieu, ghi nhan thay doi, kiem tra, va todo vao file chung `D:/Spring/ttl-project/AI_PROGRESS.md` de backend va frontend cung follow duoc.
