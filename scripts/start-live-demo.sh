#!/usr/bin/env bash
# Start Laravel API + print ngrok instructions for live Vercel frontend.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND="$ROOT/backend"
# shellcheck source=ports.sh
source "$ROOT/scripts/ports.sh"

echo "==> Forge 2 live demo — Laravel + ngrok"
echo "    Laravel port: $LARAVEL_PORT"
echo ""

if lsof -i :"$LARAVEL_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "WARNING: port $LARAVEL_PORT is already in use."
  echo "         Stop the other process or set LARAVEL_PORT=7902 ./scripts/start-live-demo.sh"
  echo ""
fi

cd "$BACKEND"
if [ ! -f .env ]; then
  cp .env.example .env
  php artisan key:generate
fi

echo "==> Running migrations + seed..."
php artisan migrate:fresh --seed --force

echo ""
echo "==> Starting Laravel on http://0.0.0.0:$LARAVEL_PORT"
echo "    API: $LARAVEL_API_URL/boards"
echo ""
echo "==> In a SECOND terminal, run:"
echo "    ngrok http $LARAVEL_PORT"
echo ""
echo "==> Copy the https URL and set in Vercel:"
echo "    VITE_API_URL=https://<ngrok-subdomain>.ngrok-free.dev/api"
echo "    Or: ./scripts/deploy-vercel-live.sh"
echo ""
echo "==> Verify:"
echo "    ./scripts/verify-api.sh $LARAVEL_API_URL"
echo ""
echo "Keep BOTH this server and ngrok running while judges review the live URL."
echo ""

php artisan serve --host=0.0.0.0 --port="$LARAVEL_PORT"
