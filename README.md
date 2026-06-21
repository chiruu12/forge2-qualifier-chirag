# forge2-qualifier-chirag

A tiny Trello-style Kanban board built by a **two-agent system**, driven entirely through Slack.

- **Brain (orchestrator):** Hermes Agent - plans, remembers, runs a skill, runs on a schedule.
- **Hands (coder):** OpenClaw - writes and runs the code, reports back in chat.
- **Human-in-the-loop:** every instruction and every agent reply happens in Slack.

## What it does

A small Kanban board: **Boards → Lists → Cards**, with card details, coloured tags, member assignment, and due dates (overdue cards visually flagged).

- **Backend:** Laravel (PHP 8.2+) REST API, SQLite.
- **Frontend:** React (Vite).

## Models & routing

| Role | Model | Endpoint | Why |
|------|-------|----------|-----|
| **Brain / planning** (Hermes) | Kimi 2.6 - `accounts/fireworks/models/kimi-k2p6` (Fireworks) | `https://api.fireworks.ai/inference/v1` | Strong reasoning for decomposing goals into steps. |
| **Hands / coding** (OpenClaw) | OpenAI `gpt-5.4-nano` | `https://api.openai.com/v1` | Cheap, fast, tool-calling executor for the actual file edits. |

**Routing rationale:** the strong model plans, the cheap model executes - the pattern the brief recommends. We began on a fully free stack (Groq + a local model) and moved the loop onto a small set of paid models to get **reliable end-to-end execution**. That trades the free-stack bonus for stability - in the spirit of the brief's own rule that *a clean, working setup beats an ambitious broken one*. See [`ARCHITECTURE.md`](ARCHITECTURE.md).

## Live URL

**https://frontend-lyart-ten-d0rh6z68nc.vercel.app**

> The frontend is deployed on Vercel. The Laravel API runs locally (see **Run locally**); with the backend on `localhost:8000` the board is fully interactive - shown in the demo video. (Per the qualifier rules, a live frontend + runnable backend + video qualifies.)

## Run locally

### 1. Backend (Laravel API)
```bash
cd backend
composer install
cp .env.example .env && php artisan key:generate
php artisan migrate:fresh --seed     # SQLite, with demo data
php artisan serve                    # http://localhost:8000
```
The API is served under `http://localhost:8000/api` (e.g. `GET /api/boards`).

### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000/api" > .env
npm run dev                          # http://localhost:5173
```
Open `http://localhost:5173` - create a board, add lists/cards, move cards, tag them, assign a member, set a due date.

## Repo layout

```
backend/         Laravel API + SQLite (built by the agents)
frontend/        React UI (built by the agents)
skills/          Hermes skill (status-report)
agent-log.md     Unedited chat-loop log (human → plan → code → report)
ARCHITECTURE.md  System design, Slack channels, model routing
.env.example     Env vars for the agent setup (never commit real keys)
```

## How it was built

Every line of the app was written by the agents through the Slack loop - a human posts a goal, Hermes (brain) plans it, OpenClaw (hands) writes and runs the code in `#agent_coder` and reports back. The raw exchanges are in [`agent-log.md`](agent-log.md).
