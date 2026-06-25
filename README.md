# Forge 2 Kanban — two-agent system (open-source models)

A Trello-style Kanban board built with a **human-in-the-loop two-agent Slack loop**, running entirely on **open-weight models** from Hugging Face (4-bit local inference).

- **Brain (Hermes):** `lfm2.5-1.2b-thinking-mlx` (4-bit MLX) — plans, memory, skills, cron
- **Hands (OpenClaw):** `liquid/lfm2.5-1.2b` (8-bit MLX) — writes and runs code
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
| **Brain** (Hermes) | `lfm2.5-1.2b-thinking-mlx` | MLX 4-bit | `http://127.0.0.1:1234/v1` |
| **Hands** (OpenClaw) | `liquid/lfm2.5-1.2b` | MLX 8-bit | `http://127.0.0.1:1234/v1` |

LM Studio on **1234**. Laravel API on **7900**.

## Live URL

**Frontend:** https://frontend-lyart-ten-d0rh6z68nc.vercel.app

> **Important:** Start Laravel + ngrok before opening the live URL. Set `VITE_API_URL=https://<ngrok-subdomain>.ngrok-free.app/api` in Vercel. Without a running tunnel the UI shows demo data only. Full steps: [`DEPLOYMENT.md`](DEPLOYMENT.md).

## Run locally

### Agents (LM Studio MLX)

1. Load both models in LM Studio (see [`MODEL_STACK.md`](MODEL_STACK.md)).
2. LM Studio Local Server stays on **1234** (`http://127.0.0.1:1234`).
3. Verify: `./scripts/verify-models.sh`

### Backend

```bash
cd backend
composer install
cp .env.example .env && php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve --host=0.0.0.0 --port=7900
```

### Frontend

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:7900/api" > .env
npm run dev
```

### Live demo (ngrok)

```bash
./scripts/start-live-demo.sh    # terminal 1
ngrok http 7900                 # terminal 2 → update Vercel VITE_API_URL
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
scripts/           verify-models.sh, verify-all.sh, verify-api.sh, start-live-demo.sh
docs/              Evidence screenshots
agent-log.md       Unedited agent loop log (Kanban build + HITL + memory + skill)
BUILD_CHRONOLOGY.md Slack goals mapped to git commits and files
ARCHITECTURE.md    System design
MODEL_STACK.md     Open-source Liquid AI model choices (Thinking + Tool)
DEPLOYMENT.md      ngrok + Vercel live demo
openclaw.json      OpenClaw config (liquid/lfm2.5-1.2b @ 127.0.0.1:1234)
hermes-config.yaml Hermes config (lfm2.5-1.2b-thinking-mlx @ 127.0.0.1:1234)
.env.example       Env template (no paid keys)
```

## How it was built

Every phase of the Kanban app went through the **Slack two-agent loop**:

1. You posted a goal in `#sprint_main`
2. **Hermes** (`lfm2.5-1.2b-thinking-mlx`) decomposed it and waited for your approval
3. **OpenClaw** (`liquid/lfm2.5-1.2b`) wrote and ran the code in `#agent_coder`
4. You reviewed output before the next phase

The full build chronology — Laravel API, React UI, theme polish, demo mode, ngrok — with Slack transcripts mapped to git commits is in [`agent-log.md`](agent-log.md) § Kanban build sprint.
