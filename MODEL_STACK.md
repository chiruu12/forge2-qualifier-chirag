# Open-source model stack (Liquid AI MLX)

## Why this stack

| Rejected | Reason |
|----------|--------|
| OpenAI GPT / paid APIs | Not free; violates open-stack requirement |
| Fireworks Kimi K2 | Paid cloud API |
| Sakana Fugu | **Closed source** — not acceptable for open-weight claim |
| Large 7B+ models | VRAM / latency on local Mac |

**Chosen:** Liquid AI **LFM2.5 1.2B** family — open weights, MLX builds for Apple Silicon, ~731 MB each at Q4, runs fully offline via LM Studio.

| Role | Agent | Model | Why |
|------|-------|-------|-----|
| **Brain** | Hermes | `lfm2.5-1.2b-thinking-mlx` (4-bit) | Reasoning / planning / HITL gates |
| **Hands** | OpenClaw | `liquid/lfm2.5-1.2b` (8-bit) | Tool use, file edits, `exec` for Python |

Both models share one LM Studio server on port **1234** — routed by model ID.

## Port map

| Service | Port | URL |
|---------|------|-----|
| **LM Studio** (agents) | **1234** | `http://127.0.0.1:1234/v1` |
| **Laravel API** (Kanban) | **7900** | `http://localhost:7900/api` |
| **OpenClaw gateway** | **18789** | `ws://127.0.0.1:18789` (Slack bridge) |

## OpenClaw context + tools (1.2B models)

Small models need tuned OpenClaw settings (see `openclaw.json`):

- **Context:** load `liquid/lfm2.5-1.2b` at **32768** in LM Studio; OpenClaw `contextTokens: 16384`
- **Tools:** `minimal` profile + `group:fs` + `group:runtime` (read/write/edit + exec — not full `coding` profile)
- **Lean mode:** `localModelLean: true` drops browser/cron/message to save prompt tokens

Apply patch to live config:
```bash
openclaw config patch --file model.patch.json5
```

## Validate

```bash
./scripts/verify-models.sh       # LM Studio :1234
./scripts/start-live-demo.sh     # Laravel :7900
./scripts/verify-all.sh          # both
./scripts/start-openclaw.sh      # Slack hands agent
ngrok http 7900                  # live demo tunnel
```

Config files: `openclaw.json`, `hermes-config.yaml`, `model.patch.json5`, `.env.example`.
