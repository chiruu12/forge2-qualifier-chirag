#!/usr/bin/env bash
# Health check for both LM Studio local servers (Hermes brain + OpenClaw hands).
set -euo pipefail

HERMES_URL="${HERMES_BASE_URL:-http://localhost:1234/v1}"
OPENCLAW_URL="${OPENCLAW_BASE_URL:-http://localhost:1235/v1}"
HERMES_MODEL="${HERMES_MODEL:-liquid/lfm2.5-1.2b-thinking}"
OPENCLAW_MODEL="${OPENCLAW_MODEL:-liquid/lfm2-1.2b-tool}"

check_server() {
  local name="$1"
  local base_url="$2"
  local expect_model="$3"

  echo "==> $name @ $base_url"
  if ! curl -sf "$base_url/models" -o /tmp/forge2-models.json; then
    echo "FAIL — LM Studio not reachable. Is Local Server running?"
    return 1
  fi

  if command -v python3 >/dev/null 2>&1; then
    python3 - <<'PY' "$expect_model"
import json, sys
data = json.load(open("/tmp/forge2-models.json"))
expect = sys.argv[1]
ids = [m.get("id", "") for m in data.get("data", data if isinstance(data, list) else [])]
if not ids and "models" in data:
    ids = [m.get("id", "") for m in data["models"]]
print("Models loaded:", ", ".join(ids) if ids else "(none listed)")
if ids and not any(expect in i or i in expect for i in ids):
    print(f"WARN — expected '{expect}' not in server model list")
PY
  else
    head -c 300 /tmp/forge2-models.json
    echo ""
  fi
  echo "OK"
  echo ""
}

FAIL=0
check_server "Hermes (LFM2.5-Thinking)" "$HERMES_URL" "$HERMES_MODEL" || FAIL=1
check_server "OpenClaw (LFM2-Tool)" "$OPENCLAW_URL" "$OPENCLAW_MODEL" || FAIL=1

if [ "$FAIL" -eq 0 ]; then
  echo "Both LM Studio servers reachable."
  exit 0
fi

echo "Fix: load the correct GGUF in each LM Studio instance (see MODEL_STACK.md)."
exit 1
