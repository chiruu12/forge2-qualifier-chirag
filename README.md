# Forge 2 Kanban — two-agent system (free stack)

A Trello-style Kanban board built with a **human-in-the-loop two-agent Slack loop**.

- **Brain (Hermes):** plans, remembers, runs skills, posts on a schedule — `LFM2.5-Thinking` Q4 via LM Studio.
- **Hands (OpenClaw):** writes and runs code, reports back — `LFM2.5-Instruct` Q4 via LM Studio.
- **You:** post goals, approve plans, review output — all in Slack.

## What it does

Kanban: **Boards → Lists → Cards**, with tags, members, due dates, drag-and-drop.

- **Backend:** Laravel 13 REST API, SQLite
- **Frontend:** React (Vite), deployed on Vercel
- **Live API:** Laravel tunneled via **ngrok** so the deployed frontend hits real data (see [`DEPLOYMENT.md`](DEPLOYMENT.md))

## Models & routing (free stack)

| Role | Model | Source | Endpoint |
|------|-------|--------|----------|
| **Brain** (Hermes) | `liquid/lfm2.5-1.2b-thinking` | [HF GGUF Q4_K_M](https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking-GGUF) | LM Studio `http://localhost:1234/v1` |
| **Hands** (OpenClaw) | `liquid/lfm2.5-1.2b-instruct` | [HF GGUF Q4_K_M](https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-GGUF) | LM Studio `http://localhost:1234/v1` |

**Why this split:** Thinking variant decomposes goals; Instruct variant executes tool calls and file edits. Both are **free**, local, and 4-bit quantized for VRAM limits. Optional Groq free-tier fallback: `groq-fallback.patch.json5`.

## Live URL

**Frontend:** https://frontend-lyart-ten-d0rh6z68nc.vercel.app

> **Important:** Start Laravel + ngrok before opening the live URL. Set `VITE_API_URL=https://<ngrok-subdomain>.ngrok-free.app/api` in Vercel. Without a running tunnel the UI shows demo data only. Full steps: [`DEPLOYMENT.md`](DEPLOYMENT.md).

## Run locally

### Agents (LM Studio)

1. Download both GGUF models from HuggingFace (**Q4_K_M only**).
2. Load **Instruct** for OpenClaw / **Thinking** for Hermes.
3. Enable Local Server on port `1234`.

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
agent-log.md       Unedited agent loop log
ARCHITECTURE.md    System design
DEPLOYMENT.md      ngrok + Vercel live demo
openclaw.json      OpenClaw config (LFM2.5-Instruct)
hermes-config.yaml Hermes config (LFM2.5-Thinking + memory + cron)
.env.example       Env template (no paid keys)
```

## How it was built

The **Slack agent loop** (planning, FizzBuzz/banner tasks, memory, skill, cron) was driven by Hermes + OpenClaw on the free LFM2.5 stack. The Kanban scaffold was completed under qualifier time pressure; full transparency in [`agent-log.md`](agent-log.md).
