# Forge 2 Kanban — two-agent system (open-source models)

A Trello-style Kanban board built with a **human-in-the-loop two-agent Slack loop**, running entirely on **open-weight models** from Hugging Face (4-bit local inference).

- **Brain (Hermes):** plans, remembers, runs skills, posts on a schedule — **Phi-4-mini-reasoning** Q4 via LM Studio (`:1234`).
- **Hands (OpenClaw):** writes and runs code, reports back — **LFM2.5-Instruct** Q4 via LM Studio (`:1235`).
- **You:** post goals, approve plans, review output — all in Slack.

See [`MODEL_STACK.md`](MODEL_STACK.md) for why we migrated off paid/closed APIs (including Sakana Fugu) and how models were chosen.

## What it does

Kanban: **Boards → Lists → Cards**, with tags, members, due dates, drag-and-drop.

- **Backend:** Laravel 13 REST API, SQLite
- **Frontend:** React (Vite), deployed on Vercel
- **Live API:** Laravel tunneled via **ngrok** so the deployed frontend hits real data (see [`DEPLOYMENT.md`](DEPLOYMENT.md))

## Models & routing (open-source stack)

| Role | Model | Source | Endpoint |
|------|-------|--------|----------|
| **Brain** (Hermes) | `phi-4-mini-reasoning` | [Phi-4-mini-reasoning-GGUF](https://huggingface.co/unsloth/Phi-4-mini-reasoning-GGUF) @ Q4_K_M (MIT) | LM Studio `http://localhost:1234/v1` |
| **Hands** (OpenClaw) | `liquid/lfm2.5-1.2b-instruct` | [LFM2.5-Instruct-GGUF](https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-GGUF) @ Q4_K_M | LM Studio `http://localhost:1235/v1` |

**Why this split:** Phi-4-mini-reasoning handles goal decomposition and planning; LFM2.5-Instruct executes tool calls and file edits. Both are **open weights**, local, and 4-bit quantized for VRAM limits. Two LM Studio ports let brain and hands run simultaneously.

## Live URL

**Frontend:** https://frontend-lyart-ten-d0rh6z68nc.vercel.app

> **Important:** Start Laravel + ngrok before opening the live URL. Set `VITE_API_URL=https://<ngrok-subdomain>.ngrok-free.app/api` in Vercel. Without a running tunnel the UI shows demo data only. Full steps: [`DEPLOYMENT.md`](DEPLOYMENT.md).

## Run locally

### Agents (LM Studio — two ports)

1. Download both GGUF models from HuggingFace (**Q4_K_M only**). Details: [`MODEL_STACK.md`](MODEL_STACK.md).
2. **Port 1234:** load **Phi-4-mini-reasoning** → Hermes brain.
3. **Port 1235:** load **LFM2.5-Instruct** → OpenClaw hands.
4. Enable Local Server on each instance.

### Backend

```bash
cd backend
composer install
cp .env.example .env && php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve --host=0.0.0.0 --port=8000
```

### Frontend

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000/api" > .env
npm run dev
```

### Live demo (ngrok)

```bash
./scripts/start-live-demo.sh    # terminal 1
ngrok http 8000                 # terminal 2 → update Vercel VITE_API_URL
```

## Human-in-the-loop, memory, skill

| Capability | Where documented |
|------------|------------------|
| Human approval gates (goal → plan → review) | [`agent-log.md`](agent-log.md) § Human-in-the-loop |
| Cross-session memory (Session A save → B recall) | [`agent-log.md`](agent-log.md) § Memory recall |
| `status-report` skill (3-section format) | [`skills/status-report/SKILL.md`](skills/status-report/SKILL.md) |
| Autonomous cron to `#agent_log` | [`hermes-config.yaml`](hermes-config.yaml), [`agent-log.md`](agent-log.md) § Autonomous run |

Raw Slack transcripts and screenshots: [`agent-log.md`](agent-log.md), [`docs/`](docs/).

## Repo layout

```
backend/           Laravel API + SQLite
frontend/          React UI (Vercel)
skills/            Hermes skills (status-report)
scripts/           start-live-demo.sh, verify-api.sh
docs/              Evidence screenshots
agent-log.md       Unedited agent loop log (Kanban build + HITL + memory + skill)
BUILD_CHRONOLOGY.md Slack goals mapped to git commits and files
ARCHITECTURE.md    System design
MODEL_STACK.md     Open-source model choices (Phi-4 brain + LFM2.5 hands)
DEPLOYMENT.md      ngrok + Vercel live demo
openclaw.json      OpenClaw config (LFM2.5-Instruct @ :1235)
hermes-config.yaml Hermes config (Phi-4-mini-reasoning @ :1234 + memory + cron)
.env.example       Env template (no paid keys)
```

## How it was built

Every phase of the Kanban app went through the **Slack two-agent loop**:

1. You posted a goal in `#sprint_main`
2. **Hermes** (Phi-4-mini-reasoning) decomposed it and waited for your approval
3. **OpenClaw** (LFM2.5-Instruct) wrote and ran the code in `#agent_coder`
4. You reviewed output before the next phase

The full build chronology — Laravel API, React UI, theme polish, demo mode, ngrok — with Slack transcripts mapped to git commits is in [`agent-log.md`](agent-log.md) § Kanban build sprint.
