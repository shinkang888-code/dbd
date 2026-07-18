# Mobbin 정리 로컬 어댑터

Vercel(대시보드)은 **데이터·카테고리 에디터·계획(dry-run)**을 담당하고,
mobbin 로그인 세션이 필요한 **읽기/반영**은 이 로컬 어댑터가 담당합니다.

> 원칙: 유료 이미지/콘텐츠는 내려받지 않습니다. 앱 **링크·네이티브 카테고리·메타**만 다룹니다.
> `Download all screens`(mobbin 공식 버튼)는 자동화하지 않습니다.

## 준비

```bash
npm i -D playwright tsx
npx playwright install chromium
```

환경변수:

| 변수 | 설명 |
|---|---|
| `DASHBOARD_URL` | 대시보드 주소 (예: `https://dbd0.vercel.app`) |
| `MOBBIN_SYNC_TOKEN` | 어댑터 인증 토큰. 대시보드 배포 env에 동일 값 설정(없으면 `HQ_API_TOKEN` 재사용) |
| `MOBBIN_STATE` | (선택) 세션 파일 경로. 기본 `.mobbin-session.json` |

## 1) 로그인 (세션만 저장, 비밀번호 저장 안 함)

```bash
npx tsx scripts/mobbin/login.ts
# 브라우저에서 직접 로그인 → 터미널 Enter → .mobbin-session.json 저장
```

## 2) Sync (저장 앱 → 대시보드)

```bash
DASHBOARD_URL=https://dbd0.vercel.app MOBBIN_SYNC_TOKEN=xxx \
  npx tsx scripts/mobbin/sync.ts
```

앱 페이지에서 이름·**네이티브 카테고리**·플랫폼·screen수를 읽어 대시보드로 upsert 합니다.
페이지 방문 사이 1.5~4초 지연(단일 세션 직렬)으로 정상 사용자 범위를 지킵니다.

## 3) 대시보드에서 카테고리 편집

`/studio/mobbin` 에서 이름변경·병합·앱 수동 재분류 → 카테고리별 앱 인덱스가 즉시 갱신 →
**인덱스 스냅샷 저장** 버튼으로 감사 로그 기록. 여기가 "카테고리별로 내 앱 훑기"의 기본 화면입니다.

## 4) 인덱스 확인 / 선택적 큐레이션

**기본은 읽기 전용입니다 — mobbin에 아무것도 쓰지 않습니다.**

```bash
DASHBOARD_URL=https://dbd0.vercel.app MOBBIN_SYNC_TOKEN=xxx \
  npx tsx scripts/mobbin/apply.ts          # 카테고리별 앱 인덱스 출력
```

원할 때만, 앱 1개 단위로 명시적 큐레이션:

```bash
... npx tsx scripts/mobbin/apply.ts --app <appKey> --collection "AI" --limit 10
```

> 설계(B안): **앱→카테고리 분류는 dbd 대시보드가 소유**하고, mobbin 컬렉션은
> 직접 고른 스크린만 담는 공간으로 둡니다. 대량 자동 배치는 하지 않습니다.

### ✅ RECON 완료 — 확정된 배치 경로

로그인 세션 실측으로 확정했습니다:

1. **mobbin 컬렉션의 단위는 "앱"이 아니라 "스크린"** 입니다.
2. 스크린 카드에 **hover** → 좌상단에 **원형 체크박스** 등장 → **네이티브 다중선택 지원**.
3. 선택하면 하단에 일괄바: `N selected | Clear | ⬇ | Copy | Save`.
4. `Save` 는 `aria-haspopup="dialog"` — 즉시 저장이 아니라 **다이얼로그**를 엽니다.
5. 다이얼로그 구성: **`All saved`** / **`Add to collection`** → **`Create collection`** + 기존 컬렉션 목록.

> 앱 상세의 `...` 메뉴에는 Add to collection이 없습니다(Visit / Request update /
> Download all screens / Copy link 만 존재) — 배치는 위 일괄바 경로가 정답입니다.

⚠️ 앱당 스크린이 수백 개(Instagram 666, Lovable 339)라 전량 배치는 과합니다.
`SCREEN_LIMIT`(기본 10)으로 앱당 담을 개수를 반드시 제한하세요.
