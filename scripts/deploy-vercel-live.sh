#!/usr/bin/env bash
# Point Vercel frontend at the current ngrok tunnel and redeploy.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FRONTEND="$ROOT/frontend"
# shellcheck source=ports.sh
source "$ROOT/scripts/ports.sh"

NGROK_URL=""
if curl -sf http://127.0.0.1:4040/api/tunnels >/dev/null 2>&1; then
  NGROK_URL=$(python3 - <<'PY'
import json, urllib.request
d = json.load(urllib.request.urlopen("http://127.0.0.1:4040/api/tunnels"))
tunnels = d.get("tunnels", [])
https = next((t["public_url"] for t in tunnels if t.get("public_url", "").startswith("https://")), "")
print(https)
PY
)
fi

if [ -z "$NGROK_URL" ]; then
  echo "ERROR: ngrok not running. Start: ngrok http $LARAVEL_PORT"
  exit 1
fi

API_URL="${NGROK_URL%/}/api"
echo "==> ngrok API: $API_URL"

echo "==> Verifying API through ngrok..."
"$ROOT/scripts/verify-api.sh" "$API_URL"

echo "==> Setting Vercel env VITE_API_URL (production)..."
cd "$FRONTEND"
printf '%s' "$API_URL" | vercel env add VITE_API_URL production --force 2>/dev/null \
  || printf '%s' "$API_URL" | vercel env add VITE_API_URL production

echo "==> Deploying to Vercel (production)..."
vercel --prod --yes

echo ""
echo "Done. Open your Vercel URL — expect green 'Live API connected' banner."
echo "Keep Laravel + ngrok running while judges review."
