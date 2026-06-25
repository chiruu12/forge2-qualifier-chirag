#!/usr/bin/env bash
# Start Laravel API + print ngrok instructions for live Vercel frontend.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND="$ROOT/backend"

echo "==> Forge 2 live demo — Laravel + ngrok"
echo ""

if lsof -i :8000 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "WARNING: port 8000 is already in use."
  echo "         Stop the other process first, or run: php artisan serve --host=0.0.0.0 --port=8001"
  echo "         (then: ngrok http 8001)"
  echo ""
fi

# Backend setup
cd "$BACKEND"
if [ ! -f .env ]; then
  cp .env.example .env
  php artisan key:generate
fi

echo "==> Running migrations + seed..."
php artisan migrate:fresh --seed --force

echo ""
echo "==> Starting Laravel on http://0.0.0.0:8000"
echo "    API: http://localhost:8000/api/boards"
echo ""
echo "==> In a SECOND terminal, run:"
echo "    ngrok http 8000"
echo ""
echo "==> Copy the https URL (e.g. https://abc123.ngrok-free.app) and set in Vercel:"
echo "    VITE_API_URL=https://<ngrok-subdomain>.ngrok-free.app/api"
echo ""
echo "==> Verify API is reachable:"
echo "    curl -s https://<ngrok-subdomain>.ngrok-free.app/api/boards | head"
echo ""
echo "Keep BOTH this server and ngrok running while judges review the live URL."
echo ""

php artisan serve --host=0.0.0.0 --port=8000
