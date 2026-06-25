# Shared port defaults for Forge 2 local stack (source from other scripts).
# Override via environment: LMSTUDIO_PORT=7900 LARAVEL_PORT=7901

export LMSTUDIO_PORT="${LMSTUDIO_PORT:-7900}"
export LARAVEL_PORT="${LARAVEL_PORT:-7901}"
export LMSTUDIO_BASE_URL="${LMSTUDIO_BASE_URL:-http://localhost:${LMSTUDIO_PORT}/v1}"
export LARAVEL_API_URL="${LARAVEL_API_URL:-http://localhost:${LARAVEL_PORT}/api}"
