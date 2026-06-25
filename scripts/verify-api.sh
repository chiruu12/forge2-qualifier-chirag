#!/usr/bin/env bash
# Quick health check for the Laravel API (local or ngrok).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=ports.sh
source "$ROOT/scripts/ports.sh"

API="${1:-$LARAVEL_API_URL}"

echo "Checking $API/boards ..."
HTTP=$(curl -s -o /tmp/forge2-boards.json -w "%{http_code}" "$API/boards" || true)

if [ "$HTTP" = "200" ]; then
  echo "OK ($HTTP) — boards returned:"
  head -c 500 /tmp/forge2-boards.json
  echo ""
  echo ""
  echo "Live app should NOT show the demo banner when VITE_API_URL points here."
  exit 0
fi

echo "FAIL (HTTP $HTTP) — frontend will fall back to browser demo mode."
echo "Start API: ./scripts/start-live-demo.sh  (default port $LARAVEL_PORT)"
exit 1
