# Shared port defaults for Forge 2 local stack (source from other scripts).
# LM Studio stays on its default; our Laravel API uses 7900.
# Override via environment: LMSTUDIO_PORT=1234 LARAVEL_PORT=7900

export LMSTUDIO_PORT="${LMSTUDIO_PORT:-1234}"
export LARAVEL_PORT="${LARAVEL_PORT:-7900}"
export LMSTUDIO_BASE_URL="${LMSTUDIO_BASE_URL:-http://127.0.0.1:${LMSTUDIO_PORT}/v1}"
export LARAVEL_API_URL="${LARAVEL_API_URL:-http://localhost:${LARAVEL_PORT}/api}"
