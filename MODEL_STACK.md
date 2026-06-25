# Open-source model stack (Liquid AI MLX)

## Port map

| Service | Port | URL |
|---------|------|-----|
| **LM Studio** (agents) | **1234** | `http://127.0.0.1:1234/v1` |
| **Laravel API** (Kanban) | **7900** | `http://localhost:7900/api` |

LM Studio keeps its default port **1234**. Our Laravel server runs on **7900**.

## Active models

| Role | Agent | LM Studio model ID |
|------|-------|-------------------|
| **Brain** | Hermes | `lfm2.5-1.2b-thinking-mlx` |
| **Hands** | OpenClaw | `liquid/lfm2.5-1.2b` |

## Validate

```bash
./scripts/verify-models.sh    # LM Studio :1234
./scripts/start-live-demo.sh  # Laravel :7900
./scripts/verify-all.sh       # both
ngrok http 7900               # live demo tunnel
```
