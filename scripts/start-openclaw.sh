#!/usr/bin/env bash
# Start OpenClaw gateway (Slack hands agent). Requires .env with SLACK_* tokens.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
if [[ ! -f .env ]]; then
  echo "Missing .env — copy .env.example and add SLACK_BOT_TOKEN + SLACK_APP_TOKEN"
  exit 1
fi
set -a
# shellcheck disable=SC1091
source .env
set +a
echo "Starting OpenClaw gateway on ws://127.0.0.1:18789 (model: lmstudio/liquid/lfm2.5-1.2b)"
exec openclaw gateway run
