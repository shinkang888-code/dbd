# LEXI HQ 대시보드 IA (PieChain 셸 · ec2ad3c 복원)

> 관리자 전용 커맨드 센터. 진입 `/hq`, 셸 `HqAppShell`(좌측 사이드바 + Topbar).

## 사이드바

| 섹션 | 경로 |
|------|------|
| 파이프라인 홈 | `/hq` |
| 카탈로그 · Import | `/hq/pipeline/catalog` |
| PDP · 초안승인 | `/hq/pipeline/pdp` |
| Export · 리스팅 | `/hq/pipeline/export` |
| 공급처 | `/hq/suppliers` |
| 컬렉션 | `/hq/collections` |
| 채널·Cafe24 | `/hq/channels` |
| 구매요청 / 소싱발주 / 정산 | `/hq/purchase-requests` 등 |
| 상품·주문·배너 | `/hq/products` → admin 원장 |
| Studio | `/studio` |
| 시스템 | `/hq/system` |

## 홈 KPI

Crawl → Import → PDP → Review → Export · `GET /api/hq/overview`

## 리다이렉트 (레거시 AdminShell 제거)

- `/admin` → `/hq`
- `/admin/sourcing` → `/hq/suppliers`
- `/admin/products` → `/hq/products`
- `/admin/orders` → `/hq/orders`
- `/admin/banners` → `/hq/banners`
- `/admin/cafe24` → `/hq/channels`

운영 UI 셸은 **HqAppShell만** 사용. AdminShell 삭제됨.
