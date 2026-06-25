#!/usr/bin/env bash
# Validate LM Studio: both MLX models listed + short completion test each.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=ports.sh
source "$ROOT/scripts/ports.sh"

BASE_URL="${LMSTUDIO_BASE_URL}"
HERMES_MODEL="${HERMES_MODEL:-lfm2.5-1.2b-thinking-mlx}"
OPENCLAW_MODEL="${OPENCLAW_MODEL:-liquid/lfm2.5-1.2b}"

echo "==> LM Studio @ $BASE_URL (port $LMSTUDIO_PORT)"
echo "    Hermes model:   $HERMES_MODEL"
echo "    OpenClaw model: $OPENCLAW_MODEL"
echo ""

if ! curl -sf "$BASE_URL/models" -o /tmp/forge2-models.json; then
  echo "FAIL — LM Studio not reachable on $BASE_URL"
  echo "      LM Studio → Settings → Local Server → port $LMSTUDIO_PORT → Start"
  exit 1
fi

python3 - <<'PY' "$HERMES_MODEL" "$OPENCLAW_MODEL"
import json, sys
data = json.load(open("/tmp/forge2-models.json"))
expect = sys.argv[1:3]
ids = [m.get("id", "") for m in data.get("data", [])]
print("Available models:", ", ".join(ids) if ids else "(none)")
missing = [m for m in expect if not any(m == i or m in i or i in m for i in ids)]
if missing:
    print("FAIL — not found in /v1/models:", ", ".join(missing))
    sys.exit(1)
print("OK — both model IDs present")
PY

test_completion() {
  local label="$1"
  local model="$2"
  echo ""
  echo "==> Completion test: $label ($model)"
  HTTP=$(curl -s -o /tmp/forge2-completion.json -w "%{http_code}" \
    "$BASE_URL/chat/completions" \
    -H "Content-Type: application/json" \
    -d "{\"model\":\"$model\",\"messages\":[{\"role\":\"user\",\"content\":\"Reply with exactly: OK\"}],\"max_tokens\":16,\"temperature\":0}" \
    || true)

  if [ "$HTTP" != "200" ]; then
    echo "FAIL (HTTP $HTTP)"
    head -c 400 /tmp/forge2-completion.json 2>/dev/null
    echo ""
    return 1
  fi

  python3 - <<'PY'
import json
r = json.load(open("/tmp/forge2-completion.json"))
text = r.get("choices", [{}])[0].get("message", {}).get("content", "")
print("Response:", text.strip()[:120] or "(empty)")
PY
  echo "OK"
}

FAIL=0
test_completion "Hermes brain" "$HERMES_MODEL" || FAIL=1
test_completion "OpenClaw hands" "$OPENCLAW_MODEL" || FAIL=1

if [ "$FAIL" -eq 0 ]; then
  echo ""
  echo "All model checks passed."
  exit 0
fi

echo ""
echo "Fix: load both MLX models in LM Studio, Local Server on port $LMSTUDIO_PORT."
exit 1
