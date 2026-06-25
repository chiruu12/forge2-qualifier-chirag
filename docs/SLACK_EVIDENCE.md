# Slack evidence — what to post, screenshot, and push

Prerequisites: LM Studio **1234**, Laravel **7900**, `./scripts/verify-all.sh` passes.

## Channels

| Channel | Agent | Purpose |
|---------|-------|---------|
| `#sprint_main` | Hermes | Goals, plans, status |
| `#agent_coder` | OpenClaw | Code + handoff |
| `#agent_log` | Hermes cron | Autonomous posts |

Models: **lfm2.5-1.2b-thinking-mlx** (brain) · **liquid/lfm2.5-1.2b** (hands)

---

## 1. FizzBuzz loop → `docs/slack-loop.png` ✅ in repo

**#agent_coder** — post:
```
Write a Python FizzBuzz script for 1–20, run it, and paste stdout. Use code-handoff format.
```
Screenshot: three-section reply + model name visible.

---

## 2. Kanban backend → `docs/kanban-backend.png` ❌ needed

**#sprint_main** — post:
```
Plan Phase 1: Laravel models (Board, TaskList, Card, Tag, Member), migration, routes/api.php CRUD. Use kanban-plan. Wait for my yes.
```
Reply `yes`. Screenshot **#agent_coder** backend handoff.

---

## 3. Kanban frontend → `docs/kanban-frontend.png` ❌ needed

**#sprint_main** — post:
```
Phase 2: Wire React Kanban to http://localhost:7900/api. Proceed after my yes.
```
Reply `yes`. Screenshot **#agent_coder** frontend work.

---

## 4. Memory save → `docs/hermes-memory-save.png` ✅ in repo

**#sprint_main** — post:
```
Remember: repo forge2-qualifier-chirag, branch kanban-score-improvement-plan, brain lfm2.5-1.2b-thinking-mlx @ 127.0.0.1:1234, hands liquid/lfm2.5-1.2b @ 127.0.0.1:1234, API localhost:7900 via ngrok.
```

---

## 5. Memory recall → `docs/hermes-memory-recall.png` ✅ in repo

Restart Hermes, then **#sprint_main**:
```
What repo, models, and API URL? Use memory only.
```

---

## 6. Status skill → `docs/hermes-skill.png` ✅ in repo

**#sprint_main**:
```
give me a status update
```
Screenshot: What I Did / What's Left / What Needs Your Call.

---

## 7. Cron → `docs/hermes-cron.png` ✅ in repo

**#agent_log** — wait for cron post (no human prompt above it).

---

## Vercel live demo

1. `./scripts/start-live-demo.sh` + `ngrok http 7900`
2. Vercel env: `VITE_API_URL=https://YOUR.ngrok-free.app/api`
3. Redeploy → open live URL → **green "Live API connected"** badge

---

## Push

```bash
git add docs/*.png docs/SLACK_EVIDENCE.md skills/
git commit -m "Add Slack evidence guide and agent skills."
git push -u origin kanban-score-improvement-plan
```
