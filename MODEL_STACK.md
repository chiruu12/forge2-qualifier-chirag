# Open-source model stack

This project runs on **fully open-weight models** served locally via LM Studio. No paid API keys, no closed-source orchestrators.

## Why we migrated

The first submission used paid or restricted models (OpenAI, Fireworks/Kimi). We moved to a stack where every weight is downloadable from Hugging Face, runnable offline, and licensed for local use.

## What we rejected

| Option | Problem |
|--------|---------|
| **Sakana Fugu** | Closed-source cloud API — not open weights, not self-hostable |
| **OpenAI / Fireworks** | Paid APIs; Kimi on Fireworks was decommissioned |
| **Groq cloud fallback** | Optional only — open weights but not local; see `groq-fallback.patch.json5` |

## Current stack (Q4 only — VRAM constraint)

| Role | Agent | Model | Params | License | HF GGUF | LM Studio port |
|------|-------|-------|--------|---------|---------|----------------|
| **Reasoning / planning** | Hermes (brain) | [Phi-4-mini-reasoning](https://huggingface.co/microsoft/Phi-4-mini-reasoning) | 3.8B | MIT | [unsloth/Phi-4-mini-reasoning-GGUF](https://huggingface.co/unsloth/Phi-4-mini-reasoning-GGUF) @ **Q4_K_M** (~2.5 GB) | `:1234` |
| **Execution / coding** | OpenClaw (hands) | [LFM2.5-1.2B-Instruct](https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct) | 1.2B | Liquid AI license | [LiquidAI/LFM2.5-1.2B-Instruct-GGUF](https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-GGUF) @ **Q4_K_M** (~731 MB) | `:1235` |

**Why Phi-4-mini-reasoning for the brain:** Best reasoning quality in the small-model class (MIT, open weights). Strong on math/logic benchmarks without jumping to 7B+ models that need 5–8 GB VRAM at Q4.

**Why LFM2.5-Instruct for the hands:** Tiny, fast, good at instruction-following and tool use — ideal for file edits and shell commands while the brain plans on a separate port.

## Setup

```bash
# Terminal A — Hermes brain
# LM Studio: load Phi-4-mini-reasoning Q4_K_M → Local Server :1234

# Terminal B — OpenClaw hands
# LM Studio: load LFM2.5-Instruct Q4_K_M → Local Server :1235
```

Two LM Studio instances (or two server profiles) let both agents run at once without swapping models.

## Alternatives considered (also open source)

| Model | Size (Q4) | Tradeoff |
|-------|-----------|----------|
| LFM2.5-1.2B-Thinking | ~731 MB | Same family as executor; weaker reasoning than Phi-4-mini |
| DeepSeek-R1-Distill-Qwen-1.5B | ~1 GB | Ultra-compact CoT; less capable planner |
| DeepSeek-R1-Distill-Qwen-7B | ~5 GB | Stronger reasoning; too heavy for 4-bit VRAM budget |
| Qwen3-4B | ~2.75 GB | Apache 2.0; good generalist, less reasoning-focused than Phi-4-mini-reasoning |

## Config files

- `hermes-config.yaml` — brain @ `:1234`
- `openclaw.json` — hands @ `:1235`
- `.env.example` — model IDs and ports
