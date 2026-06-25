# Architecture

## Two-agent system

```mermaid
flowchart LR
    H["You<br/>#sprint_main"] -->|goal + approval| B["Hermes - Brain<br/>LFM2.5-Thinking Q4"]
    B -->|plan + task| C["OpenClaw - Hands<br/>LFM2.5-Instruct Q4"]
    C -->|writes & runs code| Repo[("Repo: backend + frontend")]
    C -->|What I Did / What's Left / What Needs Your Call| H
    B -. "memory + skill + cron" .-> Log["#agent_log"]
    H -. "Gate 3: approve blocked decisions" .-> B
```

- **Hermes (brain):** decomposes goals, posts plans *before* acting, hands coding tasks to OpenClaw, stores cross-session memory, runs `status-report` skill, fires cron with no human prompt.
- **OpenClaw (hands):** takes approved tasks, writes/runs code, reports in three-section format.
- **You:** post goals, say yes/no to plans, review code output, answer **What Needs Your Call** — all in Slack.

## Slack channel scheme

| Channel | Purpose |
|---------|---------|
| `#sprint_main` | Human ↔ Hermes. Goals, plan approval, status updates. |
| `#agent_coder` | Coding tasks for OpenClaw; code + stdout posted here. |
| `#agent_log` | Cron heartbeat + audit trail. |

## Model routing (free stack)

| Agent | Model | HF source | Endpoint |
|-------|-------|-----------|----------|
| Hermes (planning) | `liquid/lfm2.5-1.2b-thinking` | [Thinking-GGUF](https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking-GGUF) @ Q4_K_M | LM Studio `:1234/v1` |
| OpenClaw (coding) | `liquid/lfm2.5-1.2b-instruct` | [Instruct-GGUF](https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-GGUF) @ Q4_K_M | LM Studio `:1234/v1` |

**Why this split:**

- **Planning is reasoning-heavy** — LFM2.5-Thinking decomposes goals and sequences work.
- **Execution is tool-heavy** — LFM2.5-Instruct handles file edits and command runs.
- **Both are free** — HuggingFace GGUF, local inference, 4-bit only (VRAM constraint).
- **No paid APIs** — replaces prior OpenAI + Fireworks stack that scored 0 on free-stack.

**Optional fallback:** Groq `openai/gpt-oss-120b` free tier via `groq-fallback.patch.json5` if local VRAM is insufficient.

## Live deployment

```
Vercel (React)  →  ngrok HTTPS  →  localhost:8000 (Laravel + SQLite)
```

See [`DEPLOYMENT.md`](DEPLOYMENT.md). Frontend must not fall back to browser demo mode during judging.

## Memory, skill, autonomous run

| Feature | Config | Evidence |
|---------|--------|----------|
| **Memory** | `hermes-config.yaml` → `memory.enabled: true` | `agent-log.md` § Memory recall (Session A → B) |
| **Skill** | `skills/status-report/SKILL.md` | `agent-log.md` § Skill firing |
| **Cron** | `hermes-config.yaml` → `cron.forge2-heartbeat` | `agent-log.md` § Autonomous run |
| **Human-in-the-loop** | Plan approval + **What Needs Your Call** gate | `agent-log.md` § Human approval gates |

## Config files (secrets removed)

- `openclaw.json` — OpenClaw; primary `lmstudio/liquid/lfm2.5-1.2b-instruct`
- `hermes-config.yaml` — Hermes; `liquid/lfm2.5-1.2b-thinking` + memory + cron
- `model.patch.json5`, `slack.socket.patch.json5`, `groq-fallback.patch.json5`
- `.env.example` — Slack + LM Studio vars (no paid keys)
