# Open-source model stack (Liquid AI)

This project runs on **fully open-weight Liquid AI models** served locally via LM Studio. No paid API keys, no closed-source orchestrators.

## Why we migrated

The first submission used paid or restricted models (OpenAI, Fireworks/Kimi). We moved to a stack where every weight is downloadable from Hugging Face, runnable offline, and licensed for local use.

## What we rejected

| Option | Problem |
|--------|---------|
| **Sakana Fugu** | Closed-source cloud API — not open weights, not self-hostable |
| **OpenAI / Fireworks** | Paid APIs; Kimi on Fireworks was decommissioned |
| **Groq cloud fallback** | Optional only — open weights but not local; see `groq-fallback.patch.json5` |

## Current stack (Q4 only — VRAM constraint)

| Role | Agent | Model | Params | HF GGUF | LM Studio port |
|------|-------|-------|--------|---------|----------------|
| **Reasoning / planning** | Hermes (brain) | [LFM2.5-1.2B-Thinking](https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking) | 1.2B | [LFM2.5-1.2B-Thinking-GGUF](https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking-GGUF) @ **Q4_K_M** (~731 MB) | `:1234` |
| **Tool use / coding** | OpenClaw (hands) | [LFM2-1.2B-Tool](https://huggingface.co/LiquidAI/LFM2-1.2B-Tool) | 1.2B | [LFM2-1.2B-Tool-GGUF](https://huggingface.co/LiquidAI/LFM2-1.2B-Tool-GGUF) @ **Q4_K_M** (~731 MB) | `:1235` |

**Why LFM2.5-Thinking for the brain:** Purpose-built reasoning variant in the LFM2.5 family — decomposes goals and sequences work without a larger 3B+ model.

**Why LFM2-Tool for the hands:** Task-specific tool-calling model — optimized for concise API/shell/file-tool execution while Hermes plans on a separate port. Same Liquid nano footprint (~731 MB each at Q4).

**Unified Liquid stack:** Both models from the same vendor, same VRAM budget, complementary roles (think → act).

## Setup

```bash
# Terminal A — Hermes brain
# LM Studio: load LFM2.5-1.2B-Thinking Q4_K_M → Local Server :1234

# Terminal B — OpenClaw hands
# LM Studio: load LFM2-1.2B-Tool Q4_K_M → Local Server :1235

# Verify both servers respond:
./scripts/verify-models.sh
```

Two LM Studio instances (or two server profiles) let both agents run at once without swapping models.

## Config files

- `hermes-config.yaml` — brain @ `:1234`
- `openclaw.json` — hands @ `:1235`
- `.env.example` — model IDs and ports
