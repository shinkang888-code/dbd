# Hybrid Distributed Ledger (HDL) — dbd

LawyGo의 하이브리드 분산 원장을 **dbd**에 이식한 모듈입니다.

## 공식 주소

| 환경 | URL |
|------|-----|
| 배포 | https://dbd-beta.vercel.app |
| Admin 원장 | https://dbd-beta.vercel.app/admin/ledger |
| 로컬 | http://localhost:3001/admin/ledger |

몰(lexistyle) `.env`:

```
NEXT_PUBLIC_DASHBOARD_URL=https://dbd-beta.vercel.app
```

## 파이프라인

1. **Enqueue** — 게시·발주·구매요청·정산 이벤트 → `ledger_transactions` (pending)
2. **Chain worker** — `H_i = Hash(H_{i-1}|Trans_Data|H_v)` 로 체인
3. **Block worker** — Merkle root 블록 생성
4. **Anchor worker** — 외부 타임스탬프(기본 `dbd_timestamp_v1`, 옵션 OpenTimestamps)
5. **Integrity scan** — 체인·Merkle·앵커 재검증

코드: `src/lib/ledger/*` · UI: `/admin/ledger` · Cron: `/api/cron/ledger-worker` (15분)

## 환경 변수

```
LEDGER_ENABLED=true
LEDGER_TENANT_ID=dbd
LEDGER_BLOCK_TX_THRESHOLD=50
LEDGER_ANCHOR_PROVIDER=dbd_timestamp_v1
```

스키마 반영: `npm run db:push`

## 향후 (DLT / Polygon)

`contracts/LedgerAnchor.sol` — Merkle root 온체인 앵커 옵션. `LEDGER_ANCHOR_PROVIDER=polygon` 연동은 Phase 2.
