# Live deployment (ngrok + Vercel)

## Port map

| Service | Port | URL |
|---------|------|-----|
| LM Studio (agents) | **1234** | `http://127.0.0.1:1234/v1` |
| Laravel API | **7900** | `http://localhost:7900/api` |
| ngrok target | **7900** | `ngrok http 7900` |

## Architecture

```
Browser → Vercel (React) → ngrok HTTPS → localhost:7900 (Laravel + SQLite)
```

## Step-by-step

### 1. LM Studio (agents)

1. Load `lfm2.5-1.2b-thinking-mlx` and `liquid/lfm2.5-1.2b`
2. Local Server on **1234** (default — `http://127.0.0.1:1234`)
3. `./scripts/verify-models.sh`

### 2. Laravel API

```bash
./scripts/start-live-demo.sh
```

Or: `php artisan serve --host=0.0.0.0 --port=7900`

Verify: `./scripts/verify-api.sh http://localhost:7900/api`

### 3. ngrok

```bash
ngrok http 7900
```

Set Vercel: `VITE_API_URL=https://YOUR-SUBDOMAIN.ngrok-free.app/api`

### 4. Full validation

```bash
./scripts/verify-all.sh
```

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Demo banner on live URL | Laravel + ngrok not running on **7900** |
| Models fail | LM Studio must be on **1234** |
| Port 7900 busy | `LARAVEL_PORT=7902 ./scripts/start-live-demo.sh` |

**Frontend:** https://frontend-lyart-ten-d0rh6z68nc.vercel.app
