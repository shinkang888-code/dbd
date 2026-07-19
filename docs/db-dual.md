# DB 이중 운용 (로컬 Postgres + Neon)

## 로컬 개발
```env
DATABASE_URL=postgres://dbd:dbd@localhost:5432/dbd
DB_DRIVER=pg
DATABASE_URL_LOCAL=postgres://dbd:dbd@localhost:5432/dbd
DATABASE_URL_NEON=<neon-pooled-uri>   # 참고용 / 스키마 push
```

## 프로덕션 (Vercel dbd0)
- `DATABASE_URL` = Neon **pooled** URI (`…-pooler…neon.tech`)
- `DB_DRIVER` 미설정 또는 URL에 neon 호스트 → Neon HTTP 드라이버 자동

## 스키마
```bash
# Neon에 스키마 반영
DATABASE_URL="$DATABASE_URL_NEON" npx drizzle-kit push
```

Neon 프로젝트: `dbd0` (org-wispy-brook)
