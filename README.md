# LEXI Dashboard (dbd)

운영용 **Admin · Studio · HQ 소싱 · Mobbin** 대시보드.  
고객 몰은 [lexistyle](https://github.com/shinkang888-code/lexistyle) — 몰의 `/admin`·`/studio`가 이 앱으로 리다이렉트됩니다.

분리 명세: [`docs/dashboard-split.md`](docs/dashboard-split.md) · Cafe24 Studio: [`docs/lexi-cafe24-studio-master-spec.md`](docs/lexi-cafe24-studio-master-spec.md)

## 역할

| 이 앱 (대시보드) | 몰 (lexistyle) |
|------------------|----------------|
| Studio 디자인·PDP 승인·Cafe24 게시 | 스토어프론트 · 결제 preview |
| HQ 소싱 (CJ/Superbuy/Alibaba/Temu/Cafe24-mall) | wishlist · reviews · 모바일 UX |
| Mobbin 정리 · Dummy/Real | |

Cafe24 = 상품·주문·결제 SSOT. 스토어프론트 라우트는 **preview 폴백**으로만 유지.

## Stack
Next.js 15 (App Router) · Tailwind CSS v4 · Neon PostgreSQL (Drizzle) · Vercel

## Quick Start
```bash
cp .env.example .env
# NEXT_PUBLIC_MALL_URL=http://localhost:3000
npm install
npm run dev            # http://localhost:3000 또는 3001
npm run smoke:studio   # Studio 경로 스모크
```

몰과 **동일 Neon** `DATABASE_URL` / `ADMIN_EMAILS`를 쓰세요. 운영자 로그인은 **이 앱**에서.

## Neon DB 연결 (선택)
```bash
npm run db:push
npm run seed:dummy
npm run seed:studio
```

## Deploy
```bash
npm run deploy         # vercel --prod (dbd 별칭)
```
