# dbd — 프로젝트 지침

LEXI 운영용 **Admin · Studio · HQ 소싱 · Mobbin** 대시보드. 고객 몰(스토어프론트)은
별도 리포 [`lexistyle`](https://github.com/shinkang888-code/lexistyle) — 몰의
`/admin`·`/studio`는 이 앱으로 리다이렉트된다. 분리 명세: `docs/dashboard-split.md`.

## 스택
- Next.js 15(App Router) + Tailwind CSS v4 + Neon PostgreSQL(Drizzle ORM) + Vercel.
- TypeScript. **몰(lexistyle)과 동일 Neon `DATABASE_URL` / `ADMIN_EMAILS` / Neon Auth**를
  공유 — 한쪽만 바꾸면 로그인/데이터가 깨진다.
- 로컬 이중 운용: `DB_DRIVER=pg`면 `DATABASE_URL_LOCAL`(로컬 Postgres), 기본은 Neon.
- Cafe24 = 상품·재고·주문·결제 SSOT. 이 앱의 Studio는 디자인/PDP 콘텐츠 제작·승인·
  Cafe24 게시만 담당 — 커머스 로직을 이 앱에 직접 구현하지 말 것.

## 리포 구조
| 경로 | 설명 |
|------|------|
| `src/app/admin`, `src/app/studio`, `src/app/hq` | 운영 콘솔 라우트 |
| `src/app/api/admin`, `/studio`, `/hq`, `/cafe24`, `/cron` | 서버 API |
| `src/app/{product,category,cart,...}` | **preview 폴백만** — 실고객 트래픽은 lexistyle로 |
| `src/lib/ops`, `/auth`, `/channels` | 운영 로직·인증·채널 연동 |
| `docs/` | 스펙 문서(dashboard-split, hybrid-ledger, cafe24 등) — 변경 전 필독 |
| `scripts/` | seed(dummy/studio)·smoke-studio·mobbin·deploy |

## 명령어
개발 `npm run dev`(:3001) · 빌드 `npm run build` · 스키마 `npm run db:push`(drizzle-kit) ·
스모크 `npm run smoke:studio` · 배포 `npm run deploy`(`vercel --prod`).

## 원칙
- 이 리포와 `lexistyle`은 같은 Neon DB를 공유하는 짝 — 스키마/env 변경 시 양쪽 영향을
  같이 확인한다.
- 요청 없는 대규모 리팩터링 금지.
- 검증 없이 "완료" 보고 금지 — 빌드/`smoke:studio` 결과를 함께 제시.
- 로컬 절대경로를 문서/코드에 남기지 말 것.
