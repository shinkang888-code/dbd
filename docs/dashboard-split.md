# LEXI 몰 × 대시보드 분리

## 역할

| 앱 | 리포 | 역할 |
|----|------|------|
| **Mall** | [lexistyle](https://github.com/shinkang888-code/lexistyle) | 고객 스토어프론트 · 장바구니 · 결제 preview · 계정 |
| **Dashboard** | [dbd](https://github.com/shinkang888-code/dbd) (본 앱) | Admin · Studio · HQ 소싱 · Mobbin · Cafe24 콘텐츠 게시 |

Cafe24 = 상품·재고·주문·결제 **SSOT**.  
본 앱 Studio = 디자인·PDP 콘텐츠 제작·승인·게시.

## 연결

- 몰에서 `/admin`, `/studio` 접속 → `NEXT_PUBLIC_DASHBOARD_URL`로 리다이렉트.
- 대시보드에서 몰 미리보기 → `NEXT_PUBLIC_MALL_URL`.
- **Neon `DATABASE_URL` · `ADMIN_EMAILS` · Neon Auth는 양쪽 동일 값**을 쓴다.
- 쿠키 도메인이 다르면 운영자는 **대시보드(dbd)에서 로그인**한다.

## 로컬

```bash
# 터미널 1 — 대시보드 (기본 3000 또는 3001)
cd dbd && npm run dev

# 터미널 2 — 몰
cd lexistyle
# .env: NEXT_PUBLIC_DASHBOARD_URL=http://localhost:3001
npm run dev
```

## 본 앱 운영 경로

- `/admin`, `/admin/sourcing`
- `/studio/*` (design · creator · mobbin · cafe24 · decisions)
- `/api/admin/*`, `/api/studio/*`, `/api/hq/*`, `/api/cafe24/*`, `/api/cron/*`

스토어프론트 라우트(`/`, `/product/...`)는 **preview 폴백**으로 유지한다. 실고객 트래픽은 몰(lexistyle)로 보낸다.
