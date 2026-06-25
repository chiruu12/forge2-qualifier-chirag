# Kanban build chronology

Maps the Slack agent loop to committed files. Full transcripts in [`agent-log.md`](agent-log.md) § Kanban build sprint.

| Commit | Date | Agent task | Key files |
|--------|------|------------|-----------|
| `0c392cb` | Jun 21 | Scaffold Laravel API + React UI | `backend/routes/api.php`, models, migration, `frontend/src/App.jsx` |
| `f06096e` | Jun 21 | Dark theme redesign | `frontend/src/index.css`, App layout |
| `7e72238` | Jun 21 | Stats bar, search, overdue badges | `frontend/src/App.jsx` |
| `6227b16` | Jun 21 | Demo fallback when API offline | `frontend/src/App.jsx` demo mode |
| `8732ff9` | Jun 21 | Live Vercel URL in README | `README.md` |
| `1787e7d` | Jun 25 | ngrok deployment guide | `DEPLOYMENT.md`, `scripts/` |
| `f332795` | Jun 25 | Live API connected banner | `frontend/src/App.jsx` |
| `7a297bb` | Jun 25 | Free LFM2.5 model stack | `openclaw.json`, `hermes-config.yaml` |

## Loop pattern (every phase)

```
#sprint_main:  Human posts goal
#sprint_main:  Hermes posts plan → waits for "yes"
#agent_coder:  OpenClaw writes code + runs commands
#agent_coder:  OpenClaw posts What I Did / What's Left / What Needs Your Call
#sprint_main:  Human approves or requests changes
git commit:    Phase lands in repo
```

## Verify

```bash
git log --oneline -- backend/ frontend/
curl -s http://localhost:7900/api/boards | python3 -m json.tool | head
```
