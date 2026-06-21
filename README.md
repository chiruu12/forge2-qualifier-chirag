# forge2-qualifier-chirag

A tiny Trello-style Kanban board built by a two-agent system, driven entirely through Slack.

- **Brain (orchestrator):** Hermes Agent — plans, remembers, runs a skill, runs on a schedule.
- **Hands (coder):** OpenClaw — writes and runs the code, reports back in chat.
- **Human-in-the-loop:** every instruction and every agent reply happens in Slack.

## What it does

A small Kanban board: **Boards → Lists → Cards**, with card details, coloured tags, member assignment, and due dates (overdue cards visually flagged).

- **Backend:** Laravel (PHP 8.2+) REST API, SQLite.
- **Frontend:** React (Vite).

## Models (free stack only)

| Role | Model | Endpoint | Why |
|------|-------|----------|-----|
| Brain / planning (Hermes) | Groq `openai/gpt-oss-120b` | `https://api.groq.com/openai/v1` | Strong, fast planner for decomposition; short bursty calls fit Groq's free tier. |
| Hands / coding (OpenClaw) | Ollama `qwen2.5-coder:7b` | `http://localhost:11434/v1` | Coding-specialised; runs locally so heavy token use never hits Groq's free rate limits. Reproducible GGUF. |

No paid models or subscriptions. See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the routing rationale.

## Live URL

> _<add your deployed frontend URL here before submitting>_

## Run locally

### Backend (Laravel API)
```bash
cd backend
composer install
cp .env.example .env && php artisan key:generate
php artisan migrate --seed
php artisan serve            # http://localhost:8000
```

### Frontend (React)
```bash
cd frontend
npm install
npm run dev                  # http://localhost:5173
```

Copy `.env.example` → `.env` at the repo root and fill in your own tokens/keys. **Never commit real ones.**

## Repo layout

```
backend/        Laravel API (built by the agents)
frontend/       React UI (built by the agents)
skills/         Hermes skills (status-report)
agent-log.md    Unedited chat-loop log (human -> plan -> code -> report)
ARCHITECTURE.md System design, channels, model routing
```
