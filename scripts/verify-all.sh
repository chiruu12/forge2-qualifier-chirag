#!/usr/bin/env bash
# Run full stack validation: LM Studio models + Laravel API (+ optional ngrok URL).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=ports.sh
source "$ROOT/scripts/ports.sh"

API="${1:-$LARAVEL_API_URL}"

echo "========== Forge 2 validation =========="
echo "LM Studio port: $LMSTUDIO_PORT | Laravel port: $LARAVEL_PORT"
echo ""

FAIL=0
"$ROOT/scripts/verify-models.sh" || FAIL=1

echo ""
echo "---------- Laravel API ----------"
"$ROOT/scripts/verify-api.sh" "$API" || FAIL=1

echo ""
if [ "$FAIL" -eq 0 ]; then
  echo "========== ALL CHECKS PASSED =========="
  exit 0
fi

echo "========== SOME CHECKS FAILED =========="
exit 1
