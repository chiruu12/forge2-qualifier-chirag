# Live deployment (ngrok + Vercel)

The Vercel frontend must reach a **live Laravel API**. We tunnel the local API through ngrok so judges see real data, not browser demo mode.

## Architecture

```
Browser → Vercel (React) → ngrok HTTPS URL → localhost:8000 (Laravel + SQLite)
```

## Step-by-step

### 1. Start LM Studio (agents — optional for judging Kanban only)

Two instances (or two server profiles), **Q4_K_M only**:

1. **Port 1234 — Hermes brain:** [LFM2.5-Thinking-GGUF](https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking-GGUF)
2. **Port 1235 — OpenClaw hands:** [LFM2-Tool-GGUF](https://huggingface.co/LiquidAI/LFM2-1.2B-Tool-GGUF)
3. Verify: `./scripts/verify-models.sh`

See [`MODEL_STACK.md`](MODEL_STACK.md) for download links and why closed APIs (e.g. Sakana Fugu) were not used.

### 2. Start Laravel API

```bash
chmod +x scripts/start-live-demo.sh scripts/verify-api.sh
./scripts/start-live-demo.sh
```

Or manually:

```bash
cd backend
composer install
cp .env.example .env && php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve --host=0.0.0.0 --port=8000
```

Verify locally:

```bash
./scripts/verify-api.sh http://localhost:8000/api
```

### 3. Start ngrok

In a second terminal:

```bash
ngrok http 8000
```

Copy the **https** forwarding URL, e.g. `https://abc123.ngrok-free.app`.

Verify through ngrok:

```bash
./scripts/verify-api.sh https://abc123.ngrok-free.app/api
```

### 4. Point Vercel frontend at ngrok

In the Vercel project settings → Environment Variables:

```
VITE_API_URL=https://abc123.ngrok-free.app/api
```

Redeploy the frontend. Open the live URL — the yellow **demo banner must NOT appear**; board data comes from SQLite via the API.

### 5. During judging

Keep running:

- Laravel (`php artisan serve`)
- ngrok (`ngrok http 8000`)

If ngrok restarts, the URL changes — update `VITE_API_URL` in Vercel and redeploy.

## Reserved ngrok domain (recommended)

A paid/reserved ngrok subdomain avoids redeploying Vercel on every restart:

```bash
ngrok http 8000 --domain=your-reserved.ngrok-free.app
```

Set `VITE_API_URL=https://your-reserved.ngrok-free.app/api` once in Vercel.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Yellow "Frontend demo" banner | API unreachable — check ngrok + Laravel are running |
| CORS errors | Already open (`backend/config/cors.php` allows `*`) |
| Empty boards | Run `php artisan migrate:fresh --seed` |
| ngrok browser warning | Click through once; API calls from Vercel are unaffected |

## Live URL

**Frontend:** https://frontend-lyart-ten-d0rh6z68nc.vercel.app

**Backend (when demo running):** your ngrok URL + `/api/boards`
