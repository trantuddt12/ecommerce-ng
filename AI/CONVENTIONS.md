# AI Conventions

## Muc dich

File nay quy dinh cach dung cac thu muc lien quan den AI trong repo de tranh nham lan va giam trung lap.

## Phan vai chinh

- `AI/`: Tai lieu noi bo cua du an.
- `AI/workflows/`: Workflow noi bo cho cac bai toan lap lai trong project nay.
- `.agents/skills/`: Skill cai bang `skills` CLI de agent nap truc tiep.

## Khi nao dung `AI/`

- Khi can mo ta kien truc, convention, prompt, huong dan lam viec.
- Khi can luu workflow dac thu gan voi codebase nay.
- Khi tai lieu do can duoc chinh sua cung repo va review nhu tai lieu du an.

## Khi nao dung `.agents/skills/`

- Khi cai skill tu nguon ben ngoai bang `npx skills add ...`.
- Khi muon agent co them nang luc dung lai duoc qua co che skill.
- Khong dat tai lieu noi bo, ghi chu team, hay quy trinh rieng cua repo vao day.

## Nguyen tac dat noi dung moi

- Them `references/` neu thong tin giai thich kien truc hoac business flow.
- Them `instructions/` neu thong tin la coding rules hoac process chung.
- Them `prompts/` neu can prompt mau dung lai.
- Them `workflows/` neu la quy trinh thao tac theo tinh huong cu the.
- Dung `.agents/skills/` chi cho skill duoc cai va quan ly boi CLI.

## Nguyen tac toi uu

- Khong tao thu muc `AI/skills/` nua de tranh trung nghia voi `.agents/skills/`.
- Neu mot noi dung chi phuc vu repo nay, uu tien dat trong `AI/`.
- Neu muon cai nang luc tu ben ngoai, dung `skills` CLI de dua vao `.agents/skills/`.
