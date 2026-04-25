# Change Workflow

## Muc tieu

Quy trinh thuc thi thay doi code trong repo nay theo cach it rui ro nhat.

## Quy trinh

1. Doc code lien quan truoc khi sua.
2. Xac dinh feature nam o domain nao.
3. Tim route, service, state, model, va layout dang lien quan.
4. Chon cach sua nho nhat dung voi convention hien tai.
5. Sua code.
6. Kiem tra lai import, route, endpoint, va luong auth.
7. Neu thay doi code, build hoac test phan bi anh huong neu co the.
8. Neu chi sua tai lieu (`AI/`, `doc/`, `README.md`, `*.md`) va khong doi code/cau hinh runtime, khong can chay build/test code; chi can verify bang doc review hoac diff.
9. Ghi vao workspace root `AI_PROGRESS/YYYY-MM-DD.md` cac file da sua, tom tat thay doi, ket qua verify, va todo tiep theo.
10. Giu workspace root `AI_PROGRESS.md` lam file muc luc/huong dan; chi sua file nay khi doi cau truc logging.
11. Cap nhat tai lieu `AI/` neu thay doi lam doi quy tac hoac kien truc.

## Quy tac nhat ky tien trinh

- Sau moi lan thay doi code, append mot muc moi vao cuoi file workspace root `AI_PROGRESS/YYYY-MM-DD.md` cua ngay hien tai.
- Sau moi lan thay doi chi lien quan tai lieu, append muc tien trinh neu co file progress theo ngay; verification ghi `doc review/diff`, khong ghi da build/test code.
- Muc ghi nhan phai co it nhat: scope, file da doi, tom tat, verification, todo tiep theo.
- Neu task lien quan ca frontend va backend, ghi ro handoff hoac dependency de ben con lai tiep tuc duoc ngay.
- Khong xoa muc cu. Neu todo da xong, danh dau trang thai trong muc moi.
- Khong append lich su chi tiet vao workspace root `AI_PROGRESS.md`; file do chi dung lam muc luc va huong dan.

## Khong nen lam

- Khong tao abstraction som.
- Khong dua them thu vien moi neu chua can.
- Khong doi ten file hang loat neu task khong bat buoc.
- Khong sua code khong lien quan chi de dep hon.

## Khi can hoi lai

- Khi yeu cau mo ho giua hai huong co tac dong hanh vi khac nhau.
- Khi thay doi dong cham den auth, session, hoac permission ma chua ro backend contract.
- Khi thay doi co the xung dot voi code dang duoc user sua song song.
