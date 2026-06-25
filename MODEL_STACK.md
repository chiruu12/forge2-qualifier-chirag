# Open-source model stack (Liquid AI MLX)

## Port map

| Service | Port | URL |
|---------|------|-----|
| **LM Studio** (agents) | **7900** | `http://localhost:7900/v1` |
| **Laravel API** (Kanban) | **7901** | `http://localhost:7901/api` |

Set LM Studio → **Settings → Local Server → Port 7900**.

## Active models

| Role | Agent | LM Studio model ID | Quantization |
|------|-------|-------------------|--------------|
| **Brain** | Hermes | `lfm2.5-1.2b-thinking-mlx` | 4-bit MLX |
| **Hands** | OpenClaw | `liquid/lfm2.5-1.2b` | 8-bit MLX |

Both models on one LM Studio server (port **7900**), routed by model ID.

## Validate

```bash
./scripts/verify-models.sh    # LM Studio :7900
./scripts/start-live-demo.sh  # Laravel :7901
./scripts/verify-all.sh       # both
ngrok http 7901               # live demo tunnel
```

Override ports: `LMSTUDIO_PORT=7900 LARAVEL_PORT=7901 ./scripts/verify-all.sh`
