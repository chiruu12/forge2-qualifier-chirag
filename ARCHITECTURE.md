# Architecture

## Two-agent system

```mermaid
flowchart LR
    H["You<br/>#sprint_main"] -->|goal + approval| B["Hermes - Brain<br/>thinking-mlx 4-bit"]
    B -->|plan + task| C["OpenClaw - Hands<br/>lfm2.5-1.2b 8-bit"]
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

## Model routing (open-source stack)

| Agent | Model | HF source | Endpoint |
|-------|-------|-----------|----------|
| Hermes (planning) | `lfm2.5-1.2b-thinking-mlx` | MLX 4-bit | LM Studio `:7900/v1` |
| OpenClaw (coding) | `liquid/lfm2.5-1.2b` | MLX 8-bit | LM Studio `:7900/v1` |

**Why this split:** Thinking MLX decomposes goals; Instruct MLX executes tool calls. Single LM Studio server — both model IDs registered, routed per request.

Full rationale and rejected alternatives: [`MODEL_STACK.md`](MODEL_STACK.md).

**Optional cloud fallback:** Groq free tier via `groq-fallback.patch.json5` — not part of the open-source stack.

## Live deployment

```
Vercel (React)  →  ngrok HTTPS  →  localhost:7901 (Laravel + SQLite)
```

See [`DEPLOYMENT.md`](DEPLOYMENT.md). Frontend must not fall back to browser demo mode during judging.

## Memory, skill, autonomous run

| Feature | Config | Evidence |
|---------|--------|----------|
| **Kanban build loop** | Slack `#sprint_main` → `#agent_coder` | `agent-log.md` § Kanban build sprint, `BUILD_CHRONOLOGY.md` |
| **Memory** | `hermes-config.yaml` → `memory.enabled: true` | `agent-log.md` § Memory recall (Session A → B) |
| **Skill** | `skills/status-report/SKILL.md` | `agent-log.md` § Skill firing |
| **Cron** | `hermes-config.yaml` → `cron.forge2-heartbeat` | `agent-log.md` § Autonomous run |
| **Human-in-the-loop** | Plan approval + **What Needs Your Call** gate | `agent-log.md` § Human approval gates |

## Config files (secrets removed)

- `openclaw.json` — OpenClaw; primary `lmstudio/liquid/lfm2.5-1.2b` @ `:7900`
- `hermes-config.yaml` — Hermes; `lfm2.5-1.2b-thinking-mlx` @ `:7900`
- `MODEL_STACK.md` — open-source model selection and migration notes
- `model.patch.json5`, `slack.socket.patch.json5`, `groq-fallback.patch.json5`
- `.env.example` — Slack + LM Studio vars (no paid keys)
