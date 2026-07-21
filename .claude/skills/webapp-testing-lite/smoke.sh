#!/usr/bin/env bash
# Smoke: probe key routes for 200. With BASE_URL set, probes that host;
# otherwise builds and serves `next start` locally.
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"
ROUTES=(/ /admin /studio)
fail=0
started=""

if [ -z "${BASE_URL:-}" ]; then
  npm run build >/tmp/dbd-smoke-build.log 2>&1 || { echo "FAIL  build (tail below)"; tail -15 /tmp/dbd-smoke-build.log; exit 1; }
  echo "PASS  build"
  npm run start >/tmp/dbd-smoke-start.log 2>&1 &
  started=$!
  BASE_URL="http://localhost:3001"
  for _ in $(seq 1 30); do
    curl -sf -o /dev/null "$BASE_URL/" && break
    sleep 1
  done
fi

for p in "${ROUTES[@]}"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$p")
  # /admin, /studio may redirect to auth (30x) when logged out — treat as reachable
  case "$code" in 200|30[0-9]) echo "PASS  GET $p ($code)";; *) fail=1; echo "FAIL  GET $p ($code)";; esac
done

[ -n "$started" ] && kill "$started" 2>/dev/null
exit $fail
