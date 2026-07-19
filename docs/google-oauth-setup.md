# Google OAuth 로그인 설정 (dbd / lexistyle 공통)

관리자 Sign In은 `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`이 필요합니다.

## 1. Google Cloud Console

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 선택 또는 [새 프로젝트 만들기](https://console.cloud.google.com/projectcreate)
3. [API 및 서비스 → OAuth 동의 화면](https://console.cloud.google.com/apis/credentials/consent)  
   - User Type: **External** (개인/테스트) 또는 Internal (Workspace)  
   - 앱 이름: `LEXI Dashboard`  
   - 테스트 사용자에 **본인 Gmail** 추가 (External + Testing 상태일 때 필수)
4. [API 및 서비스 → 사용자 인증 정보](https://console.cloud.google.com/apis/credentials)  
   - **+ 사용자 인증 정보 만들기 → OAuth 클라이언트 ID**  
   - 애플리케이션 유형: **웹 애플리케이션**
5. 승인된 자바스크립트 원본:
   - `http://localhost:3001`
   - `https://dbd-beta.vercel.app`
6. 승인된 리디렉션 URI (**정확히** 아래만):
   - `http://localhost:3001/api/auth/google/callback`
   - `https://dbd-beta.vercel.app/api/auth/google/callback`
   - (선택) `https://dbd-shinkang888-codes-projects.vercel.app/api/auth/google/callback`
7. 생성 후 **클라이언트 ID / 클라이언트 보안 비밀** 복사

바로가기:
- [OAuth 클라이언트 만들기](https://console.cloud.google.com/apis/credentials/oauthclient)
- [동의 화면](https://console.cloud.google.com/apis/credentials/consent)
- [사용자 인증 정보 목록](https://console.cloud.google.com/apis/credentials)

## 2. 로컬 `.env` (dbd)

```env
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
AUTH_SECRET=긴랜덤문자열
ADMIN_EMAILS=you@gmail.com
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

`ADMIN_EMAILS`에 넣은 이메일만 관리자 API/Studio 쓰기가 허용됩니다(비어 있으면 개발 시 로그인한 전원 허용).

## 3. Vercel (dbd Production)

[Vercel → dbd → Settings → Environment Variables](https://vercel.com/shinkang888-codes-projects/dbd/settings/environment-variables) 에 동일 키 등록 후 **Redeploy**.

필수:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `AUTH_SECRET`
- `ADMIN_EMAILS`
- `NEXT_PUBLIC_APP_URL=https://dbd-beta.vercel.app`

## 4. 확인

1. `npm run dev` 재시작
2. http://localhost:3001/auth/sign-in → **Google로 로그인** 버튼 표시
3. 로그인 후 `/admin/sourcing` 또는 `/studio` 진입

몰(lexistyle)에도 동일 키를 넣을 수 있으나, 운영자 로그인은 **대시보드(dbd)** 를 사용합니다.
