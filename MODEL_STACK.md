# Open-source model stack (Liquid AI MLX)

This project runs on **fully open-weight Liquid AI models** served locally via LM Studio on Apple Silicon (MLX). No paid API keys, no closed-source orchestrators.

## Active models (your LM Studio setup)

| Role | Agent | LM Studio model ID | Quantization | Purpose |
|------|-------|-------------------|--------------|---------|
| **Reasoning / planning** | Hermes (brain) | `lfm2.5-1.2b-thinking-mlx` | 4-bit MLX | Goal decomposition, plan approval |
| **Execution / coding** | OpenClaw (hands) | `liquid/lfm2.5-1.2b` | 8-bit MLX | Tool calls, file edits, shell runs |

Both models run on **one LM Studio Local Server** at `http://localhost:1234/v1`. The API routes by model ID — no port swapping.

## Setup

1. Open **LM Studio** → download/load both MLX models:
   - `lfm2.5-1.2b-thinking-mlx` (4-bit)
   - `liquid/lfm2.5-1.2b` (8-bit)
2. Enable **Local Server** on port **1234**.
3. Validate:

```bash
./scripts/verify-models.sh   # lists models + runs test completions
./scripts/verify-all.sh      # models + Laravel API
```

## Config files

- `hermes-config.yaml` — brain → `lfm2.5-1.2b-thinking-mlx`
- `openclaw.json` — hands → `liquid/lfm2.5-1.2b`
- `.env.example` — model IDs and base URL

## What we rejected

| Option | Problem |
|--------|---------|
| **Sakana Fugu** | Closed-source cloud API |
| **OpenAI / Fireworks** | Paid APIs |
| **LFM2-Tool** | Superseded by LFM2.5-Instruct family for this stack |
