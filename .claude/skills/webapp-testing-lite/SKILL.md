---
name: webapp-testing-lite
description: Minimal port of anthropics webapp-testing — smoke-test key routes after changes. Use before reporting route/API changes done, or when the user asks 스모크/동작 확인. Also wraps the repo's own npm run smoke:studio.
---

Run and report output verbatim:

```bash
bash ${CLAUDE_SKILL_DIR}/smoke.sh                       # build + probe /, /admin, /studio
BASE_URL=https://dbd0.vercel.app bash ${CLAUDE_SKILL_DIR}/smoke.sh   # probe live instead
npm run smoke:studio                                     # repo's own deeper Studio smoke
```

No `/api/health` route exists in this repo — don't assume one; check `src/app/api/*`
before adding a route to the probe list.

Fix failures and re-run until green. For interactive flows use Playwright
(`/opt/pw-browsers/chromium`) — drive the page and screenshot instead of assuming.
