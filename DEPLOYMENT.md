# Live deployment (ngrok + Vercel)

The Vercel frontend must reach a **live Laravel API**. We tunnel the local API through ngrok so judges see real data, not browser demo mode.

## Port map

| Service | Port |
|---------|------|
| LM Studio (agents) | **7900** |
| Laravel API | **7901** |
| ngrok target | **7901** |

## Architecture

```
Browser → Vercel (React) → ngrok HTTPS URL → localhost:7901 (Laravel + SQLite)
```

## Step-by-step

### 1. Start LM Studio (agents — optional for judging Kanban only)

1. Load `lfm2.5-1.2b-thinking-mlx` (4-bit) and `liquid/lfm2.5-1.2b` (8-bit)
2. LM Studio → Settings → Local Server → port **7900** → Start
3. Verify: `./scripts/verify-models.sh`

See [`MODEL_STACK.md`](MODEL_STACK.md).

### 2. Start Laravel API

```bash
chmod +x scripts/*.sh
./scripts/start-live-demo.sh
```

Or manually:

```bash
cd backend
composer install
cp .env.example .env && php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve --host=0.0.0.0 --port=7901
```

Verify:

```bash
./scripts/verify-api.sh http://localhost:7901/api
```

### 3. Start ngrok

```bash
ngrok http 7901
```

Verify through ngrok:

```bash
./scripts/verify-api.sh https://YOUR-SUBDOMAIN.ngrok-free.app/api
```

### 4. Point Vercel frontend at ngrok

```
VITE_API_URL=https://YOUR-SUBDOMAIN.ngrok-free.app/api
```

Redeploy. The yellow **demo banner must NOT appear**.

### 5. During judging

Keep running:

- Laravel on port **7901**
- ngrok: `ngrok http 7901`

Full check: `./scripts/verify-all.sh`

## Reserved ngrok domain (recommended)

```bash
ngrok http 7901 --domain=your-reserved.ngrok-free.app
```

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Yellow "Frontend demo" banner | API unreachable — check ngrok + Laravel on **7901** |
| Models fail verify | LM Studio Local Server must be on **7900** |
| Port in use | `LARAVEL_PORT=7902 ./scripts/start-live-demo.sh` |

## Live URL

**Frontend:** https://frontend-lyart-ten-d0rh6z68nc.vercel.app

**Backend (when demo running):** ngrok URL + `/api/boards`
