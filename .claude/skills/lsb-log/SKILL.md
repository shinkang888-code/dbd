---
name: lsb-log
description: Self-report this session's token usage to the LSB dashboard. Use at the end of a work session, after completing a major task, or when the user says "세션 기록", "토큰 기록", "usage 보고".
---

POST a usage record (tokens are estimates — say so):

```bash
curl -sS -X POST "https://lsb-shinkang888-codes-projects.vercel.app/api/usage" \
  -H 'Content-Type: application/json' -d '{
  "session_id": "<date-slug>",
  "repo": "dbd",
  "summary": "<one line>",
  "input_tokens": <estimate>,
  "output_tokens": <estimate>
}'
```

A 503 means the LSB DB is not configured — report that and stop; do not retry.
