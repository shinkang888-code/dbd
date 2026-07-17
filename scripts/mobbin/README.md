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

`/studio/mobbin` 에서 이름변경·병합·앱 수동 재분류 → 계획(dry-run)이 즉시 갱신 →
**계획 기록(Apply)** 버튼으로 스냅샷 기록.

## 4) Apply (컬렉션 생성 + 배치)

```bash
DASHBOARD_URL=https://dbd0.vercel.app MOBBIN_SYNC_TOKEN=xxx \
  npx tsx scripts/mobbin/apply.ts        # 컬렉션 생성까지
```

### ⚠️ RECON 남은 1건 — "앱을 컬렉션에 배치"하는 UI 경로

실측 결과 앱 상세의 `...` 메뉴에는 **Add to collection이 없었습니다**
(Visit / Request update / Download all screens / Copy link 만 존재).
배치 경로는 Saved 페이지의 이동·드래그 또는 `Saved` 버튼 드롭다운일 가능성이 큽니다.
로그인 세션에서 그 경로를 확정한 뒤 `apply.ts`의 `assignToCollection()`을 채우고
`--assign` 으로 실행하세요. 그 전까지 `apply.ts`는 **컬렉션 생성까지만** 반영합니다.
